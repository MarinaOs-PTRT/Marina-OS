import React from 'react'
import { SystemUser } from '@shared/types'

interface Props {
  data: SystemUser[]
  onToggleStato: (id: number) => void
}

export function UserTable({ data, onToggleStato }: Props) {
  return (
    <table className="utenti-table">
      <thead>
        <tr>
          <th>Operatore</th>
          <th>Ruolo Accesso</th>
          <th>Stato Account</th>
          <th>Ultimo Accesso</th>
          <th>Azioni</th>
        </tr>
      </thead>
      <tbody>
        {data.map(u => (
          <tr key={u.id} style={{ opacity: u.stato === 'disattivo' ? 0.6 : 1 }}>
            <td>
              <div className="u-nome">{u.nome}</div>
              <div className="u-email">{u.email}</div>
            </td>
            <td>
              <span className={`pill pill-role-${u.ruolo}`}>
                {u.ruolo.charAt(0).toUpperCase() + u.ruolo.slice(1)}
              </span>
            </td>
            <td>
              <span className={`pill pill-stato-${u.stato}`}>
                {u.stato.toUpperCase()}
              </span>
            </td>
            <td style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>
              {u.ultimoAccesso || 'Mai'}
            </td>
            <td>
              <button 
                className="btn btn-outline" 
                style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                onClick={() => onToggleStato(u.id)}
              >
                {u.stato === 'attivo' ? 'Disattiva' : 'Riattiva'}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
