// src/components/layout/Sidebar.tsx
'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  GraduationCap,
  BarChart3,
  ClipboardCheck,
  TrendingUp,
  Award,
  LogOut,
} from 'lucide-react'

interface SidebarProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { href: '/dashboard/catalog', icon: GraduationCap, label: 'Certifications' },
  { href: '/dashboard/cert/pl-300', icon: BarChart3, label: 'PL-300 Power BI' },
  { href: '/dashboard/exam', icon: ClipboardCheck, label: 'Examen blanc' },
  { href: '/dashboard/progress', icon: TrendingUp, label: 'Progression' },
]

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email?.[0].toUpperCase() ?? '?'

  return (
    <nav style={{
      width: 224,
      background: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--sidebar-border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      minHeight: '100vh',
      position: 'sticky',
      top: 0,
      height: '100vh',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9, background: 'var(--ink)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Award size={16} color="#FFFFFF" strokeWidth={2.25} />
          </div>
          <div>
            <div className="font-display" style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.2, color: 'var(--text-primary)' }}>CertPrep</div>
            <div style={{ fontSize: 10.5, color: 'var(--sidebar-muted)', fontWeight: 500, marginTop: 1 }}>Espace formation</div>
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: 'var(--sidebar-border)', margin: '0 16px 8px' }} />

      {/* Navigation */}
      <div style={{ flex: 1, padding: '0 12px' }}>
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 11,
                padding: '9px 12px',
                borderRadius: 8,
                marginBottom: 2,
                background: isActive ? 'var(--blue-lt)' : 'transparent',
                color: isActive ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
                textDecoration: 'none',
                fontSize: 13.5,
                fontWeight: isActive ? 600 : 500,
                transition: 'background 0.12s ease, color 0.12s ease',
              }}
            >
              <Icon size={17} strokeWidth={2} style={{ flexShrink: 0, color: isActive ? 'var(--ink)' : 'var(--text-muted)' }} />
              {item.label}
            </Link>
          )
        })}
      </div>

      {/* User */}
      <div style={{ padding: '14px 16px', borderTop: '1px solid var(--sidebar-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10, padding: '8px 8px', borderRadius: 8, border: '1px solid var(--sidebar-border)' }}>
          {user.image ? (
            <img src={user.image} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
          ) : (
            <div style={{
              width: 32, height: 32, borderRadius: '50%', background: 'var(--blue-lt)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12.5, fontWeight: 700, color: 'var(--ink)', flexShrink: 0,
            }}>{initials}</div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.2, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.name ?? user.email}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>245 XP · Niveau 3</div>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 7,
            padding: '7px 10px', borderRadius: 7,
            border: '1px solid var(--border)', background: 'transparent',
            fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer',
            fontFamily: 'inherit', textAlign: 'left', fontWeight: 500,
          }}
        >
          <LogOut size={13} strokeWidth={2} />
          Se déconnecter
        </button>
      </div>
    </nav>
  )
}
