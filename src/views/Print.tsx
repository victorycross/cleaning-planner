import { useState } from 'react'
import { Printer, Download, FileText, Copy, Check } from 'lucide-react'
import { format } from 'date-fns'
import { type AppData, FREQUENCY_LABELS } from '../lib/types'
import { getNextDue, getDueStatus, sortByDue } from '../lib/scheduler'
import { exportICS, exportCSV, exportText } from '../lib/export'

interface Props {
  data: AppData
}

export default function Print({ data }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const text = exportText(data)
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const allTasks = sortByDue(data.tasks)

  const byRoom = data.rooms.map(room => ({
    room,
    tasks: allTasks.filter(t => t.roomId === room.id),
  })).filter(g => g.tasks.length > 0)

  const byPerson = data.people.map(person => ({
    person,
    tasks: allTasks.filter(t => t.assignedTo.includes(person.id)),
  })).filter(g => g.tasks.length > 0)

  const statusLabel = (task: typeof allTasks[0]) => {
    const s = getDueStatus(task)
    const next = getNextDue(task)
    if (s === 'overdue') return `OVERDUE (was due ${format(next, 'MMM d')})`
    return `Due ${format(next, 'MMM d, yyyy')}`
  }

  return (
    <div className="p-8 max-w-3xl">
      {/* Screen header */}
      <div className="no-print mb-8">
        <h1 className="text-2xl font-semibold text-text-primary mb-6">Print &amp; Export</h1>

        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Print */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-3 p-4 bg-surface-2 border border-border hover:border-accent rounded-xl text-left transition-colors group"
          >
            <div className="w-9 h-9 rounded-lg bg-surface-3 flex items-center justify-center text-text-secondary group-hover:text-accent transition-colors shrink-0">
              <Printer size={18} />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Print / Save PDF</p>
              <p className="text-xs text-text-muted mt-0.5">Full schedule with tick boxes</p>
            </div>
          </button>

          {/* CSV */}
          <button
            onClick={() => exportCSV(data)}
            className="flex items-center gap-3 p-4 bg-surface-2 border border-border hover:border-accent rounded-xl text-left transition-colors group"
          >
            <div className="w-9 h-9 rounded-lg bg-surface-3 flex items-center justify-center text-text-secondary group-hover:text-accent transition-colors shrink-0">
              <Download size={18} />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Export CSV</p>
              <p className="text-xs text-text-muted mt-0.5">Microsoft To Do · Excel · Google Sheets</p>
            </div>
          </button>

          {/* iCalendar */}
          <button
            onClick={() => exportICS(data)}
            className="flex items-center gap-3 p-4 bg-surface-2 border border-border hover:border-accent rounded-xl text-left transition-colors group"
          >
            <div className="w-9 h-9 rounded-lg bg-surface-3 flex items-center justify-center text-text-secondary group-hover:text-accent transition-colors shrink-0">
              <FileText size={18} />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Export Calendar (.ics)</p>
              <p className="text-xs text-text-muted mt-0.5">Google Calendar · Outlook · Apple Calendar</p>
            </div>
          </button>

          {/* Copy text */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-3 p-4 bg-surface-2 border border-border hover:border-accent rounded-xl text-left transition-colors group"
          >
            <div className="w-9 h-9 rounded-lg bg-surface-3 flex items-center justify-center text-text-secondary group-hover:text-accent transition-colors shrink-0">
              {copied ? <Check size={18} className="text-accent" /> : <Copy size={18} />}
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">{copied ? 'Copied!' : 'Copy as text'}</p>
              <p className="text-xs text-text-muted mt-0.5">Paste into any app or message</p>
            </div>
          </button>
        </div>

        <p className="text-xs text-text-muted">
          CSV imports into Microsoft To Do via <span className="text-text-secondary">Settings → Import</span>.
          The .ics file adds recurring reminders to your calendar app.
        </p>
      </div>

      {/* Print content — visible on screen and in print */}
      <div className="print-content">
        {/* Print header */}
        <div className="hidden print:block mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold text-black">Home Cleaning Planner</h1>
          <p className="text-sm text-gray-500 mt-1">Generated {format(new Date(), 'MMMM d, yyyy')}</p>
        </div>

        {/* By Room */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-text-primary print:text-black mb-4 pb-2 border-b border-border print:border-gray-300">
            Tasks by Room
          </h2>
          {byRoom.length === 0 && <p className="text-sm text-text-muted print:text-gray-500">No tasks yet.</p>}
          {byRoom.map(({ room, tasks }) => (
            <div key={room.id} className="mb-6">
              <h3 className="text-sm font-semibold text-text-secondary print:text-gray-700 mb-2">
                {room.icon} {room.name}
              </h3>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border print:border-gray-200">
                    <th className="text-left py-1.5 pr-4 text-text-muted print:text-gray-500 font-medium text-xs uppercase tracking-wide">Task</th>
                    <th className="text-left py-1.5 pr-4 text-text-muted print:text-gray-500 font-medium text-xs uppercase tracking-wide">Frequency</th>
                    <th className="text-left py-1.5 pr-4 text-text-muted print:text-gray-500 font-medium text-xs uppercase tracking-wide">Due</th>
                    <th className="text-left py-1.5 text-text-muted print:text-gray-500 font-medium text-xs uppercase tracking-wide">Assigned to</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => {
                    const status = getDueStatus(task)
                    const assignedNames = data.people.filter(p => task.assignedTo.includes(p.id)).map(p => p.name).join(', ')
                    return (
                      <tr key={task.id} className="border-b border-border/50 print:border-gray-100">
                        <td className={`py-2 pr-4 font-medium ${status === 'overdue' ? 'text-danger print:text-red-600' : 'text-text-primary print:text-black'}`}>
                          {task.title}
                        </td>
                        <td className="py-2 pr-4 text-text-secondary print:text-gray-600">{FREQUENCY_LABELS[task.frequency]}</td>
                        <td className={`py-2 pr-4 text-xs ${status === 'overdue' ? 'text-danger print:text-red-600 font-semibold' : 'text-text-secondary print:text-gray-600'}`}>
                          {statusLabel(task)}
                        </td>
                        <td className="py-2 text-text-secondary print:text-gray-600">{assignedNames || '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        {/* By Person */}
        {byPerson.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-text-primary print:text-black mb-4 pb-2 border-b border-border print:border-gray-300">
              Tasks by Person
            </h2>
            {byPerson.map(({ person, tasks }) => (
              <div key={person.id} className="mb-6">
                <h3
                  className="text-sm font-semibold mb-2 print:text-gray-700"
                  style={{ color: person.colour }}
                >
                  {person.name}
                </h3>
                <div className="flex flex-col gap-1">
                  {tasks.map(task => {
                    const room = data.rooms.find(r => r.id === task.roomId)
                    const status = getDueStatus(task)
                    return (
                      <div key={task.id} className="flex items-center gap-4 text-sm py-1.5 border-b border-border/40 print:border-gray-100">
                        <span className={`flex-1 ${status === 'overdue' ? 'text-danger print:text-red-600' : 'text-text-primary print:text-black'}`}>
                          {task.title}
                        </span>
                        {room && <span className="text-text-muted print:text-gray-500 text-xs">{room.icon} {room.name}</span>}
                        <span className="text-text-muted print:text-gray-500 text-xs">{FREQUENCY_LABELS[task.frequency]}</span>
                        <span className={`text-xs ${status === 'overdue' ? 'text-danger print:text-red-600 font-semibold' : 'text-text-secondary print:text-gray-600'}`}>
                          {statusLabel(task)}
                        </span>
                        {/* Tick box for physical print */}
                        <span className="hidden print:inline-block w-4 h-4 border border-gray-400 rounded"></span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
