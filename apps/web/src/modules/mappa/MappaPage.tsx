import React, { useState } from 'react'
import { Berth, BerthStatus } from '@shared/types'
import { BERTH_STATUS_HEX, BERTH_STATUS_LABELS } from '@shared/constants'
import { MarinaMap } from './components/MarinaMap'
import { BerthDetailDrawer } from './components/BerthDetailDrawer'
import { useGlobalState } from '../../store/GlobalState'

// Stati mostrati nella legenda rapida in cima alla mappa.
// Ordine logico operativo per Torre: prima il libero, poi i presenti,
// poi gli assenti/bloccati. Gli altri stati (riservato, bunker, ecc.)
// appaiono comunque sulla mappa ma non ingombrano la legenda.
const LEGENDA_STATI: BerthStatus[] = [
  'libero',
  'occupato_socio',
  'occupato_transito',
  'occupato_affittuario',
  'socio_assente',
  'in_cantiere',
]

export function MappaPage() {
  const { posti } = useGlobalState()
  const [selectedBerth, setSelectedBerth] = useState<Berth | null>(null)

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      
      {/* Intestazione Mappa */}
      <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg)' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>🗺️</span> Mappa Porto Interattiva
          </h1>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text2)', fontSize: '0.85rem' }}>
            Visualizza in tempo reale lo stato dei pontili e clicca sui posti barca per i dettagli.
          </p>
        </div>

        {/* Legenda rapida — colori e label da @shared/constants */}
        <div style={{ display: 'flex', gap: '14px', fontSize: '0.72rem', fontWeight: 'bold', textTransform: 'uppercase', flexWrap: 'wrap' }}>
          {LEGENDA_STATI.map(stato => (
            <div key={stato} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: BERTH_STATUS_HEX[stato]
              }}></span>
              {BERTH_STATUS_LABELS[stato]}
            </div>
          ))}
        </div>
      </div>

      {/* Area Mappa */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <MarinaMap 
          berths={posti} 
          onBerthSelect={setSelectedBerth} 
        />
      </div>

      {/* Drawer Dettaglio Posto Barca */}
      {selectedBerth && (
        <BerthDetailDrawer berth={selectedBerth} onClose={() => setSelectedBerth(null)} />
      )}
      
    </div>
  )
}
