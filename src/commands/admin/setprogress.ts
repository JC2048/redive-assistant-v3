import { SlashCommandBuilder } from 'discord.js';
import { argumentParser } from '../../script/argumentParser';
import { data as dbData } from '../../database';
import { parseChineseBossNumber } from '../../script/util';

/*
Manually set round for bosses
*/

const data = new SlashCommandBuilder()
  .setName('setprogress')
  .setDescription('設定周目')
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
      .setName('周目')
      .setDescription('周目')
      .setRequired(true)
  )

export default {
  data: data,

  execute: async (interaction) => {
    await argumentParser(interaction, data.options, async (interaction, args) => {
      const oldData = await dbData.get(interaction.guildId!)

      const weekArr: [number, number, number, number, number] = [...oldData.progress]
      const round = args.week - 1

      // cannot be highest round - 2 or lowest round + 2
      // for example: 
      // [34, 34, 34, 34, 34]: input range <32, 36> (week 33 - 37)
      // [32, 34, 34, 34, 34]: input range <32, 34> (week 33 - 35)
      if (round < Math.max(...weekArr) - 2 || round > Math.min(...weekArr) + 2) {

        await interaction.reply({
          content: `無法設定${parseChineseBossNumber(args.boss)}王為 ${args.week} 周\n目前可以設定的範圍為 \`${Math.max(Math.max(...weekArr) - 2, 0) + 1} - ${Math.min(...weekArr) + 2 + 1}\` 周`,
          ephemeral: true
        })
        return
      }

      if (round <= 0) {

        await interaction.reply({
          content: `把周目設到那麼早是要回史前時代出刀？`
        })
        return
      }

      weekArr[args.boss - 1] = round

      await dbData.update(interaction.guildId!, {
        progress: weekArr
      })

      await interaction.reply({
        content: `已將${parseChineseBossNumber(args.boss)}王設定為 ${args.week} 周`,
      })

    })
  }
}