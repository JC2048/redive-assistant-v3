import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Pong'),

  execute: async (interaction) => {
    await interaction.reply({
      content: "Pong!",
      ephemeral: true
    });
  },
}