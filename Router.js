import { createStackNavigator, createAppContainer, createSwitchNavigator } from 'react-navigation';

import HomeScreen from './App/screens/Home';
import LoadingScreen from './App/screens/Loading';
import LoginScreen from './App/screens/Login';

const AppStack = createStackNavigator({
    Home: {
        screen: HomeScreen,
        navigationOptions: {
            header: null
        }
    }
    
})

const AuthStack = createStackNavigator({
    Login: {
        screen: LoginScreen,
        navigationOptions: {
            header: null
        }
    }
})

export default createAppContainer(createSwitchNavigator(
    {
        AuthLoading: LoadingScreen,
        App: AppStack,
        Auth: AuthStack
    },
    {
        initialRouteName: 'AuthLoading',
    }
))