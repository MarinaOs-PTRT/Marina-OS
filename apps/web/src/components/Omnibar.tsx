import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGlobalState } from '../store/GlobalState'
import { BERTH_STATUS_COLOR, BERTH_STATUS_LABELS } from '@shared/constants'
import { Boat, Berth } from '@shared/types'
import './Omnibar.css'

type Suggestion = {
  type: 'boat' | 'berth' | 'new_transit'
  id: string | number
  title: string
  subtitle: string
  status: string
  isInside: boolean
  original?: Boat | Berth
  query?: string
}

interface OmnibarProps {
  onAction?: (action: string, data?: any) => void
}

export function Omnibar({ onAction }: OmnibarProps) {
  const { barche, posti } = useGlobalState()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

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
    barche.forEach(b => {
      if (b.nome.toLowerCase().includes(q) || b.matricola.toLowerCase().includes(q)) {
        const isInside = b.stato === 'occupato_socio' || b.stato === 'occupato_transito' || b.stato === 'occupato_affittuario'
        results.push({
          type: 'boat',
          id: b.id,
          title: b.nome,
          subtitle: `${b.matricola} · Posto: ${b.posto || 'Nessuno'}`,
          status: b.stato || 'libero',
          isInside,
          original: b
        })
      }
    })

    // Search berths (by id)
    posti.forEach(p => {
      if (p.id.toLowerCase().includes(q)) {
        const isInside = p.stato === 'occupato_socio' || p.stato === 'occupato_transito' || p.stato === 'occupato_affittuario'
        results.push({
          type: 'berth',
          id: p.id,
          title: `Posto ${p.id}`,
          subtitle: `${p.pontile} · ${p.categoria}`,
          status: p.stato,
          isInside,
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
    
    if (onAction) {
      if (suggestion.type === 'new_transit') {
        onAction('nuovo_transito', suggestion)
      } else {
        const action = suggestion.isInside ? 'uscita' : 'entrata'
        onAction(action, suggestion)
      }
      return
    }

    // Determine default action based on state (Fallback)
    const action = suggestion.isInside ? 'uscita' : 'entrata'
    
    // Navigate to unified movement page
    navigate(`/movimento?type=${suggestion.type}&id=${suggestion.id}&action=${action}`)
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
                {item.type === 'new_transit' ? (
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
