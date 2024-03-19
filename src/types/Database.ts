import { KnifeCategory, KnifeType } from '../Enums'

export interface GuildSetting {

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

export type DatabaseGuildSetting = DatabaseFields & GuildSetting

export interface GuildData {

  guildId: string

  progress: [number, number, number, number, number] | number[]
  hp: [number, number, number, number, number] | number[]

  knifeCount: number
  leftoverCount: number

}

export interface GuildDataOperation {
  'knifeCount+'? : number
  'knifeCount-'? : number
  'leftoverCount+'? : number
  'leftoverCount-'? : number
}

export type DatabaseGuildData = DatabaseFields & GuildData

export interface UserData {
  userId: string
  guildId: string
  // nickname: string
  // record_ids: string[]
  knifeCount: number
  leftoverCount: number
  record: string[]
  sl: boolean
}

export interface UserDataOperation {
  'knifeCount+'? : number
  'knifeCount-'? : number
  'leftoverCount+'? : number
  'leftoverCount-'? : number
  'record+'? : string
  'record-'? : string
}

export interface RecordData {
  user: string
  // guildId: string
  // userId: string
  week: number
  boss: 1 | 2 | 3 | 4 | 5
  detail: string
  isLeftover: boolean
  isCompleted: boolean
  damage: number
  nextActivator: boolean
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
    readonly record: DatabaseRecordData[]
  }
}

