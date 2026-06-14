import { Header, LoadingLayer, SafeAreaView, StopWatch, Text, View } from 'components';
import { useNavigation } from '@react-navigation/native';
import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { hp, wp } from 'utils/dimension';
import { TargetColors, TargetType } from 'utils/enums';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import FastImage from 'react-native-fast-image';
import { getSensorsList } from 'localdb/sensors_repository';
import { getTargetsList } from 'localdb/targets_repository';
import { generateUUID } from 'utils/utils';
import { getPuanList } from 'localdb/puan_repository';
import { showMessage } from 'react-native-flash-message';
import Sound from 'react-native-sound';
import BleManager, { BleEventType } from 'react-native-ble-manager';
import { getBlDevice, getLocalize } from 'utils/auth';
import { bytesToString, stringToBytes } from 'convert-string';
import { NativeModules, NativeEventEmitter } from 'react-native';
import { L } from 'utils/utility';

Sound.setCategory('Playback');

const tick = require('../images/sound/kisa.mp3');
const uzun = require('../images/sound/uzun.mp3');

const SERVICE_UUID = 'd564ac02-e906-4b14-88ad-ca841372a59f';
const CHARACTERISTIC_UUID = 'fea6c2d8-bc0d-4ea7-b66c-109eafd24ffc';

const POSITION_TARGET = 1;
const POSITION_PASSIVE = 2;
const POSITION_HOSTAGE = 3;

let emptyFunction: any;

let passedTime: any;

let timer = {
  start: emptyFunction,
  stop: emptyFunction,
  clear: emptyFunction,
};

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

let timeOut = 0 as any;
let device = {} as any;

let currentSeriesIndex = -1;
let blResult = [] as any;
let resolvedTargetIds = [] as any;

function PlayScenario(props: any) {
  const navigation = useNavigation();
  const loadingLayer = useRef(null) as any;

  const [seriesList, setSeriesList] = useState(props.route.params.series || []) as any;
  const [timeList, setTimeList] = useState(props.route.params.times) as any;

  const [allTargetList, setAllTargetList] = useState([]) as any;
  const [currentSeriesItems, setCurrentSeriesItems] = useState([]) as any;

  const [started, setStartted] = useState(false) as any;
  const [start, setStart] = useState(false) as any;
  const [continou, setContinou] = useState(false) as any;

  const [resultList, setResultList] = useState([]) as any;
  const [score, setScore] = useState('...') as any;
  const [time, setTime] = useState(0) as any;
  const [locale, setLocale] = useState(null as any);

  useEffect(() => {
    getLocaleValue();
    loadTargets();
    readMessage();

    return () => {
      bleManagerEmitter.removeAllListeners(
        BleEventType.BleManagerDidUpdateValueForCharacteristic,
      );
      clearTimeout(timeOut);
    };
  }, []);

  const getLocaleValue = async () => {
    const localeValue = await getLocalize();
    setLocale(localeValue);
  };

  const loadTargets = async () => {
    const targets = await getTargetsList();

    const activeTargets = targets
      .filter((t: any) => t.status === 1)
      .sort((a: any, b: any) => {
        const aNo = getTargetNo(a.field);
        const bNo = getTargetNo(b.field);
        return aNo - bNo;
      });

    setAllTargetList(activeTargets);
  };

  const readMessage = async () => {
    const dv = (await getBlDevice()) as any;

    if (!dv || !dv.id) {
      return;
    }

    device = dv;

    try {
      await BleManager.retrieveServices(dv.id);

      BleManager.startNotification(dv.id, SERVICE_UUID, CHARACTERISTIC_UUID)
        .then(() => {
          bleManagerEmitter.addListener(
            BleEventType.BleManagerDidUpdateValueForCharacteristic,
            handleUpdateValueForCharacteristic,
          );
        })
        .catch(() => {
          console.log('BLE notification başlatılamadı');
        });
    } catch (error) {
      console.log('BLE readMessage error:', error);
    }
  };

  const handleUpdateValueForCharacteristic = ({ value }: any) => {
    const data = bytesToString(value);
    console.log('Gelen=>>> ' + data);
    analyzeBlData(data);
  };

const writeMessage = async (message: any, deviceId: any) => {
  if (!deviceId) {
    return;
  }

  try {
    /**
     * KRİTİK:
     * BLE uzun mesajları parçalayabilir.
     * Merkez ESP, '\n' karakterini görünce mesajı tamamlandı kabul edecek.
     */
    const packet = String(message).endsWith('\n')
      ? String(message)
      : String(message) + '\n';

    // Logda \n görünsün diye JSON.stringify kullanıyoruz.
    console.log('Giden=>>> ' + JSON.stringify(packet));

    const data = stringToBytes(packet);

    await BleManager.write(
      deviceId,
      SERVICE_UUID,
      CHARACTERISTIC_UUID,
      data,
    );
  } catch (error) {
    console.log('BLE write error:', error);

    showMessage({
      message: 'Komut gönderilemedi.',
      type: 'danger',
      position: 'top',
      duration: 4000,
    });
  }
};

  const delay = (milliseconds: any) => {
    return new Promise((resolve: any) => {
      setTimeout(() => {
        resolve();
      }, milliseconds);
    });
  };

  const pad3 = (value: any) => {
    const n = parseInt(value, 10);

    if (n < 10) {
      return '00' + n;
    }

    if (n < 100) {
      return '0' + n;
    }

    return String(n);
  };

  const createStepId = () => {
    return `S${String(Date.now() % 1000).padStart(3, '0')}`;
  };

  const getTargetNo = (targetId: any) => {
    if (!targetId) {
      return 0;
    }

    return parseInt(String(targetId).replace('H', ''), 10);
  };

  const getTotalTargetCount = () => {
    if (allTargetList && allTargetList.length > 0) {
      return allTargetList.length;
    }

    let maxNo = 0;

    seriesList.forEach((series: any) => {
      if (series && series.items) {
        series.items.forEach((item: any) => {
          const no = getTargetNo(item.targetId);
          if (no > maxNo) {
            maxNo = no;
          }
        });
      }
    });

    return maxNo || 1;
  };

  const buildPassiveData = () => {
    const count = getTotalTargetCount();
    return Array(count).fill(String(POSITION_PASSIVE)).join('');
  };

  const buildSeriesPositionData = (series: any) => {
    const count = getTotalTargetCount();

    // Varsayılan herkes pasif P2
    const data = Array(count).fill(String(POSITION_PASSIVE));

    if (!series || !series.items) {
      return data.join('');
    }

    series.items.forEach((item: any) => {
      const targetNo = getTargetNo(item.targetId);
      const index = targetNo - 1;

      if (index < 0 || index >= count) {
        return;
      }

      // İşi biten hedefler pasife döner.
      if (resolvedTargetIds.includes(item.targetId)) {
        data[index] = String(POSITION_PASSIVE);
        return;
      }

      if (item.type === TargetType.Rehine) {
        data[index] = String(POSITION_HOSTAGE);
      } else {
        data[index] = String(POSITION_TARGET);
      }
    });

    return data.join('');
  };

  const sendBulkData = async (positionData: string, deviceId?: any) => {
    const dv = deviceId || device.id;

    if (!dv) {
      return;
    }

    const stepId = createStepId();
    const count = positionData.length;

    const bulkMessage =
      `B;${stepId};` +
      `R001;` +
      `N${pad3(count)};` +
      `D:${positionData}`;

    await writeMessage(bulkMessage, dv);

    await delay(120);

    await writeMessage(`GO;${stepId}`, dv);
  };

  const sendPassiveAll = async (deviceId?: any) => {
    const data = buildPassiveData();
    await sendBulkData(data, deviceId);
  };

  const getSeriesDuration = (series: any) => {
    if (!series || !series.items || series.items.length === 0) {
      return 3000;
    }

    const hasHostage = series.items.some((x: any) => x.type === TargetType.Rehine);
    const hasTarget = series.items.some((x: any) => x.type !== TargetType.Rehine);

    const hedefMs =
      timeList && timeList.hedefSure ? parseFloat(timeList.hedefSure) * 1000 : 3000;

    const rehineMs =
      timeList && timeList.rehineSure ? parseFloat(timeList.rehineSure) * 1000 : 1000;

    if (hasHostage && hasTarget) {
      return Math.max(hedefMs, rehineMs);
    }

    if (hasHostage) {
      return rehineMs;
    }

    return hedefMs;
  };

  const startGame = async () => {
    clearTimeout(timeOut);

    currentSeriesIndex = -1;
    blResult = [];
    resolvedTargetIds = [];

    setResultList([]);
    setCurrentSeriesItems([]);
    setScore('...');
    setTime(0);

    passedTime = 0;

    setStartted(false);
    setStart(true);
    setContinou(true);

    timer.clear();
    timer.start();

    const dv = await getBlDevice();

    if (!dv || !dv.id) {
      showMessage({
        message: L('warning.connection', locale),
        type: 'danger',
        position: 'top',
        duration: 6000,
      });
      return;
    }

    device = dv;

    await sendPassiveAll(dv.id);
    await delay(200);

    nextSeries(dv.id);
  };

  const nextSeries = async (deviceId?: any) => {
    clearTimeout(timeOut);

    const dv = deviceId || device.id;

    currentSeriesIndex = currentSeriesIndex + 1;
    resolvedTargetIds = [];

    if (currentSeriesIndex >= seriesList.length) {
      finish(dv);
      return;
    }

    const currentSeries = seriesList[currentSeriesIndex];

    setCurrentSeriesItems(currentSeries.items || []);

    const positionData = buildSeriesPositionData(currentSeries);

    await sendBulkData(positionData, dv);

    const duration = getSeriesDuration(currentSeries);

    timeOut = setTimeout(async () => {
      await closeCurrentSeries(dv);
    }, duration);
  };

  const closeCurrentSeries = async (deviceId?: any) => {
    clearTimeout(timeOut);

    const dv = deviceId || device.id;
    const currentSeries = seriesList[currentSeriesIndex];

    if (!currentSeries || !currentSeries.items) {
      await nextSeries(dv);
      return;
    }

    currentSeries.items.forEach((item: any) => {
      const already = blResult.find(
        (x: any) =>
          x.seriesIndex === currentSeriesIndex &&
          x.targetId === item.targetId,
      );

      if (!already) {
        blResult.push({
          seriesIndex: currentSeriesIndex,
          targetId: item.targetId,
          result: '-1',
        });
      }
    });

    await sendPassiveAll(dv);
    await delay(200);

    await nextSeries(dv);
  };

  const finish = async (dv: any) => {
    clearTimeout(timeOut);

    await sendPassiveAll(dv);

    stopGame(dv, false);

    prepareResult(blResult);

    currentSeriesIndex = -1;
    resolvedTargetIds = [];
    setCurrentSeriesItems([]);
  };

  const extractTargetIdFromMessage = (data: string) => {
    const message = data.trim();

    /**
     * Node'dan beklenen örnek:
     * PZ;H001
     */
    if (message.startsWith('PZ;')) {
      const parts = message.split(';');
      return parts.length > 1 ? parts[1].trim() : '';
    }

    /**
     * Eski veya sade mesaj gelirse:
     * H001
     */
    if (message.startsWith('H')) {
      return message.trim();
    }

    return '';
  };

  const analyzeBlData = async (data: any) => {
    const message = String(data || '').trim();

    if (!message) {
      return;
    }

    // ACK / DONE / HELLO skor verisi değil, yok sayıyoruz.
    if (
      message.startsWith('ACK;') ||
      message.startsWith('DONE;') ||
      message.startsWith('HELLO;')
    ) {
      return;
    }

    const targetId = extractTargetIdFromMessage(message);

    if (!targetId) {
      return;
    }

    const currentSeries = seriesList[currentSeriesIndex];

    if (!currentSeries || !currentSeries.items) {
      return;
    }

    const activeItem = currentSeries.items.find(
      (x: any) => x.targetId === targetId,
    );

    // O seride olmayan bir hedef vurulduysa şimdilik yok sayıyoruz.
    if (!activeItem) {
      return;
    }

    const already = blResult.find(
      (x: any) =>
        x.seriesIndex === currentSeriesIndex &&
        x.targetId === targetId,
    );

    if (already) {
      return;
    }

    blResult.push({
      seriesIndex: currentSeriesIndex,
      targetId,
      result: 'PZ1',
    });

    resolvedTargetIds.push(targetId);

    const unresolved = currentSeries.items.filter((item: any) => {
      return !resolvedTargetIds.includes(item.targetId);
    });

    if (unresolved.length === 0) {
      clearTimeout(timeOut);
      await closeCurrentSeries();
      return;
    }

    // İşi biten hedef P2'ye dönsün, diğerleri aynı seride aktif kalsın.
    const positionData = buildSeriesPositionData(currentSeries);
    await sendBulkData(positionData);
  };

  const stopGame = async (deviceId?: any, sendPassive: boolean = true) => {
    const dv = deviceId || device.id;

    clearTimeout(timeOut);

    setStartted(false);
    setStart(false);
    setContinou(false);

    timer.stop();

    if (sendPassive) {
      await sendPassiveAll(dv);
    }
  };

  const prepareResult = async (data: any) => {
    setStartted(false);
    setStart(false);
    setContinou(false);

    timer.stop();

    const sensorList = await getSensorsList();
    const cezalar = await getPuanList();

    const ceza = cezalar && cezalar[0] ? cezalar[0] : {
      rehineCeza: 0,
      sureCeza: 0,
      rehineVurulmadiPuan: 0,
    };

    const result = [] as any;

    data.map((item: any) => {
      const series = seriesList[item.seriesIndex];

      if (!series || !series.items) {
        return;
      }

      const target = series.items.find((x: any) => x.targetId === item.targetId);

      if (!target) {
        return;
      }

      if (item.result === '-1') {
        const rehinePuan =
          target.type === TargetType.Rehine
            ? parseInt(ceza.rehineVurulmadiPuan || 0, 10)
            : 0;

        result.push({
          id: generateUUID(),
          status: false,
          score: rehinePuan,
          desc:
            target.type === TargetType.Rehine
              ? L('general.notshot', locale)
              : L('general.missing', locale),
          targetName: `${series.name} - ${target.name}`,
          type: target.type,
        });

        return;
      }

      const sensor = sensorList.find((t: any) => t.field === item.result.trim());

      if (!sensor) {
        return;
      }

      if (target.type === TargetType.Rehine) {
        result.push({
          id: generateUUID(),
          status: true,
          score: -parseInt(ceza.rehineCeza || 0, 10),
          desc: sensor.displayName,
          targetName: `${series.name} - ${target.name}`,
          type: target.type,
        });
      } else {
        result.push({
          id: generateUUID(),
          status: true,
          score: parseInt(sensor.score || 0, 10),
          desc: sensor.displayName,
          targetName: `${series.name} - ${target.name}`,
          type: target.type,
        });
      }
    });

    let totalScore = 0;

    result.map((t: any) => {
      totalScore = totalScore + parseInt(t.score || 0, 10);
    });

    const sureCeza = ((passedTime / 1000) * (parseInt(ceza.sureCeza || 0, 10) / 100)).toFixed(0);

    totalScore = totalScore - parseInt(sureCeza || '0', 10);

    setScore(totalScore);
    setResultList(result);
  };

  const getTypeColor = (type: any) => {
    if (type === TargetType.Rehine) {
      return TargetColors.Rehine;
    }

    return TargetColors.Hedef;
  };

  const renderItem = (data: any) => {
    const { item } = data;

    const style = {
      backgroundColor: getTypeColor(item.type) as any,
    };

    return (
      <View
        flexNone
        style={{
          width: wp(24),
          margin: wp(2),
        }}
      >
        <View
          center
          style={{
            borderWidth: 1,
            height: wp(18),
            width: wp(22),
            borderRadius: wp(2),
            ...style,
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            {item.name}
          </Text>
        </View>
      </View>
    );
  };

  const renderSeriesPreview = (data: any) => {
    const { item } = data;

    return (
      <View
        style={{
          padding: wp(4),
          marginRight: wp(4),
          backgroundColor: '#FFF',
          borderRadius: wp(4),
          borderWidth: 1,
          borderColor: '#DDD',
        }}
      >
        <Text style={{ color: '#39464E', fontWeight: 'bold', fontSize: wp(5) }}>
          {item.name}
        </Text>

        <Text style={{ color: '#39464E', fontSize: wp(4) }}>
          {(item.items || []).length} hedef
        </Text>
      </View>
    );
  };

  const renderResult = (data: any) => {
    const { item } = data;

    return (
      <View
        flexNone
        style={{
          margin: wp(2),
        }}
      >
        <View
          center
          style={{
            borderWidth: 1,
            height: wp(20),
            borderRadius: wp(2),
            flexDirection: 'row',
          }}
        >
          <View style={{ flex: 2, flexDirection: 'row' }}>
            <Text
              style={{
                fontSize: wp(6),
                color: getTypeColor(item.type),
                fontWeight: 'bold',
              }}
            >
              {item.targetName}
            </Text>
          </View>

          <View center style={{ flex: 4, flexDirection: 'row' }}>
            <View style={{ flex: 1, flexDirection: 'row' }}>
              <Text
                style={{
                  color: '#3F4DB8',
                  fontWeight: 'bold',
                  textAlign: 'left',
                  justifyContent: 'flex-start',
                }}
              >
                {item.desc}
              </Text>
            </View>
          </View>

          <View style={{ flex: 2, flexDirection: 'row' }}>
            <Text
              style={{
                fontWeight: 'bold',
                textAlign: 'right',
                fontSize: wp(7),
                color: 'black',
              }}
            >
              {item.score} Puan
            </Text>
          </View>

          <View style={{ flex: 3, flexDirection: 'row' }}>
            {item.status ? (
              <Text
                style={{
                  color: item.type === TargetType.Rehine ? 'red' : 'green',
                  fontWeight: 'bold',
                }}
              >
                {L('general.shot', locale)}
              </Text>
            ) : (
              <Text
                style={{
                  color: item.type !== TargetType.Rehine ? 'red' : 'green',
                  fontWeight: 'bold',
                }}
              >
                {item.type === TargetType.Rehine
                  ? L('general.notshot', locale)
                  : L('general.missing', locale)}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  const millisToMinutesAndSeconds = (millis: any) => {
    const minutes = Math.floor(millis / 60000) as any;
    const seconds = ((millis % 60000) / 1000).toFixed(0) as any;

    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  };

  return (
    <SafeAreaView hideBack style={{ backgroundColor: '#E9EDEE' }}>
      <Header header={'MEMSIMROT ' + L('header.game', locale)} />
      <LoadingLayer ref={loadingLayer} />

      <View style={{ padding: wp(10) }}>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 2 }}>
            {currentSeriesItems && currentSeriesItems.length > 0 ? (
              <FlatList
                horizontal
                data={currentSeriesItems}
                renderItem={renderItem}
                keyExtractor={(item: any) => item.id}
              />
            ) : (
              <FlatList
                horizontal
                data={seriesList}
                renderItem={renderSeriesPreview}
                keyExtractor={(item: any) => item.id}
              />
            )}
          </View>

          <View center>
            <StopWatch
              timer={timer}
              onFinish={(value: any) => {
                passedTime = value;
                setTime(value);
              }}
            />
          </View>
        </View>

        <View center style={{ flex: 5, padding: wp(10) }}>
          {started ? (
            <CountdownCircleTimer
              isPlaying
              duration={5}
              colors={['#004777', '#F7B801', '#A30000', '#A30000']}
              colorsTime={[7, 5, 2, 0]}
              onUpdate={(remainingTime) => {
                if (remainingTime === 1) {
                  const buttonPress = new Sound(uzun, (e) => {
                    if (e) {
                    }

                    buttonPress.play(() => {
                      buttonPress.release();
                    });
                  });
                } else if (remainingTime !== 0) {
                  const buttonPress = new Sound(tick, (e) => {
                    if (e) {
                    }

                    buttonPress.play(() => {
                      buttonPress.release();
                    });
                  });
                }
              }}
              onComplete={() => {
                startGame();
              }}
            >
              {({ remainingTime }) => (
                <Text style={{ fontSize: wp(30), color: 'black' }}>
                  {remainingTime}
                </Text>
              )}
            </CountdownCircleTimer>
          ) : (
            <View style={{ flexDirection: 'row' }}>
              <View style={{ padding: wp(4) }}>
                <View style={{ padding: wp(4) }}>
                  <Text style={{ textAlign: 'center', color: 'black' }}>
                    {L('general.score', locale)}
                  </Text>

                  <View>
                    <View center style={{ backgroundColor: 'red', borderRadius: wp(3) }}>
                      <Text
                        style={{
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: wp(15),
                        }}
                      >
                        {score}
                      </Text>

                      <Text
                        style={{
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: wp(5),
                        }}
                      >
                        {millisToMinutesAndSeconds(time)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={{ padding: wp(4) }}>
                  <Text style={{ textAlign: 'center', color: 'black' }}>
                    {L('general.actions', locale)}
                  </Text>

                  <View style={{ flexDirection: 'row' }}>
                    {!started && !continou ? (
                      <View center style={{ borderRadius: wp(3) }}>
                        <TouchableOpacity
                          style={[styles.btn]}
                          onPress={async () => {
                            const dv = (await getBlDevice()) as any;

                            if (dv && dv.name) {
                              const isConnected = await BleManager.isPeripheralConnected(
                                dv.id,
                                [],
                              );

                              if (!isConnected) {
                                showMessage({
                                  message: L('warning.connection', locale),
                                  type: 'danger',
                                  position: 'top',
                                  duration: 6000,
                                });
                                return;
                              }

                              device = dv;
                            } else {
                              showMessage({
                                message: L('warning.connection', locale),
                                type: 'danger',
                                position: 'top',
                                duration: 6000,
                              });
                              return;
                            }

                            setStartted(true);
                          }}
                        >
                          <FastImage
                            style={{ width: hp(80), height: hp(80) }}
                            source={require('../images/power.png')}
                            resizeMode={FastImage.resizeMode.contain}
                          />

                          <Text style={styles.btnsubtext}>
                            {L('general.start', locale)}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View center style={{ borderRadius: wp(3) }}>
                        <TouchableOpacity
                          style={[styles.btn]}
                          onPress={() => {
                            stopGame();
                          }}
                        >
                          <FastImage
                            style={{ width: hp(80), height: hp(80) }}
                            source={require('../images/power-on.png')}
                            resizeMode={FastImage.resizeMode.contain}
                          />

                          <Text style={styles.btnsubtext}>
                            {L('general.stop', locale)}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              <View style={{ flex: 2, padding: wp(4) }}>
                <View>
               
                </View>
              </View>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

export default React.memo(PlayScenario);

const styles = StyleSheet.create({
  welcome: {
    color: '#39464E',
    fontSize: wp(10),
    fontFamily: 'Narin-Medium',
    marginTop: hp(10),
  },
  name: {
    color: '#39464E',
    fontSize: wp(12),
    fontFamily: 'Narin-Bold',
    marginTop: hp(10),
    maxWidth: '50%',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  btn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnsubtext: {
    color: '#39464E',
    fontSize: hp(22),
    fontFamily: 'Narin-Medium',
  },
  btntext: {
    color: '#39464E',
    fontSize: hp(20),
    fontFamily: 'Narin-Bold',
  },
  registertext: {
    color: '#39464E',
    fontSize: hp(20),
    fontFamily: 'Narin-Bold',
  },
});