import { useState } from 'react'
import { Plus, Trash2, ArrowLeft } from 'lucide-react'
import { type AppData, type Room, type Task, ROOM_ACCENTS } from '../lib/types'
import { getDueStatus, getHomeScore, getScoreColor, sortByDue } from '../lib/scheduler'
import TaskCard from '../components/tasks/TaskCard'
import TaskForm from '../components/tasks/TaskForm'

interface Props {
  data: AppData
  onComplete: (id: string) => void
  onDeleteTask: (id: string) => void
  onAddTask: (task: Parameters<typeof TaskForm>[0]['onSave'] extends (t: infer T) => void ? T : never) => void
  onAddRoom: (room: Omit<Room, 'id'>) => void
  onDeleteRoom: (id: string) => void
  onEditTask: (id: string, patch: Partial<Task>) => void
  onFlagTask: (id: string) => void
}

const ROOM_ICONS = ['🍳', '🚿', '🛋️', '🛏️', '🫧', '🌿', '🏠', '📚', '🚗', '🧺', '🪴', '🍽️', '🎮', '🏋️', '🧴']

// ─── Mini health ring ─────────────────────────────────────────────────────────

function MiniRing({ score }: { score: number }) {
  const r = 19
  const cx = 26
  const cy = 26
  const circumference = 2 * Math.PI * r
  const arc = circumference * 0.75
  const fill = arc * (score / 100)
  const color = getScoreColor(score)

  return (
    <svg width="52" height="52" viewBox="0 0 52 52" className="shrink-0">
      <circle cx={cx} cy={cy} r={r} fill="none"
        stroke="rgb(var(--surface-3))" strokeWidth="4"
        strokeDasharray={`${arc} ${circumference - arc}`}
        transform={`rotate(135 ${cx} ${cy})`}
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={r} fill="none"
        stroke={color} strokeWidth="4"
        strokeDasharray={`${fill} ${circumference - fill}`}
        transform={`rotate(135 ${cx} ${cy})`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.5s ease' }}
      />
      <text x={cx} y={cy + 4} textAnchor="middle"
        fill={color} fontSize="11" fontWeight="800" fontFamily="system-ui, sans-serif">
        {score}
      </text>
    </svg>
  )
}

// ─── Room tile ─────────────────────────────────────────────────────────────────

function RoomTile({
  room, tasks, isSelected, onClick
}: {
  room: Room
  tasks: AppData['tasks']
  isSelected: boolean
  onClick: () => void
}) {
  const score = getHomeScore(tasks)
  const overdue = tasks.filter(t => getDueStatus(t) === 'overdue').length
  const dueToday = tasks.filter(t => getDueStatus(t) === 'today').length
  const accent = ROOM_ACCENTS[room.id]
  const barColor = accent?.bar ?? getScoreColor(score)

  return (
    <button
      onClick={onClick}
      className={`text-left rounded-2xl overflow-hidden border transition-all active:scale-[0.97] ${
        isSelected
          ? 'border-accent/60 shadow-lg shadow-accent/10 ring-1 ring-accent/30'
          : 'border-border hover:border-border/80'
      } bg-surface-1`}
    >
      {/* Colored top strip */}
      <div className="h-1.5 w-full" style={{ backgroundColor: barColor }} />

      <div className="p-4">
        {/* Emoji + health ring */}
        <div className="flex items-start justify-between mb-3">
          <span className="text-4xl leading-none">{room.icon}</span>
          <MiniRing score={score} />
        </div>

        {/* Room name */}
        <p className="font-bold text-text-primary text-sm leading-tight">{room.name}</p>

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          <span className="text-xs text-text-muted">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
          {overdue > 0 && (
            <span className="text-[10px] bg-danger/15 text-danger px-1.5 py-0.5 rounded-full font-semibold leading-none">
              {overdue} overdue
            </span>
          )}
          {overdue === 0 && dueToday > 0 && (
            <span className="text-[10px] bg-accent/15 text-accent px-1.5 py-0.5 rounded-full font-semibold leading-none">
              {dueToday} today
            </span>
          )}
          {overdue === 0 && dueToday === 0 && tasks.length > 0 && (
            <span className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded-full font-medium leading-none">
              ✓ all clear
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

// ─── Room detail panel ────────────────────────────────────────────────────────

function RoomDetail({
  room, tasks, people, rooms,
  onComplete, onDeleteTask, onAddTask, onDeleteRoom, onEditTask, onFlagTask, onClose
}: {
  room: Room
  tasks: AppData['tasks']
  people: AppData['people']
  rooms: AppData['rooms']
  onComplete: (id: string) => void
  onDeleteTask: (id: string) => void
  onAddTask: Props['onAddTask']
  onDeleteRoom: (id: string) => void
  onEditTask: Props['onEditTask']
  onFlagTask: Props['onFlagTask']
  onClose: () => void
}) {
  const [addingTask, setAddingTask] = useState(false)
  const sorted = sortByDue(tasks)

  return (
    <div className="mt-3 border border-border rounded-2xl overflow-hidden bg-surface animate-fade-up">
      {/* Detail header */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface-1 border-b border-border">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors p-1 -ml-1">
            <ArrowLeft size={16} />
          </button>
          <span className="text-base">{room.icon}</span>
          <h2 className="font-bold text-text-primary">{room.name}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAddingTask(true)}
            className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 font-medium transition-colors px-2 py-1 bg-accent/10 rounded-lg"
          >
            <Plus size={13} /> Add task
          </button>
          <button onClick={() => onDeleteRoom(room.id)} className="text-text-muted hover:text-danger transition-colors p-1">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="p-4">
        {addingTask && (
          <div className="mb-4">
            <TaskForm
              rooms={rooms}
              people={people}
              defaultRoomId={room.id}
              onSave={task => { onAddTask(task); setAddingTask(false) }}
              onCancel={() => setAddingTask(false)}
            />
          </div>
        )}
        {sorted.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-2xl mb-2">✨</p>
            <p className="text-sm text-text-muted">No tasks yet for this room.</p>
            <button
              onClick={() => setAddingTask(true)}
              className="mt-3 text-xs text-accent font-medium hover:underline"
            >
              Add your first task →
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {sorted.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                room={room}
                rooms={rooms}
                people={people}
                onComplete={() => onComplete(task.id)}
                onDelete={() => onDeleteTask(task.id)}
                onEdit={patch => onEditTask(task.id, patch)}
                onFlag={() => onFlagTask(task.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Rooms({ data, onComplete, onDeleteTask, onAddTask, onAddRoom, onDeleteRoom, onEditTask, onFlagTask }: Props) {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
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

  const handleDeleteRoom = (id: string) => {
    onDeleteRoom(id)
    if (selectedRoom === id) setSelectedRoom(null)
  }

  const selectedRoomData = data.rooms.find(r => r.id === selectedRoom)
  const selectedRoomTasks = selectedRoom ? data.tasks.filter(t => t.roomId === selectedRoom) : []

  // Overall home score across all rooms
  const overallScore = getHomeScore(data.tasks)
  const totalOverdue = data.tasks.filter(t => getDueStatus(t) === 'overdue').length

  return (
    <div className="p-4 md:p-8 max-w-3xl pb-28 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Rooms</h1>
          <p className="text-xs text-text-muted mt-0.5">
            {data.rooms.length} room{data.rooms.length !== 1 ? 's' : ''}
            {totalOverdue > 0 && <span className="text-danger ml-1.5">· {totalOverdue} overdue</span>}
            {totalOverdue === 0 && <span className="text-accent ml-1.5">· Home score {overallScore}</span>}
          </p>
        </div>
        <button
          onClick={() => setAddingRoom(true)}
          className="no-print flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 border border-border hover:border-accent rounded-lg text-xs text-text-secondary hover:text-text-primary transition-colors"
        >
          <Plus size={14} /> Add room
        </button>
      </div>

      {/* Add room form */}
      {addingRoom && (
        <form onSubmit={handleAddRoom} className="mb-4 bg-surface-1 border border-border rounded-2xl p-4 flex gap-3 items-end">
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Icon</label>
            <select
              value={newRoomIcon}
              onChange={e => setNewRoomIcon(e.target.value)}
              className="bg-surface-2 border border-border rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-accent"
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
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
            />
          </div>
          <button
            type="submit"
            disabled={!newRoomName.trim()}
            className="px-4 py-2 text-sm bg-accent text-white font-medium rounded-lg hover:bg-accent/90 disabled:opacity-40 transition-colors"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setAddingRoom(false)}
            className="px-3 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Room tile grid */}
      {data.rooms.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-3xl mb-3">🏠</p>
          <p className="text-text-muted text-sm">No rooms yet. Add your first room above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {data.rooms.map(room => (
            <RoomTile
              key={room.id}
              room={room}
              tasks={data.tasks.filter(t => t.roomId === room.id)}
              isSelected={selectedRoom === room.id}
              onClick={() => setSelectedRoom(selectedRoom === room.id ? null : room.id)}
            />
          ))}
        </div>
      )}

      {/* Expanded room detail */}
      {selectedRoomData && (
        <RoomDetail
          room={selectedRoomData}
          tasks={selectedRoomTasks}
          people={data.people}
          rooms={data.rooms}
          onComplete={onComplete}
          onDeleteTask={onDeleteTask}
          onAddTask={onAddTask}
          onDeleteRoom={handleDeleteRoom}
          onEditTask={onEditTask}
          onFlagTask={onFlagTask}
          onClose={() => setSelectedRoom(null)}
        />
      )}
    </div>
  )
}
