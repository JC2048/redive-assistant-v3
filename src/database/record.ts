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

  getUserRecords: async (databaseUserData: DatabaseUserData, filter: string): Promise<DatabaseRecordData[]> => {

    const recordFilter = `user = "${databaseUserData.id}"${filter == "" ? "" : ` && ${filter}`}`
    const records = await db.collection('record').getFullList({
      filter: recordFilter,
    })

    return records as DatabaseRecordData[]

  },
  
  update: async () => {

  },

  remove: async () => {

  }

}