import React, { useState, useEffect, useMemo } from 'react'
import { Omnibar } from '../../../components/Omnibar'
import { useGlobalState } from '../../../store/GlobalState'
import { Berth, MovementScenario } from '@shared/types'
import './QuickMovementPanel.css'

type PanelMode = 'movimento' | 'spostamento'

export function QuickMovementPanel() {
  const { 
    posti, barche, clienti, ricevute, autorizzazioni,
    registraEntrata, registraUscitaTemporanea, registraUscitaDefinitiva,
    registraSpostamento, registraCantiere, registraBunker,
    isPostoOccupato, checkPagamentoSaldato, checkAutorizzazione, getScenarioBarca
  } = useGlobalState()

  // ── Stato del form ──
  const [nome, setNome] = useState('')
  const [targa, setTarga] = useState('')
  const [lunghezza, setLunghezza] = useState('')
  const [pescaggio, setPescaggio] = useState('')
  const [posto, setPosto] = useState('')
  const [tipologia, setTipologia] = useState<MovementScenario | ''>('')
  const [tipologiaLocked, setTipologiaLocked] = useState(false)

  // ── Spostamento ──
  const [panelMode, setPanelMode] = useState<PanelMode>('movimento')
  const [postoOrigine, setPostoOrigine] = useState('')
  const [postoDestinazione, setPostoDestinazione] = useState('')

  // ── Modali ──
  const [showConfirmPopup, setShowConfirmPopup] = useState(false)
  const [confirmMessage, setConfirmMessage] = useState('')
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null)
  const [showWarning, setShowWarning] = useState(false)
  const [warningMessage, setWarningMessage] = useState('')

  // ── Errori ──
  const [errorMessage, setErrorMessage] = useState('')

  // ────────────────────────────────────────────
  // Suggerimenti posti: SOLO per transiti, filtrati per dimensioni
  // ────────────────────────────────────────────
  const suggestedBerths = useMemo(() => {
    if (tipologia !== 'transito') return []

    let free = posti.filter(p => p.stato === 'libero')

    // Filtra per lunghezza (se inserita)
    const lunVal = parseFloat(lunghezza)
    if (!isNaN(lunVal) && lunVal > 0) {
      free = free.filter(p => p.lunMax >= lunVal)
    }

    // Filtra per pescaggio (se inserito)
    const pesVal = parseFloat(pescaggio)
    if (!isNaN(pesVal) && pesVal > 0) {
      free = free.filter(p => p.profondita >= pesVal)
    }

    return free
  }, [posti, tipologia, lunghezza, pescaggio])

  // ────────────────────────────────────────────
  // Quando Omnibar seleziona un risultato
  // ────────────────────────────────────────────
  const handleOmnibarAction = (action: string, data?: any) => {
    setErrorMessage('')

    if (data?.original) {
      const orig = data.original
      setNome(orig.nome || '')
      setTarga(orig.matricola || '')
      setPosto(orig.posto || '')

      // Auto-detect tipologia Socio
      if (orig.nome || orig.matricola) {
        const scenario = getScenarioBarca(orig.nome || '', orig.matricola || '')
        if (scenario === 'socio') {
          setTipologia('socio')
          setTipologiaLocked(true)
        } else {
          setTipologiaLocked(false)
        }
      }

      // Pre-fill lunghezza/pescaggio se disponibili
      if (orig.lunghezza) setLunghezza(String(orig.lunghezza))
      if (orig.pescaggio) setPescaggio(String(orig.pescaggio))

    } else if (action === 'nuovo_transito') {
      setNome(data?.query || '')
      setTarga('')
      setLunghezza('')
      setPescaggio('')
      setPosto('')
      setTipologia('')
      setTipologiaLocked(false)
    }
  }

  // ────────────────────────────────────────────
  // Pulizia form
  // ────────────────────────────────────────────
  const handleClear = () => {
    setNome('')
    setTarga('')
    setPosto('')
    setLunghezza('')
    setPescaggio('')
    setTipologia('')
    setTipologiaLocked(false)
    setPostoOrigine('')
    setPostoDestinazione('')
    setErrorMessage('')
    setPanelMode('movimento')
  }

  // ────────────────────────────────────────────
  // Helper per creare oggetto Movement base
  // ────────────────────────────────────────────
  const buildMovement = (tipo: any, postoVal: string) => ({
    id: Date.now(),
    ora: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
    data: new Date().toISOString().split('T')[0],
    nome,
    matricola: targa || 'N/D',
    tipo,
    posto: postoVal || '—',
    scenario: (tipologia || 'transito') as MovementScenario,
    auth: true,
    pagamento: tipologia === 'socio' ? 'Titolo Attivo' : 'Da saldare',
    operatore: { nome: 'Operatore', ruolo: 'torre', iniziali: 'OP' }
  })

  // ────────────────────────────────────────────
  // Validazione comune
  // ────────────────────────────────────────────
  const validateBase = (): boolean => {
    setErrorMessage('')

    // Almeno nome O matricola
    if (!nome.trim() && !targa.trim()) {
      setErrorMessage('Inserisci almeno il nome o la matricola dell\'imbarcazione.')
      return false
    }

    // Tipologia obbligatoria per non-soci
    if (!tipologia) {
      setErrorMessage('Seleziona la tipologia (Socio, Transito o Affittuario) prima di registrare il movimento.')
      return false
    }

    return true
  }

  // ════════════════════════════════════════════
  // AZIONI PRINCIPALI
  // ════════════════════════════════════════════

  /** Entrata (M-01) */
  const handleEntrata = () => {
    if (!validateBase()) return
    if (!posto.trim()) {
      setErrorMessage('Inserisci o seleziona un posto barca.')
      return
    }

    // Verifica esclusività posto (il GlobalState la fa già, ma diamo feedback diretto)
    if (isPostoOccupato(posto)) {
      setErrorMessage(`Il posto ${posto} è già occupato. Scegli un posto differente.`)
      return
    }

    // Avviso autorizzazione mancante per soci/affittuari
    if (tipologia === 'socio' || tipologia === 'affittuario') {
      const authCheck = checkAutorizzazione(posto, nome)
      if (!authCheck.autorizzato) {
        // Mostra avviso ma non blocca
        setWarningMessage(`⚠️ Attenzione: ${authCheck.motivo}\nL'assegnazione verrà comunque registrata.`)
        setShowWarning(true)
      }
    }

    const m = buildMovement('entrata', posto)
    const result = registraEntrata(m)
    if (!result.ok) {
      setErrorMessage(result.errore || 'Errore durante la registrazione.')
      return
    }
    handleClear()
  }

  /** Uscita temporanea — Gita (M-02a) */
  const handleUscitaTemporanea = () => {
    if (!validateBase()) return
    const m = buildMovement('uscita_temporanea', posto)
    registraUscitaTemporanea(m)
    handleClear()
  }

  /** Uscita definitiva — Partenza (M-02b) */
  const handleUscitaDefinitiva = () => {
    if (!validateBase()) return

    // Se Socio → popup conferma "Vuoi rimuovere titolo al proprietario?"
    if (tipologia === 'socio') {
      setConfirmMessage('Vuoi rimuovere titolo al proprietario?')
      setConfirmAction(() => () => {
        const m = buildMovement('uscita_definitiva', posto)
        registraUscitaDefinitiva(m)
        handleClear()
        setShowConfirmPopup(false)
      })
      setShowConfirmPopup(true)
      return
    }

    // Se Transito → verifica pagamento
    if (tipologia === 'transito') {
      const pagato = checkPagamentoSaldato(nome)
      if (!pagato) {
        setWarningMessage('⚠️ Attenzione: non risulta emessa una ricevuta saldata per questa imbarcazione. L\'operatore può comunque confermare l\'uscita.')
        setShowWarning(true)
      }
    }

    const m = buildMovement('uscita_definitiva', posto)
    registraUscitaDefinitiva(m)
    handleClear()
  }

  /** Spostamento (M-03) */
  const handleSpostamento = () => {
    if (!validateBase()) return
    if (!postoOrigine.trim() || !postoDestinazione.trim()) {
      setErrorMessage('Inserisci sia il posto di origine che quello di destinazione.')
      return
    }

    const m = buildMovement('spostamento', postoDestinazione)
    const result = registraSpostamento(m, postoOrigine, postoDestinazione)
    if (!result.ok) {
      setErrorMessage(result.errore || 'Errore durante lo spostamento.')
      return
    }
    handleClear()
  }

  /** Cantiere (M-05a) */
  const handleCantiere = () => {
    if (!validateBase()) return
    if (!posto.trim()) {
      setErrorMessage('Inserisci il posto da cui parte la barca (verso il cantiere).')
      return
    }
    const m = buildMovement('cantiere', 'Cantiere')
    registraCantiere(m, posto)
    handleClear()
  }

  /** Bunker (M-05b) */
  const handleBunker = () => {
    if (!validateBase()) return
    if (!posto.trim()) {
      setErrorMessage('Inserisci il posto da cui parte la barca (verso il bunker).')
      return
    }
    const m = buildMovement('bunker', 'Bunker')
    registraBunker(m, posto)
    handleClear()
  }

  // ════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════
  return (
    <div className="quick-panel-container expanded">
      {/* Search Bar */}
      <div className="quick-panel-header">
        <div style={{ flex: 1 }}>
          <Omnibar onAction={handleOmnibarAction} />
        </div>
      </div>

      {/* Form Body */}
      <div className="quick-panel-body">
        <div className="quick-panel-title">
          <h3>Registra Movimento</h3>
          <p>Inserisci i dati e premi il comando desiderato per confermare.</p>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="panel-error-banner">
            ❌ {errorMessage}
          </div>
        )}

        <div className="quick-panel-form">
          {/* ── Dati Imbarcazione ── */}
          <div className="form-grid">
            <div className="form-group">
              <label>Nome Imbarcazione</label>
              <input 
                type="text" 
                value={nome} 
                onChange={e => setNome(e.target.value)} 
                placeholder="Es. Flying Dutchman"
              />
            </div>

            <div className="form-group">
              <label>Targa / Matricola</label>
              <input 
                type="text" 
                value={targa} 
                onChange={e => setTarga(e.target.value)} 
                placeholder="Es. NL-12345"
              />
            </div>

            <div className="form-group">
              <label>Lunghezza (m)</label>
              <input 
                type="number" 
                step="0.1" 
                value={lunghezza} 
                onChange={e => setLunghezza(e.target.value)} 
                placeholder="12.5"
              />
            </div>

            <div className="form-group">
              <label>Pescaggio (m)</label>
              <input 
                type="number" 
                step="0.1" 
                value={pescaggio} 
                onChange={e => setPescaggio(e.target.value)} 
                placeholder="2.1"
              />
            </div>
          </div>

          {/* ── Tipologia (obbligatoria per non-soci) ── */}
          <div className="tipologia-section">
            <label className="tipologia-label">Tipologia Imbarcazione</label>
            <div className="tipologia-buttons">
              <button
                type="button"
                className={`tipologia-btn ${tipologia === 'socio' ? 'active socio' : ''}`}
                onClick={() => { if (!tipologiaLocked) setTipologia('socio') }}
                disabled={tipologiaLocked && tipologia !== 'socio'}
              >
                🏅 Socio
              </button>
              <button
                type="button"
                className={`tipologia-btn ${tipologia === 'transito' ? 'active transito' : ''}`}
                onClick={() => { if (!tipologiaLocked) setTipologia('transito') }}
                disabled={tipologiaLocked && tipologia !== 'transito'}
              >
                ⛵ Transito
              </button>
              <button
                type="button"
                className={`tipologia-btn ${tipologia === 'affittuario' ? 'active affittuario' : ''}`}
                onClick={() => { if (!tipologiaLocked) setTipologia('affittuario') }}
                disabled={tipologiaLocked && tipologia !== 'affittuario'}
              >
                🏠 Affittuario
              </button>
            </div>
            {tipologiaLocked && (
              <span className="tipologia-locked-hint">🔒 Tipologia rilevata automaticamente</span>
            )}
          </div>

          {/* ── Mode Tabs ── */}
          <div className="panel-mode-tabs">
            <button
              type="button"
              className={`mode-tab ${panelMode === 'movimento' ? 'active' : ''}`}
              onClick={() => setPanelMode('movimento')}
            >
              ⇅ Movimento
            </button>
            <button
              type="button"
              className={`mode-tab ${panelMode === 'spostamento' ? 'active' : ''}`}
              onClick={() => setPanelMode('spostamento')}
            >
              ⇄ Spostamento
            </button>
          </div>

          {/* ──────────────────────────────────── */}
          {/* TAB: MOVIMENTO (Entrata / Uscita)   */}
          {/* ──────────────────────────────────── */}
          {panelMode === 'movimento' && (
            <>
              <div className="form-group" style={{ maxWidth: '320px', margin: '0 auto', width: '100%' }}>
                <label>Posto Barca</label>
                <input 
                  type="text" 
                  className="posto-input"
                  value={posto} 
                  onChange={e => setPosto(e.target.value)} 
                  placeholder="Es. A 5"
                />
              </div>

              {/* Suggerimenti posti — solo Transiti */}
              {tipologia === 'transito' && suggestedBerths.length > 0 && (
                <div className="berths-suggestion-panel">
                  <h4>Posti Transito Disponibili ({suggestedBerths.length})</h4>
                  <div className="berths-grid">
                    {suggestedBerths.map(b => (
                      <button 
                        type="button"
                        key={b.id} 
                        className={`berth-chip ${posto === b.id ? 'selected' : ''}`}
                        onClick={() => setPosto(b.id)}
                      >
                        {b.id} <span className="berth-chip-dim">({b.lunMax}m)</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Zone Speciali */}
              <div className="zone-speciali-section">
                <h4 className="zone-speciali-title">Zone Speciali</h4>
                <div className="zone-speciali-buttons">
                  <button type="button" className="btn btn-cantiere" onClick={handleCantiere}>
                    ⚙ Cantiere
                  </button>
                  <button type="button" className="btn btn-bunker" onClick={handleBunker}>
                    ⛽ Bunker
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="quick-panel-actions">
                <button type="button" className="btn btn-outline" onClick={handleClear}>Pulisci</button>
                <div className="action-buttons-group">
                  <button type="button" className="btn btn-mode-uscita" onClick={handleUscitaTemporanea}>
                    ↓ Uscita
                  </button>
                  <button type="button" className="btn btn-mode-uscita-def" onClick={handleUscitaDefinitiva}>
                    ⏏ Uscita Definitiva
                  </button>
                  <button type="button" className="btn btn-mode-entrata" onClick={handleEntrata}>
                    ↑ Entrata
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ──────────────────────────────────── */}
          {/* TAB: SPOSTAMENTO                    */}
          {/* ──────────────────────────────────── */}
          {panelMode === 'spostamento' && (
            <>
              <div className="spostamento-grid">
                <div className="form-group">
                  <label>Posto di Origine</label>
                  <input
                    type="text"
                    className="posto-input"
                    value={postoOrigine}
                    onChange={e => setPostoOrigine(e.target.value)}
                    placeholder="Es. A 5"
                  />
                </div>
                <div className="spostamento-arrow">→</div>
                <div className="form-group">
                  <label>Posto di Destinazione</label>
                  <input
                    type="text"
                    className="posto-input"
                    value={postoDestinazione}
                    onChange={e => setPostoDestinazione(e.target.value)}
                    placeholder="Es. B 10"
                  />
                </div>
              </div>

              <div className="spostamento-info">
                ⚠️ Lo spostamento richiede sempre l'autorizzazione del proprietario del posto di destinazione.
              </div>

              <div className="quick-panel-actions">
                <button type="button" className="btn btn-outline" onClick={handleClear}>Pulisci</button>
                <button type="button" className="btn btn-mode-spostamento" onClick={handleSpostamento}>
                  ⇄ Conferma Spostamento
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ──────────────────────────────────── */}
      {/* POPUP CONFERMA (Rimozione titolo)   */}
      {/* ──────────────────────────────────── */}
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

      {/* ──────────────────────────────────── */}
      {/* AVVISO WARNING (pagamento, auth)    */}
      {/* ──────────────────────────────────── */}
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
    </div>
  )
}
