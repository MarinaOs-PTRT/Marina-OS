import React, { useState, useMemo } from 'react'
import { TopBar } from '../../components/TopBar'
import { KpiCard } from '../../components/KpiCard'
import { MaintenanceTable } from './components/MaintenanceTable'
import { ReportTable } from './components/ReportTable'
import { MaintenanceForm } from './components/MaintenanceForm'
import { ReportForm } from './components/ReportForm'
import { MANUTENZIONI_DEMO, SEGNALAZIONI_DEMO } from '@shared/demo-data'
import { MaintenanceJob, Report } from '@shared/types'
import './ManutenzioniPage.css'

type ActiveTab = 'subacquei' | 'segnalazioni'
type StatoFilter = 'tutti' | 'dafare' | 'incorso' | 'completato' | 'urgente'

export function ManutenzioniPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('subacquei')
  const [filtroStato, setFiltroStato] = useState<StatoFilter>('tutti')
  const [showForm, setShowForm] = useState(false)

  // Combine all items for KPI
  const allItems = [...MANUTENZIONI_DEMO, ...SEGNALAZIONI_DEMO]
  const kpiUrgenti = allItems.filter(i => i.urgenza === 'urgente' && i.stato !== 'completato').length
  const kpiDaFare = allItems.filter(i => i.stato === 'dafare').length
  const kpiInCorso = allItems.filter(i => i.stato === 'incorso').length
  const kpiCompletati = allItems.filter(i => i.stato === 'completato').length

  // Filtered data
  const filteredManutenzioni = useMemo(() => {
    return MANUTENZIONI_DEMO.filter(m => {
      if (filtroStato === 'tutti') return true
      if (filtroStato === 'urgente') return m.urgenza === 'urgente' && m.stato !== 'completato'
      return m.stato === filtroStato
    })
  }, [filtroStato])

  const filteredSegnalazioni = useMemo(() => {
    return SEGNALAZIONI_DEMO.filter(s => {
      if (filtroStato === 'tutti') return true
      if (filtroStato === 'urgente') return s.urgenza === 'urgente' && s.stato !== 'completato'
      return s.stato === filtroStato
    })
  }, [filtroStato])

  const handleNewItem = () => {
    setShowForm(!showForm)
  }

  return (
    <>
      <TopBar 
        title="Manutenzioni Porto" 
        subtitle="Lavori subacquei e segnalazioni infrastrutturali"
      />
      
      <div className="page-container">
        
        {/* KPI Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-lg)' }}>
          <KpiCard label="Urgenti" value={kpiUrgenti} color="red" />
          <KpiCard label="Da Fare" value={kpiDaFare} color="amber" />
          <KpiCard label="In Corso" value={kpiInCorso} color="teal" />
          <KpiCard label="Completati" value={kpiCompletati} color="green" />
        </div>

        {/* Filters + Tabs Bar */}
        <div className="maint-controls">
          <div className="maint-tabs">
            <button 
              className={`maint-tab ${activeTab === 'subacquei' ? 'active' : ''}`}
              onClick={() => { setActiveTab('subacquei'); setShowForm(false) }}
            >
              Lavori Subacquei
            </button>
            <button 
              className={`maint-tab ${activeTab === 'segnalazioni' ? 'active' : ''}`}
              onClick={() => { setActiveTab('segnalazioni'); setShowForm(false) }}
            >
              Segnalazioni
            </button>
          </div>
          
          <div className="maint-filters">
            {(['tutti', 'urgente', 'dafare', 'incorso', 'completato'] as StatoFilter[]).map(f => (
              <button
                key={f}
                className={`filter-chip ${filtroStato === f ? 'active' : ''}`}
                onClick={() => setFiltroStato(f)}
              >
                {f === 'tutti' ? 'Tutti' : f === 'urgente' ? 'Urgenti' : f === 'dafare' ? 'Da Fare' : f === 'incorso' ? 'In Corso' : 'Completati'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="maint-content">
          <div className="maint-content-header">
            <h2>{activeTab === 'subacquei' ? `Lavori Subacquei (${filteredManutenzioni.length})` : `Segnalazioni (${filteredSegnalazioni.length})`}</h2>
            <button className="btn btn-mode-entrata" onClick={handleNewItem}>
              {showForm ? 'Chiudi' : activeTab === 'subacquei' ? '+ Nuovo Lavoro' : '+ Nuova Segnalazione'}
            </button>
          </div>

          {/* Inline Form (toggled) */}
          {showForm && (
            <div className="maint-form-wrapper">
              {activeTab === 'subacquei' ? (
                <MaintenanceForm onClose={() => setShowForm(false)} />
              ) : (
                <ReportForm onClose={() => setShowForm(false)} />
              )}
            </div>
          )}

          {/* Table */}
          {activeTab === 'subacquei' ? (
            <MaintenanceTable data={filteredManutenzioni} />
          ) : (
            <ReportTable data={filteredSegnalazioni} />
          )}
        </div>

      </div>
    </>
  )
}
