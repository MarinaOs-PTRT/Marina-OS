import React, { useState, useMemo } from 'react'
import { TopBar } from '../../components/TopBar'
import { KpiCard } from '../../components/KpiCard'
import { MaintenanceTable } from './components/MaintenanceTable'
import { ReportTable } from './components/ReportTable'
import { MaintenanceForm } from './components/MaintenanceForm'
import { ReportForm } from './components/ReportForm'
import { useGlobalState } from '../../store/GlobalState'
import './ManutenzioniPage.css'

type ActiveTab = 'subacquei' | 'segnalazioni'
type StatoFilter = 'tutti' | 'dafare' | 'incorso' | 'completato' | 'urgente'

export function ManutenzioniPage() {
  const {
    manutenzioni, segnalazioni,
    updateManutenzioneStato, updateSegnalazioneStato,
  } = useGlobalState()

  const [activeTab, setActiveTab] = useState<ActiveTab>('subacquei')
  const [filtroStato, setFiltroStato] = useState<StatoFilter>('tutti')
  const [showForm, setShowForm] = useState(false)

  // KPI strip — unisce entrambe le liste
  const allItems = [...manutenzioni, ...segnalazioni]
  const kpiUrgenti   = allItems.filter(i => i.urgenza === 'urgente' && i.stato !== 'completato').length
  const kpiDaFare    = allItems.filter(i => i.stato === 'dafare').length
  const kpiInCorso   = allItems.filter(i => i.stato === 'incorso').length
  const kpiCompletati= allItems.filter(i => i.stato === 'completato').length

  const filteredManutenzioni = useMemo(() => {
    return manutenzioni.filter(m => {
      if (filtroStato === 'tutti')    return true
      if (filtroStato === 'urgente')  return m.urgenza === 'urgente' && m.stato !== 'completato'
      return m.stato === filtroStato
    })
  }, [manutenzioni, filtroStato])

  const filteredSegnalazioni = useMemo(() => {
    return segnalazioni.filter(s => {
      if (filtroStato === 'tutti')    return true
      if (filtroStato === 'urgente')  return s.urgenza === 'urgente' && s.stato !== 'completato'
      return s.stato === filtroStato
    })
  }, [segnalazioni, filtroStato])

  const filtroLabels: Record<StatoFilter, string> = {
    tutti:      'Tutti',
    urgente:    'Urgenti',
    dafare:     'Da Fare',
    incorso:    'In Corso',
    completato: 'Completati',
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
          <KpiCard label="Urgenti"    value={kpiUrgenti}    color="red"   />
          <KpiCard label="Da Fare"    value={kpiDaFare}     color="amber" />
          <KpiCard label="In Corso"   value={kpiInCorso}    color="teal"  />
          <KpiCard label="Completati" value={kpiCompletati} color="green" />
        </div>

        {/* Tab bar + filtri */}
        <div className="maint-controls">
          <div className="maint-tabs">
            <button
              className={`maint-tab ${activeTab === 'subacquei' ? 'active' : ''}`}
              onClick={() => { setActiveTab('subacquei'); setShowForm(false) }}
            >
              Lavori Subacquei ({manutenzioni.length})
            </button>
            <button
              className={`maint-tab ${activeTab === 'segnalazioni' ? 'active' : ''}`}
              onClick={() => { setActiveTab('segnalazioni'); setShowForm(false) }}
            >
              Segnalazioni ({segnalazioni.length})
            </button>
          </div>

          <div className="maint-filters">
            {(Object.keys(filtroLabels) as StatoFilter[]).map(f => (
              <button
                key={f}
                className={`filter-chip ${filtroStato === f ? 'active' : ''}`}
                onClick={() => setFiltroStato(f)}
              >
                {filtroLabels[f]}
              </button>
            ))}
          </div>
        </div>

        {/* Contenuto */}
        <div className="maint-content">
          <div className="maint-content-header">
            <h2>
              {activeTab === 'subacquei'
                ? `Lavori Subacquei (${filteredManutenzioni.length})`
                : `Segnalazioni (${filteredSegnalazioni.length})`}
            </h2>
            <button className="btn btn-mode-entrata" onClick={() => setShowForm(v => !v)}>
              {showForm ? 'Chiudi' : activeTab === 'subacquei' ? '+ Nuovo Lavoro' : '+ Nuova Segnalazione'}
            </button>
          </div>

          {/* Form inline */}
          {showForm && (
            <div className="maint-form-wrapper">
              {activeTab === 'subacquei' ? (
                <MaintenanceForm onClose={() => setShowForm(false)} />
              ) : (
                <ReportForm onClose={() => setShowForm(false)} />
              )}
            </div>
          )}

          {/* Tabella */}
          {activeTab === 'subacquei' ? (
            <MaintenanceTable
              data={filteredManutenzioni}
              onUpdateStato={updateManutenzioneStato}
            />
          ) : (
            <ReportTable
              data={filteredSegnalazioni}
              onUpdateStato={updateSegnalazioneStato}
            />
          )}
        </div>

      </div>
    </>
  )
}
