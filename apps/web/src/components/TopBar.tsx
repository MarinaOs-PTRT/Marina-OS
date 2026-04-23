import React, { ReactNode, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGlobalState } from '../store/GlobalState'
import './TopBar.css'

interface TopBarProps {
  title: string
  subtitle?: string
  actions?: ReactNode
}

export function TopBar({ title, subtitle, actions }: TopBarProps) {
  const [theme, setTheme] = useState<'light' | 'dark' | 'dark-blue'>('light')
  const navigate = useNavigate()
  const { notifiche } = useGlobalState()
  
  // Badge live: conta solo le notifiche in stato 'nuova'
  const unreadCount = notifiche.filter(n => n.stato === 'nuova').length

  useEffect(() => {
    const savedTheme = (localStorage.getItem('marina-theme') as any) || 'light'
    if (savedTheme === 'dark' || savedTheme === 'dark-blue') {
      document.documentElement.setAttribute('data-theme', savedTheme)
      setTheme(savedTheme)
    }
  }, [])

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextTheme = e.target.value as 'light' | 'dark' | 'dark-blue'
    if (nextTheme === 'light') {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.setAttribute('data-theme', nextTheme)
    }
    
    localStorage.setItem('marina-theme', nextTheme)
    setTheme(nextTheme)
  }

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

        {/* Selettore Tema sulla estrema destra */}
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '16px', paddingLeft: '16px', borderLeft: '1px solid rgba(255,255,255,0.2)' }}>
          <select 
            className="topbar-theme-select"
            value={theme} 
            onChange={handleThemeChange}
          >
            <option value="light">☀️ Tema Chiaro</option>
            <option value="dark">🌙 Tema Scuro</option>
            <option value="dark-blue">🌊 Tema Oltremare</option>
          </select>
        </div>
      </div>
    </header>
  )
}
