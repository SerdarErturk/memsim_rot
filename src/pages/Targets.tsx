


import { useFocusEffect } from '@react-navigation/native';
import { Button, Header, InputBox, LoadingLayer, SafeAreaView, Text, View } from 'components';
import { useNavigation } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { hp, wp } from 'utils/dimension';
import FastImage from 'react-native-fast-image';

import { Radio, RadioGroup } from '@ui-kitten/components';
import { showMessage } from 'react-native-flash-message';
import { deleteTargets, getTargetsList, insertTargets, updateTargets } from 'localdb/targets_repository';
import { Status } from 'utils/enums';
import { getLocalize } from 'utils/auth';
import { L } from 'utils/utility';

function Targets() {
  const navigation = useNavigation();
  const loadingLayer = useRef(null) as any;
  const [selectedTarget, setSelectedTarget] = useState({}) as any;
  const [oldselectedTarget, setOldSelectedTarget] = useState({}) as any;
  const [targetList, setTargetList] = useState([]) as any;
  const [newTarget, setNewTarget] = useState(false) as any;
  const [locale, setLocale] = useState(null as any);
  useFocusEffect(
    React.useCallback(() => {
      getLocaleValue();
      loadTarget();
    }, []),
  )
  const getLocaleValue = async () => {
      var locale=await getLocalize();
       setLocale(locale);
   }
  const loadTarget = async () => {
    var targets = await getTargetsList();
    setTargetList(targets)
  }
  const updateTarget = async () => {
    if (oldselectedTarget.field != selectedTarget.field) {
      var item = targetList.find((t: any) => t.field == selectedTarget.field && t.id != selectedTarget.id);
      if (item) {
        showMessage({
          message: "Bu hedef numarası kullanılmaktadır.",
          type: "danger",
          position: "top",
          duration: 6000,
        });
        return;
      }

    }
    var targetNumber = selectedTarget.field.replace("h", "");
    if (targetNumber.length == 1) {
      targetNumber = "0" + targetNumber
    }
    selectedTarget.name = "H" + targetNumber;
    if (newTarget) {
      delete selectedTarget.id;
      insertTargets(selectedTarget);
    } else {
      updateTargets(selectedTarget);
    }

    loadTarget();
    showMessage({
      message: "Hedef Bilgileri Kayıt Edildi.",
      type: "success",
      position: "top",
      duration: 6000,
    });
    setNewTarget(false)
  }
  const checkTarget = () => {
    var checkModel = [
      { "id": "d5ac0483-13de-469f-a402-8367c5376374", "message": selectedTarget.field+'h', "name":selectedTarget.name, "targetId": selectedTarget.field, "type": 1300001 }, 
      { "id": "fa3b8abe-ed4e-4841-9580-1b688d238f5e", "message": selectedTarget.field+'d', "name": selectedTarget.name, "targetId": selectedTarget.field, "type": 1300003 }, 
      { "id": "9373ee77-8c51-4120-92be-d55101d7e079", "message": selectedTarget.field+'r', "name":selectedTarget.name, "targetId": selectedTarget.field, "type": 1300002 },] as any;


    var model = {
      hedefSure: 3,
      doubletapSure: 3,
      rehineSure: 3,
      doubletapGecerli: 500,
    };
   navigation.navigate("playscenario" as never, { targets: checkModel, times: model } as never)
  }
  const renderItem = (data: any) => {
    var { item } = data;

    return <View flexNone style={{
      paddingLeft: wp(10),
      paddingRight: wp(10),
      width: wp(160)
    }}>
      <View key={item.id + "_view"} style={{
        width: "100%",
        padding: wp(5), marginTop: hp(5),
        backgroundColor: "#FFF",
        borderRadius: wp(5)
      }}>

        <TouchableOpacity style={{ flexDirection: "row" }} onPress={() => {
          setSelectedTarget(item);
          setOldSelectedTarget(item);
          setNewTarget(false)
        }}>


          <View center>

          </View>
          <View style={{ flex: 10 }}>
            <Text style={{ fontSize: wp(6), fontWeight: "bold" ,color:"black" }}> {item.name}</Text>

          </View>
          <View style={{ flex: 10 }}>
            <Text style={{ fontSize: wp(6), fontWeight: "bold", textAlign: "right" ,color:"black"}}> {item.status == Status.ACTIVE ? L('general.active',locale)  : L('general.passive',locale)}</Text>

          </View>
        </TouchableOpacity>

      </View>
    </View>

  }
  const deleteItem = () => {
    deleteTargets(selectedTarget.id);
    setNewTarget(false);
    setSelectedTarget({});
    setOldSelectedTarget({});
    loadTarget();
  }
  return (
    <SafeAreaView hideBack style={{ backgroundColor: "#E9EDEE" }} >
      <Header header={'MEMSIMROT ' + L('header.targetsetting',locale)}></Header>
      <LoadingLayer ref={loadingLayer} />

      <View style={{ padding: wp(10), flexDirection: "row" }}>



        <View center  >
          <Text style={styles.welcome}> {L('general.targets',locale)}</Text>
          <FlatList
            data={targetList}
            numColumns={1}
            renderItem={renderItem}
            keyExtractor={item => item.id}
          />

        </View>


        <ScrollView style={{ paddingLeft: wp(10),flex:1 }}>
          <View center style={{ flexDirection: "row" }} >
            <View >
              <Text style={styles.welcome}> {L('general.targetsinfo',locale)}</Text>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "flex-end", alignItems: "flex-end" }}>
              <TouchableOpacity style={{ flexDirection: "row", marginLeft: wp(10) }} onPress={() => {
              navigation.navigate("newtarget" as never)  
              }}>


                <FastImage
                  style={{ width: wp(10), height: wp(10) }}
                  source={require('../images/botas/add.webp')}
                  resizeMode={FastImage.resizeMode.contain}
                />
              </TouchableOpacity>
              {selectedTarget.id ? <TouchableOpacity style={{ flexDirection: "row", marginLeft: wp(10) }} onPress={() => {
                deleteItem();
              }}>


                <FastImage
                  style={{ width: wp(10), height: wp(10) }}
                  source={require('../images/botas/delete.png')}
                  resizeMode={FastImage.resizeMode.contain}
                />
              </TouchableOpacity> : null}
            </View>

          </View>
          <View style={{ flex: 6 }}>

            <View >

              <InputBox disabled label= { L('general.targetname',locale)} value={selectedTarget.name} onChangeText={(text) => {

                var val = { ...selectedTarget };
                val.name = text;
                setSelectedTarget(val)
              }} />

              <InputBox disabled={newTarget == true ? false : !selectedTarget.id} 
              label={ L('general.targetnumber',locale)} keyboardType={"numeric"} value={selectedTarget.field ? selectedTarget.field.replace("h", "") : ""} onChangeText={(text) => {

                var val = { ...selectedTarget };
                val.field = text + "h";
                setSelectedTarget(val)
              }} />
              <Text style={styles.label}>  { L('general.status',locale)} </Text>

              <RadioGroup

                style={{ justifyContent: "center", alignItems: "center", flexDirection: "row" }}
                selectedIndex={selectedTarget.status == Status.ACTIVE ? 0 : 1}
                onChange={index => {

                  var text = index == 0 ? Status.ACTIVE : Status.PASSIVE
                  var val = { ...selectedTarget };
                  val.status = text;
                  setSelectedTarget(val)
                }}
              >
                <Radio disabled={newTarget == true ? false : !selectedTarget.id}>
                 { L('general.active',locale)} 
                </Radio>
                <Radio disabled={newTarget == true ? false : !selectedTarget.id}>
                { L('general.passive',locale)}  
                </Radio>

              </RadioGroup>

              <Button disabled={newTarget == true ? false : !selectedTarget.id} style={{ marginTop: wp(4) }} label={L('general.save',locale)} onPress={() => { updateTarget(); }} />
              <Button disabled={newTarget == true ? false : !selectedTarget.id} style={{ marginTop: wp(4) }} label={L('general.check',locale)} onPress={() => { checkTarget(); }} />
            </View>

          </View>

        </ScrollView>



      </View>
    </SafeAreaView>

  )
}

export default React.memo(Targets)
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

