import React, { ReactNode, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGlobalState } from '../store/GlobalState'
import './TopBar.css'

interface TopBarProps {
  title: string
  subtitle?: string
  actions?: ReactNode
}

/**
 * TopBar — header pagina con titolo, sottotitolo, azioni custom e
 * campanella notifiche.
 *
 * NOTA (25 Apr 2026): rimosso il vecchio selettore "Tema Chiaro / Tema
 * Scuro / Tema Oltremare". Il tema è ora gestito esclusivamente da
 * `ThemeSwitcher` in fondo alla Sidebar (toggle chiaro/scuro con
 * persistenza in localStorage chiave `marina-os-theme`). Solo due temi
 * supportati. Vedi memoria: design_system.md
 *
 * Pulizia retrocompatibilità: al mount, se trovo la VECCHIA chiave
 * `marina-theme` con valore obsoleto (es. 'dark-blue'), la migro a
 * `marina-os-theme` mappando 'dark-blue' → 'dark', poi rimuovo la
 * vecchia chiave. Così gli utenti che avevano scelto il tema oltremare
 * non perdono la preferenza scuro.
 */
export function TopBar({ title, subtitle, actions }: TopBarProps) {
  const navigate = useNavigate()
  const { notifiche } = useGlobalState()

  // Badge live: conta solo le notifiche in stato 'nuova'
  const unreadCount = notifiche.filter(n => n.stato === 'nuova').length

  // Migrazione one-shot della vecchia chiave localStorage 'marina-theme'.
  useEffect(() => {
    const oldKey = 'marina-theme'
    const newKey = 'marina-os-theme'
    const old = localStorage.getItem(oldKey)
    if (!old) return
    if (!localStorage.getItem(newKey)) {
      // Mappa: light → light, dark|dark-blue → dark
      const migrated = old === 'dark' || old === 'dark-blue' ? 'dark' : 'light'
      localStorage.setItem(newKey, migrated)
    }
    localStorage.removeItem(oldKey)
  }, [])

  return (
    <header className="topbar">
      <div className="topbar-title">
        <h2>{title}</h2>
        {subtitle && <span className="subtitle">{subtitle}</span>}
      </div>

      <div className="topbar-actions">
        {actions}

        {/* Campanella Notifiche */}
        <div className="topbar-notification" onClick={() => navigate('/notifiche')} title="Centro Notifiche">
          <span className="bell-icon">🔔</span>
          {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
        </div>
      </div>
    </header>
  )
}
