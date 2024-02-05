export async function sleep(sleepMs: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, sleepMs))
}

export function parseChineseBossNumber(boss: 1 | 2 | 3 | 4 | 5): string {
  return ["一", "二", "三", "四", "五"][boss - 1]
}