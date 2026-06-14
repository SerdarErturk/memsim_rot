


import { useFocusEffect } from '@react-navigation/native';
import { Button, Header, InputBox, LoadingLayer, SafeAreaView, View } from 'components';
import React, { useRef, useState } from 'react';
import { wp } from 'utils/dimension';
import { showMessage } from 'react-native-flash-message';
import { getTimeList, updateTime } from 'localdb/time_repository';
import { getLocalize } from 'utils/auth';
import { L } from 'utils/utility';

function ShotTimeSetting() {

  const loadingLayer = useRef(null) as any;
  const [selectedPuan, setSelectedPuan] = useState({}) as any;
  const [locale, setLocale] = useState(null as any);
  useFocusEffect(
    React.useCallback(() => {
      getLocaleValue();
      loadData();
    }, []),
  )
  const loadData = async () => {
    var puan = await getTimeList();
    setSelectedPuan(puan[0])
  }
  const getLocaleValue = async () => {
    var locale = await getLocalize();
    setLocale(locale);
  }
  const updatePuanData = async () => {
    updateTime(selectedPuan);

    showMessage({
      message: L("info.timesuccsess",locale),
      type: "success",
      position: "top",
      duration: 6000,
    });
  }

  return (
    <SafeAreaView hideBack style={{ backgroundColor: "#E9EDEE" }} >
      <Header header={'MEMSIMROT '+L("header.timesetting",locale)}></Header>
      <LoadingLayer ref={loadingLayer} />

      <View style={{ padding: wp(10), flexDirection: "row" }}>
        <View style={{ paddingRight: wp(10) }} >
          <View  >
            <InputBox keyboardType={"decimal"} value={selectedPuan.hedefSure} label={L("general.targetactivetime",locale)} onChangeText={(text) => {
              var val = { ...selectedPuan };
              val.hedefSure = text;
              setSelectedPuan(val)
            }} />
            <InputBox keyboardType={"decimal"} value={selectedPuan.doubletapSure} label={L("general.dtactivetime",locale)} onChangeText={(text) => {
              var val = { ...selectedPuan };
              val.doubletapSure = text;
              setSelectedPuan(val)
            }} />
            <InputBox keyboardType={"decimal"} value={selectedPuan.rehineSure} label={L("general.hostageactivetime",locale)} onChangeText={(text) => {
              var val = { ...selectedPuan };
              val.rehineSure = text;
              setSelectedPuan(val)
            }} />

            <InputBox keyboardType={"decimal"} value={selectedPuan.doubletapGecerli} label={L("general.dtcurrentshottime",locale)} onChangeText={(text) => {
              var val = { ...selectedPuan };
              if (parseInt(text) < 500) {
                text = "500";
              }
              val.doubletapGecerli = text;
              setSelectedPuan(val)
            }} />
          </View>

          <Button style={{ marginTop: wp(4) }} label={L("general.save",locale)} onPress={() => { updatePuanData(); }} />

        </View>


      </View>
    </SafeAreaView>

  )
}

export default React.memo(ShotTimeSetting)


