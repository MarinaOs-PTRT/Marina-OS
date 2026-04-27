// ═══════════════════════════════════════════════
// TIPI DI DOMINIO — Marina OS
//
// Modello v3 (27 Apr 2026) — REFACTOR STATI
// Vedi MASTER_FILE_v3.md (in produzione) e memoria
// `model_v3_stati.md` per la spiegazione architetturale completa.
//
// Principio guida: separare i 3 piani di realtà
//   1. Amministrativo  → OwnershipTitle, Authorization
//   2. Fisico          → Berth.agibile (true/false)
//   3. Operativo       → Stay, CantiereSession (chi sta dove ADESSO)
//
// `Stay` è il cuore del nuovo modello: rappresenta un soggiorno di una
// barca su un posto. Aperto = barca presente, chiuso (con `fine`) =
// barca uscita. Tutti gli stati visivi del porto si derivano da Stay,
// CantiereSession, OwnershipTitle, Authorization, senza enum stato berth.
// ═══════════════════════════════════════════════

// ── Ruoli utente ──
export type UserRole = 'torre' | 'direzione' | 'ormeggiatore' | 'responsabile'

// ── DEPRECATED — BerthStatus (modello v2)
// Mantenuto solo per retrocompatibilità durante il refactor.
// Le UI vanno migrate alle query derivate del GlobalState.
// Verrà rimosso quando tutti i consumer saranno aggiornati.
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

// ── Stato visivo derivato (modello v3) ──
// Usato dal drawer mappa e dalla colorazione visiva. NON è un campo
// memorizzato sul Berth: è restituito dalla query `getStatoVisivoBerth(id)`
// che legge Stay/CantiereSession/OwnershipTitle/Authorization.
export type BerthVisualState =
  | 'libero'                 // nessuno Stay aperto, nessun titolo
  | 'fuori_servizio'         // berth.agibile === false
  | 'socio_presente'         // Stay aperto della barca del socio titolare
  | 'socio_assente'          // OwnershipTitle attivo, nessuno Stay aperto, nessun cantiere
  | 'socio_in_cantiere'      // OwnershipTitle attivo, CantiereSession aperta, nessuno Stay
  | 'socio_su_altro_posto'   // Stay aperto della barca del socio MA su un berth diverso dal suo
  | 'transito'               // Stay aperto tipologia 'transito' su posto senza titolo
  | 'affittuario_su_socio'   // Stay aperto tipologia 'affittuario'/'ospite'/'amico' su posto di socio
  | 'bunker'                 // Stay aperto tipologia 'bunker'

// ── Tipo cliente ──
export type ClientType = 'pf' | 'az' | 'so' // persona fisica, azienda, socio

// ── Tipo movimento ──
// Modello v3: 'uscita_temporanea' e 'uscita_definitiva' sono mantenuti per
// granularità di audit (l'operatore comunica intenzione), ma a livello di
// modello entrambi chiudono lo Stay corrente nello stesso modo.
export type MovementType =
  | 'entrata'
  | 'uscita'
  | 'uscita_temporanea'
  | 'uscita_definitiva'
  | 'spostamento'
  | 'cantiere'
  | 'bunker'
  | 'rientro'    // chiude CantiereSession e apre Stay sul berthOriginale

// ── Scenario ──
// Aggiunti 'ospite' e 'amico' come scenari distinti dell'auth gratuita.
export type MovementScenario = 'socio' | 'transito' | 'affittuario' | 'ospite' | 'amico'

// ── Tipologia Stay ──
// Ricalca lo scenario del movimento di apertura, più 'bunker' come caso speciale.
export type StayTipologia = 'socio' | 'transito' | 'affittuario' | 'ospite' | 'amico' | 'bunker'

// ── Tipo autorizzazione ──
export type AuthType = 'affitto' | 'ospite' | 'amico'

// ── Stato autorizzazione ──
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
  // Socio (campi cosmetici, NON SSOT)
  // L'informazione canonica "quali posti possiede questo socio" deriva
  // dagli OwnershipTitle attivi. Questi campi restano come hint visivo
  // per la pagina cliente (es. "posto principale per stampe/badge").
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
  // DEPRECATED v3 — Boat.posto NON è SSOT.
  // L'informazione canonica "dove è la barca adesso" deriva da
  // `postoDellaBarca(boatId)` che cerca lo Stay aperto.
  // Mantenuto temporaneamente per non rompere consumer non ancora aggiornati.
  posto?: string
  registrazioneCompleta?: boolean
}

export interface Berth {
  id: string         // es. "C 1"
  pontile: string    // es. "Pontile Charlie"
  lunMax: number
  larMax: number
  profondita: number
  categoria: string  // es. "Cat. IV"
  // ── Modello v3 ──
  // Stato fisico: il posto è fisicamente utilizzabile?
  // false = manutenzione straordinaria, ristrutturazione, fuori servizio.
  // Default true (popolato in demo-data e in updateOrCreatePosto).
  agibile: boolean
  notaAgibilita?: string  // es. "Rifacimento pontile, riapertura prevista 30/05"
  // ── DEPRECATED v3 — campi del vecchio modello ──
  // `stato` e `barcaOra` non sono più SSOT. Lo stato si deriva via
  // getStatoVisivoBerth(id), l'occupazione corrente via barcaSulPosto(id).
  // Restano qui solo per retrocompatibilità durante il refactor.
  stato?: BerthStatus
  barcaOra?: string
  // ── socioId ──
  // Reso opzionale: oggi è ridondante (l'OwnershipTitle è la SSOT).
  // Mantenuto per veloce lookup nella UI senza join.
  socioId?: number
}

export interface OwnershipTitle {
  id: number
  clientId: number
  berthId: string
  // ── Modello v3 ──
  // boatId opzionale: se il socio non ha barca attualmente assegnata
  // a questo posto (caso "venduta", "in cerca", "posto investimento"
  // sfitto), boatId è undefined. Una stessa coppia clientId/berthId può
  // avere più OwnershipTitle nel tempo, ma solo uno con `attivo=true`.
  boatId?: number
  // Storia v3: di default true. false = titolo ceduto/storico.
  attivo?: boolean
  numero: string        // es. "PTRT-2019-0441"
  dataAcquisizione: string
  azioni: number
  catAzioni: string
  canone: string
  scadenzaCanone: string
}

// ════════════════════════════════════════════
// STAY — soggiorno di una barca su un posto (modello v3)
// Cuore del nuovo modello. Ogni Stay rappresenta un periodo continuo di
// occupazione fisica di un berth da parte di una boat. Aperto = `fine`
// è undefined → la barca è LÌ in questo momento. Chiuso = `fine` settato
// → la barca è andata via.
//
// Invarianti applicate dal data layer:
//  - Per ogni boatId esiste al MASSIMO uno Stay aperto (la barca è in
//    un solo posto alla volta).
//  - Per ogni berthId esiste al MASSIMO uno Stay aperto (un posto è
//    occupato da una sola barca alla volta).
//  - Uno Stay può esistere SOLO su berth con agibile=true.
//
// Ciclo di vita:
//  - registraEntrata        → apre nuovo Stay
//  - registraUscita*        → setta fine sullo Stay aperto della barca
//  - registraSpostamento    → chiude Stay su origine + apre su destinazione (atomico)
//  - registraCantiere       → chiude Stay + apre CantiereSession
//  - registraRientro        → chiude CantiereSession + apre Stay (su berthOriginale o altro)
// ════════════════════════════════════════════
export interface Stay {
  id: number
  boatId: number
  berthId: string
  inizio: string             // ISO timestamp di apertura (movimento di entrata)
  fine?: string              // ISO timestamp di chiusura. Undefined = ancora aperto.
  tipologia: StayTipologia
  // Se l'occupazione deriva da un'autorizzazione (affittuario/ospite/amico)
  authId?: number
  // Tracciabilità: id del movimento che ha aperto e/o chiuso questo Stay.
  movementApriId?: number
  movementChiudiId?: number
  note?: string
}

// ════════════════════════════════════════════
// CANTIERE SESSION — assenza per cantiere esterno (modello v3)
// Quando una barca va in cantiere, viene chiuso lo Stay corrente e
// aperta una CantiereSession. Lo Stay non c'è più (la barca non è
// fisicamente sul posto), ma sappiamo che è in cantiere e ricordiamo
// da quale berth è partita per poterla riportare lì al rientro.
//
// Invarianti:
//  - Per ogni boatId esiste al MASSIMO una CantiereSession aperta.
//  - Una CantiereSession aperta NON impedisce l'apertura di nuovi Stay
//    sul berthOriginale (es. il socio autorizza un affittuario): il
//    rientro del socio in quel caso richiederà alert UI per scegliere
//    altro posto.
// ════════════════════════════════════════════
export interface CantiereSession {
  id: number
  boatId: number
  berthOriginale: string     // posto del socio (riferimento per rientro)
  inizio: string             // ISO timestamp
  fine?: string              // ISO timestamp; undefined = ancora in cantiere
  movementInizioId?: number  // movimento di apertura (tipo 'cantiere')
  movementFineId?: number    // movimento di chiusura (tipo 'rientro')
  note?: string
}

// ════════════════════════════════════════════
// REGISTRAZIONE PENDENTE (25 Apr 2026)
// Vista derivata, non persistita. Vedi memoria registrazione_pendente_pattern.md
// ════════════════════════════════════════════
export type MotivoPendenza = 'anagrafica' | 'auth' | 'pagamento'

export interface RegistrazionePendente {
  boat: Boat
  client?: Client
  berth?: Berth
  tipo: 'transito' | 'affittuario'
  motivi: MotivoPendenza[]
  authPendente?: Authorization
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
  dal?: string
  al?: string
  giorniResidui?: number
  stato: AuthStatus
  note?: string
  authDa?: string
  creatoDaMovementId?: number
  creatoDa?: string
  creatoIl?: string
}

export interface Movement {
  id: number
  ora: string
  data?: string
  nome: string
  matricola: string
  tipo: MovementType
  posto: string
  postoOrigine?: string
  scenario: MovementScenario
  auth: boolean
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
  categoria: string
  dimMax: string
  lunMax: number
  prezzoGiorno: number
  ivaInclusa: boolean
  acquaInclusa: boolean
}

export interface MaintenanceJob {
  id: number
  berthCodice: string
  tipoLavoro: string
  descrizione?: string
  urgenza: Urgency
  stato: 'dafare' | 'incorso' | 'completato'
  origine: 'torre' | 'direzione' | 'socio'
  clientId?: number
  assegnatoA: string
  completatoDa?: string
  completatoOre?: string
  dataPrevista: string
}

export interface Report {
  id: number
  zona: string
  tipoProblema: string
  descrizione?: string
  urgenza: Urgency
  stato: 'dafare' | 'incorso' | 'completato'
  canale: 'telefono' | 'email' | 'ispezione' | 'di_persona'
  clientId?: number
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
  postoIndicato: string
  dataPrevista: string
  oraPrevista?: string
  stato: ArrivalStatus
  note?: string
  inseritoDa: string
  createdAt: string
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
  relatedAuthId?: number
  relatedBoatId?: number
  relatedMovementId?: number
}
