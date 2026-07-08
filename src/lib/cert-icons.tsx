// src/lib/cert-icons.tsx
// Maps a Certification.icon key (stored in the DB) to a lucide-react icon.
// Replaces the previous emoji-as-logo approach with a consistent icon set.
import { BarChart3, Cloud, Server, ShieldCheck, Database, ClipboardList, Award, type LucideIcon } from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  'bar-chart-3': BarChart3,
  'cloud': Cloud,
  'server': Server,
  'shield-check': ShieldCheck,
  'database': Database,
  'clipboard-list': ClipboardList,
}

export function resolveCertIcon(key: string): LucideIcon {
  return ICON_MAP[key] ?? Award
}

interface CertIconProps {
  icon: string
  size?: number
  color?: string
  strokeWidth?: number
}

export function CertIcon({ icon, size = 18, color, strokeWidth = 1.9 }: CertIconProps) {
  const Icon = resolveCertIcon(icon)
  return <Icon size={size} color={color} strokeWidth={strokeWidth} />
}
