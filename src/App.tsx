import { useState, useEffect, useRef, useCallback } from 'react'
import Sidebar, { type View } from './components/layout/Sidebar'
import MobileNav from './components/layout/MobileNav'
import Today from './views/Today'
import Schedule from './views/Schedule'
import Rooms from './views/Rooms'
import People from './views/People'
import Library from './views/Library'
import Print from './views/Print'
import Profile from './views/Profile'
import useAppData from './hooks/useAppData'
import { useAuth } from './hooks/useAuth'
import { loadUserData, saveUserData, getLastSynced } from './lib/supabase'
import { getDueStatus } from './lib/scheduler'
import { type AppData } from './lib/types'

const THEME_KEY = 'sparkle-theme'

export default function App() {
  const [view, setView] = useState<View>('today')
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  const {
    data, addTask, updateTask, flagTask, deleteTask, completeTask,
    quickSetup, markOnboardingComplete,
    addRoom, deleteRoom,
    addPerson, deletePerson,
    addLibraryTask, deleteLibraryTask,
    replaceAllData,
  } = useAppData()

  const { user, loading: authLoading } = useAuth()

  // ─── Cloud sync state ──────────────────────────────────────────────────────
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [lastSynced, setLastSynced] = useState<string | null>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevUserId = useRef<string | null>(null)
  const initialLoad = useRef(false)

  // On sign-in: load cloud data
  useEffect(() => {
    if (authLoading) return
    const uid = user?.id ?? null

    if (uid && uid !== prevUserId.current) {
      // New sign-in — load from cloud
      initialLoad.current = true
      prevUserId.current = uid
      loadUserData(uid).then(cloudData => {
        if (cloudData) {
          replaceAllData(cloudData)
        } else {
          // No cloud data yet — upload current local data
          saveUserData(uid, data)
        }
        getLastSynced(uid).then(ts => setLastSynced(ts))
        setSyncStatus('idle')
        initialLoad.current = false
      })
    } else if (!uid) {
      prevUserId.current = null
    }
  }, [user, authLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced save on data change (only when signed in)
  const syncData = useCallback((appData: AppData, uid: string) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    setSyncStatus('saving')
    saveTimer.current = setTimeout(async () => {
      try {
        await saveUserData(uid, appData)
        setLastSynced(new Date().toISOString())
        setSyncStatus('saved')
        setTimeout(() => setSyncStatus('idle'), 2500)
      } catch {
        setSyncStatus('error')
      }
    }, 1500)
  }, [])

  useEffect(() => {
    if (!user || initialLoad.current || authLoading) return
    syncData(data, user.id)
  }, [data, user, authLoading, syncData])

  // ─── Theme ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  const overdueCnt = data.tasks.filter(t => getDueStatus(t) === 'overdue').length

  const handleRestore = (restored: AppData) => {
    replaceAllData(restored)
    setView('today')
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar
        current={view}
        onChange={setView}
        overdueCnt={overdueCnt}
        theme={theme}
        onToggleTheme={toggleTheme}
        user={user}
      />

      <main className="flex-1 overflow-auto">
        {view === 'today' && (
          <Today
            data={data}
            onComplete={completeTask}
            onDelete={deleteTask}
            onAdd={addTask}
            onEdit={updateTask}
            onFlag={flagTask}
            onQuickSetup={quickSetup}
            onSkipOnboarding={markOnboardingComplete}
          />
        )}
        {view === 'schedule' && (
          <Schedule data={data} onComplete={completeTask} onDelete={deleteTask} onAdd={addTask}
            onEdit={updateTask} onFlag={flagTask} />
        )}
        {view === 'rooms' && (
          <Rooms data={data} onComplete={completeTask} onDeleteTask={deleteTask} onAddTask={addTask}
            onAddRoom={addRoom} onDeleteRoom={deleteRoom} onEditTask={updateTask} onFlagTask={flagTask} />
        )}
        {view === 'people' && (
          <People data={data} onComplete={completeTask} onDeleteTask={deleteTask}
            onAddPerson={addPerson} onDeletePerson={deletePerson} onEditTask={updateTask} onFlagTask={flagTask} />
        )}
        {view === 'library' && (
          <Library data={data} onAddTask={addTask}
            onAddLibraryTask={addLibraryTask} onDeleteLibraryTask={deleteLibraryTask} />
        )}
        {view === 'print' && (
          <Print data={data} onRestore={handleRestore} />
        )}
        {view === 'profile' && (
          <Profile
            data={data}
            user={user}
            syncStatus={syncStatus}
            lastSynced={lastSynced}
          />
        )}
      </main>

      <MobileNav current={view} onChange={setView} overdueCnt={overdueCnt} user={user} />
    </div>
  )
}
