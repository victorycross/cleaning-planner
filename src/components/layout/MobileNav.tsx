import { CheckSquare, LayoutGrid, Users, Calendar, BookOpen } from 'lucide-react'
import { type User } from '@supabase/supabase-js'
import { type View } from './Sidebar'
import { supabaseEnabled } from '../../lib/supabase'

interface Props {
  current: View
  onChange: (v: View) => void
  overdueCnt: number
  user: User | null
}

const BASE_NAV: { id: View; icon: React.ReactNode; label: string }[] = [
  { id: 'today',    icon: <CheckSquare size={22} />, label: 'Today' },
  { id: 'schedule', icon: <Calendar size={22} />,    label: 'Schedule' },
  { id: 'rooms',    icon: <LayoutGrid size={22} />,  label: 'Rooms' },
  { id: 'people',   icon: <Users size={22} />,       label: 'People' },
  { id: 'library',  icon: <BookOpen size={22} />,    label: 'Library' },
]

function UserAvatar({ user }: { user: User | null }) {
  if (!user) {
    return (
      <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-[10px]">
        ?
      </span>
    )
  }
  const name = user.user_metadata?.display_name ?? user.email?.split('@')[0] ?? '?'
  const initial = name.charAt(0).toUpperCase()
  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899']
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <span
      className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-white text-[10px] font-bold"
      style={{ backgroundColor: color }}
    >
      {initial}
    </span>
  )
}

export default function MobileNav({ current, onChange, overdueCnt, user }: Props) {
  const nav = supabaseEnabled
    ? [...BASE_NAV, { id: 'profile' as View, icon: <UserAvatar user={user} />, label: user ? 'Me' : 'Sign in' }]
    : BASE_NAV

  return (
    <nav
      className="no-print md:hidden fixed bottom-0 left-0 right-0 bg-surface-1/95 backdrop-blur-md border-t border-border flex z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {nav.map(({ id, icon, label }) => {
        const isActive = current === id
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex-1 flex flex-col items-center pt-2 pb-1.5 transition-all relative ${
              isActive ? 'text-accent' : 'text-text-muted'
            }`}
          >
            {/* Active top bar */}
            <span
              className={`absolute top-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-200 ${
                isActive ? 'w-8 bg-accent' : 'w-0 bg-transparent'
              }`}
            />
            <span className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-accent/10' : ''}`}>
              {icon}
            </span>
            <span className={`text-[10px] mt-0.5 font-medium ${isActive ? 'text-accent' : 'text-text-muted'}`}>
              {label}
            </span>
            {id === 'today' && overdueCnt > 0 && (
              <span className="absolute top-1.5 right-[calc(50%-16px)] bg-danger text-white text-[9px] rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 font-bold leading-none">
                {overdueCnt > 9 ? '9+' : overdueCnt}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}
