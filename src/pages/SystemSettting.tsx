import { Header, LoadingLayer, SafeAreaView, Text, View } from 'components';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { hp, wp } from 'utils/dimension';
import FastImage from 'react-native-fast-image';
import { getBlDevice, getLocalize } from 'utils/auth';
import { getTargetsList } from 'localdb/targets_repository';
import BleManager from 'react-native-ble-manager';
import { stringToBytes } from 'convert-string';
import { NativeModules, NativeEventEmitter } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { Status } from 'utils/enums';
import { L } from 'utils/utility';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const SERVICE_UUID = 'd564ac02-e906-4b14-88ad-ca841372a59f';
const CHARACTERISTIC_UUID = 'fea6c2d8-bc0d-4ea7-b66c-109eafd24ffc';

let timeOutList: any[] = [];

function Settings() {
  const loadingLayer = useRef(null) as any;
  const navigation = useNavigation();

  const [locale, setLocale] = useState(null as any);
  const [targetList, setTargetList] = useState([] as any);

  useEffect(() => {
    getLocaleValue();
    loadTargetList();

    return () => {
      bleManagerEmitter.removeAllListeners(
        'BleManagerDidUpdateValueForCharacteristic',
      );
      clearAllTimeouts();
    };
  }, []);

  const clearAllTimeouts = () => {
    timeOutList.forEach((t) => clearTimeout(t));
    timeOutList = [];
  };

  const addTimeout = (callback: () => void, ms: number) => {
    const t = setTimeout(callback, ms);
    timeOutList.push(t);
  };

  const getLocaleValue = async () => {
    const localeValue = await getLocalize();
    setLocale(localeValue);
  };

  const loadTargetList = async () => {
    const targets = await getTargetsList();

    const activeTargets = targets
      .filter((t: any) => t.status === Status.ACTIVE)
      .sort((a: any, b: any) => {
        const aNo = parseInt((a.field || '').replace('H', ''), 10);
        const bNo = parseInt((b.field || '').replace('H', ''), 10);

        if (isNaN(aNo) || isNaN(bNo)) {
          return a.id - b.id;
        }

        return aNo - bNo;
      });

    setTargetList(activeTargets);
  };

  const showConnectionWarning = () => {
    showMessage({
      message: L('warning.connection', locale),
      type: 'danger',
      position: 'top',
      duration: 6000,
    });
  };

  const getConnectedDeviceId = async () => {
    const dv = await getBlDevice();

    if (!dv || !dv.name) {
      showConnectionWarning();
      return null;
    }

    const isConnected = await BleManager.isPeripheralConnected(dv.id, []);

    if (!isConnected) {
      showConnectionWarning();
      return null;
    }

    return dv.id;
  };

  const writeMessage = async (message: string, deviceId: string) => {
    try {
      /**
       * KRİTİK:
       * BLE uzun mesajları bölebilir.
       * Merkez ESP '\n' karakterini görünce mesajı tamamlandı kabul edecek.
       */
      const packet = message.endsWith('\n') ? message : message + '\n';

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

  const createStepId = () => {
    return `S${String(Date.now() % 1000).padStart(3, '0')}`;
  };

  const getActiveTargets = () => {
    return targetList
      .filter((t: any) => t.status === Status.ACTIVE)
      .sort((a: any, b: any) => {
        const aNo = parseInt((a.field || '').replace('H', ''), 10);
        const bNo = parseInt((b.field || '').replace('H', ''), 10);

        if (isNaN(aNo) || isNaN(bNo)) {
          return a.id - b.id;
        }

        return aNo - bNo;
      });
  };

  /**
   * Bulk + GO komutu gönderir.
   *
   * position:
   * 1 = Ön / hedef
   * 2 = Dikey / pasif
   * 3 = Arka / rehine
   *
   * Örnek:
   * B;S001;R001;N020;D:22222222222222222222
   * GO;S001
   */
  const sendBulkPosition = async (
    startTargetNo: number,
    count: number,
    position: 1 | 2 | 3,
    deviceId?: string,
  ) => {
    const dv = deviceId || (await getConnectedDeviceId());
    if (!dv) return;

    const stepId = createStepId();
    const data = Array(count).fill(String(position)).join('');

    const bulkMessage =
      `B;${stepId};` +
      `R${String(startTargetNo).padStart(3, '0')};` +
      `N${String(count).padStart(3, '0')};` +
      `D:${data}`;

    await writeMessage(bulkMessage, dv);

    addTimeout(() => {
      writeMessage(`GO;${stepId}`, dv);
    }, 120);
  };

  /**
   * Selamlama:
   * Açılışta node'lar zaten P2 pasif konumda kabul edilir.
   * 1. Tüm hedefler P1'e gelir
   * 2. Tüm hedefler P3'e gider
   * 3. Tüm hedefler P2 pasif konuma döner
   */
  const selamlama = async () => {
    clearAllTimeouts();

    const deviceId = await getConnectedDeviceId();
    if (!deviceId) return;

    const activeTargets = getActiveTargets();

    if (!activeTargets.length) {
      showMessage({
        message: 'Aktif hedef bulunamadı.',
        type: 'warning',
        position: 'top',
        duration: 4000,
      });
      return;
    }

    const count = activeTargets.length;

    // 1. adım: hepsi aynı anda P1'e gelsin
    await sendBulkPosition(1, count, 1, deviceId);

    // 2. adım: 2 saniye sonra hepsi P3'e gitsin
    addTimeout(() => {
      sendBulkPosition(1, count, 3, deviceId);
    }, 2000);

    // 3. adım: 4 saniye sonra hepsi P2 pasif konuma dönsün
    addTimeout(() => {
      sendBulkPosition(1, count, 2, deviceId);
    }, 4000);
  };

  /**
   * Restart komutu.
   * Merkez/node tarafında "restart" destekleniyorsa çalışır.
   */
  const restart = async () => {
    const deviceId = await getConnectedDeviceId();
    if (!deviceId) return;

    await writeMessage('restart', deviceId);
  };

  /**
   * Hedefleri pasif konuma alır.
   * Tüm aktif hedefler P2'ye gider.
   */
  const close = async () => {
    clearAllTimeouts();

    const deviceId = await getConnectedDeviceId();
    if (!deviceId) return;

    const activeTargets = getActiveTargets();

    if (!activeTargets.length) {
      showMessage({
        message: 'Aktif hedef bulunamadı.',
        type: 'warning',
        position: 'top',
        duration: 4000,
      });
      return;
    }

    const count = activeTargets.length;

    // Tüm hedefleri P2 pasif konuma al
    await sendBulkPosition(1, count, 2, deviceId);
  };

  return (
    <SafeAreaView hideBack style={{ backgroundColor: '#E9EDEE' }}>
      <Header header={'MEMSIMROT ' + L('header.systemsetting', locale)} />
      <LoadingLayer ref={loadingLayer} />

      <View style={{ padding: wp(10) }}>
        <View
          style={{
            flex: 3,
            paddingTop: hp(5),
            paddingBottom: hp(5),
            flexDirection: 'row',
          }}
        >
          <View style={{ flexDirection: 'row' }}>
            <View style={{ padding: wp(5) }}>
              <TouchableOpacity
                style={[styles.btn, styles.shadow]}
                onPress={() => {
                  selamlama();
                }}
              >
                <FastImage
                  style={{ width: hp(80), height: hp(80) }}
                  source={require('../images/check-mark.png')}
                  resizeMode={FastImage.resizeMode.contain}
                />
                <Text style={styles.btnsubtext}>
                  {L('setting.greeting', locale)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flexDirection: 'row' }}>
            <View style={{ padding: wp(5) }}>
              <TouchableOpacity
                style={[styles.btn, styles.shadow]}
                onPress={() => {
                  restart();
                }}
              >
                <FastImage
                  style={{ width: hp(80), height: hp(80) }}
                  source={require('../images/rotate-left.png')}
                  resizeMode={FastImage.resizeMode.contain}
                />
                <Text style={styles.btnsubtext}>
                  {L('setting.restart', locale)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View
          style={{
            flex: 3,
            paddingTop: hp(5),
            paddingBottom: hp(5),
            flexDirection: 'row',
          }}
        >
          <View style={{ flexDirection: 'row' }}>
            <View style={{ padding: wp(5) }}>
              <TouchableOpacity
                style={[styles.btn, styles.shadow]}
                onPress={() => {
                  close();
                }}
              >
                <FastImage
                  style={{ width: hp(80), height: hp(80) }}
                  source={require('../images/sensor.png')}
                  resizeMode={FastImage.resizeMode.contain}
                />
                <Text style={styles.btnsubtext}>
                  {L('setting.closetarget', locale)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flexDirection: 'row' }}>
            <View style={{ padding: wp(5) }}>
              <TouchableOpacity
                style={[styles.btn, styles.shadow]}
                onPress={() => {
                  navigation.navigate('language' as never);
                }}
              >
                <FastImage
                  style={{ width: hp(80), height: hp(80) }}
                  source={require('../images/translate.webp')}
                  resizeMode={FastImage.resizeMode.contain}
                />
                <Text style={styles.btnsubtext}>
                  {L('setting.selectlanguage', locale)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default React.memo(Settings);

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
    backgroundColor: '#FFF',
    borderRadius: wp(10),
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