/**
 * Returns today's date as YYYY-MM-DD (local timezone, no UTC shift)
 */
export function todayStr(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Add (or subtract) N days to a YYYY-MM-DD string
 */
export function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + 'T00:00:00')
  date.setDate(date.getDate() + days)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Returns number of full days from today until targetDate.
 * Negative if target is in the past.
 */
export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr + 'T00:00:00')
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - now.getTime()) / 86_400_000)
}

/**
 * True if dateStr is before today
 */
export function isOverdue(dateStr: string): boolean {
  return dateStr < todayStr()
}

/**
 * True if dateStr equals today
 */
export function isToday(dateStr: string): boolean {
  return dateStr === todayStr()
}

/**
 * Format YYYY-MM-DD → readable "15 Jan 2025"
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Format minutes → "1h 30m" or "45m"
 */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

/**
 * Format seconds as MM:SS for the timer
 */
export function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/**
 * Get last N dates as YYYY-MM-DD, newest last
 */
export function getLastNDays(n: number): string[] {
  const days: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    days.push(addDays(todayStr(), -i))
  }
  return days
}

/**
 * Format a date string as short day label: "Mon", "Tue" etc.
 */
export function shortDayLabel(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short' })
}
