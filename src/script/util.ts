import { KnifeCategory } from "../Enums"

export async function sleep(sleepMs: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, sleepMs))
}

export function parseChineseBossNumber(boss: 1 | 2 | 3 | 4 | 5): string {
  return ["一", "二", "三", "四", "五"][boss - 1]
}

export function knifeCategoryTranslator(knifeCategory: KnifeCategory): string {
  switch (knifeCategory) {
    case KnifeCategory.PHYSICAL:
      return "物理刀"
    case KnifeCategory.MAGIC:
      return "法刀"
    case KnifeCategory.NYARU:
      return "新黑刀"
    case KnifeCategory.PEKO:
      return "超佩刀"
    case KnifeCategory.OTHER:
      return "其他"
    default:
      return "未知"
  }

}