import { user, record } from '../../database';
import { ActionRowBuilder, ChatInputCommandInteraction, ComponentType, GuildMember, SlashCommandBuilder, StringSelectMenuBuilder } from 'discord.js';
import { DatabaseRecordData } from '../../types/Database';
import { RecordColor, recordEmbedGenerator, recordStringSelectMenuBuilder } from '../../script/RecordProcessor';
import ansiMemberTableGenerator from '../../script/ansiMemberTableGenerator';
import generateANSIKnifeTable from '../../script/ansiKnifeTableGenerator';

/*
Allow user to remove a knife record
*/

export default {
  data: new SlashCommandBuilder()
    .setName('cancel')
    .setDescription('取消報刀'),

  execute: async (interaction: ChatInputCommandInteraction) => {

    await interaction.deferReply({ ephemeral: true })
    const userData = await user.get(interaction.guildId, interaction.user.id, true)
    if (!userData) {
      await interaction.editReply({ content: '無法尋找你的成員紀錄!\n請向會長或管理員回報!', })
      return
    }

    // filter unfinished records
    const _records = userData.expand.record as DatabaseRecordData[]
    const records = _records.filter(r => !r.isCompleted)


    if (records.length === 0) {
      await interaction.editReply({
        content: '沒有可以刪除的報刀！'
      })
      return
    }

    // create selection

    let selectedRecordId = "0"

    const recordSelect = recordStringSelectMenuBuilder(interaction.id, records, { placeholder: "選擇要刪除的報刀" })
    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(recordSelect)

    const recordSelectionMessage = await interaction.editReply({
      content: '請注意：選擇報刀後不能取消！\n指令會在30秒後取消。',
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

      await interaction.editReply({
        content: "已取消。",
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
        content: `✅ 已刪除報刀！`,
      })
      interaction.followUp({
        embeds: [
          recordEmbedGenerator(deletedRecord, interaction.member as GuildMember, {
            color: RecordColor.CANCEL
          })
        ]
      })
      generateANSIKnifeTable(interaction.guild.id)
    }

  }
}