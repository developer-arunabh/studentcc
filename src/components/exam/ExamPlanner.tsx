import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Calendar, BookOpen, Zap, AlertTriangle, Save, Target } from 'lucide-react'
import { useStudy } from '../../context/StudyContext'
import { daysUntil } from '../../utils/date'
import { calcChaptersPerDay, getRiskLevel, RISK_CONFIG } from '../../utils/calculations'

export function ExamPlanner() {
  const { state, updateExamSettings } = useStudy()
  const { examSettings, chapters, subjects } = state

  const [form, setForm] = useState({
    examName: examSettings.examName,
    examDate: examSettings.examDate,
    dailyStudyHours: examSettings.dailyStudyHours,
    totalSubjects: examSettings.totalSubjects,
    totalChapters: examSettings.totalChapters,
  })
  const [saved, setSaved] = useState(false)

  const daysLeft = form.examDate ? daysUntil(form.examDate) : null
  const remainingChapters = chapters.filter((c) => c.status !== 'completed').length
  const chaptersPerDay = daysLeft && daysLeft > 0 ? calcChaptersPerDay(remainingChapters, daysLeft) : 0
  const risk = chaptersPerDay > 0 ? getRiskLevel(chaptersPerDay, form.dailyStudyHours) : 'safe'
  const riskConfig = RISK_CONFIG[risk]

  function handleSave(e: FormEvent) {
    e.preventDefault()
    updateExamSettings(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700"
      >
        <h3 className="font-semibold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          Exam Details
        </h3>

        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Exam Name
            </label>
            <input
              type="text"
              value={form.examName}
              onChange={(e) => setForm({ ...form, examName: e.target.value })}
              placeholder="e.g., JEE Main 2025, NEET, UPSC CSE"
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Exam Date
            </label>
            <input
              type="date"
              value={form.examDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setForm({ ...form, examDate: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Daily Study Hours Target
            </label>
            <input
              type="number"
              value={form.dailyStudyHours}
              onChange={(e) => setForm({ ...form, dailyStudyHours: +e.target.value })}
              min={1}
              max={20}
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <button
            type="submit"
            className="sm:col-span-2 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-all shadow-sm"
          >
            <Save className="w-4 h-4" />
            {saved ? '✓ Saved!' : 'Save Exam Plan'}
          </button>
        </form>
      </motion.div>

      {/* Metrics */}
      {examSettings.examDate && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Calendar,
              label: 'Days Until Exam',
              value: daysLeft !== null && daysLeft >= 0 ? `${daysLeft}` : 'Passed',
              sub: examSettings.examName || 'Your exam',
              color: daysLeft !== null && daysLeft < 30 ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
            },
            {
              icon: BookOpen,
              label: 'Chapters Remaining',
              value: remainingChapters,
              sub: `${chapters.filter(c => c.status === 'completed').length} completed`,
              color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
            },
            {
              icon: Target,
              label: 'Chapters/Day Needed',
              value: chaptersPerDay > 0 ? chaptersPerDay : '—',
              sub: `${form.dailyStudyHours}h daily target`,
              color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600',
            },
            {
              icon: Zap,
              label: 'Risk Level',
              value: riskConfig.label,
              sub: chaptersPerDay > 0 ? `${chaptersPerDay} chapters/day` : 'All done!',
              color: `${riskConfig.bg} ${riskConfig.color}`,
            },
          ].map(({ icon: Icon, label, value, sub, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700"
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${color} mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {value}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sub}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Warning banner */}
      {chaptersPerDay > examSettings.dailyStudyHours && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-2xl p-4"
        >
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800 dark:text-red-300 text-sm">Behind schedule!</p>
            <p className="text-red-700 dark:text-red-400 text-sm mt-0.5">
              At your current pace you need {chaptersPerDay} chapters/day — more than your {form.dailyStudyHours}h
              daily target allows. Consider increasing daily study time or reducing scope.
            </p>
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {!examSettings.examDate && (
        <div className="text-center py-12 text-slate-400 dark:text-slate-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Set your exam date above to see your study forecast</p>
        </div>
      )}
    </div>
  )
}
