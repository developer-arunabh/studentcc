import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, CheckSquare, Square, Clock, ListTodo } from 'lucide-react'
import { useStudy } from '../../context/StudyContext'
import { todayStr, formatMinutes } from '../../utils/date'

export function TodaysPlan() {
  const { state, addTask, toggleTask, deleteTask } = useStudy()
  const { tasks } = state

  const [title, setTitle] = useState('')
  const [minutes, setMinutes] = useState(30)
  const [showAdd, setShowAdd] = useState(false)

  const today = todayStr()
  const todayTasks = tasks.filter((t) => t.date === today)
  const completedTasks = todayTasks.filter((t) => t.completed)
  const pendingTasks = todayTasks.filter((t) => !t.completed)

  const totalMinutes = todayTasks.reduce((s, t) => s + t.estimatedMinutes, 0)
  const completedMinutes = completedTasks.reduce((s, t) => s + t.estimatedMinutes, 0)
  const pct = totalMinutes > 0 ? Math.round((completedMinutes / totalMinutes) * 100) : 0

  function handleAdd() {
    if (!title.trim()) return
    addTask({ title: title.trim(), estimatedMinutes: minutes })
    setTitle('')
    setMinutes(30)
    setShowAdd(false)
  }

  return (
    <div className="space-y-4">
      {/* Progress Card */}
      {todayTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Today's Progress
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {completedTasks.length} of {todayTasks.length} tasks · {formatMinutes(completedMinutes)} of {formatMinutes(totalMinutes)}
              </p>
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {pct}%
            </div>
          </div>
          <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6 }}
              className="h-full bg-blue-600 rounded-full"
            />
          </div>
          {pct === 100 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mt-2 text-center"
            >
              🎉 All tasks done! Excellent work today.
            </motion.p>
          )}
        </motion.div>
      )}

      {/* Add Task */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {pendingTasks.length > 0 ? `${pendingTasks.length} task${pendingTasks.length !== 1 ? 's' : ''} remaining` : 'All clear!'}
        </p>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-600">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">New Task</h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  placeholder="What do you need to study?"
                  autoFocus
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <input
                    type="number"
                    value={minutes}
                    onChange={(e) => setMinutes(Math.max(5, +e.target.value))}
                    min={5}
                    step={5}
                    className="w-20 px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-center"
                  />
                  <span className="text-sm text-slate-500 dark:text-slate-400">min</span>
                </div>
                <button
                  onClick={handleAdd}
                  disabled={!title.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task Lists */}
      <div className="space-y-2">
        {/* Pending Tasks */}
        <AnimatePresence mode="popLayout">
          {pendingTasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl px-4 py-3.5 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-3 group"
            >
              <button
                onClick={() => toggleTask(task.id)}
                className="text-slate-300 dark:text-slate-600 hover:text-blue-600 transition-colors flex-shrink-0"
              >
                <Square className="w-5 h-5" />
              </button>
              <span className="flex-1 text-sm font-medium text-slate-900 dark:text-white">{task.title}</span>
              <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 flex-shrink-0">
                <Clock className="w-3 h-3" />
                {formatMinutes(task.estimatedMinutes)}
              </span>
              <button
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2 px-1">
              Completed ({completedTasks.length})
            </p>
            <AnimatePresence>
              {completedTasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 py-3 px-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-1.5 border border-slate-100 dark:border-slate-700/50 group"
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="text-emerald-500 hover:text-slate-400 transition-colors flex-shrink-0"
                  >
                    <CheckSquare className="w-5 h-5" />
                  </button>
                  <span className="flex-1 text-sm text-slate-400 dark:text-slate-500 line-through">{task.title}</span>
                  <span className="text-xs text-slate-300 dark:text-slate-600 flex items-center gap-1 flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    {formatMinutes(task.estimatedMinutes)}
                  </span>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Empty State */}
      {todayTasks.length === 0 && !showAdd && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-14"
        >
          <ListTodo className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">No tasks for today</h3>
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-4">Plan your study session by adding tasks</p>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            Add your first task
          </button>
        </motion.div>
      )}
    </div>
  )
}
