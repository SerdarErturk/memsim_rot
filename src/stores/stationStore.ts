import http from '../services/httpService';
class StationStore {

  public async getStationIdByKp(km: any, m: any) {
    let response = await http.get("/station/GetStationIdByKp?km=" + km + "&m=" + m);
    var result = response.data.result
    return result;
  }
}
export default StationStore;
