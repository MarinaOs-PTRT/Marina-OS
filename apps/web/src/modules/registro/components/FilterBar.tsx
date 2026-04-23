import React from 'react'

interface FilterBarProps {
  filterType: string
  setFilterType: (val: string) => void
  filterScenario: string
  setFilterScenario: (val: string) => void
  searchQuery: string
  setSearchQuery: (val: string) => void
}

export function FilterBar({ 
  filterType, setFilterType, 
  filterScenario, setFilterScenario,
  searchQuery, setSearchQuery
}: FilterBarProps) {
  return (
    <div className="filter-bar" style={{ 
      background: 'var(--bg2)', borderBottom: '1px solid var(--border)', 
      padding: '10px 22px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap'
    }}>
      
      {/* Date Filter Placeholder */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text3)', textTransform: 'uppercase' }}>Data</span>
        <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Oggi — 19 Apr 2026</button>
      </div>

      <div style={{ width: '1px', height: '24px', background: 'var(--border)' }}></div>

      {/* Tipo Movimento */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text3)', textTransform: 'uppercase' }}>Tipo</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          {['tutti', 'entrata', 'uscita', 'spostamento', 'cantiere'].map(t => (
            <button 
              key={t}
              onClick={() => setFilterType(t)}
              className={`pill ${filterType === t ? 'pill-accent' : 'pill-gray'}`}
              style={{ cursor: 'pointer', border: filterType === t ? 'none' : undefined }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ width: '1px', height: '24px', background: 'var(--border)' }}></div>

      {/* Scenario */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text3)', textTransform: 'uppercase' }}>Scenario</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          {['tutti', 'socio', 'transito', 'affittuario'].map(s => (
            <button 
              key={s}
              onClick={() => setFilterScenario(s)}
              className={`pill ${filterScenario === s ? 'pill-accent' : 'pill-gray'}`}
              style={{ cursor: 'pointer', border: filterScenario === s ? 'none' : undefined }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1 }}></div>

      {/* Search Input */}
      <div style={{ position: 'relative', width: '250px' }}>
        <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
        <input 
          type="text" 
          placeholder="Nome barca, matricola, posto..." 
          className="form-input"
          style={{ width: '100%', paddingLeft: '32px' }}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

    </div>
  )
}
