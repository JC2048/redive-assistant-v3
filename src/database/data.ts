import { db } from '../index'
import { DatabaseGuildData, GuildData } from '../types/Database'
import config from '../config'

export default {
  init: async(guildId: string) => {
    
    const defaultData: GuildData = {

      guildId: guildId,

      progress: [0, 0, 0, 0, 0],
      hp: config.hp[0] as [number, number, number, number, number],

      knifeCount: 90,
      leftoverCount: 0

    }

    // check if guild_data exists
    try {
      const oldData = await db.collection('guild_data').getFirstListItem(`guildId = "${guildId}"`)
      // exists, overwrite
      await db.collection('guild_data').update(
        oldData.id, defaultData
      )
      console.log(`Overwritten old Data for guild ${guildId}`)
    } catch (e) {
      // does not exist, create new
      await db.collection('guild_data').create(
        defaultData,
      )
      console.log(`Created new Data for guild ${guildId}`)
    }

  },

  update: async(guildId: string, data: Partial<GuildData>) => {
    try {
      const oldData = await db.collection('guild_data').getFirstListItem(`guildId = "${guildId}"`)
      await db.collection('guild_data').update(
        oldData.id, data
      )
    } catch (e) {
      console.log("[ERROR] Error while updating guild data for guild " + guildId)
      console.error(e)
    }
  },

  get: async(guildId: string): Promise<DatabaseGuildData> => {

    try {
      const data = await db.collection('guild_data').getFirstListItem<DatabaseGuildData>(`guildId = "${guildId}"`)
      return data
    } catch (e) {
      console.log("[ERROR] Error while getting guild data for guild " + guildId)
      console.error(e)
    }
  }
}