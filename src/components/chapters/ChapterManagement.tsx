import { useState, type ComponentType } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, CheckCircle2, Circle, Clock, BookMarked, Trash2, ChevronDown, Filter } from 'lucide-react'
import { useStudy } from '../../context/StudyContext'
import type { ChapterStatus, Difficulty } from '../../types'

const STATUS_CONFIG: Record<ChapterStatus, { label: string; icon: ComponentType<{ className?: string }>; style: string }> = {
  'not-started': {
    label: 'Not Started',
    icon: Circle,
    style: 'text-slate-400',
  },
  'in-progress': {
    label: 'In Progress',
    icon: Clock,
    style: 'text-amber-500',
  },
  'completed': {
    label: 'Completed',
    icon: CheckCircle2,
    style: 'text-emerald-500',
  },
}

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export function ChapterManagement() {
  const { state, addChapter, deleteChapter, completeChapter, setChapterStatus } = useStudy()
  const { chapters, subjects } = state

  const [showAdd, setShowAdd] = useState(false)
  const [filterSubject, setFilterSubject] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<ChapterStatus | 'all'>('all')
  const [form, setForm] = useState({
    name: '',
    subjectId: subjects[0]?.id ?? '',
    difficulty: 'medium' as Difficulty,
    notes: '',
  })

  const filtered = chapters
    .filter((c) => filterSubject === 'all' || c.subjectId === filterSubject)
    .filter((c) => filterStatus === 'all' || c.status === filterStatus)
    .sort((a, b) => {
      const order: Record<ChapterStatus, number> = { 'in-progress': 0, 'not-started': 1, 'completed': 2 }
      return order[a.status] - order[b.status]
    })

  function handleAdd() {
    if (!form.name.trim() || !form.subjectId) return
    addChapter(form)
    setForm({ ...form, name: '', notes: '' })
    setShowAdd(false)
  }

  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name ?? 'Unknown'
  const subjectColor = (id: string) => subjects.find((s) => s.id === id)?.color ?? '#64748b'

  const counts = {
    all: chapters.length,
    'not-started': chapters.filter((c) => c.status === 'not-started').length,
    'in-progress': chapters.filter((c) => c.status === 'in-progress').length,
    'completed': chapters.filter((c) => c.status === 'completed').length,
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status filter pills */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/50 rounded-xl p-1">
          {(['all', 'not-started', 'in-progress', 'completed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterStatus === s
                  ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {s === 'all' ? `All (${counts.all})` : `${STATUS_CONFIG[s].label} (${counts[s]})`}
            </button>
          ))}
        </div>

        {/* Subject filter */}
        {subjects.length > 0 && (
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="pl-8 pr-8 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="all">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>
        )}

        <div className="flex-1" />

        <button
          onClick={() => setShowAdd(!showAdd)}
          disabled={subjects.length === 0}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Chapter
        </button>
      </div>

      {subjects.length === 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
          Add at least one subject before adding chapters.
        </div>
      )}

      {/* Add Form */}
      <AnimatePresence>
        {showAdd && subjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-600 space-y-4">
              <h4 className="font-semibold text-slate-900 dark:text-white">New Chapter</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Chapter Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    placeholder="e.g., Kinematics, Organic Chemistry, Ancient History"
                    autoFocus
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                  <select
                    value={form.subjectId}
                    onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Difficulty</label>
                  <select
                    value={form.difficulty}
                    onChange={(e) => setForm({ ...form, difficulty: e.target.value as Difficulty })}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes (optional)</label>
                  <input
                    type="text"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Any notes about this chapter..."
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div className="sm:col-span-2 flex gap-2">
                  <button
                    onClick={handleAdd}
                    disabled={!form.name.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-all"
                  >
                    Add Chapter
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

      {/* Chapter List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filtered.map((chapter) => {
            const StatusIcon = STATUS_CONFIG[chapter.status].icon
            return (
              <motion.div
                key={chapter.id}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12, height: 0 }}
                className={`bg-white dark:bg-slate-800 rounded-xl px-4 py-3.5 shadow-sm border transition-all hover:shadow-md ${
                  chapter.status === 'completed'
                    ? 'border-emerald-100 dark:border-emerald-900/30'
                    : 'border-slate-100 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Status toggle */}
                  <button
                    onClick={() => {
                      if (chapter.status !== 'completed') {
                        if (chapter.status === 'not-started') setChapterStatus(chapter.id, 'in-progress')
                        else completeChapter(chapter.id)
                      }
                    }}
                    disabled={chapter.status === 'completed'}
                    className={`flex-shrink-0 transition-all ${STATUS_CONFIG[chapter.status].style} ${
                      chapter.status !== 'completed' ? 'hover:scale-110' : ''
                    }`}
                    title={
                      chapter.status === 'not-started'
                        ? 'Mark as In Progress'
                        : chapter.status === 'in-progress'
                        ? 'Mark as Completed'
                        : 'Completed'
                    }
                  >
                    <StatusIcon className="w-5 h-5" />
                  </button>

                  {/* Subject color dot */}
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: subjectColor(chapter.subjectId) }}
                  />

                  {/* Name + subject */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium leading-tight ${
                      chapter.status === 'completed'
                        ? 'line-through text-slate-400 dark:text-slate-500'
                        : 'text-slate-900 dark:text-white'
                    }`}>
                      {chapter.name}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      {subjectName(chapter.subjectId)}
                      {chapter.notes && ` · ${chapter.notes}`}
                    </p>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${DIFFICULTY_STYLES[chapter.difficulty]}`}>
                      {chapter.difficulty}
                    </span>
                    {chapter.status === 'completed' && chapter.revisionCount > 0 && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {chapter.revisionCount}× revised
                      </span>
                    )}
                  </div>

                  {/* Complete / Delete */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {chapter.status !== 'completed' && (
                      <button
                        onClick={() => completeChapter(chapter.id)}
                        className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Done
                      </button>
                    )}
                    <button
                      onClick={() => deleteChapter(chapter.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-14"
        >
          <BookMarked className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {chapters.length === 0 ? 'No chapters yet' : 'No chapters match this filter'}
          </h3>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            {chapters.length === 0 ? 'Add chapters to start tracking your syllabus' : 'Try changing your filters'}
          </p>
        </motion.div>
      )}
    </div>
  )
}
