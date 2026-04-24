import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useGlobalState } from '../../../store/GlobalState'
import { Berth, Boat, Client, MovementScenario } from '@shared/types'
import { BERTH_STATUS_LABELS } from '@shared/constants'
import './QuickMovementPanel.css'

type PanelMode = 'movimento' | 'spostamento'

// ── Tipo per suggerimenti ricerca ──
type SearchSuggestion = {
  label: string
  sublabel: string
  boat?: Boat
  berth?: Berth
}

export function QuickMovementPanel() {
  const {
    posti, barche, clienti,
    registraEntrata, registraUscitaTemporanea, registraUscitaDefinitiva,
    registraSpostamento, registraCantiere, registraBunker, registraRientro,
    isPostoOccupato, checkPagamentoSaldato, checkAutorizzazione, getScenarioBarca,
    addCliente, addBarca
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

  // ── Dropdown di ricerca ──
  const [showNomeDropdown, setShowNomeDropdown] = useState(false)
  const [showTargaDropdown, setShowTargaDropdown] = useState(false)
  const [showPostoDropdown, setShowPostoDropdown] = useState(false)
  const [selectedNomeIdx, setSelectedNomeIdx] = useState(0)
  const [selectedTargaIdx, setSelectedTargaIdx] = useState(0)
  const [selectedPostoIdx, setSelectedPostoIdx] = useState(0)
  const nomeRef = useRef<HTMLDivElement>(null)
  const targaRef = useRef<HTMLDivElement>(null)
  const postoRef = useRef<HTMLDivElement>(null)

  // ── Modali ──
  const [showConfirmPopup, setShowConfirmPopup] = useState(false)
  const [confirmMessage, setConfirmMessage] = useState('')
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null)
  const [showWarning, setShowWarning] = useState(false)
  const [warningMessage, setWarningMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  // Modale BLOCCANTE per ingresso affittuario senza autorizzazione valida:
  // 2 bottoni (Annulla / Registra come Pendente). Vedi MEDIO 4.
  const [authMissingModal, setAuthMissingModal] = useState<{
    show: boolean
    motivo: string
    onProceed: () => void
  }>({ show: false, motivo: '', onProceed: () => { } })

  // ════════════════════════════════════════════
  // RICERCA LIVE — 3 pilastri
  // ════════════════════════════════════════════

  const nomeSuggestions = useMemo<SearchSuggestion[]>(() => {
    if (nome.trim().length < 1) return []
    const q = nome.toLowerCase()
    return barche
      .filter(b => b.nome.toLowerCase().includes(q))
      .slice(0, 5)
      .map(b => ({ label: b.nome, sublabel: `${b.matricola} · Posto: ${b.posto || '—'}`, boat: b }))
  }, [nome, barche])

  const targaSuggestions = useMemo<SearchSuggestion[]>(() => {
    if (targa.trim().length < 1) return []
    const q = targa.toLowerCase()
    return barche
      .filter(b => b.matricola.toLowerCase().includes(q))
      .slice(0, 5)
      .map(b => ({ label: b.matricola, sublabel: `${b.nome} · Posto: ${b.posto || '—'}`, boat: b }))
  }, [targa, barche])

  const postoSuggestions = useMemo<SearchSuggestion[]>(() => {
    if (posto.trim().length < 1) return []
    const q = posto.toLowerCase()
    return posti
      .filter(p => p.id.toLowerCase().includes(q))
      .slice(0, 5)
      .map(p => {
        const stato = BERTH_STATUS_LABELS[p.stato] || p.stato
        return { label: p.id, sublabel: `${p.pontile} · ${stato}${p.barcaOra ? ` · ${p.barcaOra}` : ''}`, berth: p }
      })
  }, [posto, posti])

  // Reset indici quando cambiano i suggerimenti
  useEffect(() => { setSelectedNomeIdx(0) }, [nomeSuggestions])
  useEffect(() => { setSelectedTargaIdx(0) }, [targaSuggestions])
  useEffect(() => { setSelectedPostoIdx(0) }, [postoSuggestions])

  // Chiudi dropdown cliccando fuori
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (nomeRef.current && !nomeRef.current.contains(e.target as Node)) setShowNomeDropdown(false)
      if (targaRef.current && !targaRef.current.contains(e.target as Node)) setShowTargaDropdown(false)
      if (postoRef.current && !postoRef.current.contains(e.target as Node)) setShowPostoDropdown(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Auto-compilazione da barca ──
  const fillFromBoat = (b: Boat) => {
    setNome(b.nome)
    setTarga(b.matricola)
    if (b.posto) setPosto(b.posto)
    if (b.lunghezza) setLunghezza(String(b.lunghezza))
    if (b.pescaggio) setPescaggio(String(b.pescaggio))
    // Auto-detect socio
    const scenario = getScenarioBarca(b.nome, b.matricola)
    if (scenario === 'socio') {
      setTipologia('socio')
      setTipologiaLocked(true)
    } else {
      setTipologiaLocked(false)
    }
    setShowNomeDropdown(false)
    setShowTargaDropdown(false)
    setShowPostoDropdown(false)
    setErrorMessage('')
  }

  // ── Auto-compilazione da posto ──
  const fillFromBerth = (p: Berth) => {
    setPosto(p.id)
    // Se il posto è occupato, compila i dati barca
    if (p.barcaOra && p.stato !== 'libero') {
      const barca = barche.find(b => b.nome === p.barcaOra || b.posto === p.id)
      if (barca) fillFromBoat(barca)
    }
    setShowPostoDropdown(false)
    setErrorMessage('')
  }

  // ── Keyboard handler per dropdown ──
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

  // ────────────────────────────────────────────
  // Suggerimenti posti: SOLO per transiti, filtrati per dimensioni
  // ────────────────────────────────────────────
  const suggestedBerths = useMemo(() => {
    if (tipologia !== 'transito') return []
    let free = posti.filter(p => p.stato === 'libero')
    const lunVal = parseFloat(lunghezza)
    if (!isNaN(lunVal) && lunVal > 0) free = free.filter(p => p.lunMax >= lunVal)
    const pesVal = parseFloat(pescaggio)
    if (!isNaN(pesVal) && pesVal > 0) free = free.filter(p => p.profondita >= pesVal)
    return free
  }, [posti, tipologia, lunghezza, pescaggio])

  // ────────────────────────────────────────────
  // Pulizia form
  // ────────────────────────────────────────────
  const handleClear = () => {
    setNome(''); setTarga(''); setPosto(''); setLunghezza(''); setPescaggio('')
    setTipologia(''); setTipologiaLocked(false)
    setPostoOrigine(''); setPostoDestinazione('')
    setErrorMessage(''); setPanelMode('movimento')
  }

  // ────────────────────────────────────────────
  // MEDIO 3-bis: anagrafica minima per transiti sconosciuti (Tempo 1)
  //
  // Cerca la barca per nome o matricola. Se non esiste e la tipologia è
  // 'transito', crea due record "scheletro":
  //   1. Un Client placeholder ("Transito — <nome barca>") da completare in Tempo 2.
  //   2. Una Boat con registrazioneCompleta=false, flag che la
  //      RegistrazioneTransitiPage usa per mostrare "da completare".
  //
  // Socio e Affittuario: se non esistono, è un errore di altro tipo (anagrafica
  // doveva essere caricata in Ufficio). Qui NON creiamo nulla, lasciamo proseguire
  // il flusso — se serve, verrà bloccato più a valle da checkAutorizzazione.
  // ────────────────────────────────────────────
  const ensureBoatExists = (): void => {
    if (tipologia !== 'transito') return
    const nomeTrim = nome.trim()
    const targaTrim = targa.trim()
    if (!nomeTrim && !targaTrim) return

    const esistente = barche.find(b =>
      (nomeTrim && b.nome.toLowerCase() === nomeTrim.toLowerCase()) ||
      (targaTrim && b.matricola.toLowerCase() === targaTrim.toLowerCase())
    )
    if (esistente) return // già in anagrafica, niente da fare

    // Calcolo iniziali placeholder: prime due lettere del nome barca (o "??" se vuoto)
    const baseIniz = nomeTrim || targaTrim || '??'
    const iniziali = baseIniz.substring(0, 2).toUpperCase()

    // 1. Crea Client scheletro
    const nuovoClientId = Math.max(0, ...clienti.map(c => c.id)) + 1
    const nuovoClient: Client = {
      id: nuovoClientId,
      tipo: 'pf',
      nome: `Transito — ${nomeTrim || targaTrim}`,
      iniziali
    }
    addCliente(nuovoClient)

    // 2. Crea Boat scheletro, collegata al Client appena creato
    const nuovoBoatId = Math.max(0, ...barche.map(b => b.id)) + 1
    const lunVal = parseFloat(lunghezza) || 0
    const pesVal = parseFloat(pescaggio) || 0
    const nuovaBoat: Boat = {
      id: nuovoBoatId,
      clientId: nuovoClientId,
      nome: nomeTrim || `Barca ${targaTrim}`,
      matricola: targaTrim || 'N/D',
      tipo: 'Altro',
      tipologia: 'transito',
      lunghezza: lunVal,
      larghezza: 0,
      pescaggio: pesVal,
      bandiera: 'N/D',
      posto: posto.trim() || undefined,
      // MEDIO 5: niente `stato` sulla barca — lo stato è derivato da berth.stato.
      // Il successivo registraEntrata imposterà berth.stato='occupato_transito'.
      registrazioneCompleta: false
    }
    addBarca(nuovaBoat)
  }

  // ────────────────────────────────────────────
  // Helper per creare oggetto Movement base
  // ────────────────────────────────────────────
  const buildMovement = (tipo: any, postoVal: string) => ({
    id: Date.now(),
    ora: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
    data: new Date().toISOString().split('T')[0],
    nome, matricola: targa || 'N/D', tipo,
    posto: postoVal || '—',
    scenario: (tipologia || 'transito') as MovementScenario,
    auth: true,
    pagamento: tipologia === 'socio' ? 'Titolo Attivo' : 'Da saldare',
    operatore: { nome: 'Operatore', ruolo: 'torre', iniziali: 'OP' }
  })

  const validateBase = (): boolean => {
    setErrorMessage('')
    if (!nome.trim() && !targa.trim()) {
      setErrorMessage('Inserisci almeno il nome o la matricola dell\'imbarcazione.')
      return false
    }
    if (!tipologia) {
      setErrorMessage('Seleziona la tipologia (Socio, Transito o Affittuario) prima di registrare il movimento.')
      return false
    }
    return true
  }

  // ════════════════════════════════════════════
  // AZIONI PRINCIPALI
  // ════════════════════════════════════════════

  const handleEntrata = () => {
    if (!validateBase()) return
    if (!posto.trim()) { setErrorMessage('Inserisci o seleziona un posto barca.'); return }
    if (isPostoOccupato(posto)) { setErrorMessage(`Il posto ${posto} è già occupato. Scegli un posto differente.`); return }

    // Tempo 1: se è un transito nuovo, crea anagrafica minima (Client + Boat scheletro)
    ensureBoatExists()
    const m = buildMovement('entrata', posto)

    // Affittuario senza autorizzazione valida: modale BLOCCANTE a 2 bottoni.
    // L'operatore Torre può solo annullare o registrare come "In attesa di Autorizzazione".
    // La creazione dell'auth ufficiale è compito esclusivo della Direzione.
    if (tipologia === 'affittuario') {
      const authCheck = checkAutorizzazione(posto, nome)
      if (!authCheck.autorizzato) {
        setAuthMissingModal({
          show: true,
          motivo: authCheck.motivo || 'Autorizzazione non trovata per questa imbarcazione.',
          onProceed: () => {
            const r = registraEntrata(m, { pendente: true })
            if (!r.ok) { setErrorMessage(r.errore || 'Errore durante la registrazione.'); return }
            setAuthMissingModal({ show: false, motivo: '', onProceed: () => { } })
            handleClear()
          }
        })
        return
      }
    }

    // Socio sul proprio posto, o affittuario con auth attiva, o transito: flusso diretto.
    const result = registraEntrata(m)
    if (!result.ok) { setErrorMessage(result.errore || 'Errore durante la registrazione.'); return }
    handleClear()
  }

  const handleUscitaTemporanea = () => {
    if (!validateBase()) return
    if (!posto.trim()) { setErrorMessage('Inserisci il posto barca per l\'uscita temporanea.'); return }
    const result = registraUscitaTemporanea(buildMovement('uscita_temporanea', posto))
    if (!result.ok) { setErrorMessage(result.errore || 'Errore durante l\'uscita temporanea.'); return }
    handleClear()
  }

  const handleUscitaDefinitiva = () => {
    if (!validateBase()) return
    if (tipologia === 'socio') {
      setConfirmMessage('Vuoi rimuovere titolo al proprietario?')
      setConfirmAction(() => () => {
        const r = registraUscitaDefinitiva(buildMovement('uscita_definitiva', posto))
        if (!r.ok) { setErrorMessage(r.errore || 'Errore durante l\'uscita definitiva.') }
        else { handleClear() }
        setShowConfirmPopup(false)
      })
      setShowConfirmPopup(true)
      return
    }
    if (tipologia === 'transito' && !checkPagamentoSaldato(nome)) {
      // Warning BLOCCANTE: la Torre deve confermare esplicitamente.
      setConfirmMessage('Non risulta emessa una ricevuta saldata per questa imbarcazione. Vuoi registrare comunque l\'uscita definitiva?')
      setConfirmAction(() => () => {
        const r = registraUscitaDefinitiva(buildMovement('uscita_definitiva', posto))
        if (!r.ok) { setErrorMessage(r.errore || 'Errore durante l\'uscita definitiva.') }
        else { handleClear() }
        setShowConfirmPopup(false)
      })
      setShowConfirmPopup(true)
      return
    }
    const result = registraUscitaDefinitiva(buildMovement('uscita_definitiva', posto))
    if (!result.ok) { setErrorMessage(result.errore || 'Errore durante l\'uscita definitiva.'); return }
    handleClear()
  }

  const handleSpostamento = () => {
    if (!validateBase()) return
    if (!postoOrigine.trim() || !postoDestinazione.trim()) { setErrorMessage('Inserisci sia il posto di origine che quello di destinazione.'); return }
    const result = registraSpostamento(buildMovement('spostamento', postoDestinazione), postoOrigine, postoDestinazione)
    if (!result.ok) { setErrorMessage(result.errore || 'Errore durante lo spostamento.'); return }
    handleClear()
  }

  const handleCantiere = () => {
    if (!validateBase()) return
    if (!posto.trim()) { setErrorMessage('Inserisci il posto da cui parte la barca (verso il cantiere).'); return }
    ensureBoatExists()
    const result = registraCantiere(buildMovement('cantiere', 'Cantiere'), posto)
    if (!result.ok) { setErrorMessage(result.errore || 'Errore durante la registrazione cantiere.'); return }
    handleClear()
  }

  const handleBunker = () => {
    if (!validateBase()) return
    if (!posto.trim()) { setErrorMessage('Inserisci il posto da cui parte la barca (verso il bunker).'); return }
    ensureBoatExists()
    const result = registraBunker(buildMovement('bunker', 'Bunker'), posto)
    if (!result.ok) { setErrorMessage(result.errore || 'Errore durante la registrazione bunker.'); return }
    handleClear()
  }

  const handleRientro = () => {
    if (!validateBase()) return
    if (!posto.trim()) { setErrorMessage('Inserisci il posto in cui rientra la barca.'); return }
    ensureBoatExists()
    const result = registraRientro(buildMovement('entrata', posto))
    if (!result.ok) { setErrorMessage(result.errore || 'Errore durante la registrazione del rientro.'); return }
    handleClear()
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
              onKeyDown={makeKeyHandler(nomeSuggestions, selectedNomeIdx, setSelectedNomeIdx, s => { if (s.boat) fillFromBoat(s.boat) }, setShowNomeDropdown)}
              placeholder=""
            />
            {showNomeDropdown && renderDropdown(nomeSuggestions, selectedNomeIdx, s => { if (s.boat) fillFromBoat(s.boat) }, setSelectedNomeIdx)}
          </div>

          {/* MATRICOLA */}
          <div className="search-field-wrapper" ref={targaRef}>
            <label> Matricola</label>
            <input
              type="text" value={targa}
              onChange={e => { setTarga(e.target.value); setShowTargaDropdown(true) }}
              onFocus={() => { if (targa.length > 0) setShowTargaDropdown(true) }}
              onKeyDown={makeKeyHandler(targaSuggestions, selectedTargaIdx, setSelectedTargaIdx, s => { if (s.boat) fillFromBoat(s.boat) }, setShowTargaDropdown)}
              placeholder=""
            />
            {showTargaDropdown && renderDropdown(targaSuggestions, selectedTargaIdx, s => { if (s.boat) fillFromBoat(s.boat) }, setSelectedTargaIdx)}
          </div>

          {/* POSTO */}
          <div className="search-field-wrapper" ref={postoRef}>
            <label> Posto</label>
            <input
              type="text" value={posto}
              onChange={e => { setPosto(e.target.value); setShowPostoDropdown(true) }}
              onFocus={() => { if (posto.length > 0) setShowPostoDropdown(true) }}
              onKeyDown={makeKeyHandler(postoSuggestions, selectedPostoIdx, setSelectedPostoIdx, s => { if (s.berth) fillFromBerth(s.berth) }, setShowPostoDropdown)}
              placeholder=""
            />
            {showPostoDropdown && renderDropdown(postoSuggestions, selectedPostoIdx, s => { if (s.berth) fillFromBerth(s.berth) }, setSelectedPostoIdx)}
          </div>
        </div>
      </div>

      {/* Form Body */}
      <div className="quick-panel-body">
        <div className="quick-panel-title">
          <h3>Registra Movimento</h3>

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
                <div className="form-group">
                  <label>Posto di Origine</label>
                  <input type="text" className="posto-input" value={postoOrigine} onChange={e => setPostoOrigine(e.target.value)} placeholder="Es. A 5" />
                </div>
                <div className="spostamento-arrow">→</div>
                <div className="form-group">
                  <label>Posto di Destinazione</label>
                  <input type="text" className="posto-input" value={postoDestinazione} onChange={e => setPostoDestinazione(e.target.value)} placeholder="Es. B 10" />
                </div>
              </div>
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
