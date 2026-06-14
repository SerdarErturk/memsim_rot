import { findAll, removeAll, saveAll } from './repository'
import Repository from './repository'
import { generateUUID } from 'utils/utils'

import ErrorLogStore from 'components/stores/errorLogStore'
var service = new Repository()
const Table = "Time"
export const insertTime = (data) => {
    service.insert(Table, {
        ...data
    })
}
export const updateTime = (data) => {
    service.update(Table, {
        ...data

    })
}
export const getTimeList = async () => {
    var result = await service.select(Table)
    return result;
}

export const getTime = async (id) => {
    var result = await service.findByGuidId(Table, id)
    return result;
}
export const deleteTime = async (id) => {

    await service.deleteByGuidId(Table, id)


    return true;
}


