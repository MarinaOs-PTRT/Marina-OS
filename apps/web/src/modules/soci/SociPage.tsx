import React, { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { TopBar } from '../../components/TopBar'
import { SociTable } from './components/SociTable'
import { AuthTable } from './components/AuthTable'
import { AuthForm } from './components/AuthForm'
import { NuovoSocioForm } from './components/NuovoSocioForm'
import { useGlobalState } from '../../store/GlobalState'
import { Authorization } from '@shared/types'
import './SociPage.css'

type ActiveTab = 'soci' | 'pendenti' | 'attive' | 'storico' | 'nuovo'

export function SociPage() {
  // SSOT: tutte le scritture passano per il Context (non c'è più stato locale).
  // Le autorizzazioni 'pendente' create da registraEntrata({pendente:true})
  // appaiono qui automaticamente perché leggiamo dal Context.
  const {
    clienti, posti, titoli, autorizzazioni,
    addAutorizzazione, completaAutorizzazionePendente, revocaAutorizzazione,
    getStatoVisivoBerth,
  } = useGlobalState()

  // Controlla se c'è sovrapposizione con un'auth già attiva sullo stesso posto.
  // Usato sia per il create mode che come guard pre-submit.
  const checkSovrapposizione = (berthId: string, dal: string, al: string, excludeId?: number): string | null => {
    if (!dal || !al) return null
    const dDal = new Date(dal)
    const dAl = new Date(al)
    const conflitto = autorizzazioni.find(a =>
      a.id !== excludeId &&
      a.berthId === berthId &&
      a.stato === 'attiva' &&
      a.dal && a.al &&
      new Date(a.al) >= dDal &&
      new Date(a.dal) <= dAl
    )
    if (conflitto) {
      return `Il posto ${berthId} ha già un'autorizzazione attiva per "${conflitto.beneficiario}" nel periodo ${conflitto.dal} → ${conflitto.al}.`
    }
    return null
  }

  // Legge ?tab= dalla URL per deep-link diretto dalla NotifichePage.
  // Es. /soci?tab=pendenti → apre direttamente la tab "Da Compilare".
  const [searchParams] = useSearchParams()
  const tabFromUrl = searchParams.get('tab') as ActiveTab | null
  const tabValide: ActiveTab[] = ['soci', 'pendenti', 'attive', 'storico', 'nuovo']
  const [activeTab, setActiveTab] = useState<ActiveTab>(
    tabFromUrl && tabValide.includes(tabFromUrl) ? tabFromUrl : 'soci'
  )
  const [showForm, setShowForm] = useState(false)
  // editingAuth: l'autorizzazione pendente attualmente in modalità "Completa".
  // Quando valorizzato, AuthForm si apre in edit-mode con i campi pre-popolati.
  const [editingAuth, setEditingAuth] = useState<Authorization | null>(null)

  // Calcola dati soci aggregati (modello v3: stato derivato da
  // getStatoVisivoBerth invece di Berth.stato).
  const sociAggregati = useMemo(() => {
    return clienti.filter(c => c.tipo === 'so').map(socio => {
      const titolo = titoli.find(t => t.clientId === socio.id)
      const posto = posti.find(b => b.id === titolo?.berthId)
      const authAttiva = autorizzazioni.find(a => a.berthId === titolo?.berthId && a.stato === 'attiva')

      let statoPosto = 'Assente'
      let statoClass = 'pill-socio_assente'
      if (posto) {
        const visual = getStatoVisivoBerth(posto.id)
        if (visual === 'socio_presente') {
          statoPosto = 'Socio Presente'
          statoClass = 'pill-occupato_socio'
        } else if (visual === 'socio_in_cantiere') {
          statoPosto = 'In Cantiere'
          statoClass = 'pill-in_cantiere'
        } else if (visual === 'affittuario_su_socio' || authAttiva) {
          statoPosto = authAttiva ? `Autorizzato (${authAttiva.tipo})` : 'Affittuario Presente'
          statoClass = 'pill-occupato_affittuario'
        }
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
  }, [clienti, posti, titoli, autorizzazioni, getStatoVisivoBerth])

  const authPendenti = autorizzazioni.filter(a => a.stato === 'pendente')
  const authAttive = autorizzazioni.filter(a => a.stato === 'attiva')
  // Storico = ciò che è "chiuso" (scaduta o revocata). Le pendenti sono
  // lavoro da fare e hanno la loro tab dedicata.
  const authStorico = autorizzazioni.filter(a => a.stato === 'scaduta' || a.stato === 'revocata')

  const handleRevoca = (id: number) => {
    const motivo = prompt('Motivo della revoca (opzionale):') ?? undefined
    if (motivo === null) return // utente ha annullato
    revocaAutorizzazione(id, motivo || undefined)
  }

  /** Apertura form per completare un'auth pendente (loop MEDIO 4) */
  const handleCompleta = (auth: Authorization) => {
    setEditingAuth(auth)
    setShowForm(true)
  }

  /** Submit del form: due rami in base al modo (create vs edit) */
  const handleAuthSubmit = (auth: Omit<Authorization, 'id'>) => {
    if (editingAuth) {
      // Modalità EDIT: completiamo una pendente esistente.
      const res = completaAutorizzazionePendente(editingAuth.id, {
        tipo: auth.tipo,
        beneficiario: auth.beneficiario,
        tel: auth.tel,
        barca: auth.barca,
        matricola: auth.matricola,
        dal: auth.dal!,
        al: auth.al!,
        note: auth.note,
        authDa: auth.authDa ?? 'Direzione'
      })
      if (!res.ok) {
        alert(`Errore: ${res.errore}`)
        return
      }
      setEditingAuth(null)
      setShowForm(false)
      setActiveTab('attive')
    } else {
      // Modalità CREATE: nuova autorizzazione dalla Direzione.
      // Controllo sovrapposizione prima di salvare (Fix 29 Apr 2026).
      const errSovrap = checkSovrapposizione(auth.berthId, auth.dal ?? '', auth.al ?? '')
      if (errSovrap) {
        alert(`Sovrapposizione date: ${errSovrap}\nControlla le date o revoca la precedente autorizzazione.`)
        return
      }
      addAutorizzazione(auth)
      setShowForm(false)
      setActiveTab('attive')
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingAuth(null)
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
              Elenco Soci e Posti ({sociAggregati.length})
            </button>
            <button
              className={`soci-tab ${activeTab === 'pendenti' ? 'active' : ''}`}
              onClick={() => setActiveTab('pendenti')}
              style={authPendenti.length > 0 ? { color: 'var(--color-text-warning)', fontWeight: 600 } : undefined}
            >
              Da Compilare ({authPendenti.length})
            </button>
            <button
              className={`soci-tab ${activeTab === 'attive' ? 'active' : ''}`}
              onClick={() => setActiveTab('attive')}
            >
              Autorizzazioni Attive ({authAttive.length})
            </button>
            <button
              className={`soci-tab ${activeTab === 'storico' ? 'active' : ''}`}
              onClick={() => setActiveTab('storico')}
            >
              Storico ({authStorico.length})
            </button>
            <button
              className={`soci-tab ${activeTab === 'nuovo' ? 'active' : ''}`}
              onClick={() => setActiveTab('nuovo')}
              style={{ color: activeTab === 'nuovo' ? undefined : 'var(--color-text-info, #2E6CBC)', fontWeight: 600 }}
            >
              + Nuovo Socio
            </button>
          </div>

          {(activeTab === 'attive' || activeTab === 'storico' || activeTab === 'pendenti') && !editingAuth && (
            <button className="btn btn-mode-entrata" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Chiudi' : '+ Nuova Autorizzazione'}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="soci-content">
          {showForm && (
            <div className="soci-form-wrapper">
              <AuthForm
                onSubmit={handleAuthSubmit}
                onClose={handleCloseForm}
                soci={sociAggregati.map(s => s.socio)}
                initial={editingAuth ?? undefined}
              />
            </div>
          )}

          {activeTab === 'soci' && <SociTable data={sociAggregati} />}
          {activeTab === 'pendenti' && (
            <AuthTable data={authPendenti} type="pendenti" onCompleta={handleCompleta} />
          )}
          {activeTab === 'attive' && <AuthTable data={authAttive} type="attive" onRevoca={handleRevoca} />}
          {activeTab === 'storico' && <AuthTable data={authStorico} type="storico" />}
          {activeTab === 'nuovo' && (
            <NuovoSocioForm
              onSuccess={() => setActiveTab('soci')}
            />
          )}
        </div>
      </div>
    </>
  )
}
