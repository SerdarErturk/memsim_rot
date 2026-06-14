
import { getToken } from './auth';
import appConfig from "../config/appConfig"
const signalR = require("@microsoft/signalr");
export const connectSignalR=async()=>{
    var token=await getToken();
    if(token==null){
      return
    }
    var conf=appConfig ;
    let hubConnection = new signalR.HubConnectionBuilder()
    .withUrl(conf.api.endPoint + "/signalr-botashub?token=" +token)
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Critical)
    .build();
  if (hubConnection) {
    hubConnection
      .start()
      .then(() => { 
        console.log("connect")
       })
      .catch((err) => { 
        // console.log(err) 
      });
 
    // hubConnection.on('NewNotification', async (response) => {
    //     localNotification(response)
    // });

  }
  return hubConnection;

  }

