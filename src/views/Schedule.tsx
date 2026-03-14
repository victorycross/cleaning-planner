import { useState } from 'react'
import { Plus } from 'lucide-react'
import { type AppData, type Frequency, FREQUENCY_LABELS } from '../lib/types'
import { sortByDue, getDueStatus, FREQUENCY_OPTIONS } from '../lib/scheduler'
import TaskCard from '../components/tasks/TaskCard'
import TaskForm from '../components/tasks/TaskForm'

interface Props {
  data: AppData
  onComplete: (id: string) => void
  onDelete: (id: string) => void
  onAdd: (task: Parameters<typeof TaskForm>[0]['onSave'] extends (t: infer T) => void ? T : never) => void
}

type Filter = 'all' | Frequency | 'overdue'

export default function Schedule({ data, onComplete, onDelete, onAdd }: Props) {
  const [filter, setFilter] = useState<Filter>('all')
  const [roomFilter, setRoomFilter] = useState<string>('all')
  const [adding, setAdding] = useState(false)

  const filtered = sortByDue(data.tasks.filter(t => {
    const freqMatch = filter === 'all' ? true : filter === 'overdue' ? getDueStatus(t) === 'overdue' : t.frequency === filter
    const roomMatch = roomFilter === 'all' || t.roomId === roomFilter
    return freqMatch && roomMatch
  }))

  const filterBtns: { id: Filter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'overdue', label: 'Overdue' },
    ...FREQUENCY_OPTIONS.map(f => ({ id: f.value as Filter, label: FREQUENCY_LABELS[f.value] })),
  ]

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-text-primary">Schedule</h1>
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

      <div className="flex gap-2 flex-wrap mb-4">
        {filterBtns.map(btn => (
          <button
            key={btn.id}
            onClick={() => setFilter(btn.id)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              filter === btn.id
                ? 'border-accent text-accent bg-accent/10'
                : 'border-border text-text-muted hover:border-text-secondary hover:text-text-secondary'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setRoomFilter('all')}
          className={`px-3 py-1 text-xs rounded-full border transition-colors ${
            roomFilter === 'all'
              ? 'border-accent/60 text-text-secondary bg-surface-2'
              : 'border-border text-text-muted hover:border-text-secondary hover:text-text-secondary'
          }`}
        >
          All rooms
        </button>
        {data.rooms.map(r => (
          <button
            key={r.id}
            onClick={() => setRoomFilter(r.id)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              roomFilter === r.id
                ? 'border-accent/60 text-text-secondary bg-surface-2'
                : 'border-border text-text-muted hover:border-text-secondary hover:text-text-secondary'
            }`}
          >
            {r.icon} {r.name}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-text-muted text-center py-12">No tasks match this filter.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(task => (
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
      )}
    </div>
  )
}
