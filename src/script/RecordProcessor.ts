import { Collection, Embed, EmbedBuilder, GuildMember, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { DatabaseRecordData, ExpandedDatabaseRecordData, RecordData } from "../types/Database";
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
  nextActivator?: boolean
  damage?: number
  footer?: string
}

export function recordEmbedGenerator(record: ExpandedDatabaseRecordData | DatabaseRecordData | RecordData, guildMember: GuildMember, overrides: RecordProcessorOptionOverride = {}): EmbedBuilder {

  const embed = new EmbedBuilder()
    .setAuthor({
      name: `${overrides.name ?? guildMember.nickname ?? guildMember.user.globalName ?? guildMember.user.username}`,
      iconURL: guildMember.displayAvatarURL() ?? guildMember.user.avatarURL()
    })
    .setTitle(
      ` ${record.isLeftover ? "🔶" : "🔷"}${overrides.isCompleted ?? record.isCompleted ?? false ? "✅" : ""}${overrides.nextActivator ?? record.nextActivator ?? false ? " ↪️" : ""}`
      + ` ${record.week + 1}周 ${record.boss}王`
    )
    .setDescription(overrides.description ?? `${knifeCategoryTranslator(record.category)} ${overrides.damage ?? record.damage ?? 0 > 0 ? `${record.damage}萬` : ""}`)
    // .setTimestamp()
    .setColor(overrides.color ?? (record.isLeftover ? RecordColor.LEFTOVER : RecordColor.NORMAL))

  if (!!overrides.footer) embed.setFooter({ text: overrides.footer })

  /*

  color: depends on context
  name: [EMOJI | DISPLAYNAME | WEEK & BOSS | CATEGORY]
  description: [DAMAGE] 

  */

  return embed

}

type RecordStringSelectMenuBuilderOptions = {
  placeholder?: string
  minSelect?: number
  maxSelect?: number
}
export function recordStringSelectMenuBuilder(interactionId: string, records: DatabaseRecordData[] | ExpandedDatabaseRecordData[], options: RecordStringSelectMenuBuilderOptions): StringSelectMenuBuilder
export function recordStringSelectMenuBuilder(interactionId: string, records: ExpandedDatabaseRecordData[], options: RecordStringSelectMenuBuilderOptions, showName: true, guildMembers: Collection<string, GuildMember>): StringSelectMenuBuilder
export function recordStringSelectMenuBuilder(
  interactionId: string,
  records: ExpandedDatabaseRecordData[] | DatabaseRecordData[],
  options?: RecordStringSelectMenuBuilderOptions,
  showName?: boolean,
  guildMembers?: Collection<string, GuildMember>): StringSelectMenuBuilder {

  return new StringSelectMenuBuilder()
    .setCustomId(interactionId + "record_select")
    .setPlaceholder(options?.placeholder ?? "選擇一則報刀紀錄")
    .addOptions([
      ...records.map(record =>
        new StringSelectMenuOptionBuilder()
          .setLabel(`${!!showName
            ? `${(() => {
              const m = guildMembers.get(record.expand.user.userId)
              return m?.nickname ?? m?.user.globalName ?? m?.user.username ?? ""
            })()} | `
            : ""}${record.isLeftover ? "🔶" : "🔷"}${record.week + 1}周${record.boss}王`)
          .setDescription(`${knifeCategoryTranslator(record.category)} ${record.damage > 0 ? `${record.damage}萬` : ""}`)
          .setValue(record.id ?? "")
      )
    ])
    .setMinValues(options?.minSelect ?? 1)
    .setMaxValues(options?.maxSelect ?? 1)

}

