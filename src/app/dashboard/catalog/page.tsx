// src/app/dashboard/catalog/page.tsx
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import CatalogClient from './CatalogClient'

export default async function CatalogPage() {
  const session = await auth()
  if (!session?.user?.id) return null

  const [certifications, enrollments] = await Promise.all([
    prisma.certification.findMany({
      include: {
        _count: { select: { modules: true, questions: true, examSessions: true } },
      },
      orderBy: { code: 'asc' },
    }),
    prisma.enrollment.findMany({
      where: { userId: session.user.id },
      include: {
        moduleProgress: { where: { completedAt: { not: null } } },
        certification: { include: { _count: { select: { modules: true } } } },
      },
    }),
  ])

  const enrolledIds = new Set(enrollments.map(e => e.certificationId))
  const progressMap = new Map(
    enrollments.map(e => [
      e.certificationId,
      e.certification._count.modules > 0
        ? Math.round(e.moduleProgress.length / e.certification._count.modules * 100)
        : 0,
    ])
  )

  const certsWithEnrollment = certifications.map(cert => ({
    ...cert,
    enrolled: enrolledIds.has(cert.id),
    progress: progressMap.get(cert.id) ?? 0,
  }))

  return <CatalogClient certifications={certsWithEnrollment} userId={session.user.id} />
}
