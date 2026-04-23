import React, { createContext, useContext, useState, ReactNode } from 'react'
import {
  Client, Boat, Berth, Movement, Tariff, MaintenanceJob, Report,
  Receipt, Arrival, OwnershipTitle, Authorization, SystemUser, SystemAlert
} from '@shared/types'
import {
  CLIENTI_DEMO, BARCHE_DEMO, POSTI_DEMO, MOVIMENTI_DEMO,
  TARIFFE_DEMO, MANUTENZIONI_DEMO, SEGNALAZIONI_DEMO, RICEVUTE_DEMO,
  ARRIVI_DEMO, TITOLI_POSSESSO_DEMO, AUTORIZZAZIONI_DEMO,
  UTENTI_SISTEMA_DEMO, NOTIFICHE_DEMO
} from '@shared/demo-data'

interface GlobalState {
  clienti: Client[]
  barche: Boat[]
  posti: Berth[]
  movimenti: Movement[]
  tariffe: Tariff[]
  manutenzioni: MaintenanceJob[]
  segnalazioni: Report[]
  ricevute: Receipt[]
  arrivi: Arrival[]
  titoli: OwnershipTitle[]
  autorizzazioni: Authorization[]
  utenti: SystemUser[]
  notifiche: SystemAlert[]

  // Azioni di Base
  addMovimento: (m: Movement) => void
  updatePosto: (id: string, updates: Partial<Berth>) => void
  addArrivo: (a: Arrival) => void
  resolveArrivo: (id: number) => void
  markNotifica: (id: number, stato: 'letta' | 'risolta') => void
}

const GlobalContext = createContext<GlobalState | undefined>(undefined)

export function GlobalProvider({ children }: { children: ReactNode }) {
  const [clienti, setClienti] = useState<Client[]>(CLIENTI_DEMO)
  const [barche, setBarche] = useState<Boat[]>(BARCHE_DEMO)
  const [posti, setPosti] = useState<Berth[]>(POSTI_DEMO)
  const [movimenti, setMovimenti] = useState<Movement[]>(MOVIMENTI_DEMO)
  const [tariffe, setTariffe] = useState<Tariff[]>(TARIFFE_DEMO)
  const [manutenzioni, setManutenzioni] = useState<MaintenanceJob[]>(MANUTENZIONI_DEMO)
  const [segnalazioni, setSegnalazioni] = useState<Report[]>(SEGNALAZIONI_DEMO)
  const [ricevute, setRicevute] = useState<Receipt[]>(RICEVUTE_DEMO)
  const [arrivi, setArrivi] = useState<Arrival[]>(ARRIVI_DEMO)
  const [titoli, setTitoli] = useState<OwnershipTitle[]>(TITOLI_POSSESSO_DEMO)
  const [autorizzazioni, setAutorizzazioni] = useState<Authorization[]>(AUTORIZZAZIONI_DEMO)
  const [utenti, setUtenti] = useState<SystemUser[]>(UTENTI_SISTEMA_DEMO)
  const [notifiche, setNotifiche] = useState<SystemAlert[]>(NOTIFICHE_DEMO)

  // -- Implementazione Azioni --

  const addMovimento = (m: Movement) => {
    setMovimenti(prev => [m, ...prev])
    
    // Logica di Business: Aggiorna lo stato del posto barca in base al movimento
    if (m.tipo === 'entrata') {
      updatePosto(m.posto, { stato: m.scenario === 'socio' ? 'occupato_socio' : 'occupato_transito' })
    } else if (m.tipo === 'uscita') {
      updatePosto(m.posto, { stato: m.scenario === 'socio' ? 'socio_assente' : 'libero' })
    }
  }

  const updatePosto = (id: string, updates: Partial<Berth>) => {
    setPosti(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }

  const addArrivo = (a: Arrival) => setArrivi(prev => [...prev, a])
  
  const resolveArrivo = (id: number) => {
    setArrivi(prev => prev.map(a => a.id === id ? { ...a, stato: 'arrivato' } : a))
  }

  const markNotifica = (id: number, stato: 'letta' | 'risolta') => {
    setNotifiche(prev => prev.map(n => n.id === id ? { ...n, stato } : n))
  }

  return (
    <GlobalContext.Provider value={{
      clienti, barche, posti, movimenti, tariffe, manutenzioni,
      segnalazioni, ricevute, arrivi, titoli, autorizzazioni, utenti, notifiche,
      addMovimento, updatePosto, addArrivo, resolveArrivo, markNotifica
    }}>
      {children}
    </GlobalContext.Provider>
  )
}

export function useGlobalState() {
  const context = useContext(GlobalContext)
  if (!context) {
    throw new Error("useGlobalState must be used within a GlobalProvider")
  }
  return context
}
