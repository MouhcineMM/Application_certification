// src/app/dashboard/cert/[code]/page.tsx
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function CertDetailPage({ params }: { params: { code: string } }) {
  const session = await auth()
  if (!session?.user?.id) return null

  // URL slug is like "pl-300" -> DB code is "PL-300"
  const certCode = params.code.toUpperCase()

  const cert = await prisma.certification.findUnique({
    where: { code: certCode },
    include: {
      modules: { orderBy: { order: 'asc' } },
      _count: { select: { questions: true } },
    },
  })

  if (!cert) notFound()

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_certificationId: { userId: session.user.id, certificationId: cert.id } },
    include: { moduleProgress: true },
  })

  const completedModuleIds = new Set(
    enrollment?.moduleProgress.filter(mp => mp.completedAt).map(mp => mp.moduleId) ?? []
  )

  const progress = cert.modules.length > 0
    ? Math.round(completedModuleIds.size / cert.modules.length * 100)
    : 0

  const examSessions = await prisma.examSession.findMany({
    where: { userId: session.user.id, certificationId: cert.id, status: 'completed' },
    orderBy: { completedAt: 'desc' },
    take: 5,
  })

  const bestScore = examSessions.length > 0
    ? Math.max(...examSessions.map(s => s.score ?? 0))
    : null

  return (
    <div style={{ padding: '20px 24px', maxWidth: 860 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: cert.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
          {cert.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 600 }}>{cert.code} — {cert.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {cert.provider} • {cert.level} • {cert.durationHours}h estimées
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/dashboard/exam" style={{
            padding: '7px 14px', borderRadius: 6, background: cert.color,
            color: '#fff', textDecoration: 'none', fontSize: 12, fontWeight: 500,
          }}>
            ✏️ Examen blanc
          </Link>
        </div>
      </div>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Progression', val: progress + '%', color: cert.color },
          { label: 'Modules', val: `${completedModuleIds.size}/${cert.modules.length}`, color: '#534AB7' },
          { label: 'Questions', val: String(cert._count.questions), color: '#0F6E56' },
          { label: 'Meilleur score', val: bestScore !== null ? bestScore + '%' : '—', color: bestScore && bestScore >= cert.passScore ? '#3B6D11' : '#BA7517' },
        ].map(m => (
          <div key={m.label} style={{ background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 600, color: m.color }}>{m.val}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{m.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Modules */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Programme de formation</div>
          <div style={{ background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            {cert.modules.map((mod, i) => {
              const done = completedModuleIds.has(mod.id)
              return (
                <div key={mod.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                  borderBottom: i < cert.modules.length - 1 ? '0.5px solid var(--border)' : 'none',
                  background: done ? '#F8FCF4' : 'transparent',
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: done ? '#EAF3DE' : 'var(--surface-1)',
                    border: '0.5px solid ' + (done ? '#3B6D11' : 'var(--border)'),
                    fontSize: 11, fontWeight: 600, color: done ? '#3B6D11' : 'var(--text-muted)',
                  }}>
                    {done ? '✓' : mod.order}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: done ? '#3B6D11' : 'var(--text-primary)' }}>{mod.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{mod.durationMin} min</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Historique examens + Info */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Historique des examens</div>
          <div style={{ background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 14 }}>
            {examSessions.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                Aucun examen passé encore.<br />
                <Link href="/dashboard/exam" style={{ color: cert.color }}>Commencer un examen →</Link>
              </div>
            ) : (
              examSessions.map((s, i) => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: i < examSessions.length - 1 ? '0.5px solid var(--border)' : 'none' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>{s.score}% • {s.totalQuestions} q.</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {s.completedAt ? new Date(s.completedAt).toLocaleDateString('fr-FR') : '—'}
                      {s.timeSpentSec ? ` • ${Math.floor(s.timeSpentSec / 60)}m` : ''}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 10, background: s.passed ? '#EAF3DE' : '#FCEBEB', color: s.passed ? '#3B6D11' : '#A32D2D' }}>
                    {s.passed ? 'Réussi' : 'Échoué'}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Info certification */}
          {cert.description && (
            <div style={{ background: 'var(--blue-lt)', border: '0.5px solid #c0d8f0', borderRadius: 10, padding: '14px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#0C447C', marginBottom: 6 }}>À propos de cette certification</div>
              <p style={{ fontSize: 12, color: '#1a3a5c', lineHeight: 1.6 }}>{cert.description}</p>
              <div style={{ marginTop: 10, fontSize: 11, color: '#0C447C' }}>
                ✅ Seuil de réussite : {cert.passScore}%
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
