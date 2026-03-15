import { useState } from 'react'
import { Plus } from 'lucide-react'
import { format } from 'date-fns'
import { type AppData } from '../lib/types'
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
      {/* Track */}
      <circle cx={cx} cy={cy} r={r} fill="none"
        stroke="rgb(var(--surface-3))" strokeWidth="9"
        strokeDasharray={`${arc} ${circumference - arc}`}
        transform={`rotate(135 ${cx} ${cy})`}
        strokeLinecap="round"
      />
      {/* Progress */}
      <circle cx={cx} cy={cy} r={r} fill="none"
        stroke={color} strokeWidth="9"
        strokeDasharray={`${fill} ${circumference - fill}`}
        transform={`rotate(135 ${cx} ${cy})`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      {/* Number */}
      <text x={cx} y={cy - 4} textAnchor="middle" fill={color}
        fontSize="28" fontWeight="800" fontFamily="system-ui, sans-serif">
        {score}
      </text>
      {/* Label */}
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

function AllClear({ score, streak, nextTask }: { score: number; streak: number; nextTask?: string }) {
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
      {nextTask && (
        <p className="text-xs text-text-muted">Next up: {nextTask}</p>
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
  onQuickSetup: (name: string) => void
  onSkipOnboarding: () => void
}

export default function Today({ data, onComplete, onDelete, onAdd, onQuickSetup, onSkipOnboarding }: Props) {
  const [adding, setAdding] = useState(false)

  const score = getHomeScore(data.tasks)
  const doneThisWeek = getCompletedThisWeek(data.completionLog)
  const streak = data.streakData.count

  const dueTasks = sortByDue(
    data.tasks.filter(t => {
      const s = getDueStatus(t)
      return s === 'overdue' || s === 'today' || s === 'upcoming'
    })
  )
  const overdue  = dueTasks.filter(t => getDueStatus(t) === 'overdue')
  const today    = dueTasks.filter(t => getDueStatus(t) === 'today')
  const upcoming = dueTasks.filter(t => getDueStatus(t) === 'upcoming')

  // First-run onboarding
  if (!data.onboardingComplete && data.tasks.length === 0) {
    return <Onboarding onQuickSetup={onQuickSetup} onSkip={onSkipOnboarding} />
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const dateStr = format(new Date(), 'EEEE, MMMM d')

  // Next future task (for all-clear screen)

  const Section = ({ title, tasks, badge }: { title: string; tasks: typeof dueTasks; badge?: string }) =>
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
              people={data.people}
              onComplete={() => onComplete(task.id)}
              onDelete={() => onDelete(task.id)}
              showRoom
            />
          ))}
        </div>
      </div>
    ) : null

  return (
    <div className="p-6 md:p-8 max-w-2xl pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-text-muted">{dateStr}</p>
          <h1 className="text-xl font-bold text-text-primary mt-0.5">{greeting} 👋</h1>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="no-print flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 border border-border hover:border-accent rounded-lg text-xs text-text-secondary hover:text-text-primary transition-colors"
        >
          <Plus size={14} /> Add task
        </button>
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

      {/* All clear */}
      {dueTasks.length === 0 && !adding && (
        <AllClear score={score} streak={streak} />
      )}

      <Section title="Overdue" tasks={overdue} badge={overdue.length > 0 ? String(overdue.length) : undefined} />
      <Section title="Today" tasks={today} />
      <Section title="This week" tasks={upcoming} />
    </div>
  )
}
