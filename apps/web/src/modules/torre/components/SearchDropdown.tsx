import React, { useState, useEffect, useRef, useCallback } from 'react'
import { SearchSuggestion } from '../hooks/useTorreForm'
import './SearchDropdown.css'

/**
 * SearchDropdown — Campo di ricerca con dropdown autocomplete riusabile.
 *
 * Risolve due problemi storici della UI Torre:
 *
 *  - **Fix A (one-at-a-time)**: usa un coordinatore globale `activeDropdownId`.
 *    Ogni dropdown registra il proprio id quando si apre; se ne è già aperto un
 *    altro, lo chiude. Niente più due/tre/cinque liste sovrapposte sullo stesso
 *    schermo.
 *  - **Fix B (min-width)**: la lista usa `min-width: 240px` invece di
 *    `width: 100%` del campo. Così anche un campo stretto (es. "Posto" largo
 *    80px) mostra suggerimenti leggibili.
 *
 * NON gestisce la business logic (suggestions vengono dall'hook). Solo:
 *  - rendering del dropdown
 *  - stato visibilità (aperto/chiuso)
 *  - selezione corrente (highlight)
 *  - tastiera (frecce + Enter + Escape)
 *  - click-outside per chiudere
 */

// ════════════════════════════════════════════
// Coordinatore globale "un solo dropdown aperto alla volta" (Fix A).
// È fuori dal componente perché è uno stato CONDIVISO fra tutte le istanze.
// Ogni istanza si registra/deregistra; chi apre vince e chiude tutti gli altri.
// ════════════════════════════════════════════
type CloseFn = () => void
const _activeDropdowns = new Map<string, CloseFn>()

function _claimActive(id: string, closeOthers: CloseFn) {
  // Chiudi tutti gli altri prima di registrarsi.
  _activeDropdowns.forEach((fn, key) => {
    if (key !== id) fn()
  })
  _activeDropdowns.clear()
  _activeDropdowns.set(id, closeOthers)
}

function _releaseActive(id: string) {
  _activeDropdowns.delete(id)
}

// ════════════════════════════════════════════
// Props
// ════════════════════════════════════════════
export interface SearchDropdownProps {
  /** Identificativo univoco — serve al coordinatore "uno alla volta". */
  id: string
  /** Etichetta opzionale sopra il campo. Se omessa si usa solo il placeholder. */
  label?: string
  /** Placeholder dell'input. */
  placeholder?: string
  /** Valore corrente del campo (controlled). */
  value: string
  /** Callback quando l'utente digita. */
  onChange: (v: string) => void
  /** Lista di suggerimenti pronta dall'hook (già filtrata e tagliata). */
  suggestions: SearchSuggestion[]
  /** Callback quando l'utente seleziona un suggerimento (click o Enter). */
  onSelect: (s: SearchSuggestion) => void
  /** Tipo HTML dell'input. Default 'text'. */
  inputType?: 'text' | 'number'
  /** Classe CSS extra per il wrapper. */
  className?: string
  /** Disabilita l'input. */
  disabled?: boolean
}

export function SearchDropdown({
  id,
  label,
  placeholder = '',
  value,
  onChange,
  suggestions,
  onSelect,
  inputType = 'text',
  className = '',
  disabled = false
}: SearchDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // ────────────────────────────────────────────
  // Apertura coordinata (Fix A)
  // ────────────────────────────────────────────
  const openCoordinated = useCallback(() => {
    if (suggestions.length === 0) return
    setIsOpen(true)
    _claimActive(id, () => setIsOpen(false))
  }, [id, suggestions.length])

  const close = useCallback(() => {
    setIsOpen(false)
    _releaseActive(id)
  }, [id])

  // Reset indice quando cambiano i suggerimenti.
  useEffect(() => { setSelectedIdx(0) }, [suggestions])

  // Cleanup al smontaggio: se il dropdown era attivo, rilascia il claim.
  useEffect(() => {
    return () => { _releaseActive(id) }
  }, [id])

  // Click-outside: chiudi se il click è fuori dal wrapper.
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        close()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen, close])

  // ────────────────────────────────────────────
  // Tastiera
  // ────────────────────────────────────────────
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!isOpen) openCoordinated()
      setSelectedIdx(i => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      if (isOpen && suggestions[selectedIdx]) {
        e.preventDefault()
        handleSelect(suggestions[selectedIdx])
      }
    } else if (e.key === 'Escape') {
      close()
    }
  }

  const handleSelect = (s: SearchSuggestion) => {
    onSelect(s)
    close()
  }

  // ────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────
  return (
    <div className={`search-dropdown-wrapper ${className}`} ref={wrapperRef}>
      {label && <label className="search-dropdown-label">{label}</label>}
      <input
        type={inputType}
        className="search-dropdown-input"
        value={value}
        onChange={e => {
          onChange(e.target.value)
          if (e.target.value.length > 0) openCoordinated()
        }}
        onFocus={() => { if (value.length > 0) openCoordinated() }}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
      />
      {isOpen && suggestions.length > 0 && (
        <div className="search-dropdown-list">
          {suggestions.map((s, i) => (
            <div
              key={i}
              className={`search-dropdown-item ${i === selectedIdx ? 'selected' : ''}`}
              onClick={() => handleSelect(s)}
              onMouseEnter={() => setSelectedIdx(i)}
            >
              <span className="search-dropdown-item-label">{s.label}</span>
              <span className="search-dropdown-item-sublabel">{s.sublabel}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
