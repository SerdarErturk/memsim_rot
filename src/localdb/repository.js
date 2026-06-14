import SQLite from 'react-native-sqlite-storage';
import WebSQLite from 'websqlite';

const SQLiteManager = new WebSQLite();

export default class Repository {

    /**
     * 
     */
    init() {
        SQLiteManager.init({
            id: 'ber.bil.dbV1',
            dbObject: SQLite,
        })
    }

    /**
     * 
     * @param {*} tableName 
     * @param {*} columns 
     * @param {*} where 
     */
    async select(tableName, columns, where) {
        if (where) {
            var whereKey = Object.keys(where)[0]
            var whereValue = where[whereKey]
            return await SQLiteManager.select(tableName, ((columns || columns === "") ? "*" : columns), whereKey + " = ?", [whereValue])
        }
        else {
            return await SQLiteManager.select(tableName, ((columns || columns === "") ? "*" : columns))
        }
    }
    async findByGuidId(tableName, id) {
        var data = await SQLiteManager.select(tableName, ("*"), " guidId= ?", [id])
        if (data.length > 0) {
            return data[0]
        }
        else {
            return {}
        }

    }
    async findById(tableName, id) {
        var data = await SQLiteManager.select(tableName, ("*"), " id= ?", [id])
        if (data.length > 0) {
            return data[0]
        }
        else {
            return {}
        }

    }
    async findByDbId(tableName, id) {
        var data = await SQLiteManager.select(tableName, ("*"), " dbId= ?", [id])
        if (data.length > 0) {
            return data[0]
        }
        else {
            return {}
        }

    }
    /**
     * 
     * @param {*} tableName 
     * @param {*} data 
     */
    insert(tableName, data) {
        let model=require('../localdb/dbObject.json')[tableName].properties
        var keys = Object.keys(model)
        var values = keys.map((key) => data[key])
        SQLiteManager.insert(tableName, keys, values)
    }

    /**
     * 
     * @param {*} tableName 
     * @param {*} data 
     * @param {*} where 
     */
    update(tableName, data) {
        let model=require('../localdb/dbObject.json')[tableName].properties
        var keys = Object.keys(model)
        var values = keys.map((key) => data[key])
        SQLiteManager.update(tableName, keys, values, " id = ?", [data.id])
    }

    /**
     * 
     * @param {*} tableName 
     * @param {*} where 
     */
    delete(tableName, where) {
        if (where) {
            var whereKey = Object.keys(where)[0]
            var whereValue = where[whereKey]

            SQLiteManager.delete(tableName, whereKey + " = ?", [whereValue])
        } else {
            SQLiteManager.delete(tableName)
        } 

    }
    deleteById(tableName, id) {
        SQLiteManager.delete(tableName, " id= ?", [id])
    }
    deleteByGuidId(tableName, GuidId) {
        SQLiteManager.delete(tableName, " guidId= ?", [GuidId])
    }
    /**
     * 
     * @param {*} query 
     */
    executeSQL(query) {
        SQLiteManager.query(query)
    }

    /**
     * 
     * @param {*} tableName 
     * @param {*} columns 
     */
    createTable(tableName, columns) {
        var query = "";
        for (var i = 0; i < columns.length; i++) {
            if (i === columns.length - 1) {
                query += '"' + columns[i].name + '" ' + columns[i].dataType + ' ' + ((columns[i].isNotNull) ? "NOT NULL " : "") + columns[i].options
            } else {
                query += '"' + columns[i].name + '" ' + columns[i].dataType + ' ' + ((columns[i].isNotNull) ? "NOT NULL " : "") + columns[i].options + ','
            }
        }
        this.executeSQL("CREATE TABLE IF NOT EXISTS " + tableName + ' (' + query + ')')
    }

    deleteTable(tableName) {

        this.executeSQL("DROP TABLE " + tableName)
    }
}