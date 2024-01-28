import { SlashCommandBuilder } from 'discord.js';

/*
Reset all records of the bot
*/


const data = new SlashCommandBuilder()
  .setName('reset')
  .setDescription('重置所有紀錄')

export default {
  data: data,
  execute: async (interaction) => {

    await interaction.reply({
      content: "reset",
      ephemeral: true
    })

  }
}