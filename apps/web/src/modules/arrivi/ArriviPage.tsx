import React, { useState, useMemo } from 'react'
import { TopBar } from '../../components/TopBar'
import { KpiCard } from '../../components/KpiCard'
import { ArrivalTable } from './components/ArrivalTable'
import { ArrivalForm } from './components/ArrivalForm'
import { ARRIVI_DEMO } from '@shared/demo-data'
import { Arrival, ArrivalStatus } from '@shared/types'
import './ArriviPage.css'

type FiltroData = 'oggi' | 'settimana' | 'tutti'
type FiltroStato = 'tutti' | 'oggi' | 'atteso' | 'in_ritardo' | 'arrivato' | 'annullato'

export function ArriviPage() {
  const [arrivi, setArrivi] = useState<Arrival[]>(ARRIVI_DEMO)
  const [filtroData, setFiltroData] = useState<FiltroData>('tutti')
  const [filtroStato, setFiltroStato] = useState<FiltroStato>('tutti')
  const [showForm, setShowForm] = useState(false)

  const TODAY = '2026-04-22'

  // KPI
  const kpiOggi      = arrivi.filter(a => a.dataPrevista === TODAY && a.stato !== 'annullato' && a.stato !== 'arrivato').length
  const kpiAttesi    = arrivi.filter(a => a.stato === 'atteso').length
  const kpiInRitardo = arrivi.filter(a => a.stato === 'in_ritardo').length
  const kpiArrivati  = arrivi.filter(a => a.stato === 'arrivato').length

  const filtered = useMemo(() => {
    return arrivi.filter(a => {
      // Data filter
      if (filtroData === 'oggi') {
        if (a.dataPrevista !== TODAY) return false
      } else if (filtroData === 'settimana') {
        const d = new Date(a.dataPrevista)
        const now = new Date(TODAY)
        const diff = (d.getTime() - now.getTime()) / 86400000
        if (diff < 0 || diff > 7) return false
      }
      // Stato filter
      if (filtroStato !== 'tutti' && a.stato !== filtroStato) return false
      return true
    })
  }, [arrivi, filtroData, filtroStato])

  const handleConferma = (id: number) => {
    setArrivi(prev => prev.map(a => a.id === id ? { ...a, stato: 'arrivato' as ArrivalStatus } : a))
  }

  const handleAnnulla = (id: number) => {
    setArrivi(prev => prev.map(a => a.id === id ? { ...a, stato: 'annullato' as ArrivalStatus } : a))
  }

  const handleNuovoArrivo = (arrivo: Omit<Arrival, 'id' | 'createdAt'>) => {
    const newArrivo: Arrival = {
      ...arrivo,
      id: arrivi.length + 1,
      createdAt: TODAY,
    }
    setArrivi(prev => [newArrivo, ...prev])
    setShowForm(false)
  }

  return (
    <>
      <TopBar
        title="Arrivi Previsti"
        subtitle="Prenotazioni e arrivi attesi al porto — non vincolante"
      />

      <div className="page-container">
        {/* KPI */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-lg)' }}>
          <KpiCard label="Previsti Oggi" value={kpiOggi}      color="teal" />
          <KpiCard label="Attesi"        value={kpiAttesi}    color="amber" />
          <KpiCard label="In Ritardo"    value={kpiInRitardo} color="red" />
          <KpiCard label="Arrivati"      value={kpiArrivati}  color="green" />
        </div>

        {/* Filters */}
        <div className="arrivi-controls">
          <div className="arrivi-filter-group">
            <span className="filter-label">Periodo:</span>
            {(['oggi', 'settimana', 'tutti'] as FiltroData[]).map(f => (
              <button key={f} className={`filter-chip ${filtroData === f ? 'active' : ''}`} onClick={() => setFiltroData(f)}>
                {f === 'oggi' ? 'Oggi' : f === 'settimana' ? 'Prossimi 7 gg' : 'Tutti'}
              </button>
            ))}
          </div>
          <div className="arrivi-filter-group">
            <span className="filter-label">Stato:</span>
            {(['tutti', 'oggi', 'atteso', 'in_ritardo', 'arrivato', 'annullato'] as FiltroStato[]).map(f => (
              <button key={f} className={`filter-chip ${filtroStato === f ? 'active' : ''}`} onClick={() => setFiltroStato(f)}>
                {f === 'tutti' ? 'Tutti' : f === 'oggi' ? 'Oggi' : f === 'atteso' ? 'Atteso' : f === 'in_ritardo' ? 'In Ritardo' : f === 'arrivato' ? 'Arrivato' : 'Annullato'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="arrivi-content">
          <div className="arrivi-content-header">
            <h2>Arrivi previsti ({filtered.length})</h2>
            <button className="btn btn-mode-entrata" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Chiudi' : '+ Nuovo Arrivo'}
            </button>
          </div>

          {showForm && (
            <div className="arrivi-form-wrapper">
              <ArrivalForm onSubmit={handleNuovoArrivo} onClose={() => setShowForm(false)} />
            </div>
          )}

          <ArrivalTable
            data={filtered}
            onConferma={handleConferma}
            onAnnulla={handleAnnulla}
          />
        </div>
      </div>
    </>
  )
}
