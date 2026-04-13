import { useState } from 'react'
import { LogOut, Edit2, Check, X, CloudOff, Cloud, RefreshCw } from 'lucide-react'
import { type AppData } from '../lib/types'
import { supabaseEnabled } from '../lib/supabase'
import { signOut, updateDisplayName } from '../hooks/useAuth'
import { type User } from '@supabase/supabase-js'
import AuthModal from '../components/auth/AuthModal'
import { getCompletedThisWeek } from '../lib/scheduler'

interface Props {
  data: AppData
  user: User | null
  syncStatus: 'idle' | 'saving' | 'saved' | 'error'
  lastSynced: string | null
}

function Avatar({ name, size = 'lg' }: { name: string; size?: 'sm' | 'lg' }) {
  const initial = name.charAt(0).toUpperCase()
  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899']
  const color = colors[name.charCodeAt(0) % colors.length]
  const dim = size === 'lg' ? 'w-20 h-20 text-3xl' : 'w-8 h-8 text-sm'

  return (
    <div
      className={`${dim} rounded-full flex items-center justify-center font-bold text-white shrink-0`}
      style={{ backgroundColor: color }}
    >
      {initial}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-surface-1 border border-border rounded-2xl p-4 text-center">
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      <p className="text-xs text-text-muted mt-0.5">{label}</p>
    </div>
  )
}

export default function Profile({ data, user, syncStatus, lastSynced }: Props) {
  const [showAuth, setShowAuth] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [savingName, setSavingName] = useState(false)

  const displayName = user?.user_metadata?.display_name ?? user?.email?.split('@')[0] ?? 'You'
  const totalDone = data.completionLog.length
  const doneThisWeek = getCompletedThisWeek(data.completionLog)
  const streak = data.streakData.count

  const handleSaveName = async () => {
    if (!nameInput.trim()) return
    setSavingName(true)
    await updateDisplayName(nameInput.trim())
    setSavingName(false)
    setEditingName(false)
  }

  const handleSignOut = async () => {
    await signOut()
  }

  if (!supabaseEnabled) {
    return (
      <div className="p-4 md:p-8 max-w-lg" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}>
        <h1 className="text-xl font-bold text-text-primary mb-6">Profile</h1>
        <div className="bg-surface-1 border border-border rounded-2xl p-6 text-center">
          <CloudOff size={32} className="text-text-muted mx-auto mb-3" />
          <p className="font-semibold text-text-primary mb-1">Cloud sync not configured</p>
          <p className="text-sm text-text-muted">
            Add your Supabase credentials to enable sign-in and cross-device sync.
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-4 md:p-8 max-w-lg" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}>
        <h1 className="text-xl font-bold text-text-primary mb-6">Profile</h1>

        <div className="bg-surface-1 border border-border rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-full bg-surface-3 flex items-center justify-center text-2xl text-text-muted">
              👤
            </div>
            <div>
              <p className="font-semibold text-text-primary">Guest</p>
              <p className="text-xs text-text-muted mt-0.5">Data saved locally on this device</p>
            </div>
          </div>
          <button
            onClick={() => setShowAuth(true)}
            className="w-full py-2.5 bg-accent text-white font-semibold rounded-xl hover:bg-accent/90 transition-colors text-sm"
          >
            Sign in or create account
          </button>
          <p className="text-xs text-text-muted text-center mt-2">
            Sync your tasks across all your devices
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard label="tasks completed" value={totalDone} />
          <StatCard label="this week" value={doneThisWeek} />
          <StatCard label="day streak" value={streak >= 1 ? `🔥 ${streak}` : '—'} />
          <StatCard label="total tasks" value={data.tasks.length} />
        </div>

        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-lg" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}>
      <h1 className="text-xl font-bold text-text-primary mb-6">Profile</h1>

      {/* User card */}
      <div className="bg-surface-1 border border-border rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-4">
          <Avatar name={displayName} />
          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false) }}
                  className="flex-1 bg-surface-2 border border-border rounded-lg px-2.5 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent"
                />
                <button onClick={handleSaveName} disabled={savingName} className="text-accent hover:text-accent/80 p-1">
                  <Check size={16} />
                </button>
                <button onClick={() => setEditingName(false)} className="text-text-muted hover:text-text-primary p-1">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="font-bold text-text-primary truncate">{displayName}</p>
                <button
                  onClick={() => { setNameInput(displayName); setEditingName(true) }}
                  className="text-text-muted hover:text-text-primary transition-colors"
                >
                  <Edit2 size={13} />
                </button>
              </div>
            )}
            <p className="text-xs text-text-muted mt-0.5 truncate">{user.email}</p>
          </div>
        </div>

        {/* Sync status */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
          {syncStatus === 'saving' && (
            <>
              <RefreshCw size={13} className="text-text-muted animate-spin" />
              <span className="text-xs text-text-muted">Syncing…</span>
            </>
          )}
          {syncStatus === 'saved' && (
            <>
              <Cloud size={13} className="text-accent" />
              <span className="text-xs text-accent">Saved to cloud</span>
            </>
          )}
          {syncStatus === 'error' && (
            <>
              <CloudOff size={13} className="text-danger" />
              <span className="text-xs text-danger">Sync error — data saved locally</span>
            </>
          )}
          {syncStatus === 'idle' && lastSynced && (
            <>
              <Cloud size={13} className="text-text-muted" />
              <span className="text-xs text-text-muted">
                Last synced {new Date(lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </>
          )}
          {syncStatus === 'idle' && !lastSynced && (
            <>
              <Cloud size={13} className="text-text-muted" />
              <span className="text-xs text-text-muted">Cloud sync enabled</span>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatCard label="tasks completed" value={totalDone} />
        <StatCard label="this week" value={doneThisWeek} />
        <StatCard label="day streak" value={streak >= 1 ? `🔥 ${streak}` : '—'} />
        <StatCard label="total tasks" value={data.tasks.length} />
      </div>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-surface-2 border border-border text-text-secondary hover:text-danger hover:border-danger/30 rounded-xl text-sm font-medium transition-colors"
      >
        <LogOut size={15} />
        Sign out
      </button>
    </div>
  )
}
