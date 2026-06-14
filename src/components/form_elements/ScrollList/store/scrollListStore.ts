

import http from '../../../../services/httpService'

class ScrollListStore {


  public async loadData(endPoint: string, body: any) {
    let response;
    response = await http.post(endPoint, body);
    var result = response.data.result;
    return result;
  }

}
export default ScrollListStore