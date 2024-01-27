import { SlashCommandBuilder } from 'discord.js';

/*
Initialize all settings of the bot
*/

export default {
  data: new SlashCommandBuilder()
    .setName('init')
    .setDescription('初始化'),

  execute: async (interaction) => {
    await interaction.reply({
      content: "init",
      ephemeral: true
    });
  },
}