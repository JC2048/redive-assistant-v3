import { ModalActionRowComponentBuilder, ModalBuilder, SlashCommandBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, ChatInputCommandInteraction } from 'discord.js';
import ANSI, { ANSIBackColor, ANSIFontStyle, ANSIForeColor } from '../../script/ANSI';

/*
Align team timeline using given leftover time
*/

function formatTimeline(timeline: string, reducedTime: number): string {

  const timerx = /(?<!\d)(?:[01]:?)\d{2}(?!\d)/g
  const autoOnRx = /(?:\+ ?)?(?:(?:auto(?: on))|(?:開 ?auto))( ?\+)?/i
  const autoOffRx = /(?:\+ ?)?(?:(?:auto(?: off))|(?:關 ?auto))( ?\+)?/i

  let timelineEndFlag = false

  // create an array for each line of the timeline
  const timelineArr = timeline.split("\n");

  const alignedTimelineArr = timelineArr.map<string>(line => {

    let newLine = line
    const matchArr = [...line.matchAll(timerx)]

    const lineAdditionStrings: string[] = []
    // replace set status with colored text
    const setModeMatchArr = [...line.matchAll(/[\(\[]?[oOxX]{5}[\)\]]?/gi)]
    for (const matchedSetModeString of setModeMatchArr) {
      newLine = newLine.replace(matchedSetModeString[0], "")
      lineAdditionStrings.push(" " + ANSI.formatText(` ${matchedSetModeString[0].replace(/[\(\)\[\]]/g, "").toUpperCase()} `, [ANSIForeColor.WHITE, ANSIBackColor.ORANGE]))
    }

    // replace auto stat
    if (autoOnRx.test(newLine)) {
      const match = newLine.match(autoOnRx)[0]
      newLine = newLine.replace(match, "")
      lineAdditionStrings.push(ANSI.formatText(" AUTO ON ", [ANSIForeColor.GREEN, ANSIBackColor.WHITE]))
    } else if (autoOffRx.test(newLine)) {
      const match = newLine.match(autoOffRx)[0]
      newLine = newLine.replace(match, "")
      lineAdditionStrings.push(ANSI.formatText(" AUTO OFF ", [ANSIForeColor.RED, ANSIBackColor.WHITE]))
    }

    // match time
    // only perform action if starts with time
    if (/^(?:[01]:?)\d{2}(?!\d)|戰鬥開始|開場/.test(line)) {

      for (let i = 0; i < matchArr.length; i++) {

        const matchedString = matchArr[i][0];

        if (matchedString == null) continue;

        const alignedTime = (() => {
          const rawTime = parseInt(matchedString.replace(":", ""))
          return rawTime - (rawTime > 90 ? 40 : 0)
        })() - reducedTime

        // mark EOL
        if (alignedTime < 0 && !timelineEndFlag && i === 0) {
          newLine = `\n${ANSI.formatText("---以下為時間不足的部分---", ANSIForeColor.WHITE, ANSIFontStyle.ITALIC)}\n` + newLine
          timelineEndFlag = true
        }

        // replace time
        newLine = newLine.replace(matchedString,
          `${alignedTime >= 60
            ? ANSI.formatText(`1:${String(alignedTime - 60).padStart(2, "0")}`, ANSIForeColor.GREEN)
            : alignedTime > 0
              ? ANSI.formatText(`0:${String(alignedTime).padStart(2, "0")}`, ANSIForeColor.GREEN)
              : ANSI.formatText(String(alignedTime).padStart(4, " "), ANSIForeColor.RED)
          }`
        )
      }
    }

    return newLine + lineAdditionStrings.join("")
  })

  return alignedTimelineArr.join("\n")

}
/*
turn on auto:
(+)AUTO ON
(+)開AUTO

turn off auto:
(+)AUTO OFF
(+)關AUTO
*/

export default {
  data: new SlashCommandBuilder()
    .setName('align')
    .setDescription('按補償時間轉軸'),

  execute: async (interaction: ChatInputCommandInteraction) => {
    // await interaction.deferReply()

    // send out a discord modal
    const modal = new ModalBuilder()
      .setCustomId(interaction.id + "align_modal")
      .setTitle("/align")
      .addComponents(
        new ActionRowBuilder<ModalActionRowComponentBuilder>()
          .addComponents(new TextInputBuilder()
            .setCustomId(interaction.id + "align_time")
            .setLabel("剩餘時間")
            .setStyle(TextInputStyle.Short)
            .setMaxLength(4)
            .setPlaceholder("接受 1:21 / 121 / 0121 / 81")
            .setRequired(true)
          ),
        new ActionRowBuilder<ModalActionRowComponentBuilder>()
          .addComponents(new TextInputBuilder()
            .setCustomId(interaction.id + "align_timeline")
            .setLabel("軸")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("請在此貼上軸")
            .setRequired(true)
          )

      )

    await interaction.showModal(modal)

    const submittedModal = await interaction.awaitModalSubmit({
      time: 120_000,
      filter: i => i.customId === interaction.id + "align_modal",
    })

    const remainTimeString = submittedModal.components[0]?.components[0].value
    console.log(remainTimeString)
    const timelineString = submittedModal.components[1].components[0].value

    if (/^(?:[01]:?)\d{2}$/.test(remainTimeString) === false && remainTimeString !== "") {
      submittedModal.reply({ content: "時間格式錯誤!", ephemeral: true })
      return
    }
    const remainTime = (() => {
      const rawTime = parseInt(remainTimeString.replace(":", ""))
      return (rawTime - (rawTime > 90 ? 40 : 0)) ?? 0
    })()

    // evaluate timeline string
    const alignedTimeline = formatTimeline(timelineString, 90 - remainTime)

    await submittedModal.reply({
      content: `\`\`\`ansi\n${remainTime !== 0 ? ANSI.formatText(`剩餘時間:${String(remainTime)}s`, ANSIForeColor.CYAN, ANSIFontStyle.BOLD) + "\n\n" : ""}${alignedTimeline}\`\`\``,
      ephemeral: true
    })

  },
}