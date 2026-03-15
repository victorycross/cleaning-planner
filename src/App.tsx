import { useState, useEffect } from 'react'
import Sidebar, { type View } from './components/layout/Sidebar'
import MobileNav from './components/layout/MobileNav'
import Today from './views/Today'
import Schedule from './views/Schedule'
import Rooms from './views/Rooms'
import People from './views/People'
import Library from './views/Library'
import Print from './views/Print'
import useAppData from './hooks/useAppData'
import { getDueStatus } from './lib/scheduler'
import { type AppData } from './lib/types'

const THEME_KEY = 'sparkle-theme'

export default function App() {
  const [view, setView] = useState<View>('today')
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    (localStorage.getItem(THEME_KEY) as 'light' | 'dark') ?? 'light'
  )

  const {
    data, addTask, deleteTask, completeTask,
    quickSetup, markOnboardingComplete,
    addRoom, deleteRoom,
    addPerson, deletePerson,
    addLibraryTask, deleteLibraryTask,
  } = useAppData()

  // Apply theme class to <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  const overdueCnt = data.tasks.filter(t => getDueStatus(t) === 'overdue').length

  const handleRestore = (restored: AppData) => {
    // Force a page reload to pick up restored data cleanly
    window.location.reload()
    void restored
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar current={view} onChange={setView} overdueCnt={overdueCnt} theme={theme} onToggleTheme={toggleTheme} />

      <main className="flex-1 overflow-auto">
        {view === 'today' && (
          <Today
            data={data}
            onComplete={completeTask}
            onDelete={deleteTask}
            onAdd={addTask}
            onQuickSetup={quickSetup}
            onSkipOnboarding={markOnboardingComplete}
          />
        )}
        {view === 'schedule' && (
          <Schedule data={data} onComplete={completeTask} onDelete={deleteTask} onAdd={addTask} />
        )}
        {view === 'rooms' && (
          <Rooms data={data} onComplete={completeTask} onDeleteTask={deleteTask} onAddTask={addTask}
            onAddRoom={addRoom} onDeleteRoom={deleteRoom} />
        )}
        {view === 'people' && (
          <People data={data} onComplete={completeTask} onDeleteTask={deleteTask}
            onAddPerson={addPerson} onDeletePerson={deletePerson} />
        )}
        {view === 'library' && (
          <Library data={data} onAddTask={addTask}
            onAddLibraryTask={addLibraryTask} onDeleteLibraryTask={deleteLibraryTask} />
        )}
        {view === 'print' && (
          <Print data={data} onRestore={handleRestore} />
        )}
      </main>

      <MobileNav current={view} onChange={setView} overdueCnt={overdueCnt} />
    </div>
  )
}
