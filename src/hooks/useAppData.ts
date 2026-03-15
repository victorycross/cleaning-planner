import { useState, useCallback } from 'react'
import { v4 as uuid } from 'uuid'
import { format, subDays } from 'date-fns'
import { loadData, saveData } from '../lib/storage'
import { type AppData, type Task, type Room, type Person, type CustomLibraryTask, type CompletionEntry, PERSON_COLOURS } from '../lib/types'
import { TASK_LIBRARY } from '../lib/taskLibrary'

function useAppData() {
  const [data, setData] = useState<AppData>(loadData)

  const update = useCallback((next: AppData) => {
    setData(next)
    saveData(next)
  }, [])

  // Tasks
  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'lastCompleted'>) => {
    const next = { ...data, tasks: [...data.tasks, { ...task, id: uuid(), createdAt: new Date().toISOString(), lastCompleted: null }] }
    update(next)
  }, [data, update])

  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    update({ ...data, tasks: data.tasks.map(t => t.id === id ? { ...t, ...patch } : t) })
  }, [data, update])

  const deleteTask = useCallback((id: string) => {
    update({ ...data, tasks: data.tasks.filter(t => t.id !== id) })
  }, [data, update])

  const completeTask = useCallback((id: string) => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')

    // Update streak
    let { streakData } = data
    if (streakData.date !== today) {
      streakData = streakData.date === yesterday
        ? { date: today, count: streakData.count + 1 }
        : { date: today, count: 1 }
    }

    const logEntry: CompletionEntry = { date: today, taskId: id }
    update({
      ...data,
      tasks: data.tasks.map(t => t.id === id ? { ...t, lastCompleted: new Date().toISOString() } : t),
      completionLog: [...data.completionLog, logEntry],
      streakData,
    })
  }, [data, update])

  // Quick setup — add all library defaults
  const quickSetup = useCallback((name?: string) => {
    const newPeople = name?.trim()
      ? [...data.people, { id: uuid(), name: name.trim(), colour: PERSON_COLOURS[0] }]
      : data.people

    const newTasks = TASK_LIBRARY
      .filter(lib => !data.tasks.some(t => t.roomId === lib.roomId && t.title.toLowerCase() === lib.title.toLowerCase()))
      .map(lib => ({ title: lib.title, roomId: lib.roomId, frequency: lib.frequency, assignedTo: [], notes: lib.notes, id: uuid(), createdAt: new Date().toISOString(), lastCompleted: null }))

    update({ ...data, people: newPeople, tasks: [...data.tasks, ...newTasks], onboardingComplete: true })
  }, [data, update])

  const markOnboardingComplete = useCallback(() => {
    update({ ...data, onboardingComplete: true })
  }, [data, update])

  // Rooms
  const addRoom = useCallback((room: Omit<Room, 'id'>) => {
    update({ ...data, rooms: [...data.rooms, { ...room, id: uuid() }] })
  }, [data, update])

  const updateRoom = useCallback((id: string, patch: Partial<Room>) => {
    update({ ...data, rooms: data.rooms.map(r => r.id === id ? { ...r, ...patch } : r) })
  }, [data, update])

  const deleteRoom = useCallback((id: string) => {
    update({ ...data, rooms: data.rooms.filter(r => r.id !== id), tasks: data.tasks.filter(t => t.roomId !== id) })
  }, [data, update])

  // People
  const addPerson = useCallback((name: string) => {
    const colour = PERSON_COLOURS[data.people.length % PERSON_COLOURS.length]
    update({ ...data, people: [...data.people, { id: uuid(), name, colour }] })
  }, [data, update])

  const updatePerson = useCallback((id: string, patch: Partial<Person>) => {
    update({ ...data, people: data.people.map(p => p.id === id ? { ...p, ...patch } : p) })
  }, [data, update])

  const deletePerson = useCallback((id: string) => {
    update({
      ...data,
      people: data.people.filter(p => p.id !== id),
      tasks: data.tasks.map(t => ({ ...t, assignedTo: t.assignedTo.filter(pid => pid !== id) })),
    })
  }, [data, update])

  // Custom library tasks
  const addLibraryTask = useCallback((task: Omit<CustomLibraryTask, 'id'>) => {
    update({ ...data, libraryTasks: [...data.libraryTasks, { ...task, id: uuid() }] })
  }, [data, update])

  const deleteLibraryTask = useCallback((id: string) => {
    update({ ...data, libraryTasks: data.libraryTasks.filter(t => t.id !== id) })
  }, [data, update])

  return {
    data,
    addTask, updateTask, deleteTask, completeTask,
    quickSetup, markOnboardingComplete,
    addRoom, updateRoom, deleteRoom,
    addPerson, updatePerson, deletePerson,
    addLibraryTask, deleteLibraryTask,
  }
}

export default useAppData
