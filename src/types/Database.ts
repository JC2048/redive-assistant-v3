import { KnifeCategory, KnifeType } from '../Enums'

export interface DatabaseGuildSetting extends DatabaseFields {

  readonly collectionName: "guild_setting"

  guildId: string

  knifeTable: {
    channelId: string
    messageId: string
    topMessage?: string | null
  }
  memberTable: {
    channelId: string
    messageId: string
    topMessage?: string | null
  }

  user: {
    roleId: string
    maxReportCount: number
  }

  bot: {
    nickname: string
    showProgressInName: boolean
  }

}

export interface GuildSetting extends Omit<DatabaseGuildSetting, "id" | "created" | "updated" | "collectionId" | "collectionName"> { }

export interface DatabaseGuildData extends DatabaseFields {

  readonly collectionName: "guild_data"

  guildId: string

  progress: [number, number, number, number, number] | number[]
  hp: [number, number, number, number, number] | number[]

  knifeCount: number
  leftoverCount: number

}

export interface GuildData extends Omit<DatabaseGuildData, "id" | "created" | "updated" | "collectionId" | "collectionName"> { }

export interface UserData {
  userId: string
  guildId: string
  // nickname: string
  // record_ids: string[]
  knifeCount: number
  leftoverCount: number
  record: string[]
}

export interface RecordData {
  user: string
  // guildId: string
  // userId: string
  week: number
  boss: 1 | 2 | 3 | 4 | 5
  category: KnifeCategory
  isLeftover: boolean
  isCompleted: boolean
  damage: number
}

interface DatabaseFields {
  readonly id: string
  readonly created: string | Date
  readonly updated: string | Date

  readonly collectionId: string
  readonly collectionName: string
}

export type DatabaseRecordData = DatabaseFields & RecordData
export type ExpandedDatabaseRecordData = DatabaseRecordData & {
  readonly expand: {
    readonly user: DatabaseUserData
  }
}

export type DatabaseUserData = DatabaseFields & UserData

export type ExpandedDatabaseUserData = DatabaseUserData & {
  readonly expand: {
    readonly record: DatabaseRecordData | DatabaseRecordData[]
  }
}

