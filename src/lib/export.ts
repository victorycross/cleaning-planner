import { format, addDays } from 'date-fns'
import { type AppData, type Task, FREQUENCY_LABELS } from './types'
import { getNextDue } from './scheduler'

function getRoomName(data: AppData, task: Task): string {
  return data.rooms.find(r => r.id === task.roomId)?.name ?? 'General'
}

function getAssignedNames(data: AppData, task: Task): string {
  return data.people.filter(p => task.assignedTo.includes(p.id)).map(p => p.name).join(', ')
}

// ─── iCalendar (.ics) ────────────────────────────────────────────────────────

const ICS_FREQ_MAP: Record<string, string> = {
  daily: 'DAILY',
  weekly: 'WEEKLY',
  fortnightly: 'WEEKLY;INTERVAL=2',
  monthly: 'MONTHLY',
  quarterly: 'MONTHLY;INTERVAL=3',
  biannual: 'MONTHLY;INTERVAL=6',
  yearly: 'YEARLY',
}

function icsDate(date: Date): string {
  return format(date, "yyyyMMdd'T'HHmmss'Z'")
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}@cleaning-planner`
}

export function exportICS(data: AppData): void {
  const now = icsDate(new Date())
  const lines: string[] = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Cleaning Planner//EN', 'CALSCALE:GREGORIAN']

  for (const task of data.tasks) {
    const due = getNextDue(task)
    const room = getRoomName(data, task)
    const assigned = getAssignedNames(data, task)
    const rrule = ICS_FREQ_MAP[task.frequency]
    const description = [
      `Room: ${room}`,
      `Frequency: ${FREQUENCY_LABELS[task.frequency]}`,
      assigned ? `Assigned to: ${assigned}` : null,
      task.notes ? `Notes: ${task.notes}` : null,
    ].filter(Boolean).join('\\n')

    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid()}`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${format(due, 'yyyyMMdd')}`,
      `DTEND;VALUE=DATE:${format(addDays(due, 1), 'yyyyMMdd')}`,
      `SUMMARY:${task.title} (${room})`,
      `DESCRIPTION:${description}`,
      `RRULE:FREQ=${rrule}`,
      'END:VEVENT',
    )
  }

  lines.push('END:VCALENDAR')
  downloadFile('cleaning-planner.ics', lines.join('\r\n'), 'text/calendar')
}

// ─── CSV ─────────────────────────────────────────────────────────────────────

function csvCell(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function csvRow(cells: string[]): string {
  return cells.map(csvCell).join(',')
}

export function exportCSV(data: AppData): void {
  const headers = ['Task', 'Room', 'Frequency', 'Due Date', 'Assigned To', 'Last Completed', 'Notes']
  const rows = data.tasks.map(task => [
    task.title,
    getRoomName(data, task),
    FREQUENCY_LABELS[task.frequency],
    format(getNextDue(task), 'yyyy-MM-dd'),
    getAssignedNames(data, task),
    task.lastCompleted ? format(new Date(task.lastCompleted), 'yyyy-MM-dd') : '',
    task.notes,
  ])

  const csv = [csvRow(headers), ...rows.map(csvRow)].join('\n')
  downloadFile('cleaning-planner.csv', csv, 'text/csv')
}

// ─── Plain text ───────────────────────────────────────────────────────────────

export function exportText(data: AppData): string {
  const lines: string[] = ['HOME CLEANING PLANNER', `Generated ${format(new Date(), 'MMMM d, yyyy')}`, '']

  const byRoom = data.rooms
    .map(room => ({ room, tasks: data.tasks.filter(t => t.roomId === room.id) }))
    .filter(g => g.tasks.length > 0)

  for (const { room, tasks } of byRoom) {
    lines.push(`${room.icon} ${room.name.toUpperCase()}`)
    for (const task of tasks) {
      const due = format(getNextDue(task), 'MMM d')
      const assigned = getAssignedNames(data, task)
      const detail = [FREQUENCY_LABELS[task.frequency], `due ${due}`, assigned].filter(Boolean).join(' · ')
      lines.push(`  □ ${task.title} — ${detail}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

// ─── Util ─────────────────────────────────────────────────────────────────────

function downloadFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
