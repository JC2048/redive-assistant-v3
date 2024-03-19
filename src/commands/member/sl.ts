import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { user } from '../../database';

const data = new SlashCommandBuilder()
  .setName('sl')
  .setDescription('檢查及設定斷線狀態')

export default {
  data: data,
  execute: async (interaction) => {

    await interaction.deferReply({ ephemeral: true })

    const userData = await user.get(interaction.guildId, interaction.user.id)

    const slStatus = userData.sl

    const componentRow = []
    if (!slStatus) {
      componentRow.push(new ButtonBuilder().setCustomId(interaction.id + "sl_confirm").setLabel("確定SL").setStyle(ButtonStyle.Danger),)
    }

    const response = await interaction.editReply({
      content: `目前狀態: ${slStatus ? "⚠️ 已" : "✅ 未"}SL`,
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          [
            ...componentRow,
            new ButtonBuilder().setCustomId(interaction.id + "sl_exit").setLabel("取消").setStyle(ButtonStyle.Secondary),
          ]
        )
      ]
    })

    const collectorFilter = i => i.user.id === interaction.user.id

    try {

      const buttonPressed = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 })
      if (buttonPressed.customId === interaction.id + "sl_confirm") {

        await buttonPressed.deferUpdate()

        await user.updateByUser(userData, { sl: true })

        await interaction.editReply({ content: '已設定SL', components: [] });
        await interaction.followUp({ content: `⚠️ <@${userData.id}> 已SL!`, components: [] });
        return

      } else {
        await interaction.editReply({ content: '已取消', components: [] });
      }


    } catch (e) {
      console.error(e)
      await interaction.editReply({ content: '指令已逾時', components: [] });
    }

  },
}