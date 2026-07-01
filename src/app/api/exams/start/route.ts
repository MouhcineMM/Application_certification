// src/app/api/exams/start/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const StartSchema = z.object({
  certificationId: z.string(),
  numQuestions: z.number().min(1).max(100),
  mode: z.enum(['practice', 'exam']),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = StartSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
  }

  const { certificationId, numQuestions, mode } = parsed.data

  // Récupérer des questions aléatoires
  const allQuestions = await prisma.question.findMany({
    where: { certificationId },
  })

  if (allQuestions.length === 0) {
    return NextResponse.json({ error: 'Aucune question disponible pour cette certification' }, { status: 404 })
  }

  // Mélanger et sélectionner
  const shuffled = allQuestions.sort(() => Math.random() - 0.5).slice(0, numQuestions)

  // Time limit: 1.8 min per question in exam mode
  const timeLimitSec = mode === 'exam' ? Math.round(numQuestions * 1.8 * 60) : null

  // Créer la session
  const examSession = await prisma.examSession.create({
    data: {
      userId: session.user.id,
      certificationId,
      status: 'in_progress',
      mode,
      totalQuestions: shuffled.length,
      timeLimitSec,
      examQuestions: {
        create: shuffled.map((q, i) => ({
          questionId: q.id,
          order: i + 1,
        })),
      },
    },
    include: {
      examQuestions: {
        include: { question: true },
        orderBy: { order: 'asc' },
      },
    },
  })

  // Format for client (no correctAnswers in exam mode)
  const questions = examSession.examQuestions.map(eq => ({
    id: eq.question.id,
    examQuestionId: eq.id,
    order: eq.order,
    domain: eq.question.domain,
    type: eq.question.type,
    difficulty: eq.question.difficulty,
    text: eq.question.text,
    choices: eq.question.choices as string[],
    // In exam mode, correctAnswers are hidden from client
    correctAnswers: mode === 'practice' ? eq.question.correctAnswers as number[] : [],
    explanation: mode === 'practice' ? eq.question.explanation : '',
  }))

  return NextResponse.json({
    id: examSession.id,
    mode,
    timeLimitSec,
    questions,
  })
}
