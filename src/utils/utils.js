



import DeviceInfo from 'react-native-device-info';
// import { useNavigation } from '@react-navigation/native';

// export const navigate = (root) => {
//   const navigation = useNavigation()
//   navigation.navigate(root);
// }
  // loadScript(url: string) {
  //   // var script = document.createElement('script');
  //   // script.type = 'text/javascript';
  //   // script.src = url;
  //   // document.body.appendChild(script);
  // }

  // extend(...args: any[]) {
  //   let options,
  //     name,
  //     src,
  //     srcType,
  //     copy,
  //     copyIsArray,
  //     clone,
  //     target = args[0] || {},
  //     i = 1,
  //     length = args.length,
  //     deep = false;
  //   if (typeof target === 'boolean') {
  //     deep = target;
  //     target = args[i] || {};
  //     i++;
  //   }
  //   if (typeof target !== 'object' && typeof target !== 'function') {
  //     target = {};
  //   }
  //   if (i === length) {
  //     target = this;
  //     i--;
  //   }
  //   for (; i < length; i++) {
  //     if ((options = args[i]) !== null) {
  //       for (name in options) {
  //         src = target[name];
  //         copy = options[name];
  //         if (target === copy) {
  //           continue;
  //         }
  //         srcType = Array.isArray(src) ? 'array' : typeof src;
  //         if (deep && copy && ((copyIsArray = Array.isArray(copy)) || typeof copy === 'object')) {
  //           if (copyIsArray) {
  //             copyIsArray = false;
  //             clone = src && srcType === 'array' ? src : [];
  //           } else {
  //             clone = src && srcType === 'object' ? src : {};
  //           }
  //           target[name] = this.extend(deep, clone, copy);
  //         } else if (copy !== undefined) {
  //           target[name] = copy;
  //         }
  //       }
  //     }
  //   }

  //   return target;
  // }





  // setLocalization() {
  //   // if (!abp.utils.getCookieValue('Abp.Localization.CultureName')) {
  //   //   let language = navigator.language;
  //   //   abp.utils.setCookieValue('Abp.Localization.CultureName', language, new Date(new Date().getTime() + 5 * 365 * 86400000), abp.appPath);
  //   // }
  // }

  export const generateUUID=()=> { // Public Domain/MIT
   var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16;//random number between 0 and 16
      if (d > 0) {//Use timestamp until depleted
        r = (d + r) % 16 | 0;
        d = Math.floor(d / 16);
      } else {//Use microseconds since page-load if supported
        r = (d2 + r) % 16 | 0;
        d2 = Math.floor(d2 / 16);
      }
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }
  // camelCase(str: string) {
  //   return str
  //     .replace(/\s(.)/g, function (a) {
  //       return a.toUpperCase();
  //     })
  //     .replace(/\s/g, '')
  //     .replace(/^(.)/, function (b) {
  //       return b.toLowerCase();
  //     });
  // }

  // showLoading() {
  //   // var loadingLayer = document.getElementById("loading-layer") as any;
  //   // if (loadingLayer) {

  //   //   loadingLayer.className = "loading-container";
  //   // }

  // }
  // hideLoading() {
  //   // var loadingLayer = document.getElementById("loading-layer") as any;
  //   // if (loadingLayer) {
  //   //   loadingLayer.className = "loading-hide";
  //   // }
  // }
  // // getDifference(array1: any[], array2: any[]) {
  // //   return array1.filter(object1 => {
  // //     return !array2.some(object2 => {
  // //       return object1.id === object2.id;
  // //     });
  // //   });
  // // }
  // // getDate = (year: any, month: any, day: any) => {
  // //   // var str= `${year}-${month.toString().length==2?month:"0"+month}-${day.toString().length==2?day:"0"+day}T00:00:00`
  // //   return new Date(Date.UTC(year, month, day, 0, 0));
  // // }

  export const setMoment=(date, format)=> {
    var result = moment(date).utc(true)
    if (format) {
      // return moment(date).utc(true).format("DD.MM.YYYY");
      return moment(date);
    }
    return result;
  }

export const deviceInfo=async()=>{
  var device={};
  let deviceId = await DeviceInfo.getDeviceId();
  let deviceModel = await DeviceInfo.getModel();
  let systemVersion = await DeviceInfo.getSystemVersion();
  let version = await DeviceInfo.getVersion();
  device.deviceId = deviceId;
  device.deviceModel = deviceModel;
  device.systemVersion = systemVersion;
  device.version = version;
  device.baseOs = await DeviceInfo.getBaseOs();
  device.batteryLevel = await DeviceInfo.getBatteryLevel();
  device.deviceName = await DeviceInfo.getDeviceName();
  device.freeDiskStorage = await DeviceInfo.getFreeDiskStorage();
  device.capacity = await DeviceInfo.getTotalDiskCapacity();
  return device;
}

