import { findAll, removeAll, saveAll } from './repository'
import Repository from './repository'
import { generateUUID } from 'utils/utils'
import EvidenceStore from 'stores/evidenceStore'
import NetworkUtils from 'utils/networkUtills'
import OfflineStore from 'stores/offlineStore'
import { Alert } from 'react-native';
import { RepairPlanningStatus } from 'utils/enums'

import { getPermission, getToken } from 'utils/auth'
import ErrorLogStore from 'components/stores/errorLogStore'
var service = new Repository()
const Table = "Memsim"
export const insertShotStatistic = (data) => {
    data.sync = 0;
    data.guidId = generateUUID();
    service.insert(Table, {
        ...data
    })
}
export const updateShotStatistic = (data) => {
  
  
    service.update(Table, {
        ...data

    })
}
export const getShotStatisticList = async () => {
    var result = await service.select(Table)
    return result;
}

export const getShotStatistic = async (id) => {
    var result = await service.findByGuidId(Table, id)
    return result;
}
export const deleteShotStatistic  = async (id) => {

    await service.deleteByGuidId(Table, id)


    return true;
}


export const syncEvidence = async () => {
//     var internetConnection = await NetworkUtils.isNetworkAvailable();
//     if (!internetConnection) {
//         return;
//     }
//     var token = await getToken();

//     if (!token) {
//         return;
//     }
//     var permissionData = await getPermission();
//     let permissions = permissionData ? JSON.parse(await getPermission()) : {};
//     var offlineStore = new OfflineStore();
//     var errorLogs = await service.select("ErrorLog", null)

//     if (errorLogs && errorLogs.length > 0) {
//         var erroLogStore = new ErrorLogStore();
//         errorLogs.map(async x => {
//             await erroLogStore.addErrorLog(x)
//         })

//     }
//     if (permissions && permissions.evidence) {
//         await service.delete(Table, { sync: 0 })
//         let dbEvindences = await service.select(Table, null, { sync: 1 })
//         let myEvindences = await offlineStore.getMyEvidences();
//         myEvindences.map(async (x) => {
//             x.dbId = x.id;
//             x.dbGuidId = x.guidId;
//             let result = dbEvindences.filter(a => x.id == a.dbId)
//             if (result.length == 0) {
//                 x.sync = 0;
//                 delete x.id;
//                 insertEvidence(x)
//             }
//         })
//         var result2 = await service.select(Table)
//     }
 



 


//     var data = await offlineStore.loadSelectData();
//    let evidenceTypes = await offlineStore.getAllEvidenceType();
//     let rivers = await offlineStore.getAllRivers();
//     let wortTeamDetails = await offlineStore.getWorkTeamDetailList();
//     service.delete("EvidenceType")
//     service.delete("River")
//     service.delete("WorkTeamDetail")
//     evidenceTypes.map(x => {
//         x.dbId = x.id;
//         delete x.id;
//         insertEvidenceType(x);
//     })
//     rivers.map(x => {
//         x.anyCompleteMeasurement = x.anyCompleteMeasurement == true ? 1 : 0
//         x.dbId = x.id;
//         delete x.id;
//         insertRiver(x);
//     })
//     wortTeamDetails.map(x => {
//         x.isTeamLead = x.isTeamLead == true ? 1 : 0
//         x.dbId = x.id;
//         delete x.id;
//         insertWorkTeamDetail(x);
//     })
  

}
