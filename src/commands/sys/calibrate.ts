import { SlashCommandBuilder } from 'discord.js';

import generateKnifeTable from '../../script/knifeTableGenerator';
import { weekToStage } from '../../script/util';

import { user, data as dbData } from '../../database';
import config from '../../config';
import generateANSIKnifeTable from 'script/ansiKnifeTableGenerator';
import generateANSIMemberTable from 'script/ansiMemberTableGenerator';

const data = new SlashCommandBuilder()
  .setName('calibrate')
  .setDescription('校正剩餘正刀及補償刀數量')

export default {
  data: data,
  execute: async (interaction) => {

    await interaction.deferReply()

    // get all users
    const users = await user.getGuildUsers(interaction.guildId!, true);
    const guildData = await dbData.get(interaction.guildId!)

    const currentProgress = guildData.progress
    const newHpArr: number[] = []
    for (let i = 0; i < 5; i++) {
      newHpArr[i] = config.hp[weekToStage(currentProgress[i] + 1) - 1][i]
    }

    const calibratedGuildData = {
      knifeCount: 0,
      leftoverCount: 0,
      hp: [0, 0, 0, 0, 0]
    }
    const calibratedUserId: string[] = []
    let isGuildDataCalibrated = false
    let isGuildHpCalibrated = false

    for (const guildUser of users) {

      if (!guildUser.expand) {
        calibratedGuildData.knifeCount += 3
        continue
      }

      // evaluate the knife count
      const records = guildUser.expand!.record.filter(r => r.isCompleted)
      let calKnifeCount = 3, calLeftoverCount = 0

      /* 
      only count finished knife
      if normal knife & not next: knife count - 1
      if normal knife & next: knife count - 1, leftover + 1
      if leftover knife leftover - 1
      */

      for (const record of records) {
        if (!record.isLeftover) {
          calKnifeCount -= 1
          if (record.nextActivator) calLeftoverCount += 1
        } else {
          calLeftoverCount -= 1
        }

        // calibrate current hp
        if (record.isCompleted && (record.week == guildData.progress[record.boss - 1])) {
          newHpArr[record.boss - 1] -= record.damage
        }

      }

      if (!(guildUser.knifeCount === calKnifeCount && guildUser.leftoverCount === calLeftoverCount)) {
        // update the record if needed
        await user.updateByUser(guildUser, {
          knifeCount: calKnifeCount,
          leftoverCount: calLeftoverCount
        })
        calibratedUserId.push(guildUser.userId)
        isGuildDataCalibrated = true
      }

      // update the calibrated guild data
      calibratedGuildData.knifeCount += calKnifeCount
      calibratedGuildData.leftoverCount += calLeftoverCount

    }

    // update guild data if needed 
    if (!(guildData.knifeCount === calibratedGuildData.knifeCount && guildData.leftoverCount === calibratedGuildData.leftoverCount)) {
      calibratedGuildData.knifeCount = Math.min(90, calibratedGuildData.knifeCount)
      await dbData.update(interaction.guildId!, calibratedGuildData)
      isGuildDataCalibrated = true
    }

    // update hp
    if (!(guildData.hp[0] === newHpArr[0] && guildData.hp[1] === newHpArr[1] && guildData.hp[2] === newHpArr[2] && guildData.hp[3] === newHpArr[3] && guildData.hp[4] === newHpArr[4])) {
      await dbData.update(interaction.guildId!, { hp: newHpArr })
      isGuildHpCalibrated = true
    }

    let message: string = ""
    if (!isGuildDataCalibrated) {
      message += "沒有需要校正的正刀及補償刀數量"
    } else {
      message += "已校正公會剩餘正刀及補償刀數量"
      if (calibratedUserId.length > 0) {
        message += `\n已校正以下使用者的剩餘正刀及補償刀數量:\n${calibratedUserId.map(id => `<@${id}>`).join('\n')}`
      }
      generateANSIMemberTable(interaction.guildId)
    }
    if (!isGuildHpCalibrated) {
      message += "\n沒有需要校正的HP"
    } else {
      message += "\n已校正公會HP"
      generateANSIKnifeTable(interaction.guildId)
    }

    await interaction.editReply({
      content: message,
      ephemeral: true
    })
  },
}