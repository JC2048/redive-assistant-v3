import { KnifeCategory, KnifeType } from '../Enums'

export interface DatabaseGuildSetting {

  id: string
  readonly created: string | Date
  readonly updated: string | Date

  readonly collectionId: string,
  readonly collectionName: "guild_setting",

  dashboard: {
    knife_table: {
      channel_id: string
      message_id: string
      top_message: string | null
    }
    member_table: {
      channel_id: string
      message_id: string
      top_message: string | null
    }
  }

  user: {
    max_report_count: number
  }

  bot: {
    nickname: string
    showProgressInName: boolean
  }

}

export interface DatabaseGuildData {

  id: string
  readonly created: string | Date
  readonly updated: string | Date

  readonly collectionId: string,
  readonly collectionName: "guild_data",

  progress: [number, number, number, number, number]
  hp: [number, number, number, number, number]

  full_knife_count: number
  leftover_knife_count: number

}

export interface UserData {
  user_id: string
  guild_id: string
  // nickname: string
  // record_ids: string[]
  knife_count: number
  leftover_count: number
}

export interface RecordData {
  user: unknown
  week: number
  boss: 1 | 2 | 3 | 4 | 5
  category: KnifeCategory
  isLeftover: KnifeType
}

interface DatabaseFields {
  readonly id: string
  readonly created: string | Date
  readonly updated: string | Date
}

export type DatabaseRecordData = DatabaseFields & RecordData
export type DatabaseUserData = DatabaseFields & UserData

