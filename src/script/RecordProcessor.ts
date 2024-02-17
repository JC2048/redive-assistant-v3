import { Embed, EmbedBuilder, GuildMember, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { DatabaseRecordData, RecordData } from "../types/Database";
import { knifeCategoryTranslator } from "./util";

export enum RecordColor {

  NORMAL = 0x2070ff,
  LEFTOVER = 0xffa300,
  CANCEL = 0xff3333,
  COMPLETE = 0x38d93e,
  FALLBACK = 0xd0e0ff

}

type RecordProcessorOptionOverride = {
  color?: RecordColor
  name?: string
  description?: string
  isCompleted?: boolean
  damage?: number
}

export function recordEmbedGenerator(record: DatabaseRecordData | RecordData, guildMember: GuildMember, overrides: RecordProcessorOptionOverride = {}): EmbedBuilder {

  const embed = new EmbedBuilder()
    .setAuthor({
      name: `${overrides.name ?? guildMember.nickname ?? guildMember.user.globalName ?? guildMember.user.username} |`
        + ` ${record.isLeftover ? "🔶" : "🔷"}${record.isCompleted ?? overrides.isCompleted ?? false ? "✅" : ""}`
        + ` ${record.week + 1}周 ${record.boss}王`,
      iconURL: guildMember.displayAvatarURL() ?? guildMember.user.avatarURL()
    })
    .setDescription(overrides.description ?? `${knifeCategoryTranslator(record.category)} ${overrides.damage ?? record.damage}萬`)
    // .setTimestamp()
    .setColor(overrides.color ?? (record.isLeftover ? RecordColor.LEFTOVER : RecordColor.NORMAL))

  /*

  color: depends on context
  name: [EMOJI | DISPLAYNAME | WEEK & BOSS | CATEGORY]
  description: [DAMAGE] 

  */

  return embed

}

export function recordStringSelectMenuBuilder(
  interactionId: string,
  records: RecordData[] | DatabaseRecordData[],
  options?: {
    placeholder?: string,
    minSelect?: number,
    maxSelect?: number
  }): StringSelectMenuBuilder {

  return new StringSelectMenuBuilder()
    .setCustomId(interactionId + "record_select")
    .setPlaceholder(options?.placeholder ?? "選擇一則報刀紀錄")
    .addOptions([
      ...records.map(record =>
        new StringSelectMenuOptionBuilder()
          .setLabel(`${record.isLeftover ? "🔶" : "🔷"}${record.week + 1}周${record.boss}王`)
          .setDescription(`${knifeCategoryTranslator(record.category)}`)
          .setValue(record.id ?? "")
      )
    ])
    .setMinValues(options?.minSelect ?? 1)
    .setMaxValues(options?.maxSelect ?? 1)

}