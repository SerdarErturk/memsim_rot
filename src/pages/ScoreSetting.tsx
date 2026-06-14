


import { useFocusEffect } from '@react-navigation/native';
import { Button, Header, InputBox, LoadingLayer, SafeAreaView, View } from 'components';
import React, { useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { hp, wp } from 'utils/dimension';
import { showMessage } from 'react-native-flash-message';
import { getPuanList, updatePuan } from 'localdb/puan_repository';
import { getLocalize } from 'utils/auth';
import { L } from 'utils/utility';

function ScoreSetting() {

  const loadingLayer = useRef(null) as any;
  const [selectedPuan, setSelectedPuan] = useState({}) as any;
  const [locale, setLocale] = useState(null as any);
  useFocusEffect(
    React.useCallback(() => {
      getLocaleValue();
      loadData();
    }, []),
  )
   const getLocaleValue = async () => {
      var locale = await getLocalize();
      setLocale(locale);
    }
  const loadData = async () => {
    var puan = await getPuanList();
    setSelectedPuan(puan[0])
  }
  const updatePuanData = async () => {
    updatePuan(selectedPuan);
   
    showMessage({
      message: L("info.savescore",locale) ,
      type: "success",
      position: "top",
      duration: 6000,
    });
  }

  return (
    <SafeAreaView hideBack style={{ backgroundColor: "#E9EDEE" }} >
      <Header header={'MEMSIMROT ' +L('header.scoresetting',locale)}></Header>
      <LoadingLayer ref={loadingLayer} />

      <View style={{ padding: wp(10), flexDirection: "row" }}>


        <View style={{ paddingRight: wp(10) }} >
          <View  >
            <InputBox keyboardType={"numeric"} value={selectedPuan.rehineCeza} label={ L('general.hostagehitpenaltypoints',locale) } onChangeText={(text) => {
              var val = { ...selectedPuan };
              val.rehineCeza = text;
              setSelectedPuan(val)
            }} />
            <InputBox keyboardType={"numeric"} value={selectedPuan.sureCeza} label={L('general.elapsedtimepenaltypoints',locale)} onChangeText={(text) => {
              var val = { ...selectedPuan };
              val.sureCeza = text;
              setSelectedPuan(val)
            }} />
             <InputBox keyboardType={"numeric"} value={selectedPuan.rehineVurulmadiPuan} label={L('general.addpointshostagehit',locale)} onChangeText={(text) => {
              var val = { ...selectedPuan };
              val.rehineVurulmadiPuan = text;
              setSelectedPuan(val)
            }} />
          </View>

          <Button style={{ marginTop: wp(4) }} label={L('general.save',locale)} onPress={() => { updatePuanData(); }} />
      
        </View>


      </View>
    </SafeAreaView>

  )
}

export default React.memo(ScoreSetting)
const styles = StyleSheet.create({


  welcome: {
    color: "#39464E",
    fontSize: wp(8),
    fontWeight: "bold"
  },
  sensorCard: {
    borderRadius: wp(3),
    marginTop: hp(10)

  },
  sensorBtn: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingLeft: wp(10)

  },
  sensorname: {
    textAlign: "left",
    fontSize: hp(22),
    fontWeight: "bold"
  }
});

