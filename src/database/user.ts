import { UserData } from '../types/Database'
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

  guildDeleteAll: async (guildId: string) => {

    const guildUserDataList = await db.collection('user').getFullList({
      filter: `guildId = "${guildId}"`,
    })

    const userDeletePromises = []
    for (const guildUserData of guildUserDataList) {
      userDeletePromises.push(db.collection('user').delete(guildUserData.id))
    }
    await Promise.all(userDeletePromises)

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
        })
          .then(() =>
            console.log(`Created user ${userId} in guild ${guildId}`)
          )
      )

    }

    await Promise.all(userCreatePromises)

  }


}