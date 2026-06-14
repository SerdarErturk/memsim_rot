

import http from '../../../../services/httpService'

import SelectboxModel from '../model/SelectboxModel';

class SelectboxStore {


  public async loadData(endPoint:string,body:any) {
    let response ;
    if( (body.cascadeList&& body.cascadeList.length>0)||body.extraParams){
       response = await http.post(endPoint, body);
    }else{
       response = await http.get(endPoint);
    }
   
 
    var result= response.data.result as SelectboxModel[] ;
    return result;
  }

}
export default SelectboxStore