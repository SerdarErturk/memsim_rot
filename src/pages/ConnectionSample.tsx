

import React, { useState } from 'react';
import { CommonActions, useFocusEffect } from '@react-navigation/native';
import { Button, Header, InputBox, LoadingLayer, SafeAreaView, Text, View } from 'components';
import BluetoothSerial from 'react-native-bluetooth-serial-next'
import { hp, wp } from '../utils/dimension';
import { TouchableOpacity, FlatList } from 'react-native';
import { setBlDevice } from 'utils/auth';

let device = null as any;
function Connection() {
  const [unPairedDevices, setUnpairedDevices] = useState([] as any);
  const [message, setMessage] = useState("" as any);

  useFocusEffect(
    React.useCallback(() => {
      scan();
    }, []),
  )


  const scan = async () => {
    const isConnected = await BluetoothSerial.isConnected();
    const isEnabled = await BluetoothSerial.isEnabled();
    // const devices = await BluetoothSerial.list();

    // const devices = await BluetoothSerial.listUnpaired();
    alert(isEnabled)
    alert(isConnected)
    if (!isConnected) {
      const devicesUnparied = await BluetoothSerial.listUnpaired();
      console.log(devicesUnparied);
      console.log("aranıyor");
      const devices = await BluetoothSerial.discoverUnpairedDevices();

      setUnpairedDevices(devices)
      console.log("bitti");
    } else {

      BluetoothSerial.read((data: string, subscription: any) => {
        alert(data)

      }, "\r\n");
    }


  }
  const connect = async (device: any) => {

    device = await BluetoothSerial.connect(device.id);
    const isConnected = await BluetoothSerial.isConnected();
    if (isConnected) {
      setBlDevice(device.id)
      BluetoothSerial.read((data: string, subscription: any) => {
        alert(data)

      }, "\r\n");
    }

  }
  const write = async () => {
    await BluetoothSerial.write("7hh");
    alert(message)
  }
  const renderItem = (data: any) => {
    var { item } = data;

    return <View style={{
      padding: wp(10), marginTop: hp(5),
      backgroundColor: "#FFF",
      borderRadius: wp(5)
    }}>
      <View flexNone key={item.id + "_view"} style={{
        width: "100%",
        borderRadius: wp(35),
      }}>

        <TouchableOpacity onPress={() => {
          connect(item)
        }}>
          <Text> {item.name}</Text>
          <Text> {item.address}</Text>
        </TouchableOpacity>

      </View>
    </View>

  }

  return (
    <SafeAreaView style={{ backgroundColor: "#E9EDEE" }} >


      <View style={{ padding: wp(10) }}>
        <View>
          <InputBox label={"TEST"} value={message} onChangeText={(text) => { setMessage(text) }

          } />
          <Button label="gönder" onPress={() => { write() }} />
        </View>
        <View>
          <FlatList
            data={unPairedDevices}
            numColumns={1}
            renderItem={renderItem}
            keyExtractor={item => item.id}
          />
        </View>
      </View>

    </SafeAreaView>

  )
}

export default React.memo(Connection)


