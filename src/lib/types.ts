export type Frequency = 'daily' | 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'biannual' | 'yearly'

export interface Room {
  id: string
  name: string
  icon: string
}

export interface Person {
  id: string
  name: string
  colour: string
}

export interface Task {
  id: string
  title: string
  roomId: string
  assignedTo: string[]
  frequency: Frequency
  lastCompleted: string | null
  notes: string
  createdAt: string
}

export interface CustomLibraryTask {
  id: string
  title: string
  roomId: string
  frequency: Frequency
  notes: string
}

export interface CompletionEntry {
  date: string   // 'yyyy-MM-dd'
  taskId: string
}

export interface StreakData {
  date: string   // last completion day 'yyyy-MM-dd'
  count: number
}

export interface AppData {
  rooms: Room[]
  people: Person[]
  tasks: Task[]
  libraryTasks: CustomLibraryTask[]
  completionLog: CompletionEntry[]
  streakData: StreakData
  onboardingComplete: boolean
}

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  fortnightly: 'Fortnightly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  biannual: 'Every 6 months',
  yearly: 'Yearly',
}

export const FREQUENCY_DAYS: Record<Frequency, number> = {
  daily: 1,
  weekly: 7,
  fortnightly: 14,
  monthly: 30,
  quarterly: 91,
  biannual: 182,
  yearly: 365,
}

export const PERSON_COLOURS = [
  '#4ade80', '#60a5fa', '#f472b6', '#fb923c',
  '#a78bfa', '#34d399', '#fbbf24', '#f87171',
]

export const DEFAULT_ROOMS: Room[] = [
  { id: 'kitchen', name: 'Kitchen', icon: '🍳' },
  { id: 'bathroom', name: 'Bathroom', icon: '🚿' },
  { id: 'living', name: 'Living Room', icon: '🛋️' },
  { id: 'bedroom', name: 'Bedroom', icon: '🛏️' },
  { id: 'laundry', name: 'Laundry', icon: '🫧' },
  { id: 'outdoor', name: 'Outdoor', icon: '🌿' },
]

export const ROOM_ACCENTS: Record<string, { pill: string; glow: string; bar: string }> = {
  kitchen:  { pill: 'bg-orange-500/10 text-orange-400', glow: 'border-orange-500/20', bar: '#f97316' },
  bathroom: { pill: 'bg-blue-500/10 text-blue-400',    glow: 'border-blue-500/20',   bar: '#3b82f6' },
  living:   { pill: 'bg-violet-500/10 text-violet-400', glow: 'border-violet-500/20', bar: '#8b5cf6' },
  bedroom:  { pill: 'bg-indigo-500/10 text-indigo-400', glow: 'border-indigo-500/20', bar: '#6366f1' },
  laundry:  { pill: 'bg-teal-500/10 text-teal-400',    glow: 'border-teal-500/20',   bar: '#14b8a6' },
  outdoor:  { pill: 'bg-green-500/10 text-green-400',  glow: 'border-green-500/20',  bar: '#22c55e' },
}
