import { type AppData, DEFAULT_ROOMS } from './types'

const KEY = 'cleaning-planner-v1'

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppData
      // migrate older stored data that lacks libraryTasks
      if (!parsed.libraryTasks) parsed.libraryTasks = []
      return parsed
    }
  } catch {
    // corrupt data — start fresh
  }
  return { rooms: DEFAULT_ROOMS, people: [], tasks: [], libraryTasks: [] }
}

export function saveData(data: AppData): void {
  localStorage.setItem(KEY, JSON.stringify(data))
}
