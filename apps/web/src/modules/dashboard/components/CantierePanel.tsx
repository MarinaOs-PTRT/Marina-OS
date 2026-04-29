import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useGlobalState } from '../../../store/GlobalState'
import './CantierePanel.css'

interface CantierePanelProps {
  onClose?: () => void
}

/** Formatta una data ISO in italiano: "15 apr 2026" */
function formatData(iso: string): string {
  const mesi = ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic']
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return `${d.getDate()} ${mesi[d.getMonth()]} ${d.getFullYear()}`
}

export function CantierePanel({ onClose }: CantierePanelProps = {}) {
  const {
    cantieri, barche, posti, clienti,
    barcaSulPosto, titoloAttivoDelBerth,
  } = useGlobalState()

  const aperte = useMemo(() => {
    return cantieri
      .filter(c => !c.fine)
      .sort((a, b) => a.inizio.localeCompare(b.inizio))
  }, [cantieri])

  return (
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
              const boat   = barche.find(b => b.id === cs.boatId)
              const berth  = posti.find(p => p.id === cs.berthOriginale)
              const titolo = titoloAttivoDelBerth(cs.berthOriginale)
              const socio  = titolo ? clienti.find(c => c.id === titolo.clientId) : undefined
              const occupanteCorrente = barcaSulPosto(cs.berthOriginale)
              const occupanteCliente  = occupanteCorrente
                ? clienti.find(c => c.id === occupanteCorrente.clientId)
                : undefined

              const giorni = Math.max(0, Math.floor(
                (Date.now() - new Date(cs.inizio).getTime()) / 86400000
              ))
              const giorniLabel = giorni === 0 ? 'oggi'
                : giorni === 1 ? '1 giorno'
                : `${giorni} giorni`

              const postLabel = berth?.pontile
                ? `${cs.berthOriginale} · ${berth.pontile}`
                : cs.berthOriginale

              let occupanteWarn = ''
              if (occupanteCorrente) {
                if (titolo?.boatId === occupanteCorrente.id) {
                  occupanteWarn = 'Anomalia: barca in cantiere ma Stay aperto sul posto'
                } else {
                  const nomeOcc = occupanteCliente?.nome ?? 'Affittuario'
                  occupanteWarn = `Posto occupato da: ${occupanteCorrente.nome} (${nomeOcc})`
                }
              }

              return (
                <div key={cs.id} className="cantiere-card">
                  {/* Riga titolo: nome barca + matricola */}
                  <div className="cantiere-card-head">
                    <span className="cantiere-card-boat">
                      {boat?.nome ?? `Barca #${cs.boatId}`}
                    </span>
                    {boat?.matricola && (
                      <span className="cantiere-card-mat">{boat.matricola}</span>
                    )}
                  </div>

                  {/* Griglia di dettaglio con etichette esplicite */}
                  <div className="cantiere-card-grid">
                    <span className="cantiere-card-label">Tornerà a</span>
                    <span className="cantiere-card-value cantiere-card-posto">{postLabel}</span>

                    {socio && (
                      <>
                        <span className="cantiere-card-label">Socio</span>
                        <span className="cantiere-card-value">{socio.nome}</span>
                      </>
                    )}

                    <span className="cantiere-card-label">Fuori dal</span>
                    <span className="cantiere-card-value cantiere-card-date">
                      {formatData(cs.inizio)}
                      <span className="cantiere-card-days">{giorniLabel}</span>
                    </span>

                    {cs.note && (
                      <>
                        <span className="cantiere-card-label">Note</span>
                        <span className="cantiere-card-value cantiere-card-note">{cs.note}</span>
                      </>
                    )}
                  </div>

                  {/* Warning occupante */}
                  {occupanteWarn && (
                    <div className="cantiere-card-warn">{occupanteWarn}</div>
                  )}

                  {/* Azione */}
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
