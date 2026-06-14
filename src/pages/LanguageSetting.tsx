


import { useFocusEffect } from '@react-navigation/native';
import { Button, FastImage, Header, InputBox, LoadingLayer, SafeAreaView, Text, View } from 'components';
import { useNavigation } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { hp, wp } from 'utils/dimension';
import { getLocalize, setLocalize } from 'utils/auth';
import RNRestart from 'react-native-restart';
import { L } from 'utils/utility';

function LanguageSetting() {
  const navigation = useNavigation();
  const loadingLayer = useRef(null) as any;
  const [locale, setLocale] = useState(null as any);
  const [sensorList, setSensorList] = useState([{

    name: "Türkçe",
    icon: require('../images/turkey.png'),
    key: "tr"
  },
  {

    name: "English",
    icon: require('../images/united-kingdom.png'),
    key: "en"
  },
  {

    name: "Français",
    icon: require('../images/france.png'),
    key: "fr"
  }

  ]) as any;

  useFocusEffect(
    React.useCallback(() => {
      getLocaleValue();
    }, []),
  )
  const setLanguage = async (item: any) => {

    await setLocalize(item.key);
    // RNRestart.Restart();
    navigation.goBack();
  }
  const getLocaleValue = async () => {
      var locale=await getLocalize();
       setLocale(locale);
   }
  return (
    <SafeAreaView hideBack style={{ backgroundColor: "#E9EDEE" }} >
      <Header header={'MEMSIMROT ' + L('header.selectlanguage',locale)}></Header>
      <LoadingLayer ref={loadingLayer} />

      <View style={{ padding: wp(10), flexDirection: "row" }}>


        <View style={{ borderRightWidth: 1, borderRightColor: "#9E9E9E", paddingRight: wp(10) }} >

          {sensorList.map((t: any) => <View key={t.key} flexNone style={{ padding: wp(2) }} >
            <TouchableOpacity style={styles.sensorBtn} onPress={() => { setLanguage(t) }}>
              <FastImage
                style={{ width: hp(60), height: hp(60) }}
                source={t.icon}
                resizeMode={FastImage.resizeMode.contain}
              />
              <Text style={styles.sensorname}>{t.name}</Text>
            </TouchableOpacity>
          </View>)}

        </View>


      </View>
    </SafeAreaView>

  )
}

export default React.memo(LanguageSetting)
const styles = StyleSheet.create({


  welcome: {
    color: "#39464E",
    fontSize: wp(8),
    fontWeight: "bold"
  },
  sensorCard: {
    borderRadius: wp(3),
    marginTop: hp(10),
    height: hp(10),
    borderWidth: 1

  },
  sensorBtn: {
    width: "100%",
    height: wp(20),
    justifyContent: "flex-start",
    alignItems: "center",
    paddingLeft: wp(10),
    borderWidth: 1,
    borderRadius: wp(3),
    display: "flex",
    flexDirection: "row"

  },
  sensorname: {
    textAlign: "left",
    fontSize: hp(22),
    fontWeight: "bold",
    paddingLeft: wp(10)
  }
});

