import React from 'react'
import { Receipt } from '@shared/types'

interface Props {
  data: Receipt[]
}

export function RevenueTable({ data }: Props) {
  return (
    <table className="revenue-table">
      <thead>
        <tr>
          <th>Ricevuta</th>
          <th>Data</th>
          <th>Imbarcazione</th>
          <th>Periodo Sosta</th>
          <th>Categoria</th>
          <th>Metodo</th>
          <th style={{ textAlign: 'right' }}>Importo Totale</th>
        </tr>
      </thead>
      <tbody>
        {data.map(r => (
          <tr key={r.numero}>
            <td style={{ fontWeight: 600 }}>{r.numero}</td>
            <td>{r.data}</td>
            <td>
              <div style={{ fontWeight: 600 }}>{r.nomeBarca}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{r.matricola} (Posto: {r.posto})</div>
            </td>
            <td>{r.periodo} ({r.giorni} gg)</td>
            <td>{r.categoria}</td>
            <td>
              <span className={`pill ${r.metodo === 'pos' ? 'pill-green' : 'pill-amber'}`}>
                {r.metodo.toUpperCase()}
              </span>
            </td>
            <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--accent)', fontSize: '1.05rem' }}>
              € {r.totale.toFixed(2)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
