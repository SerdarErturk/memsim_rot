import { utils } from '@react-native-firebase/app'
import { findAll, removeAll, saveAll } from './repository'
import Repository from './repository'
import { deviceInfo } from '../utils/utils';
var service = new Repository()
const Table = "ErrorLog"
export const insertErrorLog = async (data) => {
    var device = await deviceInfo();
    data.deviceInfo = data.deviceInfo + JSON.stringify(device);
    service.insert(Table, {
        ...data

    })
}

export const getErrorLog = async () => {
    var result = await service.select(Table)
    return result;
}
