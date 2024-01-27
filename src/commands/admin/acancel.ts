import { SlashCommandBuilder } from 'discord.js';

/*
Allow admin to remove a knife record
*/

export default {
  data: new SlashCommandBuilder()
    .setName('acancel')
    .setDescription('取消報刀')
    .addMentionableOption(option =>
      option
        .setName('member')
        .setDescription('成員')
        .setRequired(true)
    ),

  execute: async (interaction) => {
    await interaction.reply({
      content: "Cancel (admin)",
      ephemeral: true
    });
  },
}