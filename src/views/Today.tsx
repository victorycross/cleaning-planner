import { useState } from 'react'
import { Plus, Check, CheckCheck } from 'lucide-react'
import { format } from 'date-fns'
import { type AppData, type Task, ROOM_ACCENTS } from '../lib/types'
import { getDueStatus, sortByDue, getHomeScore, getScoreLabel, getScoreColor, getCompletedThisWeek, getWeeklyCompletions, getWeekDayLabels } from '../lib/scheduler'
import TaskCard from '../components/tasks/TaskCard'
import TaskForm from '../components/tasks/TaskForm'

// ─── Score Ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const r = 48
  const cx = 64
  const cy = 64
  const circumference = 2 * Math.PI * r
  const arc = circumference * 0.75
  const fill = arc * (score / 100)
  const color = getScoreColor(score)

  return (
    <svg width="128" height="128" viewBox="0 0 128 128" className="shrink-0">
      <circle cx={cx} cy={cy} r={r} fill="none"
        stroke="rgb(var(--surface-3))" strokeWidth="9"
        strokeDasharray={`${arc} ${circumference - arc}`}
        transform={`rotate(135 ${cx} ${cy})`}
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={r} fill="none"
        stroke={color} strokeWidth="9"
        strokeDasharray={`${fill} ${circumference - fill}`}
        transform={`rotate(135 ${cx} ${cy})`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      <text x={cx} y={cy - 4} textAnchor="middle" fill={color}
        fontSize="28" fontWeight="800" fontFamily="system-ui, sans-serif">
        {score}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle"
        fill="rgb(var(--text-muted))" fontSize="9" fontWeight="600"
        letterSpacing="0.06em" fontFamily="system-ui, sans-serif">
        SPARKLE SCORE
      </text>
    </svg>
  )
}

// ─── Weekly Bar Chart ──────────────────────────────────────────────────────────

function WeekChart({ completionLog }: { completionLog: AppData['completionLog'] }) {
  const bars = getWeeklyCompletions(completionLog)
  const labels = getWeekDayLabels()
  const max = Math.max(...bars, 1)

  return (
    <div className="flex items-end gap-1.5 h-12">
      {bars.map((count, i) => {
        const isToday = i === 6
        const height = Math.max(4, Math.round((count / max) * 40))
        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <div
              className={`w-full rounded-sm transition-all ${isToday ? 'bg-accent' : count > 0 ? 'bg-accent/40' : 'bg-surface-3'}`}
              style={{ height: `${height}px` }}
              title={`${labels[i]}: ${count} task${count !== 1 ? 's' : ''}`}
            />
            <span className={`text-[9px] ${isToday ? 'text-accent font-semibold' : 'text-text-muted'}`}>
              {labels[i]}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Room health strip ─────────────────────────────────────────────────────────

function RoomStrip({ rooms, tasks }: { rooms: AppData['rooms']; tasks: AppData['tasks'] }) {
  if (rooms.length === 0) return null

  return (
    <div className="mb-5">
      <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-2.5">Room health</p>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {rooms.map(room => {
          const roomTasks = tasks.filter(t => t.roomId === room.id)
          const score = getHomeScore(roomTasks)
          const overdue = roomTasks.filter(t => getDueStatus(t) === 'overdue').length
          const accent = ROOM_ACCENTS[room.id]
          const barColor = accent?.bar ?? getScoreColor(score)
          const scoreColor = getScoreColor(score)

          return (
            <div
              key={room.id}
              className="flex-shrink-0 flex flex-col items-center gap-1.5 bg-surface-1 border border-border rounded-2xl px-3 py-2.5 min-w-[68px]"
              style={{ borderTopColor: barColor, borderTopWidth: 3 }}
            >
              <span className="text-2xl leading-none">{room.icon}</span>
              <span className="text-[10px] font-semibold text-text-secondary text-center leading-tight">{room.name}</span>
              <span className="text-[11px] font-bold" style={{ color: scoreColor }}>{score}</span>
              {overdue > 0 && (
                <span className="text-[9px] text-danger font-semibold leading-none">{overdue}⚠</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Onboarding ───────────────────────────────────────────────────────────────

function Onboarding({ onQuickSetup, onSkip }: { onQuickSetup: (name: string) => void; onSkip: () => void }) {
  const [name, setName] = useState('')

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6 animate-fade-up">
      <div className="text-6xl mb-4">✨</div>
      <h2 className="text-2xl font-bold text-text-primary mb-2">Welcome to Sparkle</h2>
      <p className="text-text-secondary mb-8 max-w-sm">
        Keep your whole home on top of cleaning — with room-by-room schedules, shared tasks, and a live home health score.
      </p>
      <div className="bg-surface-1 border border-border rounded-2xl p-6 w-full max-w-sm text-left mb-4">
        <label className="block text-sm font-medium text-text-secondary mb-2">Your name <span className="text-text-muted font-normal">(optional)</span></label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Alex"
          className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent mb-4"
        />
        <button
          onClick={() => onQuickSetup(name)}
          className="w-full py-2.5 bg-accent text-white font-semibold rounded-xl hover:bg-accent/90 transition-colors text-sm"
        >
          🚀 Set up my home (60 tasks, 6 rooms)
        </button>
        <p className="text-xs text-text-muted mt-2 text-center">You can customise everything after setup.</p>
      </div>
      <button onClick={onSkip} className="text-xs text-text-muted hover:text-text-secondary transition-colors">
        Start fresh without templates →
      </button>
    </div>
  )
}

// ─── All Clear ────────────────────────────────────────────────────────────────

function AllClear({ score, streak }: { score: number; streak: number }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-6 py-12 animate-fade-up">
      <div
        className="w-28 h-28 rounded-full flex items-center justify-center text-4xl mb-5"
        style={{ background: `radial-gradient(circle, ${getScoreColor(score)}22, transparent)` }}
      >
        🏠
      </div>
      <h2 className="text-2xl font-bold text-text-primary mb-1">Your home is spotless!</h2>
      <p className="text-text-secondary text-sm mb-4">Sparkle score: <span style={{ color: getScoreColor(score) }} className="font-bold text-base">{score}</span></p>
      {streak >= 2 && (
        <div className="flex items-center gap-2 bg-warning/10 text-warning border border-warning/20 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
          🔥 {streak}-day streak — keep it going!
        </div>
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface Props {
  data: AppData
  onComplete: (id: string) => void
  onDelete: (id: string) => void
  onAdd: (task: Parameters<typeof TaskForm>[0]['onSave'] extends (t: infer T) => void ? T : never) => void
  onEdit: (id: string, patch: Partial<Task>) => void
  onFlag: (id: string) => void
  onQuickSetup: (name: string) => void
  onSkipOnboarding: () => void
}

export default function Today({ data, onComplete, onDelete, onAdd, onEdit, onFlag, onQuickSetup, onSkipOnboarding }: Props) {
  const [adding, setAdding] = useState(false)
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const score = getHomeScore(data.tasks)
  const doneThisWeek = getCompletedThisWeek(data.completionLog)
  const streak = data.streakData.count

  const activeTasks = sortByDue(
    data.tasks.filter(t => {
      const s = getDueStatus(t)
      return s === 'overdue' || s === 'today' || s === 'upcoming'
    })
  )

  const flagged  = activeTasks.filter(t => t.flagged)
  const flaggedIds = new Set(flagged.map(t => t.id))
  const overdue  = activeTasks.filter(t => !flaggedIds.has(t.id) && getDueStatus(t) === 'overdue')
  const today    = activeTasks.filter(t => !flaggedIds.has(t.id) && getDueStatus(t) === 'today')
  const upcoming = activeTasks.filter(t => !flaggedIds.has(t.id) && getDueStatus(t) === 'upcoming')

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      void (next.has(id) ? next.delete(id) : next.add(id))
      return next
    })
  }

  const exitSelectMode = () => {
    setSelectMode(false)
    setSelected(new Set())
  }

  const bulkComplete = () => {
    selected.forEach(id => onComplete(id))
    exitSelectMode()
  }

  if (!data.onboardingComplete && data.tasks.length === 0) {
    return <Onboarding onQuickSetup={onQuickSetup} onSkip={onSkipOnboarding} />
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const dateStr = format(new Date(), 'EEEE, MMMM d')
  const Section = ({ title, tasks, badge }: { title: string; tasks: typeof activeTasks; badge?: string }) =>
    tasks.length > 0 ? (
      <div className="mb-7">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest">{title}</h2>
          {badge && <span className="text-xs bg-danger/15 text-danger px-2 py-0.5 rounded-full font-medium">{badge}</span>}
        </div>
        <div className="flex flex-col gap-2">
          {tasks.map(task => (
            <TaskCard
              key={task.id} task={task}
              room={data.rooms.find(r => r.id === task.roomId)}
              rooms={data.rooms}
              people={data.people}
              onComplete={() => onComplete(task.id)}
              onDelete={() => onDelete(task.id)}
              onEdit={patch => onEdit(task.id, patch)}
              onFlag={() => onFlag(task.id)}
              showRoom
              selectable={selectMode}
              selected={selected.has(task.id)}
              onToggleSelect={() => toggleSelect(task.id)}
            />
          ))}
        </div>
      </div>
    ) : null

  return (
    <div className="p-4 md:p-8 max-w-2xl" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-text-muted">{dateStr}</p>
          <h1 className="text-xl font-bold text-text-primary mt-0.5">{greeting} 👋</h1>
        </div>
        <div className="flex items-center gap-2">
          {activeTasks.length > 0 && (
            <button
              onClick={() => { setSelectMode(v => !v); setSelected(new Set()) }}
              className={`no-print flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs transition-colors ${
                selectMode
                  ? 'bg-accent/10 border-accent text-accent'
                  : 'bg-surface-2 border-border text-text-secondary hover:border-accent hover:text-text-primary'
              }`}
            >
              <CheckCheck size={14} /> {selectMode ? 'Cancel' : 'Select'}
            </button>
          )}
          <button
            onClick={() => setAdding(true)}
            className="no-print flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 border border-border hover:border-accent rounded-lg text-xs text-text-secondary hover:text-text-primary transition-colors"
          >
            <Plus size={14} /> Add task
          </button>
        </div>
      </div>

      {adding && (
        <div className="mb-6">
          <TaskForm rooms={data.rooms} people={data.people}
            onSave={task => { onAdd(task); setAdding(false) }}
            onCancel={() => setAdding(false)} />
        </div>
      )}

      {/* Score + Stats */}
      <div className="bg-surface-1 border border-border rounded-2xl p-5 mb-5 flex gap-5 items-center">
        <ScoreRing score={score} />
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold mb-0.5" style={{ color: getScoreColor(score) }}>
            {getScoreLabel(score)}
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
            <div>
              <p className="text-xl font-bold text-text-primary leading-none">{doneThisWeek}</p>
              <p className="text-xs text-text-muted mt-0.5">done this week</p>
            </div>
            <div>
              <p className="text-xl font-bold text-text-primary leading-none flex items-center gap-1">
                {streak >= 1 ? '🔥' : '—'} {streak >= 1 ? streak : 0}
              </p>
              <p className="text-xs text-text-muted mt-0.5">day streak</p>
            </div>
            <div>
              <p className="text-xl font-bold text-text-primary leading-none">{data.tasks.length}</p>
              <p className="text-xs text-text-muted mt-0.5">total tasks</p>
            </div>
            <div>
              <p className="text-xl font-bold text-text-primary leading-none">{data.rooms.length}</p>
              <p className="text-xs text-text-muted mt-0.5">rooms</p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly bar chart */}
      <div className="bg-surface-1 border border-border rounded-2xl px-5 pt-4 pb-4 mb-6">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">This week</p>
        <WeekChart completionLog={data.completionLog} />
      </div>

      {/* Room health strip */}
      {data.rooms.length > 0 && <RoomStrip rooms={data.rooms} tasks={data.tasks} />}

      {/* All clear */}
      {activeTasks.length === 0 && !adding && (
        <AllClear score={score} streak={streak} />
      )}

      {/* eslint-disable-next-line react-hooks/static-components */}
      <Section title="Starred" tasks={flagged} />
      {/* eslint-disable-next-line react-hooks/static-components */}
      <Section title="Overdue" tasks={overdue} badge={overdue.length > 0 ? String(overdue.length) : undefined} />
      {/* eslint-disable-next-line react-hooks/static-components */}
      <Section title="Today" tasks={today} />
      {/* eslint-disable-next-line react-hooks/static-components */}
      <Section title="This week" tasks={upcoming} />

      {/* Bulk complete bar */}
      {selectMode && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-surface border-t border-border flex items-center justify-between gap-3"
          style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
          <span className="text-sm text-text-secondary">
            {selected.size === 0 ? 'Tap tasks to select' : `${selected.size} selected`}
          </span>
          <button
            onClick={bulkComplete}
            disabled={selected.size === 0}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors"
          >
            <Check size={15} strokeWidth={3} /> Mark done
          </button>
        </div>
      )}
    </div>
  )
}
