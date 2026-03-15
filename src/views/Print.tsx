import { useRef, useState } from 'react'
import { Printer, Download, FileText, Copy, Check, Upload, RotateCcw } from 'lucide-react'
import { format } from 'date-fns'
import { type AppData, FREQUENCY_LABELS } from '../lib/types'
import { getNextDue, getDueStatus, sortByDue } from '../lib/scheduler'
import { exportICS, exportCSV, exportText, exportJSON, importJSON } from '../lib/export'
import { saveData } from '../lib/storage'

interface Props {
  data: AppData
  onRestore: (data: AppData) => void
}

export default function Print({ data, onRestore }: Props) {
  const [copied, setCopied] = useState(false)
  const [restoreError, setRestoreError] = useState('')
  const [restoreOk, setRestoreOk] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleCopy = () => {
    navigator.clipboard.writeText(exportText(data)).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const restored = await importJSON(file)
      saveData(restored)
      onRestore(restored)
      setRestoreOk(true)
      setRestoreError('')
      setTimeout(() => setRestoreOk(false), 3000)
    } catch (err) {
      setRestoreError((err as Error).message)
    }
    e.target.value = ''
  }

  const allTasks = sortByDue(data.tasks)
  const byRoom = data.rooms.map(room => ({ room, tasks: allTasks.filter(t => t.roomId === room.id) })).filter(g => g.tasks.length > 0)
  const byPerson = data.people.map(person => ({ person, tasks: allTasks.filter(t => t.assignedTo.includes(person.id)) })).filter(g => g.tasks.length > 0)

  const statusLabel = (task: typeof allTasks[0]) => {
    const s = getDueStatus(task)
    const next = getNextDue(task)
    if (s === 'overdue') return `OVERDUE (was due ${format(next, 'MMM d')})`
    return `Due ${format(next, 'MMM d, yyyy')}`
  }

  const ExportCard = ({ icon, title, desc, onClick, accent = false }: { icon: React.ReactNode; title: string; desc: string; onClick: () => void; accent?: boolean }) => (
    <button onClick={onClick}
      className={`flex items-center gap-3 p-4 border rounded-xl text-left transition-colors group ${accent ? 'bg-accent/5 border-accent/30 hover:border-accent' : 'bg-surface-1 border-border hover:border-accent'}`}>
      <div className="w-9 h-9 rounded-lg bg-surface-2 flex items-center justify-center text-text-secondary group-hover:text-accent transition-colors shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-text-primary">{title}</p>
        <p className="text-xs text-text-muted mt-0.5">{desc}</p>
      </div>
    </button>
  )

  return (
    <div className="p-6 md:p-8 max-w-3xl pb-24 md:pb-8">
      {/* Screen UI */}
      <div className="no-print mb-8">
        <h1 className="text-2xl font-bold text-text-primary mb-6">Print &amp; Export</h1>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <ExportCard icon={<Printer size={18} />} title="Print / Save PDF" desc="Full schedule with tick boxes" onClick={() => window.print()} accent />
          <ExportCard icon={<Download size={18} />} title="Export CSV" desc="Microsoft To Do · Excel · Sheets" onClick={() => exportCSV(data)} />
          <ExportCard icon={<FileText size={18} />} title="Export Calendar (.ics)" desc="Google Calendar · Outlook · Apple" onClick={() => exportICS(data)} />
          <ExportCard
            icon={copied ? <Check size={18} className="text-accent" /> : <Copy size={18} />}
            title={copied ? 'Copied!' : 'Copy as text'}
            desc="Paste into any app or message"
            onClick={handleCopy}
          />
        </div>

        {/* Backup section */}
        <div className="bg-surface-1 border border-border rounded-xl p-4">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">Data backup</p>
          <div className="flex gap-3">
            <button onClick={() => exportJSON(data)}
              className="flex-1 flex items-center gap-2 justify-center px-3 py-2.5 bg-surface-2 border border-border hover:border-accent rounded-lg text-sm text-text-secondary hover:text-text-primary transition-colors">
              <Download size={14} /> Download backup
            </button>
            <button onClick={() => fileRef.current?.click()}
              className="flex-1 flex items-center gap-2 justify-center px-3 py-2.5 bg-surface-2 border border-border hover:border-accent rounded-lg text-sm text-text-secondary hover:text-text-primary transition-colors">
              <Upload size={14} /> Restore backup
            </button>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleRestore} />
          </div>
          {restoreOk && <p className="text-xs text-accent mt-2 flex items-center gap-1"><RotateCcw size={11} /> Data restored successfully — reload if you don't see changes.</p>}
          {restoreError && <p className="text-xs text-danger mt-2">{restoreError}</p>}
          <p className="text-xs text-text-muted mt-2">Your data lives in your browser. Download a backup to prevent losing it.</p>
        </div>

        <p className="text-xs text-text-muted mt-3">
          CSV imports into Microsoft To Do via <span className="text-text-secondary">Settings → Import</span>.
          The .ics file adds recurring reminders to your calendar app.
        </p>
      </div>

      {/* Print content */}
      <div className="print-content">
        <div className="hidden print:block mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold text-black">✨ Sparkle — Home Cleaning Planner</h1>
          <p className="text-sm text-gray-500 mt-1">Generated {format(new Date(), 'MMMM d, yyyy')}</p>
        </div>

        <div className="mb-10">
          <h2 className="text-lg font-semibold text-text-primary print:text-black mb-4 pb-2 border-b border-border print:border-gray-300">
            Tasks by Room
          </h2>
          {byRoom.length === 0 && <p className="text-sm text-text-muted print:text-gray-500">No tasks yet.</p>}
          {byRoom.map(({ room, tasks }) => (
            <div key={room.id} className="mb-6">
              <h3 className="text-sm font-semibold text-text-secondary print:text-gray-700 mb-2">{room.icon} {room.name}</h3>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border print:border-gray-200">
                    {['Task', 'Frequency', 'Due', 'Assigned to'].map(h => (
                      <th key={h} className="text-left py-1.5 pr-4 text-text-muted print:text-gray-500 font-medium text-xs uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => {
                    const s = getDueStatus(task)
                    const names = data.people.filter(p => task.assignedTo.includes(p.id)).map(p => p.name).join(', ')
                    return (
                      <tr key={task.id} className="border-b border-border/50 print:border-gray-100">
                        <td className={`py-2 pr-4 font-medium ${s === 'overdue' ? 'text-danger print:text-red-600' : 'text-text-primary print:text-black'}`}>{task.title}</td>
                        <td className="py-2 pr-4 text-text-secondary print:text-gray-600">{FREQUENCY_LABELS[task.frequency]}</td>
                        <td className={`py-2 pr-4 text-xs ${s === 'overdue' ? 'text-danger print:text-red-600 font-semibold' : 'text-text-secondary print:text-gray-600'}`}>{statusLabel(task)}</td>
                        <td className="py-2 text-text-secondary print:text-gray-600">{names || '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        {byPerson.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-text-primary print:text-black mb-4 pb-2 border-b border-border print:border-gray-300">
              Tasks by Person
            </h2>
            {byPerson.map(({ person, tasks }) => (
              <div key={person.id} className="mb-6">
                <h3 className="text-sm font-semibold mb-2 print:text-gray-700" style={{ color: person.colour }}>{person.name}</h3>
                <div className="flex flex-col gap-1">
                  {tasks.map(task => {
                    const room = data.rooms.find(r => r.id === task.roomId)
                    const s = getDueStatus(task)
                    return (
                      <div key={task.id} className="flex items-center gap-4 text-sm py-1.5 border-b border-border/40 print:border-gray-100">
                        <span className={`flex-1 ${s === 'overdue' ? 'text-danger print:text-red-600' : 'text-text-primary print:text-black'}`}>{task.title}</span>
                        {room && <span className="text-text-muted print:text-gray-500 text-xs">{room.icon} {room.name}</span>}
                        <span className="text-text-muted print:text-gray-500 text-xs">{FREQUENCY_LABELS[task.frequency]}</span>
                        <span className={`text-xs ${s === 'overdue' ? 'text-danger print:text-red-600 font-semibold' : 'text-text-secondary print:text-gray-600'}`}>{statusLabel(task)}</span>
                        <span className="hidden print:inline-block w-4 h-4 border border-gray-400 rounded shrink-0" />
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
