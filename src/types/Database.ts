interface GuildSetting {

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

interface GuildData {

  progress: [number, number, number, number, number]
  hp: [number, number, number, number, number]

  knife: {
    full: number
    leftover: number
  }

}

interface UserData {
  id: string
  nickname: string
  record_ids: string[]
  knife_count: number
  compensate_count: number
}