import React, { useState, useMemo } from 'react'
import { ClientSidebar } from './components/ClientSidebar'
import { ClientProfile } from './components/ClientProfile'
import { TopBar } from '../../components/TopBar'
import { CLIENTI_DEMO, BARCHE_DEMO } from '@shared/demo-data'
import { Client } from '@shared/types'
import './Clienti.css'

export function ClientiPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('tutti') // tutti, pf, az, so
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null)

  // Calcolo della lista filtrata
  const filteredClients = useMemo(() => {
    return CLIENTI_DEMO.filter(c => {
      // Filtro tipo
      if (filterType !== 'tutti' && c.tipo !== filterType) return false
      
      // Filtro testo
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase()
        if (
          !c.nome.toLowerCase().includes(q) &&
          !(c.cf || '').toLowerCase().includes(q) &&
          !(c.piva || '').toLowerCase().includes(q)
        ) {
          return false
        }
      }
      return true
    })
  }, [searchQuery, filterType])

  const selectedClient = useMemo(() => {
    return CLIENTI_DEMO.find(c => c.id === selectedClientId) || null
  }, [selectedClientId])

  const clientBoats = useMemo(() => {
    if (!selectedClientId) return []
    return BARCHE_DEMO.filter(b => b.clientId === selectedClientId)
  }, [selectedClientId])

  return (
    <>
      <TopBar 
        title="Anagrafica Clienti e Soci" 
        subtitle="Gestione profili, imbarcazioni e documentazione"
        actions={
          <button className="btn btn-primary" onClick={() => alert("Nuovo cliente non ancora implementato")}>
            + Nuovo Profilo
          </button>
        }
      />
      <div className="clienti-layout">
        <div className="clienti-sidebar-area">
          <ClientSidebar 
            clients={filteredClients}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterType={filterType}
            setFilterType={setFilterType}
            selectedId={selectedClientId}
            onSelect={setSelectedClientId}
          />
        </div>
        <div className="clienti-main-area">
          {selectedClient ? (
            <ClientProfile client={selectedClient} boats={clientBoats} />
          ) : (
            <div className="client-empty-state">
              <div className="ce-ico">👤</div>
              <h3>Nessun profilo selezionato</h3>
              <p>Seleziona un cliente dalla lista a sinistra per visualizzare i dettagli.</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
