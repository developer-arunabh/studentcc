import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { BookOpen } from 'lucide-react'
import { useAuth } from './hooks/useAuth'
import { useSubscription } from './hooks/useSubscription'
import { StudyProvider, useStudy } from './context/StudyContext'
import { AuthPage } from './pages/AuthPage'
import { PaywallPage } from './pages/PaywallPage'
import { Dashboard } from './Dashboard'

// Loading Screen
function LoadingScreen({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/40"
      >
        <BookOpen className="w-7 h-7 text-white" />
      </motion.div>
      <p className="text-slate-400 text-sm">{message}</p>
    </div>
  )
}

// Skeleton loader for dashboard content
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Sidebar skeleton */}
      <div className="hidden lg:flex w-56 bg-slate-900 flex-col p-4 gap-2">
        <div className="h-9 w-36 bg-slate-800 rounded-xl mb-4" />
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-9 bg-slate-800 rounded-xl" style={{ opacity: 1 - i * 0.08 }} />
        ))}
      </div>
      {/* Content skeleton */}
      <div className="flex-1 flex flex-col">
        <div className="h-14 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700" />
        <div className="flex-1 p-6 space-y-4 max-w-5xl mx-auto w-full">
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 animate-pulse" />
            ))}
          </div>
          <div className="h-48 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 animate-pulse" />
          <div className="h-32 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 animate-pulse" />
        </div>
      </div>
    </div>
  )
}

// Inner app — uses context
function AppInner() {
  const { user, loading: authLoading, signOut } = useAuth()
  const { status, daysLeft } = useSubscription(user)
  const { state, isLoading: dataLoading } = useStudy()

  // Apply theme class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark')
  }, [state.theme])

  // 1. Auth loading
  if (authLoading) return <LoadingScreen message="Checking authentication..." />

  // 2. Not authenticated
  if (!user) return <AuthPage />

  // 3. Subscription loading
  if (status === 'loading') return <LoadingScreen message="Loading your account..." />

  // 4. Expired subscription
  if (status === 'expired') return <PaywallPage />

  // 5. Data loading (cloud sync)
  if (dataLoading) return <DashboardSkeleton />

  // 6. Dashboard
  return (
    <Dashboard
      user={user}
      subscriptionStatus={status}
      daysLeft={daysLeft}
      onSignOut={signOut}
    />
  )
}

// Root — provides context
export default function App() {
  return (
    <StudyProvider>
      <AppInner />
    </StudyProvider>
  )
}
