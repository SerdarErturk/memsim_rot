import { findAll, removeAll, saveAll } from './repository'
import Repository from './repository'
import { generateUUID } from 'utils/utils'

import ErrorLogStore from 'components/stores/errorLogStore'
var service = new Repository()
const Table = "Log"
export const insertLogs = (data) => {
    service.insert(Table, {
        ...data
    })
}
export const updateLogs = (data) => {
    service.update(Table, {
        ...data

    })
}
export const getLogsList = async () => {
    var result = await service.select(Table)
    return result;
}

export const getLogs = async (id) => {
    var result = await service.findByGuidId(Table, id)
    return result;
}
export const deleteLogs = async (id) => {

    await service.deleteById(Table, id)


    return true;
}
export const deleteAllLogs = async () => {

    var result = service.delete(Table)


    return true;
}

