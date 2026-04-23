import React, { useState, useMemo } from 'react'
import { ClientSidebar } from './components/ClientSidebar'
import { ClientProfile } from './components/ClientProfile'
import { TopBar } from '../../components/TopBar'
import { useGlobalState } from '../../store/GlobalState'
import './Clienti.css'

export function ClientiPage() {
  const { clienti, barche } = useGlobalState()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('tutti') // tutti, pf, az, so
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null)

  // Calcolo della lista filtrata
  const filteredClients = useMemo(() => {
    return clienti.filter(c => {
      if (filterType !== 'tutti' && c.tipo !== filterType) return false
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase()
        if (
          !c.nome.toLowerCase().includes(q) &&
          !(c.cf || '').toLowerCase().includes(q) &&
          !(c.piva || '').toLowerCase().includes(q)
        ) return false
      }
      return true
    })
  }, [clienti, searchQuery, filterType])

  const selectedClient = useMemo(() => {
    return clienti.find(c => c.id === selectedClientId) || null
  }, [clienti, selectedClientId])

  const clientBoats = useMemo(() => {
    if (!selectedClientId) return []
    return barche.filter(b => b.clientId === selectedClientId)
  }, [barche, selectedClientId])

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
