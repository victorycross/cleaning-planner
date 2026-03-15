import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { type AppData, type Room, ROOM_ACCENTS } from '../lib/types'
import { getDueStatus, getHomeScore } from '../lib/scheduler'
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

const ROOM_ICONS = ['🍳', '🚿', '🛋️', '🛏️', '🫧', '🌿', '🏠', '📚', '🚗', '🧺', '🪴', '🍽️', '🎮', '🏋️', '🧴']

function RoomHealthBar({ score }: { score: number }) {
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'
  return (
    <div className="w-20 h-1.5 bg-surface-3 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: color }} />
    </div>
  )
}

export default function Rooms({ data, onComplete, onDeleteTask, onAddTask, onAddRoom, onDeleteRoom }: Props) {
  const [addingTaskForRoom, setAddingTaskForRoom] = useState<string | null>(null)
  const [addingRoom, setAddingRoom] = useState(false)
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null)
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
    <div className="p-6 md:p-8 max-w-3xl pb-24 md:pb-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Rooms</h1>
        <button onClick={() => setAddingRoom(true)}
          className="no-print flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 border border-border hover:border-accent rounded-lg text-xs text-text-secondary hover:text-text-primary transition-colors">
          <Plus size={14} /> Add room
        </button>
      </div>

      {addingRoom && (
        <form onSubmit={handleAddRoom} className="mb-6 bg-surface-1 border border-border rounded-2xl p-4 flex gap-3 items-end">
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Icon</label>
            <select value={newRoomIcon} onChange={e => setNewRoomIcon(e.target.value)}
              className="bg-surface-2 border border-border rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-accent">
              {ROOM_ICONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs text-text-secondary mb-1.5">Room name</label>
            <input autoFocus value={newRoomName} onChange={e => setNewRoomName(e.target.value)}
              placeholder="e.g. Home Office"
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent" />
          </div>
          <button type="submit" disabled={!newRoomName.trim()}
            className="px-4 py-2 text-sm bg-accent text-white font-medium rounded-lg hover:bg-accent/90 disabled:opacity-40 transition-colors">
            Add
          </button>
          <button type="button" onClick={() => setAddingRoom(false)}
            className="px-3 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
            Cancel
          </button>
        </form>
      )}

      {/* Room cards */}
      <div className="flex flex-col gap-3">
        {data.rooms.map(room => {
          const roomTasks = data.tasks.filter(t => t.roomId === room.id)
          const overdue = roomTasks.filter(t => getDueStatus(t) === 'overdue').length
          const score = getHomeScore(roomTasks)
          const accent = ROOM_ACCENTS[room.id]
          const isExpanded = expandedRoom === room.id

          return (
            <div key={room.id}
              className={`border rounded-2xl overflow-hidden transition-all ${accent?.glow ?? 'border-border'}`}>
              {/* Card header */}
              <div
                className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-surface-2 transition-colors bg-surface-1"
                onClick={() => setExpandedRoom(isExpanded ? null : room.id)}
              >
                <span className="text-3xl">{room.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-text-primary">{room.name}</span>
                    {overdue > 0 && (
                      <span className="text-xs bg-danger/15 text-danger px-1.5 py-0.5 rounded-full font-medium">{overdue} overdue</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <RoomHealthBar score={score} />
                    <span className="text-xs text-text-muted">{roomTasks.length} task{roomTasks.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 no-print" onClick={e => e.stopPropagation()}>
                  <button onClick={() => { setAddingTaskForRoom(room.id); setExpandedRoom(room.id) }}
                    className="flex items-center gap-1 text-xs text-text-muted hover:text-accent transition-colors px-2 py-1">
                    <Plus size={12} /> Add task
                  </button>
                  <button onClick={() => onDeleteRoom(room.id)}
                    className="text-text-muted hover:text-danger transition-colors p-1">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-3 bg-surface border-t border-border">
                  {addingTaskForRoom === room.id && (
                    <div className="mb-4">
                      <TaskForm rooms={data.rooms} people={data.people} defaultRoomId={room.id}
                        onSave={task => { onAddTask(task); setAddingTaskForRoom(null) }}
                        onCancel={() => setAddingTaskForRoom(null)} />
                    </div>
                  )}
                  {roomTasks.length === 0 ? (
                    <p className="text-sm text-text-muted py-2">No tasks yet.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {roomTasks.map(task => (
                        <TaskCard key={task.id} task={task} room={room} people={data.people}
                          onComplete={() => onComplete(task.id)}
                          onDelete={() => onDeleteTask(task.id)} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
