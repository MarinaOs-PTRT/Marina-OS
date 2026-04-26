import React, { createContext, useContext, useState, ReactNode } from 'react'
import {
  Client, Boat, Berth, BerthStatus, Movement, Tariff, MaintenanceJob, Report,
  Receipt, Arrival, OwnershipTitle, Authorization, AuthType, SystemUser, SystemAlert,
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
  // opts.pendente=true: affittuario senza autorizzazione valida → crea auth placeholder
  // e notifica la Direzione. Scelta consapevole dall'operatore Torre via modale bloccante.
  registraEntrata: (m: Movement, opts?: { pendente?: boolean }) => { ok: boolean; errore?: string }
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

  // ── Registrazione Nuovo Socio (M-13) ──
  // Operazione atomica: crea cliente (tipo='so') + barca + titolo di possesso
  // + aggiorna il berth assegnato (socioId + stato='socio_assente').
  registraNuovoSocio: (dati: {
    cliente: Omit<Client, 'id'>
    barca: Omit<Boat, 'id' | 'clientId'>
    titolo: Omit<OwnershipTitle, 'id' | 'clientId'>
  }) => { ok: boolean; errore?: string; clienteId?: number }

  // ── Autorizzazioni (M-10) ──
  // addAutorizzazione: creazione manuale dalla Direzione (form "Nuova Autorizzazione").
  //   Default stato='attiva'. Ritorna l'id assegnato.
  // updateAutorizzazione: edit generico (note, telefono, ecc.) senza cambio stato.
  // completaAutorizzazionePendente: passaggio chiave del loop MEDIO 4.
  //   Dato l'id di un'auth pendente + i dati documentali compilati dalla Direzione:
  //     1. Aggiorna l'auth → stato='attiva' + dal/al/giorniResidui/authDa
  //     2. Aggiorna il Movement collegato → auth=true, flag_attesa_auth=undefined
  //     3. Marca il SystemAlert correlato → stato='risolta'
  //   Ritorna { ok, errore? } per gestire validazione (date coerenti, ecc.).
  // revocaAutorizzazione: passaggio attiva→revocata (con motivo opzionale).
  addAutorizzazione: (a: Omit<Authorization, 'id'>) => number
  updateAutorizzazione: (id: number, updates: Partial<Authorization>) => void
  completaAutorizzazionePendente: (
    id: number,
    dati: {
      tipo: AuthType
      beneficiario: string
      tel?: string
      barca: string
      matricola?: string
      dal: string
      al: string
      note?: string
      authDa: string
    }
  ) => { ok: boolean; errore?: string }
  revocaAutorizzazione: (id: number, motivo?: string) => void

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

  /** M-01: Protocollo di Entrata
   *
   *  opts.pendente=true:
   *    L'operatore Torre ha confermato in modale bloccante l'ingresso di un
   *    affittuario senza autorizzazione valida. Creiamo:
   *      1. Il Movement con flag_attesa_auth=true (e auth=false)
   *      2. Un'Authorization placeholder con stato='pendente' e campi
   *         documentali (dal/al/authDa/giorniResidui) volutamente undefined:
   *         la Direzione DEVE compilarli consapevolmente.
   *      3. Un SystemAlert per la Direzione (categoria='operativo', urgenza='media')
   *    Il berth diventa 'occupato_affittuario' perché la barca È fisicamente entrata.
   */
  const registraEntrata = (m: Movement, opts?: { pendente?: boolean }): { ok: boolean; errore?: string } => {
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
    const isPendente = opts?.pendente === true
    const mov: Movement = {
      ...m,
      auth: isPendente ? false : authValida,
      flag_attesa_auth: isPendente ? true : undefined
    }
    setMovimenti(prev => [mov, ...prev])

    // Modalità pendente: crea placeholder auth + alert Direzione
    if (isPendente) {
      const posto = validazione.posto!
      const nuovaAuthId = Math.max(0, ...autorizzazioni.map(a => a.id)) + 1
      const authPendente: Authorization = {
        id: nuovaAuthId,
        socioId: posto.socioId ?? 0, // 0 = nessun socio titolare noto al momento
        berthId: mov.posto,
        tipo: 'affitto',             // default sensato per una pendente da compilare
        beneficiario: mov.nome,      // usiamo il nome barca come segnaposto
        barca: mov.nome,
        matricola: mov.matricola,
        tel: '',
        stato: 'pendente',
        // dal, al, giorniResidui, authDa: volutamente undefined → Direzione deve compilare
        creatoDaMovementId: mov.id,
        creatoDa: mov.operatore.nome,
        creatoIl: new Date().toISOString()
      }
      setAutorizzazioni(prev => [...prev, authPendente])

      const nuovaNotificaId = Math.max(0, ...notifiche.map(n => n.id)) + 1
      const alert: SystemAlert = {
        id: nuovaNotificaId,
        titolo: 'Autorizzazione da compilare',
        descrizione: `Posto ${mov.posto} — barca "${mov.nome}" (${mov.matricola}). Ingresso registrato in attesa di autorizzazione dal ${mov.operatore.nome}. Compilare il documento ufficiale.`,
        urgenza: 'media',
        categoria: 'operativo',
        data: new Date().toISOString(),
        stato: 'nuova',
        // Loop di chiusura: completaAutorizzazionePendente troverà
        // questo alert via relatedAuthId e lo marcherà 'risolta'.
        relatedAuthId: nuovaAuthId,
        relatedMovementId: mov.id
      }
      setNotifiche(prev => [alert, ...prev])
    }

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

  // ════════════════════════════════════════════
  // REGISTRAZIONE NUOVO SOCIO (M-13) — operazione atomica
  // ════════════════════════════════════════════
  const registraNuovoSocio = (dati: {
    cliente: Omit<Client, 'id'>
    barca: Omit<Boat, 'id' | 'clientId'>
    titolo: Omit<OwnershipTitle, 'id' | 'clientId'>
  }): { ok: boolean; errore?: string; clienteId?: number } => {
    // Validazioni base
    if (!dati.cliente.nome.trim()) return { ok: false, errore: 'Il nome del socio è obbligatorio.' }
    if (!dati.titolo.berthId.trim()) return { ok: false, errore: 'Seleziona un posto fisso da assegnare.' }
    if (!dati.barca.nome.trim()) return { ok: false, errore: 'Il nome della barca è obbligatorio.' }

    // Il posto non deve già avere un socioId
    const postoEsistente = posti.find(p => p.id === dati.titolo.berthId)
    if (postoEsistente?.socioId) {
      const socioPropr = clienti.find(c => c.id === postoEsistente.socioId)
      return { ok: false, errore: `Il posto ${dati.titolo.berthId} è già assegnato al socio ${socioPropr?.nome || '#' + postoEsistente.socioId}.` }
    }

    // 1. Crea il cliente con tipo='so'
    const nuovoClienteId = Math.max(0, ...clienti.map(c => c.id)) + 1
    const nuovoCliente: Client = {
      ...dati.cliente,
      id: nuovoClienteId,
      tipo: 'so',
      posto: dati.titolo.berthId,
    }
    setClienti(prev => [...prev, nuovoCliente])

    // 2. Crea la barca collegata
    const nuovoBoatId = Math.max(0, ...barche.map(b => b.id)) + 1
    const nuovaBarca: Boat = {
      ...dati.barca,
      id: nuovoBoatId,
      clientId: nuovoClienteId,
      tipologia: 'socio',
      posto: dati.titolo.berthId,
      registrazioneCompleta: true,
    }
    setBarche(prev => [...prev, nuovaBarca])

    // 3. Crea il titolo di possesso
    const nuovoTitoloId = Math.max(0, ...titoli.map(t => t.id)) + 1
    const nuovoTitolo: OwnershipTitle = {
      ...dati.titolo,
      id: nuovoTitoloId,
      clientId: nuovoClienteId,
    }
    setTitoli(prev => [...prev, nuovoTitolo])

    // 4. Aggiorna il berth: assegna il socioId e imposta stato='socio_assente'
    updateOrCreatePosto(dati.titolo.berthId, {
      socioId: nuovoClienteId,
      stato: 'socio_assente',
      barcaOra: undefined,
    })

    return { ok: true, clienteId: nuovoClienteId }
  }

  const addArrivo = (a: Arrival) => setArrivi(prev => [...prev, a])
  
  const resolveArrivo = (id: number) => {
    setArrivi(prev => prev.map(a => a.id === id ? { ...a, stato: 'arrivato' } : a))
  }

  const markNotifica = (id: number, stato: 'letta' | 'risolta') => {
    setNotifiche(prev => prev.map(n => n.id === id ? { ...n, stato } : n))
  }

  // ════════════════════════════════════════════
  // CRUD — Autorizzazioni (M-10)
  // ════════════════════════════════════════════

  /** Crea una nuova autorizzazione (di solito dalla Direzione, stato 'attiva' di default).
   *  Ritorna l'id assegnato per permettere ai chiamanti di referenziarla. */
  const addAutorizzazione = (a: Omit<Authorization, 'id'>): number => {
    const newId = Math.max(0, ...autorizzazioni.map(x => x.id)) + 1
    const newAuth: Authorization = { ...a, id: newId }
    setAutorizzazioni(prev => [...prev, newAuth])
    return newId
  }

  /** Edit generico (note, telefono, ecc.). NON usare per cambio stato:
   *  per il flusso pendente→attiva esiste completaAutorizzazionePendente,
   *  per attiva→revocata esiste revocaAutorizzazione. */
  const updateAutorizzazione = (id: number, updates: Partial<Authorization>) => {
    setAutorizzazioni(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a))
  }

  /** Loop di chiusura MEDIO 4: pendente → attiva.
   *  La Direzione fornisce i dati documentali mancanti. Il sistema:
   *    1. Aggiorna l'Authorization (stato + campi documentali)
   *    2. Regolarizza il Movement collegato (auth=true, flag_attesa_auth via)
   *    3. Marca il SystemAlert correlato come 'risolta' */
  const completaAutorizzazionePendente = (
    id: number,
    dati: {
      tipo: AuthType
      beneficiario: string
      tel?: string
      barca: string
      matricola?: string
      dal: string
      al: string
      note?: string
      authDa: string
    }
  ): { ok: boolean; errore?: string } => {
    const auth = autorizzazioni.find(a => a.id === id)
    if (!auth) {
      return { ok: false, errore: `Autorizzazione #${id} non trovata.` }
    }
    if (auth.stato !== 'pendente') {
      return { ok: false, errore: `Autorizzazione #${id} non è in stato 'pendente' (stato attuale: ${auth.stato}).` }
    }

    // Validazione date: al >= dal, al >= oggi
    const dDal = new Date(dati.dal)
    const dAl = new Date(dati.al)
    if (isNaN(dDal.getTime()) || isNaN(dAl.getTime())) {
      return { ok: false, errore: 'Date non valide.' }
    }
    if (dAl < dDal) {
      return { ok: false, errore: 'La data fine non può essere precedente alla data inizio.' }
    }

    const oggi = new Date()
    oggi.setHours(0, 0, 0, 0)
    const giorniResidui = Math.max(0, Math.round((dAl.getTime() - oggi.getTime()) / 86400000))

    // 1. Aggiorna l'autorizzazione
    setAutorizzazioni(prev => prev.map(a => a.id === id ? {
      ...a,
      tipo: dati.tipo,
      beneficiario: dati.beneficiario,
      tel: dati.tel ?? a.tel,
      barca: dati.barca,
      matricola: dati.matricola ?? a.matricola,
      dal: dati.dal,
      al: dati.al,
      giorniResidui,
      note: dati.note ?? a.note,
      authDa: dati.authDa,
      stato: 'attiva'
    } : a))

    // 2. Regolarizza il Movement collegato (se presente)
    if (auth.creatoDaMovementId !== undefined) {
      setMovimenti(prev => prev.map(m => m.id === auth.creatoDaMovementId
        ? { ...m, auth: true, flag_attesa_auth: undefined }
        : m
      ))
    }

    // 3. Marca come risolta la SystemAlert correlata
    setNotifiche(prev => prev.map(n => n.relatedAuthId === id
      ? { ...n, stato: 'risolta' as const }
      : n
    ))

    return { ok: true }
  }

  /** Revoca un'autorizzazione attiva. Mantiene lo storico. */
  const revocaAutorizzazione = (id: number, motivo?: string) => {
    setAutorizzazioni(prev => prev.map(a => a.id === id ? {
      ...a,
      stato: 'revocata' as const,
      note: motivo ? (a.note ? `${a.note} — Revoca: ${motivo}` : `Revoca: ${motivo}`) : a.note
    } : a))
  }

  return (
    <GlobalContext.Provider value={{
      clienti, barche, posti, movimenti, tariffe, manutenzioni,
      segnalazioni, ricevute, arrivi, titoli, autorizzazioni, utenti, notifiche,
      updatePosto, addArrivo, resolveArrivo, markNotifica,
      addCliente, addBarca, updateBarca, addRicevuta,
      registraNuovoSocio,
      addAutorizzazione, updateAutorizzazione,
      completaAutorizzazionePendente, revocaAutorizzazione,
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
