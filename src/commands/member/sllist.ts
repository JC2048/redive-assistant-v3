import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { user } from '../../database';

const data = new SlashCommandBuilder()
  .setName('sllist')
  .setDescription('檢查成員斷線狀態')

export default {
  data: data,
  execute: async (interaction) => {
    await interaction.deferReply({ ephemeral: true })

    const userData = await user.getGuildUsers(interaction.guildId)
    const slUserIds = userData.filter(user => user.sl).map(user => `<@${user.userId}>`)

    await interaction.editReply({
      content: `目前有 ${slUserIds.length} 位成員已SL${slUserIds.length > 0 ? ":\n" + slUserIds.join("\n") : "。"}`,
    })

  },
}