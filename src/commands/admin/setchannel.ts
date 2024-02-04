import { SlashCommandBuilder } from 'discord.js';
import { client } from '../../index';
import { setting } from '../../database';
import { argumentParser } from '../../script/argumentParser';

/*
Set channel for dashboards
*/
const data = new SlashCommandBuilder()
.setName('setchannel')
.setDescription('設定報刀/成員列表頻道')
.addStringOption(option =>
  option
    .setName('列表')
    .setDescription('列表')
    .setRequired(true)
    .setChoices(
      { name: '報刀列表', value: 'knifeTable' },
      { name: '成員列表', value: 'memberTable' },
    )
)
.addChannelOption(option =>
  option
    .setName('頻道')
    .setDescription('頻道')
    .setRequired(true)
)

export default {
  data: data,
  execute: async (interaction) => {
    await argumentParser(interaction, data.options, async (interaction, args) => {

      console.log(JSON.stringify(args, null, 2))

      const channel = args.channel
      if (!channel) {
        await interaction.reply({
          content: "頻道不存在!",
          ephemeral: true
        });
        return
      }

      // TODO run board message generator
      const boardMessage = await channel.send({
        content: "This is a test message."
      })

      // update
      await setting.update(interaction.guildId, {
        [args.list]: {
          channelId: channel.id,
          messageId: boardMessage.id,
        }
      })

      await interaction.reply({
        content: "已設定頻道!",
        ephemeral: true
      });
    })


  },
}