import React, { useState } from 'react'
import { Berth, BerthVisualState } from '@shared/types'
import { BERTH_VISUAL_HEX, BERTH_VISUAL_LABELS } from '@shared/constants'
import { TopBar } from '../../components/TopBar'
import { MarinaMap } from '../mappa/components/MarinaMap'
import { BerthDetailDrawer } from '../mappa/components/BerthDetailDrawer'
import { useGlobalState } from '../../store/GlobalState'
import { ArrivalsPanel } from './components/ArrivalsPanel'
import { PendingRegistrationsPanel } from './components/PendingRegistrationsPanel'
import { PlanciaPanel } from './components/PlanciaPanel'
import './DashboardPage.css'

// Stati mostrati nella legenda rapida sopra la mappa (modello v3).
// Ordine logico operativo per Torre: prima libero, poi i presenti,
// poi gli assenti/bloccati. Stessa scelta di MappaPage per coerenza UX.
const LEGENDA_STATI: BerthVisualState[] = [
  'libero',
  'socio_presente',
  'transito',
  'affittuario_su_socio',
  'socio_assente',
  'socio_in_cantiere',
]

/**
 * DashboardPage — Centrale operativa mappa-centrica.
 *
 * Architettura "Strada A" (Apr 2026): la mappa è il TELECOMANDO VISIVO della
 * Torre. Click su un posto → drawer con dettagli + bottone "Registra
 * movimento" che porta su /torre?posto=XXX. Le azioni di registrazione NON
 * vivono qui: sono centralizzate sulla TorrePage (rotta /torre), unico punto
 * d'ingresso strutturato per i movimenti.
 *
 * Layout (desktop ≥ 1280px):
 *   ┌──────────────────────────────────────────────────────────────┐
 *   │ Header (titolo + data/ora). NIENTE pill — info ridondanti.   │
 *   ├───────────────────────────────────────────┬──────────────────┤
 *   │  MAPPA (65%)                              │  PLANCIA (35%)   │
 *   │  click su posto → drawer                  │  meteo + cons.   │
 *   ├──────────────────────────┬────────────────┴──────────────────┤
 *   │  Arrivi previsti (50%)   │  Transiti pendenti (50%)          │
 *   └──────────────────────────┴───────────────────────────────────┘
 *
 * Vedi memoria: dashboard_layout.md, ui_ingressi.md
 */
export function DashboardPage() {
  const { posti } = useGlobalState()
  const [selectedBerth, setSelectedBerth] = useState<Berth | null>(null)

  const oggi = new Date().toLocaleDateString('it-IT', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
  const ora = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })

  return (
    <>
      <TopBar
        title="Dashboard operativa"
        subtitle={`Riva di Traiano · ${oggi} · ${ora}`}
      />

      <div className="dashboard-page">

        {/* ── FASCIA SUPERIORE: Mappa (65%) + Plancia (35%) ── */}
        <section className="dashboard-top">

          <div className="dashboard-map-wrap">
            {/* Header mappa: titolo + legenda compatta (chip stato berth) */}
            <div className="dashboard-map-header">
              <span className="dashboard-map-title">Mappa porto</span>
              <div className="dashboard-map-legend">
                {LEGENDA_STATI.map(stato => (
                  <span key={stato} className="dashboard-map-legend-item">
                    <span
                      className="dashboard-map-legend-dot"
                      style={{ background: BERTH_VISUAL_HEX[stato] }}
                    />
                    {BERTH_VISUAL_LABELS[stato]}
                  </span>
                ))}
              </div>
            </div>
            <div className="dashboard-map-canvas">
              <MarinaMap berths={posti} onBerthSelect={setSelectedBerth} />
            </div>
          </div>

          <PlanciaPanel />
        </section>

        {/* ── FASCIA INFERIORE: Arrivi previsti + Transiti pendenti ── */}
        <section className="dashboard-bottom">
          <ArrivalsPanel />
          <PendingRegistrationsPanel />
        </section>
      </div>

      {/* ── DRAWER dettaglio posto (overlay sopra tutto) ── */}
      {selectedBerth && (
        <BerthDetailDrawer
          berth={selectedBerth}
          onClose={() => setSelectedBerth(null)}
        />
      )}
    </>
  )
}
