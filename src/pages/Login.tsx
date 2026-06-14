

import React, { useState, useRef } from 'react';
import { Platform, StyleSheet,SafeAreaView,View,TouchableOpacity,Text } from 'react-native';
import FastImage from 'react-native-fast-image';
import { hp, wp } from 'utils/dimension';
import AuthenticationStore from '../stores/authenticationStore';
import { CommonActions,  useNavigation } from '@react-navigation/native';
import { setLoginModel } from 'utils/auth';

import appConfig from 'config/appConfig';
function Login() {
  const conf = appConfig as any;
  const [username, setUsername] = useState(process.env.NODE_ENV !== "production" ? "3" : "");


  const navigation = useNavigation();
  const authStore = new AuthenticationStore();
  const loadingLayer = useRef(null) as any;

  const login = async () => {
    // if(password!="sporgucu2023"){
    //   showMessage({
    //     message: "Hatalı Şifre",
    //     backgroundColor: "red",
    //     type: "warning",
    //     position: "top",
    //     duration: 6000,
    //   });
    //   return;
    // }
    if (loadingLayer.current) {
      loadingLayer.current.fadeIn();
    }
    var model = {
      username: username
    } as any
    // var result = await authStore.login(model) as any;
    // if (loadingLayer.current) {
    //   loadingLayer.current.fadeOut();
    // }
    // if (result.errorMessage) {
    //   showMessage({
    //     message: result.errorMessage,
    //     backgroundColor: "#FF7A7A",
    //     type: "danger",
    //     position: "top",
    //     duration: 6000
    //   });
    //   return;
    // } else {
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [
          { name: 'home' }
        ],
      })
    );
    // await setToken(result.token);
    await setLoginModel(model);
    // await setConnectionManuel("1")
    // connectSignalR();

    // await syncEvidence();
    // }





  }



  return (
    <SafeAreaView style={{ flexDirection: "column", flex: 1, backgroundColor: "#E9EDEE" }} >

      

      <View style={{ flex: 1, flexDirection: "column" }}>
      
        <View style={{ flex: 1, paddingRight: wp(30), paddingLeft: wp(30) }}>
         
       
          <View style={{ flex: 1, paddingTop: wp(30) }}>
            <TouchableOpacity
              style={[styles.continue_btn]} onPress={() => { login() }} >
                <Text> GİRİŞ</Text>
              </TouchableOpacity>
          </View>


        </View>


      </View>
   
    </SafeAreaView>
  )
}

export default Login
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  top: {
    backgroundColor: "white",
  },
  bottom: {
    flex: 1,
    backgroundColor: "white",
    paddingRight: wp(10),
    paddingLeft: wp(10),
    paddingTop: wp(10)
  },

  carcontent: {

  },

  forgotpassword: {
    color: "#39464E",
    fontSize: hp(14),
    fontFamily: "Narin-Bold",
    textAlign: "right",
    paddingTop: hp(4)
  },
  continue_btn: {
    backgroundColor: "#004F58",
    marginBottom: hp(10),
    height: hp(60)
  },

  header: {
    color: "#004F58",
    fontSize: hp(20),
    fontFamily: "Narin-Medium",
  }
});