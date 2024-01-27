import { SlashCommandBuilder } from 'discord.js';

/*
Allow user to remove a knife record
*/

export default {
  data: new SlashCommandBuilder()
    .setName('cancel')
    .setDescription('取消報刀'),

  execute: async (interaction) => {
    await interaction.reply({
      content: "Cancel",
      ephemeral: true
    });
  },
}