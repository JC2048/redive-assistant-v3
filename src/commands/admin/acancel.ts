import { user, record } from '../../database';
import { ActionRowBuilder, ChatInputCommandInteraction, ComponentType, GuildMember, SlashCommandBuilder, StringSelectMenuBuilder } from 'discord.js';
import { DatabaseRecordData } from '../../types/Database';
import { RecordColor, recordEmbedGenerator, recordStringSelectMenuBuilder } from '../../script/RecordProcessor';
import generateANSIKnifeTable from '../../script/ansiKnifeTableGenerator';
import { argumentParser } from '../../script/argumentParser';

/*
Allow user to remove a knife record
*/
const data = new SlashCommandBuilder()
  .setName('acancel')
  .setDescription('[管理員]取消報刀')
  .addUserOption(option =>
    option
      .setName('成員')
      .setDescription('成員')
      .setRequired(true)
  )

export default {
  data: data,

  execute: async (interaction: ChatInputCommandInteraction) => {

    await argumentParser(interaction, data.options, async (interaction, args) => {
      const message = await interaction.deferReply({ ephemeral: true })
      const userData = await user.get(interaction.guildId, args.user.id, true)
      if (!userData) {
        await interaction.editReply({ content: '無法尋找你的成員紀錄!\n請向會長或管理員回報!', })
        return
      }

      // filter unfinished records
      const _records = userData.expand.record as DatabaseRecordData[]
      const records = _records.filter(r => !r.isCompleted)


      if (records.length === 0) {
        await interaction.editReply({
          content: `<@${args.user.id}>沒有可以刪除的報刀！`
        })
        return
      }

      // create selection

      let selectedRecordId = "0"

      const recordSelect = recordStringSelectMenuBuilder(interaction.id, records, { placeholder: "選擇要刪除的報刀" })
      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(recordSelect)

      const recordSelectionMessage = await interaction.editReply({
        content: `你正在為 <@${args.user.id}> 刪除報刀。\n請注意：選擇報刀後不能取消！\n指令會在30秒後取消。`,
        components: [row]
      })

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

      } catch (e) {

        interaction.editReply({
          content: "🕓 已逾時",
          components: []
        })
        return

      }

      // TODO one more layer confirmation
      // delete record

      const isDeleted = await record.remove(selectedRecordId)
      if (isDeleted) {
        const deletedRecord = records.find(r => r.id === selectedRecordId)

        interaction.editReply({
          content: `✅ 已為 <@${args.user.id}> 刪除報刀！`,
          components: []
        })
        const selectedMember = interaction.guild.members.cache.get(args.user.id)
        interaction.followUp({
          embeds: [
            recordEmbedGenerator(deletedRecord, selectedMember, {
              color: RecordColor.CANCEL,
              footer: "刪除報刀",
            })
          ]
        })
        generateANSIKnifeTable(interaction.guild.id)
      }
    })

  }
}