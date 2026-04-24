import React from 'react'
import { Authorization } from '@shared/types'

interface Props {
  data: Authorization[]
  type: 'attive' | 'storico'
  onRevoca?: (id: number) => void
}

export function AuthTable({ data, type, onRevoca }: Props) {
  if (data.length === 0) {
    return <div className="empty-message">Nessuna autorizzazione {type === 'attive' ? 'attiva' : 'nello storico'}.</div>
  }

  return (
    <table className="soci-table">
      <thead>
        <tr>
          <th>Posto</th>
          <th>Beneficiario</th>
          <th>Tipo</th>
          <th>Periodo</th>
          {type === 'attive' && <th>Giorni Residui</th>}
          <th>Barca</th>
          <th>Autorizzato Da</th>
          <th>Stato</th>
          {type === 'attive' && <th>Azioni</th>}
        </tr>
      </thead>
      <tbody>
        {data.map(a => (
          <tr key={a.id}>
            <td><span className="so-posto">{a.berthId}</span></td>
            <td>
              <div className="so-nome">{a.beneficiario}</div>
              <div className="so-tel">{a.tel}</div>
            </td>
            <td style={{ textTransform: 'capitalize', fontWeight: 600 }}>{a.tipo}</td>
            <td style={{ fontSize: '0.85rem' }}>
              {a.stato === 'pendente' ? (
                <span style={{ color: 'var(--color-text-warning)', fontStyle: 'italic' }}>Da compilare</span>
              ) : (
                <>{a.dal} <br/> {a.al}</>
              )}
            </td>
            {type === 'attive' && (
              <td><strong>{a.giorniResidui != null ? `${a.giorniResidui} gg` : '—'}</strong></td>
            )}
            <td>
              <div style={{ fontWeight: 600 }}>{a.barca}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{a.matricola}</div>
            </td>
            <td>{a.authDa ?? <span style={{ color: 'var(--text3)' }}>—</span>}</td>
            <td>
              <span className={`pill pill-auth-${a.stato}`}>
                {a.stato === 'pendente'
                  ? 'In attesa di Autorizzazione'
                  : a.stato.charAt(0).toUpperCase() + a.stato.slice(1)}
              </span>
            </td>
            {type === 'attive' && (
              <td>
                <button className="btn-revoca" onClick={() => onRevoca && onRevoca(a.id)}>Revoca</button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
