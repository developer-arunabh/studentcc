import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { SubscriptionStatus } from '../types'

export function useSubscription(user: User | null) {
  const [status, setStatus] = useState<SubscriptionStatus>('loading')
  const [daysLeft, setDaysLeft] = useState(0)

  useEffect(() => {
    if (!user) {
      setStatus('loading')
      return
    }

    async function fetchProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_status, trial_ends_at')
        .eq('id', user!.id)
        .single()

      if (error || !data) {
        // Profile might not exist yet (race condition on first sign-up)
        // Retry after a short delay
        setTimeout(fetchProfile, 2000)
        return
      }

      if (data.subscription_status === 'active') {
        setStatus('active')
        setDaysLeft(999)
        return
      }

      if (data.subscription_status === 'trial') {
        const trialEnds = new Date(data.trial_ends_at)
        const now = new Date()
        const msLeft = trialEnds.getTime() - now.getTime()
        const days = Math.ceil(msLeft / 86_400_000)

        if (days > 0) {
          setStatus('trial')
          setDaysLeft(days)
        } else {
          setStatus('expired')
          setDaysLeft(0)
        }
        return
      }

      setStatus('expired')
      setDaysLeft(0)
    }

    fetchProfile()
  }, [user?.id])

  return { status, daysLeft }
}
