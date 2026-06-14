import { Text, View } from 'components';
import React, { useState } from 'react';

import { StyleSheet, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import { hp, wp } from 'utils/dimension';
import { getBlDevice } from 'utils/auth';
import BleManager from 'react-native-ble-manager'
import { useNavigation } from '@react-navigation/native';
export interface IHeaderProps {
    header?: string
}
export const Header = (props: IHeaderProps) => {
    const [connected, setConnected] = useState(false);
    const navigation = useNavigation();
    React.useEffect(() => {
        checkConnection();

        return () => {

        };
    }, []);
    const checkConnection = async () => {
        var device = await getBlDevice();
        if (device && device.name) {
            const isConnected = await BleManager.isPeripheralConnected(
                device.id,
                []
              )
            if (isConnected) {
                setConnected(isConnected);
            } else {
                try {
                    // const bufferLength = await BluetoothSerial.available(device.id);
                 
                    // if (bufferLength > 0) {
                        await BleManager.connect(device.id);
                        // await BluetoothSerial.write("7hh");
                        setConnected(true)
                    // } else {
                    //     setConnected(false)
                    // }

                } catch (e) {
                    setConnected(false)
                }

            }
        }


    }
    return (
        <View style={{
            flex: 0, flexDirection: "row", height: hp(90), backgroundColor: "#fff",
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,

            elevation: 5,
        }}>
            <View style={{ flexDirection: "row" }}>

                <View style={{ flex: 1 }} >
                    <FastImage
                        style={{ width: wp(40), height: wp(20) }}
                        source={require('../../images/kumansim.webp')}
                        resizeMode={FastImage.resizeMode.center}
                    />

                </View>
                <View center style={{ flex: 2 }}>
                    <Text style={{ fontWeight: "bold", color: "black" }}> {props.header ? props.header : "MEMSİM"} </Text>
                </View>
                <View style={{ flex: 1, justifyContent: "flex-end", alignItems: "flex-end" }}>
                    <TouchableOpacity onPress={() => {
                        navigation.navigate("connection" as never)
                    }}>


                        <FastImage
                            style={{ width: wp(20), height: wp(20) }}
                            source={connected ? require('../../images/bl_on.png') : require('../../images/bl-off.png')}
                            resizeMode={FastImage.resizeMode.center}
                        />
                    </TouchableOpacity>
                </View>
            </View>



        </View>
    );
};
const styles = StyleSheet.create({

    hello: {
        color: "#fff",
        fontSize: hp(18),
        fontFamily: "DIN-Medium",
        letterSpacing: 2

    },
    name: {
        color: "#fff",
        fontSize: hp(20),
        fontFamily: "Narin-Bold",
        marginLeft: wp(5)

    }
});