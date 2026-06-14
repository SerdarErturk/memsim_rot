

import http from '../services/httpService';
class Memsimtore {
  public async addShotStatistic(model: any) {

      let response = await http.post('ShotStatistic/AddShotStatisticFromMobile', model);
      console.log(response.data)
      var result = response.data.result;
      return result;
    
  }

 
}
export default Memsimtore;
