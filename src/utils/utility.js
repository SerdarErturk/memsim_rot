
import { getLocalize } from "./auth";
import Geolocation from 'react-native-geolocation-service';
import { Linking, PermissionsAndroid, Platform, ToastAndroid } from 'react-native';
export function L(key, l, sourceName) {
  var localize = l || "tr";
  if (localize) {
    var localizeStore = {};
    if (localize == "tr") {
      localizeStore = require('../config/lang/tr-Tr').default
    } else if (localize == "en") {
      localizeStore = require('../config/lang/en-En').default;
    } else if (localize == "fr") {
      localizeStore = require('../config/lang/fr-Fr').default;
    }
    return localizeStore[key] ?? key;
  }
  return "";
}

export function isGranted(permissionName) {
  // var permissionList= globalThis.allPermission as any;
  // if(permissionList.find(x=>x.name==permissionName)){
  //   return true
  // }
  // return false;
  return true
}

export async function localize() {
  var localize = await getLocalize() ?? 'tr-Tr';
  if (localize === "tr-Tr") {
    return localeTR
  } else if (localize === "en-En") {
    return localeEn
  }
  return localeTR
}


export async function hasLocationPermission() {
  if (Platform.OS === 'ios') {
    const hasPermission = await hasPermissionIOS();
    return hasPermission;
  }

  if (Platform.OS === 'android' && Platform.Version < 23) {
    return true;
  }

  const hasPermission = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );

  if (hasPermission) {
    return true;
  } else {
    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    if (status === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    }
    if (status === PermissionsAndroid.RESULTS.DENIED) {
      ToastAndroid.show(
        'Konum izni kullanıcı tarafından red edildi.',
        ToastAndroid.LONG,
      );
    } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      ToastAndroid.show(
        'Konum izni kullanıcı tarafından iptal edildi.',
        ToastAndroid.LONG,
      );
    }
    return false
  }



  return false;
};

const hasPermissionIOS = async () => {

  const openSetting = () => {
    Linking.openSettings().catch(() => {
      Alert.alert('Unable to open settings');
    });
  };
  const status = await Geolocation.requestAuthorization('whenInUse');

  if (status === 'granted') {
    return true;
  }

  if (status === 'denied') {
    Alert.alert('Location permission denied');
  }

  if (status === 'disabled') {
    Alert.alert(
      `Turn on Location Services to allow determine your location.`,
      '',
      [
        { text: 'Go to Settings', onPress: openSetting },
        { text: "Don't Use Location", onPress: () => { } },
      ],
    );
  }

  return false;
};