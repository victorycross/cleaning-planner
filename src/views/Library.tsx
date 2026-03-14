import { useState } from 'react'
import { Plus, Check, Sparkles, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { type AppData, type Task, type CustomLibraryTask, type Frequency, DEFAULT_ROOMS, FREQUENCY_LABELS } from '../lib/types'
import { TASK_LIBRARY, type LibraryTask } from '../lib/taskLibrary'
import { FREQUENCY_OPTIONS } from '../lib/scheduler'

interface Props {
  data: AppData
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'lastCompleted'>) => void
  onAddLibraryTask: (task: Omit<CustomLibraryTask, 'id'>) => void
  onDeleteLibraryTask: (id: string) => void
}

type LibraryEntry = ({ kind: 'builtin' } & LibraryTask) | ({ kind: 'custom' } & CustomLibraryTask)

function entryKey(e: LibraryEntry): string {
  return e.kind === 'custom' ? `custom:${e.id}` : `builtin:${e.roomId}:${e.title.toLowerCase()}`
}

function isAlreadyAdded(data: AppData, title: string, roomId: string): boolean {
  return data.tasks.some(t => t.roomId === roomId && t.title.toLowerCase() === title.toLowerCase())
}

interface AddCustomFormProps {
  roomId: string
  onSave: (task: Omit<CustomLibraryTask, 'id'>) => void
  onCancel: () => void
}

function AddCustomForm({ roomId, onSave, onCancel }: AddCustomFormProps) {
  const [title, setTitle] = useState('')
  const [frequency, setFrequency] = useState<Frequency>('weekly')
  const [notes, setNotes] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onSave({ title: title.trim(), roomId, frequency, notes: notes.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 bg-surface-2 border border-border rounded-xl p-4 flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-text-secondary mb-1">Task name</label>
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Clean ceiling fan"
            className="w-full bg-surface-3 border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-xs text-text-secondary mb-1">Frequency</label>
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
      <div>
        <label className="block text-xs text-text-secondary mb-1">Notes <span className="text-text-muted">(optional)</span></label>
        <input
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Any extra details..."
          className="w-full bg-surface-3 border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors">
          Cancel
        </button>
        <button
          type="submit"
          disabled={!title.trim()}
          className="px-4 py-1.5 text-sm bg-accent text-surface font-medium rounded-lg hover:bg-accent/90 disabled:opacity-40 transition-colors"
        >
          Save to library
        </button>
      </div>
    </form>
  )
}

export default function Library({ data, onAddTask, onAddLibraryTask, onDeleteLibraryTask }: Props) {
  const [addedKeys, setAddedKeys] = useState<Set<string>>(new Set())
  const [roomFilter, setRoomFilter] = useState<string>('all')
  const [addingForRoom, setAddingForRoom] = useState<string | null>(null)
  const [collapsedRooms, setCollapsedRooms] = useState<Set<string>>(new Set())

  // All rooms: default + user-created (deduplicated by id)
  const defaultRoomIds = new Set(DEFAULT_ROOMS.map(r => r.id))
  const customRooms = data.rooms.filter(r => !defaultRoomIds.has(r.id))
  const allRooms = [...DEFAULT_ROOMS, ...customRooms].filter(r =>
    data.rooms.some(dr => dr.id === r.id) // only show rooms the user hasn't deleted
  )

  const toggleCollapse = (roomId: string) =>
    setCollapsedRooms(prev => {
      const next = new Set(prev)
      next.has(roomId) ? next.delete(roomId) : next.add(roomId)
      return next
    })

  const addTask = (entry: LibraryEntry) => {
    onAddTask({ title: entry.title, roomId: entry.roomId, frequency: entry.frequency, assignedTo: [], notes: entry.notes })
    setAddedKeys(prev => new Set(prev).add(entryKey(entry)))
  }

  const addAllForRoom = (_roomId: string, entries: LibraryEntry[]) => {
    entries
      .filter(e => !isAlreadyAdded(data, e.title, e.roomId) && !addedKeys.has(entryKey(e)))
      .forEach(addTask)
  }

  const quickSetup = () => {
    allRooms.forEach(room => {
      const entries = getEntriesForRoom(room.id)
      addAllForRoom(room.id, entries)
    })
  }

  const getEntriesForRoom = (roomId: string): LibraryEntry[] => {
    const builtin: LibraryEntry[] = TASK_LIBRARY.filter(t => t.roomId === roomId).map(t => ({ kind: 'builtin', ...t }))
    const custom: LibraryEntry[] = data.libraryTasks.filter(t => t.roomId === roomId).map(t => ({ kind: 'custom', ...t }))
    return [...builtin, ...custom]
  }

  const visibleRooms = allRooms.filter(r => roomFilter === 'all' || r.id === roomFilter)

  const totalNew = allRooms.reduce((sum, room) => {
    return sum + getEntriesForRoom(room.id).filter(e => !isAlreadyAdded(data, e.title, e.roomId)).length
  }, 0)

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Task Library</h1>
          <p className="text-sm text-text-muted mt-1">Built-in and custom task templates — click to add to your planner</p>
        </div>
        {totalNew > 0 && (
          <button
            onClick={quickSetup}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-surface font-medium rounded-lg hover:bg-accent/90 transition-colors text-sm shrink-0"
          >
            <Sparkles size={15} /> Add all defaults
          </button>
        )}
      </div>

      {/* Room filter */}
      <div className="flex gap-2 flex-wrap mb-8">
        <button
          onClick={() => setRoomFilter('all')}
          className={`px-3 py-1 text-xs rounded-full border transition-colors ${
            roomFilter === 'all'
              ? 'border-accent text-accent bg-accent/10'
              : 'border-border text-text-muted hover:border-text-secondary hover:text-text-secondary'
          }`}
        >
          All rooms
        </button>
        {allRooms.map(r => (
          <button
            key={r.id}
            onClick={() => setRoomFilter(r.id)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              roomFilter === r.id
                ? 'border-accent text-accent bg-accent/10'
                : 'border-border text-text-muted hover:border-text-secondary hover:text-text-secondary'
            }`}
          >
            {r.icon} {r.name}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        {visibleRooms.map(room => {
          const entries = getEntriesForRoom(room.id)
          const newCount = entries.filter(e => !isAlreadyAdded(data, e.title, e.roomId) && !addedKeys.has(entryKey(e))).length
          const collapsed = collapsedRooms.has(room.id)

          return (
            <div key={room.id} className="border border-border rounded-xl overflow-hidden">
              {/* Room header */}
              <div
                className="flex items-center justify-between px-4 py-3 bg-surface-1 cursor-pointer hover:bg-surface-2 transition-colors"
                onClick={() => toggleCollapse(room.id)}
              >
                <div className="flex items-center gap-2">
                  <span>{room.icon}</span>
                  <span className="text-sm font-semibold text-text-primary">{room.name}</span>
                  <span className="text-xs text-text-muted">{entries.length} tasks</span>
                  {newCount > 0 && (
                    <span className="text-xs text-text-muted">· {newCount} not yet added</span>
                  )}
                </div>
                <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                  {newCount > 0 && (
                    <button
                      onClick={() => addAllForRoom(room.id, entries)}
                      className="text-xs text-accent hover:text-accent/80 transition-colors flex items-center gap-1"
                    >
                      <Plus size={12} /> Add all
                    </button>
                  )}
                  <button
                    onClick={() => setAddingForRoom(addingForRoom === room.id ? null : room.id)}
                    className="text-xs text-text-muted hover:text-text-secondary transition-colors flex items-center gap-1"
                  >
                    <Plus size={12} /> Custom task
                  </button>
                  <span className="text-text-muted">
                    {collapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
                  </span>
                </div>
              </div>

              {/* Add custom task form */}
              {addingForRoom === room.id && (
                <div className="px-4 pb-2 bg-surface-1 border-b border-border">
                  <AddCustomForm
                    roomId={room.id}
                    onSave={task => { onAddLibraryTask(task); setAddingForRoom(null) }}
                    onCancel={() => setAddingForRoom(null)}
                  />
                </div>
              )}

              {/* Task list */}
              {!collapsed && (
                <div className="divide-y divide-border/50">
                  {entries.length === 0 && (
                    <p className="text-xs text-text-muted px-4 py-4">No tasks yet — add a custom task above.</p>
                  )}
                  {entries.map(entry => {
                    const added = isAlreadyAdded(data, entry.title, entry.roomId) || addedKeys.has(entryKey(entry))
                    return (
                      <div
                        key={entryKey(entry)}
                        className={`flex items-center gap-3 px-4 py-3 transition-colors ${added ? 'opacity-40' : 'hover:bg-surface-1'}`}
                      >
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm ${added ? 'text-text-muted line-through' : 'text-text-primary'}`}>
                            {entry.title}
                          </span>
                          {entry.notes && (
                            <p className="text-xs text-text-muted mt-0.5 truncate">{entry.notes}</p>
                          )}
                        </div>
                        <span className="text-xs text-text-muted shrink-0">{FREQUENCY_LABELS[entry.frequency]}</span>
                        {entry.kind === 'custom' && (
                          <button
                            onClick={() => onDeleteLibraryTask(entry.id)}
                            className="text-text-muted hover:text-danger transition-colors shrink-0"
                            title="Remove from library"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                        <button
                          disabled={added}
                          onClick={() => addTask(entry)}
                          className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                            added
                              ? 'bg-accent/20 text-accent cursor-default'
                              : 'bg-surface-3 text-text-muted hover:bg-accent hover:text-surface'
                          }`}
                          title={added ? 'Already added' : 'Add to planner'}
                        >
                          {added ? <Check size={13} /> : <Plus size={13} />}
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
