import { UserData, DatabaseUserData, ExpandedDatabaseUserData } from '../types/Database'
import { db } from '../index'

async function get(guildId: string, userId: string): Promise<DatabaseUserData | undefined>;
async function get(guildId: string, userId: string, expand: true): Promise<ExpandedDatabaseUserData | undefined>;
async function get(guildId: string, userId: string, expand?: boolean): Promise<DatabaseUserData | ExpandedDatabaseUserData | undefined> {
  const data = await db.collection('user').getFirstListItem(
    `userId = "${userId}" && guildId = "${guildId}"`,
    expand ? { expand: 'record' } : undefined
  )
  if (!!data) return data as DatabaseUserData | ExpandedDatabaseUserData
  else return undefined
}

async function getGuildUsers(guildId: string): Promise<DatabaseUserData[]>;
async function getGuildUsers(guildId: string, expand: true): Promise<ExpandedDatabaseUserData[]>;
async function getGuildUsers(guildId: string, expand?: boolean): Promise<DatabaseUserData[] | ExpandedDatabaseUserData[]> {
  const data = await db.collection('user').getFullList<DatabaseUserData | ExpandedDatabaseUserData>(
    {
      filter: `guildId = "${guildId}"`,
      expand: expand ? 'record' : undefined
    }
  )
  return data
}

export default {

  create: async (guildId: string, userId: string) => {

    const data: UserData = {
      userId: userId,
      guildId: guildId,
      knifeCount: 3,
      leftoverCount: 0,
      record: []
    }

    await db.collection('user').create(
      data
    )

  },

  // get: async (guildId: string, userId: string): Promise<DatabaseUserData | undefined> => {

  //   const data = await db.collection('user').getFirstListItem(`userId = "${userId}" && guildId = "${guildId}"`)
  //   if (!!data) return data as DatabaseUserData
  //   else return undefined

  // },
  get,

  updateByUser: async (userData: DatabaseUserData, data: Partial<UserData>) => {

    try {
      await db.collection('user').update(userData.id, data)
    } catch (e) {
      console.log("[ERROR] Error while updating user data for user " + userData.userId)
      console.error(e)
    }

  },

  getGuildUsers,

  deleteGuildUsers: async (guildId: string) => {

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