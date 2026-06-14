import { findAll, removeAll, saveAll } from './repository'
import Repository from './repository'
import { generateUUID } from 'utils/utils'

import ErrorLogStore from 'components/stores/errorLogStore'
var service = new Repository()
const Table = "Puan"
export const insertPuan = (data) => {
    service.insert(Table, {
        ...data
    })
}
export const updatePuan = (data) => {
    service.update(Table, {
        ...data

    })
}
export const getPuanList = async () => {
    var result = await service.select(Table)
    return result;
}

export const getPuan = async (id) => {
    var result = await service.findByGuidId(Table, id)
    return result;
}
export const deletePuan = async (id) => {

    await service.deleteByGuidId(Table, id)


    return true;
}


