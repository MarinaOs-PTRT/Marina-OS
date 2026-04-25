import React from 'react'
import { Authorization } from '@shared/types'

type TableMode = 'attive' | 'pendenti' | 'storico'

interface Props {
  data: Authorization[]
  type: TableMode
  onRevoca?: (id: number) => void
  onCompleta?: (auth: Authorization) => void
}

const EMPTY_LABEL: Record<TableMode, string> = {
  attive: 'Nessuna autorizzazione attiva.',
  pendenti: 'Nessuna autorizzazione da compilare.',
  storico: 'Nessuna autorizzazione nello storico.'
}

export function AuthTable({ data, type, onRevoca, onCompleta }: Props) {
  if (data.length === 0) {
    return <div className="empty-message">{EMPTY_LABEL[type]}</div>
  }

  // Una colonna Azioni esiste sia per 'attive' (Revoca) che per 'pendenti' (Completa).
  const showAzioni = type === 'attive' || type === 'pendenti'

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
          {showAzioni && <th>Azioni</th>}
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
            {type === 'pendenti' && (
              <td>
                <button
                  className="btn btn-primary"
                  style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                  onClick={() => onCompleta && onCompleta(a)}
                >
                  Completa
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
