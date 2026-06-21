import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, CheckCircle2, AlertCircle, Calendar, Clock } from 'lucide-react'
import { useStudy } from '../../context/StudyContext'
import { todayStr, isOverdue, isToday, formatDate } from '../../utils/date'
import type { RevisionType } from '../../types'

const REVISION_LABELS: Record<RevisionType, { label: string; color: string; bg: string }> = {
  'revision-1': { label: 'Revision 1', color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  'revision-2': { label: 'Revision 2', color: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  'final': { label: 'Final Review', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
}

export function RevisionPlanner() {
  const { state, completeRevision } = useStudy()
  const { revisions } = state

  const today = todayStr()
  const pending = revisions.filter((r) => !r.completed)
  const overdue = pending.filter((r) => isOverdue(r.scheduledDate))
  const dueToday = pending.filter((r) => isToday(r.scheduledDate))
  const upcoming = pending
    .filter((r) => !isOverdue(r.scheduledDate) && !isToday(r.scheduledDate))
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
    .slice(0, 10)
  const done = revisions.filter((r) => r.completed).length

  function Section({
    title,
    items,
    urgent,
  }: {
    title: string
    items: typeof revisions
    urgent?: boolean
  }) {
    if (items.length === 0) return null
    return (
      <div>
        <h4 className={`text-sm font-semibold mb-2 flex items-center gap-2 ${
          urgent ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'
        }`}>
          {urgent ? <AlertCircle className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
          {title}
          <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${
            urgent
              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
          }`}>
            {items.length}
          </span>
        </h4>
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {items.map((r) => {
              const typeConfig = REVISION_LABELS[r.type]
              const overdueR = isOverdue(r.scheduledDate)
              const todayR = isToday(r.scheduledDate)
              return (
                <motion.div
                  key={r.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`flex items-center gap-3 bg-white dark:bg-slate-800 rounded-xl px-4 py-3 shadow-sm border transition-all ${
                    overdueR
                      ? 'border-red-200 dark:border-red-900/50'
                      : todayR
                      ? 'border-blue-200 dark:border-blue-900/50'
                      : 'border-slate-100 dark:border-slate-700'
                  }`}
                >
                  {/* Type badge */}
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${typeConfig.bg} ${typeConfig.color}`}>
                    {typeConfig.label}
                  </span>

                  {/* Chapter + subject */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{r.chapterName}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{r.subjectName}</p>
                  </div>

                  {/* Date */}
                  <div className={`flex items-center gap-1 text-xs flex-shrink-0 ${
                    overdueR ? 'text-red-600 dark:text-red-400 font-medium' : 'text-slate-400'
                  }`}>
                    <Clock className="w-3 h-3" />
                    {overdueR ? `Overdue · ${formatDate(r.scheduledDate)}` : formatDate(r.scheduledDate)}
                  </div>

                  {/* Done button */}
                  <button
                    onClick={() => completeRevision(r.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Done
                  </button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Overdue', value: overdue.length, color: overdue.length > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white', bg: overdue.length > 0 ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700' },
          { label: 'Due Today', value: dueToday.length, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700' },
          { label: 'Completed', value: done, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`rounded-2xl p-4 shadow-sm border ${bg} text-center`}>
            <p className={`text-2xl font-bold ${color}`} style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Overdue */}
      {overdue.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-2xl p-4 space-y-3"
        >
          <Section title="Overdue — Review these first!" items={overdue} urgent />
        </motion.div>
      )}

      {/* Due Today */}
      {dueToday.length > 0 && (
        <div className="space-y-2">
          <Section title="Due Today" items={dueToday} />
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="space-y-2">
          <Section title="Upcoming Revisions" items={upcoming} />
        </div>
      )}

      {/* Empty State */}
      {pending.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-14"
        >
          <RotateCcw className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">No pending revisions</h3>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            {done > 0
              ? `Great job! You've completed ${done} revision${done !== 1 ? 's' : ''}. Complete more chapters to schedule new ones.`
              : 'Complete chapters in the Chapters section to automatically schedule spaced repetition revisions.'}
          </p>
        </motion.div>
      )}
    </div>
  )
}
