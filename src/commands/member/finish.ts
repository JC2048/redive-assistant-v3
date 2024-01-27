import { SlashCommandBuilder } from 'discord.js';

/*
Allow user to complete a knife record to the db
*/

export default {
  data: new SlashCommandBuilder()
    .setName('finish')
    .setDescription('回填報刀紀錄')
    // .addIntegerOption(option =>
    //   option
    //     .setName('week')
    //     .setDescription('周目')
    //     .setRequired(true)
    // )
    .addIntegerOption(option =>
      option
        .setName('boss')
        .setDescription('王 (1-5)')
        .setRequired(true)
        .setChoices(
          { name: '一王', value: 1 },
          { name: '二王', value: 2 },
          { name: '三王', value: 3 },
          { name: '四王', value: 4 },
          { name: '五王', value: 5 },
        )
    )
    .addBooleanOption(option =>
      option
        .setName('leftover')
        .setDescription('補償刀')
        .setRequired(true)
    ),

  execute: async (interaction) => {
    await interaction.reply({
      content: "Finish",
      ephemeral: true
    });
  },
}