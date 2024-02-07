export enum ANSIForeColor {

  BLACK = 30,
  RED = 31,
  GREEN = 32,
  YELLOW = 33,
  BLUE = 34,
  MAGENTA = 35,
  CYAN = 36,
  WHITE = 37

}

export enum ANSIBackColor {

  BLACK = 40,
  RED = 41,
  GREEN = 42,
  YELLOW = 43,
  BLUE = 44,
  MAGENTA = 45,
  CYAN = 46,
  WHITE = 47

}

export enum ANSIFontStyle {

  NORMAL = 0,
  BOLD = 1,
  ITALIC = 3

}

type AnyANSIColor = ANSIForeColor | ANSIBackColor

export default {

  formatText(text: string, color: AnyANSIColor | AnyANSIColor[], style: ANSIFontStyle = ANSIFontStyle.NORMAL): string {

    let styleString = ""

    if (Array.isArray(color)) {
      styleString = `${style.toString()};${color.join(";")}`
    } else {
      styleString = `${style.toString()};${color.toString()}`
    }

    return `\u001b[${styleString}m${text}\u001b[0;0m`

  },

  start(color: AnyANSIColor | AnyANSIColor[], style: ANSIFontStyle = ANSIFontStyle.NORMAL): string {
    let styleString = ""

    if (Array.isArray(color)) {
      styleString = `${style.toString()};${color.join(";")}`
    } else {
      styleString = `${style.toString()};${color.toString()}`
    }

    return `\u001b[${styleString}m`
  },

  reset(): string {
    return `\u001b[0;0m`
  }

}