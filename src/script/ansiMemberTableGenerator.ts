import { client } from '../index'
import { record, setting, data, user } from '../database'
import { DatabaseRecordData } from 'types/Database'
import { Channel, TextChannel } from 'discord.js'

import ANSI, { ANSIForeColor, ANSIFontStyle } from '../script/ANSI'

export default async function generateANSIMemberTable(guildId: string, force: boolean = false) {

  const guildData = await data.get(guildId)
  const guildSetting = await setting.get(guildId)

  const guild = client.guilds.cache.get(guildId)
  const members = guild.members.cache

  // get all members
  const users = await user.getGuildUsers(guildId, true)
  users.sort((a, b) => parseInt(a.userId) - parseInt(b.userId))
  users.sort((a, b) => b.knifeCount - a.knifeCount)

  let tableText = `\`\`\`ansi\n戰隊尚餘: 🔷${guildData.knifeCount} 🔶${guildData.leftoverCount}\n\n`
  // console.log(users)

  for (const userData of users) {

    const member = members.get(userData.userId)
    if (!member) continue

    // let userText = `${ANSI.formatText(userData.knifeCount.toString(), ANSIForeColor.BLUE)}|${ANSI.formatText(userData.leftoverCount.toString(), ANSIForeColor.YELLOW)} `
    //   + `${userData.knifeCount + userData.leftoverCount === 0 ? "✅" : ""}${member.nickname ?? member.user.globalName ?? member.user.username}`

    // $ Disabled coloring of remaining knife count
    let userText = `${userData.knifeCount}|${userData.leftoverCount} ${userData.knifeCount + userData.leftoverCount === 0 ? "✅" : ""}${member.nickname ?? member.user.globalName ?? member.user.username}`

    const fullRecords = userData.expand?.record.filter(r => !r.isLeftover && r.isCompleted) ?? []
    const leftoverRecords = userData.expand?.record.filter(r => r.isLeftover && r.isCompleted) ?? []

    function generateRecordLine(records: DatabaseRecordData[]): string {
      return records.reduce((text: string, record) => {
        if (!record.isCompleted) return text
        return text + ` ${record.week + 1}-${record.boss}`
      }, "")
    }

    // if (fullRecords.length > 0) userText += ` 🔷${ANSI.formatText(generateRecordLine(fullRecords), ANSIForeColor.BLUE)}`
    // if (leftoverRecords.length > 0) userText += ` 🔶${ANSI.formatText(generateRecordLine(leftoverRecords), ANSIForeColor.YELLOW)}`

    // TODO reset the end tag after each line
    if (fullRecords.length > 0) userText += ` 🔷${ANSI.formatText(generateRecordLine(fullRecords), ANSIForeColor.BLUE)}`
    if (leftoverRecords.length > 0) userText += ` 🔶${ANSI.formatText(generateRecordLine(leftoverRecords), ANSIForeColor.YELLOW)}`

    tableText += `${userText}\n`
  }

  tableText += `\n最後更新: ${new Date().toLocaleString("ja-JP", { timeZone: "Asia/Hong_Kong", hour12: false })}\`\`\``

  const tableChannel = await guild.channels.cache.get(guildSetting.memberTable.channelId) as TextChannel
  const message = await tableChannel.messages.fetch(guildSetting.memberTable.messageId)

  if (!message) {
    const newMessage = await tableChannel.send(tableText)
    await setting.update(guildId, {
      memberTable: {
        channelId: tableChannel.id,
        messageId: newMessage.id,
        topMessage: guildSetting.knifeTable.topMessage
      }
    })
  } else {
    const newMessage = await message.edit(tableText)
  }
  return

}