import React, { useState } from 'react';
import Navigator from './src/config/navigator';
import FlashMessage from "react-native-flash-message";
import { Node } from '@babel/core';
// import {enableLatestRenderer} from 'react-native-maps';
import * as eva from '@eva-design/eva';
import { Alert, Platform } from 'react-native';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { wp } from 'utils/dimension';
import SplashScreen from 'react-native-splash-screen';
// import messaging from '@react-native-firebase/messaging'
import httpservice from './src/services/httpService'
// enableScreens();
// enableLatestRenderer();
import SQLLite from './src/localdb/repository';
import DbObjects from './src/localdb/dbObject.json';
import { connectSignalR } from 'utils/notfication';
import { getInternetConnection, getLoginModel, getToken, setInternetConnection, setToken } from 'utils/auth';
import NetworkUtils from 'utils/networkUtills';

import ErrorBoundary from './src/components/ErrorBoundary'
import AuthenticationStore from 'stores/authenticationStore';
import { deleteSensors, getSensors, getSensorsList, insertSensors } from 'localdb/sensors_repository';
import { ComponentType } from 'components/form_elements/ComponentType';
import { SensorType, Status } from 'utils/enums';
import { getTargetsList, insertTargets } from 'localdb/targets_repository';
import { getPuanList, insertPuan } from 'localdb/puan_repository';
import { getTimeList, insertTime } from 'localdb/time_repository';

var context = new SQLLite();
const App: () => Node = () => {

  React.useEffect(() => {
    loadSqlLite()
    SplashScreen.hide();
    connectSignalR();
    checkConnection();
    loadData();


    return () => {

      // unsubscribe();
    };
  }, []);

  const checkConnection = async () => {
    const isConnected = await NetworkUtils.isNetworkAvailable();
    return isConnected;


  }
  const checkInternetConnection = async (state: any) => {

    var lastConnection = await getInternetConnection();
    var type = state.type;
    var quality = type && type != "2g"
    var connected = quality && state.isConnected;
    if (lastConnection != undefined) {
      var val = lastConnection == "1" ? true : false;
      if (val != connected) {
        await setInternetConnection(connected ? "1" : "0");

        if (connected) {
          const loginModel = await getLoginModel();
          if (loginModel && loginModel.username) {

            const authStore = new AuthenticationStore();
            var result = await authStore.login(loginModel);
            await setToken(result.token);
          }

        }
      } else {
        await setInternetConnection(connected ? "1" : "0");
      }
    } else {
      await setInternetConnection(connected ? "1" : "0");
    }

  }
  const loadSqlLite = () => {
    context.init()
    var db = DbObjects as any;
    Object.keys(db).forEach(function (key, index) {
      var name = db[key].name
      var properties = db[key].properties
      var fields = [] as any;
      Object.keys(properties).forEach(function (key, index) {
        fields.push({
          name: key,
          dataType: properties[key]

        })
      })

       //context.deleteTable(name);
      // if(name=="Time"){
      //   alert(name);
      //   context.deleteTable("Time");
      // }

      context.createTable(name, [{
        name: 'id',
        dataType: 'integer',
        isNotNull: true,
        options: 'PRIMARY KEY AUTOINCREMENT'
      }, ...fields])

    });


  }

  const loadData = async () => {
    var sensors = await getSensorsList();

    if (sensors.length < 1) {
      sensors.map((t: any) => {
        deleteSensors(t.id)
      })
      var data = [{
        score: "10",
        name: "Impact 1",
        displayName: "Impact 1",
        maxDarbe: "1500",
        minDarbe: "50",
        color: "#F7412C",
        type: SensorType.PIEZO,
        field: "PZ1"
      },
      {
        score: "10",
        name: "Impact 2",
        displayName: "Impact 2",
        maxDarbe: "1500",
        minDarbe: "50",
        color: "#1395F7",
        type: SensorType.PIEZO,
        field: "PZ2"
      },
      {
        score: "10",
        name: "Impact 3",
        displayName: "Impact 3",
        maxDarbe: "1500",
        minDarbe: "50",
        color: "#47B14D",
        type: SensorType.PIEZO,
        field: "PZ3"
      },
      {
        score: "10",
        name: "Laser 1",
        displayName: "Laser 1",
        maxDarbe: "0",
        minDarbe: "0",
        color: "#FDED1B",
        type: SensorType.LASER,
        field: "LZ1"
      },
      {
        score: "10",
        name: "Laser 2",
        displayName: "Laser 2",
        maxDarbe: "0",
        minDarbe: "0",
        color: "#FE9900",
        type: SensorType.LASER,
        field: "LZ2"
      },
      {
        score: "10",
        name: "Laser 3",
        displayName: "Laser 3",
        maxDarbe: "0",
        minDarbe: "0",
        color: "#5F7F8B",
        type: SensorType.LASER,
        field: "LZ3"
      }

      ]

      data.map(x => {
        insertSensors(x)
      })
    }

    var targets = await getTargetsList();

    if (targets.length == 0) {

      for (let i = 0; i < 20; i++) {
        var targetNumber = (i + 1).toString();
        if (targetNumber.length == 1) {
          targetNumber = "0" + targetNumber
        }
        var model = {
          field: (i + 1) + "h",
          name: "H" + targetNumber,
          maxDarbe: "1500",
          minDarbe: "50",
          status: Status.ACTIVE
        }
        insertTargets(model)
      }


    }
    var puanAyar = await getPuanList();
    if (puanAyar.length == 0) {
      var ceza = [{
        rehineCeza: 5,
        sureCeza: 10,
        rehineVurulmadiPuan: 4,
      }
      ]
      ceza.map(x => {
        insertPuan(x)
      })


    }
    var zamanAyar = await getTimeList();
    if (zamanAyar.length == 0) {
      var zaman = [{
        hedefSure: 3,
        doubletapSure: 3,
        rehineSure: 1,
        doubletapGecerli: 500
      }
      ]
      zaman.map(x => {
        insertTime(x)
      })


    }
  }
  const onRegistrationError = (error: any) => {
    Alert.alert(
      'Failed To Register For Remote Push',
      `Error (${error.code}): ${error.message}`,
      [
        {
          text: 'Dismiss',
        },
      ],
    );
  };

  const onRegistered = (deviceToken: any) => {
    // Alert.alert('Registered For Remote Push', `Device Token: ${deviceToken}`, [
    //   {
    //     text: 'Dismiss',
    //     onPress: null,
    //   },
    // ]);

  };
  const onRemoteNotification = (notification: any) => {
    const isClicked = notification.getData().userInteraction === 1;
    const result = `
      Title:  ${notification.getTitle()};\n
      Subtitle:  ${notification.getSubtitle()};\n
      Message: ${notification.getMessage()};\n
      badge: ${notification.getBadgeCount()};\n
      sound: ${notification.getSound()};\n
      category: ${notification.getCategory()};\n
      content-available: ${notification.getContentAvailable()};\n
      Notification is clicked: ${String(isClicked)}.`;

    if (notification.getTitle() == undefined) {
      // Alert.alert('Silent push notification Received', result, [
      //   {
      //     text: 'Send local push',
      //     onPress: sendLocalNotification,
      //   },
      // ]);
    } else {
      // Alert.alert('Push Notification Received', result, [
      //   {
      //     text: 'Dismiss',
      //   },
      // ]);
    }
  };

  const upadateToken = async (token: any) => {
    var realToken = await getToken();
    if (realToken) {
      var internetConnection = await NetworkUtils.isNetworkAvailable();
      if (internetConnection) {
        await httpservice.get("/User/SetUserFireBaseToken?token=" + JSON.stringify(token))
      }
    }

  }
  const requestUserPermission = async () => {
    // await messaging().requestPermission();
  }
  return (

    <>
      <>
        <IconRegistry icons={EvaIconsPack} />

        <ApplicationProvider {...eva} theme={eva.light} >
          <ErrorBoundary>
            <Navigator />
          </ErrorBoundary>
          <FlashMessage style={{ margin: Platform.OS === 'ios' ? wp(30) : wp(20) }} position="top" />
        </ApplicationProvider></>
    </>
  );
};



export default App;
