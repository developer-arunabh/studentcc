import { motion } from 'framer-motion'
import { Clock, Zap } from 'lucide-react'

interface TrialBannerProps {
  daysLeft: number
  onUpgrade: () => void
}

export function TrialBanner({ daysLeft, onUpgrade }: TrialBannerProps) {
  const isUrgent = daysLeft <= 5

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center justify-between gap-3 px-4 py-2.5 text-sm font-medium ${
        isUrgent
          ? 'bg-red-500 text-white'
          : 'bg-amber-400 text-amber-900'
      }`}
    >
      <span className="flex items-center gap-2">
        <Clock className="w-4 h-4 flex-shrink-0" />
        {isUrgent
          ? `⚠️ Only ${daysLeft} day${daysLeft === 1 ? '' : 's'} left in your free trial!`
          : `⏳ ${daysLeft} days left in your free trial`}
      </span>
      <button
        onClick={onUpgrade}
        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg flex-shrink-0 transition-all ${
          isUrgent
            ? 'bg-white/20 hover:bg-white/30 text-white'
            : 'bg-amber-900/10 hover:bg-amber-900/20 text-amber-900'
        }`}
      >
        <Zap className="w-3.5 h-3.5" />
        Upgrade for ₹100/month →
      </button>
    </motion.div>
  )
}
