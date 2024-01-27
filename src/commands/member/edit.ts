import { SlashCommandBuilder } from 'discord.js';

import { KnifeCategory } from '../../Enums';

/*
Allow user to edit a knife record
*/

export default {
  data: new SlashCommandBuilder()
    .setName('edit')
    .setDescription('編輯報刀紀錄')
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
    ),

  execute: async (interaction) => {
    await interaction.reply({
      content: "Edit",
      ephemeral: true
    });
  },
}