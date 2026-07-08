// src/app/dashboard/catalog/CatalogClient.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, BookOpen, Target } from 'lucide-react'
import { CertIcon } from '@/lib/cert-icons'

interface Cert {
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
  progress: number
  _count: { modules: number; questions: number; examSessions: number }
}

export default function CatalogClient({ certifications, userId }: { certifications: Cert[]; userId: string }) {
  const router = useRouter()
  const [filter, setFilter] = useState('Tous')
  const [enrolling, setEnrolling] = useState<string | null>(null)

  const categories = ['Tous', ...Array.from(new Set(certifications.map(c => c.category))).sort()]
  const filtered = filter === 'Tous' ? certifications : certifications.filter(c => c.category === filter)

  async function handleEnroll(certId: string) {
    setEnrolling(certId)
    try {
      await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certificationId: certId }),
      })
      router.refresh()
    } finally {
      setEnrolling(null)
    }
  }

  const levelColor = (level: string) => {
    if (level === 'Débutant') return { bg: '#F0FDF4', color: '#15803D' }
    if (level === 'Intermédiaire') return { bg: '#EFF6FF', color: '#1D4ED8' }
    return { bg: '#FEF2F2', color: '#B91C1C' }
  }

  return (
    <div style={{ padding: '20px 24px' }}>
      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Catalogue des certifications</div>
      <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>
        {certifications.length} certifications disponibles
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            style={{
              padding: '4px 12px', borderRadius: 12, border: '0.5px solid',
              fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
              background: filter === cat ? 'var(--ink)' : 'transparent',
              color: filter === cat ? 'var(--accent)' : 'var(--text-secondary)',
              borderColor: filter === cat ? 'var(--ink)' : 'var(--border)',
              transition: 'all 0.15s',
            }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Grille */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 12 }}>
        {filtered.map(cert => {
          const lc = levelColor(cert.level)
          return (
            <div key={cert.id}
              onClick={() => cert.code === 'PL-300' && router.push('/dashboard/cert/pl-300')}
              style={{
                background: 'var(--surface-2)', border: '0.5px solid var(--border)',
                borderRadius: 14, padding: '16px', cursor: cert.code === 'PL-300' ? 'pointer' : 'default',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => {
                if (cert.code === 'PL-300') {
                  (e.currentTarget as HTMLElement).style.borderColor = '#2563EB'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(37,99,235,0.1)'
                }
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: cert.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CertIcon icon={cert.icon} size={18} color={cert.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: cert.color }}>{cert.code}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cert.provider}</div>
                  </div>
                </div>
                <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 10, background: lc.bg, color: lc.color, fontWeight: 500 }}>
                  {cert.level}
                </span>
              </div>

              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, lineHeight: 1.3 }}>{cert.name}</div>

              <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Clock size={12} strokeWidth={1.9} />{cert.durationHours}h</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><BookOpen size={12} strokeWidth={1.9} />{cert._count.modules} modules</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Target size={12} strokeWidth={1.9} />{cert.passScore}% seuil</span>
              </div>

              {cert.enrolled ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Progression</span>
                    <span style={{ fontWeight: 500 }}>{cert.progress}%</span>
                  </div>
                  <div style={{ height: 3, background: 'var(--surface-1)', borderRadius: 2 }}>
                    <div style={{ height: '100%', borderRadius: 2, background: cert.color, width: cert.progress + '%', transition: 'width 0.5s' }} />
                  </div>
                </>
              ) : (
                <button
                  onClick={e => { e.stopPropagation(); handleEnroll(cert.id) }}
                  disabled={enrolling === cert.id}
                  style={{
                    width: '100%', padding: '6px', borderRadius: 6,
                    background: enrolling === cert.id ? 'var(--border)' : cert.color,
                    color: '#fff', border: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: 500, fontFamily: 'inherit',
                    transition: 'background 0.15s',
                  }}
                >
                  {enrolling === cert.id ? 'Inscription...' : 'S\'inscrire'}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
