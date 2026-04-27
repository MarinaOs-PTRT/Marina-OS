import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
// @ts-ignore
import logoUrl from '../../assets/logo.png'
import './LoginPage.css'

// Foto del porto servita dalla cartella public (non importata via Vite).
// Per usarla: copia il file foto in  apps/web/public/marina-hero.jpg
// Se il file non c'è, l'area hero mostra il gradiente blu di fallback.
const MARINA_HERO_URL = '/marina-hero.jpg'

// Credenziali di test visibili in UI durante lo sviluppo.
// Da rimuovere (o nascondere dietro una ENV var) prima del deploy in produzione.
const HINT_USERS = [
  { label: 'Torre',         email: 'torre@marina.it',         password: 'torre123' },
  { label: 'Direzione',     email: 'direzione@marina.it',     password: 'direzione123' },
  { label: 'Ufficio',       email: 'ufficio@marina.it',       password: 'ufficio123' },
  { label: 'Manutenzione',  email: 'manutenzione@marina.it',  password: 'manutenzione123' },
  { label: 'Ormeggiatore',  email: 'ormeggiatore@marina.it',  password: 'ormeggiatore123' },
]

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [showHints, setShowHints] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Inserisci email e password')
      return
    }
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/', { replace: true })
    } catch (err: any) {
      setError(err.message || 'Errore di accesso')
    } finally {
      setLoading(false)
    }
  }

  const fillCredentials = (e: string, p: string) => {
    setEmail(e)
    setPassword(p)
    setShowHints(false)
    setError('')
  }

  return (
    <div className="login-page">
      <div className="login-card">

        {/* ── Hero: foto del porto ── */}
        <div
          className="login-hero"
          style={{ backgroundImage: `url(${MARINA_HERO_URL})` }}
          aria-hidden="true"
        >
          {/* Gradient overlay — testo leggibile sopra la foto */}
          <div className="login-hero-overlay" />

          {/* Logo sovrapposto alla foto */}
          <div className="login-hero-logo">
            <img src={logoUrl} alt="Marina OS" className="login-hero-logo-img" />
            <div className="login-hero-logo-text">
              <span className="login-hero-brand">MARINA OS</span>
              <span className="login-hero-sub">Porto Turistico Riva di Traiano</span>
            </div>
          </div>
        </div>

        {/* ── Form ── */}
        <div className="login-body">
          <h2 className="login-title">Accedi al sistema</h2>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="login-field">
              <label htmlFor="login-email" className="login-label">Email</label>
              <input
                id="login-email"
                type="email"
                className="login-input"
                placeholder="utente@marina.it"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                autoFocus
                autoComplete="username"
                disabled={loading}
              />
            </div>

            <div className="login-field">
              <label htmlFor="login-password" className="login-label">Password</label>
              <input
                id="login-password"
                type="password"
                className="login-input"
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                autoComplete="current-password"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? 'Accesso in corso...' : 'Accedi'}
            </button>
          </form>

          {/* ── Hint credenziali di test ── */}
          <div className="login-hints">
            <button
              type="button"
              className="login-hints-toggle"
              onClick={() => setShowHints(v => !v)}
            >
              {showHints ? 'Nascondi credenziali di test ↑' : 'Credenziali di test ↓'}
            </button>

            {showHints && (
              <div className="login-hints-list">
                {HINT_USERS.map(u => (
                  <button
                    key={u.email}
                    type="button"
                    className="login-hint-row"
                    onClick={() => fillCredentials(u.email, u.password)}
                  >
                    <span className="login-hint-role">{u.label}</span>
                    <span className="login-hint-email">{u.email}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
