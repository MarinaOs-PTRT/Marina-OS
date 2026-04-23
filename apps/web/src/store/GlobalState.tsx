import React, { createContext, useContext, useState, ReactNode } from 'react'
import {
  Client, Boat, Berth, Movement, Tariff, MaintenanceJob, Report,
  Receipt, Arrival, OwnershipTitle, Authorization, SystemUser, SystemAlert,
  MovementScenario
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

  // Azioni Logica Operativa
  registraEntrata: (m: Movement) => { ok: boolean; errore?: string }
  registraUscitaTemporanea: (m: Movement) => void
  registraUscitaDefinitiva: (m: Movement) => void
  registraSpostamento: (m: Movement, postoOrigine: string, postoDestinazione: string) => { ok: boolean; errore?: string }
  registraCantiere: (m: Movement, postoOrigine: string) => void
  registraBunker: (m: Movement, postoOrigine: string) => void

  // CRUD
  addCliente: (c: Client) => void
  addBarca: (b: Boat) => void
  updateBarca: (id: number, updates: Partial<Boat>) => void
  addRicevuta: (r: Receipt) => void

  // Helper di verifica
  isPostoOccupato: (postoId: string) => boolean
  checkPagamentoSaldato: (nomeBarca: string) => boolean
  checkAutorizzazione: (postoId: string, nomeBarca: string) => { autorizzato: boolean; motivo?: string }
  getScenarioBarca: (nomeBarca: string, matricola: string) => MovementScenario | null
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

  // ════════════════════════════════════════════
  // HELPER INTERNI
  // ════════════════════════════════════════════

  const updateOrCreatePosto = (id: string, updates: Partial<Berth>) => {
    setPosti(prev => {
      const exists = prev.find(p => p.id === id)
      if (exists) {
        // Aggiorna il posto esistente
        return prev.map(p => p.id === id ? { ...p, ...updates } : p)
      } else {
        // Crea un nuovo posto al volo (transito in un posto non censito)
        const pontile = id.split(' ')[0] || 'Transito'
        const newBerth: Berth = {
          id,
          pontile: `Pontile ${pontile}`,
          lato: 'Sinistro',
          lunMax: 15,
          larMax: 4.5,
          profondita: 3.0,
          categoria: 'Cat. III',
          stato: 'libero',
          ...updates
        }
        return [...prev, newBerth]
      }
    })
  }

  // ════════════════════════════════════════════
  // HELPER DI VERIFICA (esposti nel context)
  // ════════════════════════════════════════════

  /** Verifica se un posto è fisicamente occupato */
  const isPostoOccupato = (postoId: string): boolean => {
    const posto = posti.find(p => p.id === postoId)
    if (!posto) return false
    return posto.stato === 'occupato_socio' || 
           posto.stato === 'occupato_transito' || 
           posto.stato === 'occupato_affittuario'
  }

  /** Verifica se esiste una ricevuta saldata per una barca */
  const checkPagamentoSaldato = (nomeBarca: string): boolean => {
    return ricevute.some(r => r.nomeBarca === nomeBarca)
  }

  /** Verifica se esiste un'autorizzazione valida per un posto */
  const checkAutorizzazione = (postoId: string, nomeBarca: string): { autorizzato: boolean; motivo?: string } => {
    // Il posto appartiene a un socio?
    const posto = posti.find(p => p.id === postoId)
    if (!posto || !posto.socioId) {
      // Posto non assegnato a nessun socio — nessuna autorizzazione richiesta
      return { autorizzato: true }
    }

    // Il socio proprietario è lo stesso che porta la barca?
    const socio = clienti.find(c => c.id === posto.socioId)
    const barcheSocio = barche.filter(b => b.clientId === posto.socioId)
    if (barcheSocio.some(b => b.nome === nomeBarca)) {
      return { autorizzato: true }
    }

    // Controlla le autorizzazioni registrate
    const auth = autorizzazioni.find(a => 
      a.berthId === postoId && 
      a.barca === nomeBarca && 
      a.stato === 'attiva'
    )
    if (auth) {
      return { autorizzato: true }
    }

    return { 
      autorizzato: false, 
      motivo: `Il posto ${postoId} è assegnato al socio ${socio?.nome || 'N/D'}. Autorizzazione mancante o scaduta per "${nomeBarca}".`
    }
  }

  /** Rileva automaticamente lo scenario della barca */
  const getScenarioBarca = (nomeBarca: string, matricola: string): MovementScenario | null => {
    const barca = barche.find(b => 
      b.nome.toLowerCase() === nomeBarca.toLowerCase() ||
      (matricola && b.matricola.toLowerCase() === matricola.toLowerCase())
    )
    if (!barca) return null

    const cliente = clienti.find(c => c.id === barca.clientId)
    if (cliente?.tipo === 'so') return 'socio'
    return null // Non è socio — l'operatore deve classificare manualmente
  }

  // ════════════════════════════════════════════
  // AZIONI LEGACY (mantenute per compatibilità)
  // ════════════════════════════════════════════

  const addMovimento = (m: Movement) => {
    setMovimenti(prev => [m, ...prev])
    
    // Logica di Business: Aggiorna lo stato del posto barca
    if (m.posto && m.posto !== '—') {
      if (m.tipo === 'entrata') {
        const nuovoStato = m.scenario === 'socio' ? 'occupato_socio' as const 
          : m.scenario === 'affittuario' ? 'occupato_affittuario' as const
          : 'occupato_transito' as const
        updateOrCreatePosto(m.posto, { stato: nuovoStato, barcaOra: m.nome })
      } else if (m.tipo === 'uscita') {
        const nuovoStato = m.scenario === 'socio' ? 'socio_assente' as const : 'libero' as const
        updateOrCreatePosto(m.posto, { stato: nuovoStato, barcaOra: nuovoStato === 'libero' ? undefined : m.nome })
      }
    }
  }

  // ════════════════════════════════════════════
  // AZIONI LOGICA OPERATIVA MOVIMENTI
  // ════════════════════════════════════════════

  /** M-01: Protocollo di Entrata */
  const registraEntrata = (m: Movement): { ok: boolean; errore?: string } => {
    // Verifica posto occupato
    if (m.posto && m.posto !== '—' && isPostoOccupato(m.posto)) {
      return { ok: false, errore: `Il posto ${m.posto} è già occupato. Assegnare una destinazione differente.` }
    }

    // Verifica autorizzazione per posti di soci
    if (m.posto && m.posto !== '—' && m.scenario !== 'socio') {
      const authCheck = checkAutorizzazione(m.posto, m.nome)
      if (!authCheck.autorizzato) {
        // Non blocca — ma il campo auth nel movimento sarà false
        m.auth = false
      }
    }

    setMovimenti(prev => [m, ...prev])

    if (m.posto && m.posto !== '—') {
      const nuovoStato = m.scenario === 'socio' ? 'occupato_socio' as const
        : m.scenario === 'affittuario' ? 'occupato_affittuario' as const
        : 'occupato_transito' as const
      updateOrCreatePosto(m.posto, { stato: nuovoStato, barcaOra: m.nome })
    }
    return { ok: true }
  }

  /** M-02a: Uscita Temporanea (Gita) — mantiene diritti sul posto */
  const registraUscitaTemporanea = (m: Movement) => {
    const mov: Movement = { ...m, tipo: 'uscita_temporanea' }
    setMovimenti(prev => [mov, ...prev])

    if (mov.posto && mov.posto !== '—') {
      // Lo stato cambia a "assente" ma il posto resta riservato
      let nuovoStato: Berth['stato']
      if (mov.scenario === 'socio') nuovoStato = 'socio_assente'
      else if (mov.scenario === 'affittuario') nuovoStato = 'affittuario_assente'
      else nuovoStato = 'transito_assente'
      
      updateOrCreatePosto(mov.posto, { stato: nuovoStato, barcaOra: mov.nome })
    }
  }

  /** M-02b: Uscita Definitiva — scioglie il legame con il posto */
  const registraUscitaDefinitiva = (m: Movement) => {
    const mov: Movement = { ...m, tipo: 'uscita_definitiva' }
    setMovimenti(prev => [mov, ...prev])

    if (mov.posto && mov.posto !== '—') {
      if (mov.scenario === 'socio') {
        // Per i soci: il posto viene liberato (il popup di conferma
        // "Vuoi rimuovere titolo al proprietario?" è gestito dall'UI prima di chiamare)
        updateOrCreatePosto(mov.posto, { stato: 'libero', barcaOra: undefined, socioId: undefined })
      } else {
        // Per transiti e affittuari: il posto torna libero
        updateOrCreatePosto(mov.posto, { stato: 'libero', barcaOra: undefined })
      }
    }
  }

  /** M-03: Spostamento Interno — richiede sempre autorizzazione */
  const registraSpostamento = (m: Movement, postoOrigine: string, postoDestinazione: string): { ok: boolean; errore?: string } => {
    // Verifica posto destinazione occupato
    if (isPostoOccupato(postoDestinazione)) {
      return { ok: false, errore: `Il posto ${postoDestinazione} è già occupato.` }
    }

    // Verifica SEMPRE autorizzazione proprietario per il posto di destinazione
    const authCheck = checkAutorizzazione(postoDestinazione, m.nome)
    if (!authCheck.autorizzato) {
      return { ok: false, errore: authCheck.motivo || 'Autorizzazione mancante per il posto di destinazione.' }
    }

    const mov: Movement = {
      ...m,
      tipo: 'spostamento',
      posto: postoDestinazione,
      postoOrigine,
      origine: postoOrigine,
      destinazione: postoDestinazione
    }
    setMovimenti(prev => [mov, ...prev])

    // Libera il posto di origine
    updateOrCreatePosto(postoOrigine, { stato: 'libero', barcaOra: undefined })

    // Occupa il nuovo posto
    const nuovoStato = m.scenario === 'socio' ? 'occupato_socio' as const
      : m.scenario === 'affittuario' ? 'occupato_affittuario' as const
      : 'occupato_transito' as const
    updateOrCreatePosto(postoDestinazione, { stato: nuovoStato, barcaOra: m.nome })

    return { ok: true }
  }

  /** M-05a: Cantiere (Alaggio) — posto d'origine riservato (non disponibile per transiti) */
  const registraCantiere = (m: Movement, postoOrigine: string) => {
    const mov: Movement = {
      ...m,
      tipo: 'cantiere',
      postoOrigine,
      origine: postoOrigine,
      destinazione: 'Cantiere'
    }
    setMovimenti(prev => [mov, ...prev])

    if (postoOrigine && postoOrigine !== '—') {
      // Il posto del socio diventa "riservato" — non appare nei suggerimenti transiti
      // Il posto di un transito torna libero
      if (mov.scenario === 'socio' || mov.scenario === 'affittuario') {
        updateOrCreatePosto(postoOrigine, { stato: 'riservato', barcaOra: `In cantiere: ${m.nome}` })
      } else {
        // Transiti: il posto torna libero
        updateOrCreatePosto(postoOrigine, { stato: 'libero', barcaOra: undefined })
      }
    }
  }

  /** M-05b: Bunker (Distributore) — uscita temporanea automatica */
  const registraBunker = (m: Movement, postoOrigine: string) => {
    const mov: Movement = {
      ...m,
      tipo: 'bunker',
      postoOrigine,
      origine: postoOrigine,
      destinazione: 'Bunker'
    }
    setMovimenti(prev => [mov, ...prev])

    if (postoOrigine && postoOrigine !== '—') {
      // Registra uscita temporanea automatica dal posto
      let nuovoStato: Berth['stato']
      if (mov.scenario === 'socio') nuovoStato = 'socio_assente'
      else if (mov.scenario === 'affittuario') nuovoStato = 'affittuario_assente'
      else nuovoStato = 'transito_assente'

      updateOrCreatePosto(postoOrigine, { stato: nuovoStato, barcaOra: `Al bunker: ${m.nome}` })
    }
  }

  // ════════════════════════════════════════════
  // AZIONI ACCESSORIE
  // ════════════════════════════════════════════

  const updatePosto = (id: string, updates: Partial<Berth>) => {
    updateOrCreatePosto(id, updates)
  }

  // ════════════════════════════════════════════
  // CRUD — Registrazione Transiti
  // ════════════════════════════════════════════

  const addCliente = (c: Client) => setClienti(prev => [...prev, c])

  const addBarca = (b: Boat) => setBarche(prev => [...prev, b])

  const updateBarca = (id: number, updates: Partial<Boat>) => {
    setBarche(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b))
  }

  const addRicevuta = (r: Receipt) => setRicevute(prev => [...prev, r])

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
      addMovimento, updatePosto, addArrivo, resolveArrivo, markNotifica,
      addCliente, addBarca, updateBarca, addRicevuta,
      registraEntrata, registraUscitaTemporanea, registraUscitaDefinitiva,
      registraSpostamento, registraCantiere, registraBunker,
      isPostoOccupato, checkPagamentoSaldato, checkAutorizzazione, getScenarioBarca
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
