import { SlashCommandBuilder } from 'discord.js';

/*
Update knife or member dashboard
*/

export default {
  data: new SlashCommandBuilder()
    .setName('flush')
    .setDescription('刷新報刀/成員列表')
    .addStringOption(option =>
      option
        .setName('category')
        .setDescription('刷新類別')
        .setRequired(true)
        .setChoices(
          { name: '報刀列表', value: 'knife' },
          { name: '成員列表', value: 'member' },
        )
    ),

  execute: async (interaction) => {
    await interaction.reply({
      content: "Flush",
      ephemeral: true
    });
  },
}