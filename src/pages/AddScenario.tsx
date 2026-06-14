import { useFocusEffect } from '@react-navigation/native';
import {
  Button,
  Header,
  InputBox,
  LoadingLayer,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'components';
import { useNavigation } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { hp, wp } from 'utils/dimension';
import FastImage from 'react-native-fast-image';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { showMessage } from 'react-native-flash-message';
import { Status, TargetColors, TargetType } from 'utils/enums';
import { getTargetsList } from 'localdb/targets_repository';
import { shuffleArr } from 'utils/helper';
import { generateUUID } from 'utils/utils';
import {
  getScenarios,
  insertScenarios,
  updateScenarios,
} from 'localdb/scenarios_repository';
import { getTimeList } from 'localdb/time_repository';
import { getLocalize } from 'utils/auth';
import { L } from 'utils/utility';

const POSITION_TARGET = 1; // Hedef = önden
const POSITION_PASSIVE = 2; // Pasif = dikey
const POSITION_HOSTAGE = 3; // Rehine = arkadan

function AddScenario(props: any) {
  const loadingLayer = useRef(null) as any;
  const navigation = useNavigation();
  const params = props.route.params;

  const [targetList, setTargetList] = useState([]) as any;
  const [diffTargetList, setDiffTargetList] = useState([]) as any;

  // h = hedef sayısı, r = rehine sayısı, s = seri sayısı
  const [scenarioCounts, setScenarioCounts] = useState({
    h: '1',
    r: '0',
    s: '2',
  }) as any;

  // Yeni yapı:
  // scenarioSeries = [
  //   {
  //     id,
  //     name,
  //     order,
  //     items: [
  //       { id, name, targetId, type, position }
  //     ]
  //   }
  // ]
  const [scenarioSeries, setScenarioSeries] = useState([]) as any;
  const [activeSeriesIndex, setActiveSeriesIndex] = useState(0) as any;

  const [editVisible, setEditVisible] = useState(false) as any;
  const [manuelHedefVisible, setManuelHedefVisible] = useState(false) as any;

  const [selectedItem, setSelectedItem] = useState({}) as any;
  const [selectedType, setSelectedType] = useState(TargetType.Hedef) as any;

  const [scenarioModel, setScenarioModel] = useState({}) as any;
  const [locale, setLocale] = useState(null as any);

  useFocusEffect(
    React.useCallback(() => {
      getLocaleValue();

      if (params && params.id) {
        loadValues();
      }

      loadTargets(params == null || params.id == null);
    }, []),
  );

  const getLocaleValue = async () => {
    const localeValue = await getLocalize();
    setLocale(localeValue);
  };

  const loadValues = async () => {
    const model = await getScenarios(params.id);
    setScenarioModel(model);

    if (!model || !model.targets) {
      setScenarioSeries([]);
      return;
    }

    try {
      const parsed = JSON.parse(model.targets);

      // Yeni format: [{ id, name, order, items: [] }]
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].items) {
        setScenarioSeries(parsed);
        setActiveSeriesIndex(0);

        setScenarioCounts({
          h: String(model.targetCount || '1'),
          r: String(model.hostageCount || '0'),
          s: String(model.seriesCount || parsed.length || '2'),
        });

        return;
      }

      // Eski format gelirse tek seri içine migrate ediyoruz.
      if (Array.isArray(parsed)) {
        const migratedSeries = [
          {
            id: generateUUID(),
            name: '1. Seri',
            order: 1,
            items: parsed.map((x: any) => {
              const isHostage = x.type === TargetType.Rehine;

              return {
                id: x.id || generateUUID(),
                name: x.name,
                targetId: x.targetId,
                type: isHostage ? TargetType.Rehine : TargetType.Hedef,
                position: isHostage ? POSITION_HOSTAGE : POSITION_TARGET,
              };
            }),
          },
        ];

        setScenarioSeries(migratedSeries);
        setActiveSeriesIndex(0);
      }
    } catch (e) {
      setScenarioSeries([]);
    }
  };

  const loadTargets = async (loadTime: any) => {
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

    const timeList = await getTimeList();

    if (timeList && timeList[0] && loadTime) {
      const model = {
        hedefSure: timeList[0].hedefSure,
        rehineSure: timeList[0].rehineSure,

        // Eski DB / repository alanları hata vermesin diye sıfır geçiyoruz.
        doubletapSure: 0,
        doubletapGecerli: 0,
      };

      setScenarioModel(model);
    }
  };

  const getTypeLabel = (type: any) => {
    if (type === TargetType.Rehine) {
      return L('general.hostage', locale);
    }

    return L('general.target', locale);
  };

  const getTypeColor = (type: any) => {
    if (type === TargetType.Rehine) {
      return TargetColors.Rehine;
    }

    return TargetColors.Hedef;
  };

  const getPositionByType = (type: any) => {
    if (type === TargetType.Rehine) {
      return POSITION_HOSTAGE;
    }

    return POSITION_TARGET;
  };

  const getActiveSeries = () => {
    if (!scenarioSeries || scenarioSeries.length === 0) {
      return null;
    }

    return scenarioSeries[activeSeriesIndex] || scenarioSeries[0];
  };

  const updateActiveSeriesItems = (items: any[]) => {
    const list = [...scenarioSeries];

    if (!list[activeSeriesIndex]) {
      return;
    }

    list[activeSeriesIndex] = {
      ...list[activeSeriesIndex],
      items,
    };

    setScenarioSeries(list);
  };

  const normalizeSeries = (list: any[]) => {
    return list.map((s: any, index: number) => ({
      ...s,
      name: `${index + 1}. Seri`,
      order: index + 1,
    }));
  };

  const addEmptySeries = () => {
    const list = [...scenarioSeries];

    list.push({
      id: generateUUID(),
      name: `${list.length + 1}. Seri`,
      order: list.length + 1,
      items: [],
    });

    setScenarioSeries(list);
    setActiveSeriesIndex(list.length);
  };

  const deleteActiveSeries = () => {
    if (!scenarioSeries || scenarioSeries.length === 0) {
      return;
    }

    const list = [...scenarioSeries];
    list.splice(activeSeriesIndex, 1);

    const normalized = normalizeSeries(list);

    setScenarioSeries(normalized);

    if (activeSeriesIndex >= normalized.length) {
      setActiveSeriesIndex(Math.max(0, normalized.length - 1));
    }
  };

  const duplicateActiveSeries = () => {
    const activeSeries = getActiveSeries();

    if (!activeSeries) {
      showMessage({
        message: 'Kopyalanacak seri bulunamadı.',
        type: 'warning',
        position: 'top',
        duration: 4000,
      });
      return;
    }

    const list = [...scenarioSeries];

    const copiedSeries = {
      ...activeSeries,
      id: generateUUID(),
      name: `${list.length + 1}. Seri`,
      order: list.length + 1,
      items: activeSeries.items.map((x: any) => ({
        ...x,
        id: generateUUID(),
      })),
    };

    list.push(copiedSeries);

    setScenarioSeries(list);
    setActiveSeriesIndex(list.length - 1);
  };

  const createScenario = () => {
    const hedefCount = parseInt(scenarioCounts.h || '0', 10);
    const rehineCount = parseInt(scenarioCounts.r || '0', 10);
    const seriesCount = parseInt(scenarioCounts.s || '2', 10);

    const totalCount = hedefCount + rehineCount;
    const targetCounts = targetList.length;

    if (seriesCount < 1) {
      showMessage({
        message: 'Seri sayısı en az 1 olmalıdır.',
        type: 'warning',
        position: 'top',
        duration: 4000,
      });
      return;
    }

    if (totalCount < 1) {
      showMessage({
        message: L('warning.mintarget', locale),
        type: 'warning',
        position: 'top',
        duration: 4000,
      });
      return;
    }

    if (totalCount > targetCounts) {
      showMessage({
        message: L('warning.countwarning', locale),
        type: 'danger',
        position: 'top',
        duration: 6000,
      });
      return;
    }

    const seriesList = [] as any;

    for (let s = 0; s < seriesCount; s++) {
      const availableTargets = shuffleArr([...targetList]);
      const items = [] as any;

      for (let i = 0; i < hedefCount; i++) {
        const item = availableTargets.shift();

        if (item) {
          items.push({
            id: generateUUID(),
            name: item.name,
            targetId: item.field,
            type: TargetType.Hedef,
            position: POSITION_TARGET,
          });
        }
      }

      for (let i = 0; i < rehineCount; i++) {
        const item = availableTargets.shift();

        if (item) {
          items.push({
            id: generateUUID(),
            name: item.name,
            targetId: item.field,
            type: TargetType.Rehine,
            position: POSITION_HOSTAGE,
          });
        }
      }

      seriesList.push({
        id: generateUUID(),
        name: `${s + 1}. Seri`,
        order: s + 1,
        items: shuffleArr(items),
      });
    }

    setScenarioSeries(seriesList);
    setActiveSeriesIndex(0);
  };

  const findDiffTarget = () => {
    const activeSeries = getActiveSeries();

    if (!activeSeries) {
      showMessage({
        message: 'Önce seri ekleyin.',
        type: 'warning',
        position: 'top',
        duration: 4000,
      });
      return;
    }

    setManuelHedefVisible(true);

    const lst = [] as any;

    targetList.map((t: any) => {
      const item = activeSeries.items.find((x: any) => x.targetId === t.field);

      if (!item) {
        lst.push({ ...t });
      }
    });

    setDiffTargetList(lst);
  };

  const selectManuelTarget = (item: any) => {
    const activeSeries = getActiveSeries();

    if (!activeSeries) {
      return;
    }

    const items = [...activeSeries.items];

    items.push({
      id: generateUUID(),
      name: item.name,
      targetId: item.field,
      type: TargetType.Hedef,
      position: POSITION_TARGET,
    });

    updateActiveSeriesItems(items);
    setManuelHedefVisible(false);
  };

  const removeTargetFromActiveSeries = (item: any) => {
    const activeSeries = getActiveSeries();

    if (!activeSeries) {
      return;
    }

    const items = activeSeries.items.filter((t: any) => t.id !== item.id);
    updateActiveSeriesItems(items);
  };

  const saveScenario = async () => {
    const model = { ...scenarioModel };

    if (!model.name) {
      showMessage({
        message: L('warning.scenarioname', locale),
        type: 'warning',
        position: 'top',
        duration: 6000,
      });
      return;
    }

    if (!model.hedefSure) {
      showMessage({
        message: L('warning.targettime', locale),
        type: 'warning',
        position: 'top',
        duration: 6000,
      });
      return;
    }

    if (!model.rehineSure) {
      showMessage({
        message: L('warning.hostagetime', locale),
        type: 'warning',
        position: 'top',
        duration: 6000,
      });
      return;
    }

    if (!scenarioSeries || scenarioSeries.length === 0) {
      showMessage({
        message: 'En az 1 seri oluşturmalısınız.',
        type: 'warning',
        position: 'top',
        duration: 6000,
      });
      return;
    }

    const emptySeries = scenarioSeries.find(
      (s: any) => !s.items || s.items.length === 0,
    );

    if (emptySeries) {
      showMessage({
        message: `${emptySeries.name} içinde hedef yok.`,
        type: 'warning',
        position: 'top',
        duration: 6000,
      });
      return;
    }

    let hedefCount = 0;
    let rehineCount = 0;

    scenarioSeries.forEach((series: any) => {
      series.items.forEach((item: any) => {
        if (item.type === TargetType.Rehine) {
          rehineCount++;
        } else {
          hedefCount++;
        }
      });
    });

    model.seriesCount = scenarioSeries.length;
    model.targetCount = hedefCount;
    model.hostageCount = rehineCount;

    // Eski alanlar repository/db tarafında bekleniyorsa sorun çıkmasın.
    model.doubletapSure = 0;
    model.doubletapGecerli = 0;

    model.description =
      `${scenarioSeries.length} seri - ` +
      `${hedefCount} ${L('general.target', locale)} ` +
      `${rehineCount} ${L('general.hostage', locale)}`;

    // DB alan adı targets kalıyor ama içinde artık seri JSON tutuluyor.
    model.targets = JSON.stringify(scenarioSeries);

    if (model.id) {
      await updateScenarios(model);
    } else {
      await insertScenarios(model);
    }

    showMessage({
      message: L('info.savescenario', locale),
      type: 'success',
      position: 'top',
      duration: 6000,
    });

    navigation.goBack();
  };

  const renderSeriesTab = (data: any) => {
    const { item, index } = data;
    const isActive = index === activeSeriesIndex;

    return (
      <TouchableOpacity
        style={{
          padding: wp(5),
          marginRight: wp(5),
          borderRadius: wp(4),
          backgroundColor: isActive ? '#FF5609' : '#FFF',
          borderWidth: 1,
          borderColor: isActive ? '#FF5609' : '#DDD',
        }}
        onPress={() => setActiveSeriesIndex(index)}
      >
        <Text
          style={{
            color: isActive ? '#FFF' : '#39464E',
            fontSize: wp(5),
            fontWeight: 'bold',
          }}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item, drag, isActive }: any) => {
    return (
      <TouchableOpacity
        style={{
          paddingLeft: wp(10),
          paddingRight: wp(10),
          width: wp(170),
        }}
        onLongPress={drag}
      >
        <View
          key={item.id + '_view'}
          style={{
            width: '100%',
            flexDirection: 'row',
            padding: wp(1),
            marginTop: hp(5),
            height: wp(20),
            backgroundColor: isActive ? '#FF5609' : getTypeColor(item.type),
            borderRadius: wp(5),
          }}
        >
          <View
            style={{
              flex: 10,
              justifyContent: 'center',
              alignItems: 'flex-start',
            }}
          >
            <Text
              style={{
                fontSize: wp(6),
                fontWeight: 'bold',
                color: 'white',
              }}
            >
              {item.name} ({getTypeLabel(item.type)}) P{item.position}
            </Text>
          </View>

          <View
            style={{
              flex: 4,
              backgroundColor: 'white',
              borderRadius: wp(5),
              margin: wp(2),
              padding: wp(2),
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setSelectedType(item.type);
                setSelectedItem(item);
                setEditVisible(true);
              }}
            >
              <FastImage
                style={{ width: hp(30), height: hp(30) }}
                source={require('../images/editing.png')}
                resizeMode={FastImage.resizeMode.contain}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                removeTargetFromActiveSeries(item);
              }}
            >
              <FastImage
                style={{ width: hp(30), height: hp(30) }}
                source={require('../images/delete.png')}
                resizeMode={FastImage.resizeMode.contain}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDiffTargetItem = (data: any) => {
    const { item } = data;

    return (
      <View
        flexNone
        style={{
          paddingLeft: wp(10),
          paddingRight: wp(10),
          width: '100%',
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
            borderWidth: 1,
          }}
        >
          <TouchableOpacity
            style={{ flexDirection: 'row' }}
            onPress={() => {
              selectManuelTarget(item);
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
            </View>

            <View style={{ flex: 10 }}>
              <Text
                style={{
                  fontSize: wp(6),
                  fontWeight: 'bold',
                  textAlign: 'right',
                  color: 'black',
                }}
              >
                {item.status === Status.ACTIVE
                  ? L('general.active', locale)
                  : L('general.passive', locale)}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const activeSeries = getActiveSeries();

  return (
    <SafeAreaView hideBack style={{ backgroundColor: '#E9EDEE' }}>
      <Header header={'MEMSİM ' + L('header.scenario', locale)} />
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
              <Text style={styles.welcome}>
                {L('general.scenarioinfo', locale)}
              </Text>

              <Text style={styles.desc}>
                {L('general.availabletarget', locale)} :{' '}
                {
                  targetList.filter((t: any) => t.status === Status.ACTIVE)
                    .length
                }
              </Text>

              <ScrollView style={{ marginTop: wp(5) }}>
                <InputBox
                  label={L('general.scenarioname', locale)}
                  value={scenarioModel.name}
                  onChangeText={(text) => {
                    const val = { ...scenarioModel };
                    val.name = text;
                    setScenarioModel(val);
                  }}
                />

                <InputBox
                  keyboardType={'decimal'}
                  value={scenarioModel.hedefSure}
                  label={L('general.targetactivetime', locale)}
                  onChangeText={(text) => {
                    const val = { ...scenarioModel };
                    val.hedefSure = text;
                    setScenarioModel(val);
                  }}
                />

                <InputBox
                  keyboardType={'decimal'}
                  value={scenarioModel.rehineSure}
                  label={L('general.hostageactivetime', locale)}
                  onChangeText={(text) => {
                    const val = { ...scenarioModel };
                    val.rehineSure = text;
                    setScenarioModel(val);
                  }}
                />

                <Button
                  style={{ marginTop: wp(4) }}
                  label={L('general.save', locale)}
                  onPress={() => {
                    saveScenario();
                  }}
                />

                <InputBox
                  keyboardType="numeric"
                  label="Seri Sayısı"
                  value={scenarioCounts.s}
                  onChangeText={(text) => {
                    const val = { ...scenarioCounts };
                    val.s = text;
                    setScenarioCounts(val);
                  }}
                />

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
                  label={L('general.createscenario', locale)}
                  onPress={() => {
                    createScenario();
                  }}
                />
              </ScrollView>
            </View>
          </View>

          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.welcome}>Senaryo Serileri</Text>

              <TouchableOpacity
                style={{ flexDirection: 'row', marginLeft: wp(10) }}
                onPress={() => {
                  addEmptySeries();
                }}
              >
                <FastImage
                  style={{ width: wp(10), height: wp(10) }}
                  source={require('../images/botas/add.webp')}
                  resizeMode={FastImage.resizeMode.contain}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={{ flexDirection: 'row', marginLeft: wp(10) }}
                onPress={() => {
                  duplicateActiveSeries();
                }}
              >
                <FastImage
                  style={{ width: wp(10), height: wp(10) }}
                  source={require('../images/copy.png')}
                  resizeMode={FastImage.resizeMode.contain}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={{ flexDirection: 'row', marginLeft: wp(10) }}
                onPress={() => {
                  deleteActiveSeries();
                }}
              >
                <FastImage
                  style={{ width: wp(10), height: wp(10) }}
                  source={require('../images/delete.png')}
                  resizeMode={FastImage.resizeMode.contain}
                />
              </TouchableOpacity>
            </View>

            <View
              style={{
                height: hp(45),
                marginTop: hp(5),
                paddingLeft: wp(10),
              }}
            >
              <FlatList
                horizontal
                data={scenarioSeries}
                renderItem={renderSeriesTab}
                keyExtractor={(item: any) => item.id}
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingLeft: wp(10),
              }}
            >
              <Text style={styles.welcome}>
                {activeSeries ? activeSeries.name : 'Seri Yok'}
              </Text>

              <TouchableOpacity
                style={{ flexDirection: 'row', marginLeft: wp(10) }}
                onPress={() => {
                  findDiffTarget();
                }}
              >
                <FastImage
                  style={{ width: wp(10), height: wp(10) }}
                  source={require('../images/botas/add.webp')}
                  resizeMode={FastImage.resizeMode.contain}
                />
              </TouchableOpacity>
            </View>

            <View style={{ flex: 6 }}>
              <GestureHandlerRootView>
                <DraggableFlatList
                  data={activeSeries ? activeSeries.items : []}
                  renderItem={renderItem}
                  keyExtractor={(item: any) => item.id}
                  onDragEnd={({ data }) => updateActiveSeriesItems(data)}
                />
              </GestureHandlerRootView>
            </View>
          </View>
        </View>
      </View>

      <Modal
        visible={editVisible}
        title={L('general.targettype', locale)}
        onOk={() => {
          const active = getActiveSeries();

          if (!active) {
            setEditVisible(false);
            return;
          }

          const items = [...active.items];
          const index = items.findIndex((t: any) => t.id === selectedItem.id);

          if (index > -1) {
            items[index] = {
              ...items[index],
              type: selectedType,
              position: getPositionByType(selectedType),
            };

            updateActiveSeriesItems(items);
          }

          setEditVisible(false);
          setSelectedItem({});
          setSelectedType(TargetType.Hedef);
        }}
        onCancel={() => {
          setEditVisible(false);
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          <View style={{ padding: wp(10) }}>
            <TouchableOpacity
              style={{
                backgroundColor: TargetColors.Hedef,
                padding: wp(10),
                borderRadius: wp(3),
                justifyContent: 'center',
                alignItems: 'center',
                borderColor: 'black',
                borderWidth: selectedType === TargetType.Hedef ? 2 : 0,
              }}
              onPress={() => {
                setSelectedType(TargetType.Hedef);
              }}
            >
              <Text
                style={{
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: wp(7),
                }}
              >
                {L('general.target', locale)}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ padding: wp(10) }}>
            <TouchableOpacity
              style={{
                backgroundColor: TargetColors.Rehine,
                padding: wp(10),
                borderRadius: wp(3),
                justifyContent: 'center',
                alignItems: 'center',
                borderColor: 'black',
                borderWidth: selectedType === TargetType.Rehine ? 2 : 0,
              }}
              onPress={() => {
                setSelectedType(TargetType.Rehine);
              }}
            >
              <Text
                style={{
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: wp(7),
                }}
              >
                {L('general.hostage', locale)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={manuelHedefVisible}
        title={L('general.addmanueltarget', locale)}
        onOk={() => {
          setManuelHedefVisible(false);
        }}
        onCancel={() => {
          setManuelHedefVisible(false);
        }}
      >
        <View style={{ paddingBottom: wp(14) }}>
          <FlatList
            data={diffTargetList}
            numColumns={1}
            renderItem={renderDiffTargetItem}
            keyExtractor={(item: any) => item.id}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export default React.memo(AddScenario);

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
  desc: {
    fontSize: wp(5),
    color: '#004F58',
    marginBottom: hp(4),
    fontFamily: 'Narin-Medium',
  },
});