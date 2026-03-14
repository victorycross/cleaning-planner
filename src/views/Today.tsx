import { useState } from 'react'
import { Plus } from 'lucide-react'
import { type AppData } from '../lib/types'
import { getDueStatus, sortByDue } from '../lib/scheduler'
import TaskCard from '../components/tasks/TaskCard'
import TaskForm from '../components/tasks/TaskForm'

interface Props {
  data: AppData
  onComplete: (id: string) => void
  onDelete: (id: string) => void
  onAdd: (task: Parameters<typeof TaskForm>[0]['onSave'] extends (t: infer T) => void ? T : never) => void
}

export default function Today({ data, onComplete, onDelete, onAdd }: Props) {
  const [adding, setAdding] = useState(false)

  const dueTasks = sortByDue(
    data.tasks.filter(t => {
      const s = getDueStatus(t)
      return s === 'overdue' || s === 'today' || s === 'upcoming'
    })
  )

  const overdue = dueTasks.filter(t => getDueStatus(t) === 'overdue')
  const today = dueTasks.filter(t => getDueStatus(t) === 'today')
  const upcoming = dueTasks.filter(t => getDueStatus(t) === 'upcoming')

  const Section = ({ title, tasks, badge }: { title: string; tasks: typeof dueTasks; badge?: string }) => (
    tasks.length > 0 ? (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">{title}</h2>
          {badge && <span className="text-xs bg-danger/20 text-danger px-2 py-0.5 rounded-full">{badge}</span>}
        </div>
        <div className="flex flex-col gap-2">
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
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
  )

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Today</h1>
          <p className="text-sm text-text-muted mt-1">
            {dueTasks.length === 0 ? 'All caught up' : `${dueTasks.length} task${dueTasks.length !== 1 ? 's' : ''} need attention`}
          </p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="no-print flex items-center gap-2 px-3 py-2 bg-surface-2 border border-border hover:border-accent rounded-lg text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <Plus size={16} /> Add task
        </button>
      </div>

      {adding && (
        <div className="mb-6">
          <TaskForm
            rooms={data.rooms}
            people={data.people}
            onSave={task => { onAdd(task); setAdding(false) }}
            onCancel={() => setAdding(false)}
          />
        </div>
      )}

      {dueTasks.length === 0 && !adding && (
        <div className="text-center py-16 text-text-muted">
          <p className="text-4xl mb-3">✨</p>
          <p className="text-sm">Nothing due in the next 7 days.</p>
        </div>
      )}

      <Section title="Overdue" tasks={overdue} badge={overdue.length > 0 ? `${overdue.length}` : undefined} />
      <Section title="Today" tasks={today} />
      <Section title="This week" tasks={upcoming} />
    </div>
  )
}
