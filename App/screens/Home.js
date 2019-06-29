import React, {Component} from 'react';
import { AsyncStorage, Modal, View, Text, TextInput, FlatList, TouchableHighlight, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import axios from 'axios';
import moment from 'moment';
import Feather from 'react-native-vector-icons/Feather';

class Home extends Component {
    constructor() {
        super();
        this.state = {
            url: "http://192.168.0.22:3000/",
            user: '',
            chats: [],
            text: '',
            refreshing: false,
            modalVisible: false,
            selectedItem: '',
            updateItem: false,
        }
    }

    componentDidMount = async () => {

        this._getChatsData();
        this._getUserData();
        // setInterval(() => {this._onRefresh(), console.log("didmount")}, 1000);
    }

    _getUserData = async () => {
        const that = this;
        var token = await AsyncStorage.getItem('token');

        axios.get(that.state.url + "users", { headers: {"Authorization": `Bearer ${token}`}})
        .then(function (response) {
            var data = response.data;
            that.setState({user: data});
        })
        .catch(function (error) {
            console.log(error);
        })
    }

    _getChatsData = async () => {
        const that = this;
        var token = await AsyncStorage.getItem('token');

        axios.get(that.state.url + "chats", {headers: {"Authorization": `Bearer ${token}`}})
        .then(function (response) {
            var data = response.data;
            that.setState({chats: data});
            console.log("Chat: " + data);
            console.log("Chats: " + that.state.chats);
        })
        .catch(function (error) {
            console.log(error);
        })
    }

    _submitChat = async () => {
        const that = this;
        var token = await AsyncStorage.getItem('token');

        axios.post(that.state.url + "chats",{
            userId: this.state.user.id,
            text: this.state.text
        }, {headers: {"Authorization": `Bearer ${token}`}})
        .then(function (response) {

            that._onRefresh();
        })
        .catch(function (error) {
            console.log(error);
        })
    }

    _updateChat = async () => {
        const that = this;
        var token = await AsyncStorage.getItem('token');
        var id = this.state.selectedItem.id;

        axios.put(that.state.url + "chats/" + id, {
            userId: this.state.user.id,
            text: this.state.text
        }, {headers: {"Authorization": `Bearer ${token}`}})
        .then(function (response) {
            that.setState({updateItem: false})
            that.setState({text: ''})
            that._onRefresh();
        })
        .catch(function (error){
            console.log(error)
        })
    }

    _deleteChat = async () => {
        const that = this;
        var token = await AsyncStorage.getItem('token');
        var id = this.state.selectedItem.id;

        axios.delete(that.state.url + "chats/" + id, {headers: {"Authorization": `Bearer ${token}`}})
        .then(function (response) {
            that._setModalVisible(!that.state.modalVisible);
            that._onRefresh();
        })
        .catch(function (error) {
            console.log(error)
        })
    }

    _pushText = (text) => {
        this.setState({
            text: text
        })
    }

    _onRefresh = () => {
        this.setState({refreshing: true});
        this._getChatsData()
        this.setState({refreshing: false});
    }

    _setModalVisible(visible) {
        this.setState({modalVisible: visible});
    }

    _closeUpdateChatToggle = () => {
        this.setState({updateItem: false});
        this.setState({text: ''});
        this._setModalVisible(!this.state.modalVisible);
    }

    _updateChatToggle = () => {
        this.setState({text: this.state.selectedItem.text})
        this.setState({updateItem: true});
        this._setModalVisible(!this.state.modalVisible);
    }

    _selectedChat = (no) => {
        var chat = this.state.chats;
        chat.map((item, index) => {
            if(index == no) {
                this.setState({selectedItem: item})
                console.log(item);
                if(item.userId != this.state.user.id){
                    this._setModalVisible(false);
                } else {
                    this._setModalVisible(!this.state.modalVisible)
                }
            }
        })
    }

    render() {
        const { chats } = this.state;

        return (
            <View style={{flex: 1}}>

                <Modal
                  animationType="slide"
                  transparent={true}
                  visible={this.state.modalVisible}
                  onRequestClose={() => {
                      Alert.alert('Modal has been closed.');
                  }}>
                      <View style={{backgroundColor: 'rgba(0, 0, 0, 0.5)', flex: 1, justifyContent: 'center'}}>
                        <TouchableOpacity style={{height: 400}} onPress={() => {this._setModalVisible(!this.state.modalVisible)}}/>

                        <View style={{backgroundColor: 'orangered', padding: 10, marginLeft: 20, marginRight: 20, borderRadius: 10}}>
                            {this.state.updateItem ?
                            <TouchableOpacity onPress={() => {this._closeUpdateChatToggle()}} style={{backgroundColor: 'orange', padding: 20, justifyContent: 'center', borderTopStartRadius: 10, borderTopEndRadius: 10}}>
                                <Text style={{justifyContent: 'center', alignSelf: 'center', fontWeight: 'bold'}}>POST</Text>
                            </TouchableOpacity>
                            :
                            <TouchableOpacity onPress={() => {this._updateChatToggle()}} style={{backgroundColor: 'orange', padding: 20, justifyContent: 'center', borderTopStartRadius: 10, borderTopEndRadius: 10}}>
                                <Text style={{justifyContent: 'center', alignSelf: 'center', fontWeight: 'bold'}}>EDIT</Text>
                            </TouchableOpacity>
                            }
                            <TouchableOpacity onPress={() => {this._deleteChat()}} style={{backgroundColor: 'brown', padding: 20, justifyContent: 'center', borderBottomStartRadius: 10, borderBottomEndRadius: 10}}>
                                <Text style={{justifyContent: 'center', alignSelf: 'center', fontWeight: 'bold'}}>DELETE</Text>
                            </TouchableOpacity>
                        </View>

                      </View>
                  </Modal>

                <View style={{flex: 10, backgroundColor: 'grey'}}>
                <ScrollView refreshControl={
                    <RefreshControl 
                        refreshing={this.state.refreshing}
                        onRefresh={this._onRefresh} />
                }>

                    <FlatList
                      data={chats}
                      renderItem={ ({item, index}) => (
                          <View style={{backgroundColor: 'white', flexDirection: 'row', padding: 10, marginTop: 5, borderRadius: 10, flexDirection: 'row'}}>
                            <Text style={{fontWeight: 'bold', flex: 1, justifyContent: 'center'}}>{item.User.username}: </Text>
                            <Text style={{flex: 4, alignItems: 'center'}}>{item.text}</Text>
                            {/* <Text style={{flex: 2, alignSelf: 'center', justifyContent: 'flex-end'}}>{moment(item.createdAt).fromNow()}</Text> */}
                            <TouchableOpacity onPress={() => {this._selectedChat(index)}}>
                                <Feather name="more-horizontal" size={30} color="#900" light />
                            </TouchableOpacity>
                          </View>
                          
                      )}
                      keyExtractor={item => item.id.toString()} />

                </ScrollView>
                </View>
                {this.state.updateItem ?
                    <View style={{flex: 1, backgroundColor: 'orange', flexDirection: 'row', padding: 10}}>
                    <TextInput style={{backgroundColor: 'white', flex: 4, borderRadius: 5, marginRight: 10}} onChangeText={this._pushText}>{this.state.text}</TextInput>
                    <TouchableHighlight onPress={this._updateChat} style={{backgroundColor: 'blue', flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 5}}>
                        <Text style={{fontWeight: 'bold'}}>Update</Text>
                    </TouchableHighlight>
                </View>
                
                :
                
                <View style={{flex: 1, backgroundColor: 'orange', flexDirection: 'row', padding: 10}}>
                    <TextInput placeholder="enter chat"  style={{backgroundColor: 'white', flex: 4, borderRadius: 5, marginRight: 10}} onChangeText={this._pushText} value={this.state.text}/>
                    <TouchableHighlight onPress={this._submitChat} style={{backgroundColor: 'blue', flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 5}}>
                        <Text style={{fontWeight: 'bold'}}>Send</Text>
                    </TouchableHighlight>
                </View>
                }
            </View>
        )
    }
}

export default Home;