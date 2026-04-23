import React from 'react'
import { TopBar } from '../../components/TopBar'
import { KpiCard } from '../../components/KpiCard'
import { CssDonutChart } from './components/CssDonutChart'
import { CssBarChart } from './components/CssBarChart'
import { RevenueTable } from './components/RevenueTable'
import { POSTI_DEMO, MOVIMENTI_DEMO, RICEVUTE_DEMO } from '@shared/demo-data'
import './ReportisticaPage.css'

export function ReportisticaPage() {
  // 1. KPI Occupazione
  const totPosti = POSTI_DEMO.length
  const postiLiberi = POSTI_DEMO.filter(p => p.stato === 'libero').length
  const postiOccupati = totPosti - postiLiberi
  const occPercent = Math.round((postiOccupati / totPosti) * 100)

  // 2. KPI Movimenti di oggi
  const TODAY = '2026-04-22'
  const movOggi = MOVIMENTI_DEMO.filter(m => m.data === TODAY || m.ora.startsWith(TODAY) || true) // Nel demo_data abbiamo solo l'ora purtroppo o la data su alcuni. Supponiamo che quelli in MOVIMENTI_DEMO siano recenti.
  const entrateOggi = MOVIMENTI_DEMO.filter(m => m.tipo === 'entrata').length
  const usciteOggi = MOVIMENTI_DEMO.filter(m => m.tipo === 'uscita').length

  // 3. KPI Fatturato (Ricevute totali)
  const incassoTotale = RICEVUTE_DEMO.reduce((sum, r) => sum + r.totale, 0)
  
  // Dati Donut Chart: Occupazione
  const occupatiSocio = POSTI_DEMO.filter(p => p.stato === 'occupato_socio' || p.stato === 'socio_assente' || p.stato === 'socio_assente_lungo').length
  const occupatiTransito = POSTI_DEMO.filter(p => p.stato === 'occupato_transito' || p.stato === 'occupato_affittuario').length
  const inCantiere = POSTI_DEMO.filter(p => p.stato === 'in_cantiere').length

  const occData = [
    { label: 'Soci', value: occupatiSocio, color: 'var(--accent)' },
    { label: 'Transiti/Affitti', value: occupatiTransito, color: 'var(--purple)' },
    { label: 'Cantiere', value: inCantiere, color: 'var(--red)' },
    { label: 'Liberi', value: postiLiberi, color: 'var(--green)' }
  ]

  // Dati Bar Chart: Flussi settimanali (Simulati per la UI)
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
          <RevenueTable data={RICEVUTE_DEMO} />
        </div>
      </div>
    </>
  )
}
