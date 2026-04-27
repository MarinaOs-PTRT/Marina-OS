import React, { useState, useEffect, useRef } from 'react'
import { useGlobalState } from '../store/GlobalState'
// v3: BERTH_VISUAL_* non usato qui (lo stato è solo un dato passato avanti
// nel field `status` della suggestion). Mantengo l'import commentato per
// memoria — se in futuro vorremo colorare il chip nell'Omnibar, basterà
// reimportare BERTH_VISUAL_HEX e usarlo con statoVisivo.
// import { BERTH_VISUAL_HEX, BERTH_VISUAL_LABELS } from '@shared/constants'
import { Boat, Berth } from '@shared/types'
import './Omnibar.css'

type Suggestion = {
  type: 'boat' | 'berth' | 'new_transit'
  id: string | number
  title: string
  subtitle: string
  status: string
  isInside: boolean
  needsRegistration: boolean
  original?: Boat | Berth
  query?: string
}

interface OmnibarProps {
  onAction?: (action: string, data?: any) => void
}

export function Omnibar({ onAction }: OmnibarProps) {
  const { barche, posti, getStatoVisivoBerth, postoDellaBarca } = useGlobalState()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Handle Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search logic
  useEffect(() => {
    if (query.trim().length === 0) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    const q = query.toLowerCase()
    const results: Suggestion[] = []

    // Search boats (by name or matricola)
    // v3 (27 Apr 2026): lo stato visivo della barca = stato visivo del berth
    // su cui ha uno Stay aperto. Se non ha Stay → "fuori dal porto".
    barche.forEach(b => {
      if (b.nome.toLowerCase().includes(q) || b.matricola.toLowerCase().includes(q)) {
        const berthCorrente = postoDellaBarca(b.id) || b.posto
        const statoVisivo = berthCorrente ? getStatoVisivoBerth(berthCorrente) : 'libero'
        const isInside = statoVisivo === 'socio_presente' || statoVisivo === 'transito' ||
                         statoVisivo === 'affittuario_su_socio' || statoVisivo === 'socio_su_altro_posto' ||
                         statoVisivo === 'bunker'
        const needsReg = statoVisivo === 'transito' && !b.registrazioneCompleta
        results.push({
          type: 'boat',
          id: b.id,
          title: b.nome,
          subtitle: `${b.matricola} · Posto: ${berthCorrente || 'Nessuno'}`,
          status: statoVisivo,
          isInside,
          needsRegistration: needsReg,
          original: b
        })
      }
    })

    // Search berths (by id)
    posti.forEach(p => {
      if (p.id.toLowerCase().includes(q)) {
        const statoVisivo = getStatoVisivoBerth(p.id)
        const isInside = statoVisivo === 'socio_presente' || statoVisivo === 'transito' ||
                         statoVisivo === 'affittuario_su_socio' || statoVisivo === 'socio_su_altro_posto' ||
                         statoVisivo === 'bunker'
        results.push({
          type: 'berth',
          id: p.id,
          title: `Posto ${p.id}`,
          subtitle: `${p.pontile} · ${p.categoria}`,
          status: statoVisivo,
          isInside,
          needsRegistration: false,
          original: p
        })
      }
    })

    // Always offer "Nuovo Transito" if we typed something
    if (query.trim().length > 0) {
      results.push({
        type: 'new_transit',
        id: 'new',
        title: `➕ Nuovo Transito: "${query}"`,
        subtitle: 'Registra una nuova imbarcazione non censita',
        status: 'libero',
        isInside: false,
        needsRegistration: false,
        query: query
      })
    }

    setSuggestions(results)
    setSelectedIndex(0)
    setIsOpen(true)
  }, [query])

  const handleSelect = (suggestion: Suggestion) => {
    setIsOpen(false)
    setQuery('')

    // L'Omnibar è uno strumento di RICERCA a 3 canali (nome/matricola/posto).
    // Non produce azioni di sua iniziativa: notifica il parent via onAction
    // e si ferma lì. Se nessun parent gestisce il risultato, la selezione
    // chiude semplicemente il dropdown senza navigare da nessuna parte.
    if (!onAction) return

    if (suggestion.type === 'new_transit') {
      onAction('nuovo_transito', suggestion)
    } else {
      const action = suggestion.isInside ? 'uscita' : 'entrata'
      onAction(action, suggestion)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (suggestions[selectedIndex]) {
        handleSelect(suggestions[selectedIndex])
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div className="omnibar-wrapper" ref={wrapperRef}>
      <div className="omnibar-input-container">
        <span className="omnibar-icon">🔍</span>
        <input
          ref={inputRef}
          type="text"
          className="omnibar-input"
          placeholder="Cerca barca, matricola o posto (Ctrl+K)..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (query.length > 0) setIsOpen(true) }}
        />
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="omnibar-dropdown">
          <div className="omnibar-dropdown-title">Suggerimenti ({suggestions.length})</div>
          {suggestions.map((item, index) => (
            <div
              key={`${item.type}-${item.id}`}
              className={`omnibar-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleSelect(item)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="omnibar-item-icon">
                {item.type === 'boat' ? '⛵' : item.type === 'new_transit' ? '✨' : '⚓'}
              </div>
              <div className="omnibar-item-content">
                <div className="omnibar-item-title">{item.title}</div>
                <div className="omnibar-item-subtitle">{item.subtitle}</div>
              </div>
              <div className="omnibar-item-action">
                {item.needsRegistration ? (
                  <span className="omnibar-action-pill pill-red">⚠ Da completare</span>
                ) : item.type === 'new_transit' ? (
                  <span className="omnibar-action-pill pill-green">Registra Transito</span>
                ) : item.isInside ? (
                  <span className="omnibar-action-pill pill-amber">Registra Uscita ↓</span>
                ) : (
                  <span className="omnibar-action-pill pill-green">Registra Entrata ↑</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
