import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { type AppData, type Room } from '../lib/types'
import { getDueStatus } from '../lib/scheduler'
import TaskCard from '../components/tasks/TaskCard'
import TaskForm from '../components/tasks/TaskForm'

interface Props {
  data: AppData
  onComplete: (id: string) => void
  onDeleteTask: (id: string) => void
  onAddTask: (task: Parameters<typeof TaskForm>[0]['onSave'] extends (t: infer T) => void ? T : never) => void
  onAddRoom: (room: Omit<Room, 'id'>) => void
  onDeleteRoom: (id: string) => void
}

const ROOM_ICONS = ['🍳', '🚿', '🛋️', '🛏️', '🫧', '🌿', '🏠', '📚', '🚗', '🧺', '🪴', '🍽️']

export default function Rooms({ data, onComplete, onDeleteTask, onAddTask, onAddRoom, onDeleteRoom }: Props) {
  const [addingTaskForRoom, setAddingTaskForRoom] = useState<string | null>(null)
  const [addingRoom, setAddingRoom] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [newRoomIcon, setNewRoomIcon] = useState('🏠')

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRoomName.trim()) return
    onAddRoom({ name: newRoomName.trim(), icon: newRoomIcon })
    setNewRoomName('')
    setNewRoomIcon('🏠')
    setAddingRoom(false)
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-text-primary">Rooms</h1>
        <button
          onClick={() => setAddingRoom(true)}
          className="no-print flex items-center gap-2 px-3 py-2 bg-surface-2 border border-border hover:border-accent rounded-lg text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <Plus size={16} /> Add room
        </button>
      </div>

      {addingRoom && (
        <form onSubmit={handleAddRoom} className="mb-6 bg-surface-2 border border-border rounded-xl p-4 flex gap-3 items-end">
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Icon</label>
            <select
              value={newRoomIcon}
              onChange={e => setNewRoomIcon(e.target.value)}
              className="bg-surface-3 border border-border rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-accent"
            >
              {ROOM_ICONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs text-text-secondary mb-1.5">Room name</label>
            <input
              autoFocus
              value={newRoomName}
              onChange={e => setNewRoomName(e.target.value)}
              placeholder="e.g. Home Office"
              className="w-full bg-surface-3 border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
            />
          </div>
          <button type="submit" disabled={!newRoomName.trim()} className="px-4 py-2 text-sm bg-accent text-surface font-medium rounded-lg hover:bg-accent/90 disabled:opacity-40 transition-colors">
            Add
          </button>
          <button type="button" onClick={() => setAddingRoom(false)} className="px-3 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
            Cancel
          </button>
        </form>
      )}

      <div className="flex flex-col gap-8">
        {data.rooms.map(room => {
          const roomTasks = data.tasks.filter(t => t.roomId === room.id)
          const overdue = roomTasks.filter(t => getDueStatus(t) === 'overdue').length

          return (
            <div key={room.id}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{room.icon}</span>
                  <h2 className="text-base font-semibold text-text-primary">{room.name}</h2>
                  <span className="text-xs text-text-muted">{roomTasks.length} tasks</span>
                  {overdue > 0 && (
                    <span className="text-xs bg-danger/20 text-danger px-2 py-0.5 rounded-full">{overdue} overdue</span>
                  )}
                </div>
                <div className="flex items-center gap-2 no-print">
                  <button
                    onClick={() => setAddingTaskForRoom(room.id)}
                    className="flex items-center gap-1 text-xs text-text-muted hover:text-accent transition-colors"
                  >
                    <Plus size={13} /> Add task
                  </button>
                  <button
                    onClick={() => onDeleteRoom(room.id)}
                    className="text-text-muted hover:text-danger transition-colors"
                    title="Delete room"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {addingTaskForRoom === room.id && (
                <div className="mb-3">
                  <TaskForm
                    rooms={data.rooms}
                    people={data.people}
                    defaultRoomId={room.id}
                    onSave={task => { onAddTask(task); setAddingTaskForRoom(null) }}
                    onCancel={() => setAddingTaskForRoom(null)}
                  />
                </div>
              )}

              {roomTasks.length === 0 ? (
                <p className="text-xs text-text-muted py-3 pl-1">No tasks yet.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {roomTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      room={room}
                      people={data.people}
                      onComplete={() => onComplete(task.id)}
                      onDelete={() => onDeleteTask(task.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
