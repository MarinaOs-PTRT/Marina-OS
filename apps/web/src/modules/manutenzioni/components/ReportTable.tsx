import React from 'react'
import { Report } from '@shared/types'

interface Props {
  data: Report[]
}

const urgenzaPill: Record<string, string> = {
  urgente: 'pill-urgente',
  normale: 'pill-normale',
  programmato: 'pill-programmato'
}

const statoPill: Record<string, string> = {
  dafare: 'pill-dafare',
  incorso: 'pill-incorso',
  completato: 'pill-completato'
}

const statoLabel: Record<string, string> = {
  dafare: 'Da Fare',
  incorso: 'In Corso',
  completato: 'Completato'
}

const canaleLabel: Record<string, string> = {
  telefono: 'Telefono',
  email: 'Email',
  ispezione: 'Ispezione',
  di_persona: 'Di persona'
}

export function ReportTable({ data }: Props) {
  if (data.length === 0) {
    return <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--text3)' }}>Nessuna segnalazione trovata con i filtri selezionati.</div>
  }

  return (
    <table className="maint-table">
      <thead>
        <tr>
          <th>Zona</th>
          <th>Tipo Problema</th>
          <th>Urgenza</th>
          <th>Stato</th>
          <th>Canale</th>
          <th>Assegnato a</th>
          <th>Data</th>
        </tr>
      </thead>
      <tbody>
        {data.map(s => (
          <tr key={s.id}>
            <td><strong>{s.zona}</strong></td>
            <td>
              {s.tipoProblema}
              {s.descrizione && <div className="td-desc">{s.descrizione}</div>}
            </td>
            <td><span className={`pill ${urgenzaPill[s.urgenza]}`}>{s.urgenza}</span></td>
            <td><span className={`pill ${statoPill[s.stato]}`}>{statoLabel[s.stato]}</span></td>
            <td>{canaleLabel[s.canale] || s.canale}</td>
            <td style={{ textTransform: 'capitalize' }}>{s.assegnatoA}</td>
            <td>{s.dataSegnalazione}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
