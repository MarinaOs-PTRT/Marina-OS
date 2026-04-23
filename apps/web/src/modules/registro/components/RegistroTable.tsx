import React from 'react'
import { Movement } from '@shared/types'
import { MOVEMENT_TYPE_LABELS, MOVEMENT_TYPE_CLASS, SCENARIO_LABELS } from '@shared/constants'
import { Badge } from '../../../components/Badge'

interface RegistroTableProps {
  movements: Movement[]
  onSelect: (mov: Movement) => void
}

export function RegistroTable({ movements, onSelect }: RegistroTableProps) {
  if (movements.length === 0) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text3)' }}>
        <div style={{ fontSize: '2rem', marginBottom: '16px' }}>📭</div>
        <h3>Nessun movimento trovato</h3>
        <p>Modifica i filtri per vedere altri risultati.</p>
      </div>
    )
  }

  return (
    <div className="table-wrap">
      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg4)', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text2)', textTransform: 'uppercase' }}>Risultati</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{movements.length} movimenti</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Data e Ora</th>
            <th>Imbarcazione</th>
            <th>Posto</th>
            <th>Tipo</th>
            <th>Scenario</th>
            <th>Aut.</th>
            <th>Operatore</th>
          </tr>
        </thead>
        <tbody>
          {movements.map(m => (
            <tr key={m.id} onClick={() => onSelect(m)} style={{ cursor: 'pointer' }}>
              <td>
                <div style={{ fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>{m.ora}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>{m.data || 'Oggi'}</div>
              </td>
              <td>
                <div style={{ fontWeight: 'bold' }}>{m.nome}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>{m.matricola || 'N/A'}</div>
              </td>
              <td>
                <div style={{ fontWeight: 'bold', color: 'var(--accent)' }}>{m.posto}</div>
              </td>
              <td>
                <Badge color={MOVEMENT_TYPE_CLASS[m.tipo].replace('pill-', '') as any}>
                  {MOVEMENT_TYPE_LABELS[m.tipo]}
                </Badge>
              </td>
              <td>
                <Badge color="gray">{SCENARIO_LABELS[m.scenario]}</Badge>
              </td>
              <td>
                {m.auth ? (
                  <span style={{ color: 'var(--green)', fontWeight: 'bold' }}>✓ OK</span>
                ) : (
                  <span style={{ color: 'var(--text3)' }}>-</span>
                )}
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '24px', height: '24px', 
                    borderRadius: '50%', background: 'var(--bg3)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', fontWeight: 'bold'
                  }}>
                    {m.operatore.iniziali}
                  </div>
                  <span style={{ fontSize: '0.85rem' }}>{m.operatore.nome}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
