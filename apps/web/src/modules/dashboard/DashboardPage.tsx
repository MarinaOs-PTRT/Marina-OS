import React from 'react'
import { TopBar } from '../../components/TopBar'
import { KpiCard } from '../../components/KpiCard'
import { BoatList } from './components/BoatList'
import { MovementTable } from './components/MovementTable'
import { ArrivalsPanel } from './components/ArrivalsPanel'
import { QuickMovementPanel } from './components/QuickMovementPanel'
import { useGlobalState } from '../../store/GlobalState'

export function DashboardPage() {
  const { barche, posti, movimenti } = useGlobalState()

  // Calcolo KPI reali dai dati globali
  const barcheInPorto = barche.length
  const postiLiberi = posti.filter(p => p.stato === 'libero').length
  const barcheTransito = barche.filter(b => b.stato === 'occupato_transito').length
  const inCantiere = barche.filter(b => b.stato === 'in_cantiere').length
  
  const movimentiOggi = movimenti.length

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
