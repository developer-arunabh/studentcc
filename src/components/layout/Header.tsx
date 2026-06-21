import { Sun, Moon, LogOut, Menu, BookOpen } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { useClock } from '../../hooks/useClock'
import { useStudy } from '../../context/StudyContext'
import type { Section } from '../../types'

const SECTION_LABELS: Record<Section, string> = {
  overview: 'Overview',
  exam: 'Exam Planner',
  subjects: 'Subjects',
  chapters: 'Chapters',
  tasks: "Today's Plan",
  revision: 'Revision Planner',
  focus: 'Focus Mode',
  goals: 'Goals',
  analytics: 'Analytics',
}

interface HeaderProps {
  user: User
  activeSection: Section
  onSignOut: () => void
  onMenuToggle: () => void
}

export function Header({ user, activeSection, onSignOut, onMenuToggle }: HeaderProps) {
  const { formatted, date } = useClock()
  const { state, toggleTheme } = useStudy()
  const isDark = state.theme === 'dark'

  const initials = (user.user_metadata?.full_name as string | undefined)
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || user.email?.slice(0, 2).toUpperCase() || 'U'

  const displayName = (user.user_metadata?.full_name as string | undefined) || user.email?.split('@')[0] || 'Student'

  return (
    <header className="h-14 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-4 gap-3 sticky top-0 z-30">
      {/* Mobile menu button */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Logo (mobile only) */}
      <div className="lg:hidden flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-blue-600" />
        <span className="font-bold text-slate-900 dark:text-white text-sm" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Study CC
        </span>
      </div>

      {/* Section title (desktop) */}
      <h2 className="hidden lg:block font-semibold text-slate-900 dark:text-white text-base">
        {SECTION_LABELS[activeSection]}
      </h2>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Clock */}
      <div className="hidden sm:flex flex-col items-end">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 tabular-nums">{formatted}</span>
        <span className="text-xs text-slate-400">{date}</span>
      </div>

      {/* Streak */}
      {state.streak > 0 && (
        <div className="hidden sm:flex items-center gap-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-full text-xs font-semibold">
          🔥 {state.streak}
        </div>
      )}

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      {/* User avatar */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {initials}
        </div>
        <span className="hidden md:block text-sm text-slate-700 dark:text-slate-300 max-w-24 truncate">
          {displayName}
        </span>
      </div>

      {/* Sign out */}
      <button
        onClick={onSignOut}
        className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        title="Sign out"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </header>
  )
}
