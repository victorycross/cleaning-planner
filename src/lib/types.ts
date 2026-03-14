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

export interface AppData {
  rooms: Room[]
  people: Person[]
  tasks: Task[]
  libraryTasks: CustomLibraryTask[]
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
