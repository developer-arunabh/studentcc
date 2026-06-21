import { useState, useEffect, useRef, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { AppState } from '../types'

const STORAGE_KEY = 'study-command-center-backup'

export function useCloudStorage(user: User | null) {
  const [cloudData, setCloudData] = useState<AppState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isSaving = useRef(false)

  // Load data from Supabase on user change
  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

    async function loadData() {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('study_data')
          .select('data')
          .eq('user_id', user!.id)
          .single()

        if (!error && data?.data && Object.keys(data.data).length > 0) {
          setCloudData(data.data as AppState)
        } else {
          // Attempt localStorage migration
          try {
            const local = localStorage.getItem(STORAGE_KEY)
            if (local) {
              const parsed = JSON.parse(local) as AppState
              setCloudData(parsed)
            }
          } catch {
            // ignore parse errors
          }
        }
      } catch {
        // Supabase not configured — fall back to localStorage
        try {
          const local = localStorage.getItem(STORAGE_KEY)
          if (local) setCloudData(JSON.parse(local) as AppState)
        } catch { /* ignore */ }
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user?.id])

  const save = useCallback(
    (state: AppState) => {
      // Always backup to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch { /* ignore quota errors */ }

      if (!user || isSaving.current) return

      // Debounce Supabase saves by 1 second
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(async () => {
        isSaving.current = true
        try {
          await supabase.from('study_data').upsert({
            user_id: user.id,
            data: state,
            updated_at: new Date().toISOString(),
          })
        } catch {
          // Silently fail — data is already in localStorage
        } finally {
          isSaving.current = false
        }
      }, 1000)
    },
    [user?.id]
  )

  return { cloudData, isLoading, save }
}
