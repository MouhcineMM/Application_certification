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
      background: '#000000',
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 380,
        background: '#000000',
        borderRadius: 14,
        border: '1px solid #333333',
        padding: '32px 28px',
      }}>
        {/* TEST VISUEL — si tu vois cette page tout en noir, le déploiement fonctionne */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: '#FFFFFF', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center',
            marginBottom: 12,
          }}>
            <Award size={22} color="#000000" strokeWidth={2} />
          </div>
          <div className="font-display" style={{ fontSize: 20, fontWeight: 500, marginBottom: 4, color: '#FFFFFF' }}>CertPrep — TEST NOIR</div>
          <div style={{ fontSize: 13, color: '#FFFFFF' }}>Si tu vois cette page en noir, le déploiement a fonctionné.</div>
        </div>

        {error && (
          <div style={{
            background: '#330000', border: '0.5px solid #ff0000',
            borderRadius: 6, padding: '8px 12px', fontSize: 12,
            color: '#ff6666', marginBottom: 16,
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 5, color: '#FFFFFF' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: '100%', padding: '8px 10px', borderRadius: 6,
                border: '0.5px solid #333333', fontSize: 13,
                background: '#111111', color: '#FFFFFF',
                outline: 'none', fontFamily: 'inherit',
              }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 5, color: '#FFFFFF' }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: '100%', padding: '8px 10px', borderRadius: 6,
                border: '0.5px solid #333333', fontSize: 13,
                background: '#111111', color: '#FFFFFF',
                outline: 'none', fontFamily: 'inherit',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '9px', borderRadius: 7,
              background: '#FFFFFF',
              color: '#000000',
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
              transition: 'background 0.15s',
            }}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div style={{
          marginTop: 20, padding: '12px', background: '#111111',
          borderRadius: 6, fontSize: 11, color: '#FFFFFF', textAlign: 'center',
        }}>
          <span style={{ fontWeight: 500, color: '#FFFFFF' }}>Compte démo</span><br />
          <span className="font-mono">demo@certprep.fr / password123</span>
        </div>
      </div>
    </div>
  )
}
