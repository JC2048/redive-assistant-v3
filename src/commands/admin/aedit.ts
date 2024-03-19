import { SlashCommandBuilder } from 'discord.js';

import { KnifeCategory } from '../../Enums';

/*
Allow admin to edit a knife record
*/

export default {
  data: new SlashCommandBuilder()
    .setName('aedit')
    .setDescription('編輯報刀紀錄')
    .addMentionableOption(option =>
      option
        .setName('member')
        .setDescription('成員')
        .setRequired(true)
    )
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
    .addBooleanOption(option =>
      option
        .setName('leftover')
        .setDescription('補償刀')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('備註')
        .setDescription('備註')
        .setRequired(false)
    ),


  execute: async (interaction) => {
    await interaction.reply({
      content: "Edit (admin)",
      ephemeral: true
    });
  },
}