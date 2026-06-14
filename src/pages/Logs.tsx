


import { useFocusEffect } from '@react-navigation/native';
import { Button, Header, InputBox, LoadingLayer, SafeAreaView, Text, View } from 'components';
import { useNavigation } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { hp, wp } from 'utils/dimension';
import FastImage from 'react-native-fast-image';

import { Radio, RadioGroup } from '@ui-kitten/components';
import { showMessage } from 'react-native-flash-message';
import { deleteTargets, getTargetsList, insertTargets, updateTargets } from 'localdb/targets_repository';
import { Status } from 'utils/enums';
import { deleteAllLogs, getLogsList } from 'localdb/log_repository';

function Logs() {

  const loadingLayer = useRef(null) as any;
  const [selectedTarget, setSelectedTarget] = useState({}) as any;
  const [oldselectedTarget, setOldSelectedTarget] = useState({}) as any;
  const [targetList, setTargetList] = useState([]) as any;
  const [newTarget, setNewTarget] = useState(false) as any;

  useFocusEffect(
    React.useCallback(() => {
      loadTarget();
    }, []),
  )
  const loadTarget = async () => {
    var targets = await getLogsList();
    setTargetList([...targets])
  }

  const clearLogs = async () => {
    await deleteAllLogs();
    loadTarget();
  }
  const renderItem = (data: any) => {
    var { item } = data;

    return <View flexNone style={{
      paddingLeft: wp(10),
      paddingRight: wp(10),
      width: wp(300)
    }}>
      <View key={item.id + "_view"} style={{
        width: "100%",
        padding: wp(5), marginTop: hp(5),
        backgroundColor: "#FFF",
        borderRadius: wp(5)
      }}>




        <View style={{ flexDirection: "row" }}>


          <View style={{ flex: 10 }}>
            <Text style={{ fontSize: wp(6), fontWeight: "bold",color:"black" }}> {item.date}</Text>

          </View>
          <View style={{ flex: 15 }}>
            <Text style={{ fontSize: wp(6), fontWeight: "bold" ,color:"black"}}> {item.text}</Text>
          </View>
        </View>

      </View>
    </View>

  }

  return (
    <SafeAreaView hideBack style={{ backgroundColor: "#E9EDEE" }} >
      <Header header='MEMSİM LOGLAR'></Header>
      <LoadingLayer ref={loadingLayer} />

      <View style={{ padding: wp(10), flexDirection: "row" }}>



        <View center  >
          <Text style={styles.welcome}> Log Kayıtları</Text>
          <FlatList
            data={targetList}
            numColumns={1}
            renderItem={renderItem}
            keyExtractor={item => item.id}
          />
          <Button style={{ width: "100%" }} label={"Temizle"} onPress={() => { clearLogs() }} />
        </View>





      </View>
    </SafeAreaView>

  )
}

export default React.memo(Logs)
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

