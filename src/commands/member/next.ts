import { ActionRowBuilder, ComponentType, GuildMember, SlashCommandBuilder, StringSelectMenuBuilder, User, ButtonBuilder, ButtonStyle } from 'discord.js';
import { argumentParser } from '../../script/argumentParser';
import { data as dbData, user, record } from '../../database';
import { RecordColor, recordEmbedGenerator, recordStringSelectMenuBuilder } from '../../script/RecordProcessor';
import generateANSIKnifeTable from '../../script/ansiKnifeTableGenerator';
import { parseChineseBossNumber, weekToStage } from '../../script/util';
import config from '../../config';
import { GuildData } from 'types/Database';


const data = new SlashCommandBuilder()
  .setName('next')
  .setDescription('推進周目用指令')
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

export default {
  data: data,

  execute: async (interaction) => {
    await argumentParser(interaction, data.options, async (interaction, args) => {

      const nextNotificationMessage = await interaction.channel.send({
        content: `❗[${(interaction.member as GuildMember).nickname
          ?? (interaction.member.user as User).globalName
          ?? interaction.member.user.username
          }] 正在結算${parseChineseBossNumber(args.boss)}王...`
      })

      // TODO block any subsequent use of /next

      await interaction.deferReply({ ephemeral: true })

      // select knife to next
      const guildData = await dbData.get(interaction.guildId!)
      const records = await record.getGuildRecords(interaction.guildId, `week = ${guildData.progress[args.boss - 1]} && boss = ${args.boss} && isCompleted = true`)


      // return if no suitable record
      if (records.length === 0) {
        await interaction.editReply({
          content: `${guildData.progress[args.boss - 1] + 1}周${args.boss}王沒有可以進行結算的報刀！\n可以進行結算的報刀必須先行以\`/finish\`回填！`
        })
        nextNotificationMessage.delete()
        return
      }

      // create selection

      let selectedRecordId = "0"
      const guildMembers = interaction.guild.members.cache

      const recordSelect = recordStringSelectMenuBuilder(
        interaction.id, records, { placeholder: '請選擇要結算的報刀', },
        true, guildMembers
      )
      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(recordSelect)

      const recordSelectionMessage = await interaction.editReply({
        content: '請注意：選擇報刀結算後不能取消！\n指令會在30秒後取消。',
        components: [row]
      })

      //$ ----------------------------

      const selectionFilter = i => i.user.id === interaction.user.id

      try {
        const response = await recordSelectionMessage.awaitMessageComponent({
          filter: selectionFilter,
          componentType: ComponentType.StringSelect,
          time: 30_000,
        })

        if (response.customId === interaction.id + "record_select") {
          selectedRecordId = response.values[0]
        } else {
          throw new Error("Invalid Selection")
        }

        await response.update({ content: "處理中...", components: [] })

      } catch (e) {

        await interaction.editReply({
          content: "已取消。",
          components: []
        })
        nextNotificationMessage.delete()
        return
      }

      //$ ----------------------------
      const selectedRecord = records.find(r => r.id === selectedRecordId)!
      const recordMember = interaction.guild.members.cache.get(selectedRecord.expand.user.userId)
      if (!recordMember) {
        await interaction.editReply({
          content: '無法尋找報刀的使用者！\n請向管理員回報！'
        })
        nextNotificationMessage.delete()
        return
      }

      const confirmationMessage = await interaction.editReply({
        content: `確定要用這則報刀進行結算嗎？\n${selectedRecord.isLeftover ? ""
          : `- ${recordMember.nickname ?? recordMember.user.globalName ?? recordMember.user.username}會獲得一刀補償刀\n`}`
          + `- ${args.boss}王會推進到${guildData.progress[args.boss - 1] + 2}周\n`
          + `- 目前周目未回填的報刀將不能再使用\`/finish\`\n`
          + "請確認是否繼續?",
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId(interaction.id + "next_confirm").setLabel("確定").setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId(interaction.id + "next_cancel").setLabel("取消").setStyle(ButtonStyle.Secondary),
          )
        ],
        embeds: [recordEmbedGenerator(
          selectedRecord,
          recordMember,
          {
            color: selectedRecord.isLeftover ? RecordColor.LEFTOVER : RecordColor.NORMAL
          }
        )]
      })

      const confirmationFilter = i => i.user.id === interaction.user.id

      try {

        const buttonPressed = await confirmationMessage.awaitMessageComponent({ filter: confirmationFilter, time: 30_000 })

        if (buttonPressed.customId === interaction.id + "next_confirm") {

          // run next
          // update user
          if (!selectedRecord.isLeftover) {
            // add leftover to the user
            const userData = await user.get(interaction.guildId, recordMember.id)
            await user.updateByUser(userData, {
              // leftoverCount: Math.min(userData.leftoverCount + 1, 3)
              'leftoverCount+': 1
            })

            // const guildData = await dbData.get(interaction.guildId)
            // await dbData.update(interaction.guildId, {
            //   'leftoverCount+': 1
            // })
          }

          // update record nextActivator status
          await record.update(selectedRecord.id, {
            nextActivator: true
          })

          // update guild status
          const guildData = await dbData.get(interaction.guildId)
          const updatedData: Partial<GuildData> = {
            progress: [...guildData.progress],
            hp: [...guildData.hp],
          }
          if (!selectedRecord.isLeftover) {
            // add leftover to the guild
            updatedData.leftoverCount = guildData.leftoverCount + 1
          }
          const newProgress = updatedData.progress[args.boss - 1] + 1
          updatedData.progress[args.boss - 1] = newProgress
          updatedData.hp[args.boss - 1] = config.hp[weekToStage(newProgress + 1) - 1][args.boss - 1]
          await dbData.update(interaction.guildId, updatedData)

          // create tag message
          const nextRoundRecords = await record.getGuildRecords(interaction.guildId, `week = ${newProgress} && boss = ${args.boss}`)

          let tagString: string
          if (nextRoundRecords.length === 0) {
            tagString = ""
          } else {
            const userIds = [...new Set(nextRoundRecords.map(r => r.expand.user.userId))]
            // console.log(userIds)
            tagString = userIds.map(id => `<@${id}>`).join(" ")
          }

          // edit original message & follow up
          await interaction.editReply({
            content: '✅ 已進行結算!',
            components: [],
            embeds: []
          })
          await interaction.followUp({
            content: `✅ 已為${guildData.progress[args.boss - 1] + 1}周${args.boss}王進行結算 : 目前${args.boss}王進度為${guildData.progress[args.boss - 1] + 2}周${tagString === "" ? "" : `\n`
              + `以下成員請準備出刀：${tagString}`}\n出刀前請緊記：借角色、調星數、檢查Rank、放裝備！`,
            ephemeral: false,
            embeds: [recordEmbedGenerator(
              selectedRecord, recordMember, {
              nextActivator: true,
              footer: `結算周目${args.boss}王`
            }
            )]
          })
          nextNotificationMessage.delete()
          generateANSIKnifeTable(interaction.guildId)
          return

        } else {
          await interaction.editReply({ content: '已取消', components: [], embeds: [] })
          nextNotificationMessage.delete()
          return
        }
      } catch (e) {

        await interaction.editReply({ content: '🕓 已逾時', components: [], embeds: [] })
        nextNotificationMessage.delete()
        return

      }

    })
  },
}