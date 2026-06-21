import { useState, type ComponentType } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { User } from '@supabase/supabase-js'
import type { Section, SubscriptionStatus } from './types'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { TrialBanner } from './components/shared/TrialBanner'
import { ToastContainer } from './components/shared/Toast'
import { OverviewMetrics } from './components/dashboard/OverviewMetrics'
import { ExamPlanner } from './components/exam/ExamPlanner'
import { SubjectTracker } from './components/subjects/SubjectTracker'
import { ChapterManagement } from './components/chapters/ChapterManagement'
import { TodaysPlan } from './components/tasks/TodaysPlan'
import { RevisionPlanner } from './components/revision/RevisionPlanner'
import { FocusMode } from './components/focus/FocusMode'
import { Goals } from './components/goals/Goals'
import { Analytics } from './components/analytics/Analytics'

interface DashboardProps {
  user: User
  subscriptionStatus: SubscriptionStatus
  daysLeft: number
  onSignOut: () => void
}

const SECTION_COMPONENTS: Record<Section, ComponentType> = {
  overview: OverviewMetrics,
  exam: ExamPlanner,
  subjects: SubjectTracker,
  chapters: ChapterManagement,
  tasks: TodaysPlan,
  revision: RevisionPlanner,
  focus: FocusMode,
  goals: Goals,
  analytics: Analytics,
}

export function Dashboard({ user, subscriptionStatus, daysLeft, onSignOut }: DashboardProps) {
  const [activeSection, setActiveSection] = useState<Section>('overview')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const SectionComponent = SECTION_COMPONENTS[activeSection]

  function handleSectionChange(section: Section) {
    setActiveSection(section)
    setMobileMenuOpen(false)
  }

  function handleUpgrade() {
    // Navigate to paywall — in this SaaS model we just open a new page
    // but since status is still 'trial', the app stays open
    window.open('mailto:?subject=StudyCC%20Upgrade%20-%20%E2%82%B9100%2Fmonth', '_blank')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      {/* Trial Banner */}
      {subscriptionStatus === 'trial' && (
        <TrialBanner daysLeft={daysLeft} onUpgrade={handleUpgrade} />
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <Header
            user={user}
            activeSection={activeSection}
            onSignOut={onSignOut}
            onMenuToggle={() => setMobileMenuOpen(true)}
          />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto pb-24 lg:pb-6">
            <div className="max-w-5xl mx-auto px-4 py-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Section title - mobile */}
                  <h2 className="lg:hidden text-lg font-bold text-slate-900 dark:text-white mb-5" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    {activeSection === 'overview' && 'Overview'}
                    {activeSection === 'exam' && 'Exam Planner'}
                    {activeSection === 'subjects' && 'Subjects'}
                    {activeSection === 'chapters' && 'Chapters'}
                    {activeSection === 'tasks' && "Today's Plan"}
                    {activeSection === 'revision' && 'Revision Planner'}
                    {activeSection === 'focus' && 'Focus Mode'}
                    {activeSection === 'goals' && 'Goals'}
                    {activeSection === 'analytics' && 'Analytics'}
                  </h2>

                  <SectionComponent />
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  )
}
