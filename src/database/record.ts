import { RecordData, UserData, DatabaseUserData, DatabaseRecordData } from '../types/Database'
import { db } from '../index'

export default {

  add: async (guildId: string, userId: string, data: RecordData): Promise<boolean> => {

    try {
      await db.collection('record').create(data)
      return true

    } catch (e) {
      console.error(e)
      return false
    }

  },

  getGuildRecords: async(guildId: string, filter?: string): Promise<DatabaseRecordData[]> => {
    
    const recordFilter = !!filter ? `guildId = "${guildId}" && ${filter}` : `guildId = "${guildId}"`
    const records = await db.collection('record').getFullList<DatabaseRecordData>({
      filter: recordFilter,
      sort: "+updated"
    })

    return records

  },

  getUserRecords: async (databaseUserData: DatabaseUserData, filter?: string): Promise<DatabaseRecordData[]> => {

    const recordFilter = `user = "${databaseUserData.id}"${filter == "" || filter == undefined ? "" : ` && ${filter}`}`
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

  remove: async () => {

  }

}