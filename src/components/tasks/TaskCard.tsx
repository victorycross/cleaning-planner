import { useState } from 'react'
import { Check, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { format } from 'date-fns'
import { type Task, type Room, type Person, FREQUENCY_LABELS } from '../../lib/types'
import { getNextDue, getDueStatus } from '../../lib/scheduler'

interface Props {
  task: Task
  room?: Room
  people: Person[]
  onComplete: () => void
  onDelete: () => void
  showRoom?: boolean
}

const STATUS_STYLES = {
  overdue:  'border-danger/30 bg-danger/5',
  today:    'border-accent/30 bg-accent/5',
  upcoming: 'border-border bg-surface-1',
  future:   'border-border bg-surface-1 opacity-60',
}

const STATUS_BADGE = {
  overdue:  'text-danger font-semibold',
  today:    'text-accent font-semibold',
  upcoming: 'text-warning',
  future:   'text-text-muted',
}

// 4 directions for sparkle particles
const PARTICLES = [
  { angle: -45,  color: '#4ade80' },
  { angle: 45,   color: '#60a5fa' },
  { angle: 135,  color: '#f472b6' },
  { angle: -135, color: '#fbbf24' },
]

export default function TaskCard({ task, room, people, onComplete, onDelete, showRoom }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [celebrating, setCelebrating] = useState(false)

  const status = getDueStatus(task)
  const nextDue = getNextDue(task)
  const assignedPeople = people.filter(p => task.assignedTo.includes(p.id))

  const handleComplete = () => {
    onComplete()
    setCelebrating(true)
    setTimeout(() => setCelebrating(false), 600)
  }

  const dueLabel = (() => {
    if (status === 'overdue') {
      const days = Math.abs(Math.round((nextDue.getTime() - Date.now()) / 86400000))
      return days === 0 ? 'Due today' : `${days}d overdue`
    }
    if (status === 'today') return 'Due today'
    return `Due ${format(nextDue, 'MMM d')}`
  })()

  return (
    <div className={`border rounded-xl p-4 transition-all ${STATUS_STYLES[status]}`}>
      <div className="flex items-start gap-3">
        {/* Complete button with particle celebration */}
        <div className="relative mt-0.5 shrink-0">
          <button
            onClick={handleComplete}
            title="Mark as done"
            className={`w-5 h-5 rounded-full border-2 border-border hover:border-accent flex items-center justify-center transition-all group ${celebrating ? 'animate-check-pop border-accent bg-accent/20' : ''}`}
          >
            <Check size={10} className={`transition-colors ${celebrating ? 'text-accent' : 'text-transparent group-hover:text-accent'}`} />
          </button>
          {celebrating && PARTICLES.map((p, i) => {
            const tx = Math.round(Math.cos(p.angle * Math.PI / 180) * 18)
            const ty = Math.round(Math.sin(p.angle * Math.PI / 180) * 18)
            return (
              <span
                key={i}
                className="particle"
                style={{ '--tx': `${tx}px`, '--ty': `${ty}px`, backgroundColor: p.color } as React.CSSProperties}
              />
            )
          })}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-text-primary">{task.title}</span>
            {showRoom && room && (
              <span className="text-xs text-text-muted">{room.icon} {room.name}</span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className={`text-xs ${STATUS_BADGE[status]}`}>{dueLabel}</span>
            <span className="text-xs text-text-muted">{FREQUENCY_LABELS[task.frequency]}</span>
            {assignedPeople.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {assignedPeople.map(p => (
                  <span
                    key={p.id}
                    className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: `${p.colour}22`, color: p.colour }}
                  >
                    {p.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {task.notes && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="flex items-center gap-1 mt-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              Notes
            </button>
          )}
          {expanded && task.notes && (
            <p className="mt-1.5 text-xs text-text-secondary bg-surface-2 rounded-lg px-3 py-2">{task.notes}</p>
          )}
          {task.lastCompleted && (
            <p className="mt-1 text-xs text-text-muted">Last done {format(new Date(task.lastCompleted), 'MMM d')}</p>
          )}
        </div>

        <button onClick={onDelete} className="text-text-muted hover:text-danger transition-colors shrink-0" title="Delete">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}
