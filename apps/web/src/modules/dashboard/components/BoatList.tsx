import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../../../components/Card'
import { Badge } from '../../../components/Badge'
import { Omnibar } from '../../../components/Omnibar'
import { useGlobalState } from '../../../store/GlobalState'
import { BERTH_STATUS_COLOR, BERTH_STATUS_LABELS } from '@shared/constants'

export function BoatList() {
  const { barche, posti } = useGlobalState()
  
  const [filterStato, setFilterStato] = useState('tutti')
  const [searchQuery, setSearchQuery] = useState('')

  const barcheFiltrate = barche
    .filter(b => filterStato === 'tutti' || b.stato === filterStato)
    .filter(b => b.nome.toLowerCase().includes(searchQuery.toLowerCase()) || b.matricola.toLowerCase().includes(searchQuery.toLowerCase()))

  const barcheConPosto = barcheFiltrate.map(b => {
    const posto = posti.find(p => p.id === b.posto)
    return { ...b, dettaglioPosto: posto }
  })

  const filtriBadge = [
    { label: 'Tutte', color: 'gray' as const, count: barche.length },
    { label: 'Soci', color: 'accent' as const, count: barche.filter(b => b.stato === 'occupato_socio').length },
    { label: 'Transito', color: 'teal' as const, count: barche.filter(b => b.stato === 'occupato_transito').length },
    { label: 'Cantiere', color: 'red' as const, count: barche.filter(b => b.stato === 'in_cantiere').length },
  ]

  return (
    <Card 
      title="Barche in porto" 
      actions={<Link to="/clienti" className="btn btn-outline">Vedi anagrafica</Link>}
    >
      <div className="filter-bar" style={{ display: 'flex', gap: '8px', marginBottom: 'var(--space-md)' }}>
        {filtriBadge.map(f => (
          <div key={f.label} style={{ cursor: 'pointer' }}>
            <Badge color={f.color}>{f.label} ({f.count})</Badge>
          </div>
        ))}
        <div style={{ flex: 1 }}></div>
        <input type="text" placeholder="Cerca barca..." className="form-input" style={{ width: '200px', padding: '6px 10px' }} />
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Imbarcazione</th>
              <th>Matricola / Tipo</th>
              <th>Posto</th>
              <th>Stato</th>
            </tr>
          </thead>
          <tbody>
            {barcheConPosto.map(b => (
              <tr key={b.id}>
                <td><strong>{b.nome}</strong></td>
                <td>{b.matricola}<br/><small style={{color:'var(--text3)'}}>{b.tipo} · {b.lunghezza}m</small></td>
                <td>
                  <strong>{b.posto || '-'}</strong>
                  {b.dettaglioPosto && <><br/><small style={{color:'var(--text3)'}}>{b.dettaglioPosto.pontile}</small></>}
                </td>
                <td>
                  {b.stato && (
                    <span style={{ 
                      color: BERTH_STATUS_COLOR[b.stato],
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span style={{
                        display: 'inline-block',
                        width: '8px', height: '8px',
                        borderRadius: '50%',
                        background: BERTH_STATUS_COLOR[b.stato]
                      }}></span>
                      {BERTH_STATUS_LABELS[b.stato]}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
