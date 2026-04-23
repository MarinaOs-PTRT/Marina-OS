import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../../../components/Card'
import { Badge } from '../../../components/Badge'
import { MOVIMENTI_DEMO } from '@shared/demo-data'
import { MOVEMENT_TYPE_LABELS, MOVEMENT_TYPE_CLASS, SCENARIO_LABELS } from '@shared/constants'

export function MovementTable() {
  // Mostriamo solo gli ultimi 5 movimenti per la dashboard
  const ultimiMovimenti = [...MOVIMENTI_DEMO]
    .sort((a, b) => b.id - a.id) // ordina per ID decrescente (simula data/ora più recente)
    .slice(0, 5)

  return (
    <Card 
      title="Ultimi Movimenti" 
      actions={<Link to="/registro" className="btn btn-outline">Vedi registro completo</Link>}
    >
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Ora</th>
              <th>Barca / Posto</th>
              <th>Tipo</th>
              <th>Operatore</th>
            </tr>
          </thead>
          <tbody>
            {ultimiMovimenti.map(m => (
              <tr key={m.id}>
                <td>
                  <strong>{m.ora}</strong>
                </td>
                <td>
                  <strong>{m.nome}</strong><br/>
                  <small style={{color:'var(--text3)'}}>Posto: {m.posto} · {SCENARIO_LABELS[m.scenario]}</small>
                </td>
                <td>
                  <Badge color={MOVEMENT_TYPE_CLASS[m.tipo].replace('pill-', '') as any}>
                    {MOVEMENT_TYPE_LABELS[m.tipo]}
                  </Badge>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '24px', height: '24px', 
                      borderRadius: '50%', background: 'var(--bg3)', 
                      border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text2)'
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
    </Card>
  )
}
