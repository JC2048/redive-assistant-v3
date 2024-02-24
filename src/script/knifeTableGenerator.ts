import { client } from '../index'
import { record, setting, data } from '../database'
import { knifeCategoryTranslator, parseChineseBossNumber, weekToStage } from './util'
import config from '../config'
import { ExpandedDatabaseRecordData } from '../types/Database'
import { Channel, TextChannel } from 'discord.js'


export default async function generateKnifeTable(guildId: string): Promise<void> {

  const guild = await client.guilds.fetch(guildId)
  const members = await guild.members.fetch()

  const guildData = await data.get(guildId)
  const guildSetting = await setting.get(guildId)

  const minProgress = Math.min(...guildData.progress)
  const maxProgress = Math.max(...guildData.progress) + 2

  // always generate at least 3 rounds
  const tableWeekCount = Math.max(3, maxProgress - minProgress + 1)

  const recordFilter = `week >= ${minProgress} && week <= ${minProgress + tableWeekCount - 1}`
  const guildRecords = await record.getGuildRecords(guildId, recordFilter)

  // generate traversed record matrix
  const recordMatrix: ExpandedDatabaseRecordData[][][] = new Array(tableWeekCount).fill(0).map(() => new Array(5).fill(0).map(() => []))

  for (const record of guildRecords) {
    const recordTableWeek = record.week - minProgress;
    (recordMatrix[recordTableWeek][record.boss - 1]).push(record)
  }

  // header
  let tableText = `\`\`\`\n戰隊尚餘: 🔹${guildData.knifeCount} 🔸${guildData.leftoverCount}\n`

  for (let i = 0; i < 5; i++) {

    tableText += `${parseChineseBossNumber(i + 1 as 1 | 2 | 3 | 4 | 5)}王 | ${guildData.progress[i] + 1}周 ${guildData.hp[i]}萬\n`

  }

  tableText += "--------------------\n\n"

  for (let i = 0; i < tableWeekCount; i++) {

    // week loop
    const currentRound = i + minProgress
    const currentWeek = currentRound + 1   // week = round + 1
    tableText += `${currentWeek}周-------${i === 0 || config.stageStart.indexOf(currentRound) !== -1 ? ` [${parseChineseBossNumber(weekToStage(currentWeek))}階段]` : "----"}\n`

    // boss loop
    for (let j = 0; j < 5; j++) {

      tableText += `${guildData.progress[j] === currentWeek - 1 ? "▶️" : guildData.progress[j] > currentWeek - 1 ? "✅" : "🕓"} ${parseChineseBossNumber(j + 1)}王 `
      tableText += `${guildData.progress[j] === currentWeek - 1 ? `${guildData.hp[j]}萬` : guildData.progress[j] > currentWeek - 1 ? "" : `${config.hp[weekToStage(currentWeek)][j]}萬`}\n`

      for (const record of recordMatrix[i][j]) {
        const guildMember = members.get(record.expand.user.id)
        tableText += `  ${record.isLeftover ? "🔸" : "🔹"}${record.isCompleted ? "✅" : ""} ${guildMember.nickname ?? guildMember.user.globalName ?? guildMember.user.username} ${record.isCompleted ? "" : `${knifeCategoryTranslator(record.category)}`}\n`
      }
    }
    tableText += "\n"
  }

  tableText += `\n最後更新： ${new Date().toLocaleString("ja-JP", { timeZone: "Asia/Hong_Kong", hour12: false })} 共 ${guildRecords.length} 則記錄\`\`\``

  // send out table
  const tableChannel = await guild.channels.cache.get(guildSetting.knifeTable.channelId) as TextChannel
  const message = await tableChannel.messages.fetch(guildSetting.knifeTable.messageId)

  if (!message) {
    // no message for you, send a new one
    const newMessage = await tableChannel.send(tableText)
    await setting.update(guildId, {
      knifeTable: {
        messageId: newMessage.id,
        channelId: newMessage.channelId,
        topMessage: guildSetting.knifeTable.topMessage
      }
    })
  } else {
    // update message
    await message.edit(tableText)
  }

  return

}
