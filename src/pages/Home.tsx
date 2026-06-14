


import { CommonActions, useFocusEffect } from '@react-navigation/native';
import { Header, LoadingLayer, SafeAreaView, Text, View } from 'components';
import { useNavigation } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { hp, wp } from 'utils/dimension';
import FastImage from 'react-native-fast-image';
import { getLocalize, getLoginModel, setLoginModel, setToken, setUserId } from 'utils/auth';
import NotificationStore from 'stores/notificationStore';
import AuthenticationStore from 'stores/authenticationStore';
import NetworkUtils from 'utils/networkUtills';
import { L, localize } from 'utils/utility';


function Home(props: any) {

  const loadingLayer = useRef(null) as any;
  const [values, setValues] = useState({} as any);
  const [internetConnection, setInternetConnection] = useState(true);
  const [locale, setLocale] = useState(null as any);
  const [syncCount, setSyncCount] = useState(0);
  const notificationStore = new NotificationStore();
  const authenticationStore = new AuthenticationStore();
  const navigation = useNavigation();
  useFocusEffect(
    React.useCallback(() => {
      getLocaleValue();
    }, []),
  )
  const getLocaleValue = async () => {
    var locale=await getLocalize();
     setLocale(locale);
  }
  return (
    <SafeAreaView hideBack style={{ backgroundColor: "#E9EDEE" }} >
      <Header></Header>
      <LoadingLayer ref={loadingLayer} />

      <View style={{ padding: wp(10) }}>

        <View style={{ flexDirection: "row" }}>
          <Text style={styles.welcome}> {L("main.welcome",locale)} </Text>
          <Text style={styles.name} numberOfLines={1}> {values.firstName} </Text>
          <View style={{ justifyContent: "flex-end", alignItems: "center", marginTop: hp(6), flexDirection: "row" }}>


          </View>

        </View>
        <View style={{ flex: 3, paddingTop: hp(15), paddingBottom: hp(50), flexDirection: "row" }}>
          <View style={{ flexDirection: "row" }}>
            <View style={{ padding: wp(5) }} >
              <TouchableOpacity style={[styles.btn, styles.shadow]} onPress={() => {


                navigation.navigate("games" as never)
              }} >
                <FastImage
                  style={{ width: hp(100), height: hp(100) }}
                  source={require('../images/playgame.png')}
                  resizeMode={FastImage.resizeMode.contain}
                />
                <Text style={styles.btnsubtext}>
                  {L("main.games",locale)}
                </Text>

              </TouchableOpacity>
            </View>

          </View>
          <View style={{ flexDirection: "row" }}>
            <View style={{ padding: wp(5) }} >
              <TouchableOpacity style={[styles.btn, styles.shadow]} onPress={() => { navigation.navigate("settings" as never) }} >
                <FastImage
                  style={{ width: hp(100), height: hp(100) }}
                  source={require('../images/gear.png')}
                  resizeMode={FastImage.resizeMode.contain}
                />
                <Text style={styles.btnsubtext}>
                  {L("main.setting",locale)}
                </Text>

              </TouchableOpacity>
            </View>

          </View>

        </View>


      </View>
    </SafeAreaView>

  )
}

export default React.memo(Home)
const styles = StyleSheet.create({


  welcome: {
    color: "#39464E",
    fontSize: wp(10),
    fontFamily: "Narin-Medium",
    marginTop: hp(10),
  },
  name: {
    color: "#39464E",
    fontSize: wp(12),
    fontFamily: "Narin-Bold",
    marginTop: hp(10),
    maxWidth: '50%',

  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  }
  , btn: {
    backgroundColor: "#FFF",
    borderRadius: wp(10),
    flex: 1,
    justifyContent: "center",
    alignItems: "center",

  },
  btnsubtext: {
    color: "#39464E",
    fontSize: hp(44),
    fontFamily: "Narin-Medium",
    marginTop: hp(15),
    fontWeight: "bold"
  },
  btntext: {
    color: "#39464E",
    fontSize: hp(20),
    fontFamily: "Narin-Bold"
  },
  registertext: {
    color: "#39464E",
    fontSize: hp(20),
    fontFamily: "Narin-Bold",
  }
});

