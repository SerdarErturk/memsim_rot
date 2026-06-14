

import {  setToken, setProfilPicture, setUserId, setUser } from 'utils/auth'
import NetworkUtils from 'utils/networkUtills';
import http from '../services/httpService';


class NotificationStore {

  public async getNotifications() {
    var internetConnection = await NetworkUtils.isNetworkAvailable();
    if (internetConnection) {
    let response = await http.get('Notfication/GetActiveUserNotification');
    var result = response.data.result
    return result;
    }
  }
  public async updateNotfication(data:any) {
    var internetConnection = await NetworkUtils.isNetworkAvailable();
    if (internetConnection) {
    let response = await http.post('Notfication/UpdateNotfication', data);
    var result = response.data.result
    return result;
  }
    }

  public async updateRangeNotfication(data:any) {
    var internetConnection = await NetworkUtils.isNetworkAvailable();
    if (internetConnection) {
    let response = await http.post('Notfication/updateRangeNotfication', data);
    var result = response.data.result
    return result;
    }
  }
}
export default NotificationStore;
