import React, { useState, useMemo } from 'react'
import { TopBar } from '../../components/TopBar'
import { KpiCard } from '../../components/KpiCard'
import { FilterBar } from './components/FilterBar'
import { RegistroTable } from './components/RegistroTable'
import { MovementDetailDrawer } from './components/MovementDetailDrawer'
import { useGlobalState } from '../../store/GlobalState'
import { Movement } from '@shared/types'

export function RegistroPage() {
  const { movimenti } = useGlobalState()
  const [filterType, setFilterType] = useState('tutti')
  const [filterScenario, setFilterScenario] = useState('tutti')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null)

  // Filter Logic
  const filteredMovements = useMemo(() => {
    return movimenti.filter(m => {
      // 1. Tipo
      if (filterType !== 'tutti' && m.tipo !== filterType) return false
      // 2. Scenario
      if (filterScenario !== 'tutti' && m.scenario !== filterScenario) return false
      // 3. Search
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase()
        if (
          !m.nome.toLowerCase().includes(q) &&
          !m.matricola?.toLowerCase().includes(q) &&
          !m.posto?.toLowerCase().includes(q)
        ) {
          return false
        }
      }
      return true
    })
  }, [filterType, filterScenario, searchQuery])

  // KPI Calculation
  const totMovements = filteredMovements.length
  const totEntrate = filteredMovements.filter(m => m.tipo === 'entrata').length
  const totUscite = filteredMovements.filter(m => m.tipo === 'uscita').length
  const totTransiti = filteredMovements.filter(m => m.scenario === 'transito').length

  return (
    <>
      <TopBar 
        title="Registro Movimenti" 
        subtitle="Archivio Storico ed Esportazione"
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-outline" style={{ background: 'var(--bg3)', color: 'var(--text)' }}>Esporta CSV</button>
            <button className="btn btn-outline" style={{ background: 'var(--bg3)', color: 'var(--text)' }}>Stampa</button>
          </div>
        }
      />
      
      {/* Filters */}
      <FilterBar 
        filterType={filterType} setFilterType={setFilterType}
        filterScenario={filterScenario} setFilterScenario={setFilterScenario}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
      />

      <div className="page-container" style={{ paddingTop: 'var(--space-md)' }}>
        
        {/* KPI Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
          <KpiCard label="Movimenti Totali" value={totMovements} color="accent" />
          <KpiCard label="Entrate" value={totEntrate} color="green" />
          <KpiCard label="Uscite" value={totUscite} color="amber" />
          <KpiCard label="Coinvolgono Transiti" value={totTransiti} color="teal" />
        </div>

        {/* Table */}
        <RegistroTable movements={filteredMovements} onSelect={setSelectedMovement} />

      </div>

      {/* Drawer */}
      <MovementDetailDrawer movement={selectedMovement} onClose={() => setSelectedMovement(null)} />
    </>
  )
}
