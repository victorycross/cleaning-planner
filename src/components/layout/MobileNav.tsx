import { CheckSquare, LayoutGrid, Users, Calendar, BookOpen } from 'lucide-react'
import { type View } from './Sidebar'

interface Props {
  current: View
  onChange: (v: View) => void
  overdueCnt: number
}

const NAV: { id: View; icon: React.ReactNode; label: string }[] = [
  { id: 'today',    icon: <CheckSquare size={20} />, label: 'Today' },
  { id: 'schedule', icon: <Calendar size={20} />,    label: 'Schedule' },
  { id: 'rooms',    icon: <LayoutGrid size={20} />,  label: 'Rooms' },
  { id: 'people',   icon: <Users size={20} />,       label: 'People' },
  { id: 'library',  icon: <BookOpen size={20} />,    label: 'Library' },
]

export default function MobileNav({ current, onChange, overdueCnt }: Props) {
  return (
    <nav className="no-print md:hidden fixed bottom-0 left-0 right-0 bg-surface-1 border-t border-border flex z-50">
      {NAV.map(({ id, icon, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-xs transition-colors relative ${
            current === id ? 'text-accent' : 'text-text-muted'
          }`}
        >
          {icon}
          <span className="text-[10px]">{label}</span>
          {id === 'today' && overdueCnt > 0 && (
            <span className="absolute top-2 right-[calc(50%-14px)] bg-danger text-white text-[9px] rounded-full px-1 leading-none py-0.5 font-bold">
              {overdueCnt}
            </span>
          )}
        </button>
      ))}
    </nav>
  )
}
