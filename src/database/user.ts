import { UserData, DatabaseUserData } from '../types/Database'
import { db } from '../index'

export default {

  create: async (guildId: string, userId: string) => {

    const data: UserData = {

      userId: userId,
      guildId: guildId,
      knifeCount: 3,
      leftoverCount: 0

    }

    await db.collection('user').create(
      data
    )

  },

  get: async (guildId: string, userId: string): Promise<DatabaseUserData | null> => {

    const data = await db.collection('user').getFirstListItem(`userId = "${userId}" && guildId = "${guildId}"`)
    if (!!data) return data as DatabaseUserData
    return null
    
  },

  guildDeleteAll: async (guildId: string) => {

    const guildUserDataList = await db.collection('user').getFullList({
      filter: `guildId = "${guildId}"`,
    })

    const userDeletePromises = []
    for (const guildUserData of guildUserDataList) {
      userDeletePromises.push(db.collection('user').delete(guildUserData.id, { requestKey: guildUserData.id }))
    }
    if (userDeletePromises.length > 0) await Promise.all(userDeletePromises)

  },

  guildInit: async (guildId: string, userIds: string[]) => {

    const userCreatePromises = []
    for (const userId of userIds) {

      userCreatePromises.push(
        db.collection('user').create({
          userId: userId,
          guildId: guildId,
          knifeCount: 3,
          leftoverCount: 0
        }, {
          requestKey: userId
        })
          .then(() =>
            console.log(`Created user ${userId} in guild ${guildId}`)
          )
      )

    }

    await Promise.all(userCreatePromises)

  }


}