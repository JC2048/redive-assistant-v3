import { SlashCommandBuilder } from 'discord.js';

import { KnifeCategory } from '../../Enums';

/*
Allow user to submit a knife record to the db
*/

export default {
  data: new SlashCommandBuilder()
    .setName('knife')
    .setDescription('新增報刀紀錄')
    .addIntegerOption(option =>
      option
        .setName('week')
        .setDescription('周目')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('boss')
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
        .setName('category')
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
    .addBooleanOption(option =>
      option
        .setName('leftover')
        .setDescription('補償刀')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('note')
        .setDescription('備註')
        .setRequired(false)
    ),

  execute: async (interaction) => {
    await interaction.reply({
      content: "Knife",
      ephemeral: true
    });
  },
}