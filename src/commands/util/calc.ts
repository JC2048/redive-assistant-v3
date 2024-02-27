import { EmbedBuilder, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js';

import generateKnifeTable from '../../script/knifeTableGenerator';
import { weekToStage } from '../../script/util';
import { argumentParser } from '../../script/argumentParser';

const data = new SlashCommandBuilder()
  .setName('calc')
  .setDescription('dev')
  .addSubcommand(subcommand =>
    subcommand
      .setName('全返最低傷害')
      .setDescription("計算達成補償全返所需平均傷害，或者另一刀需要的傷害")
      .addIntegerOption(option =>
        option
          .setName("血量")
          .setDescription("剩餘血量")
          .setRequired(true)
      )
      .addIntegerOption(option =>
        option
          .setName("第一刀")
          .setDescription("第一刀傷害")
          .setRequired(false)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName("補償時間")
      .setDescription("計算兩刀後出獲得的補償時間")
      .addIntegerOption(option =>
        option
          .setName("血量")
          .setDescription("剩餘血量")
          .setRequired(true)
      )
      .addIntegerOption(option =>
        option
          .setName("第一刀")
          .setDescription("第一刀傷害")
          .setRequired(true)
      )
      .addIntegerOption(option =>
        option
          .setName("第二刀")
          .setDescription("第二刀傷害")
          .setRequired(true)
      )
  )

const _data = new SlashCommandBuilder()
  .setName('placeholder')
  .setDescription('placeholder')
  .addIntegerOption(option =>
    option
      .setName("血量")
      .setDescription("剩餘血量")
  )
  .addIntegerOption(option =>
    option
      .setName("第一刀")
      .setDescription("第一刀傷害")
  )
  .addIntegerOption(option =>
    option
      .setName("第二刀")
      .setDescription("第二刀傷害")
  )

export default {
  data: data as SlashCommandSubcommandsOnlyBuilder,

  execute: async (interaction) => {
    await argumentParser(interaction, _data.options, async (interaction, args) => {

      // console.log(interaction.options)
      // console.log(args)

      await interaction.deferReply()

      const subcommand = interaction.options.getSubcommand()
      const embed = new EmbedBuilder()

      switch (subcommand) {

        case "全返最低傷害":

          if (!!!args.damage1) {
            // return equal full return damage
            embed
              .setTitle(`全返最低傷害: ${Math.ceil(4.3 * args.hp / 5.3)}`)
              .setDescription(`剩餘血量: ${args.hp}`)
              .setColor(0xB0E0FF)
          } else {
            const dmgReq = Math.ceil(Math.max((args.hp - args.damage1), 0) * 4.3)
            const embedMessage = `剩餘血量: ${args.hp}\n第一刀傷害: ${args.damage1}`

            if (dmgReq > args.hp) {
              embed
                .setTitle("第二刀無法全返！")
                .setDescription(embedMessage)
                .setColor(0xB03030)
            } else {
              embed
                .setTitle(`全返最低傷害: ${dmgReq}`)
                .setDescription(embedMessage)
                .setColor(0xB0E0FF)
            }
          }

          await interaction.editReply({
            content: "",
            embeds: [embed]
          })

          return

        case "補償時間":

          const damages = [args.damage1, args.damage2].sort((a, b) => b - a)
          embed.setDescription(`剩餘血量: ${args.hp}\n第一刀傷害: ${damages[0]}\n第二刀傷害: ${damages[1]}`)
          if (args.damage1 + args.damage2 < args.hp) {
            embed
              .setTitle("傷害不足！")
              .setColor(0xB03030)
          } else if (damages[0] >= args.hp) {
            embed
              .setTitle("退刀！")
              .setColor(0xD0B050)
          } else {
            embed
              .setTitle(`補償時間: ${Math.min(90, Math.max(Math.ceil((1 - (args.hp - damages[0]) / damages[1]) * 90), 1 + 20))}秒`)
              .setColor(0xB0E0FF)
          }

          await interaction.editReply({
            content: "",
            embeds: [embed]
          })
          return

        default:
          await interaction.editReply({
            content: "執行錯誤! 請向管理員回報! 並請勿重複執行。",
          })
          return

      }

    })
  }

}