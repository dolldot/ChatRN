import React, { Component } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableHighlight, TouchableOpacity, AsyncStorage } from 'react-native';
import axios from 'axios';
import {color} from '../config/color';
import Ionicons from 'react-native-vector-icons/Ionicons';

class Login extends Component {
    constructor() {
        super();
        this.state = {
            email: '',
            password: '',
            hidePassword: true,    
        }
    }

    _loginUser = async () => {
        const { navigate } = this.props.navigation;
        const { email, password } = this.state;

        axios.post('http://192.168.0.22:3333/api/v1/auth/login', {
            email: email,
            password: password
        })
        .then(async function (response) {
            var token = response.data.token;
            await AsyncStorage.setItem("token", token);
            navigate('AuthLoading');
        })
        .catch(function(error) {
            console.log(error);
            alert("Login Gagal")
        })
    }

    _pushEmail = (text) => {
        this.setState({
            email: text
        })
    }

    _pushPass = (text) => {
        this.setState({
            password: text
        })
    }

    _showPass = () => {
        this.setState({
            hidePassword: !this.state.hidePassword
        })
    }

    render() {
        return (
            <View style={styles.container}>
                <Text style={{fontWeight: 'bold', justifyContent: 'center', alignSelf: 'center', marginBottom: 10, fontSize: 20, color: color.white}}>ENTER CHAT ROOM</Text>

                <TextInput style={styles.inputEmail} onChangeText={this._pushEmail} value={this.state.email} placeholder="Email" />
                
                <View style={styles.inputPass}>
                    <TextInput style={{paddingLeft: 10, flex: 6}} onChangeText={this._pushPass} value={this.state.password} placeholder="Password" secureTextEntry={this.state.hidePassword}/>
                    <TouchableOpacity style={{flex: 1, justifyContent: 'center', alignItems: 'center'}} onPress={() => {this._showPass()}}>
                        <Ionicons name="md-eye" size={30} color="black" />
                    </TouchableOpacity>
                </View>
                
                
                <TouchableHighlight onPress={this._loginUser} style={styles.loginButton} underlayColor="rgba(3, 3, 3, 0.5)">
                    <Text style={styles.textLoginButton}>LOGIN</Text>
                </TouchableHighlight>
            </View>
        )
    }
}

export default Login;

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        justifyContent: 'center', 
        paddingLeft: 10, 
        paddingRight: 10, 
        backgroundColor: color.primary
    },
    inputEmail: {
        height: 50, 
        borderColor: color.primaryDark, 
        borderWidth: 2, 
        paddingLeft: 10, 
        marginBottom: 10, 
        borderRadius: 10, 
        backgroundColor: color.white
    },
    inputPass: {
        flexDirection: 'row', 
        height: 50, 
        borderColor: color.primaryDark, 
        borderWidth: 2, 
        marginBottom: 10, 
        borderRadius: 10, 
        backgroundColor: color.white
    },
    loginButton: {
        justifyContent: 'center', 
        backgroundColor: color.primaryDark, 
        height: 50, 
        borderRadius: 10
    },
    textLoginButton: {
        color: color.white, 
        fontWeight: 'bold', 
        alignSelf: 'center'
    }
})