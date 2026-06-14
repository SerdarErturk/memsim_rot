


import { useFocusEffect } from '@react-navigation/native';
import { Button, Header, InputBox, LoadingLayer, SafeAreaView, Text, View } from 'components';
import { useNavigation } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { hp, wp } from 'utils/dimension';
import FastImage from 'react-native-fast-image';

import BleManager from 'react-native-ble-manager'
import { deleteScenarios, getScenariosList } from 'localdb/scenarios_repository';
import { showMessage } from 'react-native-flash-message';
import { getBlDevice, getLocalize } from 'utils/auth';
import { L } from 'utils/utility';
function Scenarios() {
  const loadingLayer = useRef(null) as any;
  const [targetList, setScenariosList] = useState([]) as any;
  const [locale, setLocale] = useState(null as any);
  const navigation = useNavigation();
  useFocusEffect(
    React.useCallback(() => {
      getLocaleValue();
      loadScenarios();
    }, []),
  )
  const getLocaleValue = async () => {
    var locale = await getLocalize();
    setLocale(locale);
  }
  const loadScenarios = async () => {
    var targets = await getScenariosList();
    setScenariosList(targets)
  }
  const play = async (shuffle: boolean, item: any) => {
    var device = await getBlDevice() as any;
    if (device == null) {
      showMessage({
        message: L('warning.connection',locale),
        type: "danger",
        position: "top",
        duration: 6000,
      });
      return;
    }
    const isConnected = await BleManager.isPeripheralConnected(
      device.id,
      []
    )
    if (!isConnected) {
      showMessage({
        message: L('warning.connection',locale),
        type: "danger",
        position: "top",
        duration: 6000,
      });
      return;
    }
    var target = JSON.parse(item.targets);
    if (shuffle) {
      target = shuffleArray(target);
    }
    var model = {
      hedefSure: item.hedefSure,
      doubletapSure: item.doubletapSure,
      rehineSure: item.rehineSure,
      doubletapGecerli: item.doubletapGecerli,
    };
    navigation.navigate("playscenario" as never, { targets: target, times: model } as never)


  }
  const shuffleArray = (array: any) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };
  const deleteRecord = async (item: any) => {
    await deleteScenarios(item.id);
    loadScenarios();
  }
  const renderItem = (data: any) => {
    var { item } = data;

    return <View flexNone style={{
      paddingLeft: wp(3),
      paddingRight: wp(3),
      width: wp(280)
    }}>
      <View key={item.id + "_view"} style={{
        width: "100%",
        padding: wp(5), marginTop: hp(5),
        backgroundColor: "#FFF",
        borderRadius: wp(5),
        flexDirection: "row"
      }}>



        <View style={{ flex: 10 }}>
          <Text style={{ fontSize: wp(6), fontWeight: "bold", color: "black" }}> {item.name}</Text>
          <Text style={{ fontSize: wp(4), color: "black" }}> {item.description}</Text>

        </View>
        <View style={{ flex: 6, justifyContent: "center", alignItems: "flex-end", flexDirection: "row" }}>
          <TouchableOpacity style={{ flexDirection: "row", marginLeft: wp(10) }} onPress={() => {
            play(false, item)
          }}>


            <FastImage
              style={{ width: wp(15), height: wp(15) }}
              source={require('../images/play-button.png')}
              resizeMode={FastImage.resizeMode.contain}
            />
          </TouchableOpacity>

          <TouchableOpacity style={{ flexDirection: "row", marginLeft: wp(10) }} onPress={() => {
            play(true, item)
          }}>


            <FastImage
              style={{ width: wp(15), height: wp(15) }}
              source={require('../images/shuffle.png')}
              resizeMode={FastImage.resizeMode.contain}
            />
          </TouchableOpacity>

          <TouchableOpacity style={{ flexDirection: "row", marginLeft: wp(10) }} onPress={() => {
            navigation.navigate("addscenario" as never, { id: item.id } as never)
          }}>


            <FastImage
              style={{ width: wp(15), height: wp(15) }}
              source={require('../images/editing.png')}
              resizeMode={FastImage.resizeMode.contain}
            />
          </TouchableOpacity>

          <TouchableOpacity style={{ flexDirection: "row", marginLeft: wp(10) }} onPress={() => {
            deleteRecord(item)
          }}>


            <FastImage
              style={{ width: wp(15), height: wp(15) }}
              source={require('../images/delete.png')}
              resizeMode={FastImage.resizeMode.contain}
            />
          </TouchableOpacity>
        </View>


      </View>
    </View>

  }

  return (
    <SafeAreaView hideBack style={{ backgroundColor: "#E9EDEE" }} >
      <Header header={'MEMSİM ' +L('header.gamescrenario',locale)}></Header>
      <LoadingLayer ref={loadingLayer} />

      <View style={{ padding: wp(10), flexDirection: "row" }}>



        <View center  >
          <View style={{ flexDirection: "row" }}>

            <View style={{ flexDirection: "row", justifyContent: "flex-start", alignItems: "center" }}>


              <Text style={styles.welcome}> {L('general.screnarios',locale)}</Text>


            </View>
            <View style={{ flexDirection: "row", justifyContent: "flex-end", alignItems: "center" }}>
              <TouchableOpacity style={{ flexDirection: "row", marginLeft: wp(10) }} onPress={() => {
                navigation.navigate("addscenario" as never)
              }}>


                <FastImage
                  style={{ width: wp(10), height: wp(10) }}
                  source={require('../images/botas/add.webp')}
                  resizeMode={FastImage.resizeMode.contain}
                />
              </TouchableOpacity>

            </View>
          </View>
          <View style={{ flex: 5 }}>
            <FlatList
              data={targetList}
              numColumns={1}
              renderItem={renderItem}
              keyExtractor={item => item.id}
            />

          </View>

        </View>




      </View>
    </SafeAreaView>

  )
}

export default React.memo(Scenarios)
const styles = StyleSheet.create({


  welcome: {
    color: "#39464E",
    fontSize: wp(8),
    fontWeight: "bold"
  },
  targetCard: {
    borderRadius: wp(3),
    marginTop: hp(10)

  },
  targetBtn: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingLeft: wp(10)

  },
  targetname: {
    textAlign: "left",
    fontSize: hp(22),
    fontWeight: "bold"
  },
  label: {
    fontSize: wp(5),
    color: "#004F58",
    marginBottom: hp(4),
    fontFamily: "Narin-Medium"
  },
});

