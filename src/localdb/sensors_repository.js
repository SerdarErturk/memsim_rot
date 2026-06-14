import { findAll, removeAll, saveAll } from './repository'
import Repository from './repository'
import { generateUUID } from 'utils/utils'

import ErrorLogStore from 'components/stores/errorLogStore'
var service = new Repository()
const Table = "Sensors"
export const insertSensors = (data) => {
    service.insert(Table, {
        ...data
    })
}
export const updateSensors = (data) => {
    service.update(Table, {
        ...data

    })
}
export const getSensorsList = async () => {
    var result = await service.select(Table)
    return result;
}

export const getSensors = async (id) => {
    var result = await service.findByGuidId(Table, id)
    return result;
}
export const deleteSensors = async (id) => {

    await service.deleteByGuidId(Table, id)


    return true;
}


