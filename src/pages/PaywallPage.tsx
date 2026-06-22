import { motion } from 'framer-motion'
import {
  CheckCircle,
  BookOpen,
  BarChart3,
  Timer,
  Target,
  RotateCcw,
  Calendar,
  LogOut,
  ArrowLeft
} from 'lucide-react'
import { supabase } from '../lib/supabase'

const FEATURES = [
  { icon: Calendar, label: 'Exam countdown & daily chapter targets' },
  { icon: BookOpen, label: 'Unlimited subjects & chapters' },
  { icon: RotateCcw, label: 'Spaced repetition revision planner' },
  { icon: Timer, label: 'Pomodoro focus timer with session tracking' },
  { icon: Target, label: 'Goals with progress tracking' },
  { icon: BarChart3, label: 'Study analytics & streak tracking' },
]

interface PaywallPageProps {
  onBack?: () => void
}

export function PaywallPage({ onBack }: PaywallPageProps) {
  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Back Button */}
          {onBack && (
            <div className="p-4 border-b border-slate-100 dark:border-slate-700">
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </button>
            </div>
          )}

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-2xl mb-4">
              <BookOpen className="w-7 h-7 text-white" />
            </div>

            <h1
              className="text-3xl font-bold text-white mb-2"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              Upgrade to Premium
            </h1>

            <p className="text-blue-100">
              Unlock all premium study features and never lose your progress
            </p>
          </div>

          <div className="p-8">
            {/* Features */}
            <div className="mb-8">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
                Everything Included
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FEATURES.map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>

                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="text-center mb-8">
              <div className="inline-flex items-end gap-1">
                <span
                  className="text-5xl font-bold text-slate-900 dark:text-white"
                  style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                >
                  ₹100
                </span>

                <span className="text-slate-500 dark:text-slate-400 mb-1">
                  /month
                </span>
              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Affordable pricing for serious students
              </p>
            </div>

            {/* Payment Card */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center mb-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                💳 Online Payment
              </h3>

              <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                UPI • Debit Card • Credit Card • Net Banking
              </p>

              <a
                href="https://www.instamojo.com/yourusername/studyapp"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-lg shadow-blue-600/25"
              >
                Upgrade Now →
              </a>
            </div>

            {/* Activation Notice */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-center mb-6">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                After payment, send your payment screenshot on WhatsApp and your
                premium account will be activated quickly.
              </p>

              <a
                href="https://wa.me/916200616314"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 font-semibold text-green-600 hover:text-green-700"
              >
                WhatsApp Support →
              </a>
            </div>

            {/* Benefits */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 mb-6">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Premium Features
              </span>

              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Cloud Backup
              </span>

              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Priority Support
              </span>
            </div>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-red-500 transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}