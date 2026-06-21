import type { Subject, Chapter, StudyLog } from '../types'

export function calcChaptersPerDay(remainingChapters: number, daysLeft: number): number {
  if (daysLeft <= 0) return remainingChapters
  return Math.ceil(remainingChapters / daysLeft)
}

export type RiskLevel = 'safe' | 'moderate' | 'high' | 'critical'

export function getRiskLevel(chaptersPerDay: number, dailyStudyHours: number): RiskLevel {
  if (dailyStudyHours === 0) return chaptersPerDay > 0 ? 'critical' : 'safe'
  const ratio = chaptersPerDay / dailyStudyHours
  if (ratio <= 0.3) return 'safe'
  if (ratio <= 0.6) return 'moderate'
  if (ratio <= 1.0) return 'high'
  return 'critical'
}

export const RISK_CONFIG: Record<RiskLevel, { label: string; color: string; bg: string }> = {
  safe: { label: '✅ Safe', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  moderate: { label: '⚡ Moderate', color: 'text-amber-700', bg: 'bg-amber-50' },
  high: { label: '⚠️ High', color: 'text-orange-700', bg: 'bg-orange-50' },
  critical: { label: '🚨 Critical', color: 'text-red-700', bg: 'bg-red-50' },
}

export function calcCompletionPercent(subjects: Subject[]): number {
  if (subjects.length === 0) return 0
  const total = subjects.reduce((s, sub) => s + sub.totalChapters, 0)
  const done = subjects.reduce((s, sub) => s + sub.completedChapters, 0)
  return total === 0 ? 0 : Math.round((done / total) * 100)
}

export function calcWeeklyHours(studyLogs: StudyLog[]): number {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 7)
  const cutoffStr = cutoff.toISOString().split('T')[0]
  return studyLogs
    .filter((l) => l.date >= cutoffStr)
    .reduce((sum, l) => sum + l.hours, 0)
}

export function calcTodayHours(studyLogs: StudyLog[]): number {
  const today = new Date().toISOString().split('T')[0]
  return studyLogs.find((l) => l.date === today)?.hours ?? 0
}

export function getSubjectCompletionData(subjects: Subject[], chapters: Chapter[]) {
  return subjects.map((sub) => {
    const subChapters = chapters.filter((c) => c.subjectId === sub.id)
    const completed = subChapters.filter((c) => c.status === 'completed').length
    return {
      name: sub.name.length > 12 ? sub.name.slice(0, 12) + '…' : sub.name,
      completed,
      remaining: subChapters.length - completed,
      color: sub.color,
    }
  })
}
