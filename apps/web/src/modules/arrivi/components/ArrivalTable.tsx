import React from 'react'
import { Arrival, ArrivalStatus } from '@shared/types'

interface Props {
  data: Arrival[]
  onConferma: (id: number) => void
  onAnnulla:  (id: number) => void
}

const statoLabel: Record<ArrivalStatus, string> = {
  atteso:     'Atteso',
  oggi:       'Oggi',
  in_ritardo: 'In Ritardo',
  arrivato:   'Arrivato',
  annullato:  'Annullato',
}

const tipoBadge: Record<string, string> = {
  vela:       '⛵',
  motore:     '🚤',
  catamarano: '⛵⛵',
  gommone:    '🛥',
}

export function ArrivalTable({ data, onConferma, onAnnulla }: Props) {
  if (data.length === 0) {
    return <div className="arrivi-empty">Nessun arrivo trovato con i filtri selezionati.</div>
  }

  return (
    <table className="arrivi-table">
      <thead>
        <tr>
          <th>Imbarcazione</th>
          <th>Tipo</th>
          <th>Dimensioni</th>
          <th>Posto</th>
          <th>Data Prevista</th>
          <th>Ora</th>
          <th>Stato</th>
          <th>Note</th>
          <th>Azioni</th>
        </tr>
      </thead>
      <tbody>
        {data.map(a => (
          <tr key={a.id}>
            <td>
              <div className="arr-barca-nome">{a.nomeBarca}</div>
              <div className="arr-barca-mat">{a.matricola}</div>
              {a.bandiera && <div className="arr-bandiera">🏳 {a.bandiera}</div>}
            </td>
            <td>{tipoBadge[a.tipo || ''] || '—'} {a.tipo ? a.tipo.charAt(0).toUpperCase() + a.tipo.slice(1) : '—'}</td>
            <td>
              <strong>{a.lunghezza}m</strong>
              {a.pescaggio && <span style={{ color: 'var(--text3)', fontSize: '0.78rem' }}> · {a.pescaggio}m pesc.</span>}
            </td>
            <td><strong>{a.postoIndicato}</strong></td>
            <td>{a.dataPrevista}</td>
            <td>{a.oraPrevista || '—'}</td>
            <td>
              <span className={`pill pill-${a.stato}`}>{statoLabel[a.stato]}</span>
            </td>
            <td style={{ fontSize: '0.8rem', color: 'var(--text2)', maxWidth: '160px' }}>
              {a.note || '—'}
            </td>
            <td>
              {a.stato !== 'arrivato' && a.stato !== 'annullato' && (
                <div className="arr-actions">
                  <button className="btn-arr-conferma" onClick={() => onConferma(a.id)}>✓ Arrivato</button>
                  <button className="btn-arr-annulla"  onClick={() => onAnnulla(a.id)}>✕</button>
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
