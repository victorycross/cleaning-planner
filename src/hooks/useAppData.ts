import { useState, useCallback } from 'react'
import { v4 as uuid } from 'uuid'
import { loadData, saveData } from '../lib/storage'
import { type AppData, type Task, type Room, type Person, PERSON_COLOURS } from '../lib/types'

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
    const next = { ...data, tasks: data.tasks.map(t => t.id === id ? { ...t, ...patch } : t) }
    update(next)
  }, [data, update])

  const deleteTask = useCallback((id: string) => {
    const next = { ...data, tasks: data.tasks.filter(t => t.id !== id) }
    update(next)
  }, [data, update])

  const completeTask = useCallback((id: string) => {
    const next = { ...data, tasks: data.tasks.map(t => t.id === id ? { ...t, lastCompleted: new Date().toISOString() } : t) }
    update(next)
  }, [data, update])

  // Rooms
  const addRoom = useCallback((room: Omit<Room, 'id'>) => {
    const next = { ...data, rooms: [...data.rooms, { ...room, id: uuid() }] }
    update(next)
  }, [data, update])

  const updateRoom = useCallback((id: string, patch: Partial<Room>) => {
    const next = { ...data, rooms: data.rooms.map(r => r.id === id ? { ...r, ...patch } : r) }
    update(next)
  }, [data, update])

  const deleteRoom = useCallback((id: string) => {
    const next = {
      ...data,
      rooms: data.rooms.filter(r => r.id !== id),
      tasks: data.tasks.filter(t => t.roomId !== id),
    }
    update(next)
  }, [data, update])

  // People
  const addPerson = useCallback((name: string) => {
    const colour = PERSON_COLOURS[data.people.length % PERSON_COLOURS.length]
    const next = { ...data, people: [...data.people, { id: uuid(), name, colour }] }
    update(next)
  }, [data, update])

  const updatePerson = useCallback((id: string, patch: Partial<Person>) => {
    const next = { ...data, people: data.people.map(p => p.id === id ? { ...p, ...patch } : p) }
    update(next)
  }, [data, update])

  const deletePerson = useCallback((id: string) => {
    const next = {
      ...data,
      people: data.people.filter(p => p.id !== id),
      tasks: data.tasks.map(t => ({ ...t, assignedTo: t.assignedTo.filter(pid => pid !== id) })),
    }
    update(next)
  }, [data, update])

  return {
    data,
    addTask, updateTask, deleteTask, completeTask,
    addRoom, updateRoom, deleteRoom,
    addPerson, updatePerson, deletePerson,
  }
}

export default useAppData
