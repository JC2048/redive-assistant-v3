import { SlashCommandBuilder } from 'discord.js';

/*
Manually set hp for bosses
*/

export default {
  data: new SlashCommandBuilder()
    .setName('sethp')
    .setDescription('設定血量')
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
        .setName('hp')
        .setDescription('血量')
        .setRequired(true)
    ),

  execute: async (interaction) => {
    await interaction.reply({
      content: "sethp",
      ephemeral: true
    });
  },
}