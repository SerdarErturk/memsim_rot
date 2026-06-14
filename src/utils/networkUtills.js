import {
  checkInternetConnection,
  offlineActionCreators,
} from 'react-native-offline';
import { getConnectionManuel, getInternetConnection } from './auth';
export default class NetworkUtils {
  static async isNetworkAvailable() {
    const response = await getInternetConnection()
    var connectionManuel = await getConnectionManuel();
    if (response == "0" || connectionManuel != "1") {
      return false
    }
    const isConnected = await checkInternetConnection();
    return isConnected
  }
}
