import React, { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { MODULE_NAV } from '@shared/constants'
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
 *  - Voce attiva con fill blu porto pieno + testo bianco.
 *  - In fondo: ThemeSwitcher (toggle chiaro/scuro) + avatar utente.
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

  // Raggruppa le voci per ruolo mantenendo l'ordine originale.
  const grouped = useMemo(() => {
    const map: Record<string, typeof MODULE_NAV[number][]> = {}
    for (const item of MODULE_NAV) {
      const r = item.role || 'torre'
      if (!map[r]) map[r] = []
      map[r].push(item)
    }
    return map
  }, [])

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

      {/* ── Nav ── */}
      <nav className="sidebar-nav">
        {ROLE_ORDER.map(role => {
          const items = grouped[role]
          if (!items || items.length === 0) return null
          return (
            <div key={role} className="sidebar-group">
              <div className="sidebar-group-label">{ROLE_LABELS[role] || role}</div>
              {items.map(item => {
                const active = location.pathname === item.path ||
                  (location.pathname.startsWith(item.path + '/'))
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

      {/* ── Footer: switcher + utente ── */}
      <div className="sidebar-footer">
        <ThemeSwitcher />

        <div className="sidebar-user">
          <div className="sidebar-user-avatar">SA</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">Sara Ardizzone</div>
            <div className="sidebar-user-role">Operatore Torre</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
