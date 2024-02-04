import type { ChatInputCommandInteraction, Interaction } from 'discord.js';
import { ApplicationCommandOptionType } from 'discord.js';

const argumentNameMap: Record<string, string> = {
  周目: "week",
  王: "boss",
  種類: "category",
  補償刀: "leftover",
  備註: "note",
  成員: "user",

  頻道: "channel",
  列表: "list",
}

export async function argumentParser(interaction: ChatInputCommandInteraction, options: any[], exec: (interaction: ChatInputCommandInteraction, args: Record<string, any>) => Promise<void>) {
  const args = {}
  for (const option of options) {
    const name = argumentNameMap[option.name]
    console.log(name)
    switch (option.type) {
      case ApplicationCommandOptionType.Integer:
        args[name] = await interaction.options.getInteger(option.name)
        break
      case ApplicationCommandOptionType.Number:
        args[name] =  await interaction.options.getNumber(option.name)
        break
      case ApplicationCommandOptionType.String:
        args[name] =  await interaction.options.getString(option.name)
        break
      case ApplicationCommandOptionType.Boolean:
        args[name] =  await interaction.options.getBoolean(option.name)
        break
      case ApplicationCommandOptionType.Mentionable:  // user
        args[name] =  await interaction.options.getMentionable(option.name)
        break
      case ApplicationCommandOptionType.Channel:
        args[name] =  await interaction.options.getChannel(option.name)
        break

      default:
        args[name] =  null

    }
  }
  await exec(interaction, args)
}