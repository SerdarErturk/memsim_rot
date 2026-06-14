

import http from '../../../../services/httpService'
import  AutoCompleteModel from '../model/AutoCompleteModel';
class AutoCompleteStore {


  public async loadData(endPoint: string, body: any) {
    let response = await http.post(endPoint, body);


    var result = response.data.result as AutoCompleteModel[];
    return result;
  }


  public async search(endpoint: any,body:any) {
    let response = await http.post(endpoint, body);


    var result = response.data.result as AutoCompleteModel[];
    return result;
  }
}
export default AutoCompleteStore