// src/app/dashboard/progress/ProgressClient.tsx
'use client'
import { Lightbulb } from 'lucide-react'

const DOMAIN_COLORS: Record<string, string> = {
  'DAX': '#185FA5',
  'Power Query': '#0F6E56',
  'Modélisation des données': '#534AB7',
  'Visualisation': '#BA7517',
  'Service & Déploiement': '#A32D2D',
}

interface ExamSession {
  id: string
  score: number
  passed: boolean
  completedAt: string
  certCode: string
  certColor: string
  totalQuestions: number
  timeSpentSec: number | null
}

interface DomainStat {
  domain: string
  total: number
  correct: number
  score: number
}

export default function ProgressClient({ examSessions, domainStats }: { examSessions: ExamSession[]; domainStats: DomainStat[] }) {
  const hasData = examSessions.length > 0

  // SVG chart des scores
  const chartW = 600
  const chartH = 120
  const pts = examSessions.slice(-10) // last 10

  function scoreToY(score: number) {
    return chartH - (score / 100) * chartH
  }

  const polyline = pts.map((s, i) => {
    const x = pts.length === 1 ? chartW / 2 : (i / (pts.length - 1)) * (chartW - 40) + 20
    const y = scoreToY(s.score)
    return `${x},${y}`
  }).join(' ')

  const avgScore = hasData ? Math.round(examSessions.reduce((sum, s) => sum + s.score, 0) / examSessions.length) : 0
  const bestScore = hasData ? Math.max(...examSessions.map(s => s.score)) : 0
  const passCount = examSessions.filter(s => s.passed).length

  const recommendations: string[] = []
  domainStats.forEach(d => {
    if (d.score < 65 && d.total >= 3) {
      recommendations.push(`Concentrez-vous sur ${d.domain} (${d.score}%) — domaine à renforcer`)
    }
  })
  if (recommendations.length === 0 && hasData) {
    recommendations.push('Bravo ! Tous vos domaines sont solides. Planifiez un examen blanc complet pour valider.')
  }

  return (
    <div style={{ padding: '20px 24px', maxWidth: 800 }}>
      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Progression & Statistiques</div>
      <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>Analyse détaillée de vos performances</div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 18 }}>
        {[
          { label: 'Examens passés', val: String(examSessions.length), color: '#185FA5' },
          { label: 'Score moyen', val: hasData ? avgScore + '%' : '—', color: avgScore >= 70 ? '#3B6D11' : '#A32D2D' },
          { label: 'Meilleur score', val: hasData ? bestScore + '%' : '—', color: '#0F6E56' },
          { label: 'Examens réussis', val: hasData ? `${passCount}/${examSessions.length}` : '—', color: '#534AB7' },
        ].map(m => (
          <div key={m.label} style={{ background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: m.color }}>{m.val}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Graphique scores */}
      <div style={{ background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '16px', marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Évolution des scores</div>
        {!hasData ? (
          <div style={{ textAlign: 'center', padding: '30px', fontSize: 13, color: 'var(--text-muted)' }}>
            Aucun examen encore passé. Lancez votre premier examen blanc !
          </div>
        ) : (
          <>
            <div style={{ position: 'relative', height: chartH + 20 }}>
              <svg width="100%" height={chartH + 20} viewBox={`0 0 ${chartW} ${chartH + 20}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                {/* Grid lines */}
                {[0, 25, 50, 70, 75, 100].map(v => (
                  <g key={v}>
                    <line x1="20" y1={scoreToY(v)} x2={chartW - 10} y2={scoreToY(v)}
                      stroke={v === 70 ? '#A32D2D' : 'var(--border)'}
                      strokeWidth={v === 70 ? 1.5 : 0.5}
                      strokeDasharray={v === 70 ? '5,4' : '0'} />
                    <text x="15" y={scoreToY(v) - 3} fontSize="9" fill={v === 70 ? '#A32D2D' : 'var(--text-muted)'} textAnchor="end">{v}%</text>
                  </g>
                ))}
                {/* Area fill */}
                {pts.length > 1 && (
                  <polygon
                    points={`20,${chartH} ${polyline} ${(pts.length - 1) / (pts.length - 1) * (chartW - 40) + 20},${chartH}`}
                    fill="rgba(24,95,165,0.07)"
                  />
                )}
                {/* Line */}
                {pts.length > 1 && (
                  <polyline points={polyline} fill="none" stroke="#185FA5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                )}
                {/* Dots */}
                {pts.map((s, i) => {
                  const x = pts.length === 1 ? chartW / 2 : (i / (pts.length - 1)) * (chartW - 40) + 20
                  const y = scoreToY(s.score)
                  return (
                    <g key={i}>
                      <circle cx={x} cy={y} r="5" fill={s.passed ? '#3B6D11' : '#A32D2D'} />
                      <text x={x} y={y - 9} fontSize="9" fill="#185FA5" textAnchor="middle" fontWeight="600">{s.score}%</text>
                    </g>
                  )
                })}
              </svg>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, paddingLeft: 20, paddingRight: 10 }}>
              {pts.map((s, i) => (
                <span key={i} style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  {new Date(s.completedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
              <span>● <span style={{ color: '#3B6D11' }}>Réussi</span></span>
              <span>● <span style={{ color: '#A32D2D' }}>Échoué</span></span>
              <span style={{ color: '#A32D2D' }}>— Seuil 70%</span>
            </div>
          </>
        )}
      </div>

      {/* Performance domaines */}
      {domainStats.length > 0 && (
        <div style={{ background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 14 }}>
          <div style={{ padding: '12px 16px', borderBottom: '0.5px solid var(--border)', fontSize: 13, fontWeight: 600 }}>Performance par domaine</div>
          {domainStats.map((d, i) => {
            const color = DOMAIN_COLORS[d.domain] ?? '#185FA5'
            const barColor = d.score >= 75 ? '#3B6D11' : d.score >= 60 ? '#185FA5' : '#A32D2D'
            return (
              <div key={d.domain} style={{ padding: '10px 16px', borderBottom: i < domainStats.length - 1 ? '0.5px solid var(--border)' : 'none', display: 'grid', gridTemplateColumns: '160px 1fr 44px 70px', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 500 }}>{d.domain}</span>
                <div style={{ height: 6, background: 'var(--surface-1)', borderRadius: 3 }}>
                  <div style={{ height: '100%', borderRadius: 3, background: barColor, width: d.score + '%', transition: 'width 0.5s' }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: barColor }}>{d.score}%</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }}>{d.correct}/{d.total} q.</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Recommandations */}
      {recommendations.length > 0 && (
        <div style={{ background: '#FAEEDA', border: '0.5px solid #BA7517', borderRadius: 10, padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#633806', marginBottom: 8 }}>
            <Lightbulb size={14} strokeWidth={1.9} />
            Recommandations personnalisées
          </div>
          <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {recommendations.slice(0, 3).map((r, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: '#412402' }}>
                <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#EF9F27', color: '#fff', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, fontWeight: 600 }}>{i + 1}</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
