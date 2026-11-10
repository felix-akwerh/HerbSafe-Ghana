/**
 * True when typed text could be a real product name or description: at least two letters,
 * and not one character repeated ("zzzz", "aaaa", "...."). Kept loose on purpose so short
 * brand names and abbreviations such as "PHC" still pass.
 */
export function looksLikeText(text: string): boolean {
  const letters = text.match(/\p{L}/gu) ?? []
  const chars = new Set(text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, ''))
  return letters.length >= 2 && chars.size >= 2
}

/** Today as yyyy-mm-dd in the person's own time zone. */
export function todayIso(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

/** Builds yyyy-mm-dd from day, month and year, or returns '' when that day does not exist. */
export function isoDate(day: string, month: string, year: string): string {
  const d = Number(day)
  const m = Number(month)
  const y = Number(year)
  if (!Number.isInteger(d) || !Number.isInteger(m) || !Number.isInteger(y) || year.length !== 4) return ''
  const date = new Date(y, m - 1, d)
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return ''
  return `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}
