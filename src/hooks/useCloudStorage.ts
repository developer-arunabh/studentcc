import { useState, useEffect, useRef, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { AppState } from '../types'

const STORAGE_KEY = 'study-command-center-backup'
const DEBOUNCE_MS = 1500

export function useCloudStorage(user: User | null) {
  const [cloudData, setCloudData] = useState<AppState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Load from Supabase on login ──────────────────────────────────────
  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    async function loadData() {
      try {
        const { data, error } = await supabase
          .from('study_data')
          .select('data')
          .eq('user_id', user!.id)
          .single()

        if (!error && data?.data && Object.keys(data.data as object).length > 0) {
          // Cloud data found — use it
          setCloudData(data.data as AppState)
          // Also sync to localStorage as backup
          try {
            localStorage.setItem(STORAGE_KEY + '_' + user!.id, JSON.stringify(data.data))
          } catch { /* ignore */ }
        } else {
          // No cloud data — try user-specific localStorage first, then generic
          const localKey = STORAGE_KEY + '_' + user!.id
          const genericKey = STORAGE_KEY
          const raw = localStorage.getItem(localKey) || localStorage.getItem(genericKey)
          if (raw) {
            try {
              setCloudData(JSON.parse(raw) as AppState)
            } catch { /* ignore */ }
          }
        }
      } catch (err) {
        console.error('[useCloudStorage] Failed to load from Supabase:', err)
        // Fall back to localStorage
        try {
          const raw = localStorage.getItem(STORAGE_KEY + '_' + user!.id)
            || localStorage.getItem(STORAGE_KEY)
          if (raw) setCloudData(JSON.parse(raw) as AppState)
        } catch { /* ignore */ }
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user?.id])

  // ── Save to Supabase (debounced) ─────────────────────────────────────
  const save = useCallback(
    (state: AppState) => {
      if (!user) return

      // Always save to localStorage immediately (per-user key)
      try {
        localStorage.setItem(STORAGE_KEY + '_' + user.id, JSON.stringify(state))
      } catch { /* ignore quota errors */ }

      // Debounce the Supabase write
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      debounceTimer.current = setTimeout(async () => {
        try {
          const { error } = await supabase
            .from('study_data')
            .upsert(
              {
                user_id: user.id,
                data: state,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'user_id' }
            )

          if (error) {
            console.error('[useCloudStorage] Save failed:', error.message)
          }
        } catch (err) {
          console.error('[useCloudStorage] Unexpected save error:', err)
        }
      }, DEBOUNCE_MS)
    },
    [user?.id]
  )

  return { cloudData, isLoading, save }
}
