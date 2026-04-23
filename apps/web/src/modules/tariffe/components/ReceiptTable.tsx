import React from 'react'
import { RICEVUTE_DEMO } from '@shared/demo-data'

export function ReceiptTable() {
  const totaleGiornata = RICEVUTE_DEMO.filter(r => r.data === '2026-04-22').reduce((acc, r) => acc + r.totale, 0)

  return (
    <>
      <div className="ricevute-header">
        <h2>Ricevute Emesse — Oggi: € {totaleGiornata.toFixed(2)}</h2>
        <span className="listino-note">{RICEVUTE_DEMO.length} ricevute totali</span>
      </div>
      <table className="ricevute-table">
        <thead>
          <tr>
            <th>N° Ricevuta</th>
            <th>Data</th>
            <th>Imbarcazione</th>
            <th>Posto</th>
            <th>Periodo</th>
            <th>Gg</th>
            <th>Categoria</th>
            <th>Totale</th>
            <th>Metodo</th>
            <th>Operatore</th>
          </tr>
        </thead>
        <tbody>
          {RICEVUTE_DEMO.map(r => (
            <tr key={r.numero}>
              <td className="num-ricevuta">{r.numero}</td>
              <td>{r.data}</td>
              <td>
                <strong>{r.nomeBarca}</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: '2px' }}>{r.matricola}</div>
              </td>
              <td>{r.posto}</td>
              <td style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>{r.periodo}</td>
              <td>{r.giorni}</td>
              <td>{r.categoria}</td>
              <td className="totale-cell">€ {r.totale}</td>
              <td>
                <span className={`metodo-chip ${r.metodo}`}>
                  {r.metodo === 'pos' ? 'POS' : 'Contante'}
                </span>
              </td>
              <td style={{ color: 'var(--text2)' }}>{r.operatore}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
