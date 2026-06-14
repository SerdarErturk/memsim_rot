


import { useFocusEffect } from '@react-navigation/native';
import { Header, LoadingLayer, SafeAreaView, Text, View } from 'components';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { hp, wp } from 'utils/dimension';
import FastImage from 'react-native-fast-image';
import { getBlDevice, getLocalize } from 'utils/auth';
import { getTargetsList } from 'localdb/targets_repository';
import BleManager from 'react-native-ble-manager';
import { bytesToString, stringToBytes } from "convert-string";
import { NativeModules, NativeEventEmitter } from "react-native";
import { showMessage } from 'react-native-flash-message';
import { Status } from 'utils/enums';
import { L } from 'utils/utility';
let timeOut = 0 as any;
let blResult = [] as any;
let device = {} as any;
let activeIndex = -1;
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
function Settings() {

  const loadingLayer = useRef(null) as any;
  const navigation = useNavigation();
  const [locale, setLocale] = useState(null as any);
  const [targetList, settargetList] = useState([]) as any;
  useEffect(() => {
    getLocaleValue();
    loadTargetList();
    return () => {
      bleManagerEmitter.removeAllListeners('BleManagerDidUpdateValueForCharacteristic');
      clearInterval(timeOut);
    };
  }, []);
  const getLocaleValue = async () => {
    var locale=await getLocalize();
     setLocale(locale);
  }
  const loadTargetList = async () => {

    let targets = await getTargetsList();
    targets.filter((t: any) => t.status == Status.ACTIVE).sort((a: any, b: any) => (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0))
    settargetList(targets);
  }
  const selamlama = async () => {
    var dv = await getBlDevice();
    if (dv && dv.name) {
      const isConnected = await BleManager.isPeripheralConnected(
        dv.id,
        []
      )
      if (!isConnected) {
        showMessage({
          message:L("warning.connection",locale),
          type: "danger",
          position: "top",
          duration: 6000,
        });
        return;
      }
    } else {
      showMessage({
        message:L("warning.connection",locale),
        type: "danger",
        position: "top",
        duration: 6000,
      });
      return;
    }


    nexTarget(dv.id);

  }
  const restart = async () => {
    var dv = await getBlDevice();
    if (dv && dv.name) {
      const isConnected = await BleManager.isPeripheralConnected(
        dv.id,
        []
      )
      if (!isConnected) {
        showMessage({
          message:L("warning.connection",locale),
          type: "danger",
          position: "top",
          duration: 6000,
        });
        return;
      }
    } else {
      showMessage({
        message:L("warning.connection",locale),
        type: "danger",
        position: "top",
        duration: 6000,
      });
      return;
    }

    writeMessage("restart", dv.id)
  }
  const close = async () => {
    var dv = await getBlDevice();
    if (dv && dv.name) {
      const isConnected = await BleManager.isPeripheralConnected(
        dv.id,
        []
      )
      if (!isConnected) {
        showMessage({
          message:L("warning.connection",locale),
          type: "danger",
          position: "top",
          duration: 6000,
        });
        return;
      }
    } else {
      showMessage({
        message:L("warning.connection",locale),
        type: "danger",
        position: "top",
        duration: 6000,
      });
      return;
    }

    writeMessage("cls", dv.id)
  }
  const nexTarget = (deviceId?: any) => {
    clearInterval(timeOut);
    let dv = deviceId || device.id;
    activeIndex = activeIndex + 1;
    if (activeIndex >= targetList.length) {
      activeIndex = activeIndex - 1;

      finish(dv);
      return;
    }
    var message = targetList[activeIndex].field + "h";
    writeMessage(message, dv)
    timeOut = setInterval(() => {
      if (activeIndex == targetList.length) {
        activeIndex = activeIndex - 1;
        finish(dv);
      } else {
        blResult.push({ index: activeIndex, result: "-1" })
        closeTarget(dv);

      }

    }, 800);

  }
  const closeTarget = (deviceId?: any) => {
    let dv = deviceId || device.id;
    writeMessage("stp", dv);
    nexTarget(dv);
  }
  const finish = (dv: any) => {
    clearInterval(timeOut);
    activeIndex = -1;
  }

  const writeMessage = async (message: any, deviceId: any) => {
    console.log("Giden=>>> " + message);
    // delay(100);
    const data = stringToBytes(message);
    await BleManager.write(deviceId, "d564ac02-e906-4b14-88ad-ca841372a59f", "fea6c2d8-bc0d-4ea7-b66c-109eafd24ffc", data);

    // await BluetoothSerial.clear();
    // await BluetoothSerial.write(message);
    // const timeElapsed = Date.now();
    // const today = new Date(timeElapsed);
    // var model = {
    //   date: today.toUTCString(),
    //   text:"Giden=>>> "  + message
    // }
    // await insertLogs(model);
  }
  return (
    <SafeAreaView hideBack style={{ backgroundColor: "#E9EDEE" }} >
      <Header header={'MEMSİM ' + L("header.systemsetting",locale)}></Header>
      <LoadingLayer ref={loadingLayer} />

      <View style={{ padding: wp(10) }}>

        <View style={{ flex: 3, paddingTop: hp(5), paddingBottom: hp(5), flexDirection: "row" }}>
          <View style={{ flexDirection: "row" }}>
            <View style={{ padding: wp(5) }} >
              <TouchableOpacity style={[styles.btn, styles.shadow]} onPress={() => { selamlama(); }} >
                <FastImage
                  style={{ width: hp(80), height: hp(80) }}
                  source={require('../images/check-mark.png')}
                  resizeMode={FastImage.resizeMode.contain}
                />
                <Text style={styles.btnsubtext}>
                  { L("setting.greeting",locale)}
                </Text>

              </TouchableOpacity>
            </View>

          </View>
          <View style={{ flexDirection: "row" }}>
            <View style={{ padding: wp(5) }} >
              <TouchableOpacity style={[styles.btn, styles.shadow]} onPress={() => { restart(); }} >
                <FastImage
                  style={{ width: hp(80), height: hp(80) }}
                  source={require('../images/rotate-left.png')}
                  resizeMode={FastImage.resizeMode.contain}
                />
                <Text style={styles.btnsubtext}>
                { L("setting.restart",locale)}
                </Text>

              </TouchableOpacity>
            </View>

          </View>

        </View>
        <View style={{ flex: 3, paddingTop: hp(5), paddingBottom: hp(5), flexDirection: "row" }}>
          <View style={{ flexDirection: "row" }}>
            <View style={{ padding: wp(5) }} >
              <TouchableOpacity style={[styles.btn, styles.shadow]} onPress={() => { close(); }} >
                <FastImage
                  style={{ width: hp(80), height: hp(80) }}
                  source={require('../images/sensor.png')}
                  resizeMode={FastImage.resizeMode.contain}
                />
                <Text style={styles.btnsubtext}>
                { L("setting.closetarget",locale)} 
                </Text>

              </TouchableOpacity>
            </View>

          </View>
          <View style={{ flexDirection: "row" }}>
            <View style={{ padding: wp(5) }} >
              <TouchableOpacity style={[styles.btn, styles.shadow]} onPress={() => { navigation.navigate("language" as never) }} >
                <FastImage
                  style={{ width: hp(80), height: hp(80) }}
                  source={require('../images/translate.webp')}
                  resizeMode={FastImage.resizeMode.contain}
                />
                <Text style={styles.btnsubtext}>
                { L("setting.selectlanguage",locale)}
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

