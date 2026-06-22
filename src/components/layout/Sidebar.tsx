import type { ComponentType } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Calendar, BookOpen, BookMarked, CheckSquare,
  RotateCcw, Timer, Target, BarChart3, X, BookOpenCheck,
} from 'lucide-react'
import type { Section } from '../../types'
import './Sidebar.css'

const NAV_ITEMS: { id: Section; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'exam', label: 'Exam Planner', icon: Calendar },
  { id: 'subjects', label: 'Subjects', icon: BookOpen },
  { id: 'chapters', label: 'Chapters', icon: BookMarked },
  { id: 'tasks', label: "Today's Plan", icon: CheckSquare },
  { id: 'revision', label: 'Revision', icon: RotateCcw },
  { id: 'focus', label: 'Focus Mode', icon: Timer },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
]

// Bottom nav items (mobile) — limit to 5 most important
const MOBILE_NAV: Section[] = ['overview', 'tasks', 'chapters', 'focus', 'revision']

interface SidebarProps {
  activeSection: Section
  onSectionChange: (s: Section) => void
  mobileOpen: boolean
  onMobileClose: () => void
}

function NavItem({
  item,
  isActive,
  onClick,
  compact = false,
}: {
  item: typeof NAV_ITEMS[number]
  isActive: boolean
  onClick: () => void
  compact?: boolean
}) {
  const Icon = item.icon
  return (
    <button
      onClick={onClick}
      className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
  isActive
    ? 'sidebar-active'
    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
} ${compact ? 'justify-center px-2' : ''}`}
    >
      <Icon className={`flex-shrink-0 ${compact ? 'w-5 h-5' : 'w-4 h-4'}`} />
      {!compact && <span>{item.label}</span>}
      {isActive && !compact && (
  <>
    <motion.div
      layoutId="active-sidebar"
      className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 -z-10"
    />

    <div className="absolute inset-0 rounded-xl pointer-events-none glow-overlay" />
  </>
)}
    </button>
  )
}

export function Sidebar({ activeSection, onSectionChange, mobileOpen, onMobileClose }: SidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 bg-slate-900 border-r border-slate-700/50 h-screen sticky top-0 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 h-14 border-b border-slate-700/50 flex-shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-600/30">
            <BookOpenCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-white leading-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Study Command
            </p>
            <p className="text-xs text-slate-500 leading-tight">Center</p>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              isActive={activeSection === item.id}
              onClick={() => onSectionChange(item.id)}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-700/50">
          <p className="text-xs text-slate-600 text-center">Study Command Center v1.0</p>
        </div>
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-slate-900 z-50 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between px-4 h-14 border-b border-slate-700/50">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                    <BookOpenCheck className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm font-bold text-white" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    Study Command Center
                  </span>
                </div>
                <button
                  onClick={onMobileClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                {NAV_ITEMS.map((item) => (
                  <NavItem
                    key={item.id}
                    item={item}
                    isActive={activeSection === item.id}
                    onClick={() => { onSectionChange(item.id); onMobileClose() }}
                  />
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Tab Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 z-30 flex items-center justify-around px-1 h-16 safe-area-pb">
        {MOBILE_NAV.map((id) => {
          const item = NAV_ITEMS.find((n) => n.id === id)!
          const Icon = item.icon
          const isActive = activeSection === id
          return (
            <button
              key={id}
              onClick={() => onSectionChange(id)}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
                isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label.split(' ')[0]}</span>
            </button>
          )
        })}
      </nav>
    </>
  )
}
