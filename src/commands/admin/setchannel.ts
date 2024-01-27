import { SlashCommandBuilder } from 'discord.js';

/*
Set channel for dashboards
*/

export default {
  data: new SlashCommandBuilder()
    .setName('setchannel')
    .setDescription('設定報刀/成員列表頻道')
    .addStringOption(option =>
      option
        .setName('category')
        .setDescription('刷新類別')
        .setRequired(true)
        .setChoices(
          { name: '報刀列表', value: 'knife' },
          { name: '成員列表', value: 'member' },
        )
    )
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('頻道')
        .setRequired(true)
    ),

  execute: async (interaction) => {
    await interaction.reply({
      content: "setchannel",
      ephemeral: true
    });
  },
}