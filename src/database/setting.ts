import { db } from '../index'
import { GuildSetting, DatabaseGuildSetting } from '../types/Database'

export default {

  init: async (guildId: string) => {

    const defaultSetting: Omit<GuildSetting, "id"> = {

      guildId: guildId,

      dashboard: {
        knifeTable: {
          channelId: "0",
          messageId: "0",
          topMessage: null,
        },
        memberTable: {
          channelId: "0",
          messageId: "0",
          topMessage: null,
        }
      },

      user: {
        maxReportCount: 12
      },

      bot: {
        nickname: "露娜 3.0",
        showProgressInName: false
      }

    }

    // check if guild_setting exists
    try {
      const oldSetting = await db.collection('guild_setting').getFirstListItem(`guildId = "${guildId}"`)
      // exists, overwrite
      await db.collection('guild_setting').update(
        oldSetting.id, defaultSetting
      )
      console.log(`Overwritten old setting for guild ${guildId}`)
    } catch (e) {
      // does not exist, create new
      await db.collection('guild_setting').create(
        defaultSetting,
      )
      console.log(`Created new setting for guild ${guildId}`)
    }
  }
}