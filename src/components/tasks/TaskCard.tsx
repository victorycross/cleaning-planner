import { useState, useRef } from 'react'
import { Check, Trash2, ChevronDown, ChevronUp, Pencil, Star, ChevronsRight } from 'lucide-react'
import { format } from 'date-fns'
import { type Task, type Room, type Person, FREQUENCY_LABELS } from '../../lib/types'
import { getNextDue, getDueStatus } from '../../lib/scheduler'
import TaskForm from './TaskForm'

interface Props {
  task: Task
  room?: Room
  people: Person[]
  rooms: Room[]
  onComplete: () => void
  onDelete: () => void
  onEdit?: (patch: Omit<Task, 'id' | 'createdAt' | 'lastCompleted'>) => void
  onFlag?: () => void
  showRoom?: boolean
  selectable?: boolean
  selected?: boolean
  onToggleSelect?: () => void
}

const PARTICLES = [
  { angle: -45,  color: '#4ade80' },
  { angle: 45,   color: '#60a5fa' },
  { angle: 135,  color: '#f472b6' },
  { angle: -135, color: '#fbbf24' },
  { angle: 0,    color: '#34d399' },
  { angle: 90,   color: '#a78bfa' },
  { angle: 180,  color: '#fb923c' },
  { angle: -90,  color: '#f87171' },
]

const ACCENT_BAR = {
  overdue:  'bg-danger/70',
  today:    'bg-accent',
  upcoming: 'bg-warning/60',
  future:   'bg-surface-3',
}

const STATUS_BADGE = {
  overdue:  'text-danger font-semibold',
  today:    'text-accent font-semibold',
  upcoming: 'text-warning font-medium',
  future:   'text-text-muted',
}

const SWIPE_THRESHOLD = 88

export default function TaskCard({
  task, room, people, rooms, onComplete, onDelete, onEdit, onFlag,
  showRoom, selectable, selected, onToggleSelect,
}: Props) {
  const [expanded, setExpanded] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const [swipeX, setSwipeX] = useState(0)
  const [swiped, setSwiped] = useState(false)
  const [editing, setEditing] = useState(false)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const isHorizontalSwipe = useRef(false)

  const status = getDueStatus(task)
  const nextDue = getNextDue(task)
  const assignedPeople = people.filter(p => task.assignedTo.includes(p.id))

  const triggerComplete = () => {
    if (celebrating) return
    onComplete()
    setCelebrating(true)
    setTimeout(() => setCelebrating(false), 650)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (selectable) return
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    isHorizontalSwipe.current = false
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (selectable) return
    const dx = e.touches[0].clientX - touchStartX.current
    const dy = e.touches[0].clientY - touchStartY.current

    if (!isHorizontalSwipe.current) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return
      isHorizontalSwipe.current = Math.abs(dx) > Math.abs(dy)
    }

    if (!isHorizontalSwipe.current) return
    e.preventDefault()
    if (dx > 0) setSwipeX(Math.min(dx, SWIPE_THRESHOLD + 24))
  }

  const handleTouchEnd = () => {
    if (selectable) return
    if (swipeX >= SWIPE_THRESHOLD) {
      setSwiped(true)
      setTimeout(() => {
        setSwiped(false)
        setSwipeX(0)
        triggerComplete()
      }, 250)
    } else {
      setSwipeX(0)
    }
  }

  const dueLabel = (() => {
    if (status === 'overdue') {
      const days = Math.abs(Math.round((nextDue.getTime() - Date.now()) / 86400000))
      return days === 0 ? 'Due today' : `${days}d overdue`
    }
    if (status === 'today') return 'Due today'
    return `Due ${format(nextDue, 'MMM d')}`
  })()

  const swipeProgress = Math.min(swipeX / SWIPE_THRESHOLD, 1)

  if (editing) {
    return (
      <TaskForm
        rooms={rooms}
        people={people}
        editMode
        initial={{ title: task.title, roomId: task.roomId, frequency: task.frequency, assignedTo: task.assignedTo, notes: task.notes, flagged: task.flagged }}
        onSave={patch => { onEdit?.(patch); setEditing(false) }}
        onCancel={() => setEditing(false)}
      />
    )
  }

  return (
    <div
      className={`relative rounded-xl overflow-hidden select-none ${selectable ? 'cursor-pointer' : ''}`}
      onClick={selectable ? onToggleSelect : undefined}
    >
      {/* Swipe reveal layer */}
      <div
        className="absolute inset-0 flex items-center px-5 gap-2 bg-accent/20 rounded-xl"
        style={{ opacity: swipeProgress }}
      >
        <Check size={18} strokeWidth={3} className="text-accent" />
        <span className="text-sm font-semibold text-accent">Done!</span>
      </div>

      {/* Select overlay */}
      {selectable && (
        <div className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center z-10 transition-colors ${
          selected ? 'bg-accent border-accent' : 'border-border bg-surface-2'
        }`}>
          {selected && <Check size={11} strokeWidth={3} className="text-white" />}
        </div>
      )}

      {/* Card */}
      <div
        className={`relative flex border border-border rounded-xl overflow-hidden transition-[opacity,box-shadow] bg-surface-1 ${
          status === 'future' ? 'opacity-70' : ''
        } ${celebrating ? 'shadow-md shadow-accent/20' : ''} ${
          selected ? 'border-accent/50 bg-accent/5' : ''
        }`}
        style={{
          transform: `translateX(${swiped ? SWIPE_THRESHOLD + 24 : swipeX}px)`,
          transition: swipeX === 0 || swiped ? 'transform 0.22s cubic-bezier(0.4,0,0.2,1)' : 'none',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Colored left accent bar */}
        <div className={`w-1 shrink-0 ${ACCENT_BAR[status]}`} />

        <div className={`flex-1 flex items-start gap-3 p-3.5 ${selectable ? 'pl-10' : ''}`}>
          {/* Complete button */}
          {!selectable && (
            <div className="relative shrink-0">
              <button
                onClick={triggerComplete}
                title="Mark as done"
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                  celebrating
                    ? 'border-accent bg-accent/20 animate-check-pop'
                    : 'border-surface-3 hover:border-accent active:scale-90'
                }`}
              >
                <Check
                  size={16}
                  strokeWidth={3}
                  className={`transition-colors ${celebrating ? 'text-accent' : 'text-transparent'}`}
                />
              </button>
              {celebrating && PARTICLES.map((p, i) => {
                const tx = Math.round(Math.cos(p.angle * Math.PI / 180) * 22)
                const ty = Math.round(Math.sin(p.angle * Math.PI / 180) * 22)
                return (
                  <span
                    key={i}
                    className="particle"
                    style={{ '--tx': `${tx}px`, '--ty': `${ty}px`, backgroundColor: p.color } as React.CSSProperties}
                  />
                )
              })}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0 py-0.5">
            <div className="flex items-center gap-1.5">
              {task.flagged && <Star size={11} className="text-warning shrink-0 fill-warning" />}
              <span className="text-sm font-semibold text-text-primary leading-snug">{task.title}</span>
            </div>

            <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
              <span className={`text-xs ${STATUS_BADGE[status]}`}>{dueLabel}</span>
              <span className="text-xs text-text-muted">{FREQUENCY_LABELS[task.frequency]}</span>
              {showRoom && room && (
                <span className="text-xs text-text-muted">{room.icon} {room.name}</span>
              )}
            </div>

            {assignedPeople.length > 0 && (
              <div className="flex gap-1 mt-1.5 flex-wrap">
                {assignedPeople.map(p => (
                  <span
                    key={p.id}
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: `${p.colour}22`, color: p.colour }}
                  >
                    {p.name}
                  </span>
                ))}
              </div>
            )}

            {task.notes && (
              <button
                onClick={e => { e.stopPropagation(); setExpanded(v => !v) }}
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

          {/* Action buttons */}
          {!selectable && (
            <div className="flex items-center gap-0.5 shrink-0 mt-0.5">
              {/* Mobile swipe hint */}
              <span
                className={`md:hidden text-text-muted transition-opacity duration-200 ${swipeX > 0 ? 'opacity-0' : 'opacity-20'}`}
                aria-hidden
              >
                <ChevronsRight size={13} />
              </span>

              {onFlag && (
                <button
                  onClick={e => { e.stopPropagation(); onFlag() }}
                  className={`p-1 transition-colors ${task.flagged ? 'text-warning' : 'text-text-muted hover:text-warning'}`}
                  title={task.flagged ? 'Unstar' : 'Star'}
                >
                  <Star size={13} className={task.flagged ? 'fill-warning' : ''} />
                </button>
              )}

              {onEdit && (
                <button
                  onClick={e => { e.stopPropagation(); setEditing(true) }}
                  className="p-1 text-text-muted hover:text-text-primary transition-colors"
                  title="Edit"
                >
                  <Pencil size={13} />
                </button>
              )}

              <button
                onClick={e => { e.stopPropagation(); onDelete() }}
                className="text-text-muted hover:text-danger transition-colors p-1"
                title="Delete"
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
