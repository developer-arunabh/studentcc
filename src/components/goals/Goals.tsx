import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Target, Calendar, TrendingUp, Pencil } from 'lucide-react'
import { useStudy } from '../../context/StudyContext'
import { formatDate, daysUntil } from '../../utils/date'

export function Goals() {
  const { state, addGoal, updateGoalProgress, deleteGoal } = useStudy()
  const { goals } = state

  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState(0)
  const [form, setForm] = useState({
    title: '',
    deadline: '',
    totalWork: 100,
    completedWork: 0,
  })

  function handleAdd() {
    if (!form.title.trim() || !form.deadline) return
    addGoal({ ...form })
    setForm({ title: '', deadline: '', totalWork: 100, completedWork: 0 })
    setShowAdd(false)
  }

  function startEdit(id: string, current: number) {
    setEditingId(id)
    setEditValue(current)
  }

  function saveEdit(id: string, total: number) {
    updateGoalProgress(id, Math.min(editValue, total))
    setEditingId(null)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {goals.length} goal{goals.length !== 1 ? 's' : ''} · {goals.filter(g => g.progress >= 100).length} completed
        </p>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Goal
        </button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-600 space-y-4">
              <h4 className="font-semibold text-slate-900 dark:text-white">New Goal</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Goal Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g., Complete Physics syllabus"
                    autoFocus
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Deadline</label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Total Work Units</label>
                  <input
                    type="number"
                    value={form.totalWork}
                    onChange={(e) => setForm({ ...form, totalWork: Math.max(1, +e.target.value) })}
                    min={1}
                    placeholder="e.g., 30 (chapters)"
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Completed So Far</label>
                  <input
                    type="number"
                    value={form.completedWork}
                    onChange={(e) => setForm({ ...form, completedWork: Math.max(0, +e.target.value) })}
                    min={0}
                    max={form.totalWork}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div className="sm:col-span-2 flex gap-2">
                  <button
                    onClick={handleAdd}
                    disabled={!form.title.trim() || !form.deadline}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-all"
                  >
                    Add Goal
                  </button>
                  <button
                    onClick={() => setShowAdd(false)}
                    className="px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goal Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {goals.map((goal) => {
            const days = daysUntil(goal.deadline)
            const isOverdue = days < 0
            const isDone = goal.progress >= 100
            const barColor = isDone ? '#059669' : isOverdue ? '#DC2626' : '#2563EB'

            return (
              <motion.div
                key={goal.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className={`bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border transition-all hover:shadow-md ${
                  isDone
                    ? 'border-emerald-100 dark:border-emerald-900/30'
                    : 'border-slate-100 dark:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isDone ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                    }`}>
                      <Target className={`w-4 h-4 ${isDone ? 'text-emerald-600' : 'text-blue-600'}`} />
                    </div>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm leading-tight">{goal.title}</h4>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!isDone && (
                      <button
                        onClick={() => startEdit(goal.id, goal.completedWork)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Inline edit */}
                {editingId === goal.id && (
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(Math.min(goal.totalWork, Math.max(0, +e.target.value)))}
                      min={0}
                      max={goal.totalWork}
                      autoFocus
                      className="flex-1 px-3 py-1.5 border border-blue-300 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-400">of {goal.totalWork}</span>
                    <button
                      onClick={() => saveEdit(goal.id, goal.totalWork)}
                      className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Progress */}
                <div className="space-y-1.5 mb-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      {goal.completedWork} / {goal.totalWork} units
                    </span>
                    <span className="font-bold" style={{ color: barColor }}>
                      {goal.progress}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(goal.progress, 100)}%` }}
                      transition={{ duration: 0.6 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: barColor }}
                    />
                  </div>
                </div>

                {/* Deadline */}
                <div className="flex items-center gap-1.5 text-xs">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span className={isDone ? 'text-emerald-600 dark:text-emerald-400 font-medium' : isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-slate-400'}>
                    {isDone ? '✅ Goal achieved!' : isOverdue ? `Overdue by ${Math.abs(days)} days` : `${days} days left · ${formatDate(goal.deadline)}`}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {goals.length === 0 && !showAdd && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-14"
        >
          <TrendingUp className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">No goals yet</h3>
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-4">Set milestones to keep yourself motivated</p>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            Add your first goal
          </button>
        </motion.div>
      )}
    </div>
  )
}
