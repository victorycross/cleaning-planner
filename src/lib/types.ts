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
  flagged?: boolean
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
  kitchen:  { pill: 'bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400', glow: 'border-orange-200 dark:border-orange-500/25', bar: '#f97316' },
  bathroom: { pill: 'bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400',            glow: 'border-sky-200 dark:border-sky-500/25',        bar: '#0ea5e9' },
  living:   { pill: 'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400', glow: 'border-violet-200 dark:border-violet-500/25',  bar: '#8b5cf6' },
  bedroom:  { pill: 'bg-pink-100 text-pink-600 dark:bg-pink-500/15 dark:text-pink-400',         glow: 'border-pink-200 dark:border-pink-500/25',      bar: '#ec4899' },
  laundry:  { pill: 'bg-teal-100 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400',         glow: 'border-teal-200 dark:border-teal-500/25',      bar: '#14b8a6' },
  outdoor:  { pill: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400', glow: 'border-emerald-200 dark:border-emerald-500/25', bar: '#10b981' },
}
