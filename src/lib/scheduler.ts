import { addDays, isAfter, isBefore, isToday, startOfDay, differenceInDays, subDays, format } from 'date-fns'
import { type Task, type Frequency, type CompletionEntry, FREQUENCY_DAYS } from './types'

export function getNextDue(task: Task): Date {
  const base = task.lastCompleted
    ? startOfDay(new Date(task.lastCompleted))
    : startOfDay(new Date(task.createdAt))
  return addDays(base, FREQUENCY_DAYS[task.frequency])
}

export type DueStatus = 'overdue' | 'today' | 'upcoming' | 'future'

export function getDueStatus(task: Task): DueStatus {
  const nextDue = getNextDue(task)
  const today = startOfDay(new Date())
  if (isBefore(nextDue, today)) return 'overdue'
  if (isToday(nextDue)) return 'today'
  if (isAfter(nextDue, today) && differenceInDays(nextDue, today) <= 7) return 'upcoming'
  return 'future'
}

export function getDaysUntilDue(task: Task): number {
  return differenceInDays(getNextDue(task), startOfDay(new Date()))
}

export function isDueWithin(task: Task, days: number): boolean {
  return getDaysUntilDue(task) <= days
}

export function sortByDue(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => getNextDue(a).getTime() - getNextDue(b).getTime())
}

// ─── Score ────────────────────────────────────────────────────────────────────

export function getHomeScore(tasks: Task[]): number {
  if (tasks.length === 0) return 100
  const scores = tasks.map(task => {
    const days = getDaysUntilDue(task)
    if (days > 7)  return 100
    if (days > 0)  return 85
    if (days === 0) return 70
    if (days >= -3) return 40
    if (days >= -7) return 15
    return 0
  })
  return Math.round(scores.reduce<number>((a, b) => a + b, 0) / scores.length)
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Spotless ✨'
  if (score >= 75) return 'Looking great'
  if (score >= 60) return 'Getting there'
  if (score >= 40) return 'Needs some love'
  return 'Time to clean!'
}

export function getScoreColor(score: number): string {
  if (score >= 75) return 'var(--score-green)'
  if (score >= 50) return 'var(--score-amber)'
  return 'var(--score-red)'
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export function getCompletedThisWeek(completionLog: CompletionEntry[]): number {
  const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd')
  return completionLog.filter(e => e.date >= weekAgo).length
}

export function getWeeklyCompletions(completionLog: CompletionEntry[]): number[] {
  const today = startOfDay(new Date())
  return Array.from({ length: 7 }, (_, i) => {
    const day = format(subDays(today, 6 - i), 'yyyy-MM-dd')
    return completionLog.filter(e => e.date === day).length
  })
}

export function getWeekDayLabels(): string[] {
  const today = startOfDay(new Date())
  return Array.from({ length: 7 }, (_, i) => format(subDays(today, 6 - i), 'EEE'))
}

export const FREQUENCY_OPTIONS: { value: Frequency; label: string; description: string }[] = [
  { value: 'daily',       label: 'Daily',          description: 'Every day' },
  { value: 'weekly',      label: 'Weekly',          description: 'Every 7 days' },
  { value: 'fortnightly', label: 'Fortnightly',     description: 'Every 14 days' },
  { value: 'monthly',     label: 'Monthly',         description: 'Every 30 days' },
  { value: 'quarterly',   label: 'Quarterly',       description: 'Every 3 months' },
  { value: 'biannual',    label: 'Every 6 months',  description: 'Twice a year' },
  { value: 'yearly',      label: 'Yearly',          description: 'Once a year' },
]
