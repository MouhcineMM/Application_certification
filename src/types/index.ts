// src/types/index.ts

export type Difficulty = 'Facile' | 'Intermédiaire' | 'Difficile'
export type QuestionType = 'single' | 'multi'
export type ExamMode = 'practice' | 'exam'
export type ExamStatus = 'in_progress' | 'completed' | 'abandoned'

export interface QuestionClient {
  id: string
  domain: string
  type: QuestionType
  difficulty: Difficulty
  text: string
  choices: string[]
  correctAnswers: number[]
  explanation: string
}

export interface ExamSessionClient {
  id: string
  certificationId: string
  status: ExamStatus
  mode: ExamMode
  totalQuestions: number
  timeLimitSec: number | null
  startedAt: string
  completedAt: string | null
  score: number | null
  passed: boolean | null
  timeSpentSec: number | null
  questions: ExamQuestionClient[]
}

export interface ExamQuestionClient {
  id: string
  questionId: string
  order: number
  userAnswer: number[] | null
  isCorrect: boolean | null
  question: QuestionClient
}

export interface DomainStats {
  domain: string
  score: number
  totalAnswered: number
  correct: number
  color: string
}

export interface CertificationWithProgress {
  id: string
  code: string
  name: string
  provider: string
  category: string
  level: string
  icon: string
  color: string
  durationHours: number
  passScore: number
  description: string | null
  enrolled: boolean
  progress: number // 0-100 based on modules completed
  modulesTotal: number
  modulesCompleted: number
  examSessions: ExamHistoryItem[]
}

export interface ExamHistoryItem {
  id: string
  score: number
  passed: boolean
  timeSpentSec: number | null
  totalQuestions: number
  completedAt: string
}
