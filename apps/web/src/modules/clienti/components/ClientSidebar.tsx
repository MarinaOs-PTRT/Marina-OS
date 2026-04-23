import React from 'react'
import { Client } from '@shared/types'

interface ClientSidebarProps {
  clients: Client[]
  searchQuery: string
  setSearchQuery: (val: string) => void
  filterType: string
  setFilterType: (val: string) => void
  selectedId: number | null
  onSelect: (id: number) => void
}

export function ClientSidebar({
  clients, searchQuery, setSearchQuery, filterType, setFilterType, selectedId, onSelect
}: ClientSidebarProps) {
  
  const typeMap: Record<string, { label: string, color: string }> = {
    pf: { label: 'PF', color: 'accent' },
    az: { label: 'AZ', color: 'purple' },
    so: { label: 'SO', color: 'green' }
  }

  return (
    <div className="cs-container">
      <div className="cs-search">
        <input 
          type="text" 
          placeholder="Cerca nome o CF/P.IVA..." 
          className="form-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="cs-filters">
        <button className={`sf ${filterType === 'tutti' ? 'on' : ''}`} onClick={() => setFilterType('tutti')}>Tutti</button>
        <button className={`sf ${filterType === 'pf' ? 'on' : ''}`} onClick={() => setFilterType('pf')}>Persone</button>
        <button className={`sf ${filterType === 'az' ? 'on' : ''}`} onClick={() => setFilterType('az')}>Aziende</button>
        <button className={`sf ${filterType === 'so' ? 'on' : ''}`} onClick={() => setFilterType('so')}>Soci</button>
      </div>

      <div className="cs-list">
        {clients.map(c => {
          const typeInfo = typeMap[c.tipo]
          const isSelected = c.id === selectedId

          return (
            <div 
              key={c.id} 
              className={`cs-item ${isSelected ? 'active' : ''}`}
              onClick={() => onSelect(c.id)}
            >
              <div className={`cs-avatar cs-av-${c.tipo}`}>
                {c.iniziali}
              </div>
              <div className="cs-info">
                <div className="cs-name">{c.nome}</div>
                <div className="cs-meta">{c.email || c.tel}</div>
              </div>
              <div className={`cs-badge cb-${c.tipo}`}>
                {typeInfo.label}
              </div>
            </div>
          )
        })}
        {clients.length === 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text3)' }}>
            Nessun risultato
          </div>
        )}
      </div>
    </div>
  )
}
