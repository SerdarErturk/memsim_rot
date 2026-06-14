import { findAll, removeAll, saveAll } from './repository'
import Repository from './repository'
var service = new Repository()
const Table = "SelectboxData"
export const insertSelectboxData = (data) => {
    service.insert(Table, {
        ...data

    })
}
export const clearAndInsert = (data, endpoint) => {
    var result = service.delete(Table, { endpoint: endpoint })

    data.map(x => {
        service.insert(Table, {
            ...x

        })
    })
}
export const clearAllAndInsert = (data) => {
    var result = service.delete(Table)
    data.map(x => {
        service.insert(Table, {
            ...x

        })
    })
}

export const getSelectboxDataList = async (endpoint) => {
    var result = await service.select(Table, null, { endpoint })
   var result2 = await service.select(Table);
    return result;
}

