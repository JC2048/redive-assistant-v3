import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { argumentParser } from '../../script/argumentParser';
import { KnifeCategory } from '../../Enums';


import { user, record, data as dbData } from '../../database';

// import { knifeCategoryTranslator } from '../../script/util';
import { RecordColor, recordEmbedGenerator } from '../../script/RecordProcessor';
import { RecordData } from '../../types/Database';
import generateANSIKnifeTable from '../../script/ansiKnifeTableGenerator';

/*
Allow user to submit a knife record to the db
*/

const data = new SlashCommandBuilder()
  .setName('aknife')
  .setDescription('[管理員]新增報刀紀錄')
  .addUserOption(option =>
    option
      .setName('成員')
      .setDescription('成員')
      .setRequired(true)
  )
  .addIntegerOption(option =>
    option
      .setName('周目')
      .setDescription('周目')
      .setRequired(true)
  )
  .addIntegerOption(option =>
    option
      .setName('王')
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
  .addIntegerOption(option =>
    option
      .setName('補償')
      .setDescription('補償刀')
      .setRequired(true)
      .setChoices(
        { name: '否', value: 0 },
        { name: '是', value: 1 },
      )
  )
  .addIntegerOption(option =>
    option
      .setName('傷害')
      .setDescription('傷害')
      .setRequired(false)
  )
  .addStringOption(option =>
    option
      .setName('備註')
      .setDescription('備註')
      .setRequired(false)
  )

export default {
  data: data,
  execute: async (interaction: ChatInputCommandInteraction) => {

    await argumentParser(interaction, data.options, async (interaction, args) => {

      await interaction.deferReply({ ephemeral: true })

      // handle input user
      const selectedUserId = args.user.id

      // handle condition
      // console.log("[/knife] getting user data")
      const userData = await user.get(interaction.guildId, selectedUserId)
      if (userData == null) {
        await interaction.editReply({
          content: `無法尋找<@${selectedUserId}>的成員紀錄!`,
        })
        // TODO init user??
        return
      }

      // criteria check
      /*
      1.  Week count (BYPASS FOR ADMIN) 
          The report week should be limited to max week + 2

      2.  User knife count: 
          Normal: knifeCount > 0
          Leftover: knifeCount + leftoverCount > 0
      */

      // 2
      if (userData.knifeCount + (args.leftover === 1 ? userData.leftoverCount : 0) <= 0) {
        await interaction.editReply({
          content: `<@${selectedUserId}>的出刀數已經用完!`,
        })
        return
      }

      if (args.week <= 0) {
        await interaction.editReply({
          content: `你是打錯周目還是腦袋有問題?`,
        })
        return
      }

      // $ 1 (BYPASS)
    
      // console.log("[/knife] getting guild data")
      // const guildData = await dbData.get(interaction.guildId!)
      // if (args.week - 1 < guildData.progress[args.boss - 1]) {
      //   await interaction.editReply({
      //     content: `不能在已過去的周目新增報刀!`,
      //   })
      //   return
      // } else if (args.week - 1 > Math.min(4, Math.max(...guildData.progress) - Math.min(...guildData.progress) + 1)) {
      //   await interaction.editReply({
      //     content: `報刀周目不能大幅超越目前進度!\n請參考報刀表上的周目進行報刀!`,
      //   })
      //   return
      // }

      const recordData: RecordData = {
        user: userData.id,
        // guildId: interaction.guildId,
        // userId: interaction.user.id,
        week: args.week - 1,
        boss: args.boss,
        detail: args.detail ? args.detail : "",
        isLeftover: args.leftover === 1,
        isCompleted: false,
        damage: args.damage ?? 0,
        nextActivator: false
      }

      const newRecord = await record.add(recordData)
      if (!newRecord) {

        await interaction.editReply({
          content: '無法新增報刀!\n請向會長或管理員回報!',
        })
        return

      }

      // update user data
      await user.updateByUser(userData, {
        record: [...userData.record, newRecord.id],
      })

      await interaction.editReply({
        content: `✅ 已為<@${selectedUserId}>新增報刀!`,
      })

      const selectedMember = interaction.guild.members.cache.get(selectedUserId)

      await interaction.followUp({
        content: `${(interaction.member as GuildMember).nickname ?? interaction.user.globalName ?? interaction.user.username}已為 <@${selectedUserId}> 新增報刀`,
        embeds: [recordEmbedGenerator(recordData, selectedMember, { footer: '新增報刀' })],
        ephemeral: false
      })

      generateANSIKnifeTable(interaction.guildId)

    })
  },
}