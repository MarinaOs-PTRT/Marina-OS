import React from 'react'
import { useGlobalState } from '../../../store/GlobalState'
import './DashboardKpiPanel.css'

interface DashboardKpiPanelProps {
  /** Se true, il KPI "In cantiere" appare in stato "attivo" (pannello aperto). */
  cantiereOpen?: boolean
  /** Handler click sul KPI "In cantiere". Se omesso il KPI non è cliccabile. */
  onToggleCantiere?: () => void
}

/**
 * DashboardKpiPanel — riga KPI live operativi (M-04, 27 Apr 2026).
 *
 * Posizionato in fascia alta della Dashboard, sopra la mappa.
 * Mostra 4 indicatori derivati a runtime dal modello v3:
 *   1. Transiti in porto (Stay aperti tipologia 'transito')
 *   2. Affittuari/Ospiti attivi (Stay aperti aff./ospite/amico)
 *   3. Posti liberi (getStatoVisivoBerth === 'libero', su totale)
 *   4. In cantiere (CantiereSession aperte) — CLICCABILE: apre il
 *      CantierePanel sottostante.
 *
 * Tutti i numeri si aggiornano in tempo reale dopo ogni movimento perché
 * derivano dalle query del context, non da snapshot.
 */
export function DashboardKpiPanel({ cantiereOpen, onToggleCantiere }: DashboardKpiPanelProps) {
  const { stays, cantieri, posti, getStatoVisivoBerth } = useGlobalState()

  const transiti = stays.filter(s => !s.fine && s.tipologia === 'transito').length
  const affittuari = stays.filter(s => !s.fine && (
    s.tipologia === 'affittuario' || s.tipologia === 'ospite' || s.tipologia === 'amico'
  )).length
  const inCantiere = cantieri.filter(c => !c.fine).length

  const totPosti = posti.length
  const liberi = posti.filter(p => getStatoVisivoBerth(p.id) === 'libero').length

  const cantiereCliccabile = !!onToggleCantiere

  return (
    <div className="kpi-panel">
      <div className="kpi-cell kpi-cell-accent">
        <div className="kpi-cell-label">Transiti in porto</div>
        <div className="kpi-cell-value">{transiti}</div>
      </div>
      <div className="kpi-cell kpi-cell-purple">
        <div className="kpi-cell-label">Affittuari attivi</div>
        <div className="kpi-cell-value">{affittuari}</div>
      </div>
      <div className="kpi-cell kpi-cell-green">
        <div className="kpi-cell-label">Posti liberi</div>
        <div className="kpi-cell-value">
          {liberi}<span className="kpi-cell-of">/{totPosti}</span>
        </div>
      </div>
      <button
        type="button"
        className={[
          'kpi-cell',
          'kpi-cell-warning',
          cantiereCliccabile ? 'kpi-cell-clickable' : '',
          cantiereOpen ? 'kpi-cell-active' : '',
        ].filter(Boolean).join(' ')}
        onClick={cantiereCliccabile ? onToggleCantiere : undefined}
        disabled={!cantiereCliccabile}
        aria-pressed={cantiereOpen}
        aria-label={cantiereOpen ? 'Chiudi elenco barche in cantiere' : 'Mostra elenco barche in cantiere'}
      >
        <div className="kpi-cell-label">
          In cantiere
          {cantiereCliccabile && (
            <span className="kpi-cell-chevron" aria-hidden="true">
              {cantiereOpen ? '▴' : '▾'}
            </span>
          )}
        </div>
        <div className="kpi-cell-value">{inCantiere}</div>
      </button>
    </div>
  )
}
