import { Check, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
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
  overdue: 'border-danger/40 bg-danger/5',
  today: 'border-accent/40 bg-accent/5',
  upcoming: 'border-border',
  future: 'border-border opacity-70',
}

const STATUS_BADGE = {
  overdue: 'text-danger',
  today: 'text-accent',
  upcoming: 'text-warning',
  future: 'text-text-muted',
}

export default function TaskCard({ task, room, people, onComplete, onDelete, showRoom }: Props) {
  const [expanded, setExpanded] = useState(false)
  const status = getDueStatus(task)
  const nextDue = getNextDue(task)
  const assignedPeople = people.filter(p => task.assignedTo.includes(p.id))

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
        <button
          onClick={onComplete}
          title="Mark as done"
          className="mt-0.5 w-5 h-5 rounded-full border-2 border-border hover:border-accent flex items-center justify-center shrink-0 transition-colors group"
        >
          <Check size={11} className="text-transparent group-hover:text-accent transition-colors" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-text-primary">{task.title}</span>
            {showRoom && room && (
              <span className="text-xs text-text-muted">{room.icon} {room.name}</span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className={`text-xs font-medium ${STATUS_BADGE[status]}`}>{dueLabel}</span>
            <span className="text-xs text-text-muted">{FREQUENCY_LABELS[task.frequency]}</span>
            {assignedPeople.length > 0 && (
              <div className="flex gap-1">
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
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              Notes
            </button>
          )}
          {expanded && task.notes && (
            <p className="mt-1.5 text-xs text-text-secondary bg-surface-3 rounded-lg px-3 py-2">{task.notes}</p>
          )}

          {task.lastCompleted && (
            <p className="mt-1 text-xs text-text-muted">
              Last done {format(new Date(task.lastCompleted), 'MMM d')}
            </p>
          )}
        </div>

        <button
          onClick={onDelete}
          className="text-text-muted hover:text-danger transition-colors shrink-0"
          title="Delete task"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}
