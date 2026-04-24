import { Client, Boat, Berth, Movement, Tariff, MaintenanceJob, Report, Receipt, Arrival, OwnershipTitle, Authorization, SystemUser, UserRole, SystemAlert } from './types'

// ── CLIENTI E SOCI ──
export const CLIENTI_DEMO: Client[] = [
  {
    id: 1, tipo: 'so', nome: 'Marco Ferretti', iniziali: 'MF', naz: 'Italiana', cf: 'FRRMRC75A01H501Z',
    tel: '+39 333 4521789', email: 'm.ferretti@email.it', indirizzo: 'Via Aurelia 45, Roma',
    docTipo: 'Carta d\'identità', docNum: 'AB1234567',
    posto: 'A 5', pontile: 'Pontile Delta', catPosto: 'Cat. IV', dimMax: 'max 15,5m × 4,5m', azioni: '620'
  },
  {
    id: 2, tipo: 'pf', nome: 'Luca Bianchi', iniziali: 'LB', naz: 'Italiana', cf: 'BNCLCU82B10F205X',
    tel: '+39 320 5544321', email: 'luca.bianchi@mail.com', indirizzo: 'Via del Mare 12, Civitavecchia',
    docTipo: 'Passaporto', docNum: 'YA4521390'
  },
  {
    id: 3, tipo: 'az', nome: 'Nautical Charter SRL', iniziali: 'NC', naz: 'Italiana', piva: 'IT04521890123',
    ragione: 'Nautical Charter SRL', sede: 'Via Portuense 200, Roma', tel: '+39 06 8821234', email: 'info@nauticalcharter.it',
    referenti: [
      { nome: 'Andrea Conti', ruolo: 'Rappresentante legale', tel: '+39 347 1234567' },
      { nome: 'Stefano Mori', ruolo: 'Comandante ingaggiato', tel: '+39 320 9876543' }
    ]
  },
  {
    id: 4, tipo: 'so', nome: 'Giuseppe Ferri', iniziali: 'GF', naz: 'Italiana', cf: 'FRRGPP68C05H501K',
    tel: '+39 347 8821234', email: 'g.ferri@libero.it', indirizzo: 'Viale della Vittoria 8, Civitavecchia',
    docTipo: 'Carta d\'identità', docNum: 'CD9876543',
    posto: 'C 8', pontile: 'Pontile Delta', catPosto: 'Cat. II', dimMax: 'max 9m × 3,25m', azioni: '310'
  },
  {
    id: 5, tipo: 'so', nome: 'Anna Conti', iniziali: 'AC', naz: 'Italiana', cf: 'CNTANN70D55H501P',
    tel: '+39 335 7712345', email: 'a.conti@studio.it', indirizzo: 'Corso Vittorio 22, Roma',
    docTipo: 'Passaporto', docNum: 'YB8812300',
    posto: 'D 12', pontile: 'Pontile Delta', catPosto: 'Cat. III', dimMax: 'max 12m × 4,0m', azioni: '480'
  },
  {
    id: 6, tipo: 'so', nome: 'Paolo Greco', iniziali: 'PG', naz: 'Italiana', cf: 'GRCPLA72M10F839V',
    tel: '+39 329 4412233', email: 'p.greco@mail.com', indirizzo: 'Via Roma 5, Ladispoli',
    docTipo: 'Carta d\'identità', docNum: 'EF3344556',
    posto: 'D 7', pontile: 'Pontile Delta', catPosto: 'Cat. III', dimMax: 'max 12m × 4,0m', azioni: '480'
  },
  {
    id: 7, tipo: 'so', nome: 'Francesca Landi', iniziali: 'FL', naz: 'Italiana', cf: 'LNDFNC85P65H501Z',
    tel: '+39 338 9900112', email: 'flandi@email.com', indirizzo: 'Via Cassia 118, Roma',
    docTipo: 'Passaporto', docNum: 'ZC4490012',
    posto: 'G 8', pontile: 'Pontile Delta', catPosto: 'Cat. II', dimMax: 'max 10m × 3,5m', azioni: '340'
  }
]

// ── BARCHE ──
// MEDIO 5: Boat.stato è stato RIMOSSO. Lo stato si deriva da berths.stato
// del posto in cui si trova la barca (boat.posto). Vedi memoria MEDIO 5.
export const BARCHE_DEMO: Boat[] = [
  { id: 1, clientId: 1, nome: 'Chaya', matricola: 'IT-RM-2847', tipo: 'Motore', lunghezza: 12.5, larghezza: 4.2, pescaggio: 1.8, posto: 'A 5', bandiera: 'Italia' },
  { id: 2, clientId: 2, nome: 'S/V Tramontana', matricola: '247654321', tipo: 'Vela', lunghezza: 13.8, larghezza: 4.1, pescaggio: 1.9, posto: 'B 10', bandiera: 'Italia' },
  { id: 3, clientId: 3, nome: 'M/Y Neptune Dream', matricola: '123456789', tipo: 'Motore', lunghezza: 28, larghezza: 7.2, pescaggio: 2.1, posto: 'TW3', bandiera: 'Regno Unito' },
  { id: 4, clientId: 3, nome: 'Cat. Sole Mare', matricola: '247876543', tipo: 'Catamarano', lunghezza: 14.2, larghezza: 7.5, pescaggio: 1.1, bandiera: 'Francia' },
  { id: 5, clientId: 4, nome: 'M/Y Albatros', matricola: '247123456', tipo: 'Motore', lunghezza: 10.5, larghezza: 3.4, pescaggio: 1.2, posto: 'C 8', bandiera: 'Italia' },
  { id: 6, clientId: 5, nome: 'M/Y Perseo', matricola: '247667788', tipo: 'Motore', lunghezza: 11.5, larghezza: 3.8, pescaggio: 1.5, posto: 'D 12', bandiera: 'Italia' },
  { id: 7, clientId: 6, nome: 'S/V Mistral', matricola: 'IT-NA-1122', tipo: 'Vela', lunghezza: 11.0, larghezza: 3.6, pescaggio: 1.7, posto: 'D 7', bandiera: 'Italia' },
  { id: 8, clientId: 7, nome: 'M/Y Rex', matricola: '247881234', tipo: 'Motore', lunghezza: 9.5, larghezza: 3.2, pescaggio: 1.3, posto: 'G 8', bandiera: 'Italia' }
]

// ── POSTI BARCA (Berths) ──
export const POSTI_DEMO: Berth[] = [
  { id: 'A 5', pontile: 'Pontile Alfa', lato: 'Sinistro', lunMax: 15.5, larMax: 4.5, profondita: 3.5, categoria: 'Cat. IV', stato: 'occupato_socio', barcaOra: 'Chaya', socioId: 1 },
  { id: 'C 8', pontile: 'Pontile Delta', lato: 'Destro', lunMax: 9, larMax: 3.25, profondita: 2.5, categoria: 'Cat. II', stato: 'occupato_socio', barcaOra: 'M/Y Albatros', socioId: 4 },
  { id: 'D 12', pontile: 'Pontile Delta', lato: 'Sinistro', lunMax: 12, larMax: 4.0, profondita: 3.0, categoria: 'Cat. III', stato: 'in_cantiere', barcaOra: 'In cantiere (alaggio)', socioId: 5 },
  { id: 'D 7', pontile: 'Pontile Delta', lato: 'Destro', lunMax: 12, larMax: 4.0, profondita: 3.0, categoria: 'Cat. III', stato: 'occupato_affittuario', barcaOra: 'S/V Mistral', socioId: 6 },
  { id: 'G 8', pontile: 'Pontile Golf', lato: 'Sinistro', lunMax: 10, larMax: 3.5, profondita: 2.8, categoria: 'Cat. II', stato: 'socio_assente', barcaOra: undefined, socioId: 7 },
  { id: 'TW3', pontile: 'Transito West', lato: 'Destro', lunMax: 30, larMax: 8.0, profondita: 5.0, categoria: 'Cat. VII', stato: 'occupato_transito', barcaOra: 'M/Y Neptune Dream' },
  { id: 'B 10', pontile: 'Pontile Alfa', lato: 'Sinistro', lunMax: 15.5, larMax: 4.5, profondita: 3.5, categoria: 'Cat. IV', stato: 'occupato_transito', barcaOra: 'S/V Tramontana' },
  { id: 'D 24', pontile: 'Pontile Delta', lato: 'Destro', lunMax: 15.5, larMax: 4.5, profondita: 3.5, categoria: 'Cat. IV', stato: 'libero' }
]

// ── MOVIMENTI ──
export const MOVIMENTI_DEMO: Movement[] = [
  { id: 1, ora: '07:30', nome: 'M/Y Neptune Dream', matricola: '123456789', tipo: 'entrata', posto: 'TW3', scenario: 'transito', auth: true, pagamento: 'Pagato', note: 'Arrivo da Napoli', operatore: { nome: 'Mario Rossi', ruolo: 'Operatore Torre', iniziali: 'MR' } },
  { id: 2, ora: '08:15', nome: 'M/Y Rex', matricola: '247881234', tipo: 'uscita_temporanea', posto: 'G 8', scenario: 'socio', auth: true, pagamento: 'Titolo Attivo', note: 'Uscita temporanea per gita', operatore: { nome: 'Mario Rossi', ruolo: 'Operatore Torre', iniziali: 'MR' } },
  { id: 3, ora: '09:30', nome: 'S/V Libeccio', matricola: '247999222', tipo: 'spostamento', posto: 'D 16', scenario: 'transito', auth: true, origine: 'D 4', destinazione: 'D 16', pagamento: 'Pagato', note: 'Spostamento richiesto', operatore: { nome: 'Lara Conti', ruolo: 'Operatore Torre', iniziali: 'LC' } },
  { id: 4, ora: '09:51', nome: 'Chaya', matricola: 'IT-RM-2847', tipo: 'entrata', posto: 'A 5', scenario: 'socio', auth: true, pagamento: 'Titolo Attivo', note: 'Rientro al porto', operatore: { nome: 'Mario Rossi', ruolo: 'Operatore Torre', iniziali: 'MR' } },
  { id: 11, ora: '16:00', nome: 'M/Y Perseo', matricola: '247667788', tipo: 'cantiere', posto: 'D 12', scenario: 'socio', auth: true, origine: 'D 12', destinazione: 'Cantiere', pagamento: 'Titolo Attivo', note: 'Alaggio per manutenzione scafo', operatore: { nome: 'Giulia Marin', ruolo: 'Operatore Torre', iniziali: 'GM' } }
]

// ── TARIFFE ──
export const TARIFFE_DEMO: Tariff[] = [
  { categoria: 'Cat. I',    dimMax: 'fino a 9,0m',  lunMax: 9.0,   prezzoGiorno: 40,  ivaInclusa: true, acquaInclusa: true },
  { categoria: 'Cat. II',   dimMax: 'fino a 10,0m', lunMax: 10.0,  prezzoGiorno: 50,  ivaInclusa: true, acquaInclusa: true },
  { categoria: 'Cat. III',  dimMax: 'fino a 12,0m', lunMax: 12.0,  prezzoGiorno: 70,  ivaInclusa: true, acquaInclusa: true },
  { categoria: 'Cat. IV',   dimMax: 'fino a 15,5m', lunMax: 15.5,  prezzoGiorno: 90,  ivaInclusa: true, acquaInclusa: true },
  { categoria: 'Cat. V',    dimMax: 'fino a 18,0m', lunMax: 18.0,  prezzoGiorno: 160, ivaInclusa: true, acquaInclusa: true },
  { categoria: 'Cat. VI',   dimMax: 'fino a 22,0m', lunMax: 22.0,  prezzoGiorno: 220, ivaInclusa: true, acquaInclusa: true },
  { categoria: 'Cat. VII',  dimMax: 'fino a 30,0m', lunMax: 30.0,  prezzoGiorno: 320, ivaInclusa: true, acquaInclusa: true },
  { categoria: 'Cat. VIII', dimMax: 'fino a 40,0m', lunMax: 40.0,  prezzoGiorno: 450, ivaInclusa: true, acquaInclusa: true },
  { categoria: 'Cat. IX',   dimMax: 'oltre 40,0m',  lunMax: 9999,  prezzoGiorno: 600, ivaInclusa: true, acquaInclusa: true },
]

// ── RICEVUTE ──
export const RICEVUTE_DEMO: Receipt[] = [
  { numero: '2026/0041', data: '2026-04-20', nomeBarca: 'M/Y Neptune Dream', matricola: '123456789', posto: 'TW3', periodo: '17/04/2026 – 20/04/2026', giorni: 3, categoria: 'Cat. VII', tariffa: 320, extra: 0,  totale: 960,  metodo: 'pos',      operatore: 'Mario Rossi' },
  { numero: '2026/0042', data: '2026-04-21', nomeBarca: 'S/V Tramontana',    matricola: '247654321', posto: 'B 10', periodo: '18/04/2026 – 21/04/2026', giorni: 3, categoria: 'Cat. IV', tariffa: 90,  extra: 15, totale: 285,  metodo: 'contante', operatore: 'Lara Conti' },
  { numero: '2026/0043', data: '2026-04-22', nomeBarca: 'S/V Libeccio',      matricola: '247999222', posto: 'D 16',periodo: '20/04/2026 – 22/04/2026', giorni: 2, categoria: 'Cat. IV', tariffa: 90,  extra: 0,  totale: 180,  metodo: 'pos',      operatore: 'Mario Rossi' },
  { numero: '2026/0044', data: '2026-04-22', nomeBarca: 'M/Y Rex',           matricola: '247881234', posto: 'G 8', periodo: '21/04/2026 – 22/04/2026', giorni: 1, categoria: 'Cat. II', tariffa: 50,  extra: 0,  totale: 50,   metodo: 'contante', operatore: 'Giulia Marin' },
]

// ── MANUTENZIONI SUBACQUEE ──
export const MANUTENZIONI_DEMO: MaintenanceJob[] = [
  { id: 1, berthCodice: 'D 1', tipoLavoro: 'Sostituzione catenaria principale', descrizione: 'Catenaria corrosa, sostituzione urgente prima della stagione', urgenza: 'urgente', stato: 'dafare', origine: 'socio', clientId: 1, assegnatoA: 'Reparto subacquei', dataPrevista: '2026-04-23' },
  { id: 2, berthCodice: 'B 14', tipoLavoro: 'Controllo visivo corpo morto', descrizione: 'Ispezione periodica programmata corpo morto lato destro', urgenza: 'normale', stato: 'incorso', origine: 'torre', assegnatoA: 'Reparto subacquei', dataPrevista: '2026-04-22' },
  { id: 3, berthCodice: 'D 8', tipoLavoro: 'Rimozione cima attorcigliata elica', descrizione: 'Cima intrappolata nell\'elica del posto E 8, barca impossibilitata a uscire', urgenza: 'urgente', stato: 'incorso', origine: 'socio', clientId: 5, assegnatoA: 'Reparto subacquei', dataPrevista: '2026-04-22' },
  { id: 4, berthCodice: 'D 12', tipoLavoro: 'Ispezione fondale post-tempesta', descrizione: 'Dopo la mareggiata del 18/04, verificare integrità ancoraggi Pontile Delta', urgenza: 'programmato', stato: 'dafare', origine: 'direzione', assegnatoA: 'Reparto subacquei', dataPrevista: '2026-04-25' },
  { id: 5, berthCodice: 'G 8', tipoLavoro: 'Sostituzione bitta di ormeggio', descrizione: 'Bitta lato sinistro danneggiata da urto, necessaria sostituzione completa', urgenza: 'normale', stato: 'completato', origine: 'torre', assegnatoA: 'Reparto subacquei', completatoDa: 'Marco Redi', completatoOre: '14:30', dataPrevista: '2026-04-20' },
  { id: 6, berthCodice: 'TW 3', tipoLavoro: 'Pulizia fondale da detriti', descrizione: 'Accumulo detriti sul fondale zona transito west', urgenza: 'programmato', stato: 'dafare', origine: 'torre', assegnatoA: 'Reparto subacquei', dataPrevista: '2026-04-28' }
]

// ── SEGNALAZIONI PORTO ──
export const SEGNALAZIONI_DEMO: Report[] = [
  { id: 1, zona: 'Pontile B — lato destro', tipoProblema: 'Illuminazione pontile', descrizione: 'Tre lampioni spenti nel tratto tra B10 e B18', urgenza: 'urgente', stato: 'dafare', canale: 'di_persona', assegnatoA: 'manutenzione', origine: 'torre', dataSegnalazione: '2026-04-22' },
  { id: 2, zona: 'Pontile Echo — radice', tipoProblema: 'Impianto elettrico', descrizione: 'Colonnina elettrica posti E1-E4 non eroga corrente', urgenza: 'urgente', stato: 'incorso', canale: 'telefono', clientId: 5, assegnatoA: 'manutenzione', origine: 'torre', dataSegnalazione: '2026-04-21' },
  { id: 3, zona: 'Pontile Delta — radice', tipoProblema: 'Banchina/pavimentazione', descrizione: 'Tavola di legno del camminamento rotta, rischio inciampo', urgenza: 'normale', stato: 'dafare', canale: 'ispezione', assegnatoA: 'esterno', origine: 'direzione', dataSegnalazione: '2026-04-20' },
  { id: 4, zona: 'Darsena — briccola 12', tipoProblema: 'Ormeggio', descrizione: 'Briccola allentata, oscillazione eccessiva con moto ondoso', urgenza: 'urgente', stato: 'completato', canale: 'email', assegnatoA: 'subacquei', origine: 'direzione', dataSegnalazione: '2026-04-18' },
  { id: 5, zona: 'Pontile Delta — testata', tipoProblema: 'Illuminazione pontile', descrizione: 'Faro di testata pontile intermittente', urgenza: 'normale', stato: 'dafare', canale: 'di_persona', assegnatoA: 'manutenzione', origine: 'torre', dataSegnalazione: '2026-04-22' }
]


// -- ARRIVI PREVISTI --
export const ARRIVI_DEMO: Arrival[] = [
  { id: 1, nomeBarca: 'S/V Vento', matricola: 'NL-4521-T', bandiera: 'Paesi Bassi', tipo: 'vela', lunghezza: 13.5, pescaggio: 2.0, postoIndicato: 'G 12', dataPrevista: '2026-04-22', oraPrevista: '14:30', stato: 'oggi', note: 'Arrivo da Barcellona, 2 persone a bordo', inseritoDa: 'Mario Rossi', createdAt: '2026-04-21' },
  { id: 2, nomeBarca: 'M/Y Azzurra II', matricola: 'IT-GE-0892', bandiera: 'Italia', tipo: 'motore', lunghezza: 18.2, pescaggio: 1.8, postoIndicato: 'TW 2', dataPrevista: '2026-04-22', oraPrevista: '17:00', stato: 'oggi', note: 'Cliente abituale, chiede posto frontale', inseritoDa: 'Lara Conti', createdAt: '2026-04-20' },
  { id: 3, nomeBarca: 'Cat. Levante', matricola: 'FR-8812-C', bandiera: 'Francia', tipo: 'catamarano', lunghezza: 14.8, pescaggio: 1.2, postoIndicato: 'C 20', dataPrevista: '2026-04-23', oraPrevista: '10:00', stato: 'atteso', inseritoDa: 'Mario Rossi', createdAt: '2026-04-22' },
  { id: 4, nomeBarca: 'M/Y Poseidon', matricola: 'GR-2201-M', bandiera: 'Grecia', tipo: 'motore', lunghezza: 22.0, pescaggio: 2.5, postoIndicato: 'TW 4', dataPrevista: '2026-04-24', oraPrevista: '09:00', stato: 'atteso', note: 'Richiede allaccio corrente 380V', inseritoDa: 'Giulia Marin', createdAt: '2026-04-22' },
  { id: 5, nomeBarca: 'S/V Nordic Star', matricola: 'SE-1100-V', bandiera: 'Svezia', tipo: 'vela', lunghezza: 11.5, pescaggio: 1.8, postoIndicato: 'B 22', dataPrevista: '2026-04-21', oraPrevista: '16:00', stato: 'in_ritardo', note: 'Non ancora arrivata, non risponde al VHF', inseritoDa: 'Mario Rossi', createdAt: '2026-04-20' },
  { id: 6, nomeBarca: 'M/Y Dolce Vita', matricola: 'IT-NA-3344', bandiera: 'Italia', tipo: 'motore', lunghezza: 9.8, pescaggio: 1.1, postoIndicato: 'B 16', dataPrevista: '2026-04-20', stato: 'arrivato', inseritoDa: 'Lara Conti', createdAt: '2026-04-19' },
]

// -- TITOLI DI POSSESSO (M-07) --
export const TITOLI_POSSESSO_DEMO: OwnershipTitle[] = [
  { id: 1, clientId: 1, berthId: 'A 5', numero: 'PTRT-2015-0102', dataAcquisizione: '2015-04-10', azioni: 620, catAzioni: 'A', canone: 'Regolare', scadenzaCanone: '2027-01-31' },
  { id: 2, clientId: 5, berthId: 'D 12', numero: 'PTRT-2018-0554', dataAcquisizione: '2018-09-22', azioni: 480, catAzioni: 'B', canone: 'Scaduto', scadenzaCanone: '2026-01-31' },
  { id: 3, clientId: 4, berthId: 'C 8', numero: 'PTRT-2020-0891', dataAcquisizione: '2020-02-15', azioni: 310, catAzioni: 'B', canone: 'Regolare', scadenzaCanone: '2027-01-31' }
]

// -- AUTORIZZAZIONI (M-07) --
export const AUTORIZZAZIONI_DEMO: Authorization[] = [
  { id: 1, socioId: 6, berthId: 'D 7', tipo: 'affitto', beneficiario: 'Luigi Verdi (PF)', barca: 'S/V Mistral', matricola: 'IT-NA-1122', tel: '+39 340 1234567', dal: '2026-04-01', al: '2026-09-30', giorniResidui: 161, stato: 'attiva', authDa: 'Direzione' },
  { id: 2, socioId: 5, berthId: 'D 12', tipo: 'ospite', beneficiario: 'Giacomo Neri', barca: 'M/Y Relax', matricola: 'FR-9988-C', tel: '+39 333 9876543', dal: '2026-04-20', al: '2026-04-25', giorniResidui: 3, stato: 'attiva', note: 'Ospite gratuito confermato', authDa: 'Torre' },
  { id: 3, socioId: 4, berthId: 'C 8', tipo: 'amico', beneficiario: 'Elena Bianchi', barca: 'S/V Vento', matricola: 'NL-4521-T', tel: '+39 320 1122334', dal: '2026-03-01', al: '2026-03-15', giorniResidui: 0, stato: 'scaduta', authDa: 'Direzione' }
]

// -- UTENTI DI SISTEMA (M-12) --
export const UTENTI_SISTEMA_DEMO: SystemUser[] = [
  { id: 1, nome: 'Giuseppe Direttore', email: 'direzione@marinatraiano.it', ruolo: 'direzione', stato: 'attivo', ultimoAccesso: '2026-04-22 08:15' },
  { id: 2, nome: 'Marta Contabile', email: 'amministrazione@marinatraiano.it', ruolo: 'direzione', stato: 'attivo', ultimoAccesso: '2026-04-22 09:30' },
  { id: 3, nome: 'Luigi Torre', email: 'torre1@marinatraiano.it', ruolo: 'torre', stato: 'attivo', ultimoAccesso: '2026-04-22 14:00' },
  { id: 4, nome: 'Marco Nocchiero', email: 'ormeggiatori@marinatraiano.it', ruolo: 'ormeggiatore', stato: 'attivo', ultimoAccesso: '2026-04-22 07:45' },
  { id: 5, nome: 'Anna Stagionale', email: 'anna.s@marinatraiano.it', ruolo: 'torre', stato: 'disattivo', ultimoAccesso: '2025-09-30 18:00' }
]

// -- NOTIFICHE (M-05) --
export const NOTIFICHE_DEMO: SystemAlert[] = [
  { id: 1, titolo: 'Canone Socio Scaduto', descrizione: 'Il canone del socio Ferretti (Posto A 5) \u00e8 scaduto il mese scorso.', urgenza: 'alta', categoria: 'amministrazione', data: '2026-04-22 09:15', stato: 'nuova' },
  { id: 2, titolo: 'Ritardo Arrivo Previsto', descrizione: 'S/V Nordic Star (Prenotato per le 16:00 del 21/04) non \u00e8 ancora arrivata.', urgenza: 'media', categoria: 'operativo', data: '2026-04-22 10:30', stato: 'nuova' },
  { id: 3, titolo: 'Guasto Elettrico C 4', descrizione: 'Segnalato calo di tensione alla colonnina del posto C 4.', urgenza: 'alta', categoria: 'operativo', data: '2026-04-22 11:45', stato: 'nuova' },
  { id: 4, titolo: 'Backup di Sistema', descrizione: 'Il backup settimanale \u00e8 stato completato con successo.', urgenza: 'bassa', categoria: 'sistema', data: '2026-04-21 23:00', stato: 'letta' },
  { id: 5, titolo: 'Ospite in Arrivo', descrizione: 'Giacomo Neri \u00e8 autorizzato sul posto D 12 da oggi.', urgenza: 'bassa', categoria: 'operativo', data: '2026-04-20 08:00', stato: 'risolta' }
]




