import { CheckSquare, LayoutGrid, Users, Calendar, Printer, BookOpen, Sun, Moon, UserCircle } from 'lucide-react'
import { type User } from '@supabase/supabase-js'
import { supabaseEnabled } from '../../lib/supabase'

export type View = 'today' | 'schedule' | 'rooms' | 'people' | 'library' | 'print' | 'profile'

interface Props {
  current: View
  onChange: (v: View) => void
  overdueCnt: number
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  user: User | null
}

const NAV: { id: View; label: string; icon: React.ReactNode }[] = [
  { id: 'today',    label: 'Today',          icon: <CheckSquare size={17} /> },
  { id: 'schedule', label: 'Schedule',       icon: <Calendar size={17} /> },
  { id: 'rooms',    label: 'Rooms',          icon: <LayoutGrid size={17} /> },
  { id: 'people',   label: 'People',         icon: <Users size={17} /> },
  { id: 'library',  label: 'Task Library',   icon: <BookOpen size={17} /> },
  { id: 'print',    label: 'Print & Export', icon: <Printer size={17} /> },
]

function UserAvatar({ user }: { user: User | null }) {
  if (!user) return null
  const name = user.user_metadata?.display_name ?? user.email?.split('@')[0] ?? '?'
  const initial = name.charAt(0).toUpperCase()
  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899']
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <span
      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
      style={{ backgroundColor: color }}
    >
      {initial}
    </span>
  )
}

export default function Sidebar({ current, onChange, overdueCnt, theme, onToggleTheme, user }: Props) {
  return (
    <aside className="no-print hidden md:flex w-56 shrink-0 bg-surface-1 border-r border-border flex-col py-5 px-3 min-h-screen">
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

      {/* Profile / sign-in */}
      {supabaseEnabled && (
        <button
          onClick={() => onChange('profile')}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors w-full mb-1 ${
            current === 'profile'
              ? 'bg-surface-3 text-text-primary font-medium'
              : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
          }`}
        >
          {user ? <UserAvatar user={user} /> : <UserCircle size={17} className="opacity-70" />}
          <span className="truncate">
            {user
              ? (user.user_metadata?.display_name ?? user.email?.split('@')[0] ?? 'Profile')
              : 'Sign in'}
          </span>
        </button>
      )}

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
