import { useFocusEffect } from '@react-navigation/native';
import {
  Button,
  Header,
  InputBox,
  LoadingLayer,
  SafeAreaView,
  Text,
  View,
} from 'components';
import { useNavigation } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { wp } from 'utils/dimension';
import { showMessage } from 'react-native-flash-message';
import { Status, TargetType } from 'utils/enums';
import { getTargetsList } from 'localdb/targets_repository';
import { shuffleArr } from 'utils/helper';
import { generateUUID } from 'utils/utils';
import { getBlDevice, getLocalize } from 'utils/auth';
import BleManager from 'react-native-ble-manager';
import { L } from 'utils/utility';
import { getTimeList } from 'localdb/time_repository';

const POSITION_TARGET = 1; // Hedef = önden
const POSITION_HOSTAGE = 3; // Rehine = arkadan

function FastPlay(props: any) {
  const loadingLayer = useRef(null) as any;
  const navigation = useNavigation();

  const [targetList, setTargetList] = useState([]) as any;

  // h = hedef sayısı, r = rehine sayısı
  const [scenarioCounts, setScenarioCounts] = useState({
    h: '1',
    r: '0',
  }) as any;

  const [locale, setLocale] = useState(null as any);

  const [timeModel, setTimeModel] = useState({
    hedefSure: 3,
    rehineSure: 1,
    doubletapSure: 0,
    doubletapGecerli: 0,
  }) as any;

  useFocusEffect(
    React.useCallback(() => {
      getLocaleValue();
      loadTargets();
      loadTimes();
    }, []),
  );

  const getLocaleValue = async () => {
    const localeValue = await getLocalize();
    setLocale(localeValue);
  };

  const loadTargets = async () => {
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

  const loadTimes = async () => {
    const times = await getTimeList();

    if (times && times[0]) {
      setTimeModel({
        hedefSure: times[0].hedefSure || 3,
        rehineSure: times[0].rehineSure || 1,

        // Eski alanlar PlayScenario tarafında sorun çıkarmasın diye duruyor.
        doubletapSure: 0,
        doubletapGecerli: 0,
      });
    }
  };

  const checkConnection = async () => {
    const device = (await getBlDevice()) as any;

    if (!device || !device.id) {
      showMessage({
        message: L('warning.connection', locale),
        type: 'danger',
        position: 'top',
        duration: 6000,
      });
      return null;
    }

    const isConnected = await BleManager.isPeripheralConnected(device.id, []);

    if (!isConnected) {
      showMessage({
        message: L('warning.connection', locale),
        type: 'danger',
        position: 'top',
        duration: 6000,
      });
      return null;
    }

    return device;
  };

  const getRandomIntInclusive = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  /**
   * Seri sayısı artık random.
   *
   * Mantık:
   * Toplam item = hedef + rehine
   *
   * Her seride ortalama 2-4 item olacak şekilde
   * minimum ve maksimum seri sayısı hesaplanır.
   *
   * Örnek:
   * 4 hedef + 5 rehine = 9 item
   *
   * min seri = ceil(9 / 4) = 3
   * max seri = ceil(9 / 2) = 5
   *
   * Sonuç random: 3, 4 veya 5 seri
   */
  const calculateAutoSeriesCount = (
    targetCount: number,
    hostageCount: number,
  ) => {
    const total = targetCount + hostageCount;

    if (total <= 0) {
      return 0;
    }

    if (total <= 2) {
      return 1;
    }

    const minSeries = Math.max(1, Math.ceil(total / 4));
    const maxSeries = Math.max(minSeries, Math.ceil(total / 2));

    return getRandomIntInclusive(minSeries, maxSeries);
  };

  /**
   * Ekranda göstermek için seri aralığı.
   * Burada random üretmiyoruz, sadece kullanıcıya aralığı gösteriyoruz.
   */
  const getAutoSeriesRangeText = () => {
    const hedefCount = parseInt(scenarioCounts.h || '0', 10);
    const rehineCount = parseInt(scenarioCounts.r || '0', 10);

    const total = hedefCount + rehineCount;

    if (total <= 0) {
      return '0';
    }

    if (total <= 2) {
      return '1';
    }

    const minSeries = Math.max(1, Math.ceil(total / 4));
    const maxSeries = Math.max(minSeries, Math.ceil(total / 2));

    if (minSeries === maxSeries) {
      return String(minSeries);
    }

    return `${minSeries} - ${maxSeries}`;
  };

  /**
   * Hızlı oyna için seri üretir.
   *
   * Örnek:
   * Kullanıcı 4 hedef + 5 rehine girerse:
   * - Önce toplam 9 item seçilir.
   * - Bu 9 item random karıştırılır.
   * - Random seçilen seri sayısına dağıtılır.
   * - Toplam item sayısı yine 9 kalır.
   */
  const createFastSeries = (hedefCount: number, rehineCount: number) => {
    const seriesCount = calculateAutoSeriesCount(hedefCount, rehineCount);

    const availableTargets = shuffleArr([...targetList]);
    const selectedItems = [] as any;

    /**
     * Hedefleri oluştur.
     */
    for (let i = 0; i < hedefCount; i++) {
      const item = availableTargets.shift();

      if (item) {
        selectedItems.push({
          id: generateUUID(),
          name: item.name,
          targetId: item.field,
          type: TargetType.Hedef,
          position: POSITION_TARGET,
        });
      }
    }

    /**
     * Rehineleri oluştur.
     */
    for (let i = 0; i < rehineCount; i++) {
      const item = availableTargets.shift();

      if (item) {
        selectedItems.push({
          id: generateUUID(),
          name: item.name,
          targetId: item.field,
          type: TargetType.Rehine,
          position: POSITION_HOSTAGE,
        });
      }
    }

    /**
     * Toplam item random karıştırılır.
     */
    const shuffledItems = shuffleArr(selectedItems);

    const seriesList = [] as any;

    for (let s = 0; s < seriesCount; s++) {
      seriesList.push({
        id: generateUUID(),
        name: `${s + 1}. Seri`,
        order: s + 1,
        items: [],
      });
    }

    /**
     * Itemları serilere dengeli ama random şekilde dağıtıyoruz.
     *
     * Örn:
     * 9 item, 4 seri ise:
     * 1. seri → 3 item
     * 2. seri → 2 item
     * 3. seri → 2 item
     * 4. seri → 2 item
     */
    shuffledItems.forEach((item: any, index: number) => {
      const seriesIndex = index % seriesCount;
      seriesList[seriesIndex].items.push(item);
    });

    /**
     * Seri sırasını ve seri içlerini de randomlaştırıyoruz.
     */
    const randomizedSeries = shuffleArr(seriesList).map(
      (series: any, index: number) => ({
        ...series,
        name: `${index + 1}. Seri`,
        order: index + 1,
        items: shuffleArr(series.items),
      }),
    );

    return randomizedSeries;
  };

  const createScenario = async () => {
    const device = await checkConnection();

    if (!device) {
      return;
    }

    const hedefCount = parseInt(scenarioCounts.h || '0', 10);
    const rehineCount = parseInt(scenarioCounts.r || '0', 10);

    const totalCount = hedefCount + rehineCount;
    const activeTargetCount = targetList.length;

    if (activeTargetCount === 0) {
      showMessage({
        message: 'Aktif hedef bulunamadı.',
        type: 'warning',
        position: 'top',
        duration: 5000,
      });
      return;
    }

    if (totalCount < 1) {
      showMessage({
        message: L('warning.mintarget', locale),
        type: 'warning',
        position: 'top',
        duration: 5000,
      });
      return;
    }

    /**
     * Aynı hızlı oyun içinde aynı hedef tekrar kullanılmasın.
     * Bu yüzden toplam seçilecek hedef/rehine sayısı aktif hedef sayısından büyük olamaz.
     */
    if (totalCount > activeTargetCount) {
      showMessage({
        message: L('warning.countwarning', locale),
        type: 'danger',
        position: 'top',
        duration: 6000,
      });
      return;
    }

    const series = createFastSeries(hedefCount, rehineCount);

    navigation.navigate(
      'playscenario' as never,
      {
        series,
        times: timeModel,
      } as never,
    );
  };

  const totalSelectedCount =
    parseInt(scenarioCounts.h || '0', 10) +
    parseInt(scenarioCounts.r || '0', 10);

  return (
    <SafeAreaView hideBack style={{ backgroundColor: '#E9EDEE' }}>
      <Header header={'MEMSİM ' + L('header.fastplay', locale)} />
      <LoadingLayer ref={loadingLayer} />

      <View style={{ padding: wp(10), flexDirection: 'row' }}>
        <View style={{ paddingLeft: wp(10), flexDirection: 'row' }}>
          <View
            style={{
              borderRightWidth: 1,
              borderRightColor: '#9E9E9E',
              paddingRight: wp(10),
            }}
          >
            <View>
              <Text style={styles.desc}>
                {L('general.availabletarget', locale)} :{' '}
                {
                  targetList.filter((t: any) => t.status === Status.ACTIVE)
                    .length
                }
              </Text>

              {/* <Text style={styles.desc}>
                Otomatik seri sayısı aralığı: {getAutoSeriesRangeText()}
              </Text> */}

              <Text style={styles.desc}>
                Toplam seçilecek hedef/rehine: {totalSelectedCount}
              </Text>

              <View style={{ marginTop: wp(5) }}>
                <InputBox
                  keyboardType="numeric"
                  label={L('general.targettcount', locale)}
                  value={scenarioCounts.h}
                  onChangeText={(text) => {
                    const val = { ...scenarioCounts };
                    val.h = text;
                    setScenarioCounts(val);
                  }}
                />

                <InputBox
                  keyboardType="numeric"
                  label={L('general.hostagecount', locale)}
                  value={scenarioCounts.r}
                  onChangeText={(text) => {
                    const val = { ...scenarioCounts };
                    val.r = text;
                    setScenarioCounts(val);
                  }}
                />

                <Button
                  style={{ marginTop: wp(4) }}
                  label={L('general.play', locale)}
                  onPress={() => {
                    createScenario();
                  }}
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default React.memo(FastPlay);

const styles = StyleSheet.create({
  welcome: {
    color: '#39464E',
    fontSize: wp(8),
    fontWeight: 'bold',
  },
  targetCard: {
    borderRadius: wp(3),
    marginTop: wp(10),
  },
  targetBtn: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: wp(10),
  },
  targetname: {
    textAlign: 'left',
    fontSize: wp(8),
    fontWeight: 'bold',
  },
  desc: {
    fontSize: wp(5),
    color: '#004F58',
    marginBottom: wp(4),
    fontFamily: 'Narin-Medium',
  },
});