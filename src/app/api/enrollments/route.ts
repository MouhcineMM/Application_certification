// src/app/api/enrollments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const EnrollSchema = z.object({
  certificationId: z.string(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = EnrollSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
  }

  const enrollment = await prisma.enrollment.upsert({
    where: {
      userId_certificationId: {
        userId: session.user.id,
        certificationId: parsed.data.certificationId,
      },
    },
    update: {},
    create: {
      userId: session.user.id,
      certificationId: parsed.data.certificationId,
    },
  })

  return NextResponse.json(enrollment)
}
