import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { type AppData } from '../lib/types'
import { getDueStatus, sortByDue, getCompletedThisWeek } from '../lib/scheduler'
import TaskCard from '../components/tasks/TaskCard'

interface Props {
  data: AppData
  onComplete: (id: string) => void
  onDeleteTask: (id: string) => void
  onAddPerson: (name: string) => void
  onDeletePerson: (id: string) => void
}

export default function People({ data, onComplete, onDeleteTask, onAddPerson, onDeletePerson }: Props) {
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    onAddPerson(newName.trim())
    setNewName('')
    setAdding(false)
  }

  const unassigned = sortByDue(data.tasks.filter(t => t.assignedTo.length === 0))
  const totalDoneThisWeek = getCompletedThisWeek(data.completionLog)

  // Per-person completions this week
  const personStats = data.people.map(p => {
    const done = data.completionLog.filter(e => {
      const task = data.tasks.find(t => t.id === e.taskId)
      return task?.assignedTo.includes(p.id)
    }).length
    return { person: p, done }
  }).sort((a, b) => b.done - a.done)

  const maxDone = Math.max(...personStats.map(s => s.done), 1)

  return (
    <div className="p-6 md:p-8 max-w-3xl pb-24 md:pb-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">People</h1>
        <button onClick={() => setAdding(true)}
          className="no-print flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 border border-border hover:border-accent rounded-lg text-xs text-text-secondary hover:text-text-primary transition-colors">
          <Plus size={14} /> Add person
        </button>
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="mb-6 bg-surface-1 border border-border rounded-2xl p-4 flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs text-text-secondary mb-1.5">Name</label>
            <input autoFocus value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Alex"
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent" />
          </div>
          <button type="submit" disabled={!newName.trim()}
            className="px-4 py-2 text-sm bg-accent text-white font-medium rounded-lg hover:bg-accent/90 disabled:opacity-40 transition-colors">
            Add
          </button>
          <button type="button" onClick={() => setAdding(false)}
            className="px-3 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
            Cancel
          </button>
        </form>
      )}

      {/* Scoreboard */}
      {data.people.length > 1 && (
        <div className="bg-surface-1 border border-border rounded-2xl p-5 mb-8">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-4">Leaderboard — all time</p>
          <div className="flex flex-col gap-3">
            {personStats.map(({ person, done }, i) => (
              <div key={person.id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-text-muted w-4">{i + 1}</span>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ backgroundColor: `${person.colour}33`, color: person.colour }}>
                  {person.name[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium text-text-primary flex-1">{person.name}</span>
                <div className="w-24 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${(done / maxDone) * 100}%`, backgroundColor: person.colour }} />
                </div>
                <span className="text-xs font-semibold text-text-secondary w-6 text-right">{done}</span>
              </div>
            ))}
          </div>
          {totalDoneThisWeek > 0 && (
            <p className="text-xs text-text-muted mt-4">{totalDoneThisWeek} tasks completed this week across the household</p>
          )}
        </div>
      )}

      {data.people.length === 0 && !adding && (
        <div className="text-center py-12 text-text-muted">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-sm">Add household members to assign tasks and track contributions.</p>
        </div>
      )}

      <div className="flex flex-col gap-8">
        {data.people.map(person => {
          const tasks = sortByDue(data.tasks.filter(t => t.assignedTo.includes(person.id)))
          const overdue = tasks.filter(t => getDueStatus(t) === 'overdue').length
          return (
            <div key={person.id}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: `${person.colour}33`, color: person.colour }}>
                    {person.name[0].toUpperCase()}
                  </div>
                  <div>
                    <span className="font-semibold text-text-primary">{person.name}</span>
                    <span className="ml-2 text-xs text-text-muted">{tasks.length} tasks</span>
                  </div>
                  {overdue > 0 && (
                    <span className="text-xs bg-danger/15 text-danger px-2 py-0.5 rounded-full font-medium">{overdue} overdue</span>
                  )}
                </div>
                <button onClick={() => onDeletePerson(person.id)}
                  className="no-print text-text-muted hover:text-danger transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
              {tasks.length === 0 ? (
                <p className="text-xs text-text-muted py-3 pl-1">No tasks assigned.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {tasks.map(task => (
                    <TaskCard key={task.id} task={task}
                      room={data.rooms.find(r => r.id === task.roomId)}
                      people={data.people}
                      onComplete={() => onComplete(task.id)}
                      onDelete={() => onDeleteTask(task.id)}
                      showRoom />
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {unassigned.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-semibold text-text-secondary">Unassigned</h2>
              <span className="text-xs text-text-muted">{unassigned.length} tasks</span>
            </div>
            <div className="flex flex-col gap-2">
              {unassigned.map(task => (
                <TaskCard key={task.id} task={task}
                  room={data.rooms.find(r => r.id === task.roomId)}
                  people={data.people}
                  onComplete={() => onComplete(task.id)}
                  onDelete={() => onDeleteTask(task.id)}
                  showRoom />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
