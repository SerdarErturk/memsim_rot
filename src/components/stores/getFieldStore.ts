import http from '../../services/httpService'

class GetFieldStore {
  public async loadTemplate(templateEndPoint:string) {
    let response = await http.get(templateEndPoint);
    var result=response.data.result 
    return result;
  }
 
  
  
}
export default GetFieldStore