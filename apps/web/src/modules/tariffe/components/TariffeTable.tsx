import React from 'react'
import { useGlobalState } from '../../../store/GlobalState'

export function TariffeTable() {
  const { tariffe } = useGlobalState()
  return (
    <>
      <div className="listino-header">
        <h2>Listino Tariffe — Stagione 2026</h2>
        <span className="listino-note">Prezzi IVA inclusa · Acqua inclusa</span>
      </div>
      <table className="listino-table">
        <thead>
          <tr>
            <th>Categoria</th>
            <th>Lunghezza max</th>
            <th>Tariffa / giorno</th>
            <th>IVA inclusa</th>
            <th>Acqua inclusa</th>
          </tr>
        </thead>
        <tbody>
          {tariffe.map(t => (
            <tr key={t.categoria}>
              <td className="cat-name">{t.categoria}</td>
              <td>{t.dimMax}</td>
              <td className="price">€ {t.prezzoGiorno}</td>
              <td>{t.ivaInclusa  ? <span className="check-yes">✓</span> : <span className="check-no">—</span>}</td>
              <td>{t.acquaInclusa ? <span className="check-yes">✓</span> : <span className="check-no">—</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
