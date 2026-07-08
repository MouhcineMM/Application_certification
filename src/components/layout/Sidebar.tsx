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
      width: 220,
      background: 'var(--sidebar-bg)',
      borderRight: '0.5px solid var(--sidebar-border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      minHeight: '100vh',
      position: 'sticky',
      top: 0,
      height: '100vh',
    }}>
      {/* Logo */}
      <div style={{ padding: '16px 14px 12px', borderBottom: '0.5px solid var(--sidebar-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 6, background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Award size={15} color="var(--sidebar-bg)" strokeWidth={2.25} />
          </div>
          <div>
            <div className="font-display" style={{ fontWeight: 500, fontSize: 13, lineHeight: 1.2, color: '#F2F2F0', letterSpacing: '0.1px' }}>CertPrep</div>
            <div style={{ fontSize: 10.5, color: 'var(--sidebar-muted)' }}>Espace formation</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, padding: '8px' }}>
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
                gap: 10,
                padding: '7px 10px',
                borderRadius: 6,
                marginBottom: 2,
                background: isActive ? 'rgba(74, 222, 222, 0.12)' : 'transparent',
                color: isActive ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: isActive ? 500 : 400,
                transition: 'background 0.1s, color 0.1s',
              }}
            >
              <Icon size={16} strokeWidth={1.75} style={{ flexShrink: 0 }} />
              {item.label}
            </Link>
          )
        })}
      </div>

      {/* User */}
      <div style={{ padding: '12px 14px', borderTop: '0.5px solid var(--sidebar-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          {user.image ? (
            <img src={user.image} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{
              width: 28, height: 28, borderRadius: '50%', background: '#26215C',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 600, color: '#7F77DD', flexShrink: 0,
            }}>{initials}</div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.2, color: '#F2F2F0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.name ?? user.email}
            </div>
            <div className="font-mono" style={{ fontSize: 10.5, color: 'var(--accent)', marginTop: 2 }}>245 XP · Niveau 3</div>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 8px', borderRadius: 5,
            border: '0.5px solid var(--sidebar-border)', background: 'transparent',
            fontSize: 11, color: 'var(--sidebar-muted)', cursor: 'pointer',
            fontFamily: 'inherit', textAlign: 'left',
          }}
        >
          <LogOut size={12} strokeWidth={1.75} />
          Se déconnecter
        </button>
      </div>
    </nav>
  )
}
