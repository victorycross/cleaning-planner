import { addDays, isAfter, isBefore, isToday, startOfDay, differenceInDays } from 'date-fns'
import { type Task, type Frequency, FREQUENCY_DAYS } from './types'

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
  const nextDue = getNextDue(task)
  const today = startOfDay(new Date())
  return differenceInDays(nextDue, today)
}

export function isDueWithin(task: Task, days: number): boolean {
  return getDaysUntilDue(task) <= days
}

export function sortByDue(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const da = getNextDue(a).getTime()
    const db = getNextDue(b).getTime()
    return da - db
  })
}

export const FREQUENCY_OPTIONS: { value: Frequency; label: string; description: string }[] = [
  { value: 'daily', label: 'Daily', description: 'Every day' },
  { value: 'weekly', label: 'Weekly', description: 'Every 7 days' },
  { value: 'fortnightly', label: 'Fortnightly', description: 'Every 14 days' },
  { value: 'monthly', label: 'Monthly', description: 'Every 30 days' },
  { value: 'quarterly', label: 'Quarterly', description: 'Every 3 months' },
  { value: 'biannual', label: 'Every 6 months', description: 'Twice a year' },
  { value: 'yearly', label: 'Yearly', description: 'Once a year' },
]
