import React, { Component } from 'react';
import { View, Stylesheet, TextInput, Text, TouchableHighlight, AsyncStorage } from 'react-native';
import axios from 'axios';

class Login extends Component {
    constructor() {
        super();
        this.state = {
            email: '',
            password: ''
        }
    }

    _loginUser = async () => {
        const { navigate } = this.props.navigation;
        const { email, password } = this.state;

        axios.post('http://192.168.0.22:3000/users/login', {
            email: email,
            password: password
        })
        .then(async function (response) {
            var token = response.data.access_token;
            await AsyncStorage.setItem("token", token);
            console.log(response.data)
            console.log(token);
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

    render() {
        return (
            <View style={{flex: 1, justifyContent: 'center', paddingLeft: 10, paddingRight: 10}}>
                <View sytle={{backgroundColor: 'orange', borderWidth: 1}}>
                    <Text style={{fontWeight: 'bold', justifyContent: 'center', alignSelf: 'center', marginBottom: 10, fontSize: 20}}>ENTER CHAT ROOM</Text>
                    <TextInput style={{height: 40, borderColor: 'orangered', borderWidth: 2, paddingLeft: 10, marginBottom: 10, borderRadius: 20}} onChangeText={this._pushEmail} value={this.state.email} placeholder="Email" />

                    <TextInput style={{height: 40, borderColor: 'orangered', borderWidth: 2, paddingLeft: 10, marginBottom: 10, borderRadius: 20}} onChangeText={this._pushPass} value={this.state.password} placeholder="Password" secureTextEntry={true}/>
                    
                    <TouchableHighlight onPress={this._loginUser} style={{ justifyContent: 'center', backgroundColor: 'orangered', padding: 15, borderRadius: 20}}>
                        <Text style={{color: 'white', fontWeight: 'bold', alignSelf: 'center'}}>LOGIN</Text>
                    </TouchableHighlight>
                </View>
            </View>
        )
    }
}

export default Login;