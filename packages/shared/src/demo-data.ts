import { Client, Boat, Berth, Movement, Tariff, MaintenanceJob, Report, Receipt, Arrival, OwnershipTitle, Authorization, SystemUser, UserRole, SystemAlert, Stay, CantiereSession } from './types'

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
    posto: 'C 25', pontile: 'Pontile Charlie', catPosto: 'Cat. III', dimMax: 'max 12m × 4,0m', azioni: '340'
  },

  // ── SOCI FRANGIFLUTTI (id 8-24, 25 Apr 2026) ──
  // 17 soci uno per ogni posto FF (FF100-FF113 + FF1-FF3).
  // 15 hanno una barca ormeggiata (vedi BARCHE_DEMO id 9-23).
  // 2 soci NON hanno barca (FF103 e FF110 → stato socio_assente_lungo) per
  // testare spostamenti e arrivi affittuario su posti liberi-ma-titolati.
  // Vedi memoria: ff_test_setup.md

  // Frangiflutti Nord (FF100-FF113) — yacht grandi
  { id: 8,  tipo: 'so', nome: 'Roberto Marchetti', iniziali: 'RM', naz: 'Italiana', cf: 'MRCRRT60H10H501A',
    tel: '+39 335 1100201', email: 'r.marchetti@email.it', indirizzo: 'Via Veneto 15, Roma',
    docTipo: 'Carta d\'identità', docNum: 'GH1100201',
    posto: 'FF100', pontile: 'Frangiflutti Nord', catPosto: 'Cat. VII', dimMax: 'max 30m × 8,0m', azioni: '950' },

  { id: 9,  tipo: 'so', nome: 'Elena Vitali', iniziali: 'EV', naz: 'Italiana', cf: 'VTLLNE72L55H501B',
    tel: '+39 333 1100202', email: 'e.vitali@studio.it', indirizzo: 'Via Salaria 88, Roma',
    docTipo: 'Carta d\'identità', docNum: 'GH1100202',
    posto: 'FF101', pontile: 'Frangiflutti Nord', catPosto: 'Cat. VI', dimMax: 'max 22m × 6,5m', azioni: '780' },

  { id: 10, tipo: 'so', nome: 'Davide Russo', iniziali: 'DR', naz: 'Italiana', cf: 'RSSDVD68P15H501C',
    tel: '+39 347 1100203', email: 'd.russo@yacht.it', indirizzo: 'Lungomare 12, Anzio',
    docTipo: 'Passaporto', docNum: 'YD1100203',
    posto: 'FF102', pontile: 'Frangiflutti Nord', catPosto: 'Cat. V', dimMax: 'max 18m × 5,0m', azioni: '650' },

  { id: 11, tipo: 'so', nome: 'Carla Bruno', iniziali: 'CB', naz: 'Italiana', cf: 'BRNCRL75D55F839D',
    tel: '+39 320 1100204', email: 'carla.bruno@email.com', indirizzo: 'Via dei Bagni 4, Civitavecchia',
    docTipo: 'Carta d\'identità', docNum: 'GH1100204',
    posto: 'FF103', pontile: 'Frangiflutti Nord', catPosto: 'Cat. V', dimMax: 'max 18m × 5,0m', azioni: '650' },

  { id: 12, tipo: 'so', nome: 'Maurizio De Santis', iniziali: 'MD', naz: 'Italiana', cf: 'DSNMRZ58S20H501E',
    tel: '+39 338 1100205', email: 'm.desantis@studio.it', indirizzo: 'Piazza Navona 7, Roma',
    docTipo: 'Carta d\'identità', docNum: 'GH1100205',
    posto: 'FF104', pontile: 'Frangiflutti Nord', catPosto: 'Cat. VII', dimMax: 'max 30m × 8,0m', azioni: '950' },

  { id: 13, tipo: 'az', nome: 'Mediterranea Yachts SRL', iniziali: 'MY', naz: 'Italiana', piva: 'IT07712340567',
    ragione: 'Mediterranea Yachts SRL', sede: 'Via del Porto 22, Civitavecchia', tel: '+39 0766 552201', email: 'info@medyachts.it',
    posto: 'FF105', pontile: 'Frangiflutti Nord', catPosto: 'Cat. VI', dimMax: 'max 22m × 6,5m', azioni: '780',
    referenti: [ { nome: 'Giorgio Pellegrini', ruolo: 'Amministratore', tel: '+39 347 1100206' } ] },

  { id: 14, tipo: 'so', nome: 'Pietro Galli', iniziali: 'PG', naz: 'Italiana', cf: 'GLLPTR65T28F839F',
    tel: '+39 329 1100207', email: 'p.galli@email.it', indirizzo: 'Via Roma 88, Civitavecchia',
    docTipo: 'Carta d\'identità', docNum: 'GH1100207',
    posto: 'FF106', pontile: 'Frangiflutti Nord', catPosto: 'Cat. V', dimMax: 'max 18m × 5,0m', azioni: '650' },

  { id: 15, tipo: 'so', nome: 'Sofia Romano', iniziali: 'SR', naz: 'Italiana', cf: 'RMNSFO80M55H501G',
    tel: '+39 348 1100208', email: 's.romano@studio.it', indirizzo: 'Via Cola di Rienzo 33, Roma',
    docTipo: 'Passaporto', docNum: 'YD1100208',
    posto: 'FF107', pontile: 'Frangiflutti Nord', catPosto: 'Cat. VII', dimMax: 'max 30m × 8,0m', azioni: '950' },

  { id: 16, tipo: 'so', nome: 'Alessandro Costa', iniziali: 'AC', naz: 'Italiana', cf: 'CSTLSN70R10H501H',
    tel: '+39 333 1100209', email: 'a.costa@email.com', indirizzo: 'Via Tuscolana 250, Roma',
    docTipo: 'Carta d\'identità', docNum: 'GH1100209',
    posto: 'FF108', pontile: 'Frangiflutti Nord', catPosto: 'Cat. VI', dimMax: 'max 22m × 6,5m', azioni: '780' },

  { id: 17, tipo: 'so', nome: 'Margherita Esposito', iniziali: 'ME', naz: 'Italiana', cf: 'SPSMGH78A65F839I',
    tel: '+39 339 1100210', email: 'm.esposito@email.it', indirizzo: 'Via Montegrappa 3, Civitavecchia',
    docTipo: 'Carta d\'identità', docNum: 'GH1100210',
    posto: 'FF109', pontile: 'Frangiflutti Nord', catPosto: 'Cat. V', dimMax: 'max 18m × 5,0m', azioni: '650' },

  { id: 18, tipo: 'so', nome: 'Tommaso Ricci', iniziali: 'TR', naz: 'Italiana', cf: 'RCCTMS62E15H501J',
    tel: '+39 335 1100211', email: 't.ricci@yacht.it', indirizzo: 'Lungomare 22, Ostia',
    docTipo: 'Passaporto', docNum: 'YD1100211',
    posto: 'FF110', pontile: 'Frangiflutti Nord', catPosto: 'Cat. VII', dimMax: 'max 30m × 8,0m', azioni: '950' },

  { id: 19, tipo: 'so', nome: 'Valentina Lombardi', iniziali: 'VL', naz: 'Italiana', cf: 'LMBVNT85B55H501K',
    tel: '+39 320 1100212', email: 'v.lombardi@email.com', indirizzo: 'Via Nomentana 145, Roma',
    docTipo: 'Carta d\'identità', docNum: 'GH1100212',
    posto: 'FF111', pontile: 'Frangiflutti Nord', catPosto: 'Cat. VI', dimMax: 'max 22m × 6,5m', azioni: '780' },

  { id: 20, tipo: 'so', nome: 'Federico Greco', iniziali: 'FG', naz: 'Italiana', cf: 'GRCFRC72H10F839L',
    tel: '+39 347 1100213', email: 'f.greco@studio.it', indirizzo: 'Via Aurelia 220, Civitavecchia',
    docTipo: 'Carta d\'identità', docNum: 'GH1100213',
    posto: 'FF112', pontile: 'Frangiflutti Nord', catPosto: 'Cat. V', dimMax: 'max 18m × 5,0m', azioni: '650' },

  { id: 21, tipo: 'so', nome: 'Beatrice Marini', iniziali: 'BM', naz: 'Italiana', cf: 'MRNBRC80T65H501M',
    tel: '+39 338 1100214', email: 'b.marini@email.it', indirizzo: 'Via Trastevere 18, Roma',
    docTipo: 'Carta d\'identità', docNum: 'GH1100214',
    posto: 'FF113', pontile: 'Frangiflutti Nord', catPosto: 'Cat. VII', dimMax: 'max 30m × 8,0m', azioni: '950' },

  // Frangiflutti Sud (FF1-FF3) — tender e gommoni
  { id: 22, tipo: 'so', nome: 'Andrea Pellegrini', iniziali: 'AP', naz: 'Italiana', cf: 'PLLNDR74F20F839N',
    tel: '+39 329 1100215', email: 'a.pellegrini@email.com', indirizzo: 'Via dei Bastioni 8, Civitavecchia',
    docTipo: 'Carta d\'identità', docNum: 'GH1100215',
    posto: 'FF1', pontile: 'Frangiflutti Sud', catPosto: 'Cat. I', dimMax: 'max 7m × 2,8m', azioni: '180' },

  { id: 23, tipo: 'so', nome: 'Chiara Moretti', iniziali: 'CM', naz: 'Italiana', cf: 'MRTCHR82C45H501O',
    tel: '+39 348 1100216', email: 'c.moretti@email.it', indirizzo: 'Via Appia 60, Roma',
    docTipo: 'Carta d\'identità', docNum: 'GH1100216',
    posto: 'FF2', pontile: 'Frangiflutti Sud', catPosto: 'Cat. I', dimMax: 'max 7m × 2,8m', azioni: '180' },

  { id: 24, tipo: 'so', nome: 'Stefano Caputo', iniziali: 'SC', naz: 'Italiana', cf: 'CPTSFN66A10H501P',
    tel: '+39 333 1100217', email: 's.caputo@email.com', indirizzo: 'Via Flaminia 90, Roma',
    docTipo: 'Carta d\'identità', docNum: 'GH1100217',
    posto: 'FF3', pontile: 'Frangiflutti Sud', catPosto: 'Cat. I', dimMax: 'max 7m × 2,8m', azioni: '180' }
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
  { id: 8, clientId: 7, nome: 'M/Y Rex', matricola: '247881234', tipo: 'Motore', lunghezza: 9.5, larghezza: 3.2, pescaggio: 1.3, posto: 'C 25', bandiera: 'Italia' },

  // ── BARCHE FRANGIFLUTTI (id 9-23, 25 Apr 2026) ──
  // 15 barche su 17 posti FF. Mancano FF103 (id 11 Carla Bruno) e FF110
  // (id 18 Tommaso Ricci) → quei 2 soci sono "assenti_lungo", posto vuoto
  // disponibile per test di spostamento e accoglienza affittuario.
  // Lunghezze sotto al lunMax del posto per coerenza.

  // Frangiflutti Nord
  { id: 9,  clientId: 8,  nome: 'M/Y Atlantica',     matricola: 'IT-RM-3001', tipo: 'Motore',     lunghezza: 28.0, larghezza: 7.5, pescaggio: 2.4, posto: 'FF100', bandiera: 'Italia' },
  { id: 10, clientId: 9,  nome: 'M/Y Sirena',        matricola: 'IT-RM-3002', tipo: 'Motore',     lunghezza: 21.0, larghezza: 6.0, pescaggio: 2.0, posto: 'FF101', bandiera: 'Italia' },
  { id: 11, clientId: 10, nome: 'S/V Borealis',      matricola: 'IT-RM-3003', tipo: 'Vela',       lunghezza: 17.5, larghezza: 4.8, pescaggio: 2.2, posto: 'FF102', bandiera: 'Italia' },
  // FF103 vuoto — Carla Bruno assente lungo
  { id: 12, clientId: 12, nome: 'M/Y Andromeda',     matricola: 'IT-RM-3005', tipo: 'Motore',     lunghezza: 29.0, larghezza: 7.8, pescaggio: 2.5, posto: 'FF104', bandiera: 'Italia' },
  { id: 13, clientId: 13, nome: 'M/Y Mediterranea I',matricola: 'IT-RM-3006', tipo: 'Motore',     lunghezza: 21.5, larghezza: 6.2, pescaggio: 2.0, posto: 'FF105', bandiera: 'Italia' },
  { id: 14, clientId: 14, nome: 'S/V Maestrale',     matricola: 'IT-RM-3007', tipo: 'Vela',       lunghezza: 17.8, larghezza: 4.9, pescaggio: 2.3, posto: 'FF106', bandiera: 'Italia' },
  { id: 15, clientId: 15, nome: 'M/Y Stella di Mare',matricola: 'IT-RM-3008', tipo: 'Motore',     lunghezza: 28.5, larghezza: 7.6, pescaggio: 2.4, posto: 'FF107', bandiera: 'Italia' },
  { id: 16, clientId: 16, nome: 'M/Y Costa Azzurra', matricola: 'IT-RM-3009', tipo: 'Motore',     lunghezza: 21.0, larghezza: 6.1, pescaggio: 2.0, posto: 'FF108', bandiera: 'Italia' },
  { id: 17, clientId: 17, nome: 'Cat. Onda Blu',     matricola: 'IT-RM-3010', tipo: 'Catamarano', lunghezza: 17.0, larghezza: 8.5, pescaggio: 1.4, posto: 'FF109', bandiera: 'Italia' },
  // FF110 vuoto — Tommaso Ricci assente lungo
  { id: 18, clientId: 19, nome: 'M/Y Levante',       matricola: 'IT-RM-3012', tipo: 'Motore',     lunghezza: 21.5, larghezza: 6.3, pescaggio: 2.1, posto: 'FF111', bandiera: 'Italia' },
  { id: 19, clientId: 20, nome: 'S/V Scirocco',      matricola: 'IT-RM-3013', tipo: 'Vela',       lunghezza: 17.5, larghezza: 4.8, pescaggio: 2.2, posto: 'FF112', bandiera: 'Italia' },
  { id: 20, clientId: 21, nome: 'M/Y Cassiopea',     matricola: 'IT-RM-3014', tipo: 'Motore',     lunghezza: 29.0, larghezza: 7.8, pescaggio: 2.5, posto: 'FF113', bandiera: 'Italia' },

  // Frangiflutti Sud
  { id: 21, clientId: 22, nome: 'Tender Oasi',       matricola: 'IT-RM-3015', tipo: 'Gommone',    lunghezza: 6.5,  larghezza: 2.6, pescaggio: 0.6, posto: 'FF1',   bandiera: 'Italia' },
  { id: 22, clientId: 23, nome: 'Tender Lampo',      matricola: 'IT-RM-3016', tipo: 'Gommone',    lunghezza: 6.0,  larghezza: 2.4, pescaggio: 0.5, posto: 'FF2',   bandiera: 'Italia' },
  { id: 23, clientId: 24, nome: 'Tender Stella',     matricola: 'IT-RM-3017', tipo: 'Gommone',    lunghezza: 6.8,  larghezza: 2.7, pescaggio: 0.6, posto: 'FF3',   bandiera: 'Italia' }
]

// ── POSTI BARCA (Berths) ──
// Fonte: ispezione SVG `apps/web/src/assets/mappaPtrt.svg` → 149 posti reali.
// Pontili disegnati come interattivi: A (26), B (36), C (28), D (32),
// Frangiflutti FF100-FF113 (14), FF1-FF3 (3), Torre TW1-TW10 (10).
// Lunghezze assegnate in modo plausibile e COERENTE con TARIFFE_DEMO (Cat. I-IX).
// I pontili NATO (eco, foxtrot, golf, hotel, ...) esistono come rettangoli
// strutturali nel SVG ma non hanno posti interattivi → NON popolati qui.

// Helper: genera un array di posti con pattern ricorrente.
// Gli ID nell'SVG sono "B_1","D_12","TW3","FF100". Il componente MarinaMap
// ha già fallback che riconosce anche "B 1" / "B_1" / "B1". Per coerenza
// interna usiamo il formato "X N" con spazio (come Berth.id nelle autorizzazioni).
function genBerths(
  prefix: string,
  pontileNome: string,
  count: number,
  template: (i: number) => Omit<Berth, 'id' | 'pontile'>,
  options?: { idStyle?: 'space' | 'compact'; startIndex?: number }
): Berth[] {
  const idStyle = options?.idStyle ?? 'space'
  const start = options?.startIndex ?? 1
  const out: Berth[] = []
  for (let n = 0; n < count; n++) {
    const i = start + n
    const id = idStyle === 'space' ? `${prefix} ${i}` : `${prefix}${i}`
    out.push({ id, pontile: pontileNome, ...template(n) })
  }
  return out
}

// Posti manualmente "occupati" per conservare i link con barche/clienti demo.
// Gli altri saranno tutti 'libero' (stato di partenza realistico).
const POSTI_OCCUPATI_OVERRIDE: Record<string, Partial<Berth>> = {
  'A 5':  { stato: 'occupato_socio',        barcaOra: 'Chaya',             socioId: 1 },
  'B 10': { stato: 'occupato_transito',     barcaOra: 'S/V Tramontana' },
  'C 8':  { stato: 'occupato_socio',        barcaOra: 'M/Y Albatros',      socioId: 4 },
  'D 7':  { stato: 'occupato_affittuario',  barcaOra: 'S/V Mistral',       socioId: 6 },
  'D 12': { stato: 'in_cantiere',           barcaOra: 'In cantiere (alaggio)', socioId: 5 },
  'TW3':  { stato: 'occupato_transito',     barcaOra: 'M/Y Neptune Dream' },
  'C 25': { stato: 'socio_assente',         barcaOra: undefined,           socioId: 7 },

  // ── FRANGIFLUTTI (25 Apr 2026, setup test) ──
  // 17 posti FF tutti assegnati a soci. 15 con barca presente, 2 vuoti
  // (FF103, FF110) → stato socio_assente_lungo: il posto è titolato a un
  // socio ma è fisicamente disponibile, ottimo per testare:
  //   1. Spostamento di una barca da altro posto verso FF103/FF110.
  //   2. Accoglienza di un nuovo affittuario su posto socio (richiede
  //      l'autorizzazione formale del proprietario).
  'FF100': { stato: 'occupato_socio',        barcaOra: 'M/Y Atlantica',     socioId: 8  },
  'FF101': { stato: 'occupato_socio',        barcaOra: 'M/Y Sirena',        socioId: 9  },
  'FF102': { stato: 'occupato_socio',        barcaOra: 'S/V Borealis',      socioId: 10 },
  'FF103': { stato: 'socio_assente_lungo',   barcaOra: undefined,           socioId: 11 },
  'FF104': { stato: 'occupato_socio',        barcaOra: 'M/Y Andromeda',     socioId: 12 },
  'FF105': { stato: 'occupato_socio',        barcaOra: 'M/Y Mediterranea I',socioId: 13 },
  'FF106': { stato: 'occupato_socio',        barcaOra: 'S/V Maestrale',     socioId: 14 },
  'FF107': { stato: 'occupato_socio',        barcaOra: 'M/Y Stella di Mare',socioId: 15 },
  'FF108': { stato: 'occupato_socio',        barcaOra: 'M/Y Costa Azzurra', socioId: 16 },
  'FF109': { stato: 'occupato_socio',        barcaOra: 'Cat. Onda Blu',     socioId: 17 },
  'FF110': { stato: 'socio_assente_lungo',   barcaOra: undefined,           socioId: 18 },
  'FF111': { stato: 'occupato_socio',        barcaOra: 'M/Y Levante',       socioId: 19 },
  'FF112': { stato: 'occupato_socio',        barcaOra: 'S/V Scirocco',      socioId: 20 },
  'FF113': { stato: 'occupato_socio',        barcaOra: 'M/Y Cassiopea',     socioId: 21 },
  'FF1':   { stato: 'occupato_socio',        barcaOra: 'Tender Oasi',       socioId: 22 },
  'FF2':   { stato: 'occupato_socio',        barcaOra: 'Tender Lampo',      socioId: 23 },
  'FF3':   { stato: 'occupato_socio',        barcaOra: 'Tender Stella',     socioId: 24 },
}

function applyOverride(b: Berth): Berth {
  const ov = POSTI_OCCUPATI_OVERRIDE[b.id]
  return ov ? { ...b, ...ov } : b
}

// Pontile B (36 posti) — lunghezze 11-16m miste, Cat. III/IV
const POSTI_B: Berth[] = genBerths('B', 'Pontile Bravo', 36, (n) => {
  // Cicla Cat.III (12m) / Cat.IV (15.5m) per varietà
  const cat4 = n % 3 === 0
  return {
    lunMax: cat4 ? 15.5 : 12.0,
    larMax: cat4 ? 4.5 : 4.0,
    profondita: cat4 ? 3.5 : 3.0,
    categoria: cat4 ? 'Cat. IV' : 'Cat. III',
    stato: 'libero',
    agibile: true,
  }
})

// Pontile A (26 posti) — lunghezze miste 10-15.5m, Cat. II/III/IV
const POSTI_A: Berth[] = genBerths('A', 'Pontile Alfa', 26, (n) => {
  const mod = n % 3
  const cat = mod === 0 ? 'Cat. IV' : mod === 1 ? 'Cat. III' : 'Cat. II'
  const lun = mod === 0 ? 15.5 : mod === 1 ? 12.0 : 10.0
  const lar = mod === 0 ? 4.5  : mod === 1 ? 4.0  : 3.5
  const pro = mod === 0 ? 3.5  : mod === 1 ? 3.0  : 2.8
  return { lunMax: lun, larMax: lar, profondita: pro, categoria: cat, stato: 'libero', agibile: true }
})

// Pontile C (28 posti) — pontile più piccolo, 8-12m, Cat. I/II/III
const POSTI_C: Berth[] = genBerths('C', 'Pontile Charlie', 28, (n) => {
  const mod = n % 3
  const cat = mod === 0 ? 'Cat. III' : mod === 1 ? 'Cat. II' : 'Cat. I'
  const lun = mod === 0 ? 12.0 : mod === 1 ? 10.0 : 9.0
  const lar = mod === 0 ? 4.0  : mod === 1 ? 3.5  : 3.25
  const pro = mod === 0 ? 3.0  : mod === 1 ? 2.8  : 2.5
  return { lunMax: lun, larMax: lar, profondita: pro, categoria: cat, stato: 'libero', agibile: true }
})

// Pontile D (32 posti) — pontile grande, 12-18m, Cat. III/IV/V
const POSTI_D: Berth[] = genBerths('D', 'Pontile Delta', 32, (n) => {
  const mod = n % 3
  const cat = mod === 0 ? 'Cat. V' : mod === 1 ? 'Cat. IV' : 'Cat. III'
  const lun = mod === 0 ? 18.0 : mod === 1 ? 15.5 : 12.0
  const lar = mod === 0 ? 5.0  : mod === 1 ? 4.5  : 4.0
  const pro = mod === 0 ? 4.0  : mod === 1 ? 3.5  : 3.0
  return { lunMax: lun, larMax: lar, profondita: pro, categoria: cat, stato: 'libero', agibile: true }
})

// Frangiflutti nord FF100-FF113 (14 posti) — transiti grandi 18-30m, Cat. V/VI/VII
const POSTI_FF_NORD: Berth[] = genBerths('FF', 'Frangiflutti Nord', 14, (n) => {
  const mod = n % 3
  const cat = mod === 0 ? 'Cat. VII' : mod === 1 ? 'Cat. VI' : 'Cat. V'
  const lun = mod === 0 ? 30.0 : mod === 1 ? 22.0 : 18.0
  const lar = mod === 0 ? 8.0  : mod === 1 ? 6.5  : 5.0
  const pro = mod === 0 ? 5.0  : mod === 1 ? 4.5  : 4.0
  return { lunMax: lun, larMax: lar, profondita: pro, categoria: cat, stato: 'libero', agibile: true }
}, { idStyle: 'compact', startIndex: 100 })

// Frangiflutti sud FF1-FF3 (3 posti) — piccoli, Cat. I (tender, gommoni)
const POSTI_FF_SUD: Berth[] = genBerths('FF', 'Frangiflutti Sud', 3, (_) => ({
  lunMax: 7.0,
  larMax: 2.8,
  profondita: 1.8,
  categoria: 'Cat. I',
  stato: 'libero',
  agibile: true,
}), { idStyle: 'compact', startIndex: 1 })

// Torre (TW1-TW10) — posti frontali per transiti grandi/yacht 20-40m
const POSTI_TW: Berth[] = genBerths('TW', 'Torre / Transito', 10, (n) => {
  const mod = n % 3
  const cat = mod === 0 ? 'Cat. VIII' : mod === 1 ? 'Cat. VII' : 'Cat. VI'
  const lun = mod === 0 ? 40.0 : mod === 1 ? 30.0 : 22.0
  const lar = mod === 0 ? 9.0  : mod === 1 ? 8.0  : 6.5
  const pro = mod === 0 ? 6.0  : mod === 1 ? 5.0  : 4.5
  return { lunMax: lun, larMax: lar, profondita: pro, categoria: cat, stato: 'libero', agibile: true }
}, { idStyle: 'compact', startIndex: 1 })

export const POSTI_DEMO: Berth[] = [
  ...POSTI_A,
  ...POSTI_B,
  ...POSTI_C,
  ...POSTI_D,
  ...POSTI_FF_NORD,
  ...POSTI_FF_SUD,
  ...POSTI_TW,
].map(applyOverride)

// ── MOVIMENTI ──
export const MOVIMENTI_DEMO: Movement[] = [
  { id: 1, ora: '07:30', nome: 'M/Y Neptune Dream', matricola: '123456789', tipo: 'entrata', posto: 'TW3', scenario: 'transito', auth: true, pagamento: 'Pagato', note: 'Arrivo da Napoli', operatore: { nome: 'Mario Rossi', ruolo: 'Operatore Torre', iniziali: 'MR' } },
  { id: 2, ora: '08:15', nome: 'M/Y Rex', matricola: '247881234', tipo: 'uscita_temporanea', posto: 'C 25', scenario: 'socio', auth: true, pagamento: 'Titolo Attivo', note: 'Uscita temporanea per gita', operatore: { nome: 'Mario Rossi', ruolo: 'Operatore Torre', iniziali: 'MR' } },
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
  { numero: '2026/0044', data: '2026-04-22', nomeBarca: 'M/Y Rex',           matricola: '247881234', posto: 'C 25', periodo: '21/04/2026 – 22/04/2026', giorni: 1, categoria: 'Cat. II', tariffa: 50,  extra: 0,  totale: 50,   metodo: 'contante', operatore: 'Giulia Marin' },
]

// ── MANUTENZIONI SUBACQUEE ──
export const MANUTENZIONI_DEMO: MaintenanceJob[] = [
  { id: 1, berthCodice: 'D 1', tipoLavoro: 'Sostituzione catenaria principale', descrizione: 'Catenaria corrosa, sostituzione urgente prima della stagione', urgenza: 'urgente', stato: 'dafare', origine: 'socio', clientId: 1, assegnatoA: 'Reparto subacquei', dataPrevista: '2026-04-23' },
  { id: 2, berthCodice: 'B 14', tipoLavoro: 'Controllo visivo corpo morto', descrizione: 'Ispezione periodica programmata corpo morto lato destro', urgenza: 'normale', stato: 'incorso', origine: 'torre', assegnatoA: 'Reparto subacquei', dataPrevista: '2026-04-22' },
  { id: 3, berthCodice: 'D 8', tipoLavoro: 'Rimozione cima attorcigliata elica', descrizione: 'Cima intrappolata nell\'elica del posto E 8, barca impossibilitata a uscire', urgenza: 'urgente', stato: 'incorso', origine: 'socio', clientId: 5, assegnatoA: 'Reparto subacquei', dataPrevista: '2026-04-22' },
  { id: 4, berthCodice: 'D 12', tipoLavoro: 'Ispezione fondale post-tempesta', descrizione: 'Dopo la mareggiata del 18/04, verificare integrità ancoraggi Pontile Delta', urgenza: 'programmato', stato: 'dafare', origine: 'direzione', assegnatoA: 'Reparto subacquei', dataPrevista: '2026-04-25' },
  { id: 5, berthCodice: 'C 25', tipoLavoro: 'Sostituzione bitta di ormeggio', descrizione: 'Bitta lato sinistro danneggiata da urto, necessaria sostituzione completa', urgenza: 'normale', stato: 'completato', origine: 'torre', assegnatoA: 'Reparto subacquei', completatoDa: 'Marco Redi', completatoOre: '14:30', dataPrevista: '2026-04-20' },
  { id: 6, berthCodice: 'TW3', tipoLavoro: 'Pulizia fondale da detriti', descrizione: 'Accumulo detriti sul fondale zona transito west', urgenza: 'programmato', stato: 'dafare', origine: 'torre', assegnatoA: 'Reparto subacquei', dataPrevista: '2026-04-28' }
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
  { id: 1, nomeBarca: 'S/V Vento', matricola: 'NL-4521-T', bandiera: 'Paesi Bassi', tipo: 'vela', lunghezza: 13.5, pescaggio: 2.0, postoIndicato: 'D 14', dataPrevista: '2026-04-22', oraPrevista: '14:30', stato: 'oggi', note: 'Arrivo da Barcellona, 2 persone a bordo', inseritoDa: 'Mario Rossi', createdAt: '2026-04-21' },
  { id: 2, nomeBarca: 'M/Y Azzurra II', matricola: 'IT-GE-0892', bandiera: 'Italia', tipo: 'motore', lunghezza: 18.2, pescaggio: 1.8, postoIndicato: 'TW2', dataPrevista: '2026-04-22', oraPrevista: '17:00', stato: 'oggi', note: 'Cliente abituale, chiede posto frontale', inseritoDa: 'Lara Conti', createdAt: '2026-04-20' },
  { id: 3, nomeBarca: 'Cat. Levante', matricola: 'FR-8812-C', bandiera: 'Francia', tipo: 'catamarano', lunghezza: 14.8, pescaggio: 1.2, postoIndicato: 'C 20', dataPrevista: '2026-04-23', oraPrevista: '10:00', stato: 'atteso', inseritoDa: 'Mario Rossi', createdAt: '2026-04-22' },
  { id: 4, nomeBarca: 'M/Y Poseidon', matricola: 'GR-2201-M', bandiera: 'Grecia', tipo: 'motore', lunghezza: 22.0, pescaggio: 2.5, postoIndicato: 'TW4', dataPrevista: '2026-04-24', oraPrevista: '09:00', stato: 'atteso', note: 'Richiede allaccio corrente 380V', inseritoDa: 'Giulia Marin', createdAt: '2026-04-22' },
  { id: 5, nomeBarca: 'S/V Nordic Star', matricola: 'SE-1100-V', bandiera: 'Svezia', tipo: 'vela', lunghezza: 11.5, pescaggio: 1.8, postoIndicato: 'B 22', dataPrevista: '2026-04-21', oraPrevista: '16:00', stato: 'in_ritardo', note: 'Non ancora arrivata, non risponde al VHF', inseritoDa: 'Mario Rossi', createdAt: '2026-04-20' },
  { id: 6, nomeBarca: 'M/Y Dolce Vita', matricola: 'IT-NA-3344', bandiera: 'Italia', tipo: 'motore', lunghezza: 9.8, pescaggio: 1.1, postoIndicato: 'B 16', dataPrevista: '2026-04-20', stato: 'arrivato', inseritoDa: 'Lara Conti', createdAt: '2026-04-19' },
]

// -- TITOLI DI POSSESSO (M-07) --
// Ogni socio (Client.tipo === 'so') deve avere QUI un OwnershipTitle che lo
// lega al suo berthId. La SociPage ("Elenco Soci e Posti") usa TITOLI come
// tabella di JOIN: senza titolo, anche se Client.posto è valorizzato, il
// socio risulta "senza posto". Vedi memoria: ff_test_setup.md
// Modello v3 (27 Apr 2026): boatId aggiunto. Undefined per i titoli senza
// barca corrente (es. FF103 cliente 11, FF110 cliente 18 — soci che hanno
// venduto/non hanno ancora la barca). attivo: true di default su tutti.
export const TITOLI_POSSESSO_DEMO: OwnershipTitle[] = [
  // Soci storici (id 1, 4, 5)
  { id: 1, clientId: 1, berthId: 'A 5',  boatId: 1, attivo: true, numero: 'PTRT-2015-0102', dataAcquisizione: '2015-04-10', azioni: 620, catAzioni: 'A', canone: 'Regolare', scadenzaCanone: '2027-01-31' },
  { id: 2, clientId: 5, berthId: 'D 12', boatId: 6, attivo: true, numero: 'PTRT-2018-0554', dataAcquisizione: '2018-09-22', azioni: 480, catAzioni: 'B', canone: 'Scaduto',  scadenzaCanone: '2026-01-31' },
  { id: 3, clientId: 4, berthId: 'C 8',  boatId: 5, attivo: true, numero: 'PTRT-2020-0891', dataAcquisizione: '2020-02-15', azioni: 310, catAzioni: 'B', canone: 'Regolare', scadenzaCanone: '2027-01-31' },

  // Titoli mancanti per soci storici già esistenti (id 6, 7)
  { id: 4, clientId: 6, berthId: 'D 7',  boatId: 7, attivo: true, numero: 'PTRT-2017-0345', dataAcquisizione: '2017-06-12', azioni: 480, catAzioni: 'B', canone: 'Regolare', scadenzaCanone: '2027-01-31' },
  { id: 5, clientId: 7, berthId: 'C 25', boatId: 8, attivo: true, numero: 'PTRT-2019-0612', dataAcquisizione: '2019-11-03', azioni: 340, catAzioni: 'B', canone: 'Regolare', scadenzaCanone: '2027-01-31' },

  // ── TITOLI FRANGIFLUTTI (id 6-22, 25 Apr 2026) ──
  // Uno per ogni socio FF (clientId 8-24).
  { id: 6,  clientId: 8,  berthId: 'FF100', boatId: 9,  attivo: true, numero: 'PTRT-2014-0078', dataAcquisizione: '2014-03-22', azioni: 950, catAzioni: 'A', canone: 'Regolare', scadenzaCanone: '2027-01-31' },
  { id: 7,  clientId: 9,  berthId: 'FF101', boatId: 10, attivo: true, numero: 'PTRT-2016-0211', dataAcquisizione: '2016-05-14', azioni: 780, catAzioni: 'A', canone: 'Regolare', scadenzaCanone: '2027-01-31' },
  { id: 8,  clientId: 10, berthId: 'FF102', boatId: 11, attivo: true, numero: 'PTRT-2018-0432', dataAcquisizione: '2018-07-08', azioni: 650, catAzioni: 'A', canone: 'Regolare', scadenzaCanone: '2027-01-31' },
  // FF103: Carla Bruno senza barca (caso "socio senza barca / posto investimento")
  { id: 9,  clientId: 11, berthId: 'FF103',             attivo: true, numero: 'PTRT-2019-0501', dataAcquisizione: '2019-04-19', azioni: 650, catAzioni: 'A', canone: 'Regolare', scadenzaCanone: '2027-01-31' },
  { id: 10, clientId: 12, berthId: 'FF104', boatId: 12, attivo: true, numero: 'PTRT-2013-0044', dataAcquisizione: '2013-09-05', azioni: 950, catAzioni: 'A', canone: 'Regolare', scadenzaCanone: '2027-01-31' },
  { id: 11, clientId: 13, berthId: 'FF105', boatId: 13, attivo: true, numero: 'PTRT-2017-0298', dataAcquisizione: '2017-02-28', azioni: 780, catAzioni: 'A', canone: 'Regolare', scadenzaCanone: '2027-01-31' },
  { id: 12, clientId: 14, berthId: 'FF106', boatId: 14, attivo: true, numero: 'PTRT-2020-0678', dataAcquisizione: '2020-10-11', azioni: 650, catAzioni: 'A', canone: 'Regolare', scadenzaCanone: '2027-01-31' },
  { id: 13, clientId: 15, berthId: 'FF107', boatId: 15, attivo: true, numero: 'PTRT-2015-0156', dataAcquisizione: '2015-12-01', azioni: 950, catAzioni: 'A', canone: 'Regolare', scadenzaCanone: '2027-01-31' },
  { id: 14, clientId: 16, berthId: 'FF108', boatId: 16, attivo: true, numero: 'PTRT-2018-0388', dataAcquisizione: '2018-08-17', azioni: 780, catAzioni: 'A', canone: 'Regolare', scadenzaCanone: '2027-01-31' },
  { id: 15, clientId: 17, berthId: 'FF109', boatId: 17, attivo: true, numero: 'PTRT-2021-0723', dataAcquisizione: '2021-05-04', azioni: 650, catAzioni: 'A', canone: 'Regolare', scadenzaCanone: '2027-01-31' },
  // FF110: Tommaso Ricci senza barca (caso "socio senza barca / posto investimento")
  { id: 16, clientId: 18, berthId: 'FF110',             attivo: true, numero: 'PTRT-2012-0021', dataAcquisizione: '2012-06-10', azioni: 950, catAzioni: 'A', canone: 'Regolare', scadenzaCanone: '2027-01-31' },
  { id: 17, clientId: 19, berthId: 'FF111', boatId: 18, attivo: true, numero: 'PTRT-2019-0489', dataAcquisizione: '2019-03-15', azioni: 780, catAzioni: 'A', canone: 'Regolare', scadenzaCanone: '2027-01-31' },
  { id: 18, clientId: 20, berthId: 'FF112', boatId: 19, attivo: true, numero: 'PTRT-2017-0322', dataAcquisizione: '2017-11-22', azioni: 650, catAzioni: 'A', canone: 'Regolare', scadenzaCanone: '2027-01-31' },
  { id: 19, clientId: 21, berthId: 'FF113', boatId: 20, attivo: true, numero: 'PTRT-2016-0244', dataAcquisizione: '2016-07-30', azioni: 950, catAzioni: 'A', canone: 'Regolare', scadenzaCanone: '2027-01-31' },
  { id: 20, clientId: 22, berthId: 'FF1',   boatId: 21, attivo: true, numero: 'PTRT-2020-0612', dataAcquisizione: '2020-04-08', azioni: 180, catAzioni: 'C', canone: 'Regolare', scadenzaCanone: '2027-01-31' },
  { id: 21, clientId: 23, berthId: 'FF2',   boatId: 22, attivo: true, numero: 'PTRT-2019-0533', dataAcquisizione: '2019-09-25', azioni: 180, catAzioni: 'C', canone: 'Regolare', scadenzaCanone: '2027-01-31' },
  { id: 22, clientId: 24, berthId: 'FF3',   boatId: 23, attivo: true, numero: 'PTRT-2021-0701', dataAcquisizione: '2021-02-14', azioni: 180, catAzioni: 'C', canone: 'Regolare', scadenzaCanone: '2027-01-31' }
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

// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// STAYS DEMO \u2014 modello v3 (27 Apr 2026)
// Per ogni POSTI_OCCUPATI_OVERRIDE con barcaOra definita generiamo uno
// Stay aperto (fine=undefined). Eccezione: D 12 \u00e8 in cantiere (vedi
// CANTIERE_SESSIONS_DEMO sotto). I posti con stato 'socio_assente' o
// 'socio_assente_lungo' (C 25, FF103, FF110) non hanno Stay: la barca
// non \u00e8 fisicamente sul posto.
//
// Inizio: timestamp di esempio coerente (24-25 Apr 2026, qualche giorno fa).
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
export const STAYS_DEMO: Stay[] = [
  // Soci storici presenti
  { id: 1,  boatId: 1, berthId: 'A 5',  inizio: '2026-04-24T08:00:00', tipologia: 'socio' },
  { id: 2,  boatId: 5, berthId: 'C 8',  inizio: '2026-04-23T10:30:00', tipologia: 'socio' },
  // D 12 \u00e8 in cantiere \u2192 Stay NON presente, vedi CANTIERE_SESSIONS_DEMO
  // C 25 (Rex, socio Francesca Landi) \u00e8 uscito in gita \u2192 Stay NON presente
  // Affittuario su D 7 (auth attiva, Mistral)
  { id: 3,  boatId: 7, berthId: 'D 7',  inizio: '2026-04-01T09:00:00', tipologia: 'affittuario', authId: 1 },
  // Transito su B 10 (Tramontana)
  { id: 4,  boatId: 2, berthId: 'B 10', inizio: '2026-04-21T14:00:00', tipologia: 'transito' },
  // Transito su TW3 (Neptune Dream)
  { id: 5,  boatId: 3, berthId: 'TW3',  inizio: '2026-04-20T07:30:00', tipologia: 'transito' },

  // \u2500\u2500 Soci FRANGIFLUTTI presenti \u2500\u2500
  { id: 10, boatId: 9,  berthId: 'FF100', inizio: '2026-04-15T10:00:00', tipologia: 'socio' },
  { id: 11, boatId: 10, berthId: 'FF101', inizio: '2026-04-15T10:00:00', tipologia: 'socio' },
  { id: 12, boatId: 11, berthId: 'FF102', inizio: '2026-04-15T10:00:00', tipologia: 'socio' },
  // FF103 vuoto (Carla Bruno senza barca)
  { id: 13, boatId: 12, berthId: 'FF104', inizio: '2026-04-15T10:00:00', tipologia: 'socio' },
  { id: 14, boatId: 13, berthId: 'FF105', inizio: '2026-04-15T10:00:00', tipologia: 'socio' },
  { id: 15, boatId: 14, berthId: 'FF106', inizio: '2026-04-15T10:00:00', tipologia: 'socio' },
  { id: 16, boatId: 15, berthId: 'FF107', inizio: '2026-04-15T10:00:00', tipologia: 'socio' },
  { id: 17, boatId: 16, berthId: 'FF108', inizio: '2026-04-15T10:00:00', tipologia: 'socio' },
  { id: 18, boatId: 17, berthId: 'FF109', inizio: '2026-04-15T10:00:00', tipologia: 'socio' },
  // FF110 vuoto (Tommaso Ricci senza barca)
  { id: 19, boatId: 18, berthId: 'FF111', inizio: '2026-04-15T10:00:00', tipologia: 'socio' },
  { id: 20, boatId: 19, berthId: 'FF112', inizio: '2026-04-15T10:00:00', tipologia: 'socio' },
  { id: 21, boatId: 20, berthId: 'FF113', inizio: '2026-04-15T10:00:00', tipologia: 'socio' },
  { id: 22, boatId: 21, berthId: 'FF1',   inizio: '2026-04-15T10:00:00', tipologia: 'socio' },
  { id: 23, boatId: 22, berthId: 'FF2',   inizio: '2026-04-15T10:00:00', tipologia: 'socio' },
  { id: 24, boatId: 23, berthId: 'FF3',   inizio: '2026-04-15T10:00:00', tipologia: 'socio' },
]

// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// CANTIERE SESSIONS DEMO \u2014 modello v3 (27 Apr 2026)
// L'unica barca attualmente in cantiere \u00e8 M/Y Perseo (id 6) della socia
// Anna Conti, posto originale D 12. La barca \u00e8 uscita 12 Apr 2026 e non
// \u00e8 ancora rientrata.
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
export const CANTIERE_SESSIONS_DEMO: CantiereSession[] = [
  {
    id: 1,
    boatId: 6,
    berthOriginale: 'D 12',
    inizio: '2026-04-12T16:00:00',
    note: 'Alaggio per manutenzione scafo',
  },
]




