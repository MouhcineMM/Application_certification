// src/app/api/exams/[sessionId]/submit/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { sessionId: string } }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { sessionId } = params
  const body = await req.json()
  const { answers, timeSpentSec } = body

  // Verify ownership
  const examSession = await prisma.examSession.findUnique({
    where: { id: sessionId },
    include: {
      examQuestions: {
        include: { question: true },
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!examSession || examSession.userId !== session.user.id) {
    return NextResponse.json({ error: 'Session introuvable' }, { status: 404 })
  }

  if (examSession.status === 'completed') {
    return NextResponse.json({ error: 'Session déjà terminée' }, { status: 400 })
  }

  // Grade answers
  let correctCount = 0
  const gradedQuestions: any[] = []
  const domainMap: Record<string, { total: number; correct: number }> = {}

  for (const eq of examSession.examQuestions) {
    const userAnswerData = (answers as any[]).find((a: any) => a.examQuestionId === eq.id)
    const userAnswer: number[] = userAnswerData?.userAnswer ?? []
    const correctAnswers = eq.question.correctAnswers as number[]

    const isCorrect =
      JSON.stringify([...userAnswer].sort()) === JSON.stringify([...correctAnswers].sort())

    if (isCorrect) correctCount++

    const domain = eq.question.domain
    if (!domainMap[domain]) domainMap[domain] = { total: 0, correct: 0 }
    domainMap[domain].total++
    if (isCorrect) domainMap[domain].correct++

    // Update exam question
    await prisma.examQuestion.update({
      where: { id: eq.id },
      data: {
        userAnswer,
        isCorrect,
        answeredAt: new Date(),
      },
    })

    // Record in question answers for stats
    await prisma.questionAnswer.create({
      data: {
        userId: session.user.id,
        questionId: eq.question.id,
        isCorrect,
      },
    })

    gradedQuestions.push({
      text: eq.question.text,
      isCorrect,
      difficulty: eq.question.difficulty,
      domain: eq.question.domain,
      explanation: eq.question.explanation,
      correctAnswers,
      userAnswer,
      choices: eq.question.choices,
    })
  }

  const score = Math.round((correctCount / examSession.totalQuestions) * 100)
  const cert = await prisma.certification.findUnique({ where: { id: examSession.certificationId } })
  const passed = score >= (cert?.passScore ?? 70)

  // Update session
  await prisma.examSession.update({
    where: { id: sessionId },
    data: {
      status: 'completed',
      score,
      passed,
      completedAt: new Date(),
      timeSpentSec: timeSpentSec ?? null,
    },
  })

  // Update user XP
  const xpGained = passed ? 50 : 10
  await prisma.user.update({
    where: { id: session.user.id },
    data: { xp: { increment: xpGained } },
  })

  // Domain stats
  const domainStats = Object.entries(domainMap).map(([domain, stats]) => ({
    domain,
    total: stats.total,
    correct: stats.correct,
    score: Math.round(stats.correct / stats.total * 100),
  }))

  return NextResponse.json({
    sessionId,
    score,
    passed,
    correctCount,
    totalQuestions: examSession.totalQuestions,
    xpGained,
    domainStats,
    questionsReview: gradedQuestions,
  })
}
