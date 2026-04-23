import React, { useState } from 'react'
import { Berth } from '@shared/types'
import { MarinaMap } from './components/MarinaMap'
import { BerthDetailDrawer } from './components/BerthDetailDrawer'
import { useGlobalState } from '../../store/GlobalState'

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

        {/* Legenda rapida */}
        <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--green)' }}></span> Libero
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--red)' }}></span> Occupato
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--amber)' }}></span> Assente
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--blue)' }}></span> Cantiere
          </div>
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
