import { createClient } from '@supabase/supabase-js'
import { type AppData } from './types'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabaseEnabled = Boolean(url && key)

export const supabase = supabaseEnabled ? createClient(url!, key!) : null

// ─── Cloud data helpers ───────────────────────────────────────────────────────

export async function loadUserData(userId: string): Promise<AppData | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('user_data')
    .select('data')
    .eq('user_id', userId)
    .single()
  if (error || !data) return null
  return data.data as AppData
}

export async function saveUserData(userId: string, appData: AppData): Promise<void> {
  if (!supabase) return
  await supabase
    .from('user_data')
    .upsert({ user_id: userId, data: appData, updated_at: new Date().toISOString() })
}

export async function getLastSynced(userId: string): Promise<string | null> {
  if (!supabase) return null
  const { data } = await supabase
    .from('user_data')
    .select('updated_at')
    .eq('user_id', userId)
    .single()
  return data?.updated_at ?? null
}
