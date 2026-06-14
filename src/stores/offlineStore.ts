

import http from '../services/httpService';

class OfflineStore {

  public async loadSelectData() {
    let response = await http.get("/Mobile/LoadMobileOfflineSelectData");
    var result = response.data.result
    return result;
  }
  public async getAllEvidenceType() {
    let response = await http.get("/EvidenceType/GetEvidenceAllList");
    var result = response.data.result
    return result;
  }
  public async getAllRivers() {
    let response = await http.get("/River/GetRiverAllList");
    var result = response.data.result
    return result;
  }
  public async getWorkTeamDetailList() {
    let response = await http.get("/WorkTeamDetail/GetWorkTeamDetailList");
    var result = response.data.result
    return result;
  }
  public async getMyPatrols() {
    let response = await http.get("/PatrolPlanning/GetPatrolPlanningWithWorkTeam");
    var result = response.data.result
    return result;
  }
  public async getMyRiverMeasurements() {
    let response = await http.get("/RiverMeasurement/GetRiverMeasurementWithWorkTeam");
    var result = response.data.result
    return result;
  }
  public async getRepairAndMaintenances() {
    let response = await http.get("/RepairAndMaintenance/GetRepairAndMaintenanceWithWorkTeam");
    var result = response.data.result
    return result;
  }
  public async getMyEvidences() {
    let response = await http.get("/Evidence/GetEvidenceWithWorkTeam");
    var result = response.data.result
    return result;
  }
}
export default OfflineStore;
