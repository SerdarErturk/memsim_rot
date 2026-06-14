// In App.js in a new project

import React, { useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { router } from './router.config'

import { getUserId, getToken, setUserId, getLoginModel, setToken } from '../utils/auth'
import { hp, wp } from 'utils/dimension';
import { Image, View } from 'react-native';
import { BackgroundImage } from 'components';

import NetworkUtils from 'utils/networkUtills';
import AuthenticationStore from 'stores/authenticationStore';



const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator()

function App(props) {
  const [firstRoute, setFirstRoute] = useState("home");
  let navigation;
  React.useEffect(() => {
    checkState();
  }, []);
  const checkState = async () => {
    // await setUserId(null)
    // var user = await getUserId();
    // var tokenval = await getLoginModel();
    // if (tokenval) {
    //   setFirstRoute("home");
    // } else {
    //   setFirstRoute("login");
    // }



  }

  const changeRoute = async (e) => {
    var lastRoute = navigation.getState().routes.slice(-1).pop();
   
  }
  return (

    <NavigationContainer ref={(e) => { navigation = e; }} onStateChange={() => {
      changeRoute()
    }} >

      <Stack.Navigator initialRouteName={"home"} >
        {router.map(x =>

          <Stack.Screen name={x.path} key={x.path}

            component={x.component}
            options={{
              headerShown: false,
            }} />

        )}

      </Stack.Navigator> 

    </NavigationContainer>

  );
}

export default App;