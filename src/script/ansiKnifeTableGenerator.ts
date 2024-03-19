import { client } from '../index'
import { record, setting, data } from '../database'
import { /* knifeCategoryTranslator, */ parseChineseBossNumber, weekToStage } from './util'
import config from '../config'
import { ExpandedDatabaseRecordData } from 'types/Database'
import { TextChannel } from 'discord.js'

import ANSI, { ANSIForeColor, ANSIBackColor, ANSIFontStyle } from '../script/ANSI'

export default async function generateANSIKnifeTable(guildId: string, round?: number): Promise<void> {

  const guildData = await data.get(guildId)
  const guildSetting = await setting.get(guildId)

  const minProgress = Math.min(...guildData.progress)
  const maxProgress = Math.max(...guildData.progress) + 2

  // generate at most 4 rounds and at least 3 rounds
  const tableWeekCount = Math.min(4, maxProgress - minProgress + 1)

  // early return if there is no need to update
  if (typeof round !== 'undefined' && (round <= minProgress || round >= minProgress + tableWeekCount - 1)) return console.log(`Record table of guild ${guildId} bypassed update`)

  const guild = client.guilds.cache.get(guildId)
  const members = guild.members.cache

  const recordFilter = `week >= ${minProgress} && week <= ${minProgress + tableWeekCount - 1}`
  const guildRecords = await record.getGuildRecords(guildId, recordFilter)

  // generate traversed record matrix
  const recordMatrix: ExpandedDatabaseRecordData[][][] = new Array(tableWeekCount).fill(0).map(() => new Array(5).fill(0).map(() => []))

  for (const record of guildRecords) {
    const recordTableWeek = record.week - minProgress;
    (recordMatrix[recordTableWeek][record.boss - 1]).push(record)
  }

  // header
  let tableText = `\`\`\`ansi\n戰隊尚餘: 🔷${guildData.knifeCount} 🔶${guildData.leftoverCount}\n`

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

        // evaluate total hp
        if (record.damage > 0) {
          if (!record.isCompleted) hp -= record.damage
        } else {
          // set hp invalid if there are empty records
          hpValid = false
        }

        //* bypass record printing if the boss is already completed and the record is 1) not next activator record or 2) is completed
        if (guildData.progress[j] > currentRound && !record.nextActivator && record.isCompleted) continue

        const guildMember = members.get(record.expand.user.userId)
        // TODO only reset ANSI color at the end of each row
        const recordText =
          ANSI.formatText(`${record.nextActivator
            ? "↪️"
            : (record.isCompleted ? "✅" : "")} ${record.expand.user.sl ? "⚠️" : ""}${guildMember.nickname ?? guildMember.user.globalName ?? guildMember.user.username}`
            + `${record.isCompleted
              ? ""
              : `${record.detail
                ? ` (${record.detail})`
                : ""}`}`,
            record.isLeftover ? ANSIForeColor.YELLOW : ANSIForeColor.BLUE
          )
          + ` ${!record.isCompleted && !!record.damage && record.damage > 0 ? `${record.damage.toString()}萬` : ""}`  // only add damage to non-completed records
        recordTextList.push(` ${record.isLeftover ? "🔶" : "🔷"}${recordText}\n`)

      }

      tableText += `${guildData.progress[j] === currentRound ? "▶️" : guildData.progress[j] > currentRound ? "✅" : "🕓"} ${parseChineseBossNumber(j + 1)}王 `
      tableText += guildData.progress[j] <= currentRound
        ? `${ANSI.formatText(hp.toString(), !hpValid ? ANSIForeColor.YELLOW : hp > 0 ? ANSIForeColor.GREEN : ANSIForeColor.RED, ANSIFontStyle.BOLD)}`
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

  } else {
    // update message
    const newMessage = await message.edit(tableText)
    console.log(`Record table updated.Table length: ${newMessage.content.length}`)
  }

  // update nickname
  const minRound = Math.min(...guildData.progress)
  await guild.members.me.setNickname(
    `${guildSetting.bot.nickname}${guildSetting.bot.showProgressInName ? ` | ${minRound + 1} - ${Math.min((Math.max(...guildData.progress) + 1), minRound + 2)}周` : ""}`
  )
  return
}
