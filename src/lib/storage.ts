import { type AppData, DEFAULT_ROOMS } from './types'

const KEY = 'cleaning-planner-v1'

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as AppData
  } catch {
    // corrupt data — start fresh
  }
  return { rooms: DEFAULT_ROOMS, people: [], tasks: [] }
}

export function saveData(data: AppData): void {
  localStorage.setItem(KEY, JSON.stringify(data))
}
