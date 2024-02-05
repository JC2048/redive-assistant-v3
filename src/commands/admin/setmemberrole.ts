import { RoleManager, SlashCommandBuilder } from 'discord.js';
import { argumentParser } from '../../script/argumentParser';
import { setting } from '../../database';

/*
Manually set round for bosses
*/

const data = new SlashCommandBuilder()
  .setName('setmemberrole')
  .setDescription('設定成員身分組')
  .addRoleOption(option =>
    option
      .setName('身分組')
      .setDescription('身分組')
      .setRequired(true)
  )

export default {
  data: data,

  execute: async (interaction) => {
    await argumentParser(interaction, data.options, async (interaction, args) => {

      if (args.role.name === "@everyone") {

        await interaction.reply({ content: "無法設定 @everyone 作為成員身分組!", ephemeral: true })
        return

      }

      const oldSetting = await setting.get(interaction.guildId!)

      await setting.update(interaction.guildId!, {
        user: {
          roleId: args.role.id,
          maxReportCount: oldSetting.user.maxReportCount
        }
      })

      await interaction.reply({ content: `已將成員身分組設定為 <@&${args.role.id}>`, ephemeral: true })

    })
  },
}