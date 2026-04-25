import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Berth, Boat } from '@shared/types'
import { BERTH_STATUS_LABELS, BERTH_STATUS_HEX } from '@shared/constants'
import { useTorreForm, SearchSuggestion } from '../../torre/hooks/useTorreForm'
import './QuickMovementPanel.css'

/**
 * QuickMovementPanel — Pannello di registrazione movimenti nella sidebar Dashboard.
 *
 * NOTA POST-REFACTOR (Apr 2026): tutta la business logic è stata estratta in
 * useTorreForm() per essere condivisa con la TorrePage (pagina dedicata
 * full-screen). Qui restano solo:
 *   - Lo stato dei dropdown (visible/idx/ref) — pura presentazione.
 *   - Il keyboard handler — pura presentazione.
 *   - Il render — pura presentazione.
 *
 * Niente più useState per i campi del form, niente più useMemo per i suggerimenti,
 * niente più handler delle azioni: tutto viene dal hook useTorreForm. In questo
 * modo TorrePage e QuickMovementPanel restano allineati senza divergenze.
 */
export function QuickMovementPanel() {
  // ════════════════════════════════════════════
  // Business logic (condivisa con TorrePage)
  // ════════════════════════════════════════════
  const form = useTorreForm()
  const {
    nome, setNome, targa, setTarga, lunghezza, setLunghezza,
    pescaggio, setPescaggio, posto, setPosto,
    tipologia, setTipologia, tipologiaLocked,
    panelMode, setPanelMode, postoOrigine, setPostoOrigine,
    postoDestinazione, setPostoDestinazione,
    showConfirmPopup, setShowConfirmPopup, confirmMessage, confirmAction,
    showWarning, setShowWarning, warningMessage,
    errorMessage, authMissingModal, setAuthMissingModal,
    nomeSuggestions, targaSuggestions, postoSuggestions,
    origineSuggestions, destinazioneSuggestions,
    destinazioneBerth, dimensionWarnings, suggestedBerths,
    fillFromBoat, fillFromBerth,
    handleClear, handleEntrata, handleUscitaTemporanea, handleUscitaDefinitiva,
    handleSpostamento, handleCantiere, handleBunker, handleRientro,
  } = form

  // ════════════════════════════════════════════
  // UI-only state — dropdown visibility + ref + selected index
  // ════════════════════════════════════════════
  const [showNomeDropdown, setShowNomeDropdown] = useState(false)
  const [showTargaDropdown, setShowTargaDropdown] = useState(false)
  const [showPostoDropdown, setShowPostoDropdown] = useState(false)
  const [showOrigineDropdown, setShowOrigineDropdown] = useState(false)
  const [showDestinazioneDropdown, setShowDestinazioneDropdown] = useState(false)
  const [selectedNomeIdx, setSelectedNomeIdx] = useState(0)
  const [selectedTargaIdx, setSelectedTargaIdx] = useState(0)
  const [selectedPostoIdx, setSelectedPostoIdx] = useState(0)
  const [selectedOrigineIdx, setSelectedOrigineIdx] = useState(0)
  const [selectedDestinazioneIdx, setSelectedDestinazioneIdx] = useState(0)
  const nomeRef = useRef<HTMLDivElement>(null)
  const targaRef = useRef<HTMLDivElement>(null)
  const postoRef = useRef<HTMLDivElement>(null)
  const origineRef = useRef<HTMLDivElement>(null)
  const destinazioneRef = useRef<HTMLDivElement>(null)

  // ════════════════════════════════════════════
  // UI EFFECTS — reset indici e click-outside (presentation only)
  // ════════════════════════════════════════════

  // Reset indici quando cambiano i suggerimenti
  useEffect(() => { setSelectedNomeIdx(0) }, [nomeSuggestions])
  useEffect(() => { setSelectedTargaIdx(0) }, [targaSuggestions])
  useEffect(() => { setSelectedPostoIdx(0) }, [postoSuggestions])
  useEffect(() => { setSelectedOrigineIdx(0) }, [origineSuggestions])
  useEffect(() => { setSelectedDestinazioneIdx(0) }, [destinazioneSuggestions])

  // Chiudi dropdown cliccando fuori
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (nomeRef.current && !nomeRef.current.contains(e.target as Node)) setShowNomeDropdown(false)
      if (targaRef.current && !targaRef.current.contains(e.target as Node)) setShowTargaDropdown(false)
      if (postoRef.current && !postoRef.current.contains(e.target as Node)) setShowPostoDropdown(false)
      if (origineRef.current && !origineRef.current.contains(e.target as Node)) setShowOrigineDropdown(false)
      if (destinazioneRef.current && !destinazioneRef.current.contains(e.target as Node)) setShowDestinazioneDropdown(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ════════════════════════════════════════════
  // UI WRAPPERS — chiamano hook autofill + chiudono dropdown
  // ════════════════════════════════════════════
  const onSelectBoat = (b: Boat) => {
    fillFromBoat(b)
    setShowNomeDropdown(false)
    setShowTargaDropdown(false)
    setShowPostoDropdown(false)
  }

  const onSelectBerth = (p: Berth) => {
    fillFromBerth(p)
    setShowPostoDropdown(false)
  }

  // ── Keyboard handler per dropdown (UI only) ──
  const makeKeyHandler = (
    suggestions: SearchSuggestion[],
    selectedIdx: number,
    setSelectedIdx: (n: number) => void,
    onSelect: (s: SearchSuggestion) => void,
    setShowDropdown: (b: boolean) => void
  ) => (e: React.KeyboardEvent) => {
    if (suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIdx(Math.min(selectedIdx + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx(Math.max(selectedIdx - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (suggestions[selectedIdx]) onSelect(suggestions[selectedIdx])
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
    }
  }

  // ════════════════════════════════════════════
  // RENDER HELPER: dropdown di ricerca
  // ════════════════════════════════════════════
  const renderDropdown = (
    suggestions: SearchSuggestion[],
    selectedIdx: number,
    onSelect: (s: SearchSuggestion) => void,
    setSelectedIdx: (n: number) => void
  ) => {
    if (suggestions.length === 0) return null
    return (
      <div className="search-dropdown">
        {suggestions.map((s, i) => (
          <div
            key={i}
            className={`search-dropdown-item ${i === selectedIdx ? 'selected' : ''}`}
            onClick={() => onSelect(s)}
            onMouseEnter={() => setSelectedIdx(i)}
          >
            <span className="search-item-label">{s.label}</span>
            <span className="search-item-sublabel">{s.sublabel}</span>
          </div>
        ))}
      </div>
    )
  }

  // ════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════
  return (
    <div className="quick-panel-container expanded">
      {/* ── 3 Campi di Ricerca ── */}
      <div className="quick-panel-header">
        <div className="search-fields-grid">
          {/* NOME */}
          <div className="search-field-wrapper" ref={nomeRef}>
            <label> Nome </label>
            <input
              type="text" value={nome}
              onChange={e => { setNome(e.target.value); setShowNomeDropdown(true) }}
              onFocus={() => { if (nome.length > 0) setShowNomeDropdown(true) }}
              onKeyDown={makeKeyHandler(nomeSuggestions, selectedNomeIdx, setSelectedNomeIdx, s => { if (s.boat) onSelectBoat(s.boat) }, setShowNomeDropdown)}
              placeholder=""
            />
            {showNomeDropdown && renderDropdown(nomeSuggestions, selectedNomeIdx, s => { if (s.boat) onSelectBoat(s.boat) }, setSelectedNomeIdx)}
          </div>

          {/* MATRICOLA */}
          <div className="search-field-wrapper" ref={targaRef}>
            <label> Matricola</label>
            <input
              type="text" value={targa}
              onChange={e => { setTarga(e.target.value); setShowTargaDropdown(true) }}
              onFocus={() => { if (targa.length > 0) setShowTargaDropdown(true) }}
              onKeyDown={makeKeyHandler(targaSuggestions, selectedTargaIdx, setSelectedTargaIdx, s => { if (s.boat) onSelectBoat(s.boat) }, setShowTargaDropdown)}
              placeholder=""
            />
            {showTargaDropdown && renderDropdown(targaSuggestions, selectedTargaIdx, s => { if (s.boat) onSelectBoat(s.boat) }, setSelectedTargaIdx)}
          </div>

          {/* POSTO */}
          <div className="search-field-wrapper" ref={postoRef}>
            <label> Posto</label>
            <input
              type="text" value={posto}
              onChange={e => { setPosto(e.target.value); setShowPostoDropdown(true) }}
              onFocus={() => { if (posto.length > 0) setShowPostoDropdown(true) }}
              onKeyDown={makeKeyHandler(postoSuggestions, selectedPostoIdx, setSelectedPostoIdx, s => { if (s.berth) onSelectBerth(s.berth) }, setShowPostoDropdown)}
              placeholder=""
            />
            {showPostoDropdown && renderDropdown(postoSuggestions, selectedPostoIdx, s => { if (s.berth) onSelectBerth(s.berth) }, setSelectedPostoIdx)}
          </div>
        </div>
      </div>

      {/* Form Body */}
      <div className="quick-panel-body">
        <div className="quick-panel-title">
          <h3>Registra Movimento</h3>
          <Link to="/torre" className="quick-panel-fullpage-link">
            Apri pagina completa →
          </Link>
        </div>

        {errorMessage && (<div className="panel-error-banner">❌ {errorMessage}</div>)}

        <div className="quick-panel-form">
          {/* ── Dati Dimensionali ── */}
          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label>Lunghezza (m)</label>
              <input type="number" step="0.1" value={lunghezza} onChange={e => setLunghezza(e.target.value)} placeholder="12.5" />
            </div>
            <div className="form-group">
              <label>Pescaggio (m)</label>
              <input type="number" step="0.1" value={pescaggio} onChange={e => setPescaggio(e.target.value)} placeholder="2.1" />
            </div>
          </div>

          {/* ── Tipologia ── */}
          <div className="tipologia-section">
            <label className="tipologia-label">Tipologia Imbarcazione</label>
            <div className="tipologia-buttons">
              <button type="button" className={`tipologia-btn ${tipologia === 'socio' ? 'active socio' : ''}`}
                onClick={() => { if (!tipologiaLocked) setTipologia('socio') }}
                disabled={tipologiaLocked && tipologia !== 'socio'}> Socio</button>
              <button type="button" className={`tipologia-btn ${tipologia === 'transito' ? 'active transito' : ''}`}
                onClick={() => { if (!tipologiaLocked) setTipologia('transito') }}
                disabled={tipologiaLocked && tipologia !== 'transito'}> Transito</button>
              <button type="button" className={`tipologia-btn ${tipologia === 'affittuario' ? 'active affittuario' : ''}`}
                onClick={() => { if (!tipologiaLocked) setTipologia('affittuario') }}
                disabled={tipologiaLocked && tipologia !== 'affittuario'}> Affittuario</button>
            </div>
            {tipologiaLocked && (<span className="tipologia-locked-hint">🔒 Tipologia rilevata automaticamente</span>)}
          </div>

          {/* ── Mode Tabs ── */}
          <div className="panel-mode-tabs">
            <button type="button" className={`mode-tab ${panelMode === 'movimento' ? 'active' : ''}`} onClick={() => setPanelMode('movimento')}>⇅ Movimento</button>
            <button type="button" className={`mode-tab ${panelMode === 'spostamento' ? 'active' : ''}`} onClick={() => setPanelMode('spostamento')}>⇄ Spostamento</button>
          </div>

          {/* ── TAB: MOVIMENTO ── */}
          {panelMode === 'movimento' && (
            <>
              {tipologia === 'transito' && suggestedBerths.length > 0 && (
                <div className="berths-suggestion-panel">
                  <h4>Posti Transito Disponibili ({suggestedBerths.length})</h4>
                  <div className="berths-grid">
                    {suggestedBerths.map(b => (
                      <button type="button" key={b.id} className={`berth-chip ${posto === b.id ? 'selected' : ''}`} onClick={() => setPosto(b.id)}>
                        {b.id} <span className="berth-chip-dim">({b.lunMax}m)</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="zone-speciali-section">
                <h4 className="zone-speciali-title">Zone Speciali</h4>
                <div className="zone-speciali-buttons">
                  <button type="button" className="btn btn-cantiere" onClick={handleCantiere}> Cantiere</button>
                  <button type="button" className="btn btn-bunker" onClick={handleBunker}> Bunker</button>
                  <button type="button" className="btn btn-green" onClick={handleRientro}>↩ Rientro</button>
                </div>
              </div>

              <div className="quick-panel-actions">
                <button type="button" className="btn btn-outline" onClick={handleClear}>Pulisci</button>
                <div className="action-buttons-group">
                  <button type="button" className="btn btn-mode-uscita" onClick={handleUscitaTemporanea}>↓ Uscita</button>
                  <button type="button" className="btn btn-mode-uscita-def" onClick={handleUscitaDefinitiva}> Uscita Definitiva</button>
                  <button type="button" className="btn btn-mode-entrata" onClick={handleEntrata}>↑ Entrata</button>
                </div>
              </div>
            </>
          )}

          {/* ── TAB: SPOSTAMENTO ── */}
          {panelMode === 'spostamento' && (
            <>
              <div className="spostamento-grid">
                {/* ORIGINE — dropdown con posti occupati */}
                <div className="form-group search-field-wrapper" ref={origineRef}>
                  <label>Posto di Origine</label>
                  <input
                    type="text"
                    className="posto-input"
                    value={postoOrigine}
                    onChange={e => { setPostoOrigine(e.target.value); setShowOrigineDropdown(true) }}
                    onFocus={() => { if (postoOrigine.length > 0) setShowOrigineDropdown(true) }}
                    onKeyDown={makeKeyHandler(
                      origineSuggestions, selectedOrigineIdx, setSelectedOrigineIdx,
                      s => { if (s.berth) { setPostoOrigine(s.berth.id); setShowOrigineDropdown(false) } },
                      setShowOrigineDropdown
                    )}
                    placeholder="Es. A 5"
                  />
                  {showOrigineDropdown && renderDropdown(
                    origineSuggestions, selectedOrigineIdx,
                    s => { if (s.berth) { setPostoOrigine(s.berth.id); setShowOrigineDropdown(false) } },
                    setSelectedOrigineIdx
                  )}
                </div>

                <div className="spostamento-arrow">→</div>

                {/* DESTINAZIONE — dropdown con posti liberi + badge stato live */}
                <div className="form-group search-field-wrapper" ref={destinazioneRef}>
                  <label>Posto di Destinazione</label>
                  <input
                    type="text"
                    className="posto-input"
                    value={postoDestinazione}
                    onChange={e => { setPostoDestinazione(e.target.value); setShowDestinazioneDropdown(true) }}
                    onFocus={() => { if (postoDestinazione.length > 0) setShowDestinazioneDropdown(true) }}
                    onKeyDown={makeKeyHandler(
                      destinazioneSuggestions, selectedDestinazioneIdx, setSelectedDestinazioneIdx,
                      s => { if (s.berth) { setPostoDestinazione(s.berth.id); setShowDestinazioneDropdown(false) } },
                      setShowDestinazioneDropdown
                    )}
                    placeholder="Es. B 10"
                  />
                  {showDestinazioneDropdown && renderDropdown(
                    destinazioneSuggestions, selectedDestinazioneIdx,
                    s => { if (s.berth) { setPostoDestinazione(s.berth.id); setShowDestinazioneDropdown(false) } },
                    setSelectedDestinazioneIdx
                  )}

                  {/* Badge live stato del posto digitato */}
                  {destinazioneBerth && (
                    <div
                      className="dest-status-badge"
                      style={{
                        marginTop: '4px',
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: '#fff',
                        background: BERTH_STATUS_HEX[destinazioneBerth.stato] || '#cbd5e1'
                      }}
                    >
                      {BERTH_STATUS_LABELS[destinazioneBerth.stato] || destinazioneBerth.stato}
                      {destinazioneBerth.barcaOra && ` · ${destinazioneBerth.barcaOra}`}
                    </div>
                  )}
                </div>
              </div>

              {/* Warning dimensionale (non bloccante) */}
              {dimensionWarnings.length > 0 && (
                <div
                  className="spostamento-info"
                  style={{ background: 'var(--bg2)', borderLeft: '3px solid var(--color-text-warning)' }}
                >
                  ⚠️ <strong>Attenzione dimensioni:</strong>
                  <ul style={{ margin: '4px 0 0 20px', padding: 0 }}>
                    {dimensionWarnings.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              )}

              <div className="spostamento-info">⚠️ Lo spostamento richiede sempre l'autorizzazione del proprietario del posto di destinazione.</div>
              <div className="quick-panel-actions">
                <button type="button" className="btn btn-outline" onClick={handleClear}>Pulisci</button>
                <button type="button" className="btn btn-mode-spostamento" onClick={handleSpostamento}>⇄ Conferma Spostamento</button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* POPUP CONFERMA */}
      {showConfirmPopup && (
        <div className="modal-overlay" onClick={() => setShowConfirmPopup(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">⚠️</div>
            <h3 className="modal-title">Conferma richiesta</h3>
            <p className="modal-message">{confirmMessage}</p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowConfirmPopup(false)}>Annulla</button>
              <button className="btn btn-mode-uscita-def" onClick={() => confirmAction?.()}>Conferma</button>
            </div>
          </div>
        </div>
      )}

      {/* AVVISO WARNING (non bloccante — riservato a note informative) */}
      {showWarning && (
        <div className="modal-overlay" onClick={() => setShowWarning(false)}>
          <div className="modal-box warning" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">ℹ️</div>
            <h3 className="modal-title">Avviso</h3>
            <p className="modal-message">{warningMessage}</p>
            <div className="modal-actions">
              <button className="btn btn-mode-entrata" onClick={() => setShowWarning(false)}>Ho capito</button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE BLOCCANTE — autorizzazione affittuario mancante (MEDIO 4) */}
      {authMissingModal.show && (
        <div className="modal-overlay" onClick={() => setAuthMissingModal({ show: false, motivo: '', onProceed: () => { } })}>
          <div className="modal-box warning" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">⚠️</div>
            <h3 className="modal-title">Autorizzazione non trovata</h3>
            <p className="modal-message">{authMissingModal.motivo}</p>
            <p className="modal-message" style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--text2)' }}>
              L'autorizzazione è un documento formale gestito dalla Direzione.<br />
              Puoi registrare comunque l'ingresso come <strong>"In attesa di Autorizzazione"</strong>:
              la Direzione riceverà una notifica per compilare il documento.
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => setAuthMissingModal({ show: false, motivo: '', onProceed: () => { } })}
              >
                Annulla
              </button>
              <button
                className="btn btn-mode-entrata"
                onClick={() => authMissingModal.onProceed()}
              >
                Registra come Pendente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
