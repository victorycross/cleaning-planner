import { CheckSquare, LayoutGrid, Users, Calendar, Printer, BookOpen, Sun, Moon } from 'lucide-react'

export type View = 'today' | 'schedule' | 'rooms' | 'people' | 'library' | 'print'

interface Props {
  current: View
  onChange: (v: View) => void
  overdueCnt: number
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

const NAV: { id: View; label: string; icon: React.ReactNode }[] = [
  { id: 'today',    label: 'Today',        icon: <CheckSquare size={17} /> },
  { id: 'schedule', label: 'Schedule',     icon: <Calendar size={17} /> },
  { id: 'rooms',    label: 'Rooms',        icon: <LayoutGrid size={17} /> },
  { id: 'people',   label: 'People',       icon: <Users size={17} /> },
  { id: 'library',  label: 'Task Library', icon: <BookOpen size={17} /> },
  { id: 'print',    label: 'Print & Export', icon: <Printer size={17} /> },
]

export default function Sidebar({ current, onChange, overdueCnt, theme, onToggleTheme }: Props) {
  return (
    <aside className="no-print w-56 shrink-0 bg-surface-1 border-r border-border flex flex-col py-5 px-3 min-h-screen">
      {/* Brand */}
      <div className="px-3 mb-7">
        <div className="flex items-center gap-2">
          <span className="text-xl">✨</span>
          <h1 className="text-base font-bold text-text-primary tracking-tight">Sparkle</h1>
        </div>
        <p className="text-xs text-text-muted mt-0.5 pl-0.5">Keep your home happy</p>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {NAV.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors w-full text-left ${
              current === id
                ? 'bg-surface-3 text-text-primary font-medium'
                : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
            }`}
          >
            <span className={current === id ? 'text-accent' : 'opacity-70'}>{icon}</span>
            <span>{label}</span>
            {id === 'today' && overdueCnt > 0 && (
              <span className="ml-auto bg-danger text-white text-xs rounded-full px-1.5 py-0.5 leading-none font-medium">
                {overdueCnt}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Theme toggle */}
      <button
        onClick={onToggleTheme}
        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-text-muted hover:text-text-secondary hover:bg-surface-2 transition-colors w-full"
      >
        {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
      </button>
    </aside>
  )
}
