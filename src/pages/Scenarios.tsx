import { useFocusEffect } from '@react-navigation/native';
import { Header, LoadingLayer, SafeAreaView, Text, View } from 'components';
import { useNavigation } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { hp, wp } from 'utils/dimension';
import FastImage from 'react-native-fast-image';

import BleManager from 'react-native-ble-manager';
import { deleteScenarios, getScenariosList } from 'localdb/scenarios_repository';
import { showMessage } from 'react-native-flash-message';
import { getBlDevice, getLocalize } from 'utils/auth';
import { L } from 'utils/utility';

function Scenarios() {
  const loadingLayer = useRef(null) as any;
  const [scenarioList, setScenarioList] = useState([]) as any;
  const [locale, setLocale] = useState(null as any);
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      getLocaleValue();
      loadScenarios();
    }, []),
  );

  const getLocaleValue = async () => {
    const localeValue = await getLocalize();
    setLocale(localeValue);
  };

  const loadScenarios = async () => {
    const scenarios = await getScenariosList();
    setScenarioList(scenarios);
  };

  const shuffleArray = (array: any[]) => {
    const newArray = [...array];

    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }

    return newArray;
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

  const normalizeScenarioSeries = (targetsText: string) => {
    if (!targetsText) {
      return [];
    }

    try {
      const parsed = JSON.parse(targetsText);

      if (!Array.isArray(parsed)) {
        return [];
      }

      /**
       * Yeni format:
       * [
       *   { id, name, order, items: [...] }
       * ]
       */
      if (parsed.length > 0 && parsed[0].items) {
        return parsed;
      }

      /**
       * Eski format gelirse tek seri içine alıyoruz.
       * Bu geçiş için güvenli olur.
       */
      return [
        {
          id: 'legacy-series-1',
          name: '1. Seri',
          order: 1,
          items: parsed,
        },
      ];
    } catch (error) {
      return [];
    }
  };

  const play = async (shuffle: boolean, item: any) => {
    const device = await checkConnection();

    if (!device) {
      return;
    }

    let series = normalizeScenarioSeries(item.targets);

    if (!series || series.length === 0) {
      showMessage({
        message: 'Senaryo içinde seri bulunamadı.',
        type: 'warning',
        position: 'top',
        duration: 5000,
      });
      return;
    }

    if (shuffle) {
      // Yeni sistemde shuffle seri sırasını karıştırır.
      series = shuffleArray(series);
    }

    const model = {
      hedefSure: item.hedefSure,
      rehineSure: item.rehineSure,

      // Eski alanlar PlayScenario içinde hata vermesin diye tutuluyor.
      doubletapSure: item.doubletapSure || 0,
      doubletapGecerli: item.doubletapGecerli || 0,
    };

    navigation.navigate(
      'playscenario' as never,
      {
        series,
        times: model,
      } as never,
    );
  };

  const deleteRecord = async (item: any) => {
    await deleteScenarios(item.id);
    loadScenarios();
  };

  const renderItem = (data: any) => {
    const { item } = data;

    return (
      <View
        flexNone
        style={{
          paddingLeft: wp(3),
          paddingRight: wp(3),
          width: wp(280),
        }}
      >
        <View
          key={item.id + '_view'}
          style={{
            width: '100%',
            padding: wp(5),
            marginTop: hp(5),
            backgroundColor: '#FFF',
            borderRadius: wp(5),
            flexDirection: 'row',
          }}
        >
          <View style={{ flex: 10 }}>
            <Text
              style={{
                fontSize: wp(6),
                fontWeight: 'bold',
                color: 'black',
              }}
            >
              {item.name}
            </Text>

            <Text style={{ fontSize: wp(4), color: 'black' }}>
              {item.description}
            </Text>
          </View>

          <View
            style={{
              flex: 6,
              justifyContent: 'center',
              alignItems: 'flex-end',
              flexDirection: 'row',
            }}
          >
            <TouchableOpacity
              style={{ flexDirection: 'row', marginLeft: wp(10) }}
              onPress={() => {
                play(false, item);
              }}
            >
              <FastImage
                style={{ width: wp(15), height: wp(15) }}
                source={require('../images/play-button.png')}
                resizeMode={FastImage.resizeMode.contain}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={{ flexDirection: 'row', marginLeft: wp(10) }}
              onPress={() => {
                play(true, item);
              }}
            >
              <FastImage
                style={{ width: wp(15), height: wp(15) }}
                source={require('../images/shuffle.png')}
                resizeMode={FastImage.resizeMode.contain}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={{ flexDirection: 'row', marginLeft: wp(10) }}
              onPress={() => {
                navigation.navigate('addscenario' as never, {
                  id: item.id,
                } as never);
              }}
            >
              <FastImage
                style={{ width: wp(15), height: wp(15) }}
                source={require('../images/editing.png')}
                resizeMode={FastImage.resizeMode.contain}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={{ flexDirection: 'row', marginLeft: wp(10) }}
              onPress={() => {
                deleteRecord(item);
              }}
            >
              <FastImage
                style={{ width: wp(15), height: wp(15) }}
                source={require('../images/delete.png')}
                resizeMode={FastImage.resizeMode.contain}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView hideBack style={{ backgroundColor: '#E9EDEE' }}>
      <Header header={'MEMSIMROT ' + L('header.gamescrenario', locale)} />
      <LoadingLayer ref={loadingLayer} />

      <View style={{ padding: wp(10), flexDirection: 'row' }}>
        <View center>
          <View style={{ flexDirection: 'row' }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
              }}
            >
              <Text style={styles.welcome}>
                {L('general.screnarios', locale)}
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}
            >
              <TouchableOpacity
                style={{ flexDirection: 'row', marginLeft: wp(10) }}
                onPress={() => {
                  navigation.navigate('addscenario' as never);
                }}
              >
                <FastImage
                  style={{ width: wp(10), height: wp(10) }}
                  source={require('../images/botas/add.webp')}
                  resizeMode={FastImage.resizeMode.contain}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flex: 5 }}>
            <FlatList
              data={scenarioList}
              numColumns={1}
              renderItem={renderItem}
              keyExtractor={(item: any) => item.id.toString()}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default React.memo(Scenarios);

const styles = StyleSheet.create({
  welcome: {
    color: '#39464E',
    fontSize: wp(8),
    fontWeight: 'bold',
  },
  targetCard: {
    borderRadius: wp(3),
    marginTop: hp(10),
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
    fontSize: hp(22),
    fontWeight: 'bold',
  },
  label: {
    fontSize: wp(5),
    color: '#004F58',
    marginBottom: hp(4),
    fontFamily: 'Narin-Medium',
  },
});