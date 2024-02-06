import { SlashCommandBuilder } from 'discord.js';

import generateKnifeTable from '../../script/knifeTableGenerator';
import { weekToStage } from '../../script/util';

const data = new SlashCommandBuilder()
  .setName('dev')
  .setDescription('dev')

export default {
  data: data,
  execute: async (interaction) => {

    await interaction.deferReply()

    const msg = await generateKnifeTable(interaction.guildId)

    await interaction.editReply({
      content: msg,
      ephemeral: true
    })
  },
}