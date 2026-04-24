import React, { createContext, useContext, useState, ReactNode } from 'react'
import {
  Client, Boat, Berth, BerthStatus, Movement, Tariff, MaintenanceJob, Report,
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
  updatePosto: (id: string, updates: Partial<Berth>) => void
  addArrivo: (a: Arrival) => void
  resolveArrivo: (id: number) => void
  markNotifica: (id: number, stato: 'letta' | 'risolta') => void

  // Azioni Logica Operativa
  registraEntrata: (m: Movement) => { ok: boolean; errore?: string }
  registraUscitaTemporanea: (m: Movement) => { ok: boolean; errore?: string }
  registraUscitaDefinitiva: (m: Movement) => { ok: boolean; errore?: string }
  registraSpostamento: (m: Movement, postoOrigine: string, postoDestinazione: string) => { ok: boolean; errore?: string }
  registraCantiere: (m: Movement, postoOrigine: string) => { ok: boolean; errore?: string }
  registraBunker: (m: Movement, postoOrigine: string) => { ok: boolean; errore?: string }
  registraRientro: (m: Movement) => { ok: boolean; errore?: string }

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
  // AZIONI LEGACY — @deprecated (24 Apr 2026)
  // ════════════════════════════════════════════
  // `addMovimento` non è più esposto nell'API pubblica del context.
  // Non validava lo stato corrente del posto, gestiva solo entrata/uscita
  // (non spostamento/cantiere/bunker/rientro) e poteva corrompere la
  // proprietà dei soci. È stato sostituito dalle funzioni `registra*`.
  // La definizione resta qui solo come riferimento storico finché non
  // siamo sicuri che nessun consumatore esterno la richiami.
  // Da cancellare definitivamente al prossimo giro di pulizia.

  // const addMovimento = (m: Movement) => { ... } — rimosso

  // ════════════════════════════════════════════
  // HELPER: Validazione stato corrente del posto
  // ════════════════════════════════════════════

  /** Verifica che il posto sia in uno degli stati ammessi per l'operazione */
  const validaStatoPosto = (
    postoId: string,
    statiAmmessi: BerthStatus[],
    operazione: string
  ): { valido: boolean; errore?: string; posto?: Berth } => {
    const posto = posti.find(p => p.id === postoId)
    if (!posto) {
      return { valido: false, errore: `Posto ${postoId} non trovato nel sistema.` }
    }
    if (!statiAmmessi.includes(posto.stato)) {
      return {
        valido: false,
        errore: `Impossibile eseguire "${operazione}" sul posto ${postoId}: stato attuale "${posto.stato}" non compatibile.`
      }
    }
    return { valido: true, posto }
  }

  /** Determina lo stato corretto del posto d'origine dopo che la barca lo lascia */
  const calcolaStatoOrigineDopoUscita = (posto: Berth, scenario: MovementScenario): Partial<Berth> => {
    // Se il posto ha un socioId proprietario, torna al socio (socio_assente)
    // Questo vale per socio, affittuario e qualsiasi barca su posto di un socio
    if (posto.socioId) {
      return { stato: 'socio_assente' as const, barcaOra: undefined }
    }
    // Posto senza proprietario (transito generico): torna libero
    return { stato: 'libero' as const, barcaOra: undefined }
  }

  // ════════════════════════════════════════════
  // AZIONI LOGICA OPERATIVA MOVIMENTI
  // ════════════════════════════════════════════

  // Stati ammessi per ogni operazione
  const STATI_ENTRATA: BerthStatus[] = ['libero', 'socio_assente', 'socio_assente_lungo', 'affittuario_assente', 'transito_assente']
  const STATI_USCITA: BerthStatus[] = ['occupato_socio', 'occupato_transito', 'occupato_affittuario']

  /** M-01: Protocollo di Entrata */
  const registraEntrata = (m: Movement): { ok: boolean; errore?: string } => {
    if (!m.posto || m.posto === '—') {
      // Entrata senza posto assegnato — registra solo il movimento
      setMovimenti(prev => [m, ...prev])
      return { ok: true }
    }

    // Validazione stato corrente del posto
    const validazione = validaStatoPosto(m.posto, STATI_ENTRATA, 'entrata')
    if (!validazione.valido) {
      return { ok: false, errore: validazione.errore }
    }

    // Verifica autorizzazione per posti di soci (senza mutare l'input)
    let authValida = m.auth
    if (m.scenario !== 'socio') {
      const authCheck = checkAutorizzazione(m.posto, m.nome)
      if (!authCheck.autorizzato) {
        authValida = false
      }
    }

    // Registra il movimento (senza mutare il parametro originale)
    const mov: Movement = { ...m, auth: authValida }
    setMovimenti(prev => [mov, ...prev])

    const nuovoStato = mov.scenario === 'socio' ? 'occupato_socio' as const
      : mov.scenario === 'affittuario' ? 'occupato_affittuario' as const
      : 'occupato_transito' as const
    updateOrCreatePosto(mov.posto, { stato: nuovoStato, barcaOra: mov.nome })

    return { ok: true }
  }

  /** M-02a: Uscita Temporanea (Gita) — mantiene diritti sul posto */
  const registraUscitaTemporanea = (m: Movement): { ok: boolean; errore?: string } => {
    if (!m.posto || m.posto === '—') {
      return { ok: false, errore: 'Posto non specificato per uscita temporanea.' }
    }

    // Validazione: il posto deve essere occupato
    const validazione = validaStatoPosto(m.posto, STATI_USCITA, 'uscita temporanea')
    if (!validazione.valido) {
      return { ok: false, errore: validazione.errore }
    }

    const mov: Movement = { ...m, tipo: 'uscita_temporanea' }
    setMovimenti(prev => [mov, ...prev])

    // Lo stato cambia a "assente" ma il posto resta riservato
    let nuovoStato: Berth['stato']
    if (mov.scenario === 'socio') nuovoStato = 'socio_assente'
    else if (mov.scenario === 'affittuario') nuovoStato = 'affittuario_assente'
    else nuovoStato = 'transito_assente'

    updateOrCreatePosto(mov.posto, { stato: nuovoStato, barcaOra: mov.nome })
    return { ok: true }
  }

  /** M-02b: Uscita Definitiva — la barca lascia il porto */
  const registraUscitaDefinitiva = (m: Movement): { ok: boolean; errore?: string } => {
    if (!m.posto || m.posto === '—') {
      // Uscita senza posto (barca al bunker, in transito, ecc.)
      const mov: Movement = { ...m, tipo: 'uscita_definitiva' }
      setMovimenti(prev => [mov, ...prev])
      return { ok: true }
    }

    // Validazione: il posto deve essere occupato
    const validazione = validaStatoPosto(m.posto, STATI_USCITA, 'uscita definitiva')
    if (!validazione.valido) {
      return { ok: false, errore: validazione.errore }
    }
    const posto = validazione.posto!

    const mov: Movement = { ...m, tipo: 'uscita_definitiva' }
    setMovimenti(prev => [mov, ...prev])

    if (mov.scenario === 'socio') {
      // Socio esce: il posto resta suo, diventa socio_assente. socioId preservato.
      updateOrCreatePosto(mov.posto, { stato: 'socio_assente', barcaOra: undefined })
    } else if (mov.scenario === 'affittuario') {
      // Affittuario esce: il posto torna al socio proprietario. socioId preservato.
      updateOrCreatePosto(mov.posto, { stato: 'socio_assente', barcaOra: undefined })
    } else {
      // Transito esce: il posto torna libero
      // Se il posto ha un socioId (es. transito ospite su posto socio), torna al socio
      if (posto.socioId) {
        updateOrCreatePosto(mov.posto, { stato: 'socio_assente', barcaOra: undefined })
      } else {
        updateOrCreatePosto(mov.posto, { stato: 'libero', barcaOra: undefined })
      }
    }
    return { ok: true }
  }

  /** M-03: Spostamento Interno */
  const registraSpostamento = (m: Movement, postoOrigine: string, postoDestinazione: string): { ok: boolean; errore?: string } => {
    // Validazione stato destinazione: deve essere accessibile
    const validDest = validaStatoPosto(postoDestinazione, STATI_ENTRATA, 'spostamento (destinazione)')
    if (!validDest.valido) {
      return { ok: false, errore: validDest.errore }
    }

    // Validazione stato origine: deve essere occupato
    const validOrig = validaStatoPosto(postoOrigine, STATI_USCITA, 'spostamento (origine)')
    if (!validOrig.valido) {
      return { ok: false, errore: validOrig.errore }
    }
    const postoOrig = validOrig.posto!

    // Verifica autorizzazione per il posto di destinazione
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

    // Posto d'origine: se ha un socioId proprietario, torna a socio_assente; altrimenti libero
    const updatesOrigine = calcolaStatoOrigineDopoUscita(postoOrig, m.scenario)
    updateOrCreatePosto(postoOrigine, updatesOrigine)

    // Occupa il nuovo posto
    const nuovoStato = m.scenario === 'socio' ? 'occupato_socio' as const
      : m.scenario === 'affittuario' ? 'occupato_affittuario' as const
      : 'occupato_transito' as const
    updateOrCreatePosto(postoDestinazione, { stato: nuovoStato, barcaOra: m.nome })

    return { ok: true }
  }

  /** M-05a: Cantiere (Alaggio) — barca va in cantiere, posto d'origine riservato */
  const registraCantiere = (m: Movement, postoOrigine: string): { ok: boolean; errore?: string } => {
    if (!postoOrigine || postoOrigine === '—') {
      // Barca senza posto che va in cantiere (es. nuova barca appena arrivata)
      const mov: Movement = { ...m, tipo: 'cantiere', destinazione: 'Cantiere' }
      setMovimenti(prev => [mov, ...prev])
      return { ok: true }
    }

    // Validazione: il posto deve essere occupato
    const validazione = validaStatoPosto(postoOrigine, STATI_USCITA, 'cantiere')
    if (!validazione.valido) {
      return { ok: false, errore: validazione.errore }
    }
    const posto = validazione.posto!

    const mov: Movement = {
      ...m,
      tipo: 'cantiere',
      postoOrigine,
      origine: postoOrigine,
      destinazione: 'Cantiere'
    }
    setMovimenti(prev => [mov, ...prev])

    if (posto.socioId) {
      // Posto di un socio (o affittuario su posto socio): in_cantiere, socioId preservato
      updateOrCreatePosto(postoOrigine, { stato: 'in_cantiere', barcaOra: `In cantiere: ${m.nome}` })
    } else {
      // Transito senza socio proprietario: il posto torna libero
      updateOrCreatePosto(postoOrigine, { stato: 'libero', barcaOra: undefined })
    }

    return { ok: true }
  }

  /** M-05b: Bunker (Distributore) — la barca va al bunker, il posto resta riservato */
  const registraBunker = (m: Movement, postoOrigine: string): { ok: boolean; errore?: string } => {
    if (!postoOrigine || postoOrigine === '—') {
      return { ok: false, errore: 'Posto non specificato per il movimento bunker.' }
    }

    // Validazione: il posto deve essere occupato
    const validazione = validaStatoPosto(postoOrigine, STATI_USCITA, 'bunker')
    if (!validazione.valido) {
      return { ok: false, errore: validazione.errore }
    }

    const mov: Movement = {
      ...m,
      tipo: 'bunker',
      postoOrigine,
      origine: postoOrigine,
      destinazione: 'Bunker'
    }
    setMovimenti(prev => [mov, ...prev])

    // Il posto diventa "assente" — riservato per la barca che è al bunker
    // L'operatore poi deciderà dal bunker: rientro, uscita o spostamento
    let nuovoStato: Berth['stato']
    if (mov.scenario === 'socio') nuovoStato = 'socio_assente'
    else if (mov.scenario === 'affittuario') nuovoStato = 'affittuario_assente'
    else nuovoStato = 'transito_assente'

    updateOrCreatePosto(postoOrigine, { stato: nuovoStato, barcaOra: `Al bunker: ${m.nome}` })
    return { ok: true }
  }

  /** Rientro al posto — da stato *_assente a occupato_* */
  const registraRientro = (m: Movement): { ok: boolean; errore?: string } => {
    if (!m.posto || m.posto === '—') {
      return { ok: false, errore: 'Posto non specificato per il rientro.' }
    }

    // Validazione: il posto deve essere in stato "assente" (o in_cantiere per rientro da cantiere)
    const statiRientro: BerthStatus[] = ['socio_assente', 'socio_assente_lungo', 'transito_assente', 'affittuario_assente', 'in_cantiere']
    const validazione = validaStatoPosto(m.posto, statiRientro, 'rientro')
    if (!validazione.valido) {
      return { ok: false, errore: validazione.errore }
    }

    const mov: Movement = { ...m, tipo: 'entrata' }
    setMovimenti(prev => [mov, ...prev])

    const nuovoStato = mov.scenario === 'socio' ? 'occupato_socio' as const
      : mov.scenario === 'affittuario' ? 'occupato_affittuario' as const
      : 'occupato_transito' as const
    updateOrCreatePosto(mov.posto, { stato: nuovoStato, barcaOra: mov.nome })

    return { ok: true }
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
      updatePosto, addArrivo, resolveArrivo, markNotifica,
      addCliente, addBarca, updateBarca, addRicevuta,
      registraEntrata, registraUscitaTemporanea, registraUscitaDefinitiva,
      registraSpostamento, registraCantiere, registraBunker, registraRientro,
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
