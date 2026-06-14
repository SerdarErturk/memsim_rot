


import { useFocusEffect } from '@react-navigation/native';
import { Header, LoadingLayer, SafeAreaView, StopWatch, Text, View } from 'components';
import { useNavigation } from '@react-navigation/native';
import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { hp, wp } from 'utils/dimension';
import { TargetColors, TargetType } from 'utils/enums';
// import BluetoothSerial from 'react-native-bluetooth-serial-next'
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer'
import { BackHandler, TouchableOpacity } from "react-native";
import { } from 'react-native-gesture-handler';
import FastImage from 'react-native-fast-image';
import { getSensors, getSensorsList } from 'localdb/sensors_repository';
import { generateUUID } from 'utils/utils';
import { getPuanList } from 'localdb/puan_repository';
import { showMessage } from 'react-native-flash-message';
import Sound from 'react-native-sound';
import { insertLogs } from 'localdb/log_repository';
import BleManager, { BleEventType } from 'react-native-ble-manager';
import { getBlDevice, getLocalize } from 'utils/auth';
import { bytesToString, stringToBytes } from "convert-string";
import { NativeModules, NativeEventEmitter } from "react-native";
import { L } from 'utils/utility';
Sound.setCategory('Playback');
const tick = require('../images/sound/kisa.mp3');
const uzun = require('../images/sound/uzun.mp3');
let emptyFunction: any;
let passedTime: any;
let timer = {
  start: emptyFunction,
  stop: emptyFunction,
  clear: emptyFunction
};
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
let timeOut = 0 as any;
let blResult = [] as any;
let device = {} as any;
let activeIndex = -1;
function PlayScenario(props: any) {

  const timerRef = useRef(null) as any;
  const checkTimerRef = useRef(null) as any;
  const [targetList, setTargetList] = useState(props.route.params.targets) as any;
  const [timeList, setTimeList] = useState(props.route.params.times) as any;
  const [started, setStartted] = useState(false) as any;
  const [start, setStart] = useState(false) as any;
  const [continou, setContinou] = useState(false) as any;
  const [resultList, setResultList] = useState([]) as any;
  const [stopwatchStart, setStopwatchStart] = useState(false) as any;
  const [stopwatchReset, setStopwatchReset] = useState(false) as any;
  const [score, setScore] = useState("...") as any;
  const [time, setTime] = useState(0) as any;
  const intervalIDRef = React.useRef(null)
  const loadingLayer = useRef(null) as any;
  const navigation = useNavigation();
  const [locale, setLocale] = useState(null as any);

  useEffect(() => {
    getLocaleValue();
    readMessage();
    return () => {
      console.log("okuma kapama");
      bleManagerEmitter.removeAllListeners(BleEventType.BleManagerDidUpdateValueForCharacteristic);
      clearInterval(timeOut);
    };
  }, []);
  const getLocaleValue = async () => {
    var locale = await getLocalize();
    setLocale(locale);
  }
  const readMessage = async () => {
    var dv = await getBlDevice() as any;
    device = dv;
    await BleManager.retrieveServices(dv.id);
    console.log("okuma başlatma");
    BleManager.startNotification(dv?.id, "d564ac02-e906-4b14-88ad-ca841372a59f", "fea6c2d8-bc0d-4ea7-b66c-109eafd24ffc")
      .then(async res => {
        // bleManagerEmitter.addListener(
        //   "BleManagerDidUpdateValueForCharacteristic",
        //   ({ value, peripheral, characteristic, service }) => {
        //     // Convert bytes array to string
        //     const data = bytesToString(value);
        //     console.log(data);
        //      analyzeBlData(data);
        //   }
        // );
        bleManagerEmitter.addListener(
          BleEventType.BleManagerDidUpdateValueForCharacteristic,
          handleUpdateValueForCharacteristic,
        );
      })
      .catch(error => {
        console.log("başlatılamadı");
      });
    // To enable BleManagerDidUpdateValueForCharacteristic listener
    // var result=await BleManager.startNotification(dv.id, "d564ac02-e906-4b14-88ad-ca841372a59f", "fea6c2d8-bc0d-4ea7-b66c-109eafd24ffc");




  }
  const handleUpdateValueForCharacteristic = ({ value, peripheral, characteristic, service }: any) => {

    // Convert bytes array to string
    const data = bytesToString(value);
    console.log(data);
    analyzeBlData(data);

  }
  const writeMessage = async (message: any, deviceId: any) => {
    console.log("Giden=>>> " + message);
    // delay(100);
    const data = stringToBytes(message);
    await BleManager.write(deviceId, "d564ac02-e906-4b14-88ad-ca841372a59f", "fea6c2d8-bc0d-4ea7-b66c-109eafd24ffc", data);

    // await BluetoothSerial.clear();
    // await BluetoothSerial.write(message);
    // const timeElapsed = Date.now();
    // const today = new Date(timeElapsed);
    // var model = {
    //   date: today.toUTCString(),
    //   text:"Giden=>>> "  + message
    // }
    // await insertLogs(model);
  }

  const startGame = async () => {
    clearInterval(timeOut);
    activeIndex = -1;
    setResultList([]);
    blResult = [];
    setScore("...");
    setTime(0)
    passedTime = 0;
    setStartted(false);
    setStart(true);
    setContinou(true);
    timer.clear();
    timer.start();
    var dv = await getBlDevice();
    nexTarget(dv.id);

  }
  const nexTarget = (deviceId?: any) => {
    clearInterval(timeOut);
    let dv = deviceId || device.id;
    activeIndex = activeIndex + 1;
    if (activeIndex >= targetList.length) {
      activeIndex = activeIndex - 1;

      finish(dv);
      return;
    }
    var message = targetList[activeIndex].message;
    var time = 3000;
    if (targetList[activeIndex].type == TargetType.Rehine) {
      time = timeList && timeList.rehineSure ? timeList.rehineSure * 1000 : 1000
    } else if (targetList[activeIndex].type == TargetType.Hedef) {
      time = timeList && timeList.hedefSure ? timeList.hedefSure * 1000 : 3000
    }
    else if (targetList[activeIndex].type == TargetType.Doubletap) {
      time = timeList && timeList.doubletapSure ? timeList.doubletapSure * 1000 : 3000
    }
    writeMessage(message, dv)
    timeOut = setInterval(() => {
      if (activeIndex == targetList.length) {
        activeIndex = activeIndex - 1;
        finish(dv);
      } else {
        blResult.push({ index: activeIndex, result: "-1" })
        closeTarget(dv);

      }

    }, time);

  }
  const closeTarget = (deviceId?: any) => {
    let dv = deviceId || device.id;
    var message = targetList[activeIndex].message;
    message = message.substring(0, message.length - 1);
    message = message + "k";
    writeMessage(message, dv);
    nexTarget(dv);
  }
  const finish = (dv: any) => {
    clearInterval(timeOut);
    stopGame();
    prepareResult(blResult);
    activeIndex = -1;
  }
  const prepareResult = async (data: any) => {
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    var model = {
      date: today.toUTCString(),
      text: "Gelen=>>> " + data
    }
    // await insertLogs(model);
    setStartted(false);

    setStart(false);
    setContinou(false);
    timer.stop();
    var sensorList = await getSensorsList();
    var cezalar = await getPuanList();
    var result = [] as any;
    var ceza = cezalar[0];

    blResult.map((item: any, index: any) => {
      var target = null;
      if (index < targetList.length && item.result.trim() != "") {

        target = targetList[index];
        if (item.result == "-1") {
          var rehinePuan = target.type == TargetType.Rehine ? ceza.rehineVurulmadiPuan : 0;
          result.push({
            id: generateUUID(),
            status: false,
            score: rehinePuan,
            desc: target.type == TargetType.Rehine ? L('general.notshot',locale) : L('general.missing',locale),
            targetName: target.name,
            type: target.type,
          })
        } else {
          if (item.result.indexOf("/") != -1) {
            var sensors = item.result.split("/");
            var dtSure = timeList.doubletapGecerli;
            if (sensors.length > 2) {
              var sensor1 = sensorList.find((t: any) => t.field == sensors[0].trim());
              var sensor2 = sensorList.find((t: any) => t.field == sensors[1].trim());
              if (sensor1 && sensor2) {
                var ms = parseInt(sensors[2]);
                if (ms > timeList.doubletapSure * 4 * 1000) {
                  result.push({
                    id: generateUUID(),
                    status: false,
                    score: 0,
                    desc:  L('general.missing',locale),
                    targetName: target.name,
                    type: target.type,
                  })
                }
                else {
                  var status = ms < dtSure ? true : false;
                  var currrentScore = 0 as any;
                  if (status) {
                    currrentScore = parseInt(sensor1.score) + parseInt(sensor2.score);
                  }
                  result.push({
                    id: generateUUID(),
                    status: status,
                    ms: ms,
                    score: currrentScore,
                    desc: sensor1.displayName + "-" + sensor2.displayName + " (" + ms + " ms)",
                    targetName: target.name,
                    type: target.type,
                  })
                }

              }

            }
          } else {
            var sensor = sensorList.find((t: any) => t.field == item.result.trim());
            if (sensor) {
              if (target.type == TargetType.Rehine) {
                result.push({
                  id: generateUUID(),
                  status: true,
                  score: -ceza.rehineCeza,
                  desc: sensor.displayName,
                  targetName: target.name,
                  type: target.type,
                })
              } else {
                result.push({
                  id: generateUUID(),
                  status: true,
                  score: sensor.score,
                  desc: sensor.displayName,
                  targetName: target.name,
                  type: target.type,
                })
              }

            }

          }

        }
      }

    })
    let score = 0;
    result.map((t: any) => {
      score = score + parseInt(t.score);
    })
    var sureCeza = ((passedTime / 1000) * (ceza.sureCeza / 100)).toFixed(0);
    score = score - parseInt(sureCeza);
    setScore(score)
    setResultList(result)
  }

  const analyzeBlData = async (data: any) => {
    var item = blResult.find((t: any) => t.index == activeIndex);
    if (!item) {
      clearInterval(timeOut);
      blResult.push({ index: activeIndex, result: data.trim() });
      closeTarget();
    }

  }
  const stopGame = (deviceId?: any) => {
    let dv = deviceId || device.id;
    clearInterval(timeOut);
    setStartted(false);
    setStart(false);
    setContinou(false);
    timer.stop();
    delay(2000);
    writeMessage("stp", dv);
    clearInterval(timeOut);

  }
  const delay = (milliseconds: any) => {
    return new Promise((resolve: any, reject: any) => {
      setTimeout(() => {
        resolve();
      }, milliseconds);
    });
  };
  const renderItem = (data: any) => {
    var { item, index } = data;
    const style = {
      backgroundColor: item.type == TargetType.Doubletap ? TargetColors.Doubletap : item.type == TargetType.Hedef ? TargetColors.Hedef : TargetColors.Rehine as any
    }

    return <View flexNone style={{
      width: wp(20),
      margin: wp(2)
    }}>
      <View center style={{ borderWidth: 1, height: wp(18), width: wp(18), borderRadius: wp(2), ...style }}>
        <Text style={{ color: "white", fontWeight: "bold" }}> {item.name}</Text>
      </View>

    </View>

  }

  const renderResult = (data: any) => {
    var { item, index } = data;
    return <View flexNone style={{
      margin: wp(2)
    }}>
      <View center style={{ borderWidth: 1, height: wp(20), borderRadius: wp(2), flexDirection: "row" }}>
        <View style={{ flex: 2, flexDirection: "row" }}>
          <Text style={{ fontSize: wp(8), color: item.type == TargetType.Doubletap ? TargetColors.Doubletap : item.type == TargetType.Hedef ? TargetColors.Hedef : TargetColors.Rehine, fontWeight: "bold" }}> {item.targetName}</Text>


        </View>
        <View center style={{ flex: 4, flexDirection: "row" }}>
          <View style={{ flex: 1, flexDirection: "row" }}>
            <Text style={{ color: "#3F4DB8", fontWeight: "bold", textAlign: "left", justifyContent: "flex-start" }}>  {item.desc}
            </Text>
          </View>



        </View>
        <View style={{ flex: 2, flexDirection: "row" }}>
          <Text style={{ fontWeight: "bold", textAlign: "right", fontSize: wp(7), color: "black" }}>  {item.score < 0 ? item.score : item.score} Puan</Text>
        </View>
        <View style={{ flex: 3, flexDirection: "row" }}>
          {item.status ?
            <Text style={{ color: item.type == TargetType.Rehine ? "red" : "green", fontWeight: "bold" }}> {L('general.shot',locale)} </Text> :
            <Text style={{ color: item.type != TargetType.Rehine ? "red" : "green", fontWeight: "bold" }}> {item.type == TargetType.Rehine ? L('general.notshot',locale) : L('general.missing',locale)} {item.ms ? item.ms + " ms" : ""}</Text>}
        </View>

      </View>

    </View>

  }
  const millisToMinutesAndSeconds = (millis: any) => {
    var minutes = Math.floor(millis / 60000) as any;
    var seconds = ((millis % 60000) / 1000).toFixed(0) as any;
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
  }

  return (
    <SafeAreaView hideBack style={{ backgroundColor: "#E9EDEE" }} >
      <Header header={'MEMSİM '+L('header.game',locale)}></Header>
      <LoadingLayer ref={loadingLayer} />

      <View style={{ padding: wp(10) }}>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flex: 2 }}>


            <FlatList
              horizontal
              data={targetList}
              renderItem={renderItem}
              keyExtractor={item => item.id}
            />
          </View>
          <View center>
            <StopWatch timer={timer} onFinish={(time: any) => {
              passedTime = time;
              setTime(time)
            }} />
          </View>
        </View>

        <View center style={{ flex: 5, padding: wp(10) }}>

          {started ? <CountdownCircleTimer
            isPlaying
            duration={5}
            colors={['#004777', '#F7B801', '#A30000', '#A30000']}
            colorsTime={[7, 5, 2, 0]}
            onUpdate={(remainingTime) => {
              let dv = device.id;
              writeMessage("start", dv);
              if (remainingTime == 1) {
                var audio = uzun;
                var buttonPress = new Sound(audio, (e) => {
                  if (e) { } buttonPress.play(() => {
                    buttonPress.release()
                  });
                });
              } else if (remainingTime != 0) {
                var audio = tick;
                var buttonPress = new Sound(audio, (e) => {
                  if (e) { } buttonPress.play(() => {
                    buttonPress.release()
                  });
                });
              }

            }}
            onComplete={() => {

              startGame()
            }}
          >
            {({ remainingTime }) => <Text style={{ fontSize: wp(30), color: "black" }}>{remainingTime}</Text>}
          </CountdownCircleTimer> :

            <View style={{ flexDirection: "row" }} >
              <View style={{ padding: wp(4) }}>

                <View style={{ padding: wp(4) }}>
                  <Text style={{ textAlign: "center", color: "black" }}> {L("general.score",locale)}</Text>
                  <View style={{}}>

                    <View center style={{ backgroundColor: "red", borderRadius: wp(3) }}>
                      <Text style={{ color: "white", fontWeigth: "bold", fontSize: wp(15) }}> {score} </Text>
                      <Text style={{ color: "white", fontWeigth: "bold", fontSize: wp(5) }}> {millisToMinutesAndSeconds(time)} </Text>

                    </View>
                  </View>
                </View>
                <View style={{ padding: wp(4) }}>
                  <Text style={{ textAlign: "center", color: "black" }}> {L('general.actions',locale)}</Text>
                  <View style={{ flexDirection: "row" }}>

                    {!started && !continou ? <View center style={{ borderRadius: wp(3) }}>
                      <TouchableOpacity style={[styles.btn]} onPress={async () => {
                        var device = await getBlDevice() as any;
                        if (device && device.name) {
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
                        } else {
                          showMessage({
                            message: L('warning.connection',locale),
                            type: "danger",
                            position: "top",
                            duration: 6000,
                          });
                          return;
                        }

                        setStartted(true)
                      }} >
                        <FastImage
                          style={{ width: hp(80), height: hp(80) }}
                          source={require('../images/power.png')}
                          resizeMode={FastImage.resizeMode.contain}

                        />
                        <Text style={styles.btnsubtext}>
                          {L('general.start',locale)}
                        </Text>

                      </TouchableOpacity>
                    </View> : <View center style={{ borderRadius: wp(3) }}>
                      <TouchableOpacity style={[styles.btn]} onPress={() => { stopGame(); }} >
                        <FastImage
                          style={{ width: hp(80), height: hp(80) }}
                          source={require('../images/power-on.png')}
                          resizeMode={FastImage.resizeMode.contain}
                        />
                        <Text style={styles.btnsubtext}>
                        {L('general.stop',locale)} 
                        </Text>

                      </TouchableOpacity>
                    </View>}

                  </View>
                </View>
              </View>
              <View style={{ flex: 2, padding: wp(4) }}>
                <View >
                  <Text style={{ color: "black" }}>   {L('general.shotdetail',locale)} </Text>
                  <FlatList
                    data={resultList}
                    numColumns={1}
                    renderItem={renderResult}
                    keyExtractor={item => item.id}
                  />
                </View>
              </View>
            </View>
          }


        </View>


      </View>
    </SafeAreaView>

  )
}

export default React.memo(PlayScenario)
const styles = StyleSheet.create({


  welcome: {
    color: "#39464E",
    fontSize: wp(10),
    fontFamily: "Narin-Medium",
    marginTop: hp(10),
  },
  name: {
    color: "#39464E",
    fontSize: wp(12),
    fontFamily: "Narin-Bold",
    marginTop: hp(10),
    maxWidth: '50%',

  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  }
  , btn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",

  },
  btnsubtext: {
    color: "#39464E",
    fontSize: hp(22),
    fontFamily: "Narin-Medium"
  },
  btntext: {
    color: "#39464E",
    fontSize: hp(20),
    fontFamily: "Narin-Bold"
  },
  registertext: {
    color: "#39464E",
    fontSize: hp(20),
    fontFamily: "Narin-Bold",
  }
});

