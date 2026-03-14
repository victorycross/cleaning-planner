import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { type AppData } from '../lib/types'
import { getDueStatus, sortByDue } from '../lib/scheduler'
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

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-text-primary">People</h1>
        <button
          onClick={() => setAdding(true)}
          className="no-print flex items-center gap-2 px-3 py-2 bg-surface-2 border border-border hover:border-accent rounded-lg text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <Plus size={16} /> Add person
        </button>
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="mb-6 bg-surface-2 border border-border rounded-xl p-4 flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs text-text-secondary mb-1.5">Name</label>
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="e.g. Alex"
              className="w-full bg-surface-3 border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
            />
          </div>
          <button type="submit" disabled={!newName.trim()} className="px-4 py-2 text-sm bg-accent text-surface font-medium rounded-lg hover:bg-accent/90 disabled:opacity-40 transition-colors">
            Add
          </button>
          <button type="button" onClick={() => setAdding(false)} className="px-3 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
            Cancel
          </button>
        </form>
      )}

      {data.people.length === 0 && !adding && (
        <div className="text-center py-12 text-text-muted">
          <p className="text-3xl mb-3">👥</p>
          <p className="text-sm">Add household members to assign tasks.</p>
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
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
                    style={{ backgroundColor: `${person.colour}33`, color: person.colour }}
                  >
                    {person.name[0].toUpperCase()}
                  </div>
                  <div>
                    <span className="text-base font-semibold text-text-primary">{person.name}</span>
                    <span className="ml-2 text-xs text-text-muted">{tasks.length} tasks</span>
                  </div>
                  {overdue > 0 && (
                    <span className="text-xs bg-danger/20 text-danger px-2 py-0.5 rounded-full">{overdue} overdue</span>
                  )}
                </div>
                <button
                  onClick={() => onDeletePerson(person.id)}
                  className="no-print text-text-muted hover:text-danger transition-colors"
                  title="Remove person"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {tasks.length === 0 ? (
                <p className="text-xs text-text-muted py-3 pl-1">No tasks assigned.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {tasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      room={data.rooms.find(r => r.id === task.roomId)}
                      people={data.people}
                      onComplete={() => onComplete(task.id)}
                      onDelete={() => onDeleteTask(task.id)}
                      showRoom
                    />
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
                <TaskCard
                  key={task.id}
                  task={task}
                  room={data.rooms.find(r => r.id === task.roomId)}
                  people={data.people}
                  onComplete={() => onComplete(task.id)}
                  onDelete={() => onDeleteTask(task.id)}
                  showRoom
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
