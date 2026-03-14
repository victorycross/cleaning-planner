import { CheckSquare, LayoutGrid, Users, Calendar, Printer, BookOpen } from 'lucide-react'

export type View = 'today' | 'schedule' | 'rooms' | 'people' | 'library' | 'print'

interface Props {
  current: View
  onChange: (v: View) => void
  overdueCnt: number
}

const NAV: { id: View; label: string; icon: React.ReactNode }[] = [
  { id: 'today', label: 'Today', icon: <CheckSquare size={18} /> },
  { id: 'schedule', label: 'Schedule', icon: <Calendar size={18} /> },
  { id: 'rooms', label: 'Rooms', icon: <LayoutGrid size={18} /> },
  { id: 'people', label: 'People', icon: <Users size={18} /> },
  { id: 'library', label: 'Task Library', icon: <BookOpen size={18} /> },
  { id: 'print', label: 'Print / PDF', icon: <Printer size={18} /> },
]

export default function Sidebar({ current, onChange, overdueCnt }: Props) {
  return (
    <aside className="no-print w-56 shrink-0 bg-surface-1 border-r border-border flex flex-col py-6 px-3 min-h-screen">
      <div className="px-3 mb-8">
        <h1 className="text-base font-semibold text-text-primary tracking-tight">🧹 Cleaning Planner</h1>
        <p className="text-xs text-text-muted mt-0.5">Home task tracker</p>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {NAV.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors w-full text-left ${
              current === id
                ? 'bg-surface-3 text-text-primary'
                : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
            }`}
          >
            <span className={current === id ? 'text-accent' : ''}>{icon}</span>
            <span>{label}</span>
            {id === 'today' && overdueCnt > 0 && (
              <span className="ml-auto bg-danger text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                {overdueCnt}
              </span>
            )}
          </button>
        ))}
      </nav>
    </aside>
  )
}
