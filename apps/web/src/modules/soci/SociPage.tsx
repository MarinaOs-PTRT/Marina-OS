import React, { useState, useMemo } from 'react'
import { TopBar } from '../../components/TopBar'
import { SociTable } from './components/SociTable'
import { AuthTable } from './components/AuthTable'
import { AuthForm } from './components/AuthForm'
import { CLIENTI_DEMO, POSTI_DEMO, TITOLI_POSSESSO_DEMO, AUTORIZZAZIONI_DEMO } from '@shared/demo-data'
import { Authorization, AuthStatus } from '@shared/types'
import './SociPage.css'

type ActiveTab = 'soci' | 'attive' | 'storico'

export function SociPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('soci')
  const [autorizzazioni, setAutorizzazioni] = useState<Authorization[]>(AUTORIZZAZIONI_DEMO)
  const [showForm, setShowForm] = useState(false)

  // Calcola dati soci aggregati
  const sociAggregati = useMemo(() => {
    return CLIENTI_DEMO.filter(c => c.tipo === 'so').map(socio => {
      const titolo = TITOLI_POSSESSO_DEMO.find(t => t.clientId === socio.id)
      const posto = POSTI_DEMO.find(b => b.id === titolo?.berthId)
      const authAttiva = autorizzazioni.find(a => a.berthId === titolo?.berthId && a.stato === 'attiva')

      let statoPosto = 'Assente'
      let statoClass = 'pill-socio_assente'
      if (posto?.stato === 'occupato_socio') {
        statoPosto = 'Socio Presente'
        statoClass = 'pill-occupato_socio'
      } else if (posto?.stato === 'in_cantiere') {
        statoPosto = 'In Cantiere'
        statoClass = 'pill-in_cantiere'
      } else if (posto?.stato === 'occupato_affittuario' || authAttiva) {
        statoPosto = authAttiva ? `Autorizzato (${authAttiva.tipo})` : 'Affittuario Presente'
        statoClass = 'pill-occupato_affittuario'
      }

      return {
        socio,
        titolo,
        posto,
        authAttiva,
        statoPosto,
        statoClass
      }
    })
  }, [autorizzazioni])

  const authAttive = autorizzazioni.filter(a => a.stato === 'attiva')
  const authStorico = autorizzazioni.filter(a => a.stato !== 'attiva')

  const handleRevoca = (id: number) => {
    if (confirm('Sei sicuro di voler revocare questa autorizzazione?')) {
      setAutorizzazioni(prev => prev.map(a => a.id === id ? { ...a, stato: 'revocata' as AuthStatus } : a))
    }
  }

  const handleNuovaAuth = (auth: Omit<Authorization, 'id'>) => {
    const newAuth: Authorization = {
      ...auth,
      id: autorizzazioni.length + 1,
    }
    setAutorizzazioni(prev => [newAuth, ...prev])
    setShowForm(false)
    setActiveTab('attive')
  }

  return (
    <>
      <TopBar
        title="Soci e Assegnazioni"
        subtitle="Gestione posti fissi, autorizzazioni affitto, ospiti e amici"
      />

      <div className="page-container">
        {/* Tab bar */}
        <div className="soci-tabs-header">
          <div className="soci-tabs">
            <button
              className={`soci-tab ${activeTab === 'soci' ? 'active' : ''}`}
              onClick={() => setActiveTab('soci')}
            >
              👤 Elenco Soci e Posti ({sociAggregati.length})
            </button>
            <button
              className={`soci-tab ${activeTab === 'attive' ? 'active' : ''}`}
              onClick={() => setActiveTab('attive')}
            >
              ✅ Autorizzazioni Attive ({authAttive.length})
            </button>
            <button
              className={`soci-tab ${activeTab === 'storico' ? 'active' : ''}`}
              onClick={() => setActiveTab('storico')}
            >
              📜 Storico ({authStorico.length})
            </button>
          </div>

          {(activeTab === 'attive' || activeTab === 'storico') && (
            <button className="btn btn-mode-entrata" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Chiudi' : '+ Nuova Autorizzazione'}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="soci-content">
          {showForm && (activeTab === 'attive' || activeTab === 'storico') && (
            <div className="soci-form-wrapper">
              <AuthForm onSubmit={handleNuovaAuth} onClose={() => setShowForm(false)} soci={sociAggregati.map(s => s.socio)} />
            </div>
          )}

          {activeTab === 'soci' && <SociTable data={sociAggregati} />}
          {activeTab === 'attive' && <AuthTable data={authAttive} type="attive" onRevoca={handleRevoca} />}
          {activeTab === 'storico' && <AuthTable data={authStorico} type="storico" />}
        </div>
      </div>
    </>
  )
}
