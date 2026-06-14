import NetworkUtils from 'utils/networkUtills';
import http from '../../services/httpService'
import { insertErrorLog } from 'localdb/errorlog_repository';
import Repository from 'localdb/repository';
var service = new Repository()
class ErrorLogStore {
  public async addErrorLog(model: any) {
    var internetConnection = await NetworkUtils.isNetworkAvailable();
    if (internetConnection) {
      if(model.id){
        service.delete("ErrorLog", { id: model.id })
      }
      delete model.id;
      let response = await http.post("MobileErrorLog/AddMobileErrorLog", model);
      var result = response.data.result
    
      return result;
    } else {
      insertErrorLog(model);
      return model;
    }

  }



}
export default ErrorLogStore