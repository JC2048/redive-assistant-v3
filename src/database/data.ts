import { db } from '../index'
import { GuildData } from '../types/Database'
import config from '../config'

export default {
  init: async(guildId: string) => {
    
    const defaultData: GuildData = {

      guildId: guildId,

      progress: [0, 0, 0, 0, 0],
      hp: config.hp[0] as [number, number, number, number, number],

      fullKnifeCount: 90,
      leftoverKnifeCount: 0

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

  }
}