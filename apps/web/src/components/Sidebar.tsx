import React, { useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { MODULE_NAV, RUOLO_LABELS } from '@shared/constants'
import { useAuth } from '../context/AuthContext'
import { ThemeSwitcher } from './ThemeSwitcher'
// @ts-ignore
import logoUrl from '../assets/logo.png'
import './Sidebar.css'

/**
 * Sidebar — barra di navigazione fissa sul bordo sinistro.
 *
 * Design (25 Apr 2026):
 *  - Sfondo blu desaturato profondo (cross-tema, sempre scura).
 *  - Logo originale del Riva di Traiano su sfondo trasparente, lockup
 *    orizzontale con scritta "MARINA OS" a fianco. Niente riquadro bianco.
 *  - Voci raggruppate per ruolo: Operativo (Torre) + Direzione.
 *  - Ogni voce è visibile solo se l'utente loggato ha un ruolo
 *    incluso in `item.allowedRoles` (RBAC lato UI).
 *  - Voce attiva con fill blu porto pieno + testo bianco.
 *  - In fondo: ThemeSwitcher (toggle chiaro/scuro) + avatar + logout.
 *
 * Vedi memoria: design_system.md, ui_ingressi.md
 */

const ROLE_LABELS: Record<string, string> = {
  torre: 'Operativo',
  direzione: 'Direzione',
}
const ROLE_ORDER = ['torre', 'direzione'] as const

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  // Filtra MODULE_NAV per ruolo utente e raggruppa per gruppo visivo.
  // La Sidebar mostra solo le voci accessibili al ruolo loggato.
  const grouped = useMemo(() => {
    const map: Record<string, typeof MODULE_NAV[number][]> = {}
    for (const item of MODULE_NAV) {
      // Filtra per ruolo: se l'utente non è loggato o il suo ruolo
      // non è in allowedRoles, la voce non compare.
      if (user && !item.allowedRoles.includes(user.ruolo as any)) continue

      const r = item.role || 'torre'
      if (!map[r]) map[r] = []
      map[r].push(item)
    }
    return map
  }, [user])

  // Iniziali e label ruolo per il footer
  const iniziali = user?.iniziali ?? '?'
  const nomeUtente = user?.nome ?? 'Utente'
  const labelRuolo = user ? (RUOLO_LABELS[user.ruolo] ?? user.ruolo) : ''

  return (
    <aside className="sidebar">
      {/* ── Logo + wordmark ── */}
      <div className="sidebar-logo">
        <img className="sidebar-logo-img" src={logoUrl} alt="Porto Turistico Riva di Traiano" />
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-brand">MARINA OS</span>
          <span className="sidebar-logo-sub">Riva di Traiano</span>
        </div>
      </div>

      {/* ── Nav (filtrata per ruolo) ── */}
      <nav className="sidebar-nav">
        {ROLE_ORDER.map(role => {
          const items = grouped[role]
          if (!items || items.length === 0) return null
          return (
            <div key={role} className="sidebar-group">
              <div className="sidebar-group-label">{ROLE_LABELS[role] || role}</div>
              {items.map(item => {
                const active =
                  location.pathname === item.path ||
                  location.pathname.startsWith(item.path + '/')
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`sidebar-nav-item ${active ? 'active' : ''}`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
          )
        })}
      </nav>

      {/* ── Footer: switcher + utente + logout ── */}
      <div className="sidebar-footer">
        <ThemeSwitcher />

        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{iniziali}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{nomeUtente}</div>
            <div className="sidebar-user-role">{labelRuolo}</div>
          </div>
          <button
            className="sidebar-logout-btn"
            onClick={handleLogout}
            title="Esci dall'applicazione"
            aria-label="Logout"
          >
            ⎋
          </button>
        </div>
      </div>
    </aside>
  )
}
