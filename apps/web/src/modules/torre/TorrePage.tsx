import React, { useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useGlobalState } from '../../store/GlobalState'
import { BERTH_STATUS_LABELS, BERTH_STATUS_HEX } from '@shared/constants'
import { useTorreForm } from './hooks/useTorreForm'
import { SearchDropdown } from './components/SearchDropdown'
import './TorrePage.css'

/**
 * TorrePage — Pagina dedicata alla Registrazione Movimenti.
 *
 * Pattern Oracle Hospitality: il sidebar QuickMovementPanel resta come quick
 * action, ma le operazioni complete avvengono qui in 3 colonne con più aria.
 *
 * Layout (full-width):
 *   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
 *   â”‚ Col 1 — RICERCA          â”‚ Col 2 — TIPOLOGIA & POSTOâ”‚ Col 3 — ANTEPRIMA & AZIONIâ”‚
 *   â”‚   3 SearchDropdown       â”‚   3 bottoni tipologia    â”‚   Riepilogo movimento     â”‚
 *   â”‚   Box dati cliente       â”‚   Spostamento (toggle)   â”‚   Errori/Warning          â”‚
 *   â”‚   Box dati barca         â”‚   Posto + Posti suggeritiâ”‚   Pulsanti azione         â”‚
 *   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
 *   Footer KPI sempre visibile.
 *
 * Tutta la business logic vive in useTorreForm (SSOT). Qui solo presentazione.
 */

// ────────────────────────────────────────────────────────────
// Helper per il box "Ultimo movimento": formato relativo se OGGI,
// altrimenti data assoluta DD/MM/YYYY HH:MM. Decisione utente: la
// percezione di freschezza serve solo per la giornata corrente, oltre
// va meglio l'orientamento esatto (giorno/mese).
// ────────────────────────────────────────────────────────────
function formatMovimentoQuando(data: string | undefined, ora: string | undefined): string {
  const oggi = new Date().toISOString().split('T')[0]
  const dStr = data || oggi
  const oStr = ora || '00:00'
  if (dStr === oggi) {
    // Calcola minuti relativi solo per oggi
    const [h, m] = oStr.split(':').map(Number)
    const eventoDate = new Date()
    eventoDate.setHours(Number.isFinite(h) ? h : 0, Number.isFinite(m) ? m : 0, 0, 0)
    const diffMin = Math.round((Date.now() - eventoDate.getTime()) / 60000)
    if (diffMin < 1) return 'adesso'
    if (diffMin < 60) return `${diffMin} min fa`
    return `oggi ${oStr}`
  }
  // Altrimenti: data assoluta DD/MM/YYYY HH:MM
  const [yyyy, mm, dd] = dStr.split('-')
  if (!yyyy || !mm || !dd) return `${dStr} ${oStr}`
  return `${dd}/${mm}/${yyyy} ${oStr}`
}

// Etichetta + colore semantico per ogni tipo di movimento.
const MOV_TIPO_META: Record<string, { label: string; color: string; bg: string }> = {
  entrata:           { label: 'Entrata',           color: 'var(--color-text-success)', bg: 'var(--color-bg-success)' },
  uscita_temporanea: { label: 'Uscita temporanea', color: 'var(--color-text-info)',    bg: 'var(--color-bg-info)' },
  uscita_definitiva: { label: 'Uscita definitiva', color: 'var(--color-text-danger)',  bg: 'var(--color-bg-danger)' },
  spostamento:       { label: 'Spostamento',       color: 'var(--accent)',             bg: 'var(--accent-light)' },
  cantiere:          { label: 'Cantiere',          color: 'var(--color-text-warning)', bg: 'var(--color-bg-warning)' },
  bunker:            { label: 'Bunker',            color: 'var(--color-text-warning)', bg: 'var(--color-bg-warning)' },
}

export function TorrePage() {
  const { posti, movimenti } = useGlobalState()
  const f = useTorreForm()

  // Pre-popolazione dal query param ?posto=XXX (es. arrivo dal drawer
  // della Dashboard mappa-centrica). Si esegue UNA SOLA VOLTA al mount,
  // così l'utente può poi modificare liberamente il campo.
  // Vedi memoria: dashboard_layout.md (Strada A — mappa = telecomando).
  const [searchParams] = useSearchParams()
  const prefilledRef = useRef(false)
  useEffect(() => {
    if (prefilledRef.current) return
    const qPosto = searchParams.get('posto')
    if (!qPosto) return
    const berth = posti.find(p => p.id === qPosto)
    if (berth) {
      f.fillFromBerth(berth)
      prefilledRef.current = true
    }
  }, [searchParams, posti, f])

  // ════════════════════════════════════════════
  // Shortcut tastiera: DELETE → pulisci tutto
  // ════════════════════════════════════════════
  // Equivalente al click sul bottone "Pulisci tutto" in alto a destra.
  // Funziona anche se il focus è dentro un campo input/textarea (utile:
  // l'operatore Torre digita, vede di aver sbagliato barca, preme Delete
  // e ricomincia senza dover prendere il mouse).
  // L'azione si attiva SOLO con il tasto "Delete" (Canc) puro: non con
  // Backspace, non con Ctrl/Alt/Meta+Delete. Così non interferisce con
  // l'editing normale dei campi (Backspace cancella un carattere,
  // Delete cancella tutto il form).
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Delete') return
      if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return
      e.preventDefault()
      f.handleClear()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [f])

  // KPI calcolati inline (il GlobalState non espone un getKpis dedicato).
  const kpis = useMemo(() => {
    const liberi = posti.filter(p => p.stato === 'libero').length
    const occupati = posti.length - liberi
    const oggi = new Date().toISOString().split('T')[0]
    const movimentiOggi = movimenti.filter(m => m.data === oggi).length
    return { liberi, occupati, movimentiOggi }
  }, [posti, movimenti])

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Anteprima movimento (riepilogo per Col 3)
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const isMovimento = f.panelMode === 'movimento'
  const azioneScelta: string =
    isMovimento
      ? (f.tipologia === 'socio' ? 'Movimento socio' :
         f.tipologia === 'transito' ? 'Movimento transito' :
         f.tipologia === 'affittuario' ? 'Movimento affittuario' : '—')
      : 'Spostamento posto barca'

  const ready =
    (f.nome.trim() || f.targa.trim()) &&
    f.tipologia &&
    (isMovimento ? f.posto.trim() : (f.postoOrigine.trim() && f.postoDestinazione.trim()))

  return (
    <div className="torre-page">
      {/* â”€â”€ HEADER â”€â”€ */}
      <div className="torre-header">
        <div className="torre-header-title">
          <h1>Registrazione Movimenti</h1>
          <span className="torre-header-sub">Operazioni complete con assistenza alla compilazione</span>
        </div>
        <div className="torre-header-actions">
          <button
            type="button"
            className="btn-text"
            onClick={f.handleClear}
            title="Scorciatoia: tasto Canc"
          >Pulisci tutto <span style={{ opacity: 0.55, marginLeft: 6, fontSize: '0.78em' }}>(Canc)</span></button>
        </div>
      </div>

      {/* â”€â”€ 3 COLONNE â”€â”€ */}
      <div className="torre-grid">

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            COL 1 — RICERCA (Nome / Matricola / Posto + dati cliente/barca)
            â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <section className="torre-col">
          <h2 className="torre-col-title">Ricerca imbarcazione</h2>

          <SearchDropdown
            id="torre-nome"
            placeholder="Nome imbarcazione"
            value={f.nome}
            onChange={f.setNome}
            suggestions={f.nomeSuggestions}
            onSelect={s => { if (s.boat) f.fillFromBoat(s.boat) }}
          />

          <SearchDropdown
            id="torre-matricola"
            placeholder="Matricola"
            value={f.targa}
            onChange={v => f.setTarga(v.toUpperCase())}
            suggestions={f.targaSuggestions}
            onSelect={s => { if (s.boat) f.fillFromBoat(s.boat) }}
          />

          <SearchDropdown
            id="torre-posto-cerca"
            placeholder="Posto barca"
            value={f.posto}
            onChange={f.setPosto}
            suggestions={f.postoSuggestions}
            onSelect={s => { if (s.berth) f.fillFromBerth(s.berth) }}
          />

          {/* Box dati cliente (se collegato) */}
          {f.clienteCollegato && (
            <div className="torre-info-box">
              <div className="torre-info-box-title">Cliente</div>
              <div className="torre-info-row"><span>Nome</span><strong>{f.clienteCollegato.nome}</strong></div>
              <div className="torre-info-row"><span>Tipo</span><strong>{f.clienteCollegato.tipo === 'pf' ? 'Persona Fisica' : f.clienteCollegato.tipo === 'az' ? 'Azienda' : 'Socio'}</strong></div>
            </div>
          )}

          {/* Box ULTIMO MOVIMENTO (se barca trovata e con storico).
              Dà all'operatore Torre un colpo d'occhio sull'ultimo evento
              registrato per la barca: tipo, quando, posti coinvolti,
              operatore. L'ordinamento è per data+ora decrescente (vedi
              hook useTorreForm.ultimoMovimento). */}
          {f.ultimoMovimento && (() => {
            const mv = f.ultimoMovimento
            const meta = MOV_TIPO_META[mv.tipo] || { label: mv.tipo, color: 'var(--text2)', bg: 'var(--bg4)' }
            const postoLabel = mv.tipo === 'spostamento' && mv.postoOrigine
              ? `${mv.postoOrigine} → ${mv.posto}`
              : mv.posto || '—'
            return (
              <div className="torre-info-box">
                <div
                  className="torre-info-box-title"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}
                >
                  <span>Ultimo movimento</span>
                  <span style={{
                    fontSize: '0.66rem',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: meta.bg,
                    color: meta.color,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}>{meta.label}</span>
                </div>
                <div className="torre-info-row">
                  <span>Quando</span>
                  <strong className="tabular-nums">{formatMovimentoQuando(mv.data, mv.ora)}</strong>
                </div>
                <div className="torre-info-row">
                  <span>Posto</span>
                  <strong>{postoLabel}</strong>
                </div>
                {mv.operatore && (
                  <div className="torre-info-row">
                    <span>Operatore</span>
                    <strong>{mv.operatore.nome}</strong>
                  </div>
                )}
              </div>
            )
          })()}

          {/* Dati dimensionali — sempre modificabili */}
          <div className="torre-dim-grid">
            <div className="torre-field">
              <label>Lunghezza (m)</label>
              <input type="number" step="0.1" value={f.lunghezza} onChange={e => f.setLunghezza(e.target.value)} placeholder="12.5" />
            </div>
            <div className="torre-field">
              <label>Pescaggio (m)</label>
              <input type="number" step="0.1" value={f.pescaggio} onChange={e => f.setPescaggio(e.target.value)} placeholder="2.1" />
            </div>
          </div>
        </section>

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            COL 2 — TIPOLOGIA & POSTO (scelta movimento + assist)
            â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <section className="torre-col">
          <h2 className="torre-col-title">Tipologia movimento</h2>

          {/* â”€â”€ Selettore Movimento / Spostamento â”€â”€ */}
          <div className="torre-mode-selector">
            <button
              type="button"
              className={`torre-mode-btn ${f.panelMode === 'movimento' ? 'active' : ''}`}
              onClick={() => f.setPanelMode('movimento')}
            >
              Movimento
            </button>
            <button
              type="button"
              className={`torre-mode-btn ${f.panelMode === 'spostamento' ? 'active' : ''}`}
              onClick={() => f.setPanelMode('spostamento')}
            >
              Spostamento
            </button>
          </div>

          {/* â”€â”€ TIPOLOGIA (sempre visibile) â”€â”€ */}
          <div className="torre-tipologia">
            <label className="torre-section-label">Profilo cliente</label>
            <div className="torre-tipologia-row">
              {/*
                LOCK SOCIO (25 Apr 2026) — il bottone Socio è disabilitato
                quando la barca digitata NON esiste in anagrafica. Lo status
                di socio implica un titolo formale: si crea SOLO da
                Direzione → Soci e Assegnazioni → Nuovo Socio. La Torre può
                solo riconoscere un socio già esistente, mai crearlo al volo.
                Vedi memoria: registrazione_pendente_pattern.md
              */}
              <button
                type="button"
                className={`torre-tipologia-btn ${f.tipologia === 'socio' ? 'active socio' : ''}`}
                onClick={() => {
                  if (f.tipologiaLocked) return
                  if (!f.boatExistsInRegistry) return
                  f.setTipologia('socio')
                }}
                disabled={
                  (f.tipologiaLocked && f.tipologia !== 'socio') ||
                  !f.boatExistsInRegistry
                }
                title={
                  !f.boatExistsInRegistry
                    ? 'Solo per soci già registrati. Per creare un nuovo socio: Direzione → Soci e Assegnazioni → Nuovo Socio.'
                    : undefined
                }
              >Socio</button>
              <button
                type="button"
                className={`torre-tipologia-btn ${f.tipologia === 'transito' ? 'active transito' : ''}`}
                onClick={() => { if (!f.tipologiaLocked) f.setTipologia('transito') }}
                disabled={f.tipologiaLocked && f.tipologia !== 'transito'}
              >Transito</button>
              <button
                type="button"
                className={`torre-tipologia-btn ${f.tipologia === 'affittuario' ? 'active affittuario' : ''}`}
                onClick={() => { if (!f.tipologiaLocked) f.setTipologia('affittuario') }}
                disabled={f.tipologiaLocked && f.tipologia !== 'affittuario'}
              >Affittuario</button>
            </div>

            {/* Hint contestuale: spiega perché Socio è disabilitato. */}
            {!f.boatExistsInRegistry && (f.nome.trim() || f.targa.trim()) && (
              <span className="torre-locked-hint">
                Barca non in anagrafica — "Socio" disabilitato. Per registrare un nuovo
                socio passare da Direzione → Soci e Assegnazioni → Nuovo Socio.
              </span>
            )}
            {f.tipologiaLocked && (
              <span className="torre-locked-hint">Profilo rilevato automaticamente dall'anagrafica</span>
            )}
          </div>

          {/* â”€â”€ MOVIMENTO: posti suggeriti per transito â”€â”€ */}
          {f.panelMode === 'movimento' && f.tipologia === 'transito' && f.suggestedBerths.length > 0 && (
            <div className="torre-section">
              <label className="torre-section-label">Posti compatibili ({f.suggestedBerths.length})</label>
              <div className="torre-berths-grid">
                {f.suggestedBerths.slice(0, 24).map(b => (
                  <button
                    type="button"
                    key={b.id}
                    className={`torre-berth-chip ${f.posto === b.id ? 'selected' : ''}`}
                    onClick={() => f.setPosto(b.id)}
                  >
                    <span className="berth-chip-id">{b.id}</span>
                    <span className="berth-chip-dim">{b.lunMax}m</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* â”€â”€ SPOSTAMENTO: origine → destinazione â”€â”€ */}
          {f.panelMode === 'spostamento' && (
            <div className="torre-section">
              <label className="torre-section-label">Origine → Destinazione</label>
              <div className="torre-spostamento-grid">
                <SearchDropdown
                  id="torre-origine"
                  placeholder="Posto di origine"
                  value={f.postoOrigine}
                  onChange={f.setPostoOrigine}
                  suggestions={f.origineSuggestions}
                  onSelect={s => { if (s.berth) f.setPostoOrigine(s.berth.id) }}
                />
                <div className="torre-arrow">→</div>
                <SearchDropdown
                  id="torre-destinazione"
                  placeholder="Posto di destinazione"
                  value={f.postoDestinazione}
                  onChange={f.setPostoDestinazione}
                  suggestions={f.destinazioneSuggestions}
                  onSelect={s => { if (s.berth) f.setPostoDestinazione(s.berth.id) }}
                />
              </div>

              {/* Badge live stato destinazione */}
              {f.destinazioneBerth && (
                <div
                  className="torre-status-badge"
                  style={{ background: BERTH_STATUS_HEX[f.destinazioneBerth.stato] || '#cbd5e1' }}
                >
                  {BERTH_STATUS_LABELS[f.destinazioneBerth.stato] || f.destinazioneBerth.stato}
                  {f.destinazioneBerth.barcaOra && ` · ${f.destinazioneBerth.barcaOra}`}
                </div>
              )}

              {/* â”€â”€ CONTROLLO AUTORIZZAZIONE live (spostamento) â”€â”€ */}
              {f.authDestinazioneInfo.controllato && (
                f.authDestinazioneInfo.autorizzato ? (
                  <div className="torre-auth-ok">
                    <div className="torre-auth-ok-header">
                      <span className="torre-auth-ok-icon">✓</span>
                      <span>Autorizzazione valida</span>
                    </div>
                    {f.authDestinazioneInfo.auth && (
                      <div className="torre-auth-ok-details">
                        <span><strong>Beneficiario:</strong> {f.authDestinazioneInfo.auth.beneficiario}</span>
                        <span><strong>Tipo:</strong> {f.authDestinazioneInfo.auth.tipo}</span>
                        <span><strong>Periodo:</strong> {f.authDestinazioneInfo.auth.dal} → {f.authDestinazioneInfo.auth.al}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="torre-auth-missing">
                    <div className="torre-auth-missing-header">
                      <span className="torre-auth-missing-icon">⚠ </span>
                      <span>Autorizzazione non trovata</span>
                    </div>
                    <p className="torre-auth-missing-desc">{f.authDestinazioneInfo.motivo}</p>
                    <p className="torre-auth-missing-hint">
                      Confermando lo spostamento, il sistema ti chiederà  di procedere come pendente
                      o di annullare l'operazione.
                    </p>
                  </div>
                )
              )}

              {/* Warning dimensionale (non bloccante) */}
              {f.dimensionWarnings.length > 0 && (
                <div className="torre-warning-box">
                  <div className="torre-warning-title">Attenzione dimensioni</div>
                  <ul>{f.dimensionWarnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
                </div>
              )}
            </div>
          )}
        </section>

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            COL 3 — ANTEPRIMA & AZIONI (riepilogo + bottoni)
            â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <section className="torre-col">
          <h2 className="torre-col-title">Anteprima e conferma</h2>

          <div className="torre-summary">
            <div className="torre-summary-row">
              <span>Operazione</span>
              <strong>{azioneScelta}</strong>
            </div>
            <div className="torre-summary-row">
              <span>Imbarcazione</span>
              <strong>{f.nome || f.targa || '—'}</strong>
            </div>
            <div className="torre-summary-row">
              <span>Profilo</span>
              <strong>{f.tipologia ? f.tipologia.charAt(0).toUpperCase() + f.tipologia.slice(1) : '—'}</strong>
            </div>
            {isMovimento ? (
              <div className="torre-summary-row">
                <span>Posto</span>
                <strong>{f.posto || '—'}</strong>
              </div>
            ) : (
              <>
                <div className="torre-summary-row">
                  <span>Da</span>
                  <strong>{f.postoOrigine || '—'}</strong>
                </div>
                <div className="torre-summary-row">
                  <span>A</span>
                  <strong>{f.postoDestinazione || '—'}</strong>
                </div>
              </>
            )}
          </div>

          {/* Errore inline */}
          {f.errorMessage && (
            <div className="torre-error">{f.errorMessage}</div>
          )}

          {/* â”€â”€ AZIONI â”€â”€ */}
          {isMovimento ? (
            <div className="torre-actions">
              <button type="button" className="torre-btn primary entrata" onClick={f.handleEntrata} disabled={!ready}>
                Entrata
              </button>
              <button type="button" className="torre-btn primary uscita" onClick={f.handleUscitaTemporanea} disabled={!ready}>
                Uscita temporanea
              </button>
              <button type="button" className="torre-btn primary uscita-def" onClick={f.handleUscitaDefinitiva} disabled={!ready}>
                Uscita definitiva
              </button>
              <div className="torre-actions-divider">Zone speciali</div>
              <div className="torre-actions-secondary">
                <button type="button" className="torre-btn secondary" onClick={f.handleCantiere} disabled={!ready}>Cantiere</button>
                <button type="button" className="torre-btn secondary" onClick={f.handleBunker} disabled={!ready}>Bunker</button>
                <button type="button" className="torre-btn secondary" onClick={f.handleRientro} disabled={!ready}>Rientro</button>
              </div>
            </div>
          ) : (
            <div className="torre-actions">
              <button
                type="button"
                className="torre-btn primary spostamento"
                onClick={f.handleSpostamento}
                disabled={!ready}
              >
                Conferma spostamento
              </button>
            </div>
          )}
        </section>
      </div>

      {/* â”€â”€ FOOTER KPI â”€â”€ */}
      <div className="torre-footer">
        <div className="torre-kpi"><span>Posti totali</span><strong>{posti.length}</strong></div>
        <div className="torre-kpi"><span>Occupati</span><strong>{kpis.occupati}</strong></div>
        <div className="torre-kpi"><span>Liberi</span><strong>{kpis.liberi}</strong></div>
        <div className="torre-kpi"><span>Movimenti oggi</span><strong>{kpis.movimentiOggi}</strong></div>
      </div>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          MODALI — confirm popup, warning, auth missing
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}

      {f.showConfirmPopup && (
        <div className="modal-overlay" onClick={() => f.setShowConfirmPopup(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Conferma richiesta</h3>
            <p className="modal-message">{f.confirmMessage}</p>
            <div className="modal-actions">
              <button className="torre-btn secondary" onClick={() => f.setShowConfirmPopup(false)}>Annulla</button>
              <button className="torre-btn primary uscita-def" onClick={() => f.confirmAction?.()}>Conferma</button>
            </div>
          </div>
        </div>
      )}

      {f.showWarning && (
        <div className="modal-overlay" onClick={() => f.setShowWarning(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Avviso</h3>
            <p className="modal-message">{f.warningMessage}</p>
            <div className="modal-actions">
              <button className="torre-btn primary entrata" onClick={() => f.setShowWarning(false)}>Ho capito</button>
            </div>
          </div>
        </div>
      )}

      {f.authMissingModal.show && (
        <div className="modal-overlay" onClick={() => f.setAuthMissingModal({ show: false, motivo: '', onProceed: () => { } })}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Autorizzazione non trovata</h3>
            <p className="modal-message">{f.authMissingModal.motivo}</p>
            <p className="modal-message-sub">
              L'autorizzazione Ã¨ un documento formale gestito dalla Direzione.
              Puoi registrare comunque l'ingresso come <strong>"In attesa di Autorizzazione"</strong>:
              la Direzione riceverÃ  una notifica per compilare il documento.
            </p>
            <div className="modal-actions">
              <button
                className="torre-btn secondary"
                onClick={() => f.setAuthMissingModal({ show: false, motivo: '', onProceed: () => { } })}
              >Annulla</button>
              <button
                className="torre-btn primary entrata"
                onClick={() => f.authMissingModal.onProceed()}
              >Registra come Pendente</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

