import { SlashCommandBuilder } from 'discord.js';

/*
Manually set round for bosses
*/

export default {
  data: new SlashCommandBuilder()
    .setName('setprogress')
    .setDescription('設定周目')
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
    .addIntegerOption(option =>
      option
        .setName('round')
        .setDescription('周目')
        .setRequired(true)
    ),

  execute: async (interaction) => {
    await interaction.reply({
      content: "setprogress",
      ephemeral: true
    });
  },
}