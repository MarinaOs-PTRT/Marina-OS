import React, { createContext, useContext, useState, ReactNode } from 'react'
import {
  Client, Boat, Berth, BerthStatus, BerthVisualState, Movement, Tariff, MaintenanceJob, Report,
  Receipt, Arrival, OwnershipTitle, Authorization, AuthType, SystemUser, SystemAlert,
  MovementScenario, RegistrazionePendente, MotivoPendenza, Stay, CantiereSession, StayTipologia
} from '@shared/types'
import {
  CLIENTI_DEMO, BARCHE_DEMO, POSTI_DEMO, MOVIMENTI_DEMO,
  TARIFFE_DEMO, MANUTENZIONI_DEMO, SEGNALAZIONI_DEMO, RICEVUTE_DEMO,
  ARRIVI_DEMO, TITOLI_POSSESSO_DEMO, AUTORIZZAZIONI_DEMO,
  UTENTI_SISTEMA_DEMO, NOTIFICHE_DEMO, STAYS_DEMO, CANTIERE_SESSIONS_DEMO
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
  // ── Modello v3 (27 Apr 2026) ──
  // Stay = soggiorno barca su un posto (aperto se fine=undefined).
  // CantiereSession = barca attualmente in cantiere esterno.
  // Vedi MASTER_FILE_v3 §3 e memoria model_v3_stati.md
  stays: Stay[]
  cantieri: CantiereSession[]

  // ── Query derivate (modello v3) ──
  // Tutte le UI dovrebbero passare per queste query invece di leggere
  // direttamente Berth.stato/Berth.barcaOra/Boat.posto (deprecated).
  /** Lo Stay aperto sul berth (se c'è). */
  stayApertoSulBerth: (berthId: string) => Stay | undefined
  /** Lo Stay aperto della boat (se la boat è in porto). */
  stayApertoDellaBarca: (boatId: number) => Stay | undefined
  /** Boat che attualmente occupa il berth (se occupato). */
  barcaSulPosto: (berthId: string) => Boat | undefined
  /** Berth dove si trova attualmente la boat (se in porto). */
  postoDellaBarca: (boatId: number) => string | undefined
  /** True se la boat è in cantiere ora (CantiereSession aperta). */
  inCantiere: (boatId: number) => boolean
  /** CantiereSession aperta della boat. */
  cantiereDellaBarca: (boatId: number) => CantiereSession | undefined
  /** True se il berth è fisicamente utilizzabile (non in manutenzione). */
  agibile: (berthId: string) => boolean
  /** Stato visivo del berth — calcolato a runtime, mai memorizzato. */
  getStatoVisivoBerth: (berthId: string) => BerthVisualState
  /** OwnershipTitle attivo per il berth (se esiste). */
  titoloAttivoDelBerth: (berthId: string) => OwnershipTitle | undefined

  // Azioni di Base
  updatePosto: (id: string, updates: Partial<Berth>) => void
  addArrivo: (a: Arrival) => void
  resolveArrivo: (id: number) => void
  /** Aggiorna lo stato di un arrivo esistente. Generica → vale per
   *  'arrivato', 'annullato', 'in_ritardo', ecc. Sostituisce gli hack
   *  che chiamavano addArrivo per "annullare" (creando duplicati). */
  updateArrivoStato: (id: number, stato: Arrival['stato']) => void
  markNotifica: (id: number, stato: 'letta' | 'risolta') => void
  /** Cleanup: rimuove dall'array tutte le notifiche con stato='risolta'
   *  e data più vecchia di `gg` giorni. Default 30. Chiamabile lazy
   *  (es. al mount di /notifiche) — nessuno scheduler richiesto.
   *  Ritorna il numero di notifiche purgate. */
  purgeNotificheRisolte: (gg?: number) => number

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

  // Registrazioni Pendenti (M-RegPendente, 25 Apr 2026)
  getRegistrazioniPendenti: () => RegistrazionePendente[]
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
  // ── Modello v3 (27 Apr 2026) ──
  const [stays, setStays] = useState<Stay[]>(STAYS_DEMO)
  const [cantieri, setCantieri] = useState<CantiereSession[]>(CANTIERE_SESSIONS_DEMO)

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
          agibile: true,
          stato: 'libero',
          ...updates
        }
        return [...prev, newBerth]
      }
    })
  }

  // ════════════════════════════════════════════
  // MODELLO v3 — QUERY DERIVATE E HELPER STAY/CANTIERE (27 Apr 2026)
  // Tutte le UI dovrebbero passare da queste invece di leggere
  // direttamente Berth.stato/Berth.barcaOra/Boat.posto.
  // ════════════════════════════════════════════

  /** Stay aperto sul berth (se c'è). Massimo 1 per invariante. */
  const stayApertoSulBerth = (berthId: string): Stay | undefined =>
    stays.find(s => s.berthId === berthId && !s.fine)

  /** Stay aperto della boat (se la boat è in porto). Massimo 1 per invariante. */
  const stayApertoDellaBarca = (boatId: number): Stay | undefined =>
    stays.find(s => s.boatId === boatId && !s.fine)

  /** Boat che attualmente occupa il berth. */
  const barcaSulPosto = (berthId: string): Boat | undefined => {
    const s = stayApertoSulBerth(berthId)
    return s ? barche.find(b => b.id === s.boatId) : undefined
  }

  /** Berth dove si trova attualmente la boat. */
  const postoDellaBarca = (boatId: number): string | undefined =>
    stayApertoDellaBarca(boatId)?.berthId

  /** True se la boat è attualmente in cantiere esterno. */
  const inCantiere = (boatId: number): boolean =>
    cantieri.some(c => c.boatId === boatId && !c.fine)

  /** CantiereSession aperta della boat. */
  const cantiereDellaBarca = (boatId: number): CantiereSession | undefined =>
    cantieri.find(c => c.boatId === boatId && !c.fine)

  /** True se il berth è fisicamente utilizzabile. Default true se il
   *  campo `agibile` non è settato (compat con dati legacy). */
  const agibile = (berthId: string): boolean => {
    const b = posti.find(p => p.id === berthId)
    if (!b) return false
    return b.agibile !== false
  }

  /** OwnershipTitle attivo per il berth. */
  const titoloAttivoDelBerth = (berthId: string): OwnershipTitle | undefined =>
    titoli.find(t => t.berthId === berthId && t.attivo !== false)

  /**
   * Stato visivo del berth — calcolato a runtime dai 4 piani:
   *   Berth.agibile + Stay aperto + CantiereSession + OwnershipTitle.
   *
   * Implementa la tabella di mapping del MASTER_FILE_v3 §3.3:
   * vedi anche memoria model_v3_stati.md.
   */
  const getStatoVisivoBerth = (berthId: string): BerthVisualState => {
    if (!agibile(berthId)) return 'fuori_servizio'
    const stay = stayApertoSulBerth(berthId)
    const titolo = titoloAttivoDelBerth(berthId)

    if (!titolo) {
      // Posto senza titolo (es. transito puro, area torre)
      if (!stay) return 'libero'
      if (stay.tipologia === 'bunker') return 'bunker'
      return 'transito'
    }

    // Posto di un socio
    if (!stay) {
      // Nessuno fisicamente → cantiere o assenza
      if (titolo.boatId !== undefined && inCantiere(titolo.boatId)) return 'socio_in_cantiere'
      return 'socio_assente'
    }
    // Stay aperto: chi è? La barca del socio o un altro?
    if (titolo.boatId !== undefined && stay.boatId === titolo.boatId) {
      return 'socio_presente'
    }
    if (stay.tipologia === 'bunker') return 'bunker'
    // Stay di un'altra barca su posto socio: affittuario/ospite/amico
    return 'affittuario_su_socio'
  }

  /** Helper interno: apre uno Stay nuovo. Non valida invarianti — il
   *  chiamante (le funzioni `registra*`) deve essersi già occupato della
   *  validazione di stato del berth. */
  const apriStay = (data: {
    boatId: number
    berthId: string
    tipologia: StayTipologia
    authId?: number
    movementApriId?: number
    note?: string
  }): Stay => {
    const newId = Math.max(0, ...stays.map(s => s.id)) + 1
    const stay: Stay = {
      id: newId,
      boatId: data.boatId,
      berthId: data.berthId,
      inizio: new Date().toISOString(),
      tipologia: data.tipologia,
      authId: data.authId,
      movementApriId: data.movementApriId,
      note: data.note,
    }
    setStays(prev => [...prev, stay])
    return stay
  }

  /** Helper interno: chiude lo Stay aperto della barca, se esiste. */
  const chiudiStayDellaBarca = (boatId: number, movementChiudiId?: number) => {
    const fine = new Date().toISOString()
    setStays(prev => prev.map(s =>
      s.boatId === boatId && !s.fine
        ? { ...s, fine, movementChiudiId: movementChiudiId ?? s.movementChiudiId }
        : s
    ))
  }

  /** Helper interno: chiude qualsiasi Stay aperto sul berth (utile per
   *  spostamento dell'AVENTE-DIRITTO). */
  const chiudiStayDelBerth = (berthId: string, movementChiudiId?: number) => {
    const fine = new Date().toISOString()
    setStays(prev => prev.map(s =>
      s.berthId === berthId && !s.fine
        ? { ...s, fine, movementChiudiId: movementChiudiId ?? s.movementChiudiId }
        : s
    ))
  }

  /** Helper interno: apre una CantiereSession. */
  const apriCantiere = (data: {
    boatId: number
    berthOriginale: string
    movementInizioId?: number
    note?: string
  }): CantiereSession => {
    const newId = Math.max(0, ...cantieri.map(c => c.id)) + 1
    const cs: CantiereSession = {
      id: newId,
      boatId: data.boatId,
      berthOriginale: data.berthOriginale,
      inizio: new Date().toISOString(),
      movementInizioId: data.movementInizioId,
      note: data.note,
    }
    setCantieri(prev => [...prev, cs])
    return cs
  }

  /** Helper interno: chiude la CantiereSession aperta della barca, se esiste. */
  const chiudiCantiereDellaBarca = (boatId: number, movementFineId?: number) => {
    const fine = new Date().toISOString()
    setCantieri(prev => prev.map(c =>
      c.boatId === boatId && !c.fine
        ? { ...c, fine, movementFineId: movementFineId ?? c.movementFineId }
        : c
    ))
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
    if (!posto.stato || !statiAmmessi.includes(posto.stato)) {
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

    // ════════════════════════════════════════════
    // INVARIANTE DI SISTEMA (25 Apr 2026)
    // Ogni entrata di scenario 'transito' o 'affittuario' DEVE produrre una
    // Boat reale in barche[]. Senza questa garanzia la barca diventa
    // "fantasma" (vive solo come stringa barcaOra sul berth) e non è più
    // ricercabile da Torre per movimenti successivi.
    // Per i SOCI invece la boat deve preesistere in anagrafica (gestita
    // dalla Direzione via NuovoSocioForm), quindi non creiamo nulla.
    // Vedi memoria: registrazione_pendente_pattern.md
    // ════════════════════════════════════════════
    if (m.scenario === 'transito' || m.scenario === 'affittuario') {
      const nomeTrim = m.nome.trim()
      const matricolaTrim = (m.matricola || '').trim()
      const esistente = barche.find(b =>
        (nomeTrim && b.nome.toLowerCase() === nomeTrim.toLowerCase()) ||
        (matricolaTrim && matricolaTrim !== 'N/D' && b.matricola.toLowerCase() === matricolaTrim.toLowerCase())
      )
      if (!esistente && (nomeTrim || matricolaTrim)) {
        // Crea Client scheletro
        const baseIniz = nomeTrim || matricolaTrim || '??'
        const iniziali = baseIniz.substring(0, 2).toUpperCase()
        const labelTipo = m.scenario === 'affittuario' ? 'Affittuario' : 'Transito'
        const nuovoClientId = Math.max(0, ...clienti.map(c => c.id)) + 1
        const nuovoClient: Client = {
          id: nuovoClientId,
          tipo: 'pf',
          nome: `${labelTipo} — ${nomeTrim || matricolaTrim}`,
          iniziali
        }
        setClienti(prev => [...prev, nuovoClient])

        // Crea Boat scheletro
        const nuovoBoatId = Math.max(0, ...barche.map(b => b.id)) + 1
        const nuovaBoat: Boat = {
          id: nuovoBoatId,
          clientId: nuovoClientId,
          nome: nomeTrim || `Barca ${matricolaTrim}`,
          matricola: matricolaTrim || 'N/D',
          tipo: 'Altro',
          tipologia: m.scenario,    // 'transito' | 'affittuario' — discriminator per Pendenti
          lunghezza: 0,
          larghezza: 0,
          pescaggio: 0,
          bandiera: 'N/D',
          posto: m.posto,
          registrazioneCompleta: false  // → finisce in Registrazioni Pendenti
        }
        setBarche(prev => [...prev, nuovaBoat])

        // ════════════════════════════════════════════
        // NOTIFICA TRANSITO SENZA REGISTRAZIONE (27 Apr 2026)
        // Per i TRANSITI emetti un alert amministrativo che la Direzione
        // userà per completare l'anagrafica via /completa-registrazione/:boatId.
        // Auto-risolto in updateBarca quando registrazioneCompleta passa
        // a true (vedi blocco simmetrico più sotto).
        //
        // Per gli AFFITTUARI invece NON emettiamo qui: arriverà l'alert
        // "Autorizzazione da compilare" più sotto (modalità pendente),
        // che copre lo stesso flusso operativo. La Direzione completerà
        // anagrafica + auth nella stessa sessione su /completa-registrazione.
        // ════════════════════════════════════════════
        if (m.scenario === 'transito') {
          const nuovaNotificaId = Math.max(0, ...notifiche.map(n => n.id)) + 1
          const alertAnagrafica: SystemAlert = {
            id: nuovaNotificaId,
            titolo: 'Anagrafica transito da completare',
            descrizione: `Posto ${m.posto} — barca "${nuovaBoat.nome}" (${nuovaBoat.matricola}). Ingresso registrato dalla Torre (${m.operatore.nome}); l'anagrafica della barca è ancora vuota. Completare via "Registrazioni Pendenti".`,
            urgenza: 'media',
            categoria: 'amministrazione',
            data: new Date().toISOString(),
            stato: 'nuova',
            relatedBoatId: nuovoBoatId,
          }
          setNotifiche(prev => [alertAnagrafica, ...prev])
        }

        // ── Modello v3 ── Apertura Stay per la barca-scheletro appena creata.
        // Lo Stay viene creato qui perché poi (sotto) il lookup `boatPerStay`
        // farebbe `barche.find(...)` su uno snapshot che non ha ancora
        // ricevuto la nuova boat (setBarche è asincrono).
        const tipologiaSkel: StayTipologia = m.scenario as StayTipologia
        apriStay({
          boatId: nuovoBoatId,
          berthId: m.posto,
          tipologia: tipologiaSkel,
        })
      }
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

    // ── Modello v3 ──
    // Apre uno Stay sulla nuova posizione. Per fare questo devo trovare
    // l'id boat: se è socio cerca per nome+matricola in barche[]; se è
    // transito/affittuario appena creato, l'id è nuovoBoatId (catturato
    // più sopra nello scope... → ricerco di nuovo per essere robusto).
    const boatPerStay = barche.find(b =>
      b.nome.toLowerCase() === mov.nome.toLowerCase() ||
      (mov.matricola && b.matricola.toLowerCase() === (mov.matricola || '').toLowerCase())
    )
      // Caso: scheletro appena creato in questo stesso turno (non ancora in barche[]
      // perché setBarche è asincrono): cerca via `barcheVoIle = [...barche, nuovaBoat]`
      // non funziona perché nuovaBoat è dentro un if locale. Soluzione: gestiamo
      // l'apertura Stay nel ramo che crea la boat, sotto.
    if (boatPerStay) {
      // Se la barca era in cantiere ed entra su un posto qualunque, chiudi la sessione cantiere
      if (cantiereDellaBarca(boatPerStay.id)) {
        chiudiCantiereDellaBarca(boatPerStay.id, mov.id)
      }
      // Chiudi eventuale Stay già aperto (rientro da assenza di gita su stesso/altro posto)
      chiudiStayDellaBarca(boatPerStay.id, mov.id)
      const tipologiaStay: StayTipologia = mov.scenario as StayTipologia
      apriStay({
        boatId: boatPerStay.id,
        berthId: mov.posto,
        tipologia: tipologiaStay,
        movementApriId: mov.id,
      })
    }
    // Se non trovato (caso scheletro appena creato), lo Stay viene aperto
    // dentro al blocco di creazione boat (vedi più sopra, già patchato).

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

    // ── Modello v3 ── Chiudi lo Stay aperto della barca.
    // Per uscita_temporanea il modello v3 NON tiene traccia di "ha ancora
    // diritto al posto": la differenza tra temporanea/definitiva esiste
    // solo nel Movement.tipo (audit), non sullo Stay (che è chiuso comunque).
    const boat = barche.find(b =>
      b.nome.toLowerCase() === mov.nome.toLowerCase() ||
      (mov.matricola && b.matricola.toLowerCase() === mov.matricola.toLowerCase())
    )
    if (boat) chiudiStayDellaBarca(boat.id, mov.id)
    else chiudiStayDelBerth(mov.posto, mov.id)

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

    // ── Modello v3 ── Chiudi lo Stay aperto della barca / del berth.
    const boat = barche.find(b =>
      b.nome.toLowerCase() === mov.nome.toLowerCase() ||
      (mov.matricola && b.matricola.toLowerCase() === mov.matricola.toLowerCase())
    )
    if (boat) chiudiStayDellaBarca(boat.id, mov.id)
    else chiudiStayDelBerth(mov.posto, mov.id)

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

    // ── Modello v3 ── Spostamento atomico: chiudi Stay vecchio, apri nuovo.
    const boat = barche.find(b =>
      b.nome.toLowerCase() === mov.nome.toLowerCase() ||
      (mov.matricola && b.matricola.toLowerCase() === mov.matricola.toLowerCase())
    )
    if (boat) {
      chiudiStayDellaBarca(boat.id, mov.id)
      apriStay({
        boatId: boat.id,
        berthId: postoDestinazione,
        tipologia: m.scenario as StayTipologia,
        movementApriId: mov.id,
      })
    } else {
      // Fallback: chiudi qualsiasi stay sul berth d'origine. Il nuovo Stay
      // non viene aperto perché non sappiamo quale boatId usare. Edge case
      // patologico — non dovrebbe accadere se i movimenti vengono creati
      // dalla TorrePage che ricerca la boat prima.
      chiudiStayDelBerth(postoOrigine, mov.id)
    }

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

    // ── Modello v3 ── Chiudi Stay + apri CantiereSession.
    const boat = barche.find(b =>
      b.nome.toLowerCase() === mov.nome.toLowerCase() ||
      (mov.matricola && b.matricola.toLowerCase() === mov.matricola.toLowerCase())
    )
    if (boat) {
      chiudiStayDellaBarca(boat.id, mov.id)
      apriCantiere({
        boatId: boat.id,
        berthOriginale: postoOrigine,
        movementInizioId: mov.id,
        note: m.note,
      })
    } else {
      chiudiStayDelBerth(postoOrigine, mov.id)
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

    // ── Modello v3 ── Bunker = chiusura Stay corrente. La barca tornerà
    // (di solito) con un Rientro, riapertura Stay sul vecchio berth.
    const boat = barche.find(b =>
      b.nome.toLowerCase() === mov.nome.toLowerCase() ||
      (mov.matricola && b.matricola.toLowerCase() === mov.matricola.toLowerCase())
    )
    if (boat) chiudiStayDellaBarca(boat.id, mov.id)
    else chiudiStayDelBerth(postoOrigine, mov.id)

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

    // ── Modello v3 ── Chiudi CantiereSession se presente, apri Stay nuovo.
    const boat = barche.find(b =>
      b.nome.toLowerCase() === mov.nome.toLowerCase() ||
      (mov.matricola && b.matricola.toLowerCase() === mov.matricola.toLowerCase())
    )
    if (boat) {
      if (cantiereDellaBarca(boat.id)) {
        chiudiCantiereDellaBarca(boat.id, mov.id)
      }
      // Chiudi anche eventuale Stay residuo (es. rientro da bunker, lo Stay
      // era stato chiuso ma per sicurezza... no, in realtà è già chiuso).
      // Se c'è uno Stay aperto è un caso anomalo, lo chiudiamo per sicurezza.
      chiudiStayDellaBarca(boat.id, mov.id)
      apriStay({
        boatId: boat.id,
        berthId: mov.posto,
        tipologia: mov.scenario as StayTipologia,
        movementApriId: mov.id,
      })
    }

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
    // ════════════════════════════════════════════
    // AUTO-RISOLUZIONE NOTIFICA "Anagrafica transito" (27 Apr 2026)
    // Se questo update porta la boat da registrazioneCompleta=false a true,
    // chiudiamo automaticamente le notifiche `nuova`/`letta` con
    // relatedBoatId === id. Pattern simmetrico a quello già implementato
    // in completaAutorizzazionePendente per relatedAuthId.
    // ════════════════════════════════════════════
    const before = barche.find(b => b.id === id)
    const transizioneCompletamento =
      before &&
      before.registrazioneCompleta === false &&
      updates.registrazioneCompleta === true

    setBarche(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b))

    if (transizioneCompletamento) {
      setNotifiche(prev => prev.map(n =>
        n.relatedBoatId === id && n.stato !== 'risolta'
          ? { ...n, stato: 'risolta' }
          : n
      ))
    }
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

    // 3. Crea il titolo di possesso (modello v3: includi boatId + attivo)
    const nuovoTitoloId = Math.max(0, ...titoli.map(t => t.id)) + 1
    const nuovoTitolo: OwnershipTitle = {
      ...dati.titolo,
      id: nuovoTitoloId,
      clientId: nuovoClienteId,
      boatId: nuovoBoatId,
      attivo: true,
    }
    setTitoli(prev => [...prev, nuovoTitolo])

    // 4. Aggiorna il berth: assegna il socioId e imposta stato='socio_assente'
    //    (NB: in modello v3 lo "stato visivo" deriverà dalla query
    //    getStatoVisivoBerth, ma manteniamo socioId/stato per compat).
    updateOrCreatePosto(dati.titolo.berthId, {
      socioId: nuovoClienteId,
      stato: 'socio_assente',
      barcaOra: undefined,
    })

    // ── Modello v3 ──
    // NON apriamo uno Stay qui: il socio è "registrato" ma la sua barca
    // potrebbe non essere fisicamente presente al momento. La prima Entrata
    // dalla Torre aprirà uno Stay coerente.

    return { ok: true, clienteId: nuovoClienteId }
  }

  const addArrivo = (a: Arrival) => setArrivi(prev => [...prev, a])
  
  const resolveArrivo = (id: number) => {
    setArrivi(prev => prev.map(a => a.id === id ? { ...a, stato: 'arrivato' } : a))
  }

  /** Aggiorna lo stato di un arrivo esistente (vale per qualsiasi stato).
   *  Aggiunto 25 Apr 2026 dopo aver scoperto che ArriviPage chiamava
   *  addArrivo per "annullare" → creava duplicati ad ogni click. */
  const updateArrivoStato = (id: number, stato: Arrival['stato']) => {
    setArrivi(prev => prev.map(a => a.id === id ? { ...a, stato } : a))
  }

  const markNotifica = (id: number, stato: 'letta' | 'risolta') => {
    setNotifiche(prev => prev.map(n => n.id === id ? { ...n, stato } : n))
  }

  // ════════════════════════════════════════════
  // CLEANUP NOTIFICHE RISOLTE (27 Apr 2026)
  // Le notifiche risolte non hanno valore operativo: dopo N giorni
  // possono essere fisicamente rimosse. Implementazione lazy: chiamata
  // al mount di /notifiche (no scheduler, no interval).
  // Quando arriverà il backend, l'equivalente sarà un job notturno o
  // un trigger su DB; il frontend non dovrà più chiamare nulla.
  // ════════════════════════════════════════════
  const purgeNotificheRisolte = (gg: number = 30): number => {
    const sogliaMs = Date.now() - gg * 24 * 60 * 60 * 1000
    let purgate = 0
    setNotifiche(prev => prev.filter(n => {
      if (n.stato !== 'risolta') return true
      const dataMs = new Date(n.data).getTime()
      // Date invalide → conservative: NON purgare (meglio tenere che perdere)
      if (!Number.isFinite(dataMs)) return true
      const daPurgare = dataMs < sogliaMs
      if (daPurgare) purgate += 1
      return !daPurgare
    }))
    return purgate
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

  // ════════════════════════════════════════════
  // REGISTRAZIONI PENDENTI (25 Apr 2026) — vista unificata
  // ════════════════════════════════════════════
  /**
   * Restituisce TUTTE le barche con almeno un motivo di pendenza:
   *   - 'anagrafica' → boat.registrazioneCompleta === false
   *   - 'auth'       → esiste un'auth in stato 'pendente' per quel berth+barca
   *   - 'pagamento'  → (riservato per future estensioni; oggi non popolato)
   *
   * Ordinata dalla più vecchia (rilevatoIl crescente) → l'operatore vede
   * prima i casi che attendono da più tempo.
   *
   * Backend domani: questa funzione diventerà l'endpoint
   *   GET /api/registrations/pending
   * con la stessa shape di RegistrazionePendente[].
   */
  const getRegistrazioniPendenti = (): RegistrazionePendente[] => {
    const out: RegistrazionePendente[] = []

    // 1) Barche con anagrafica incompleta (transito o affittuario)
    for (const boat of barche) {
      if (boat.registrazioneCompleta === false) {
        const tipo = boat.tipologia === 'affittuario' ? 'affittuario' : 'transito'
        const motivi: MotivoPendenza[] = ['anagrafica']

        // Cerca un'auth pendente per stesso berth/barca
        const authPend = autorizzazioni.find(a =>
          a.stato === 'pendente' &&
          a.barca.toLowerCase() === boat.nome.toLowerCase() &&
          (!boat.posto || a.berthId === boat.posto)
        )
        if (authPend) motivi.push('auth')

        out.push({
          boat,
          client: clienti.find(c => c.id === boat.clientId),
          berth: boat.posto ? posti.find(p => p.id === boat.posto) : undefined,
          tipo,
          motivi,
          authPendente: authPend,
          rilevatoIl: authPend?.creatoIl ?? new Date().toISOString()
        })
      }
    }

    // 2) Auth pendenti per barche che invece hanno anagrafica completa
    //    (es. socio che richiede auth per nuovo affittuario su barca esistente).
    //    Evita duplicati: già aggiunte nel ciclo 1 se la boat era incompleta.
    for (const auth of autorizzazioni) {
      if (auth.stato !== 'pendente') continue
      const boat = barche.find(b => b.nome.toLowerCase() === auth.barca.toLowerCase())
      if (!boat) continue
      if (boat.registrazioneCompleta === false) continue // già nel ciclo 1
      out.push({
        boat,
        client: clienti.find(c => c.id === boat.clientId),
        berth: posti.find(p => p.id === auth.berthId),
        tipo: boat.tipologia === 'affittuario' ? 'affittuario' : 'transito',
        motivi: ['auth'],
        authPendente: auth,
        rilevatoIl: auth.creatoIl ?? new Date().toISOString()
      })
    }

    // Ordina dalla più vecchia in cima
    return out.sort((a, b) => a.rilevatoIl.localeCompare(b.rilevatoIl))
  }

  return (
    <GlobalContext.Provider value={{
      clienti, barche, posti, movimenti, tariffe, manutenzioni,
      segnalazioni, ricevute, arrivi, titoli, autorizzazioni, utenti, notifiche,
      stays, cantieri,
      updatePosto, addArrivo, resolveArrivo, updateArrivoStato, markNotifica, purgeNotificheRisolte,
      addCliente, addBarca, updateBarca, addRicevuta,
      registraNuovoSocio,
      addAutorizzazione, updateAutorizzazione,
      completaAutorizzazionePendente, revocaAutorizzazione,
      registraEntrata, registraUscitaTemporanea, registraUscitaDefinitiva,
      registraSpostamento, registraCantiere, registraBunker, registraRientro,
      isPostoOccupato, checkPagamentoSaldato, checkAutorizzazione, getScenarioBarca,
      getRegistrazioniPendenti,
      // Modello v3 — query derivate
      stayApertoSulBerth, stayApertoDellaBarca, barcaSulPosto, postoDellaBarca,
      inCantiere, cantiereDellaBarca, agibile, getStatoVisivoBerth,
      titoloAttivoDelBerth,
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
