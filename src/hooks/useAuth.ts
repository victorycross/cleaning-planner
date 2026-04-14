import { useState, useEffect } from 'react'
import { type User } from '@supabase/supabase-js'
import { supabase, supabaseEnabled } from '../lib/supabase'

export interface AuthState {
  user: User | null
  loading: boolean
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: supabaseEnabled,
  })

  useEffect(() => {
    if (!supabase) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ user: null, loading: false })
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({ user: session?.user ?? null, loading: false })
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ user: session?.user ?? null, loading: false })
    })

    return () => subscription.unsubscribe()
  }, [])

  return state
}

export async function signIn(email: string, password: string) {
  if (!supabase) throw new Error('Auth not configured')
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

export async function signUp(email: string, password: string, displayName?: string) {
  if (!supabase) throw new Error('Auth not configured')
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName?.trim() || email.split('@')[0] } },
  })
  if (error) throw error
}

export async function signOut() {
  if (!supabase) return
  await supabase.auth.signOut()
}

export async function updateDisplayName(name: string) {
  if (!supabase) return
  await supabase.auth.updateUser({ data: { display_name: name } })
}
