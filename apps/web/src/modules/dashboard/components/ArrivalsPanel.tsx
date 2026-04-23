import React from 'react'
import { Card } from '../../../components/Card'
import { Badge } from '../../../components/Badge'
import { useGlobalState } from '../../../store/GlobalState'

export function ArrivalsPanel() {
  const { arrivi } = useGlobalState()
  
  // Filtriamo solo quelli 'oggi' o 'atteso'
  const arriviPrevisti = arrivi.filter(a => a.stato === 'oggi' || a.stato === 'atteso' || a.stato === 'in_ritardo')

  return (
    <Card title="Arrivi Previsti Oggi">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {arriviPrevisti.map((arrivo, idx) => (
          <div key={idx} style={{ 
            padding: 'var(--space-md)', 
            border: '1px solid var(--border)', 
            borderRadius: 'var(--radius)',
            background: 'var(--bg3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <strong>{arrivo.nomeBarca}</strong>
              <Badge color={arrivo.stato === 'in_ritardo' ? 'red' : 'amber'}>
                {arrivo.stato === 'in_ritardo' ? 'In ritardo' : 'In arrivo'}
              </Badge>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>
              Posto: {arrivo.postoIndicato || 'Da assegnare'}<br/>
              Previsto: {arrivo.oraPrevista || 'N/D'}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
