import React, { useState, useMemo } from 'react'
import { TopBar } from '../../components/TopBar'
import { SociTable } from './components/SociTable'
import { AuthTable } from './components/AuthTable'
import { AuthForm } from './components/AuthForm'
import { useGlobalState } from '../../store/GlobalState'
import { Authorization, AuthStatus } from '@shared/types'
import './SociPage.css'

type ActiveTab = 'soci' | 'pendenti' | 'attive' | 'storico'

export function SociPage() {
  const { clienti, posti, titoli, autorizzazioni: autorizzazioniGlobali } = useGlobalState()
  const [activeTab, setActiveTab] = useState<ActiveTab>('soci')
  const [autorizzazioni, setAutorizzazioni] = useState<Authorization[]>(autorizzazioniGlobali)
  const [showForm, setShowForm] = useState(false)

  // Calcola dati soci aggregati
  const sociAggregati = useMemo(() => {
    return clienti.filter(c => c.tipo === 'so').map(socio => {
      const titolo = titoli.find(t => t.clientId === socio.id)
      const posto = posti.find(b => b.id === titolo?.berthId)
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

  const authPendenti = autorizzazioni.filter(a => a.stato === 'pendente')
  const authAttive = autorizzazioni.filter(a => a.stato === 'attiva')
  // Storico = ciò che è "chiuso" (scaduta o revocata). Le pendenti sono
  // lavoro da fare e hanno la loro tab dedicata.
  const authStorico = autorizzazioni.filter(a => a.stato === 'scaduta' || a.stato === 'revocata')

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
              className={`soci-tab ${activeTab === 'pendenti' ? 'active' : ''}`}
              onClick={() => setActiveTab('pendenti')}
              style={authPendenti.length > 0 ? { color: 'var(--color-text-warning)', fontWeight: 600 } : undefined}
            >
              ⏳ Da Compilare ({authPendenti.length})
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
          {activeTab === 'pendenti' && <AuthTable data={authPendenti} type="storico" />}
          {activeTab === 'attive' && <AuthTable data={authAttive} type="attive" onRevoca={handleRevoca} />}
          {activeTab === 'storico' && <AuthTable data={authStorico} type="storico" />}
        </div>
      </div>
    </>
  )
}
