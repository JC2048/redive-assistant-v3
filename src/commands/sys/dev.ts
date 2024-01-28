import { SlashCommandBuilder } from 'discord.js';

import setting from '../../database/setting';

const data = new SlashCommandBuilder()
  .setName('dev')
  .setDescription('dev')

export default {
  data: data,
  execute: async (interaction) => {
    interaction.reply({
      content: "dev",
      ephemeral: true
    })
  },
}