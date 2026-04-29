import React from 'react'
import { MaintenanceJob } from '@shared/types'

interface Props {
  data: MaintenanceJob[]
  onUpdateStato: (id: number, stato: MaintenanceJob['stato']) => void
}

const urgenzaPill: Record<string, string> = {
  urgente:    'pill-urgente',
  normale:    'pill-normale',
  programmato:'pill-programmato'
}

const statoPill: Record<string, string> = {
  dafare:    'pill-dafare',
  incorso:   'pill-incorso',
  completato:'pill-completato'
}

const statoLabel: Record<string, string> = {
  dafare:    'Da Fare',
  incorso:   'In Corso',
  completato:'Completato'
}

export function MaintenanceTable({ data, onUpdateStato }: Props) {
  if (data.length === 0) {
    return (
      <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--text3)' }}>
        Nessun lavoro trovato con i filtri selezionati.
      </div>
    )
  }

  return (
    <table className="maint-table">
      <thead>
        <tr>
          <th>Posto</th>
          <th>Tipo Lavoro</th>
          <th>Urgenza</th>
          <th>Stato</th>
          <th>Assegnato a</th>
          <th>Data Prev.</th>
          <th>Azioni</th>
        </tr>
      </thead>
      <tbody>
        {data.map(m => (
          <tr key={m.id}>
            <td><strong>{m.berthCodice}</strong></td>
            <td>
              {m.tipoLavoro}
              {m.descrizione && <div className="td-desc">{m.descrizione}</div>}
            </td>
            <td><span className={`pill ${urgenzaPill[m.urgenza] ?? ''}`}>{m.urgenza}</span></td>
            <td><span className={`pill ${statoPill[m.stato] ?? ''}`}>{statoLabel[m.stato]}</span></td>
            <td>{m.assegnatoA}</td>
            <td>{m.dataPrevista}</td>
            <td>
              {m.stato === 'dafare' && (
                <button
                  className="maint-stato-btn maint-stato-incorso"
                  onClick={() => onUpdateStato(m.id, 'incorso')}
                >
                  In Corso
                </button>
              )}
              {m.stato === 'incorso' && (
                <button
                  className="maint-stato-btn maint-stato-completato"
                  onClick={() => onUpdateStato(m.id, 'completato')}
                >
                  Completato
                </button>
              )}
              {m.stato === 'completato' && (
                <span className="maint-done-label">Chiuso</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
