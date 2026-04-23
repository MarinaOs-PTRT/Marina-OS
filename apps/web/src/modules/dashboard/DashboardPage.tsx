import React from 'react'
import { TopBar } from '../../components/TopBar'
import { KpiCard } from '../../components/KpiCard'
import { BoatList } from './components/BoatList'
import { MovementTable } from './components/MovementTable'
import { ArrivalsPanel } from './components/ArrivalsPanel'
import { QuickMovementPanel } from './components/QuickMovementPanel'
import { BARCHE_DEMO, POSTI_DEMO, MOVIMENTI_DEMO } from '@shared/demo-data'

export function DashboardPage() {
  // Calcolo KPI reali dai dati demo
  const barcheInPorto = BARCHE_DEMO.length
  const postiLiberi = POSTI_DEMO.filter(p => p.stato === 'libero').length
  const barcheTransito = BARCHE_DEMO.filter(b => b.stato === 'occupato_transito').length
  const inCantiere = BARCHE_DEMO.filter(b => b.stato === 'in_cantiere').length
  
  // Movimenti di oggi (simuliamo che tutti i demo siano di oggi)
  const movimentiOggi = MOVIMENTI_DEMO.length

  return (
    <>
      <TopBar 
        title="Dashboard Operativa" 
        subtitle="Riva di Traiano — Vista globale in tempo reale"
      />
      
      <div className="page-container">
        
        {/* KPI Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--space-lg)' }}>
          <KpiCard label="Barche in porto" value={barcheInPorto} color="accent" />
          <KpiCard label="Posti liberi" value={postiLiberi} color="green" />
          <KpiCard label="Transiti" value={barcheTransito} color="teal" />
          <KpiCard label="Movimenti oggi" value={movimentiOggi} color="amber" />
          <KpiCard label="In manutenzione" value={inCantiere} color="red" />
        </div>

        {/* Top Split Section: Quick Registration & Latest Movements */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)', alignItems: 'stretch' }}>
          <QuickMovementPanel />
          <MovementTable />
        </div>

        {/* Bottom Split Section: Boat List & Arrivals */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-xl)', alignItems: 'start', marginTop: 'var(--space-xl)' }}>
          <BoatList />
          <ArrivalsPanel />
        </div>
      </div>
    </>
  )
}
