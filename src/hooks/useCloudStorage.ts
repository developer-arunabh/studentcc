import { useState, useEffect, useRef, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { AppState } from '../types'

const LS_KEY = (uid: string) => `scc_${uid}`
const DEBOUNCE_MS = 1500

export function useCloudStorage(user: User | null) {
  const [cloudData, setCloudData] = useState<AppState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

    async function load() {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('study_data')
          .select('data')
          .eq('user_id', user!.id)
          .maybeSingle()

        if (error) console.error('[Storage] Load error:', error.message)

        if (data?.data && Object.keys(data.data as object).length > 0) {
          console.log('[Storage] ✅ Loaded from Supabase:', data.data)
          setCloudData(data.data as AppState)
          try { localStorage.setItem(LS_KEY(user!.id), JSON.stringify(data.data)) } catch {}
        } else {
          // No Supabase data — try localStorage
          try {
            const raw = localStorage.getItem(LS_KEY(user!.id))
            if (raw) {
              console.log('[Storage] Using localStorage backup')
              setCloudData(JSON.parse(raw) as AppState)
            } else {
              console.log('[Storage] No existing data, starting fresh')
              setCloudData(null)
            }
          } catch {
            setCloudData(null)
          }
        }
      } catch (err) {
        console.error('[Storage] Unexpected error:', err)
        setCloudData(null)
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [user?.id])

  const save = useCallback((state: AppState) => {
    if (!user) return

    // Save to localStorage immediately
    try { localStorage.setItem(LS_KEY(user.id), JSON.stringify(state)) } catch {}

    // Debounce Supabase save
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(async () => {
      console.log('[Storage] Saving to Supabase...')
      const { error } = await supabase
        .from('study_data')
        .upsert(
          { user_id: user.id, data: state, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        )
      if (error) console.error('[Storage] ❌ Save failed:', error.message)
      else console.log('[Storage] ✅ Saved to Supabase')
    }, DEBOUNCE_MS)
  }, [user?.id])

  return { cloudData, isLoading, save }
}