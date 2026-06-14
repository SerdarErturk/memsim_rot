import http from '../../../../services/httpService'
class NumeratorStore {
  public async getNextNumber(model: any) {

    var response = await http.post("Numerator/GetNextNumeratorValue", model);
    var result = response.data.result;
    return result;
  }
  public async getSystemNumeratorTemplate() {

    var response = await http.get("SystemNumerator/GetTemplate");
    var result = response.data.result;
    return result;
  }
  public async createNextNumber(systemNumaratorId:any) {

    var response = await http.get("SystemNumerator/GetNextNumeratorValue?systemNumaratorId="+systemNumaratorId);
    var result = response.data.result;
    return result;
  }
}
export default NumeratorStore