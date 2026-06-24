import { useState, useEffect, useRef, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { AppState } from '../types'

const LS_KEY = (uid: string) => `scc_${uid}`
const DEBOUNCE_MS = 1000

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
      console.log('[Storage] Loading data for user:', user!.id)

      try {
        // 1. Try to get existing row
        const { data, error } = await supabase
          .from('study_data')
          .select('data')
          .eq('user_id', user!.id)
          .maybeSingle()  // won't error if row doesn't exist

        if (error) {
          console.error('[Storage] Load error:', error.message)
        }

        // --- REPLACED BLOCK START ---
        if (data?.data) {
          const parsed =
            typeof data.data === 'string'
              ? JSON.parse(data.data)
              : data.data

          console.log('[Storage] Loaded from Supabase:', parsed)

          setCloudData(parsed as AppState)

          try {
            localStorage.setItem(
              LS_KEY(user!.id),
              JSON.stringify(parsed)
            )
          } catch {}

          setIsLoading(false)
          return
        }
        // --- REPLACED BLOCK END ---

        // 2. No cloud data — ensure the row EXISTS (create it if not)
        console.log('[Storage] No cloud data found, creating row...')
        const { error: upsertErr } = await supabase
          .from('study_data')
          .upsert({ user_id: user!.id, data: {}, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })

        if (upsertErr) {
          console.error('[Storage] Could not create row:', upsertErr.message)
        } else {
          console.log('[Storage] ✅ Row created')
        }

        // 3. Fall back to localStorage
        try {
          const raw = localStorage.getItem(LS_KEY(user!.id))
          if (raw) {
            console.log('[Storage] Using localStorage backup')
            setCloudData(JSON.parse(raw) as AppState)
          }
        } catch {}

      } catch (err) {
        console.error('[Storage] Unexpected error:', err)
        try {
          const raw = localStorage.getItem(LS_KEY(user!.id))
          if (raw) setCloudData(JSON.parse(raw) as AppState)
        } catch {}
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [user?.id])

  const save = useCallback((state: AppState) => {
    console.log('[SAVE DATA]', state)
    if (!user) return

    // 1. Save to localStorage immediately
    try {
      localStorage.setItem(LS_KEY(user.id), JSON.stringify(state))
    } catch {}

    // 2. Debounce Supabase save
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(async () => {
      console.log('[Storage] Saving to Supabase...')
      try {
        const { error } = await supabase
          .from('study_data')
          .upsert(
            { user_id: user.id, data: state, updated_at: new Date().toISOString() },
            { onConflict: 'user_id' }
          )
        if (error) {
          console.error('[Storage] ❌ Save failed:', error.message)
        } else {
          console.log('[Storage] ✅ Saved to Supabase')
        }
      } catch (err) {
        console.error('[Storage] ❌ Unexpected save error:', err)
      }
    }, DEBOUNCE_MS)
  }, [user?.id])

  return { cloudData, isLoading, save }
}