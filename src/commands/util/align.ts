import { SlashCommandBuilder } from 'discord.js';

/*
Align team timeline using given leftover time
*/

export default {
  data: new SlashCommandBuilder()
    .setName('align')
    .setDescription('按補償時間轉軸')
    .addStringOption(option =>
      option
        .setName('leftover_time')
        .setDescription('補償時間')
        .setRequired(true)
    ),

  execute: async (interaction) => {
    await interaction.reply({
      content: "align",
      ephemeral: true
    });
  },
}