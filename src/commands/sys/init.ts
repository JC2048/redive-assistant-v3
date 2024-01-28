import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Interaction } from 'discord.js';
import { sleep } from '../../script/util';

import { setting } from '../../database';


/*
Initialize all settings of the bot
*/

const data = new SlashCommandBuilder()
  .setName('init')
  .setDescription('初始化')

export default {
  data: data,
  execute: async (interaction) => {
    const response = await interaction.reply({
      content: "此指令將會將所有伺服器設定初始化!\n請確認是否繼續?",
      ephemeral: true,
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(interaction.id + "initconfirm").setLabel("確定").setStyle(ButtonStyle.Danger),
          new ButtonBuilder().setCustomId(interaction.id + "initcancel").setLabel("取消").setStyle(ButtonStyle.Secondary),
        )
      ]
    })

    const collectorFilter = i => i.user.id === interaction.user.id

    try {
      const buttonPressed = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 })
      if (buttonPressed.customId == interaction.id + "initconfirm") {
        // $ Run Init

        await setting.init(interaction.guildId!)
        await interaction.editReply({ content: '已進行初始化!', components: [] });

      } else {
        await interaction.editReply({ content: '已取消', components: [] });
      }

    } catch (e) {
      await interaction.editReply({ content: '指令已逾時', components: [] });
    }
  },
}