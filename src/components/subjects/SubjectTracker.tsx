import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, BookOpen, X, Check } from 'lucide-react'
import { useStudy } from '../../context/StudyContext'
import type { Priority, Subject } from '../../types'

const COLORS = [
  '#2563EB', '#7C3AED', '#DB2777', '#DC2626', '#D97706',
  '#059669', '#0891B2', '#4F46E5', '#EA580C', '#BE185D',
]

const PRIORITY_STYLES: Record<Priority, string> = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
}

const PRIORITY_LABEL: Record<Priority, string> = {
  high: '🔴 High',
  medium: '🟡 Medium',
  low: '🟢 Low',
}

interface SubjectFormData {
  name: string
  totalChapters: number
  priority: Priority
  color: string
}

const defaultForm: SubjectFormData = {
  name: '',
  totalChapters: 10,
  priority: 'medium',
  color: COLORS[0],
}

interface SubjectFormProps {
  initial?: SubjectFormData
  onSave: (data: SubjectFormData) => void
  onCancel: () => void
  title: string
}

function SubjectForm({ initial = defaultForm, onSave, onCancel, title }: SubjectFormProps) {
  const [form, setForm] = useState<SubjectFormData>(initial)

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-600"
    >
      <h4 className="font-semibold text-slate-900 dark:text-white mb-4">{title}</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g., Physics, Mathematics, History"
            autoFocus
            className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Total Chapters</label>
          <input
            type="number"
            value={form.totalChapters}
            onChange={(e) => setForm({ ...form, totalChapters: Math.max(1, +e.target.value) })}
            min={1}
            className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
            className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="high">🔴 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Color</label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setForm({ ...form, color: c })}
                className="w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center"
                style={{
                  backgroundColor: c,
                  borderColor: form.color === c ? c : 'transparent',
                  boxShadow: form.color === c ? `0 0 0 3px ${c}40` : undefined,
                }}
              >
                {form.color === c && <Check className="w-3.5 h-3.5 text-white" />}
              </button>
            ))}
          </div>
        </div>

        <div className="sm:col-span-2 flex gap-2">
          <button
            onClick={() => { if (form.name.trim()) onSave(form) }}
            disabled={!form.name.trim()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-all text-sm"
          >
            Save Subject
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  )
}

interface SubjectCardProps {
  subject: Subject
  onEdit: () => void
  onDelete: () => void
}

function SubjectCard({ subject, onEdit, onDelete }: SubjectCardProps) {
  const pct = subject.totalChapters > 0
    ? Math.round((subject.completedChapters / subject.totalChapters) * 100)
    : 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-3 h-10 rounded-full flex-shrink-0"
            style={{ backgroundColor: subject.color }}
          />
          <div className="min-w-0">
            <h4 className="font-semibold text-slate-900 dark:text-white truncate">{subject.name}</h4>
            <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-0.5 ${PRIORITY_STYLES[subject.priority]}`}>
              {PRIORITY_LABEL[subject.priority]}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onEdit}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{subject.completedChapters} of {subject.totalChapters} chapters</span>
          <span className="font-semibold" style={{ color: subject.color }}>{pct}%</span>
        </div>
        <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ backgroundColor: subject.color }}
          />
        </div>
      </div>
    </motion.div>
  )
}

export function SubjectTracker() {
  const { state, addSubject, updateSubject, deleteSubject } = useStudy()
  const { subjects } = state
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const sorted = [...subjects].sort((a, b) => {
    const order: Record<Priority, number> = { high: 0, medium: 1, low: 2 }
    return order[a.priority] - order[b.priority]
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {subjects.length} subject{subjects.length !== 1 ? 's' : ''} · {subjects.reduce((s, sub) => s + sub.completedChapters, 0)} chapters completed
          </p>
        </div>
        <button
          onClick={() => { setShowAdd(true); setEditingId(null) }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Subject
        </button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAdd && (
          <SubjectForm
            title="New Subject"
            onSave={(data) => { addSubject(data); setShowAdd(false) }}
            onCancel={() => setShowAdd(false)}
          />
        )}
      </AnimatePresence>

      {/* Subject Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {sorted.map((subject) => (
            editingId === subject.id ? (
              <motion.div
                key={`edit-${subject.id}`}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="sm:col-span-2 lg:col-span-3"
              >
                <SubjectForm
                  title={`Edit: ${subject.name}`}
                  initial={{
                    name: subject.name,
                    totalChapters: subject.totalChapters,
                    priority: subject.priority,
                    color: subject.color,
                  }}
                  onSave={(data) => { updateSubject(subject.id, data); setEditingId(null) }}
                  onCancel={() => setEditingId(null)}
                />
              </motion.div>
            ) : (
              <SubjectCard
                key={subject.id}
                subject={subject}
                onEdit={() => setEditingId(subject.id)}
                onDelete={() => deleteSubject(subject.id)}
              />
            )
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {subjects.length === 0 && !showAdd && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">No subjects yet</h3>
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-4">Add your first subject to start tracking progress</p>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            Add your first subject
          </button>
        </motion.div>
      )}
    </div>
  )
}
