import type { ComponentType } from 'react'
import { Flame, Clock, BookCheck, ListTodo, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react'
import { motion } from 'framer-motion'
import { useStudy } from '../../context/StudyContext'
import { todayStr, isOverdue } from '../../utils/date'
import { calcTodayHours, calcWeeklyHours } from '../../utils/calculations'

interface StatCardProps {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string | number
  sub?: string
  color: string
  delay?: number
}

function StatCard({ icon: Icon, label, value, sub, color, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow"
    >
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${color} mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        {value}
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sub}</p>}
    </motion.div>
  )
}

function InsightCard({ icon, text, type }: { icon: string; text: string; type: 'info' | 'warning' | 'success' }) {
  const styles = {
    info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border-blue-100 dark:border-blue-900/40',
    warning: 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 border-amber-100 dark:border-amber-900/40',
    success: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/40',
  }
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border text-sm ${styles[type]}`}>
      <span className="text-base flex-shrink-0">{icon}</span>
      <p>{text}</p>
    </div>
  )
}

export function OverviewMetrics() {
  const { state } = useStudy()
  const { subjects, chapters, tasks, revisions, studyLogs, streak, examSettings, focusSessions } = state

  const today = todayStr()
  const todayTasks = tasks.filter((t) => t.date === today)
  const pendingTasksCount = todayTasks.filter((t) => !t.completed).length
  const completedChapters = chapters.filter((c) => c.status === 'completed').length
  const todayHours = calcTodayHours(studyLogs)
  const weeklyHours = calcWeeklyHours(studyLogs)
  const todayFocusSessions = focusSessions.filter((s) => s.date === today)

  // Smart insights
  const insights: { icon: string; text: string; type: 'info' | 'warning' | 'success' }[] = []

  if (todayHours === 0) {
    insights.push({ icon: '📖', text: "You haven't studied yet today! Start with a 25-minute focus session.", type: 'info' })
  }

  const overdueRevisions = revisions.filter((r) => !r.completed && isOverdue(r.scheduledDate))
  if (overdueRevisions.length > 0) {
    insights.push({
      icon: '🔄',
      text: `${overdueRevisions.length} revision${overdueRevisions.length > 1 ? 's are' : ' is'} overdue! Review them before adding new chapters.`,
      type: 'warning',
    })
  }

  if (examSettings.examDate) {
    const daysLeft = Math.ceil((new Date(examSettings.examDate + 'T00:00:00').getTime() - new Date().setHours(0,0,0,0)) / 86400000)
    const remaining = chapters.filter((c) => c.status !== 'completed').length
    if (daysLeft > 0 && remaining > 0) {
      const needed = Math.ceil(remaining / daysLeft)
      if (needed > examSettings.dailyStudyHours) {
        insights.push({
          icon: '⚠️',
          text: `You need ${needed} chapters/day to finish before ${examSettings.examName || 'your exam'}. Consider increasing daily study time!`,
          type: 'warning',
        })
      }
    }
  }

  if (streak >= 7) {
    insights.push({ icon: '🔥', text: `${streak}-day streak! Incredible consistency — keep it up!`, type: 'success' })
  } else if (streak >= 3) {
    insights.push({ icon: '💪', text: `${streak}-day streak! You're building great study habits.`, type: 'success' })
  }

  if (pendingTasksCount === 0 && todayTasks.length > 0) {
    insights.push({ icon: '🎉', text: "All tasks done for today! Excellent work.", type: 'success' })
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Flame}
          label="Study Streak"
          value={streak > 0 ? `${streak} days` : 'Start today!'}
          sub={streak > 0 ? '🔥 Keep it going' : undefined}
          color="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
          delay={0}
        />
        <StatCard
          icon={Clock}
          label="Hours Today"
          value={todayHours > 0 ? `${todayHours.toFixed(1)}h` : '0h'}
          sub={`${weeklyHours.toFixed(1)}h this week`}
          color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
          delay={0.05}
        />
        <StatCard
          icon={BookCheck}
          label="Chapters Done"
          value={completedChapters}
          sub={`of ${chapters.length} total`}
          color="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
          delay={0.1}
        />
        <StatCard
          icon={ListTodo}
          label="Tasks Pending"
          value={pendingTasksCount}
          sub={`${todayTasks.filter(t => t.completed).length} done today`}
          color="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
          delay={0.15}
        />
      </div>

      {/* Progress Overview */}
      {subjects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700"
        >
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Subject Progress
          </h3>
          <div className="space-y-3">
            {subjects.map((sub) => {
              const pct = sub.totalChapters > 0 ? Math.round((sub.completedChapters / sub.totalChapters) * 100) : 0
              return (
                <div key={sub.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{sub.name}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {sub.completedChapters}/{sub.totalChapters} · {pct}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: sub.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Smart Insights */}
      {insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700"
        >
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Smart Insights
          </h3>
          <div className="space-y-2.5">
            {insights.map((insight, i) => (
              <InsightCard key={i} {...insight} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {subjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-10 shadow-sm border border-slate-100 dark:border-slate-700 text-center"
        >
          <div className="text-5xl mb-4">📚</div>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Welcome to Study Command Center!</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
            Start by adding your subjects, then set your exam date to get a personalized study plan.
          </p>
        </motion.div>
      )}
    </div>
  )
}
