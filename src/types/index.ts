export type Priority = 'high' | 'medium' | 'low'
export type ChapterStatus = 'not-started' | 'in-progress' | 'completed'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type RevisionType = 'revision-1' | 'revision-2' | 'final'
export type FocusMode = 'focus' | 'short-break' | 'long-break'
export type Theme = 'light' | 'dark'
export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'loading'

export interface Subject {
  id: string
  name: string
  totalChapters: number
  completedChapters: number
  priority: Priority
  color: string
}

export interface Chapter {
  id: string
  name: string
  subjectId: string
  status: ChapterStatus
  difficulty: Difficulty
  revisionCount: number
  notes: string
  completedAt?: string
}

export interface Task {
  id: string
  title: string
  completed: boolean
  estimatedMinutes: number
  date: string
}

export interface Goal {
  id: string
  title: string
  progress: number
  deadline: string
  totalWork: number
  completedWork: number
}

export interface Revision {
  id: string
  chapterId: string
  chapterName: string
  subjectName: string
  type: RevisionType
  scheduledDate: string
  completed: boolean
}

export interface FocusSession {
  id: string
  date: string
  duration: number
  mode: FocusMode
}

export interface ExamSettings {
  examName: string
  examDate: string
  dailyStudyHours: number
  totalSubjects: number
  totalChapters: number
}

export interface StudyLog {
  date: string
  hours: number
}

export interface AppState {
  subjects: Subject[]
  chapters: Chapter[]
  tasks: Task[]
  goals: Goal[]
  revisions: Revision[]
  focusSessions: FocusSession[]
  examSettings: ExamSettings
  studyLogs: StudyLog[]
  theme: Theme
  lastStudyDate: string | null
  streak: number
}

export interface ToastMessage {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
}

export type Section =
  | 'overview'
  | 'exam'
  | 'subjects'
  | 'chapters'
  | 'tasks'
  | 'revision'
  | 'focus'
  | 'goals'
  | 'analytics'
