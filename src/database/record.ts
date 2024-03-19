import { RecordData, UserData, DatabaseUserData, DatabaseRecordData, ExpandedDatabaseRecordData } from '../types/Database'
import { db } from '../index'

export default {

  add: async (data: RecordData): Promise<DatabaseRecordData | null> => {

    try {
      const record = await db.collection('record').create<DatabaseRecordData>(data)
      return record

    } catch (e) {
      console.error(e)
      return
    }

  },

  getGuildRecords: async (guildId: string, filter?: string): Promise<ExpandedDatabaseRecordData[]> => {

    const recordFilter = !!filter ? `user.guildId = "${guildId}" && ${filter}` : `user.guildId = "${guildId}"`
    const records = await db.collection('record').getFullList<ExpandedDatabaseRecordData>({
      filter: recordFilter,
      sort: "+updated",
      expand: "user"
    })

    return records

  },

  getByUser: async (databaseUserData: DatabaseUserData, filter?: string): Promise<DatabaseRecordData[]> => {

    const recordFilter = `user = "${databaseUserData.id}"${filter == "" || filter == undefined ? "" : ` && ${filter}`}`
    const records = await db.collection('record').getFullList<DatabaseRecordData>({
      filter: recordFilter,
      sort: "+updated"
    })

    return records

  },

  getById: async (guildId: string, userId: string, filter?: string): Promise<DatabaseRecordData[]> => {

    const recordFilter = `user.userId = "${userId}" && user.guildId = "${guildId}"${filter == "" || filter == undefined ? "" : ` && ${filter}`}`
    const records = await db.collection('record').getFullList<DatabaseRecordData>({
      filter: recordFilter,
      sort: "+updated"
    })

    return records
  },

  update: async (id: string, data: Partial<RecordData>): Promise<DatabaseRecordData> => {

    try {

      const record = await db.collection('record').update<DatabaseRecordData>(id, data)
      return record

    } catch (e) {

      console.log("[ERROR] Error while updating record " + id)
      console.error(e)
    }

  },

  remove: async (id: string): Promise<boolean> => {

    try {
      const isDeleted = await db.collection('record').delete(id)
      return isDeleted

    } catch (e) {

      console.log("[ERROR] Error while removing record " + id)
      console.error(e)
      return false
    }
  },

  removeGuildRecords: async (guildId: string) => {

    const guildRecordList = await db.collection('record').getFullList<DatabaseRecordData>({
      filter: `user.guildId = "${guildId}"`
    })

    const recordDeletePromises = []
    for (const record of guildRecordList) {
      recordDeletePromises.push(db.collection('record').delete(record.id))
    }
    if (recordDeletePromises.length > 0) await Promise.all(recordDeletePromises)

  }

}