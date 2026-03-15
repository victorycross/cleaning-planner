import { useState } from 'react'
import { type Task, type Room, type Person, type Frequency } from '../../lib/types'
import { FREQUENCY_OPTIONS } from '../../lib/scheduler'

interface Props {
  rooms: Room[]
  people: Person[]
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'lastCompleted'>) => void
  onCancel: () => void
  defaultRoomId?: string
  initial?: Pick<Task, 'title' | 'roomId' | 'frequency' | 'assignedTo' | 'notes' | 'flagged'>
  editMode?: boolean
}

export default function TaskForm({ rooms, people, onSave, onCancel, defaultRoomId, initial, editMode }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [roomId, setRoomId] = useState(initial?.roomId ?? defaultRoomId ?? rooms[0]?.id ?? '')
  const [frequency, setFrequency] = useState<Frequency>(initial?.frequency ?? 'weekly')
  const [assignedTo, setAssignedTo] = useState<string[]>(initial?.assignedTo ?? [])
  const [notes, setNotes] = useState(initial?.notes ?? '')

  const togglePerson = (id: string) =>
    setAssignedTo(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !roomId) return
    onSave({ title: title.trim(), roomId, frequency, assignedTo, notes: notes.trim(), flagged: initial?.flagged ?? false })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface-2 border border-border rounded-xl p-5 flex flex-col gap-4">
      <div>
        <label className="block text-xs text-text-secondary mb-1.5">Task name</label>
        <input
          autoFocus
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Wipe stovetop"
          className="w-full bg-surface-3 border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-text-secondary mb-1.5">Room</label>
          <select
            value={roomId}
            onChange={e => setRoomId(e.target.value)}
            className="w-full bg-surface-3 border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
          >
            {rooms.map(r => (
              <option key={r.id} value={r.id}>{r.icon} {r.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-text-secondary mb-1.5">Frequency</label>
          <select
            value={frequency}
            onChange={e => setFrequency(e.target.value as Frequency)}
            className="w-full bg-surface-3 border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
          >
            {FREQUENCY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {people.length > 0 && (
        <div>
          <label className="block text-xs text-text-secondary mb-1.5">Assign to</label>
          <div className="flex flex-wrap gap-2">
            {people.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => togglePerson(p.id)}
                className="text-xs px-3 py-1 rounded-full border transition-colors font-medium"
                style={
                  assignedTo.includes(p.id)
                    ? { backgroundColor: `${p.colour}33`, borderColor: p.colour, color: p.colour }
                    : { backgroundColor: 'transparent', borderColor: 'rgb(var(--border))', color: 'rgb(var(--text-muted))' }
                }
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs text-text-secondary mb-1.5">Notes <span className="text-text-muted">(optional)</span></label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          placeholder="Any extra details..."
          className="w-full bg-surface-3 border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent resize-none"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
          Cancel
        </button>
        <button
          type="submit"
          disabled={!title.trim()}
          className="px-4 py-2 text-sm bg-accent text-surface font-medium rounded-lg hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {editMode ? 'Save changes' : 'Add task'}
        </button>
      </div>
    </form>
  )
}
