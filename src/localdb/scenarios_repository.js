import { findAll, removeAll, saveAll } from './repository'
import Repository from './repository'
import { generateUUID } from 'utils/utils'

import ErrorLogStore from 'components/stores/errorLogStore'
var service = new Repository()
const Table = "Scenarios"
export const insertScenarios = (data) => {
    service.insert(Table, {
        ...data
    })
}
export const updateScenarios = (data) => {
    service.update(Table, {
        ...data

    })
}
export const getScenariosList = async () => {
    var result = await service.select(Table)
    return result;
}

export const getScenarios = async (id) => {
    var result = await service.findById(Table, id)
    return result;
}
export const deleteScenarios = async (id) => {

    await service.deleteById(Table, id)


    return true;
}


