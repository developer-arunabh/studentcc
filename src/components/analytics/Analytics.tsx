import { motion } from 'framer-motion'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell,
} from 'recharts'
import { BarChart3, TrendingUp, Clock, Flame, BookCheck } from 'lucide-react'
import { useStudy } from '../../context/StudyContext'
import { getLastNDays, shortDayLabel } from '../../utils/date'
import { calcWeeklyHours, getSubjectCompletionData } from '../../utils/calculations'

// Custom tooltip for recharts
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-slate-900 dark:text-white mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</span>
        </p>
      ))}
    </div>
  )
}

export function Analytics() {
  const { state } = useStudy()
  const { subjects, chapters, studyLogs, focusSessions, streak } = state

  // Study hours last 7 days
  const last7 = getLastNDays(7)
  const studyData = last7.map((date) => {
    const log = studyLogs.find((l) => l.date === date)
    return {
      day: shortDayLabel(date),
      hours: log ? parseFloat(log.hours.toFixed(2)) : 0,
    }
  })

  // Subject completion data
  const subjectData = getSubjectCompletionData(subjects, chapters)

  const weeklyHours = calcWeeklyHours(studyLogs)
  const totalFocusSessions = focusSessions.filter((s) => s.mode === 'focus').length
  const completedChapters = chapters.filter((c) => c.status === 'completed').length
  const totalHours = studyLogs.reduce((s, l) => s + l.hours, 0)

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Clock, label: 'Hours This Week', value: `${weeklyHours.toFixed(1)}h`, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
          { icon: TrendingUp, label: 'Total Hours Logged', value: `${totalHours.toFixed(1)}h`, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
          { icon: BookCheck, label: 'Focus Sessions', value: totalFocusSessions, color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
          { icon: Flame, label: 'Best Streak', value: `${streak} days`, color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' },
        ].map(({ icon: Icon, label, value, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700"
          >
            <div className={`inline-flex w-9 h-9 rounded-xl items-center justify-center ${color} mb-3`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {value}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Study Hours Chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700"
      >
        <h3 className="font-semibold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          Study Hours — Last 7 Days
        </h3>
        {studyData.some((d) => d.hours > 0) ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={studyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}h`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="hours"
                name="Hours"
                stroke="#2563EB"
                strokeWidth={2.5}
                dot={{ fill: '#2563EB', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
            Complete focus sessions to see your study hours here
          </div>
        )}
      </motion.div>

      {/* Subject Progress Chart */}
      {subjectData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700"
        >
          <h3 className="font-semibold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            Chapter Completion by Subject
          </h3>
          {subjectData.some((d) => d.completed > 0 || d.remaining > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={subjectData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(v) => <span className="text-xs text-slate-600 dark:text-slate-400">{v}</span>}
                />
                <Bar dataKey="completed" name="Completed" radius={[4, 4, 0, 0]} maxBarSize={48}>
                  {subjectData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
                <Bar dataKey="remaining" name="Remaining" fill="#e2e8f0" radius={[4, 4, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
              Complete some chapters to see progress here
            </div>
          )}
        </motion.div>
      )}

      {/* Empty state */}
      {subjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-14"
        >
          <BarChart3 className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">No data yet</h3>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Add subjects, complete chapters, and use focus sessions to see your analytics here.
          </p>
        </motion.div>
      )}

      {/* All-time stats */}
      {studyLogs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 text-white shadow-lg shadow-blue-600/20"
        >
          <h3 className="font-semibold mb-4 text-blue-100 text-sm uppercase tracking-wide">All-Time Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {totalHours.toFixed(0)}h
              </p>
              <p className="text-blue-200 text-xs mt-0.5">Total Hours</p>
            </div>
            <div>
              <p className="text-3xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {completedChapters}
              </p>
              <p className="text-blue-200 text-xs mt-0.5">Chapters Done</p>
            </div>
            <div>
              <p className="text-3xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {totalFocusSessions}
              </p>
              <p className="text-blue-200 text-xs mt-0.5">Focus Sessions</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
