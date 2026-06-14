

import axios from 'axios';
import { getToken, setToken, setUser } from 'utils/auth';
import { appConfig } from 'config/appConfig';
import { showMessage } from 'react-native-flash-message';
import { Alert, NativeModules, ToastAndroid } from 'react-native';
import { insertErrorLog } from 'localdb/errorlog_repository';
var urlCounter = {} as any
const qs = require('qs');
const headers = {
  accept: 'application/json',

};
const http = axios.create({
  baseURL: appConfig.api.endPoint + "/api/",
  timeout: 3000000,
  paramsSerializer: function (params) {
    return qs.stringify(params, {
      encode: false,
    });
  },
});

http.interceptors.request.use(
  function (config) {

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

http.interceptors.request.use(
  async function (config: any) {
   urlCounter[config.url] = urlCounter[config.url] || 0
   urlCounter[config.url] = urlCounter[config.url] + 1
    if (await getToken()) {
      config.headers.common['Authorization'] = 'Bearer ' + await getToken();
      config.headers.common['PageInfo'] = "mobile";;
    }
    console.log(urlCounter)
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);
http.interceptors.response.use(
  response => {
    if (response && response.data && response.data.error) {
      if (response.data.message == "400") {

        showMessage({
          message: "Sistemde beklenmedik bir hata oluştu. Hata kayıtları ekibimize gönderildi.",
          backgroundColor: "#FF7A7A",
          type: "danger",
          position: "top",
          duration: 6000
        });
        var model400 = {
          deviceInfo: "400 Hatası",
          error: "",
        }
        var errString=""
        if (response.data.error && response.data.error.errors) {
          var errors = response.data.error.errors;
       
          Object.keys(errors).forEach(function (key, index) {
            errString=errString+" "+ key+"=" + errors[key] +"\n"
          });
          model400.error=errString;
        }


        insertErrorLog(model400);
        return { error: true, errorMessage: errString }
      }  
      else if (Array.isArray(response.data.error)) {
        showMessage({
          message: "'" + response.data.error + "'  İşlemine ait yetkiniz yok",
          backgroundColor: "#FF7A7A",
          type: "danger",
          position: "top",
          duration: 6000
        });
        var modelYetki = {
          deviceInfo: "Yetki Hata",
          error: "'" + response.data.error + "'  İşlemine ait yetkiniz yok"
        }
        insertErrorLog(modelYetki);
        return { error: true, errorMessage: response.data.error }
      
      } else {
        var model = {
          deviceInfo:  "Backend Hata",
          error: "",
        }
        var errString=""
        if (response.data.error && response.data.error.errors) {
          var errors = response.data.error.errors;
       
          Object.keys(errors).forEach(function (key, index) {
            errString=errString+" "+ key+"=" + errors[key] +"\n"
          });
          model.error=errString;
          showMessage({
            message: "Sistemde beklenmedik bir hata oluştu. Hata kayıtları ekibimize gönderildi.",
            backgroundColor: "#FF7A7A",
            type: "danger",
            position: "top",
            duration: 6000
          });
        }else{
          errString="Url:" + response.config.url + " Error:" + response.data.error;
          showMessage({
            message: response.data.error,
            backgroundColor: "#FF7A7A",
            type: "danger",
            position: "top",
            duration: 6000
          });
        }
        var model = {
          deviceInfo: "Backend Hata",
          error: errString
        }
        insertErrorLog(model);
        return { error: true, errorMessage: response.data.error }
      }

    }
    if (response.data && response.data.info) {
      if (response.data.showModal) {
        if (Array.isArray(response.data.message)) {

          return { data: { result: { error: true, errorMessage: response.data.message } } }
          // Modal.info({
          //   title: L("general.info"),
          //   content: React.createElement("div", { dangerouslySetInnerHTML: { __html: response.data.info.map(x => "<div> * " + L(x.Message || x.message) + "</div>") } }),
          // });
        } else {
          // Modal.info({
          //   title: L("general.info"),
          //   content: L(response.data.message),
          // });
        }

      }

      // var loadingLayer = document.getElementById("loading-layer") as any;
      // if (loadingLayer) {
      //   loadingLayer.className = "loading-hide";
      // }
      return { data: { result: { error: true, response: response.data.info, message: response.data.message, title: response.data.title, type: response.data.type } } }
    }
    if (response.data.exceptions) {
      return { data: { result: { error: true, exceptions: response.data.exceptions, title: response.data.title } } }
    }
    return response;
  },
  error => {
    if (error && error.message) {
      showMessage({
        message: error.message,
        backgroundColor: "#FF7A7A",
        type: "danger",
        position: "top",
        duration: 6000
      });
    }
    if (error.response && error.response.status === 401) {
      // setTimeout(() => {
      setUser(null);
      setToken(null);
      //   NativeModules.DevSettings.reload();
      // }, 1000);
      setTimeout(() => {
        //  NativeModules.DevSettings.reload();
        Alert.alert("Oturum süreniz dolmuştur.", "Lütfen tekrar giriş yapınız.")
      }, 1000);
    }



    return Promise.reject(error);
  }
);

export default http;
