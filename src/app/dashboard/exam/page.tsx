// src/app/dashboard/exam/page.tsx
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ExamSetupClient from './ExamSetupClient'

export default async function ExamPage() {
  const session = await auth()
  if (!session?.user?.id) return null

  // Récupérer les certifications avec questions disponibles
  const certifications = await prisma.certification.findMany({
    include: {
      _count: { select: { questions: true } },
    },
    where: { questions: { some: {} } },
    orderBy: { code: 'asc' },
  })

  return <ExamSetupClient certifications={certifications} />
}
