// ═══════════════════════════════════════════════
// TIPI DI DOMINIO — Marina OS
// Estratti e riconciliati dai prototipi HTML
// ═══════════════════════════════════════════════

// ── Ruoli utente ──
export type UserRole = 'torre' | 'direzione' | 'ormeggiatore' | 'responsabile'

// ── Stato posto barca ──
export type BerthStatus =
  | 'libero'
  | 'occupato_socio'
  | 'socio_assente'
  | 'socio_assente_lungo'
  | 'occupato_transito'
  | 'transito_assente'
  | 'occupato_affittuario'
  | 'affittuario_assente'
  | 'in_cantiere'
  | 'bunker'
  | 'riservato'

// ── Tipo cliente ──
export type ClientType = 'pf' | 'az' | 'so' // persona fisica, azienda, socio

// ── Tipo movimento ──
export type MovementType = 'entrata' | 'uscita' | 'uscita_temporanea' | 'uscita_definitiva' | 'spostamento' | 'cantiere' | 'bunker'

// ── Scenario ──
export type MovementScenario = 'socio' | 'transito' | 'affittuario'

// ── Tipo autorizzazione ──
export type AuthType = 'affitto' | 'ospite' | 'amico'

// ── Stato autorizzazione ──
// 'pendente' = autorizzazione creata automaticamente dalla Torre al momento
// dell'ingresso di un affittuario senza doc. ufficiale. È un placeholder:
// la Direzione DEVE completare numero_protocollo, data_firma, canone,
// data_inizio, data_fine prima di passarla ad 'attiva'.
export type AuthStatus = 'pendente' | 'attiva' | 'scaduta' | 'revocata'

// ── Tipo manutenzione ──
export type MaintenanceType = 'subacqueo' | 'ordinario' | 'straordinario' | 'cantiere'

// ── Urgenza ──
export type Urgency = 'normale' | 'urgente' | 'programmato'

// ── Metodo pagamento ──
export type PaymentMethod = 'contante' | 'pos' | 'bonifico'

// ───────────────────────────────────────────────
// ENTITÀ PRINCIPALI
// ───────────────────────────────────────────────

export interface Client {
  id: number
  tipo: ClientType
  nome: string
  iniziali: string
  // Persona fisica
  cf?: string
  naz?: string
  dataNascita?: string
  docTipo?: string
  docNum?: string
  // Azienda
  ragione?: string
  piva?: string
  sede?: string
  pec?: string
  referenti?: ContactPerson[]
  // Socio
  posto?: string
  pontile?: string
  catPosto?: string
  dimMax?: string
  azioni?: string
  // Contatti comuni
  tel?: string
  email?: string
  indirizzo?: string
}

export interface ContactPerson {
  nome: string
  ruolo: string
  tel: string
}

export interface Boat {
  id: number
  clientId: number
  nome: string
  matricola: string
  tipo: 'Motore' | 'Vela' | 'Catamarano' | 'Gommone' | 'Altro'
  tipologia?: 'socio' | 'transito' | 'affittuario'
  modello?: string
  cantiere?: string
  anno?: number
  lunghezza: number
  larghezza: number
  pescaggio: number
  stazzaGT?: number
  bandiera: string
  portoIscrizione?: string
  numRegistro?: string
  posto?: string
  // NOTA: lo stato della barca NON è un campo proprio.
  // È derivato da berth.stato del posto in cui si trova:
  //   const berth = posti.find(p => p.id === boat.posto)
  //   const statoBarca = berth?.stato
  // Single source of truth: berths.stato. Vedi MEDIO 5 / memoria.
  registrazioneCompleta?: boolean
}

export interface Berth {
  id: string         // es. "C 1"
  // Nota: la lettera del pontile (A, B, C, D...) IDENTIFICA già il lato del
  // braccio. Ogni braccio ha due fiancate, ciascuna con la propria lettera
  // (es. braccio 1 = pontile A a destra + pontile B a sinistra). Per questo
  // NON esiste una proprietà `lato` sul Berth: sarebbe ridondante.
  pontile: string    // es. "Pontile Charlie"
  lunMax: number
  larMax: number
  profondita: number
  categoria: string  // es. "Cat. IV"
  stato: BerthStatus
  barcaOra?: string
  socioId?: number
}

export interface OwnershipTitle {
  id: number
  clientId: number
  berthId: string
  numero: string        // es. "PTRT-2019-0441"
  dataAcquisizione: string
  azioni: number
  catAzioni: string
  canone: string
  scadenzaCanone: string
}

// ════════════════════════════════════════════
// REGISTRAZIONE PENDENTE (25 Apr 2026)
// ════════════════════════════════════════════
// Vista unificata di una "barca entrata in porto la cui registrazione
// non è ancora completa". Tre motivi possibili (anagrafica incompleta,
// autorizzazione pendente, pagamento mancante) → una sola UI di
// completamento (CompletaRegistrazionePage).
//
// Backend domani: GET /api/registrations/pending restituisce un array
// di RegistrazionePendente con la stessa shape. Frontend non cambia.
//
// Vedi memoria: registrazione_pendente_pattern.md
export type MotivoPendenza = 'anagrafica' | 'auth' | 'pagamento'

export interface RegistrazionePendente {
  boat: Boat
  client?: Client
  berth?: Berth
  // Discriminator: deriva da boat.tipologia, qui esposto piatto per
  // facilitare filtri e badge UI.
  tipo: 'transito' | 'affittuario'
  // Lista non vuota di motivi per cui la registrazione è pendente.
  // Una stessa barca può avere più motivi simultanei (es. affittuario
  // con anagrafica incompleta E auth pendente).
  motivi: MotivoPendenza[]
  // Auth pendente collegata, se presente (popolata solo se motivi include 'auth').
  authPendente?: Authorization
  // Timestamp ISO della rilevazione (per ordinamento "più vecchi in cima").
  rilevatoIl: string
}

export interface Authorization {
  id: number
  socioId: number
  berthId: string
  tipo: AuthType
  beneficiario: string
  barca: string
  matricola: string
  tel: string
  // Campi documentali: obbligatori per 'attiva' | 'scaduta' | 'revocata',
  // opzionali per 'pendente' (placeholder creato dalla Torre, da compilare in Direzione).
  dal?: string
  al?: string
  giorniResidui?: number
  stato: AuthStatus
  note?: string
  authDa?: string
  // Tracciabilità: chi e quando ha creato il record pendente.
  creatoDaMovementId?: number
  creatoDa?: string // operatore Torre
  creatoIl?: string // ISO datetime
}

export interface Movement {
  id: number
  ora: string
  data?: string
  nome: string          // nome barca
  matricola: string
  tipo: MovementType
  posto: string
  postoOrigine?: string // per spostamento, cantiere, bunker
  scenario: MovementScenario
  auth: boolean
  // Marca il movimento come registrato senza autorizzazione valida:
  // la Torre ha creato un'auth 'pendente' che la Direzione deve compilare.
  // Ortogonale a `auth`: auth=false + flag_attesa_auth=true → registrato in attesa.
  flag_attesa_auth?: boolean
  origine?: string
  destinazione?: string
  pagamento: string
  note?: string
  operatore: {
    nome: string
    ruolo: string
    iniziali: string
  }
}

export interface Tariff {
  categoria: string   // es. "Cat. I"
  dimMax: string      // es. "fino a 9,0m"
  lunMax: number      // valore numerico per confronto
  prezzoGiorno: number
  ivaInclusa: boolean
  acquaInclusa: boolean
}

export interface MaintenanceJob {
  id: number
  berthCodice: string       // Codice posto (es. 'C 1')
  tipoLavoro: string        // Es. 'Sostituzione catenaria principale'
  descrizione?: string      // Dettaglio tecnico
  urgenza: Urgency
  stato: 'dafare' | 'incorso' | 'completato'
  origine: 'torre' | 'direzione' | 'socio'
  clientId?: number         // Socio segnalante
  assegnatoA: string        // 'Reparto subacquei' o nome operatore
  completatoDa?: string
  completatoOre?: string
  dataPrevista: string      // Data pianificata
}

export interface Report {
  id: number
  zona: string              // Es. 'Pontile B — lato destro'
  tipoProblema: string      // Es. 'Illuminazione pontile'
  descrizione?: string
  urgenza: Urgency
  stato: 'dafare' | 'incorso' | 'completato'
  canale: 'telefono' | 'email' | 'ispezione' | 'di_persona'
  clientId?: number         // Socio segnalante
  assegnatoA: 'manutenzione' | 'ormeggiatori' | 'subacquei' | 'esterno'
  origine: 'torre' | 'direzione'
  dataSegnalazione: string
}

export interface Receipt {
  numero: string
  data: string
  nomeBarca: string
  matricola: string
  posto: string
  periodo: string
  giorni: number
  categoria: string
  tariffa: number
  extra: number
  totale: number
  metodo: PaymentMethod
  operatore: string
}

// ── Arrivo Previsto (M-11) ──
export type ArrivalStatus = 'atteso' | 'oggi' | 'in_ritardo' | 'arrivato' | 'annullato'

export interface Arrival {
  id: number
  nomeBarca: string
  matricola: string
  bandiera?: string
  tipo?: string
  lunghezza: number
  pescaggio?: number
  postoIndicato: string       // Posto suggerito/riservato
  dataPrevista: string        // ISO date (YYYY-MM-DD)
  oraPrevista?: string        // Es. '14:30'
  stato: ArrivalStatus
  note?: string
  inseritoDa: string          // Nome operatore che ha inserito la prenotazione
  createdAt: string           // ISO date
}

// -- UTENTI E RUOLI (M-12) --

export interface SystemUser {
  id: number
  nome: string
  email: string
  ruolo: UserRole
  stato: 'attivo' | 'disattivo'
  ultimoAccesso?: string
}

// -- NOTIFICHE E ALERT (M-05) --
export type AlertUrgency = 'alta' | 'media' | 'bassa'
export type AlertCategory = 'amministrazione' | 'operativo' | 'sistema'

export interface SystemAlert {
  id: number
  titolo: string
  descrizione: string
  urgenza: AlertUrgency
  categoria: AlertCategory
  data: string
  stato: 'nuova' | 'letta' | 'risolta'
  // Tracciabilità: collega l'alert all'entità che lo ha generato.
  // Usato dal flusso "auth pendente": registraEntrata({ pendente: true })
  // crea un'Authorization placeholder + un SystemAlert legato via
  // relatedAuthId. Quando la Direzione completa l'autorizzazione,
  // l'alert viene marcato 'risolta' automaticamente.
  relatedAuthId?: number
  relatedMovementId?: number
}
