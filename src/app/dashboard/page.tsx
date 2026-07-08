// src/app/dashboard/page.tsx
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { GraduationCap, BarChart3, PenLine, Flame } from 'lucide-react'
import { CertIcon } from '@/lib/cert-icons'

async function getDashboardData(userId: string) {
  const [user, enrollments, examSessions, totalAnswers] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.enrollment.findMany({
      where: { userId },
      include: {
        certification: { include: { modules: true } },
        moduleProgress: true,
      },
    }),
    prisma.examSession.findMany({
      where: { userId, status: 'completed' },
      orderBy: { completedAt: 'desc' },
      take: 5,
      include: { certification: true },
    }),
    prisma.questionAnswer.count({ where: { userId } }),
  ])

  // Per-domain stats
  const domainStats = await prisma.$queryRaw<Array<{ domain: string; total: bigint; correct: bigint }>>`
    SELECT q.domain,
           COUNT(*) as total,
           SUM(CASE WHEN qa."isCorrect" THEN 1 ELSE 0 END) as correct
    FROM "QuestionAnswer" qa
    JOIN "Question" q ON q.id = qa."questionId"
    WHERE qa."userId" = ${userId}
    GROUP BY q.domain
    ORDER BY total DESC
  `

  return { user, enrollments, examSessions, totalAnswers, domainStats }
}

const DOMAIN_COLORS: Record<string, string> = {
  'DAX': '#2563EB',
  'Power Query': '#334155',
  'Modélisation des données': '#64748B',
  'Visualisation': '#B45309',
  'Service & Déploiement': '#B91C1C',
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) return null

  const { user, enrollments, examSessions, totalAnswers, domainStats } = await getDashboardData(session.user.id)

  const avgScore = examSessions.length > 0
    ? Math.round(examSessions.reduce((s, e) => s + (e.score ?? 0), 0) / examSessions.length)
    : 0

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div style={{ padding: '20px 24px', maxWidth: 900 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div className="font-display" style={{ fontSize: 19, fontWeight: 500, marginBottom: 2 }}>
          Bonjour, {user?.name?.split(' ')[0] ?? 'vous'}
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: 13, textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: 5 }}>
          {today}
          {(user?.streakDays ?? 0) > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              · <Flame size={13} strokeWidth={1.9} color="var(--amber)" /> {user?.streakDays} jours de suite
            </span>
          )}
        </div>
      </div>

      {/* Métriques */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Certifications suivies', val: String(enrollments.length), Icon: GraduationCap, color: '#2563EB', bg: '#EFF6FF' },
          { label: 'Score moyen', val: avgScore ? avgScore + '%' : '—', Icon: BarChart3, color: '#334155', bg: '#F1F5F9' },
          { label: 'Questions répondues', val: String(totalAnswers || 0), Icon: PenLine, color: '#64748B', bg: '#F1F5F9' },
          { label: 'Streak actuel', val: `${user?.streakDays ?? 0} j`, Icon: Flame, color: '#B45309', bg: '#FFFBEB' },
        ].map(m => (
          <div key={m.label} style={{ background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <m.Icon size={15} strokeWidth={1.9} color={m.color} />
              </div>
            </div>
            <div className="font-display" style={{ fontSize: 22, fontWeight: 500, lineHeight: 1 }}>{m.val}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Certifications + Historique */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
        {/* Certifications en cours */}
        <div style={{ background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '14px 16px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Certifications en cours</div>
          {enrollments.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Aucune certification inscrite.</p>
          ) : (
            enrollments.map(enrollment => {
              const cert = enrollment.certification
              const progress = cert.modules.length > 0
                ? Math.round(enrollment.moduleProgress.filter(mp => mp.completedAt).length / cert.modules.length * 100)
                : 0
              return (
                <div key={enrollment.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <CertIcon icon={cert.icon} size={15} color="var(--text-secondary)" />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 500 }}>{cert.code}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{cert.name.slice(0, 24)}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 500, color: progress >= 70 ? '#334155' : '#2563EB' }}>{progress}%</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--surface-1)', borderRadius: 3 }}>
                    <div style={{ height: '100%', borderRadius: 3, background: progress >= 70 ? '#334155' : '#2563EB', width: progress + '%', transition: 'width 0.5s' }} />
                  </div>
                </div>
              )
            })
          )}
          <Link href="/dashboard/catalog" style={{ marginTop: 6, fontSize: 12, color: '#2563EB', textDecoration: 'none', display: 'inline-block' }}>
            Voir tout le catalogue →
          </Link>
        </div>

        {/* Historique examens */}
        <div style={{ background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '14px 16px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Derniers examens</div>
          {examSessions.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Aucun examen passé.</p>
          ) : (
            examSessions.slice(0, 3).map((session, i) => (
              <div key={session.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < 2 ? '0.5px solid var(--border)' : 'none' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{session.score}% • {session.totalQuestions} questions</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {session.completedAt ? new Date(session.completedAt).toLocaleDateString('fr-FR') : '—'} • {session.certification.code}
                  </div>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 10,
                  background: session.passed ? '#F0FDF4' : '#FEF2F2',
                  color: session.passed ? '#15803D' : '#B91C1C',
                }}>
                  {session.passed ? 'Réussi' : 'Échoué'}
                </span>
              </div>
            ))
          )}
          <Link href="/dashboard/exam" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            marginTop: 10, padding: '7px', borderRadius: 6,
            background: 'var(--ink)', color: 'var(--accent)', textDecoration: 'none',
            fontSize: 12, fontWeight: 500, textAlign: 'center',
          }}>
            <PenLine size={12} strokeWidth={2} />
            Lancer un examen blanc
          </Link>
        </div>
      </div>

      {/* Performance par domaine */}
      <div style={{ background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '14px 16px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Performance par domaine</div>
        {domainStats.length === 0 ? (
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Commencez un examen pour voir vos statistiques par domaine.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(domainStats.length, 5)}, 1fr)`, gap: 8 }}>
            {domainStats.map((d: any) => {
              const score = Number(d.total) > 0 ? Math.round(Number(d.correct) / Number(d.total) * 100) : 0
              const color = DOMAIN_COLORS[d.domain] ?? '#2563EB'
              const circumference = 2 * Math.PI * 19
              return (
                <div key={d.domain} style={{ textAlign: 'center' }}>
                  <div style={{ position: 'relative', margin: '0 auto 8px', width: 48, height: 48 }}>
                    <svg viewBox="0 0 48 48" style={{ width: 48, height: 48, transform: 'rotate(-90deg)' }}>
                      <circle cx="24" cy="24" r="19" fill="none" stroke="var(--border)" strokeWidth="4" />
                      <circle cx="24" cy="24" r="19" fill="none" stroke={color} strokeWidth="4"
                        strokeDasharray={`${score / 100 * circumference} ${circumference}`} strokeLinecap="round" />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>
                      {score}%
                    </div>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 500, lineHeight: 1.2 }}>{d.domain}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{Number(d.total)} q.</div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
