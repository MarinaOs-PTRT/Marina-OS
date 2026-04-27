import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useGlobalState } from '../../../store/GlobalState'
import './CantierePanel.css'

interface CantierePanelProps {
  /** Handler chiusura pannello. Quando passato, il pannello mostra una "X". */
  onClose?: () => void
}

/**
 * CantierePanel — pannello centrale espandibile delle barche in cantiere
 * esterno (M-04, 27 Apr 2026).
 *
 * Filosofia (Ale): "il cantiere per noi è come se la barca uscisse dal porto,
 * non ci interessa cosa fa, perché ci va. Annotiamo solo il movimento.
 * Siccome molte barche stazionano lì per mesi lasciando i posti vuoti,
 * è utile sapere che sono in cantiere".
 *
 * Si apre/chiude cliccando il KPI "In cantiere" nella riga KPI sopra la
 * mappa. Default: chiuso. Nella Dashboard è renderizzato condizionalmente
 * dall'effetto stato `mostraCantiere`.
 *
 * Lista delle `CantiereSession` aperte ordinata dalla più vecchia in cima
 * (catturano l'attenzione, sono quelle "dimenticate"). Per ogni sessione:
 *  - nome barca + matricola
 *  - socio proprietario del posto originale
 *  - posto originale + pontile
 *  - giorni in cantiere
 *  - stato corrente del posto: vuoto o occupato da affittuario/ospite
 *  - bottone "Registra rientro" → /torre?posto=<berthOriginale>
 *
 * Modello dati v3: legge da `cantieri[]` (CantiereSession) + query derivate
 * (`barcaSulPosto`, `titoloAttivoDelBerth`).
 */
export function CantierePanel({ onClose }: CantierePanelProps = {}) {
  const {
    cantieri, barche, posti, clienti,
    barcaSulPosto, titoloAttivoDelBerth,
  } = useGlobalState()

  // Sessioni aperte (fine === undefined), ordinate da inizio crescente.
  const aperte = useMemo(() => {
    return cantieri
      .filter(c => !c.fine)
      .sort((a, b) => a.inizio.localeCompare(b.inizio))
  }, [cantieri])

  return (
    // Overlay esterno (backdrop): click su area esterna chiude il modale.
    // Pattern coerente con BerthDetailDrawer (overlay + stopPropagation interno).
    <div
      className="cantiere-modal-overlay"
      onClick={onClose}
      role={onClose ? 'dialog' : undefined}
      aria-modal={onClose ? 'true' : undefined}
      aria-label="Barche in cantiere"
    >
    <div className="cantiere-panel" onClick={e => e.stopPropagation()}>
      <div className="cantiere-panel-header">
        <span className="cantiere-panel-title">Barche in Cantiere</span>
        <span className="cantiere-panel-count">{aperte.length}</span>
        {onClose && (
          <button
            type="button"
            className="cantiere-panel-close"
            onClick={onClose}
            aria-label="Chiudi pannello"
          >
            ✕
          </button>
        )}
      </div>

      {aperte.length === 0 ? (
        <div className="cantiere-empty">
          Nessuna barca attualmente in cantiere.
        </div>
      ) : (
        <div className="cantiere-list">
          {aperte.map(cs => {
            const boat = barche.find(b => b.id === cs.boatId)
            const berth = posti.find(p => p.id === cs.berthOriginale)
            const titolo = titoloAttivoDelBerth(cs.berthOriginale)
            const socio = titolo ? clienti.find(c => c.id === titolo.clientId) : undefined
            const occupanteCorrente = barcaSulPosto(cs.berthOriginale)
            const occupanteCliente = occupanteCorrente
              ? clienti.find(c => c.id === occupanteCorrente.clientId)
              : undefined

            const giorni = Math.max(0, Math.floor(
              (Date.now() - new Date(cs.inizio).getTime()) / 86400000
            ))

            // Etichetta "tipo" dell'occupante per chiarezza UX.
            // Se l'occupante è la barca del socio stesso, è una stranezza:
            // la barca è in cantiere ma c'è anche uno Stay aperto?
            // (caso edge, possibile durante migrazione dati o bug). Lo
            // mostriamo per visibilità.
            let occupanteLabel = ''
            if (occupanteCorrente) {
              if (titolo?.boatId === occupanteCorrente.id) {
                occupanteLabel = `Posto attualmente occupato dalla stessa barca (anomalia)`
              } else if (occupanteCliente?.tipo === 'so') {
                occupanteLabel = `Posto occupato da socio temporaneo: ${occupanteCorrente.nome}`
              } else {
                occupanteLabel = `Posto occupato da: ${occupanteCorrente.nome} (${occupanteCliente?.nome ?? 'Affittuario'})`
              }
            }

            return (
              <div key={cs.id} className="cantiere-card">
                <div className="cantiere-card-main">
                  <div className="cantiere-card-line1">
                    <span className="cantiere-card-boat">
                      {boat?.nome ?? `Barca #${cs.boatId}`}
                    </span>
                    {boat?.matricola && (
                      <span className="cantiere-card-mat">{boat.matricola}</span>
                    )}
                  </div>
                  <div className="cantiere-card-line2">
                    <span className="cantiere-card-place">
                      {cs.berthOriginale}
                      {berth?.pontile ? ` · ${berth.pontile}` : ''}
                    </span>
                    {socio && (
                      <span className="cantiere-card-socio">{socio.nome}</span>
                    )}
                    <span className="cantiere-card-days">
                      {giorni === 0 ? 'oggi' : giorni === 1 ? '1 giorno' : `${giorni} giorni`}
                    </span>
                  </div>
                  {occupanteLabel && (
                    <div className="cantiere-card-line3">
                      {occupanteLabel}
                    </div>
                  )}
                  {cs.note && (
                    <div className="cantiere-card-note">{cs.note}</div>
                  )}
                </div>
                <div className="cantiere-card-actions">
                  <Link
                    to={`/torre?posto=${encodeURIComponent(cs.berthOriginale)}`}
                    className="btn btn-outline btn-sm"
                  >
                    Registra rientro
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
    </div>
  )
}
