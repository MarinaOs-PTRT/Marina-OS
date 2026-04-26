import React, { useEffect, useState } from 'react'
import './ThemeSwitcher.css'

/**
 * ThemeSwitcher — toggle chiaro/scuro per Marina OS.
 *
 * Comportamento:
 *  - Default al primo accesso: rispetta `prefers-color-scheme` del sistema.
 *  - Una volta cliccato, la scelta si salva in localStorage e prende il
 *    sopravvento sulle preferenze di sistema (l'utente decide).
 *  - Lo stato si applica al `<html>` come attributo `data-theme="light"|"dark"`.
 *    tokens.css interpreta questo attributo per swappare le variabili CSS.
 *
 * Posizione: in fondo alla Sidebar, sopra l'avatar utente.
 * Vedi memoria: design_system.md
 */

type Theme = 'light' | 'dark'
const STORAGE_KEY = 'marina-os-theme'

function readInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
  if (saved === 'light' || saved === 'dark') return saved
  // Default automatico: preferenze sistema operativo
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.setAttribute('data-theme', theme)
}

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>('light')

  // Applica al mount + reagisce a cambio sistema se utente non ha scelto
  useEffect(() => {
    const initial = readInitialTheme()
    setTheme(initial)
    applyTheme(initial)

    // Se l'utente NON ha mai scelto (niente in localStorage),
    // segui i cambi del sistema operativo in tempo reale.
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      if (localStorage.getItem(STORAGE_KEY)) return // utente ha già scelto
      const next: Theme = e.matches ? 'dark' : 'light'
      setTheme(next)
      applyTheme(next)
    }
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  const toggle = () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    applyTheme(next)
    localStorage.setItem(STORAGE_KEY, next)
  }

  return (
    <button
      type="button"
      className="theme-switcher"
      onClick={toggle}
      aria-label={theme === 'light' ? 'Passa al tema scuro' : 'Passa al tema chiaro'}
      title={theme === 'light' ? 'Tema chiaro · clicca per scuro' : 'Tema scuro · clicca per chiaro'}
    >
      <span className={`theme-switcher-track ${theme}`}>
        <span className="theme-switcher-thumb" />
      </span>
      <span className="theme-switcher-label">
        {theme === 'light' ? 'Tema chiaro' : 'Tema scuro'}
      </span>
    </button>
  )
}
