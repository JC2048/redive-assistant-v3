import { client } from '../index'
import { record, setting, data } from '../database'
import { knifeCategoryTranslator, parseChineseBossNumber, weekToStage } from './util'
import config from '../config'
import { DatabaseRecordData, ExpandedDatabaseRecordData } from 'types/Database'
import { Channel, TextChannel } from 'discord.js'

import ANSI, { ANSIForeColor, ANSIBackColor, ANSIFontStyle } from '../script/ANSI'

export default async function generateANSIKnifeTable(guildId: string): Promise<void> {

  const guild = client.guilds.cache.get(guildId)
  const members = guild.members.cache

  const guildData = await data.get(guildId)
  const guildSetting = await setting.get(guildId)

  const minProgress = Math.min(...guildData.progress)
  const maxProgress = Math.max(...guildData.progress) + 2

  // always generate at least 3 rounds
  // const tableWeekCount = Math.max(3, maxProgress - minProgress + 1)

  // generate at most 4 rounds and at least 3 rounds
  const tableWeekCount = Math.min(4, maxProgress - minProgress + 1)

  const recordFilter = `week >= ${minProgress} && week <= ${minProgress + tableWeekCount - 1}`
  const guildRecords = await record.getGuildRecords(guildId, recordFilter)

  // generate traversed record matrix
  const recordMatrix: ExpandedDatabaseRecordData[][][] = new Array(tableWeekCount).fill(0).map(() => new Array(5).fill(0).map(() => []))

  for (const record of guildRecords) {
    const recordTableWeek = record.week - minProgress;
    (recordMatrix[recordTableWeek][record.boss - 1]).push(record)
  }

  // header
  let tableText = `\`\`\`ansi\n戰隊尚餘: 🔹${guildData.fullKnifeCount} 🔸${guildData.leftoverKnifeCount}\n`

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

      // initialize boss hp
      let hp = guildData.progress[j] === currentRound ? guildData.hp[j] : config.hp[weekToStage(currentWeek) - 1][j]
      let hpValid = true

      // generate record text
      const recordTextList: string[] = []
      for (const record of recordMatrix[i][j]) {
        const guildMember = members.get(record.expand.user.userId)
        const recordText = `${record.isCompleted ? "✅" : ""} ${guildMember.nickname ?? guildMember.user.globalName ?? guildMember.user.username} ${record.isCompleted ? "" : `${knifeCategoryTranslator(record.category)}`} ${!!record.damage && record.damage > 0 ? `${record.damage.toString()}萬` : ""}`
        recordTextList.push(` ${record.isLeftover ? "🔸" : "🔹"}${ANSI.formatText(recordText, record.isLeftover ? ANSIForeColor.YELLOW : ANSIForeColor.BLUE)}\n`)

        // evaluate total hp
        if (record.damage > 0) {
          hp -= record.damage
        } else {
          // set hp invalid if there are empty records
          hpValid = false
        }
      }

      tableText += `${guildData.progress[j] === currentRound ? "▶️" : guildData.progress[j] > currentRound ? "✅" : "🕓"} ${parseChineseBossNumber(j + 1)}王 `
      tableText += guildData.progress[j] <= currentRound
        ? `${ANSI.formatText(hp.toString(), !hpValid ? ANSIForeColor.YELLOW : hp > 0 ? ANSIForeColor.GREEN : [ANSIBackColor.DEEP_BLUE, ANSIForeColor.RED], ANSIFontStyle.BOLD)}`
        + (guildData.progress[j] === currentRound ? `/${config.hp[weekToStage(currentWeek) - 1][j]}萬\n` : "萬\n")
        : "\n"
      tableText += recordTextList.join("")

    }
    tableText += "\n"
  }

  tableText += `\n最後更新: ${new Date().toLocaleString("ja-JP", { timeZone: "Asia/Hong_Kong", hour12: false })} 共 ${guildRecords.length} 則記錄\`\`\``

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
    console.log(`Table length: ${newMessage.content.length}`)

  } else {
    // update message
    const newMessage = await message.edit(tableText)
    console.log(`Table length: ${newMessage.content.length}`)
  }

  // update nickname
  await guild.members.me.setNickname(
    `${guildSetting.bot.nickname}${guildSetting.bot.showProgressInName ? ` | ${Math.min(...guildData.progress) + 1} - ${Math.max(...guildData.progress) + 1}周` : ""}`
  )


  return

}
