import { findAll, removeAll, saveAll } from './repository'
import Repository from './repository'
import { generateUUID } from 'utils/utils'

import ErrorLogStore from 'components/stores/errorLogStore'
var service = new Repository()
const Table = "Targets"
export const insertTargets = (data) => {
    service.insert(Table, {
        ...data
    })
}
export const updateTargets = (data) => {
    service.update(Table, {
        ...data

    })
}
export const getTargetsList = async () => {
    var result = await service.select(Table)
    return result;
}

export const getTargets = async (id) => {
    var result = await service.findByGuidId(Table, id)
    return result;
}
export const deleteTargets = async (id) => {

    await service.deleteById(Table, id)


    return true;
}


