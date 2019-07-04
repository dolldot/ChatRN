import React, {Component} from 'react';
import { AsyncStorage, Modal, View, StyleSheet, Text, Keyboard, TextInput, FlatList, TouchableHighlight, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import axios from 'axios';
import moment from 'moment';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {color} from '../config/color';

class Room extends Component {
    constructor() {
        super();
        this.state = {
            url: "http://192.168.0.22:3333/api/v1/",
            user: '',
            room: '',
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

        axios.get(that.state.url + "users/logged", { headers: {"Authorization": `Bearer ${token}`}})
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
        var roomId = this.props.navigation.getParam('roomId', 0)

        axios.get(that.state.url + "rooms/" + roomId, {headers: {"Authorization": `Bearer ${token}`}})
        .then(function (response) {
            var data = response.data[0].chats;
            var roomName = response.data[0].name;
            that.setState({chats: data});
            that.setState({room: roomName})
        })
        .catch(function (error) {
            console.log(error);
        })
    }

    _submitChat = async () => {
        const that = this;
        var token = await AsyncStorage.getItem('token');
        var roomId = this.props.navigation.getParam('roomId', 0)
        if(this.state.text.length != 0){

            axios.post(that.state.url + "chats",{
                room_id: roomId,
                message: this.state.text
            }, {headers: {"Authorization": `Bearer ${token}`}})
            .then(function (response) {
    
                that.setState({text: ''})
                Keyboard.dismiss();
                that._onRefresh();
            })
            .catch(function (error) {
                console.log(error);
            })
        } else {
            alert("Ga boleh kosong woy")
        }

        
    }

    _updateChat = async () => {
        const that = this;
        var token = await AsyncStorage.getItem('token');
        var id = this.state.selectedItem.id;

        axios.put(that.state.url + "chats/" + id, {

            message: this.state.text
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

    _signOutAsync = async () => {
        await AsyncStorage.clear();
        this.props.navigation.navigate('Auth');
    }

    _pushText = (text) => {
        this.setState({
            text: text
        })
    }

    _onRefresh = () => {
        
        this.setState({refreshing: true});
        this._getChatsData()
        this.scrollView.scrollToEnd({animated: true})
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
        this.setState({text: this.state.selectedItem.message})
        this.setState({updateItem: true});
        this._setModalVisible(!this.state.modalVisible);
    }

    _selectedChat = (no) => {
        var chat = this.state.chats;
        chat.map((item, index) => {
            if(index == no) {
                this.setState({selectedItem: item})
                // console.log(item);
                if(item.user_id != this.state.user.id){
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
                      <View style={styles.modalContainer}>
                        <TouchableOpacity style={{height: 400}} onPress={() => {this._setModalVisible(!this.state.modalVisible)}}/>

                        <View style={styles.modalLayout}>
                            {this.state.updateItem ?
                            <TouchableOpacity onPress={() => {this._closeUpdateChatToggle()}} style={styles.modalButton}>
                                <Text style={styles.modalButtonText}>POST</Text>
                            </TouchableOpacity>
                            :
                            <TouchableOpacity onPress={() => {this._updateChatToggle()}} style={styles.modalButton}>
                                <Text style={styles.modalButtonText}>EDIT</Text>
                            </TouchableOpacity>
                            }
                            <TouchableOpacity onPress={() => {this._deleteChat()}} style={styles.modalButton}>
                                <Text style={styles.modalButtonText}>DELETE</Text>
                            </TouchableOpacity>
                        </View>

                      </View>
                </Modal>

                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{this.state.room}</Text>
                        <TouchableOpacity onPress={() => {this.props.navigation.navigate('Home')}} style={styles.backButton}>
                            <Ionicons name="ios-arrow-back" size={30} color="white" />
                        </TouchableOpacity>
                    </View>
                    <ScrollView refreshControl={
                        <RefreshControl 
                            refreshing={this.state.refreshing}
                            onRefresh={this._onRefresh}/>
                    } ref={(view) => {this.scrollView = view}}>
                        <View style={styles.content}>
                        <FlatList
                        data={chats}
                        renderItem={ ({item, index}) => (
                            item.users.id != this.state.user.id ?
                            <TouchableHighlight style={styles.receiverStyle} onLongPress={() => {this._selectedChat(index)}} underlayColor="rgba(255, 248, 225, 0.3)">
                                <View style={styles.bubbleReceiver}>
                                    <View style={styles.messageTitle}>
                                        <Text style={{flex: 1}}>{item.users.username}</Text>
                                        <View style={{flex: 1, alignItems: 'flex-end'}}>
                                            <Text style={{fontSize: 10}}>{moment(item.created_at).fromNow()}</Text>
                                        </View>
                                    </View>
                                    
                                    <Text style={styles.messageBody}>{item.message}</Text>
                                </View>
                            </TouchableHighlight>
                            :
                            <TouchableHighlight style={styles.senderStyle} onLongPress={() => {this._selectedChat(index)}} underlayColor="rgba(255, 248, 225, 0.3)">
                                <View style={styles.bubbleSender}>
                                    <Text style={styles.messageTime}>{moment(item.created_at).fromNow()}</Text>
                                    <Text style={styles.messageBody}>{item.message}</Text>
                                </View>
                            </TouchableHighlight>
                            
                        )}
                        keyExtractor={item => item.id.toString()} />
                        </View>

                    </ScrollView>
                </View>

                {this.state.updateItem ?
                <View style={styles.boxMessage}>
                    <View style={styles.boxMessageInput}>
                        <TextInput onChangeText={this._pushText}>{this.state.text}</TextInput>
                    </View>
                    <TouchableHighlight onPress={this._updateChat} style={styles.boxMessageButton} underlayColor="rgba(225, 225, 225, 0.8)">
                        <FontAwesome name="send" size={30} color="white" />
                    </TouchableHighlight>
                </View>
                : // JANGAN DIHAPUS COY INI TERNARY OPERATOR
                <View style={styles.boxMessage}>
                    <View style={styles.boxMessageInput}>
                        <TextInput placeholder="enter chat" onChangeText={this._pushText} value={this.state.text}/>
                    </View>
                    <TouchableHighlight onPress={this._submitChat} style={styles.boxMessageButton} underlayColor="rgba(225, 225, 225, 0.8)">
                        <FontAwesome name="send" size={30} color="white" />
                    </TouchableHighlight>
                </View>
                }
            </View>
        )
    }
}

export default Room;

const styles = StyleSheet.create({
    container: {
        flex: 10, 
        backgroundColor: color.primary
    },
    modalContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
        flex: 1, 
        justifyContent: 'center'
    },
    modalLayout: {
        backgroundColor: '#f9f8eb', 
        padding: 10, 
        marginLeft: 20, 
        marginRight: 20, 
        borderRadius: 10
    },
    modalButton: {
        backgroundColor: 'white', 
        padding: 20, 
        justifyContent: 'center'
    },
    modalButtonText: {
        justifyContent: 'center', 
        alignSelf: 'center', 
        fontWeight: 'bold', 
        color: 'black'
    },
    header: {
        backgroundColor: color.primaryDark, 
        flexDirection: 'row', 
        borderBottomWidth: 1, 
        borderBottomColor: color.chatSender, 
        paddingTop: 10, 
        paddingBottom: 10
    },
    title: {
        padding: 10, 
        flex: 8, 
        color: 'white', 
        fontWeight: 'bold', 
        alignItems: 'center', 
        fontSize: 20
    },
    backButton: {
        padding: 10, 
        flex:1, 
        alignItems: 'center'
    },
    content: {
        padding: 10
    },
    receiverStyle: {
        width: '100%', 
        flexDirection: 'row', 
        marginBottom: 5
    },
    bubbleReceiver: {
        maxWidth: '100%', 
        backgroundColor: color.chatReceiver, 
        borderBottomLeftRadius: 20, 
        borderTopRightRadius: 20, 
        borderBottomRightRadius: 20, 
        paddingLeft: 15, 
        paddingRight: 15, 
        paddingTop: 10, 
        paddingBottom: 10, 
        marginRight: 40
    },
    messageTitle: {
        flexDirection: 'row', 
        alignItems: 'center'
    },
    messageBody: {
        flex: 4,
        color: 'black'
    },
    messageTime: {
        fontSize: 10, 
        alignSelf: 'flex-end'
    },
    senderStyle: {
        width: '100%', 
        justifyContent: 'flex-end', 
        flexDirection: 'row', 
        marginBottom: 5
    },
    bubbleSender: {
        maxWidth: '100%', 
        backgroundColor: color.chatSender, 
        borderTopLeftRadius: 20, 
        borderBottomRightRadius: 20, 
        borderBottomLeftRadius: 20, 
        paddingLeft: 15, 
        paddingRight: 15, 
        paddingTop: 10, 
        paddingBottom: 10, 
        marginLeft: 40
    },
    boxMessage: {
        flex: 1, 
        backgroundColor: color.primaryDark, 
        padding: 5, 
        flexDirection: 'row', 
        borderTopWidth: 1, 
        borderTopColor: color.chatSender
    },
    boxMessageInput: {
        flex: 4, 
        paddingLeft: 15, 
        paddingRight: 15, 
        borderBottomLeftRadius: 20, 
        borderTopLeftRadius: 20, 
        borderBottomRightRadius: 20, 
        backgroundColor: color.white
    },
    boxMessageButton: {
        backgroundColor: color.primaryDark, 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center'
    }
})