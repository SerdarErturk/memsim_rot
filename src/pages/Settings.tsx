


import { useFocusEffect } from '@react-navigation/native';
import { Header, LoadingLayer, SafeAreaView, Text, View } from 'components';
import { useNavigation } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { hp, wp } from 'utils/dimension';
import FastImage from 'react-native-fast-image';
import { getLocalize } from 'utils/auth';
import { L } from 'utils/utility';

function Settings() {

  const loadingLayer = useRef(null) as any;
  const navigation = useNavigation();
  const [locale, setLocale] = useState(null as any);
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
      <Header header={'MEMSIMROT ' + L("header.setting",locale)}></Header>
      <LoadingLayer ref={loadingLayer} />

      <View style={{ padding: wp(10) }}>

        <View style={{ flex: 3, paddingTop: hp(5), paddingBottom: hp(5),flexDirection:"row" }}>
          <View style={{ flexDirection: "row" }}>
            <View style={{ padding: wp(5) }} >
              <TouchableOpacity style={[styles.btn, styles.shadow]} onPress={() => { navigation.navigate("targets" as never) }} >
                <FastImage
                  style={{ width: hp(80), height: hp(80) }}
                  source={require('../images/target.png')}
                  resizeMode={FastImage.resizeMode.contain}
                />
                <Text style={styles.btnsubtext}>
                  {L("setting.targetsetting",locale)}
                </Text>

              </TouchableOpacity>
            </View>

          </View>
          <View style={{ flexDirection: "row" }}>
            <View style={{ padding: wp(5) }} >
              <TouchableOpacity style={[styles.btn, styles.shadow]} onPress={() => { navigation.navigate("connection" as never) }} >
                <FastImage
                  style={{ width: hp(80), height: hp(80) }}
                  source={require('../images/bl_on.png')}
                  resizeMode={FastImage.resizeMode.contain}
                />
                <Text style={styles.btnsubtext}>
                 
                  {L("setting.connection",locale)}
                 
                </Text>

              </TouchableOpacity>
            </View>

          </View>
          <View style={{ flexDirection: "row" }}>
            <View style={{ padding: wp(5) }} >
              <TouchableOpacity style={[styles.btn, styles.shadow]} onPress={() => { navigation.navigate("systemsettting" as never) }} >
                <FastImage
                  style={{ width: hp(80), height: hp(80) }}
                  source={require('../images/operational-system.png')}
                  resizeMode={FastImage.resizeMode.contain}
                />
                <Text style={styles.btnsubtext}>
                  {L("setting.system",locale)}
                </Text>

              </TouchableOpacity>
            </View>

          </View>
        </View>
        <View style={{ flex: 3, paddingTop: hp(5), paddingBottom: hp(5),flexDirection:"row" }}>
          <View style={{ flexDirection: "row" }}>
            <View style={{ padding: wp(5) }} >
              <TouchableOpacity style={[styles.btn, styles.shadow]} onPress={() => { navigation.navigate("sensors" as never) }} >
                <FastImage
                  style={{ width: hp(80), height: hp(80) }}
                  source={require('../images/sensor.png')}
                  resizeMode={FastImage.resizeMode.contain}
                />
                <Text style={styles.btnsubtext}>
               
                  {L("setting.sensor",locale)}
                </Text>

              </TouchableOpacity>
            </View>

          </View>
          <View style={{ flexDirection: "row" }}>
          <View style={{ padding: wp(5) }} >
              <TouchableOpacity style={[styles.btn, styles.shadow]} onPress={() => { navigation.navigate("scoreSetting" as never) }} >
                <FastImage
                  style={{ width: hp(80), height: hp(80) }}
                  source={require('../images/score.png')}
                  resizeMode={FastImage.resizeMode.contain}
                />
                <Text style={styles.btnsubtext}>
                  
                {L("setting.score",locale)}
                </Text>

              </TouchableOpacity>
            </View>

          </View>
          <View style={{ flexDirection: "row" }}>
            <View style={{ padding: wp(5) }} >
              <TouchableOpacity style={[styles.btn, styles.shadow]} onPress={() => { navigation.navigate("shottimesetting" as never) }} >
                <FastImage
                  style={{ width: hp(80), height: hp(80) }}
                  source={require('../images/goal.png')}
                  resizeMode={FastImage.resizeMode.contain}
                />
                <Text style={styles.btnsubtext}>
                {L("setting.timing",locale)}
                </Text>

              </TouchableOpacity>
            </View>

          </View>
        </View>

      </View>
    </SafeAreaView>

  )
}

export default React.memo(Settings)
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
    fontSize: hp(22),
    fontFamily: "Narin-Medium"
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

