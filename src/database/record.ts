import { RecordData } from '../types/Database'
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

  get: async () => {

  },

  update: async () => {

  },

  remove: async () => {

  }

}