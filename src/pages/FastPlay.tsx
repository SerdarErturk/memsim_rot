


import { useFocusEffect } from '@react-navigation/native';
import { Button, Header, InputBox, LoadingLayer, SafeAreaView, Text, View } from 'components';
import { useNavigation } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { hp, wp } from 'utils/dimension';
import { showMessage } from 'react-native-flash-message';
import { Status, TargetType } from 'utils/enums';
import { getTargetsList } from 'localdb/targets_repository';
import { getRandomInt, shuffleArr } from 'utils/helper';
import { generateUUID } from 'utils/utils';
import { getScenarios } from 'localdb/scenarios_repository';
import { getBlDevice, getLocalize } from 'utils/auth';
import BleManager from 'react-native-ble-manager';
import { L } from 'utils/utility';
function FastPlay(props: any) {

  const loadingLayer = useRef(null) as any;
  const [targetList, setTargetList] = useState([]) as any;
  const [scenarioCounts, setScenarioCounts] = useState({ d: 0, h: 0, r: 0 }) as any;
  const [scenarioTarget, setScenarioTarget] = useState([]) as any;
  const [locale, setLocale] = useState(null as any);
  const [scenarioModel, setScenarioModel] = useState({}) as any;
  const navigation = useNavigation();
  const params = props.route.params
  useFocusEffect(
    React.useCallback(() => {
      getLocaleValue();
      if (params && params.id) {
        loadValues()
      }
      loadTargets();
    }, []),
  )
  const getLocaleValue = async () => {
    var locale = await getLocalize();
    setLocale(locale);
  }
  const loadValues = async () => {
    var model = await getScenarios(params.id);

    setScenarioModel(model);
    setScenarioTarget(JSON.parse(model.targets))

  }
  const loadTargets = async () => {
    var targets = await getTargetsList();
    setTargetList(targets.filter((t: any) => t.status == Status.ACTIVE))
  }




  const createScenario = async () => {
    var device = await getBlDevice() as any;
    if (device && device.name) {
      const isConnected = await BleManager.isPeripheralConnected(
        device.id,
        []
      )
      if (!isConnected) {
        showMessage({
          message: L("warning.connection", locale),
          type: "danger",
          position: "top",
          duration: 6000,
        });
        return;
      }
    } else {
      showMessage({
        message: L("warning.connection", locale),
        type: "danger",
        position: "top",
        duration: 6000,
      });
      return;
    }

    var doubleTapCount = parseInt(scenarioCounts.d);
    var hedefCount = parseInt(scenarioCounts.h);
    var rehineCount = parseInt(scenarioCounts.r);
    var totalCount = doubleTapCount + hedefCount + rehineCount;
    var targetCounts = targetList.length;

    if (totalCount > targetCounts) {
      showMessage({
        message: L("warning.countwarning", locale),
        type: "danger",
        position: "top",
        duration: 6000,
      });
      return;
    }
    var targets = [] as any;
    var lst = [...targetList];

    for (let i = 0; i < doubleTapCount; i++) {
      let index = getRandomInt(0, lst.length - 1);

      var item = lst[index];
      if (item) {
        var guid = generateUUID();
        var model = {
          id: guid,
          name: item.name,
          targetId: item.field,
          message: item.field + "d",
          type: TargetType.Doubletap
        }
        targets.push(model);
        lst.splice(index, 1);
      }

    }

    for (let i = 0; i < hedefCount; i++) {
      let index = getRandomInt(0, lst.length - 1);
      var guid = generateUUID();
      var item = lst[index];
      if (item) {
        var model = {
          id: guid,
          name: item.name,
          targetId: item.field,
          message: item.field + "h",
          type: TargetType.Hedef
        }
        targets.push(model);
        lst.splice(index, 1);
      }
    }

    for (let i = 0; i < rehineCount; i++) {
      let index = getRandomInt(0, lst.length - 1);
      var item = lst[index];
      var guid = generateUUID();
      if (item) {
        var model = {
          id: guid,
          name: item.name,
          targetId: item.field,
          message: item.field + "r",
          type: TargetType.Rehine
        }
        targets.push(model);
        lst.splice(index, 1);
      }

    }

    targets = shuffleArr(targets);
    navigation.navigate("playscenario" as never, { targets: targets } as never)

  }

  return (



    <SafeAreaView hideBack style={{ backgroundColor: "#E9EDEE" }} >
      <Header header={'MEMSİM ' + L("header.fastplay",locale)}></Header>
      <LoadingLayer ref={loadingLayer} />

      <View style={{ padding: wp(10), flexDirection: "row" }}>

        <View style={{ paddingLeft: wp(10), flexDirection: "row" }}>
          <View style={{ borderRightWidth: 1, borderRightColor: "#9E9E9E", paddingRight: wp(10) }} >
            <View >
              <Text style={styles.desc}> {L("general.availabletarget", locale)} : {targetList.filter((t: any) => t.status == Status.ACTIVE).length}</Text>
              <View style={{ marginTop: wp(5) }}>

                <InputBox keyboardType="numeric" label={L("general.targettcount", locale)} value={scenarioCounts.h} onChangeText={(text) => {

                  var val = { ...scenarioCounts };
                  val.h = text;
                  setScenarioCounts(val)
                }} />
                <InputBox keyboardType="numeric" label={L("general.dtcount", locale)} value={scenarioCounts.d} onChangeText={(text) => {
                  var val = { ...scenarioCounts };
                  val.d = text;
                  setScenarioCounts(val)

                }} />
                <InputBox keyboardType="numeric" label={L("general.hostagecount", locale)} value={scenarioCounts.r} onChangeText={(text) => {
                  var val = { ...scenarioCounts };
                  val.r = text;
                  setScenarioCounts(val)

                }} />
                <Button style={{ marginTop: wp(4) }} label={L("general.play", locale)} onPress={() => { createScenario(); }} />

              </View>

            </View>

          </View>


        </View>



      </View>


    </SafeAreaView >

  )
}

export default React.memo(FastPlay)
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
  desc: {
    fontSize: wp(5),
    color: "#004F58",
    marginBottom: hp(4),
    fontFamily: "Narin-Medium"
  },
});

