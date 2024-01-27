import { SlashCommandBuilder } from 'discord.js';

/*
Reset all records of the bot
*/

export default {
  data: new SlashCommandBuilder()
    .setName('reset')
    .setDescription('重置所有紀錄'),

  execute: async (interaction) => {
    await interaction.reply({
      content: "reset",
      ephemeral: true
    });
  },
}