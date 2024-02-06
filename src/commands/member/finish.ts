import { ActionRowBuilder, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType } from 'discord.js';
import { argumentParser } from '../../script/argumentParser';
import { knifeCategoryTranslator } from '../../script/util';

import { data as dbData, user, record } from '../../database';

/*
Allow user to complete a knife record to the db
*/

const data = new SlashCommandBuilder()
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

      await interaction.deferReply()
      const userData = await user.get(interaction.guildId, interaction.user.id)
      if (userData == null) {
        await interaction.editReply({
          content: '無法尋找你的成員紀錄!\n請向會長或管理員回報!',
        })
        return
      }

      const guildData = await dbData.get(interaction.guildId)
      const bossRound = guildData.progress[args.boss - 1]

      // perform query
      const filter = `boss = ${args.boss} && week = ${bossRound} && isCompleted = false`;
      const recordList = await record.getUserRecords(userData, filter)

      if (recordList.length === 0) {
        await interaction.editReply({
          content: `在${bossRound + 1}周${args.boss}王沒有對應的報刀！\n請確定對應周目已有報刀紀錄，並且目前周目進度正確。`
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
              .setLabel(`${record.isLeftover ? "🔸" : "🔹"}${record.week + 1}周${record.boss}王`)
              .setDescription(`${knifeCategoryTranslator(record.category)}`)
              .setValue(record.id)
          )
        ])

      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(recordSelect)

      const response = await interaction.editReply({
        content: `請選擇一則報刀紀錄：指令會在30秒後取消。`,
        components: [row]
      })

      const collectorFilter = i => i.user.id === interaction.user.id

      try {

        const userSelectedRecord = await response.awaitMessageComponent({
          componentType: ComponentType.StringSelect,
          filter: collectorFilter,
          time: 30_000
        })

      } catch (e) {

      }



      // }



    })
  },
}