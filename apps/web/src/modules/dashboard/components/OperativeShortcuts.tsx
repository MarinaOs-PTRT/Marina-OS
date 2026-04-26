import React from 'react'
import { Link } from 'react-router-dom'
import { useGlobalState } from '../../../store/GlobalState'
import './OperativeShortcuts.css'

export function OperativeShortcuts() {
  const { posti, barche } = useGlobalState()

  // Contatori live
  const transitiDaCompletare = barche.filter(b => b.registrazioneCompleta === false).length
  const postiLiberi = posti.filter(p => p.stato === 'libero').length
  const barcheInPorto = posti.filter(p => p.stato !== 'libero' && p.stato !== 'in_cantiere').length
  const inCantiere = posti.filter(p => p.stato === 'in_cantiere').length

  return (
    <div className="op-shortcuts">
      <div className="op-shortcuts-header">
        <h3>Accesso rapido</h3>
        <span className="op-shortcuts-sub">Moduli operativi</span>
      </div>

      <div className="op-shortcuts-grid">

        {/* Torre */}
        <Link to="/torre" className="op-tile">
          <div className="op-tile-icon op-icon-torre">
            <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 2L3 7v11h5v-5h4v5h5V7L10 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="op-tile-label">Torre</div>
          <div className="op-tile-sub">Registra movimenti</div>
          <div className="op-tile-badge op-badge-blue">{barcheInPorto} in porto</div>
        </Link>

        {/* Registrazione Transiti */}
        <Link to="/registrazione-transiti" className="op-tile">
          <div className="op-tile-icon op-icon-transiti">
            <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M10 6.5v4l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="op-tile-label">Transiti</div>
          <div className="op-tile-sub">Anagrafica e cassa</div>
          {transitiDaCompletare > 0
            ? <div className="op-tile-badge op-badge-amber">{transitiDaCompletare} da completare</div>
            : <div className="op-tile-badge op-badge-green">Tutto in ordine</div>
          }
        </Link>

        {/* Mappa */}
        <Link to="/mappa" className="op-tile">
          <div className="op-tile-icon op-icon-mappa">
            <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 5l5-2 4 2 5-2v12l-5 2-4-2-5 2V5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
              <line x1="8" y1="3" x2="8" y2="17" stroke="currentColor" strokeWidth="1.4"/>
              <line x1="12" y1="5" x2="12" y2="17" stroke="currentColor" strokeWidth="1.4"/>
            </svg>
          </div>
          <div className="op-tile-label">Mappa</div>
          <div className="op-tile-sub">Vista piantina porto</div>
          <div className="op-tile-badge op-badge-green">{postiLiberi} posti liberi</div>
        </Link>

        {/* Tariffe */}
        <Link to="/tariffe" className="op-tile">
          <div className="op-tile-icon op-icon-tariffe">
            <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 3v14M6.5 6.5h5a2 2 0 0 1 0 4H6.5m0 0H12a2 2 0 0 1 0 4H6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="op-tile-label">Tariffe</div>
          <div className="op-tile-sub">Calcola conto</div>
          <div className="op-tile-badge op-badge-neutral">Listino aggiornato</div>
        </Link>

        {/* Soci */}
        <Link to="/soci" className="op-tile">
          <div className="op-tile-icon op-icon-soci">
            <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M4 17c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="op-tile-label">Soci</div>
          <div className="op-tile-sub">Anagrafica clienti</div>
          <div className="op-tile-badge op-badge-neutral">Registro</div>
        </Link>

        {/* Manutenzione */}
        <Link to="/manutenzione" className="op-tile">
          <div className="op-tile-icon op-icon-manutenzione">
            <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.5 4.5a3 3 0 0 0-4.24 4.24L4 16l1 1 7.26-7.26A3 3 0 0 0 15.5 4.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="op-tile-label">Cantiere</div>
          <div className="op-tile-sub">Lavori e manutenzione</div>
          {inCantiere > 0
            ? <div className="op-tile-badge op-badge-red">{inCantiere} in cantiere</div>
            : <div className="op-tile-badge op-badge-neutral">Nessun lavoro</div>
          }
        </Link>

      </div>
    </div>
  )
}
