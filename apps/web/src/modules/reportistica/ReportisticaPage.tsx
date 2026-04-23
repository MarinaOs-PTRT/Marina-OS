import React from 'react'
import { TopBar } from '../../components/TopBar'
import { KpiCard } from '../../components/KpiCard'
import { CssDonutChart } from './components/CssDonutChart'
import { CssBarChart } from './components/CssBarChart'
import { RevenueTable } from './components/RevenueTable'
import { useGlobalState } from '../../store/GlobalState'
import './ReportisticaPage.css'

export function ReportisticaPage() {
  const { posti, movimenti, ricevute } = useGlobalState()

  // 1. KPI Occupazione (LIVE — cambia se registri un ingresso/uscita)
  const totPosti = posti.length
  const postiLiberi = posti.filter(p => p.stato === 'libero').length
  const postiOccupati = totPosti - postiLiberi
  const occPercent = totPosti > 0 ? Math.round((postiOccupati / totPosti) * 100) : 0

  // 2. KPI Movimenti
  const entrateOggi = movimenti.filter(m => m.tipo === 'entrata').length
  const usciteOggi = movimenti.filter(m => m.tipo === 'uscita').length

  // 3. KPI Fatturato
  const incassoTotale = ricevute.reduce((sum, r) => sum + r.totale, 0)
  
  // Dati Donut Chart: Occupazione (LIVE)
  const occupatiSocio = posti.filter(p => p.stato === 'occupato_socio' || p.stato === 'socio_assente' || p.stato === 'socio_assente_lungo').length
  const occupatiTransito = posti.filter(p => p.stato === 'occupato_transito' || p.stato === 'occupato_affittuario').length
  const inCantiere = posti.filter(p => p.stato === 'in_cantiere').length

  const occData = [
    { label: 'Soci', value: occupatiSocio, color: 'var(--accent)' },
    { label: 'Transiti/Affitti', value: occupatiTransito, color: 'var(--purple)' },
    { label: 'Cantiere', value: inCantiere, color: 'var(--red)' },
    { label: 'Liberi', value: postiLiberi, color: 'var(--green)' }
  ]

  // Dati Bar Chart: Flussi settimanali (Simulati — in futuro da DB)
  const flowData = [
    { label: 'Lun', value: 4, secondaryValue: 2 },
    { label: 'Mar', value: 2, secondaryValue: 3 },
    { label: 'Mer', value: 6, secondaryValue: 5 },
    { label: 'Gio', value: 3, secondaryValue: 1 },
    { label: 'Ven', value: 8, secondaryValue: 6 },
    { label: 'Sab', value: 15, secondaryValue: 12 },
    { label: 'Dom', value: 12, secondaryValue: 18 },
  ]

  return (
    <>
      <TopBar
        title="Reportistica Direzione"
        subtitle="Analisi occupazione, flussi di transito e fatturato globale"
      />

      <div className="page-container report-page">
        {/* KPI Row */}
        <div className="report-kpi-grid">
          <KpiCard label="Occupazione Totale" value={`${occPercent}%`} color="accent" />
          <KpiCard label="Posti Liberi" value={postiLiberi} color="green" />
          <KpiCard label="Movimenti Odierni" value={`${entrateOggi} In / ${usciteOggi} Out`} color="teal" />
          <KpiCard label="Fatturato Transiti" value={`€ ${incassoTotale.toFixed(2)}`} color="amber" />
        </div>

        {/* Charts Row */}
        <div className="report-charts-row">
          <div className="report-card">
            <h3>Stato Banchine</h3>
            <CssDonutChart data={occData} />
          </div>
          <div className="report-card">
            <h3>Flussi Settimanali</h3>
            <div className="chart-legend">
              <span className="legend-item"><span className="dot dot-in"></span> Entrate</span>
              <span className="legend-item"><span className="dot dot-out"></span> Uscite</span>
            </div>
            <CssBarChart data={flowData} />
          </div>
        </div>

        {/* Revenue Table Row */}
        <div className="report-card full-width">
          <h3>Dettaglio Fatturazione Transiti</h3>
          <RevenueTable data={ricevute} />
        </div>
      </div>
    </>
  )
}
