// src/components/layout/Sidebar.tsx
'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

interface SidebarProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

const NAV_ITEMS = [
  { href: '/dashboard', icon: '▦', label: 'Tableau de bord' },
  { href: '/dashboard/catalog', icon: '🎓', label: 'Certifications' },
  { href: '/dashboard/cert/pl-300', icon: '📊', label: 'PL-300 Power BI' },
  { href: '/dashboard/exam', icon: '✏️', label: 'Examen blanc' },
  { href: '/dashboard/progress', icon: '📈', label: 'Progression' },
]

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email?.[0].toUpperCase() ?? '?'

  return (
    <nav style={{
      width: 220,
      background: 'var(--surface-2)',
      borderRight: '0.5px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      minHeight: '100vh',
      position: 'sticky',
      top: 0,
      height: '100vh',
    }}>
      {/* Logo */}
      <div style={{ padding: '16px 14px 12px', borderBottom: '0.5px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6, background: '#185FA5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14,
          }}>📊</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.2 }}>CertPrep Pro</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Espace formation</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, padding: '8px' }}>
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                padding: '7px 10px',
                borderRadius: 6,
                marginBottom: 2,
                background: isActive ? 'var(--blue-lt)' : 'transparent',
                color: isActive ? 'var(--blue-dk)' : 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: isActive ? 500 : 400,
                transition: 'background 0.1s, color 0.1s',
              }}
            >
              <span style={{ fontSize: 15, lineHeight: 1 }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </div>

      {/* User */}
      <div style={{ padding: '12px 14px', borderTop: '0.5px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          {user.image ? (
            <img src={user.image} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{
              width: 28, height: 28, borderRadius: '50%', background: '#534AB7',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 600, color: '#fff', flexShrink: 0,
            }}>{initials}</div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.name ?? user.email}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>245 XP • Niveau 3</div>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{
            width: '100%', padding: '5px 8px', borderRadius: 5,
            border: '0.5px solid var(--border)', background: 'transparent',
            fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer',
            fontFamily: 'inherit', textAlign: 'left',
          }}
        >
          Se déconnecter
        </button>
      </div>
    </nav>
  )
}
