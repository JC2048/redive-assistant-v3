import { ActionRowBuilder, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType, GuildMember } from 'discord.js';
import { argumentParser } from '../../script/argumentParser';
import { knifeCategoryTranslator } from '../../script/util';

import { data as dbData, user, record } from '../../database';
import { RecordColor, recordEmbedGenerator } from '../../script/RecordProcessor';
import generateANSIKnifeTable from '../../script/ansiKnifeTableGenerator';

/*
Allow user to complete a knife record to the db
*/

const data = new SlashCommandBuilder()
  .setName('afinish')
  .setDescription('[管理員]回填報刀紀錄')
  // .addIntegerOption(option =>
  //   option
  //     .setName('week')
  //     .setDescription('周目')
  //     .setRequired(true)
  // )
  .addUserOption(option =>
    option
      .setName('成員')
      .setDescription('成員')
      .setRequired(true)
  )
  // .addIntegerOption(option =>
  //   option
  //     .setName('王')
  //     .setDescription('王 (1-5)')
  //     .setRequired(true)
  //     .setChoices(
  //       { name: '一王', value: 1 },
  //       { name: '二王', value: 2 },
  //       { name: '三王', value: 3 },
  //       { name: '四王', value: 4 },
  //       { name: '五王', value: 5 },
  //     )
  // )
  .addIntegerOption(option =>
    option
      .setName('傷害')
      .setDescription('傷害')
      .setRequired(true)
  )
// .addBooleanOption(option =>
//   option
//     .setName('補償刀')
//     .setDescription('補償刀')
//     .setRequired(true)
// )

export default {
  data: data,

  execute: async (interaction) => {
    await argumentParser(interaction, data.options, async (interaction, args) => {

      await interaction.deferReply({ ephemeral: true })
      const userData = await user.get(interaction.guildId, args.user.id, true)
      if (userData == null) {
        await interaction.editReply({
          content: '無法尋找你的成員紀錄!\n請向會長或管理員回報!',
        })
        return
      }

      // criteria check
      /*
      1.  Uncompleted record exists on current round of selected boss and of suitable week
      2.  User has enough knife count
          Normal knife: knifeCount > 0
          Leftover knife: leftoverCount > 0
      3.  args.damage should be reasonable
      */

      // 3
      if (args.damage < 0) {
        await interaction.editReply({
          content: '傷害不能為負數!'
        })
        return
      }

      const guildData = await dbData.get(interaction.guildId)
      // const bossRound = guildData.progress[args.boss - 1]

      // 2
      if (userData.knifeCount === 0 && userData.leftoverCount === 0) {
        await interaction.editReply({
          content: '今天的出刀數已經用完!'
        })
        return
      }

      // const filter = `boss = ${args.boss} && week = ${bossRound} && isCompleted = false`;
      const recordList = userData.expand?.record ?? []
      const filteredRecordList = recordList.filter((record) => record.isCompleted === false).filter((record) => (userData.knifeCount > 0 ? !record.isLeftover : false) || (userData.leftoverCount > 0 ? record.isLeftover : false));

      // 1
      if (recordList.length === 0) {
        await interaction.editReply({
          content: `<@${args.user}> 沒有未完成的報刀紀錄!`
        })
        return
      }
      if (filteredRecordList.length === 0) {
        await interaction.editReply({
          content: `<@${args.user}> 沒有可以回填的報刀紀錄!`
        })
        return
      }

      let selectedRecordId = "0"

      // if(recordList.length === 1) {
      //   // auto finish, no choice
      //   selectedRecordId = recordList[0].id
      // } else {

      // create selection
      const recordSelect = new StringSelectMenuBuilder()
        .setCustomId(interaction.id + "record_select")
        .setPlaceholder("選擇一則報刀紀錄")
        .addOptions([
          ...recordList.map((record) =>
            new StringSelectMenuOptionBuilder()
              .setLabel(`${record.isLeftover ? "🔶" : "🔷"}${record.week + 1}周${record.boss}王`)
              .setDescription(`${knifeCategoryTranslator(record.category)}`)
              .setValue(record.id)
          )
        ])
        .setMinValues(1)
        .setMaxValues(1)

      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(recordSelect)

      const recordSelectionMessage = await interaction.editReply({
        content: `剩餘刀數: 🔷${userData.knifeCount} | 🔶${userData.leftoverCount}\n請注意：選擇報刀後不能取消！\n指令會在30秒後取消。`,
        components: [row]
      })

      const collectorFilter = i => i.user.id === interaction.user.id

      try {

        const response = await recordSelectionMessage.awaitMessageComponent({
          filter: collectorFilter,
          componentType: ComponentType.StringSelect,
          time: 30_000
        })

        if (response.customId == interaction.id + "record_select") {
          selectedRecordId = response.values[0]
        } else {
          throw new Error("Invalid Selection")
        }

      } catch (e) {

        await interaction.editReply({
          content: "🕓 已逾時",
          components: []
        })
        return

      }

      // update the record
      const updatedRecord = await record.update(selectedRecordId, {
        isCompleted: true,
        damage: args.damage
      })

      // update user data & guild data
      const updatedHp = [...guildData.hp]
      updatedHp[args.boss - 1] = Math.max(guildData.hp[args.boss - 1] - args.damage, 0)

      // TODO trigger NEXT event since hp is below 0

      if (updatedRecord.isLeftover) {
        await user.updateByUser(userData, {
          // leftoverCount: Math.max(userData.leftoverCount - 1, 0),
          'leftoverCount-': 1,
        })
        await dbData.update(interaction.guildId, {
          hp: updatedHp,
          // leftoverCount: Math.max(guildData.leftoverCount - 1, 0),
          'leftoverCount-': 1
        })

      } else {
        await user.updateByUser(userData, {
          // knifeCount: Math.max(userData.knifeCount - 1, 0),
          'knifeCount-': 1
        })
        await dbData.update(interaction.guildId, {
          hp: updatedHp,
          // knifeCount: Math.max(guildData.knifeCount - 1, 0)
          'knifeCount-': 1
        })
      }

      interaction.editReply({
        content: "✅ 已回填報刀紀錄。",
        components: []
      })
      const selectedMember = interaction.guild.members.cache.get(args.user.id)
      interaction.followUp({
        embeds: [recordEmbedGenerator(updatedRecord, selectedMember, {
          isCompleted: true,
          color: RecordColor.COMPLETE,
          footer: "回填報刀",
        })]
      })
      generateANSIKnifeTable(interaction.guildId)

      // }

    })
  },
}