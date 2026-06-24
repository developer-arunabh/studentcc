import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react'
import type {
  AppState, Subject, Chapter, Task, Goal, Revision,
  FocusSession, ExamSettings, ToastMessage, Priority,
  ChapterStatus, Difficulty, FocusMode,
} from '../types'
import { useAuth } from '../hooks/useAuth'
import { useCloudStorage } from '../hooks/useCloudStorage'
import { todayStr, addDays } from '../utils/date'

// ─── Initial State ───────────────────────────────────────────────────────────
const initialState: AppState = {
  subjects: [],
  chapters: [],
  tasks: [],
  goals: [],
  revisions: [],
  focusSessions: [],
  examSettings: {
    examName: '',
    examDate: '',
    dailyStudyHours: 8,
    totalSubjects: 0,
    totalChapters: 0,
  },
  studyLogs: [],
  theme: 'light',
  lastStudyDate: null,
  streak: 0,
}

// ─── Context Type ────────────────────────────────────────────────────────────
interface StudyContextType {
  state: AppState
  isLoading: boolean
  toasts: ToastMessage[]
  addToast: (message: string, type: ToastMessage['type']) => void
  removeToast: (id: string) => void
  addSubject: (s: Omit<Subject, 'id' | 'completedChapters'>) => void
  updateSubject: (id: string, updates: Partial<Subject>) => void
  deleteSubject: (id: string) => void
  addChapter: (c: { name: string; subjectId: string; difficulty: Difficulty; notes: string }) => void
  updateChapter: (id: string, updates: Partial<Chapter>) => void
  deleteChapter: (id: string) => void
  completeChapter: (id: string) => void
  setChapterStatus: (id: string, status: ChapterStatus) => void
  addTask: (t: { title: string; estimatedMinutes: number }) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
  addGoal: (g: Omit<Goal, 'id' | 'progress'>) => void
  updateGoalProgress: (id: string, completedWork: number) => void
  deleteGoal: (id: string) => void
  completeRevision: (id: string) => void
  completeFocusSession: (session: { date: string; duration: number; mode: FocusMode }) => void
  updateExamSettings: (s: Partial<ExamSettings>) => void
  toggleTheme: () => void
}

const StudyContext = createContext<StudyContextType | null>(null)

export function useStudy() {
  const ctx = useContext(StudyContext)
  if (!ctx) throw new Error('useStudy must be used inside StudyProvider')
  return ctx
}

// ─── Provider ────────────────────────────────────────────────────────────────
export function StudyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { cloudData, isLoading, save } = useCloudStorage(user)

  // Start with null — we don't render until cloud data is loaded
  const [state, setState] = useState<AppState | null>(null)
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const saveEnabled = useRef(false)

  // ── Step 1: When cloud load finishes, populate state exactly once ──────────
  useEffect(() => {
    if (isLoading) return               // still fetching
    if (state !== null) return          // already loaded — don't overwrite

    // Cloud data exists → use it. Otherwise start fresh.
    const initial = cloudData ?? initialState
    console.log('[Context] Initialising state from', cloudData ? 'Supabase ✅' : 'initial state')
    setState(initial)

    // Settle cleanly for 1 second before opening up database save writes
    const timer = setTimeout(() => { 
      saveEnabled.current = true 
    }, 1000)

    return () => clearTimeout(timer)
  }, [isLoading, cloudData, state])

  // ── Step 2: Save to Supabase whenever state changes ───────────────────────
  useEffect(() => {
    if (!saveEnabled.current) return
    if (state === null) return
    save(state)
  }, [state, save])

  // ── Theme ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (state === null) return
    document.documentElement.classList.toggle('dark', state.theme === 'dark')
  }, [state?.theme])

  // ── Toast helpers ─────────────────────────────────────────────────────────
  const addToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // ── State updater ─────────────────────────────────────────────────────────
  function upd(partial: Partial<AppState> | ((prev: AppState) => AppState)) {
    setState((prev) => {
      if (prev === null) return prev
      return typeof partial === 'function' ? partial(prev) : { ...prev, ...partial }
    })
  }

  function updateStreak(prev: AppState, today: string): Pick<AppState, 'streak' | 'lastStudyDate'> {
    if (prev.lastStudyDate === today) return { streak: prev.streak, lastStudyDate: prev.lastStudyDate }
    const yesterday = addDays(today, -1)
    if (prev.lastStudyDate === yesterday) return { streak: prev.streak + 1, lastStudyDate: today }
    return { streak: 1, lastStudyDate: today }
  }

  // ── Subjects ──────────────────────────────────────────────────────────────
  const addSubject = useCallback((s: Omit<Subject, 'id' | 'completedChapters'>) => {
    upd((prev) => ({ ...prev, subjects: [...prev.subjects, { ...s, id: crypto.randomUUID(), completedChapters: 0 }] }))
    addToast(`Subject "${s.name}" added!`, 'success')
  }, [addToast])

  const updateSubject = useCallback((id: string, updates: Partial<Subject>) => {
    upd((prev) => ({ ...prev, subjects: prev.subjects.map((s) => s.id === id ? { ...s, ...updates } : s) }))
    addToast('Subject updated!', 'success')
  }, [addToast])

  const deleteSubject = useCallback((id: string) => {
    upd((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s.id !== id),
      chapters: prev.chapters.filter((c) => c.subjectId !== id),
    }))
    addToast('Subject deleted.', 'info')
  }, [addToast])

  // ── Chapters ──────────────────────────────────────────────────────────────
  const addChapter = useCallback((c: { name: string; subjectId: string; difficulty: Difficulty; notes: string }) => {
    upd((prev) => ({
      ...prev,
      chapters: [...prev.chapters, { ...c, id: crypto.randomUUID(), status: 'not-started' as ChapterStatus, revisionCount: 0 }],
    }))
    addToast(`Chapter "${c.name}" added!`, 'success')
  }, [addToast])

  const updateChapter = useCallback((id: string, updates: Partial<Chapter>) => {
    upd((prev) => ({ ...prev, chapters: prev.chapters.map((c) => c.id === id ? { ...c, ...updates } : c) }))
  }, [])

  const setChapterStatus = useCallback((id: string, status: ChapterStatus) => {
    upd((prev) => ({ ...prev, chapters: prev.chapters.map((c) => c.id === id ? { ...c, status } : c) }))
  }, [])

  const deleteChapter = useCallback((id: string) => {
    upd((prev) => {
      const ch = prev.chapters.find((c) => c.id === id)
      return {
        ...prev,
        chapters: prev.chapters.filter((c) => c.id !== id),
        revisions: prev.revisions.filter((r) => r.chapterId !== id),
        subjects: ch?.status === 'completed'
          ? prev.subjects.map((s) => s.id === ch.subjectId ? { ...s, completedChapters: Math.max(0, s.completedChapters - 1) } : s)
          : prev.subjects,
      }
    })
    addToast('Chapter deleted.', 'info')
  }, [addToast])

  const completeChapter = useCallback((id: string) => {
    upd((prev) => {
      const chapter = prev.chapters.find((c) => c.id === id)
      if (!chapter || chapter.status === 'completed') return prev
      const subject = prev.subjects.find((s) => s.id === chapter.subjectId)
      const completedAt = todayStr()
      const newRevisions: Revision[] = [
        { id: crypto.randomUUID(), chapterId: id, chapterName: chapter.name, subjectName: subject?.name ?? 'Unknown', type: 'revision-1', scheduledDate: addDays(completedAt, 1), completed: false },
        { id: crypto.randomUUID(), chapterId: id, chapterName: chapter.name, subjectName: subject?.name ?? 'Unknown', type: 'revision-2', scheduledDate: addDays(completedAt, 7), completed: false },
        { id: crypto.randomUUID(), chapterId: id, chapterName: chapter.name, subjectName: subject?.name ?? 'Unknown', type: 'final', scheduledDate: addDays(completedAt, 21), completed: false },
      ]
      return {
        ...prev,
        chapters: prev.chapters.map((c) => c.id === id ? { ...c, status: 'completed', completedAt, revisionCount: c.revisionCount + 1 } : c),
        subjects: prev.subjects.map((s) => s.id === chapter.subjectId ? { ...s, completedChapters: s.completedChapters + 1 } : s),
        revisions: [...prev.revisions, ...newRevisions],
      }
    })
    addToast('✅ Chapter completed! Revisions scheduled for Day 1, 7, and 21.', 'success')
  }, [addToast])

  // ── Tasks ─────────────────────────────────────────────────────────────────
  const addTask = useCallback((t: { title: string; estimatedMinutes: number }) => {
    upd((prev) => ({ ...prev, tasks: [...prev.tasks, { ...t, id: crypto.randomUUID(), completed: false, date: todayStr() }] }))
    addToast('Task added!', 'success')
  }, [addToast])

  const toggleTask = useCallback((id: string) => {
    upd((prev) => ({ ...prev, tasks: prev.tasks.map((t) => t.id === id ? { ...t, completed: !t.completed } : t) }))
  }, [])

  const deleteTask = useCallback((id: string) => {
    upd((prev) => ({ ...prev, tasks: prev.tasks.filter((t) => t.id !== id) }))
  }, [])

  // ── Goals ─────────────────────────────────────────────────────────────────
  const addGoal = useCallback((g: Omit<Goal, 'id' | 'progress'>) => {
    const progress = g.totalWork > 0 ? Math.round((g.completedWork / g.totalWork) * 100) : 0
    upd((prev) => ({ ...prev, goals: [...prev.goals, { ...g, id: crypto.randomUUID(), progress }] }))
    addToast(`Goal "${g.title}" added!`, 'success')
  }, [addToast])

  const updateGoalProgress = useCallback((id: string, completedWork: number) => {
    upd((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => {
        if (g.id !== id) return g
        const progress = g.totalWork > 0 ? Math.round((completedWork / g.totalWork) * 100) : 0
        return { ...g, completedWork, progress }
      }),
    }))
    addToast('Goal progress updated!', 'success')
  }, [addToast])

  const deleteGoal = useCallback((id: string) => {
    upd((prev) => ({ ...prev, goals: prev.goals.filter((g) => g.id !== id) }))
    addToast('Goal deleted.', 'info')
  }, [addToast])

  // ── Revisions ─────────────────────────────────────────────────────────────
  const completeRevision = useCallback((id: string) => {
    upd((prev) => ({ ...prev, revisions: prev.revisions.map((r) => r.id === id ? { ...r, completed: true } : r) }))
    addToast('Revision marked done! 🎉', 'success')
  }, [addToast])

  // ── Focus Sessions ────────────────────────────────────────────────────────
  const completeFocusSession = useCallback((session: { date: string; duration: number; mode: FocusMode }) => {
    upd((prev) => {
      const today = todayStr()
      const hoursToAdd = session.duration / 60
      const newStudyLogs = [...prev.studyLogs]
      const existingIdx = newStudyLogs.findIndex((l) => l.date === today)
      if (existingIdx >= 0) {
        newStudyLogs[existingIdx] = { ...newStudyLogs[existingIdx], hours: newStudyLogs[existingIdx].hours + hoursToAdd }
      } else {
        newStudyLogs.push({ date: today, hours: hoursToAdd })
      }
      return {
        ...prev,
        focusSessions: [...prev.focusSessions, { ...session, id: crypto.randomUUID() }],
        studyLogs: newStudyLogs,
        ...updateStreak(prev, today),
      }
    })
    if (session.mode === 'focus') addToast(`🎉 Focus session complete! +${session.duration} min logged.`, 'success')
  }, [addToast])

  // ── Exam Settings ─────────────────────────────────────────────────────────
  const updateExamSettings = useCallback((s: Partial<ExamSettings>) => {
    upd((prev) => ({ ...prev, examSettings: { ...prev.examSettings, ...s } }))
    addToast('Exam settings saved!', 'success')
  }, [addToast])

  // ── Theme ─────────────────────────────────────────────────────────────────
  const toggleTheme = useCallback(() => {
    upd((prev) => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }))
  }, [])

  // ── While state is null (loading), report isLoading = true ───────────────
  const effectiveLoading = isLoading || state === null

  const value: StudyContextType = {
    state: state ?? initialState,
    isLoading: effectiveLoading,
    toasts,
    addToast,
    removeToast,
    addSubject,
    updateSubject,
    deleteSubject,
    addChapter,
    updateChapter,
    deleteChapter,
    completeChapter,
    setChapterStatus,
    addTask,
    toggleTask,
    deleteTask,
    addGoal,
    updateGoalProgress,
    deleteGoal,
    completeRevision,
    completeFocusSession,
    updateExamSettings,
    toggleTheme,
  }

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>
}