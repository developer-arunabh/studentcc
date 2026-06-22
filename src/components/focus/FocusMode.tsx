import { useState, useEffect, useRef, useCallback, type ComponentType } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Coffee, 
  Brain, 
  Zap, 
  Volume2, 
  VolumeX 
} from 'lucide-react'
import { useStudy } from '../../context/StudyContext'
import { todayStr, formatTimer } from '../../utils/date'
import type { FocusMode as FocusModeType } from '../../types'

const MODES: { 
  id: FocusModeType; 
  label: string; 
  icon: ComponentType<{ className?: string }>; 
  duration: number; 
  color: string; 
  bg: string 
}[] = [
  { id: 'focus', label: 'Focus', icon: Brain, duration: 25 * 60, color: '#2563EB', bg: 'bg-blue-600' },
  { id: 'short-break', label: 'Short Break', icon: Coffee, duration: 5 * 60, color: '#059669', bg: 'bg-emerald-500' },
  { id: 'long-break', label: 'Long Break', icon: Zap, duration: 15 * 60, color: '#7C3AED', bg: 'bg-purple-600' },
]

const focusTracks = [
  'https://zxobhukjmdpxciyfbreg.supabase.co/storage/v1/object/public/focus-music/focus1.mp3',
  'https://zxobhukjmdpxciyfbreg.supabase.co/storage/v1/object/public/focus-music/focus2.mp3',
  'https://zxobhukjmdpxciyfbreg.supabase.co/storage/v1/object/public/focus-music/focus3.mp3',
  'https://zxobhukjmdpxciyfbreg.supabase.co/storage/v1/object/public/focus-music/focus4.mp3',
  'https://zxobhukjmdpxciyfbreg.supabase.co/storage/v1/object/public/focus-music/focus5.mp3',
]

export function FocusMode() {
  const { state, completeFocusSession, addToast } = useStudy()
  const { focusSessions } = state

  const [mode, setMode] = useState<FocusModeType>('focus')
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [muted, setMuted] = useState(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const modeConfig = MODES.find((m) => m.id === mode)!

  const today = todayStr()
  const todaySessions = focusSessions.filter((s) => s.date === today && s.mode === 'focus')
  const todayMinutes = focusSessions
    .filter((s) => s.date === today && s.mode === 'focus')
    .reduce((sum, s) => sum + s.duration, 0)

  const totalDuration = modeConfig.duration
  const progress = (timeLeft / totalDuration) * 100
  const circumference = 2 * Math.PI * 110 // radius = 110

  // Audio Control Helpers
  const stopFocusMusic = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [])

  const startFocusMusic = useCallback(() => {
    if (mode !== 'focus') return

    const randomTrack = FOCUS_TRACKS[Math.floor(Math.random() * FOCUS_TRACKS.length)]

    if (audioRef.current) {
      audioRef.current.pause()
    }

    const audio = new Audio(randomTrack)
    audio.loop = true
    audio.volume = 0.25
    audio.muted = muted

    audio.play().catch(() => {})
    audioRef.current = audio
  }, [mode, muted])

  // Complete Session Handler
  const handleComplete = useCallback(() => {
    setIsRunning(false)
    stopFocusMusic()
    completeFocusSession({
      date: todayStr(),
      duration: modeConfig.duration / 60,
      mode,
    })
    if (mode === 'focus') {
      addToast('🎉 Focus session complete! Time for a break.', 'success')
    } else {
      addToast('Break over! Ready to focus again?', 'info')
    }
    setTimeLeft(modeConfig.duration)
  }, [mode, modeConfig.duration, completeFocusSession, addToast, stopFocusMusic])

  // Main Ticker Effect
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!)
            handleComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, handleComplete])

  // Component Cleanup on Unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [])

  // User Actions
  function switchMode(newMode: FocusModeType) {
    stopFocusMusic()
    setIsRunning(false)
    setMode(newMode)
    const cfg = MODES.find((m) => m.id === newMode)!
    setTimeLeft(cfg.duration)
  }

  function handleReset() {
    setIsRunning(false)
    stopFocusMusic()
    setTimeLeft(modeConfig.duration)
  }

  function togglePlayPause() {
    if (!isRunning) {
      setIsRunning(true)
      if (audioRef.current) {
        audioRef.current.play().catch(() => {})
      } else {
        startFocusMusic()
      }
    } else {
      setIsRunning(false)
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }

  function toggleMute() {
    const nextMuted = !muted
    setMuted(nextMuted)
    if (audioRef.current) {
      audioRef.current.muted = nextMuted
    }
  }

  return (
    <div className="space-y-6 flex flex-col items-center">
      {/* Mode Selector */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/50 rounded-xl p-1 w-full max-w-sm">
        {MODES.map((m) => {
          const Icon = m.icon
          return (
            <button
              key={m.id}
              onClick={() => switchMode(m.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                mode === m.id
                  ? `${m.bg} text-white shadow-sm`
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {m.label}
            </button>
          )
        })}
      </div>

      {/* Timer Circle */}
      <motion.div
        key={mode}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative flex items-center justify-center"
        style={{ width: 280, height: 280 }}
      >
        <svg
          width="280"
          height="280"
          className="absolute inset-0 -rotate-90"
          style={{ filter: isRunning ? `drop-shadow(0 0 12px ${modeConfig.color}60)` : undefined }}
        >
          <circle
            cx="140"
            cy="140"
            r="110"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-slate-100 dark:text-slate-700"
          />
          <motion.circle
            cx="140"
            cy="140"
            r="110"
            fill="none"
            stroke={modeConfig.color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: circumference * (1 - progress / 100) }}
            transition={{ duration: 0.5 }}
          />
        </svg>

        <div className="relative text-center z-10">
          <AnimatePresence mode="wait">
            <motion.span
              key={timeLeft}
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 1 }}
              className="text-5xl font-bold tabular-nums text-slate-900 dark:text-white"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              {formatTimer(timeLeft)}
            </motion.span>
          </AnimatePresence>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{modeConfig.label}</p>
          {isRunning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-1 mt-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs text-blue-500">In Progress</span>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleReset}
          className="w-11 h-11 rounded-full border-2 border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-400 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={togglePlayPause}
          className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-all hover:scale-105 active:scale-95"
          style={{ backgroundColor: modeConfig.color, boxShadow: `0 8px 24px ${modeConfig.color}50` }}
        >
          {isRunning ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
        </button>

        <button
          onClick={toggleMute}
          className="w-11 h-11 rounded-full border-2 border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-400"
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
        {[
          { label: 'Sessions Today', value: todaySessions.length },
          { label: 'Minutes Focused', value: todayMinutes },
          { label: 'Total Sessions', value: focusSessions.filter((s) => s.mode === 'focus').length },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-white dark:bg-slate-800 rounded-2xl p-4 text-center shadow-sm border border-slate-100 dark:border-slate-700"
          >
            <p
              className="text-2xl font-bold text-slate-900 dark:text-white"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              {value}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="w-full max-w-sm bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl p-4 text-center">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          {mode === 'focus'
            ? '💡 Stay focused for 25 minutes, then take a 5-minute break.'
            : mode === 'short-break'
            ? '☕ Step away from the screen, stretch, or grab some water.'
            : '🛌 Take a longer rest after 4 focus sessions for best results.'}
        </p>
      </div>
    </div>
  )
}