import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, CommandInteraction, } from 'discord.js';
import { data as dbData, setting, user } from '../../database';
import { client } from '../../index';

/*
Reset all records of the bot
*/


const data = new SlashCommandBuilder()
  .setName('reset')
  .setDescription('重置所有紀錄')

export default {
  data: data,
  execute: async (interaction: ChatInputCommandInteraction) => {

    const response = await interaction.reply({
      content: "此指令將會將所有報刀記錄及成員資料初始化!\n請確認是否繼續?",
      ephemeral: true,
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          [
            new ButtonBuilder().setCustomId(interaction.id + "reset_confirm").setLabel("確定").setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId(interaction.id + "reset_cancel").setLabel("取消").setStyle(ButtonStyle.Secondary),
          ]
        )
      ]
    })

    const collectorFilter = i => i.user.id === interaction.user.id

    try {

      const buttonPressed = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 })
      if (buttonPressed.customId === interaction.id + "reset_confirm") {

        await buttonPressed.deferUpdate()

        const settings = await setting.get(interaction.guildId!)

        // check prerequisite exists
        if (settings.memberTable.channelId === "0" || settings.memberTable.messageId === "0") {
          await interaction.editReply({ content: `尚未設定成員列表\n請先用\`/setchannel\`進行設定`, components: [] });
          return
        }

        if (settings.knifeTable.channelId === "0" || settings.knifeTable.messageId === "0") {
          await interaction.editReply({ content: `尚未設定報刀列表\n請先用\`/setchannel\`進行設定`, components: [] });
          return
        }

        if (settings.user.roleId === "0") {
          await interaction.editReply({content: `尚未設定成員身份組\n請先用\`/setmemberrole\`進行設定`, components: [] });
          return
        }

        // get all roled users
        const guildMemberIds = await interaction.guild.members.fetch()
        .then(fetchedMembers => {
          const guildMemberIds = fetchedMembers
            .map(member => member)
            .filter(member => member.roles.cache.some(role => role.id == settings.user.roleId))
            .map(member => member.id)
          return guildMemberIds
        })

        // return if too many member
        // if (guildMemberIds.length > 30) {
        //   await interaction.editReply({ content: `成員人數超過30名! 請檢查擁有身份組的成員!`, components: [] });
        //   return
        // }

        // perform init on db data
        await dbData.init(interaction.guildId!)

        // delete all existing data
        await user.guildDeleteAll(interaction.guildId)


        await user.guildInit(interaction.guildId!, guildMemberIds)

        console.log("finish guild user init")
        // TODO update member and knife table

        await interaction.editReply({ content: '已重置所有紀錄!', components: [] });
        return

      } else {
        await interaction.editReply({ content: '已取消', components: [] });
      }


    } catch (e) {
      console.error(e)
      await interaction.editReply({ content: '指令已逾時', components: [] });
    }

  }
}