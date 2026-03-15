import { type AppData, DEFAULT_ROOMS } from './types'

const KEY = 'cleaning-planner-v1'

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppData
      // migrations for older stored data
      if (!parsed.libraryTasks) parsed.libraryTasks = []
      if (!parsed.completionLog) parsed.completionLog = []
      if (!parsed.streakData) parsed.streakData = { date: '', count: 0 }
      if (parsed.onboardingComplete === undefined) parsed.onboardingComplete = parsed.tasks.length > 0
      return parsed
    }
  } catch {
    // corrupt data — start fresh
  }
  return {
    rooms: DEFAULT_ROOMS,
    people: [],
    tasks: [],
    libraryTasks: [],
    completionLog: [],
    streakData: { date: '', count: 0 },
    onboardingComplete: false,
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(KEY, JSON.stringify(data))
}
