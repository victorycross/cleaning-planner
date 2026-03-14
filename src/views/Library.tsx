import { useState } from 'react'
import { Plus, Check, Sparkles } from 'lucide-react'
import { type AppData, type Task, DEFAULT_ROOMS, FREQUENCY_LABELS } from '../lib/types'
import { TASK_LIBRARY, getLibraryTasksForRoom, type LibraryTask } from '../lib/taskLibrary'

interface Props {
  data: AppData
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'lastCompleted'>) => void
}

function taskKey(t: LibraryTask): string {
  return `${t.roomId}:${t.title.toLowerCase()}`
}

function isAlreadyAdded(data: AppData, libTask: LibraryTask): boolean {
  return data.tasks.some(
    t => t.roomId === libTask.roomId && t.title.toLowerCase() === libTask.title.toLowerCase()
  )
}

export default function Library({ data, onAddTask }: Props) {
  const [addedKeys, setAddedKeys] = useState<Set<string>>(new Set())
  const [roomFilter, setRoomFilter] = useState<string>('all')

  const addTask = (libTask: LibraryTask) => {
    onAddTask({ title: libTask.title, roomId: libTask.roomId, frequency: libTask.frequency, assignedTo: [], notes: libTask.notes })
    setAddedKeys(prev => new Set(prev).add(taskKey(libTask)))
  }

  const addAllForRoom = (roomId: string) => {
    const toAdd = getLibraryTasksForRoom(roomId).filter(t => !isAlreadyAdded(data, t) && !addedKeys.has(taskKey(t)))
    toAdd.forEach(addTask)
  }

  const quickSetup = () => {
    const toAdd = TASK_LIBRARY.filter(t => !isAlreadyAdded(data, t) && !addedKeys.has(taskKey(t)))
    toAdd.forEach(addTask)
  }

  const rooms = DEFAULT_ROOMS.filter(r =>
    roomFilter === 'all' || r.id === roomFilter
  )

  const totalNew = TASK_LIBRARY.filter(t => !isAlreadyAdded(data, t)).length

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Task Library</h1>
          <p className="text-sm text-text-muted mt-1">{TASK_LIBRARY.length} common household tasks — pick what suits your home</p>
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
        {DEFAULT_ROOMS.map(r => (
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

      <div className="flex flex-col gap-10">
        {rooms.map(room => {
          const libTasks = getLibraryTasksForRoom(room.id)
          const newCount = libTasks.filter(t => !isAlreadyAdded(data, t) && !addedKeys.has(taskKey(t))).length

          return (
            <div key={room.id}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{room.icon}</span>
                  <h2 className="text-sm font-semibold text-text-primary">{room.name}</h2>
                  <span className="text-xs text-text-muted">{libTasks.length} tasks</span>
                </div>
                {newCount > 0 && (
                  <button
                    onClick={() => addAllForRoom(room.id)}
                    className="text-xs text-accent hover:text-accent/80 transition-colors flex items-center gap-1"
                  >
                    <Plus size={12} /> Add all ({newCount})
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                {libTasks.map(libTask => {
                  const added = isAlreadyAdded(data, libTask) || addedKeys.has(taskKey(libTask))
                  return (
                    <div
                      key={taskKey(libTask)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                        added
                          ? 'border-border/50 bg-surface-1 opacity-50'
                          : 'border-border bg-surface-1 hover:border-surface-4'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm ${added ? 'text-text-muted line-through' : 'text-text-primary'}`}>
                          {libTask.title}
                        </span>
                        {libTask.notes && (
                          <p className="text-xs text-text-muted mt-0.5 truncate">{libTask.notes}</p>
                        )}
                      </div>
                      <span className="text-xs text-text-muted shrink-0">{FREQUENCY_LABELS[libTask.frequency]}</span>
                      <button
                        disabled={added}
                        onClick={() => addTask(libTask)}
                        className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                          added
                            ? 'bg-accent/20 text-accent cursor-default'
                            : 'bg-surface-3 text-text-muted hover:bg-accent hover:text-surface'
                        }`}
                        title={added ? 'Already added' : 'Add task'}
                      >
                        {added ? <Check size={13} /> : <Plus size={13} />}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
