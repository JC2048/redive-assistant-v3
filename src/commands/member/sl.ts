import { SlashCommandBuilder } from 'discord.js';

const data = new SlashCommandBuilder()
  .setName('sl')
  .setDescription('SL用指令')

export default {
  data: data,
  execute: async (interaction) => {
    interaction.reply({
      content: "sl",
      ephemeral: true
    })
  },
}