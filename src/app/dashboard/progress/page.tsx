// src/app/dashboard/progress/page.tsx
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ProgressClient from './ProgressClient'

export default async function ProgressPage() {
  const session = await auth()
  if (!session?.user?.id) return null

  const userId = session.user.id

  const [examSessions, domainStats] = await Promise.all([
    prisma.examSession.findMany({
      where: { userId, status: 'completed' },
      orderBy: { completedAt: 'asc' },
      include: { certification: { select: { code: true, color: true } } },
    }),
    prisma.$queryRaw<Array<{ domain: string; total: bigint; correct: bigint }>>`
      SELECT q.domain,
             COUNT(*) as total,
             SUM(CASE WHEN qa."isCorrect" THEN 1 ELSE 0 END) as correct
      FROM "QuestionAnswer" qa
      JOIN "Question" q ON q.id = qa."questionId"
      WHERE qa."userId" = ${userId}
      GROUP BY q.domain
      ORDER BY total DESC
    `,
  ])

  const domainStatsClean = domainStats.map(d => ({
    domain: d.domain,
    total: Number(d.total),
    correct: Number(d.correct),
    score: Number(d.total) > 0 ? Math.round(Number(d.correct) / Number(d.total) * 100) : 0,
  }))

  const sessionsClean = examSessions.map(s => ({
    id: s.id,
    score: s.score ?? 0,
    passed: s.passed ?? false,
    completedAt: s.completedAt?.toISOString() ?? '',
    certCode: s.certification.code,
    certColor: s.certification.color,
    totalQuestions: s.totalQuestions,
    timeSpentSec: s.timeSpentSec,
  }))

  return <ProgressClient examSessions={sessionsClean} domainStats={domainStatsClean} />
}
