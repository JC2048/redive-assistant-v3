import { SlashCommandBuilder } from 'discord.js';

import { KnifeCategory } from '../../Enums';
import { argumentParser } from '../../script/argumentParser';

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
  execute: async (interaction) => {
    await argumentParser(interaction, data.options, async (interaction, args) => {

      // console.log(JSON.stringify(args, null, 2))
      // await interaction.reply({
      //   content: (args.category == KnifeCategory.PHYSICAL).toString(),
      //   ephemeral: true
      // })

    })
  },
}