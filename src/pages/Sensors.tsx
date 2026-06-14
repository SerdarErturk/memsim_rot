


import { useFocusEffect } from '@react-navigation/native';
import { Button, Header, InputBox, LoadingLayer, SafeAreaView, Text, View } from 'components';
import { useNavigation } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { hp, wp } from 'utils/dimension';
import FastImage from 'react-native-fast-image';
import { getSensorsList, updateSensors } from 'localdb/sensors_repository';
import { SensorType } from 'utils/enums';
import { showMessage } from 'react-native-flash-message';
import { getLocalize } from 'utils/auth';
import { L } from 'utils/utility';

function Sensors() {

  const loadingLayer = useRef(null) as any;
  const [selectedSensor, setSelectedSensor] = useState({}) as any;
  const [sensorList, setSensorList] = useState([]) as any;
  const [locale, setLocale] = useState(null as any);
  useFocusEffect(
    React.useCallback(() => {
      getLocaleValue();
      loadSensor();
    }, []),
  )
  const getLocaleValue = async () => {
    var locale = await getLocalize();
    setLocale(locale);
  }
  const loadSensor = async () => {
    var sensors = await getSensorsList();
    setSensorList(sensors)
  }
  const updateSensor = async () => {
    updateSensors(selectedSensor);
    loadSensor();
    showMessage({
      message: "Sensör Bilgileri Kayıt Edildi.",
      type: "success",
      position: "top",
      duration: 6000,
    });
  }

  return (
    <SafeAreaView hideBack style={{ backgroundColor: "#E9EDEE" }} >
      <Header header={'MEMSİM '+L('header.settingsensor',locale)}></Header>
      <LoadingLayer ref={loadingLayer} />

      <View style={{ padding: wp(10), flexDirection: "row" }}>


        <View style={{ borderRightWidth: 1, borderRightColor: "#9E9E9E", paddingRight: wp(10) }} >
          <View center >
            <Text style={styles.welcome}>{L('general.sensors',locale)} </Text>


          </View>
          {sensorList.map((t: any) => <View key={t.id} style={{ backgroundColor: t.color, ...styles.sensorCard }}>
            <TouchableOpacity style={styles.sensorBtn} onPress={() => { setSelectedSensor(t) }}>
              <Text style={styles.sensorname}>{t.name}</Text>
            </TouchableOpacity>
          </View>)}

        </View>
        <View style={{ paddingLeft: wp(10) }}>
          <View center >
            <Text style={styles.welcome}>{L('general.sensorinfo',locale)} </Text>


          </View>
          <View style={{ flex: 6 }}>

            <ScrollView >
              <InputBox disabled label={L('general.sensorname',locale)} value={selectedSensor.name} onChangeText={() => { }} />

              <InputBox disabled={!selectedSensor.id} label={L('general.sensordisplayname',locale)} value={selectedSensor.displayName} onChangeText={(text) => {

                var val = { ...selectedSensor };
                val.displayName = text;
                setSelectedSensor(val)
              }} />

              <InputBox disabled={!selectedSensor.id} keyboardType="numeric" label={L('general.shotscore',locale)} value={selectedSensor.score} onChangeText={(text) => {

                var val = { ...selectedSensor };
                val.score = text;
                setSelectedSensor(val)
              }} />
              {selectedSensor.type == SensorType.PIEZO ?
                <>
                  <InputBox disabled={!selectedSensor.id} keyboardType="numeric" label={L('general.mindarbe',locale)} value={selectedSensor.minDarbe} onChangeText={(text) => {

                    var val = { ...selectedSensor };
                    val.minDarbe = text;
                    setSelectedSensor(val)
                  }} />
                  <InputBox disabled={!selectedSensor.id} keyboardType="numeric" label={L('general.maxarbe',locale)}  value={selectedSensor.maxDarbe} onChangeText={(text) => {

                    var val = { ...selectedSensor };
                    val.maxDarbe = text;
                    setSelectedSensor(val)
                  }} />
                </> : null}
              <Button disabled={!selectedSensor.id} style={{ marginTop: wp(4) }} label={L('general.save',locale)} onPress={() => { updateSensor(); }} />
            </ScrollView>

          </View>

        </View>

      </View>
    </SafeAreaView>

  )
}

export default React.memo(Sensors)
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

