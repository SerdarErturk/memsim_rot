

import React, { useState, useRef } from 'react';
import { CommonActions, useFocusEffect } from '@react-navigation/native';
import { Button, Header, InputBox, LoadingLayer, SafeAreaView, Text, View } from 'components';
// import BluetoothSerial from 'react-native-bluetooth-serial-next'
import { hp, wp } from '../utils/dimension';
import { TouchableOpacity, FlatList, PermissionsAndroid } from 'react-native';
import { setBlDevice, getBlDevice, getLocalize } from 'utils/auth';
import FastImage from 'react-native-fast-image';
import BleManager from 'react-native-ble-manager';

import { bytesToString, stringToBytes } from "convert-string";
import { L } from 'utils/utility';
let device = null as any;
function NewTarget() {
  const [unPairedDevices, setUnpairedDevices] = useState([] as any);
  const [blEnabled, setBlEnabled] = useState(false);
  const [targetNo, setTargetNo] = useState(null);
  const [searching, setSearching] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState(null as any);
  const [locale, setLocale] = useState(null as any);
  const loadingLayer = useRef(null) as any;

  useFocusEffect(
    React.useCallback(() => {
      getLocaleValue();
      loadStatus()
    }, []),
  )
  const getLocaleValue = async () => {
    var locale = await getLocalize();
    setLocale(locale);
  }
  const loadStatus = async () => {
    await BleManager.start({ showAlert: false });
    var device = await getBlDevice();
    if (device) {
      setConnectedDevice(device);
    }
    const isEnabled = await BleManager.checkState();
    setBlEnabled(isEnabled == "on")

  }
  const openBluetooth = async () => {
    if (loadingLayer.current) {
      loadingLayer.current.fadeIn();
    }
    if (!blEnabled) {
      await BleManager.enableBluetooth()
    }

    const isEnabled = await BleManager.checkState();
    setBlEnabled(isEnabled == "on")
    if (loadingLayer.current) {
      loadingLayer.current.fadeOut();
    }
  }
  const delay = (milliseconds: any) => {
    return new Promise((resolve: any, reject: any) => {
      setTimeout(() => {
        resolve();
      }, milliseconds);
    });
  };
  const searchDevice = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        {
          title: L('message.permissionbleheader', locale),
          message: L('message.permissionble', locale),
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {

      } else {
        console.log('Camera permission denied');
      }
    } catch (err) {
      console.warn(err);
    } if (connectedDevice && connectedDevice.name) {
      await BleManager.disconnect(connectedDevice.id);
      setBlDevice(null);
      setConnectedDevice(null)
    } else {
      setSearching(true);
      await BleManager.scan([], 3, false, {})
      await delay(5000)
      var discoveredPeripherals = await BleManager.getDiscoveredPeripherals();
      var connectedPeripherals = await BleManager.getConnectedPeripherals();
      var bondedPeripherals = await BleManager.getBondedPeripherals();
      setUnpairedDevices([...discoveredPeripherals, ...connectedPeripherals, ...bondedPeripherals]);
      await BleManager.stopScan();
      setSearching(false);
    }
  }

  const connect = async (device: any) => {
    setSearching(true);

    await BleManager.connect(device.id);
    const isConnected = await BleManager.isPeripheralConnected(
      device.id,
      []
    )

    if (isConnected) {
      var model = {
        id: device.id,
        name: device.name,
      }
      setBlDevice(model)
      setConnectedDevice(device);
    }
    setSearching(false);
  }
  const renderItem = (data: any) => {
    var { item } = data;

    return <View style={{
      paddingLeft: wp(40),
      paddingRight: wp(40)
    }}>
      <View flexNone key={item.id + "_view"} style={{
        width: "100%",
        padding: wp(5), marginTop: hp(5),
        backgroundColor: "#FFF",
        borderRadius: wp(5)
      }}>

        <TouchableOpacity style={{ flexDirection: "row" }} onPress={() => {
          connect(item)
        }}>


          <View center>
            <FastImage
              style={{ width: wp(15), height: wp(15) }}
              source={!blEnabled ? require('../images/bl-off.png') : require('../images/bl_on.png')}
              resizeMode={FastImage.resizeMode.contain}
            />
          </View>
          <View style={{ flex: 10 }}>
            <Text style={{ fontSize: wp(6), fontWeight: "bold", color: "black" }}> {item.name}</Text>
            <Text style={{ fontSize: wp(4), color: "black" }}> {item.address}</Text>
          </View>
          <View center>
            <Text> Bağlan</Text>
          </View>
        </TouchableOpacity>

      </View>
    </View>

  }
  const saveTargetNumber = () => {
    let dv = connectedDevice.id;
    writeMessage(targetNo, dv);
  }
  const writeMessage = async (message: any, deviceId: any) => {
    console.log("Giden=>>> " + message);
    // delay(100);
    const data = stringToBytes(message);
    await BleManager.write(deviceId, "d564ac02-e906-4b14-88ad-ca841372a59f", "fea6c2d8-bc0d-4ea7-b66c-109eafd24ffc", data);

  }
  return (
    <SafeAreaView  >
      <LoadingLayer ref={loadingLayer} />
      <Header header={'MEMSIMROT ' + L('header.connectdevice', locale)} />
      <View >
        <View style={{ flexDirection: "row" }}>
          <View center style={{}}>
            <TouchableOpacity disabled={searching} style={{ backgroundColor: searching ? "gray" : "white", height: wp(50), width: wp(50), alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "white", borderRadius: wp(2) }}
              onPress={() => { openBluetooth() }} >
              <FastImage
                style={{ width: wp(20), height: wp(20) }}
                source={!blEnabled ? require('../images/bl-off.png') : require('../images/bl_on.png')}
                resizeMode={FastImage.resizeMode.contain}
              />
              <Text style={{ color: "black" }}>
                {!blEnabled ? L('general.blestateclose', locale) : L('general.blestateopen', locale)}
              </Text>
            </TouchableOpacity>
          </View>
          <View>
            <View center style={{}}>
              <TouchableOpacity disabled={!blEnabled || searching} style={{ backgroundColor: !blEnabled || searching ? "gray" : "white", height: wp(50), width: wp(50), alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "white", borderRadius: wp(2) }}
                onPress={() => { searchDevice() }} >
                <FastImage
                  style={{ width: wp(25), height: wp(25) }}
                  source={require('../images/search.png')}
                  resizeMode={FastImage.resizeMode.contain}
                />
                <Text style={{ color: "black" }}>
                  {searching ? L('general.blescanning', locale) : connectedDevice ? L('general.disconnect', locale) : L('general.blescan', locale)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={{ flex: 2 }}>
          {connectedDevice ?

            <View center>
              <Text style={{ color: "white", fontSize: wp(10) }}> { L('general.connecteddevice',locale)}</Text>
              <Text style={{ color: "white", fontSize: wp(14), fontWeight: "bold" }}>{connectedDevice.name}</Text>


              <View>
                <InputBox label={L('general.targetnumber',locale)} value={targetNo} keyboardType={"numeric"} onChangeText={(text: any) => {
                  setTargetNo(text);
                }} />
                <Button onPress={saveTargetNumber} label={L('general.send',locale)} />
              </View>
            </View> :
            searching ?
              <View center>

                <FastImage
                  style={{ width: wp(70), height: wp(70), borderRadius: wp(40) }}
                  source={require('../images/bluetooth-sync.gif')}
                  resizeMode={FastImage.resizeMode.contain}
                />
              </View>
              :
              <FlatList
                data={unPairedDevices.filter((t: any) => t.name != null)}
                numColumns={1}
                renderItem={renderItem}
                keyExtractor={item => item.id}
              />}
        </View>
      </View>


    </SafeAreaView>

  )
}

export default React.memo(NewTarget)


