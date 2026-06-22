import { motion } from 'framer-motion'
import { CheckCircle, BookOpen, BarChart3, Timer, Target, RotateCcw, Calendar, LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'

const FEATURES = [
  { icon: Calendar, label: 'Exam countdown & daily chapter targets' },
  { icon: BookOpen, label: 'Unlimited subjects & chapters' },
  { icon: RotateCcw, label: 'Spaced repetition revision planner' },
  { icon: Timer, label: 'Pomodoro focus timer with session tracking' },
  { icon: Target, label: 'Goals with progress tracking' },
  { icon: BarChart3, label: 'Study analytics & streak tracking' },
]

export function PaywallPage() {
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
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl shadow-blue-900/20 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-2xl mb-4">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Your free trial has ended
            </h1>
            <p className="text-blue-100 text-sm">Upgrade to keep your study streak going 🔥</p>
          </div>

          <div className="p-8">
            {/* Features */}
            <div className="mb-8">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
                What you get with premium
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FEATURES.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-7 h-7 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                      <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="text-center mb-8">
              <div className="inline-flex items-end gap-1 mb-1">
                <span className="text-4xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>₹100</span>
                <span className="text-slate-500 dark:text-slate-400 pb-1">/month</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">One-time payment · Cancel anytime</p>
            </div>

            {/* Payment Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* UPI Card */}
              <div className="border-2 border-blue-100 dark:border-blue-900/40 rounded-2xl p-5 text-center hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                <p className="font-semibold text-slate-800 dark:text-white mb-3">📱 Pay via UPI</p>
                {/* UPI QR Placeholder */}
                <div className="mx-auto w-36 h-36 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center mb-3 border border-slate-200 dark:border-slate-600">
                  <div className="text-center">
                    <div className="grid grid-cols-5 gap-0.5 mx-auto w-20 mb-2">
                      {Array.from({ length: 25 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-3.5 h-3.5 rounded-sm"
                          style={{ backgroundColor: Math.random() > 0.5 ? '#1e293b' : 'transparent' }}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-400">QR Code</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">Scan & Pay ₹100</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-mono">yourname@upi</p>
              </div>

              {/* Instamojo Card */}
              <div className="border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-5 text-center flex flex-col items-center justify-center hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                <p className="font-semibold text-slate-800 dark:text-white mb-2">💳 Pay Online</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Debit/Credit Card, Net Banking, UPI</p>
                <a
                  href="https://www.instamojo.com/yourusername/studyapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-600/25 text-sm"
                >
                  Pay via Instamojo →
                </a>
              </div>
            </div>

            {/* After Payment */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4 mb-6 text-center">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                After payment, WhatsApp your payment screenshot to{' '}
                <a href="https://wa.me/916200616314" className="font-bold underline">+91XXXXXXXXXX</a>
                {' '}and we'll activate your account within 10 minutes.
              </p>
            </div>

            {/* Fine print */}
            <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Cancel anytime</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Instant access after activation</span>
            </div>

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              className="mt-6 w-full flex items-center justify-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
