import { SlashCommandBuilder } from 'discord.js';
import { argumentParser } from '../../script/argumentParser';
import { data as dbData } from '../../database';
import config from '../../config';

/*
Manually set hp for bosses
*/

const data = new SlashCommandBuilder()
  .setName('sethp')
  .setDescription('設定血量')
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
      .setName('血量')
      .setDescription('血量')
      .setRequired(true)
  )

export default {
  data: data,

  execute: async (interaction) => {
    await argumentParser(interaction, data.options, async (interaction, args) => {

      if(args.hp > config.hp[3][args.boss - 1]) {
        await interaction.reply({
          content: `${args.boss}王血量不能高於${config.hp[3][args.boss - 1]}!`,
          ephemeral: true
        })
        return
      }
      if(args.hp < 0) {
        await interaction.reply({
          content: `${args.boss}王血量不能低於0!\n腦袋有問題?`,
          ephemeral: true
        })
        return
      }

      const oldData = await dbData.get(interaction.guildId)
      console.log(JSON.stringify(oldData, null, 2))
      const hpArr: number[] = [...oldData.hp]
      hpArr[args.boss - 1] = args.hp
      await dbData.update(interaction.guildId, {
        hp: hpArr as [number, number, number, number, number],
      })

      await interaction.reply({
        content: `已設定${args.boss}王目前血量為 ${args.hp} !`,
        ephemeral: true
      });

    })
  },
}