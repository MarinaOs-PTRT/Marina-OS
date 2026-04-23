import React, { useState } from 'react'
import { TopBar } from '../../components/TopBar'
import { NOTIFICHE_DEMO } from '@shared/demo-data'
import { SystemAlert } from '@shared/types'
import './NotifichePage.css'

export function NotifichePage() {
  const [notifiche, setNotifiche] = useState<SystemAlert[]>(NOTIFICHE_DEMO)
  const [filterCat, setFilterCat] = useState<string>('tutte')

  const handleMarkAs = (id: number, nuovoStato: 'letta' | 'risolta') => {
    setNotifiche(prev => prev.map(n => n.id === id ? { ...n, stato: nuovoStato } : n))
  }

  const filtered = notifiche.filter(n => filterCat === 'tutte' || n.categoria === filterCat)
  
  // Sort by stato (nuova > letta > risolta) then by id
  const sorted = [...filtered].sort((a, b) => {
    const sMap = { nuova: 0, letta: 1, risolta: 2 }
    if (sMap[a.stato] !== sMap[b.stato]) return sMap[a.stato] - sMap[b.stato]
    return b.id - a.id
  })

  return (
    <>
      <TopBar
        title="Centro Notifiche"
        subtitle="Gestione avvisi di sistema, allerte operative e amministrative"
      />

      <div className="page-container notifiche-page">
        <div className="n-filters">
          <button className={`btn-filter \${filterCat === 'tutte' ? 'active' : ''}`} onClick={() => setFilterCat('tutte')}>Tutte</button>
          <button className={`btn-filter \${filterCat === 'operativo' ? 'active' : ''}`} onClick={() => setFilterCat('operativo')}>Operative</button>
          <button className={`btn-filter \${filterCat === 'amministrazione' ? 'active' : ''}`} onClick={() => setFilterCat('amministrazione')}>Amministrazione</button>
          <button className={`btn-filter \${filterCat === 'sistema' ? 'active' : ''}`} onClick={() => setFilterCat('sistema')}>Sistema</button>
        </div>

        <div className="n-list">
          {sorted.length === 0 ? (
            <div className="empty-message">Nessuna notifica trovata per questa categoria.</div>
          ) : (
            sorted.map(n => (
              <div key={n.id} className={`n-card n-stato-\${n.stato}`}>
                <div className="n-header">
                  <div className="n-title-group">
                    {n.stato === 'nuova' && <span className="new-dot"></span>}
                    <span className={`pill pill-urg-\${n.urgenza}`}>{n.urgenza.toUpperCase()}</span>
                    <h3 className="n-title">{n.titolo}</h3>
                  </div>
                  <div className="n-meta">
                    <span className="n-cat">{n.categoria}</span>
                    <span className="n-date">{n.data}</span>
                  </div>
                </div>
                <div className="n-body">
                  <p>{n.descrizione}</p>
                </div>
                <div className="n-actions">
                  {n.stato === 'nuova' && (
                    <button className="btn btn-outline btn-sm" onClick={() => handleMarkAs(n.id, 'letta')}>Segna come letta</button>
                  )}
                  {n.stato !== 'risolta' && (
                    <button className="btn btn-primary btn-sm" onClick={() => handleMarkAs(n.id, 'risolta')}>✓ Risolta</button>
                  )}
                  {n.stato === 'risolta' && (
                    <span className="n-resolved-text">Risolta</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
