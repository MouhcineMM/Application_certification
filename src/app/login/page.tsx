// src/app/login/page.tsx
'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Award } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('demo@certprep.fr')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (res?.error) {
      setError('Email ou mot de passe incorrect')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--surface-0)',
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 380,
        background: 'var(--surface-2)',
        borderRadius: 14,
        border: '0.5px solid var(--border)',
        padding: '32px 28px',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'var(--ink)', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center',
            marginBottom: 12,
          }}>
            <Award size={22} color="var(--accent)" strokeWidth={2} />
          </div>
          <div className="font-display" style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>CertPrep</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Connectez-vous à votre espace formation</div>
        </div>

        {error && (
          <div style={{
            background: 'var(--red-lt)', border: '0.5px solid var(--red)',
            borderRadius: 6, padding: '8px 12px', fontSize: 12,
            color: 'var(--red)', marginBottom: 16,
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 5, color: 'var(--text-secondary)' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: '100%', padding: '8px 10px', borderRadius: 6,
                border: '0.5px solid var(--border)', fontSize: 13,
                background: 'var(--surface-1)', color: 'var(--text-primary)',
                outline: 'none', fontFamily: 'inherit',
              }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 5, color: 'var(--text-secondary)' }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: '100%', padding: '8px 10px', borderRadius: 6,
                border: '0.5px solid var(--border)', fontSize: 13,
                background: 'var(--surface-1)', color: 'var(--text-primary)',
                outline: 'none', fontFamily: 'inherit',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '9px', borderRadius: 7,
              background: loading ? 'var(--border)' : 'var(--ink)',
              color: loading ? 'var(--text-muted)' : 'var(--accent)',
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
              transition: 'background 0.15s',
            }}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div style={{
          marginTop: 20, padding: '12px', background: 'var(--surface-1)',
          borderRadius: 6, fontSize: 11, color: 'var(--text-secondary)', textAlign: 'center',
        }}>
          <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Compte démo</span><br />
          <span className="font-mono">demo@certprep.fr / password123</span>
        </div>
      </div>
    </div>
  )
}
