import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'

interface ThemeToggleProps {
  isDark: boolean
  onToggle: () => void
}

export function ThemeToggle({
  isDark,
  onToggle,
}: ThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`relative flex items-center w-14 h-8 rounded-full p-1 transition-colors duration-300 ${
        isDark
          ? 'bg-slate-700'
          : 'bg-slate-200'
      }`}
      title={isDark ? 'Light Mode' : 'Dark Mode'}
    >
      <motion.div
        layout
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
        className={`absolute w-6 h-6 rounded-full flex items-center justify-center shadow-md ${
          isDark
            ? 'bg-slate-900 left-7'
            : 'bg-white left-1'
        }`}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-blue-400" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500" />
        )}
      </motion.div>

      <div className="flex justify-between items-center w-full px-1">
        <Sun
          className={`w-3 h-3 ${
            !isDark
              ? 'text-amber-500'
              : 'text-slate-400'
          }`}
        />

        <Moon
          className={`w-3 h-3 ${
            isDark
              ? 'text-blue-400'
              : 'text-slate-400'
          }`}
        />
      </div>
    </button>
  )
}