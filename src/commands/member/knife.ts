import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

import { KnifeCategory } from '../../Enums';
import { argumentParser } from '../../script/argumentParser';

import { user, record } from '../../database';

import { knifeCategoryTranslator } from '../../script/util';

/*
Allow user to submit a knife record to the db
*/

const data = new SlashCommandBuilder()
  .setName('knife')
  .setDescription('新增報刀紀錄')
  .addIntegerOption(option =>
    option
      .setName('周目')
      .setDescription('周目')
      .setRequired(true)
  )
  .addIntegerOption(option =>
    option
      .setName('王')
      .setDescription('王 (1-5)')
      .setRequired(true)
      .setChoices(
        { name: '一王', value: 1 },
        { name: '二王', value: 2 },
        { name: '三王', value: 3 },
        { name: '四王', value: 4 },
        { name: '五王', value: 5 },
      )
  )
  .addStringOption(option =>
    option
      .setName('種類')
      .setDescription('種類')
      .setRequired(true)
      .setChoices(
        { name: '物理刀', value: KnifeCategory.PHYSICAL },
        { name: '法刀', value: KnifeCategory.MAGIC },
        { name: '新黑刀', value: KnifeCategory.NYARU },
        { name: '超佩刀', value: KnifeCategory.PEKO },
        { name: '其他', value: KnifeCategory.OTHER },
      )
  )
  .addIntegerOption(option =>
    option
      .setName('補償刀')
      .setDescription('補償刀')
      .setRequired(true)
      .setChoices(
        { name: '否', value: 0 },
        { name: '是', value: 1 },
      )
  )
  .addStringOption(option =>
    option
      .setName('備註')
      .setDescription('備註')
      .setRequired(false)
  )

export default {
  data: data,
  execute: async (interaction: ChatInputCommandInteraction) => {

    await argumentParser(interaction, data.options, async (interaction, args) => {

      await interaction.deferReply()
      const userData = await user.get(interaction.guildId, interaction.user.id)
      if (userData == null) {
        await interaction.editReply({
          content: '無法尋找你的成員紀錄!\n請向會長或管理員回報!',
        })
        return
      }
      const response = await record.add(interaction.guildId, interaction.user.id, {
        user: userData.id,
        week: args.week - 1,
        boss: args.boss,
        category: args.category,
        isLeftover: args.leftover === 1,
        isCompleted: false
      })
      if (response) {
        await interaction.editReply({
          content: `已新增報刀紀錄!\n${args.week}周${args.boss}王 ${knifeCategoryTranslator(args.category)} ${args.leftover === 1 ? '(補償)' : ''} ${!!args.note ? `\n${args.note}` : ''}`,
        })
        // TODO use embed message
      } else {
        await interaction.editReply({
          content: '無法新增報刀紀錄!\n請向會長或管理員回報!',
        })
      }

    })
  },
}