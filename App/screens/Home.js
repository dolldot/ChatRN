import React, {Component} from 'react';
import { AsyncStorage, StyleSheet, View, Text, FlatList, TouchableHighlight, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import axios from 'axios';
import moment from 'moment';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {color} from '../config/color';

class Home extends Component {
    constructor() {
        super();
        this.state = {
            url: "http://192.168.0.22:3333/api/v1/",
            user: '',
            chats: [],
            rooms: [],
            refreshing: false,
        }
    }

    componentDidMount = async () => {

        this._getRoomsData();
        this._getUserData();
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

    _getRoomsData = async () => {
        const that = this;
        var token = await AsyncStorage.getItem('token')
    
        axios.get(that.state.url + "rooms", {headers: {"Authorization": `Bearer ${token}`}})
        .then(function (response) {
            var data = response.data.data;
            that.setState({rooms: data})
        })
        .catch(function (error) {
            console.log(error);
        })
    }

    _signOutAsync = async () => {
        await AsyncStorage.clear();
        this.props.navigation.navigate('Auth');
    }

    _onRefresh = () => {
        this.setState({refreshing: true});
        this._getRoomsData()
        this.setState({refreshing: false});
    }


    render() {
        const { rooms } = this.state;

        return (
            <View style={{flex: 1}}>

                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>CHAT ROOM</Text>
                        <TouchableOpacity onPress={() => {this._signOutAsync()}} style={styles.logoutButton} underlayColor="rgba(225, 225, 225, 0.8)">
                            <Ionicons name="md-exit" size={30} color="white" />
                        </TouchableOpacity>
                    </View>
                    <ScrollView refreshControl={
                        <RefreshControl 
                            refreshing={this.state.refreshing}
                            onRefresh={this._onRefresh} />
                    }>
                        <View style={styles.content}>
                        <FlatList
                            data={rooms}
                            renderItem={ ({item, index}) => (
                                <TouchableHighlight style={{backgroundColor: color.white, marginTop: 5, marginLeft: 5, marginRight: 5, justifyContent: 'center'}} onPress={() => {this.props.navigation.navigate('Room', {roomId: item.id})}} underlayColor="rgba(255, 255, 255, 0.8)">
                                    <View style={{flexDirection: 'row'}}>
                                        <View style={{flex: 5, paddingTop: 20, paddingBottom: 20, paddingLeft: 10, paddingRight: 10}}>
                                            <Text style={{fontWeight: 'bold', color: 'black', fontSize: 17}}>{item.name}</Text>
                                        </View>
                                        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 20, paddingBottom: 20, paddingLeft: 10, paddingRight: 10}}>
                                            <Ionicons name="ios-arrow-forward" size={30} color="black" />
                                        </View>
                                    </View>
                                </TouchableHighlight>
                            
                            )}
                            keyExtractor={item => item.id.toString()} />
                        </View>
                    </ScrollView>
                </View>
            </View>
        )
    }
}

export default Home;

const styles = StyleSheet.create({
    container: {
        backgroundColor: color.primary, 
        height: '100%'
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
    logoutButton: {
        padding: 10, 
        flex:1, 
        alignItems: 'center'
    },
    content: {
        paddingBottom: 10
    },
})