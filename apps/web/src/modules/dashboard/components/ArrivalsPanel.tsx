import React from 'react'
import { Card } from '../../../components/Card'
import { Badge } from '../../../components/Badge'

export function ArrivalsPanel() {
  // Dati statici simulati per gli arrivi previsti (come nel prototipo)
  const arriviPrevisti = [
    { nome: 'S/V Vento', info: 'Posto assegnato: G 12', ora: 'Previsto: 14:30' },
    { nome: 'M/Y Horizon', info: 'Da assegnare (Cat. V)', ora: 'Previsto: 16:00' }
  ]

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
              <strong>{arrivo.nome}</strong>
              <Badge color="amber">In arrivo</Badge>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>
              {arrivo.info}<br/>
              {arrivo.ora}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
