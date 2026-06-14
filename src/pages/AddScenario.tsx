


import { useFocusEffect } from '@react-navigation/native';
import { Button, Header, InputBox, LoadingLayer, Modal, SafeAreaView, ScrollView, Text, View } from 'components';
import { useNavigation } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { hp, wp } from 'utils/dimension';
import FastImage from 'react-native-fast-image';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import DraggableFlatList, {
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { Radio, RadioGroup } from '@ui-kitten/components';
import { showMessage } from 'react-native-flash-message';
import { Status, TargetColors, TargetType } from 'utils/enums';
import { getTargetsList } from 'localdb/targets_repository';
import { getRandomInt, shuffleArr } from 'utils/helper';
import { generateUUID } from 'utils/utils';
import { getScenarios, insertScenarios, updateScenarios } from 'localdb/scenarios_repository';
import { getTimeList } from 'localdb/time_repository';
import { getLocalize } from 'utils/auth';
import { L } from 'utils/utility';

function AddScenario(props: any) {

  const loadingLayer = useRef(null) as any;
  const [targetList, setTargetList] = useState([]) as any;
  const [diffTargetList, setDiffTargetList] = useState([]) as any;
  const [scenarioCounts, setScenarioCounts] = useState({ d: 0, h: 0, r: 0 }) as any;
  const [scenarioTarget, setScenarioTarget] = useState([]) as any;
  const [editVisible, setEditVisible] = useState(false) as any;
  const [manuelHedefVisible, setManuelHedefVisible] = useState(false) as any;
  const [selectedItem, setSelectedItem] = useState({}) as any;
  const [selectedType, setSelectedType] = useState() as any;
  const [scenarioModel, setScenarioModel] = useState({}) as any;
  const [locale, setLocale] = useState(null as any);
  const navigation = useNavigation();
  const params = props.route.params
  useFocusEffect(
    React.useCallback(() => {
      getLocaleValue();
      if (params && params.id) {
        loadValues()
      }
      loadTargets(params == null || params.id == null);
    }, []),
  )
  const getLocaleValue = async () => {
    var locale = await getLocalize();
    setLocale(locale);
  }
  const loadValues = async () => {
    var model = await getScenarios(params.id);

    setScenarioModel(model);
    setScenarioTarget(JSON.parse(model.targets));

  }
  const loadTargets = async (loadTime: any) => {
    var targets = await getTargetsList();
    setTargetList(targets.filter((t: any) => t.status == Status.ACTIVE));
    var puan = await getTimeList();
    if (puan && puan[0] && loadTime) {
      var model = {
        hedefSure: puan[0].hedefSure,
        doubletapSure: puan[0].doubletapSure,
        rehineSure: puan[0].rehineSure,
        doubletapGecerli: puan[0].doubletapGecerli,
      };
      setScenarioModel(model);
    }
  }


  const renderItem = ({ item, index, drag, isActive }: any) => {
    return (
      <TouchableOpacity
        style={{
          paddingLeft: wp(10),
          paddingRight: wp(10),
          width: wp(160),
        }}
        onLongPress={drag}
      >
        <View key={item.id + "_view"} style={{
          width: "100%",
          flexDirection: "row",
          padding: wp(1), marginTop: hp(5),
          height: wp(20),
          backgroundColor: isActive ? "#FF5609" : item.type == TargetType.Doubletap ? TargetColors.Doubletap : item.type == TargetType.Hedef ? TargetColors.Hedef : TargetColors.Rehine,
          borderRadius: wp(5)
        }}>

          <View style={{ flex: 10, justifyContent: "center", alignItems: "flex-start" }}>
            <Text style={{ fontSize: wp(6), fontWeight: "bold", color: "white" }}> {item.name} {item.type == TargetType.Doubletap ? " ("+L("general.dt",locale)+")" : item.type == TargetType.Rehine ? " ("+L("general.hostage",locale)+")" : " ("+L("general.target",locale)+")"}</Text>

          </View>
          <View style={{ flex: 4, backgroundColor: "white", borderRadius: wp(5), margin: wp(2), padding: wp(2), flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => {

                var lst = [...scenarioTarget];
                var model = lst.find(t => t.id == item.id);

                var guid = generateUUID();
                lst.push({
                  ...model,
                  id: guid
                })
                setScenarioTarget(lst);
              }}

            >
              <FastImage
                style={{ width: hp(30), height: hp(30) }}
                source={require('../images/copy.png')}
                resizeMode={FastImage.resizeMode.contain}
              /></TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setSelectedType(item.type);
                setSelectedItem(item);
                setEditVisible(true)
              }}

            >
              <FastImage
                style={{ width: hp(30), height: hp(30) }}
                source={require('../images/editing.png')}
                resizeMode={FastImage.resizeMode.contain}
              /></TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                var lst = [...scenarioTarget];
                lst = lst.filter(t => t.id != item.id);
                setScenarioTarget(lst);
              }}

            >
              <FastImage
                style={{ width: hp(30), height: hp(30) }}
                source={require('../images/delete.png')}
                resizeMode={FastImage.resizeMode.contain}
              /></TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  const createScenario = () => {
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

    setScenarioTarget(targets)
  }
  const renderDiffTargetItem = (data: any) => {
    var { item } = data;

    return <View flexNone style={{
      paddingLeft: wp(10),
      paddingRight: wp(10),
      width: "100%"
    }}>
      <View key={item.id + "_view"} style={{
        width: "100%",
        padding: wp(5), marginTop: hp(5),
        backgroundColor: "#FFF",
        borderRadius: wp(5),
        borderWidth: 1
      }}>

        <TouchableOpacity style={{ flexDirection: "row" }} onPress={() => {
          selectManuelTarget(item)
        }}>


          <View center>

          </View>
          <View style={{ flex: 10 }}>
            <Text style={{ fontSize: wp(6), fontWeight: "bold", color: "black" }}> {item.name}</Text>

          </View>
          <View style={{ flex: 10 }}>
            <Text style={{ fontSize: wp(6), fontWeight: "bold", textAlign: "right", color: "black" }}> {item.status == Status.ACTIVE ? L('general.active',locale) : L('general.passive',locale)}</Text>

          </View>
        </TouchableOpacity>

      </View>
    </View>

  }
  const findDiffTarget = () => {
    setManuelHedefVisible(true);
    var lst = [] as any;
    targetList.map((t: any) => {
      var item = scenarioTarget.find((x: any) => x.targetId == t.field);
      if (!item) {
        lst.push({ ...t })
      }

    })
    setDiffTargetList(lst)
  }
  const selectManuelTarget = (item: any) => {

    var lst = [...scenarioTarget]
    var guid = generateUUID();
    var model = {
      id: guid,
      name: item.name,
      targetId: item.field,
      message: item.field + "h",
      type: TargetType.Hedef
    }
    lst.push(model)
    setScenarioTarget(lst);
    setManuelHedefVisible(false);
  }
  const saveScenario = async () => {
    var model = { ...scenarioModel };
    var hedefCount = scenarioTarget.filter((t: any) => t.type == TargetType.Hedef).length;
    var dtCount = scenarioTarget.filter((t: any) => t.type == TargetType.Doubletap).length;
    var rCount = scenarioTarget.filter((t: any) => t.type == TargetType.Rehine).length;
    if (!model.name) {
      showMessage({
        message:  L('warning.scenarioname', locale),
        type: "warning",
        position: "top",
        duration: 6000,
      });
      return;
    }
    if (!model.hedefSure) {
      showMessage({
        message: L('warning.targettime', locale),
        type: "warning",
        position: "top",
        duration: 6000,
      });
      return;
    }
    if (!model.doubletapSure) {
      showMessage({
        message: L('warning.dttime', locale),
        type: "warning",
        position: "top",
        duration: 6000,
      });
      return;
    }
    if (!model.rehineSure) {
      showMessage({
        message: L('warning.hostagetime', locale),
        type: "warning",
        position: "top",
        duration: 6000,
      });
      return;
    }
    if (!model.doubletapGecerli) {
      showMessage({
        message: L('warning.dtavailabletime', locale),
        type: "warning",
        position: "top",
        duration: 6000,
      });
      return;
    }
    if (scenarioTarget.length == 0) {
      showMessage({
        message: L('warning.mintarget', locale),
        type: "warning",
        position: "top",
        duration: 6000,
      });
      return;
    }
    model.description = hedefCount + L('general.target',locale) + dtCount + L('general.dt',locale) + rCount + L('general.hostage',locale);
    model.targets = JSON.stringify(scenarioTarget);
    if (model.id) {
      await updateScenarios(model);
    } else {
      await insertScenarios(model);
    }

    showMessage({
      message: L('info.savescenario', locale),
      type: "success",
      position: "top",
      duration: 6000,
    });

    navigation.goBack();
  }
  return (



    <SafeAreaView hideBack style={{ backgroundColor: "#E9EDEE" }} >
      <Header header={'MEMSİM ' +L('header.scenario',locale)}></Header>
      <LoadingLayer ref={loadingLayer} />

      <View style={{ padding: wp(10), flexDirection: "row" }}>

        <View style={{ paddingLeft: wp(10), flexDirection: "row" }}>
          <View style={{ borderRightWidth: 1, borderRightColor: "#9E9E9E", paddingRight: wp(10) }} >
            <View >
              <Text style={styles.welcome}> {L("general.scenarioinfo",locale)}</Text>
              <Text style={styles.desc}> {L('general.availabletarget',locale)} : {targetList.filter((t: any) => t.status == Status.ACTIVE).length}</Text>
              <ScrollView style={{ marginTop: wp(5) }}>

                <InputBox label={L('general.scenarioname',locale)}value={scenarioModel.name} onChangeText={(text) => {
                  var val = { ...scenarioModel };
                  val.name = text;
                  setScenarioModel(val)

                }} />
                <InputBox keyboardType={"decimal"} value={scenarioModel.hedefSure} label={L('general.targetactivetime',locale)} onChangeText={(text) => {
                  var val = { ...scenarioModel };
                  val.hedefSure = text;
                  setScenarioModel(val)
                }} />
                <InputBox keyboardType={"decimal"} value={scenarioModel.doubletapSure} label={L('general.dtactivetime',locale)} onChangeText={(text) => {
                  var val = { ...scenarioModel };
                  val.doubletapSure = text;
                  setScenarioModel(val);
                  val.doubletapSure = text;
                }} />
                <InputBox keyboardType={"decimal"} value={scenarioModel.rehineSure} label={L('general.hostageactivetime',locale)} onChangeText={(text) => {

                  var val = { ...scenarioModel };
                  val.rehineSure = text;
                  setScenarioModel(val);
                }} />

                <InputBox keyboardType={"decimal"} value={scenarioModel.doubletapGecerli} label={L('general.dtcurrentshottime',locale)} onChangeText={(text) => {
                  var val = { ...scenarioModel };
                  if (parseInt(text) < 500) {
                    text = "500";
                  }
                  val.doubletapGecerli = text;
                  setScenarioModel(val);
                }} />

                <Button style={{ marginTop: wp(4) }} label={L('general.save',locale)} onPress={() => { saveScenario(); }} />
                <InputBox keyboardType="numeric" label={L('general.targettcount',locale)} value={scenarioCounts.h} onChangeText={(text) => {

                  var val = { ...scenarioCounts };
                  val.h = text;
                  setScenarioCounts(val)
                }} />
                <InputBox keyboardType="numeric" label={L('general.dtcount',locale)} value={scenarioCounts.d} onChangeText={(text) => {
                  var val = { ...scenarioCounts };
                  val.d = text;
                  setScenarioCounts(val)

                }} />
                <InputBox keyboardType="numeric" label={L('general.hostagecount',locale)}  value={scenarioCounts.r} onChangeText={(text) => {
                  var val = { ...scenarioCounts };
                  val.r = text;
                  setScenarioCounts(val)

                }} />
                <Button style={{ marginTop: wp(4) }} label={L('general.createscenario',locale)} onPress={() => { createScenario(); }} />

              </ScrollView>

            </View>

          </View>
          <View >
            <View style={{ flexDirection: "row" }} >
              <View style={{ flexDirection: "row" }} >
                <View>
                  <Text style={styles.welcome}> {L('general.scenariotarget',locale)}</Text>
                </View>
                <View>

                  <TouchableOpacity style={{ flexDirection: "row", marginLeft: wp(10) }} onPress={() => {
                    findDiffTarget()
                  }}>


                    <FastImage
                      style={{ width: wp(10), height: wp(10) }}
                      source={require('../images/botas/add.webp')}
                      resizeMode={FastImage.resizeMode.contain}
                    />
                  </TouchableOpacity>
                </View>

              </View>


            </View>
            <View style={{ flex: 6 }}>
              <GestureHandlerRootView >
                <DraggableFlatList
                  data={scenarioTarget}
                  renderItem={renderItem}
                  keyExtractor={(item: any) => item.id}
                  onDragEnd={({ data }) => setScenarioTarget(data)}
                />
              </GestureHandlerRootView>
            </View>

          </View>

        </View>



      </View>
      <Modal visible={editVisible} title={L("general.targettype",locale)} onOk={() => {
        var index = scenarioTarget.findIndex((t: any) => t.id == selectedItem.id);
        scenarioTarget[index].type = selectedType;
        if (selectedType == TargetType.Doubletap) {
          scenarioTarget[index].message = scenarioTarget[index].targetId + "d";
        } else if (selectedType == TargetType.Rehine) {
          scenarioTarget[index].message = scenarioTarget[index].targetId + "r";
        } else if (selectedType == TargetType.Hedef) {
          scenarioTarget[index].message = scenarioTarget[index].targetId + "h";
        }
        setScenarioTarget(scenarioTarget);
        setEditVisible(false);
        setSelectedItem({});
        setSelectedType(null)

      }} onCancel={() => { setEditVisible(false) }}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ padding: wp(10) }}>
            <TouchableOpacity
              style={{ backgroundColor: TargetColors.Hedef, padding: wp(10), borderRadius: wp(3), justifyContent: "center", alignItems: "center", borderColor: "black", borderWidth: selectedType == TargetType.Hedef ? 2 : 0 }}
              onPress={() => {
                setSelectedType(TargetType.Hedef)
              }}

            >
              <Text style={{ color: "white", fontWeight: "bold", fontSize: wp(7) }}> {L('general.target',locale)} </Text>
            </TouchableOpacity>
          </View>
          <View style={{ padding: wp(10) }}>
            <TouchableOpacity
              style={{ backgroundColor: TargetColors.Doubletap, padding: wp(10), borderRadius: wp(3), justifyContent: "center", alignItems: "center", borderColor: "black", borderWidth: selectedType == TargetType.Doubletap ? 2 : 0 }}
              onPress={() => {
                setSelectedType(TargetType.Doubletap)
              }}

            >
              <Text style={{ color: "white", fontWeight: "bold", fontSize: wp(7) }}> {L('general.dt',locale)} </Text>
            </TouchableOpacity>
          </View>
          <View style={{ padding: wp(10) }}>
            <TouchableOpacity
              style={{ backgroundColor: TargetColors.Rehine, padding: wp(10), borderRadius: wp(3), justifyContent: "center", alignItems: "center", borderColor: "black", borderWidth: selectedType == TargetType.Rehine ? 2 : 0 }}
              onPress={() => {
                setSelectedType(TargetType.Rehine)
              }}

            >
              <Text style={{ color: "white", fontWeight: "bold", fontSize: wp(7) }}> {L('general.hostage',locale)} </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={manuelHedefVisible} title={L('general.addmanueltarget',locale)} onOk={() => { setManuelHedefVisible(false) }} onCancel={() => {
        setManuelHedefVisible(false)
      }}>
        <View style={{ paddingBottom: wp(14) }}>
          <FlatList
            data={diffTargetList}
            numColumns={1}
            renderItem={renderDiffTargetItem}
            keyExtractor={item => item.id}
          />
        </View>

      </Modal>
    </SafeAreaView >

  )
}

export default React.memo(AddScenario)
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

