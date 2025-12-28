export function nextInt(max: number): number
export function nextInt(max: number, count: number, excludes?: number[]): number[]
export function nextInt(max: number, count: number = 1, excludes?: number[]): number | number[] {
  if (count > max) {
    throw new Error('count should be less than max.')
  }
  if (count === 1) {
    return Math.floor(Math.random() * max) + 1
  }
  let times = 0
  const result: number[] = []
  while (count > 0) {
    times++
    const r = Math.floor(Math.random() * max) + 1
    if ((!result.includes(r) && !excludes?.includes(r)) || times > 10000) {
      result.push(r)
      count--
    }
  }
  return result
}
