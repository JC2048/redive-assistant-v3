import { SlashCommandBuilder } from 'discord.js';
import generateANSIKnifeTable from '../../script/ansiKnifeTableGenerator';
import { argumentParser } from '../../script/argumentParser';

/*
Update knife or member dashboard
*/

const data = new SlashCommandBuilder()
  .setName('flush')
  .setDescription('刷新報刀/成員列表')
  .addStringOption(option =>
    option
      .setName('列表')
      .setDescription('刷新的列表')
      .setRequired(true)
      .setChoices(
        { name: '報刀列表', value: 'knife' },
        { name: '成員列表', value: 'member' },
      )
  )

export default {
  data: data,

  execute: async (interaction) => {
    await argumentParser(interaction, data.options, async (interaction, args) => {

      switch (args.list) {
        case 'knife':
          await generateANSIKnifeTable(interaction.guildId!)
          await interaction.reply({
            content: "已刷新報刀列表",
            ephemeral: true
          })
          return
        case 'member':
          // TODO generate member table
          await interaction.reply({
            content: "已刷新成員列表",
            ephemeral: true
          })
          return
        default:
          await interaction.reply({
            content: "執行錯誤! 請向管理員回報!",
            ephemeral: true
          })
          return
      }

    })
  },
}