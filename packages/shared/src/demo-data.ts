import { Client, Boat, Berth, Movement, Tariff, MaintenanceJob, Report, Receipt, Arrival, OwnershipTitle, Authorization, SystemUser, SystemAlert, Stay, CantiereSession } from './types'

// ════════════════════════════════════════════════════════════════
// MARINA OS — Demo Data
// Porto Turistico Riva di Traiano (PTRT S.p.A.)
// Aggiornato: 28 Apr 2026
//
// POSTI REALI: 1.192 posti su 26 pontili + DS + FF + TW.
// Riempimento ~30%: 20 soci reali (brogliaccio) + 301 soci sintetici
// + 37 transiti sintetici = 358 berths occupati.
// ════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════
// POSTI BARCA — Dati reali PTRT S.p.A.
// ════════════════════════════════════════════════════════════════

function genBerths(
  prefix: string,
  pontileNome: string,
  count: number,
  template: (n: number) => Omit<Berth, 'id' | 'pontile'>,
  options?: { idStyle?: 'space' | 'compact'; startIndex?: number }
): Berth[] {
  const idStyle = options?.idStyle ?? 'space'
  const start   = options?.startIndex ?? 1
  const out: Berth[] = []
  for (let n = 0; n < count; n++) {
    const i  = start + n
    const id = idStyle === 'space' ? `${prefix} ${i}` : `${prefix}${i}`
    out.push({ id, pontile: pontileNome, ...template(n) })
  }
  return out
}

function genSocioPontile(letter: string, count: number, lunMax: number): Berth[] {
  let cat: string, lar: number, pro: number
  if (lunMax === 10.0)      { cat = 'Cat. II';  lar = 3.5; pro = 2.8 }
  else if (lunMax === 12.0) { cat = 'Cat. III'; lar = 4.0; pro = 3.0 }
  else                      { cat = 'Cat. IV';  lar = 4.5; pro = 3.5 }
  return genBerths(letter, `Pontile ${letter}`, count, () => ({
    lunMax, larMax: lar, profondita: pro, categoria: cat, stato: 'libero', agibile: true,
  }))
}

const POSTI_A  = genBerths('A', 'Pontile A', 27, () => ({ lunMax: 12.0, larMax: 4.0, profondita: 3.0, categoria: 'Cat. III', stato: 'libero', agibile: true }))
const POSTI_B  = genBerths('B', 'Pontile B', 36, (n) => ({ lunMax: 9.0,  larMax: 3.25, profondita: 2.5, categoria: 'Cat. I',   stato: n < 10 ? 'riservato' : 'libero', agibile: true }))
const POSTI_C  = genBerths('C', 'Pontile C', 28, () => ({ lunMax: 15.5, larMax: 4.5, profondita: 3.5, categoria: 'Cat. IV',  stato: 'libero', agibile: true }))
const POSTI_D  = genBerths('D', 'Pontile D', 32, () => ({ lunMax: 12.0, larMax: 4.0, profondita: 3.0, categoria: 'Cat. III', stato: 'libero', agibile: true }))
const POSTI_E  = genSocioPontile('E', 39, 10.0)
const POSTI_F  = genSocioPontile('F', 42, 10.0)
const POSTI_G  = genSocioPontile('G', 44, 10.0)
const POSTI_H  = genSocioPontile('H', 44, 10.0)
const POSTI_I  = genSocioPontile('I', 46, 10.0)
const POSTI_J  = genSocioPontile('J', 47, 10.0)
const POSTI_K  = genSocioPontile('K', 43, 10.0)
const POSTI_L  = genSocioPontile('L', 47, 12.0)
const POSTI_M  = genSocioPontile('M', 47, 12.0)
const POSTI_N  = genSocioPontile('N', 51, 12.0)
const POSTI_O  = genSocioPontile('O', 50, 12.0)
const POSTI_P  = genSocioPontile('P', 54, 12.0)
const POSTI_Q  = genSocioPontile('Q', 46, 12.0)
const POSTI_R  = genSocioPontile('R', 50, 12.0)
const POSTI_S  = genSocioPontile('S', 48, 12.0)
const POSTI_T  = genSocioPontile('T', 50, 12.0)
const POSTI_U  = genSocioPontile('U', 44, 12.0)
const POSTI_V  = genSocioPontile('V', 44, 12.0)
const POSTI_W  = genSocioPontile('W', 33, 15.5)
const POSTI_DS = genBerths('DS', 'Darsena Soci', 77, () => ({ lunMax: 15.5, larMax: 4.5, profondita: 3.5, categoria: 'Cat. IV', stato: 'libero', agibile: true }))
const POSTI_FF = genBerths('FF', 'Frangiflutti', 113, (n) => {
  if (n === 107) return { lunMax: 40.0, larMax: 9.0, profondita: 6.0, categoria: 'Cat. VIII', stato: 'libero', agibile: true }
  return { lunMax: 18.0, larMax: 5.0, profondita: 4.0, categoria: 'Cat. V', stato: 'libero', agibile: true }
}, { idStyle: 'compact', startIndex: 1 })
const POSTI_TW = genBerths('TW', 'Torre / Transito', 10, () => ({ lunMax: 30.0, larMax: 8.0, profondita: 5.0, categoria: 'Cat. VII', stato: 'libero', agibile: true }), { idStyle: 'compact', startIndex: 1 })

export const POSTI_DEMO: Berth[] = [
  ...POSTI_A, ...POSTI_B, ...POSTI_C, ...POSTI_D,
  ...POSTI_E, ...POSTI_F, ...POSTI_G, ...POSTI_H,
  ...POSTI_I, ...POSTI_J, ...POSTI_K,
  ...POSTI_L, ...POSTI_M, ...POSTI_N, ...POSTI_O,
  ...POSTI_P, ...POSTI_Q, ...POSTI_R, ...POSTI_S,
  ...POSTI_T, ...POSTI_U, ...POSTI_V, ...POSTI_W,
  ...POSTI_DS, ...POSTI_FF, ...POSTI_TW,
]

// ════════════════════════════════════════════════════════════════
// DATI REALI — brogliaccio di banchina (20 soci, pontili H / N / W)
// ════════════════════════════════════════════════════════════════

const _CLIENTI_REAL: Client[] = [
  { id: 1,  tipo: 'so', nome: 'Mario Rinaldi',       iniziali: 'MR', naz: 'Italiana', cf: 'RNDMRA72H10H501A', tel: '+39 333 1001001', email: 'm.rinaldi@email.it',    indirizzo: 'Via Aurelia 14, Civitavecchia',           docTipo: "Carta d'identità", docNum: 'CA0001001', posto: 'H 28', pontile: 'Pontile H', catPosto: 'Cat. II',  dimMax: 'max 10m',   azioni: '340' },
  { id: 2,  tipo: 'so', nome: 'Luigi Ferrara',        iniziali: 'LF', naz: 'Italiana', cf: 'FRRLGU65M08H501B', tel: '+39 347 1001002', email: 'l.ferrara@email.it',    indirizzo: 'Via del Mare 8, Civitavecchia',           docTipo: "Carta d'identità", docNum: 'CA0001002', posto: 'H 40', pontile: 'Pontile H', catPosto: 'Cat. II',  dimMax: 'max 10m',   azioni: '340' },
  { id: 3,  tipo: 'so', nome: 'Carla Marchetti',      iniziali: 'CM', naz: 'Italiana', cf: 'MRCCRL78P55H501C', tel: '+39 320 1001003', email: 'c.marchetti@email.it', indirizzo: 'Viale della Repubblica 22, Civitavecchia', docTipo: 'Passaporto',        docNum: 'YA0001003', posto: 'H 41', pontile: 'Pontile H', catPosto: 'Cat. II',  dimMax: 'max 10m',   azioni: '340' },
  { id: 4,  tipo: 'so', nome: 'Franco Amati',         iniziali: 'FA', naz: 'Italiana', cf: 'MTAFNC58E12H501D', tel: '+39 338 1001004', email: 'f.amati@email.it',     indirizzo: 'Via Tarquinia 3, Civitavecchia',          docTipo: "Carta d'identità", docNum: 'CA0001004', posto: 'H 42', pontile: 'Pontile H', catPosto: 'Cat. II',  dimMax: 'max 10m',   azioni: '340' },
  { id: 5,  tipo: 'so', nome: 'Giovanni Rizzo',       iniziali: 'GR', naz: 'Italiana', cf: 'RZZGNN70A10H501E', tel: '+39 349 1001005', email: 'g.rizzo@email.it',     indirizzo: 'Corso Centocelle 45, Roma',               docTipo: "Carta d'identità", docNum: 'CA0001005', posto: 'H 43', pontile: 'Pontile H', catPosto: 'Cat. II',  dimMax: 'max 10m',   azioni: '340' },
  { id: 6,  tipo: 'so', nome: 'Maria Costantini',     iniziali: 'MC', naz: 'Italiana', cf: 'CSTMRA81T55H501F', tel: '+39 333 1001006', email: 'm.costantini@email.it',indirizzo: 'Via Flaminia 77, Roma',                   docTipo: 'Passaporto',        docNum: 'YA0001006', posto: 'H 44', pontile: 'Pontile H', catPosto: 'Cat. II',  dimMax: 'max 10m',   azioni: '340' },
  { id: 7,  tipo: 'so', nome: 'Roberto Palumbo',      iniziali: 'RP', naz: 'Italiana', cf: 'PLMRRT69C10H501G', tel: '+39 347 1001007', email: 'r.palumbo@email.it',   indirizzo: 'Via Cassia 200, Roma',                    docTipo: "Carta d'identità", docNum: 'CA0001007', posto: 'N 47', pontile: 'Pontile N', catPosto: 'Cat. III', dimMax: 'max 12m',   azioni: '480' },
  { id: 8,  tipo: 'so', nome: 'Alessandra Gentile',   iniziali: 'AG', naz: 'Italiana', cf: 'GNTLSN85B55H501H', tel: '+39 320 1001008', email: 'a.gentile@email.it',   indirizzo: 'Via Aurelia 310, Roma',                   docTipo: "Carta d'identità", docNum: 'CA0001008', posto: 'N 48', pontile: 'Pontile N', catPosto: 'Cat. III', dimMax: 'max 12m',   azioni: '480' },
  { id: 9,  tipo: 'so', nome: 'Francesco Ferretti',   iniziali: 'FE', naz: 'Italiana', cf: 'FRTFNC74L10H501I', tel: '+39 338 1001009', email: 'f.ferretti@email.it',  indirizzo: 'Via Braccianese 5, Bracciano',            docTipo: 'Passaporto',        docNum: 'YA0001009', posto: 'N 49', pontile: 'Pontile N', catPosto: 'Cat. III', dimMax: 'max 12m',   azioni: '480' },
  { id: 10, tipo: 'so', nome: 'Simona Monti',          iniziali: 'SM', naz: 'Italiana', cf: 'MNTSMN80D55H501J', tel: '+39 349 1001010', email: 's.monti@email.it',     indirizzo: 'Piazza della Repubblica 12, Viterbo',     docTipo: "Carta d'identità", docNum: 'CA0001010', posto: 'N 50', pontile: 'Pontile N', catPosto: 'Cat. III', dimMax: 'max 12m',   azioni: '480' },
  { id: 11, tipo: 'so', nome: 'Davide Nardi',          iniziali: 'DN', naz: 'Italiana', cf: 'NRDDVD77P20H501K', tel: '+39 333 1001011', email: 'd.nardi@email.it',     indirizzo: 'Via Clodia 88, Ronciglione',              docTipo: "Carta d'identità", docNum: 'CA0001011', posto: 'N 51', pontile: 'Pontile N', catPosto: 'Cat. III', dimMax: 'max 12m',   azioni: '480' },
  { id: 12, tipo: 'so', nome: 'Stefano Carra',         iniziali: 'SC', naz: 'Italiana', cf: 'CRRSFN66A15H501L', tel: '+39 347 1001012', email: 's.carra@email.it',     indirizzo: 'Via Trionfale 40, Roma',                  docTipo: "Carta d'identità", docNum: 'CA0001012', posto: 'W 1',  pontile: 'Pontile W', catPosto: 'Cat. IV',  dimMax: 'max 15,5m', azioni: '480' },
  { id: 13, tipo: 'so', nome: 'Elena Gatti',           iniziali: 'EG', naz: 'Italiana', cf: 'GTTLNE82R55H501M', tel: '+39 320 1001013', email: 'e.gatti@email.it',     indirizzo: 'Via Appia Nuova 155, Roma',               docTipo: 'Passaporto',        docNum: 'YA0001013', posto: 'W 2',  pontile: 'Pontile W', catPosto: 'Cat. IV',  dimMax: 'max 15,5m', azioni: '480' },
  { id: 14, tipo: 'so', nome: 'Marco Vitelli',         iniziali: 'MV', naz: 'Italiana', cf: 'VTLMRC76M10H501N', tel: '+39 338 1001014', email: 'm.vitelli@email.it',   indirizzo: 'Via Nomentana 302, Roma',                 docTipo: "Carta d'identità", docNum: 'CA0001014', posto: 'W 3',  pontile: 'Pontile W', catPosto: 'Cat. IV',  dimMax: 'max 15,5m', azioni: '480' },
  { id: 15, tipo: 'so', nome: 'Paola Benedetti',       iniziali: 'PB', naz: 'Italiana', cf: 'BNDPLA79C55H501O', tel: '+39 349 1001015', email: 'p.benedetti@email.it', indirizzo: 'Via Prenestina 88, Roma',                 docTipo: "Carta d'identità", docNum: 'CA0001015', posto: 'W 4',  pontile: 'Pontile W', catPosto: 'Cat. IV',  dimMax: 'max 15,5m', azioni: '480' },
  { id: 16, tipo: 'so', nome: 'Giorgio Lancia',        iniziali: 'GL', naz: 'Italiana', cf: 'LNCGRG61H10H501P', tel: '+39 333 1001016', email: 'g.lancia@email.it',    indirizzo: 'Via Tiburtina 540, Roma',                 docTipo: "Carta d'identità", docNum: 'CA0001016', posto: 'W 5',  pontile: 'Pontile W', catPosto: 'Cat. IV',  dimMax: 'max 15,5m', azioni: '480' },
  { id: 17, tipo: 'so', nome: 'Teresa Caruso',         iniziali: 'TC', naz: 'Italiana', cf: 'CRSTRS83P55H501Q', tel: '+39 347 1001017', email: 't.caruso@email.it',    indirizzo: 'Via Ostiense 200, Roma',                  docTipo: 'Passaporto',        docNum: 'YA0001017', posto: 'W 6',  pontile: 'Pontile W', catPosto: 'Cat. IV',  dimMax: 'max 15,5m', azioni: '480' },
  { id: 18, tipo: 'so', nome: 'Riccardo Mancini',      iniziali: 'RM', naz: 'Italiana', cf: 'MNCRRD70E15H501R', tel: '+39 320 1001018', email: 'r.mancini@email.it',   indirizzo: 'Via Laurentina 88, Roma',                 docTipo: "Carta d'identità", docNum: 'CA0001018', posto: 'W 7',  pontile: 'Pontile W', catPosto: 'Cat. IV',  dimMax: 'max 15,5m', azioni: '480' },
  { id: 19, tipo: 'so', nome: 'Giulia Sorrentino',     iniziali: 'GS', naz: 'Italiana', cf: 'SRRGLI88A55H501S', tel: '+39 338 1001019', email: 'g.sorrentino@email.it',indirizzo: 'Via Colombo 14, Anzio',                   docTipo: 'Passaporto',        docNum: 'YA0001019', posto: 'W 8',  pontile: 'Pontile W', catPosto: 'Cat. IV',  dimMax: 'max 15,5m', azioni: '480' },
  { id: 20, tipo: 'so', nome: 'Antonio De Luca',       iniziali: 'AD', naz: 'Italiana', cf: 'DLCNTN73M10H501T', tel: '+39 349 1001020', email: 'a.deluca@email.it',    indirizzo: 'Via Pontina 55, Aprilia',                 docTipo: "Carta d'identità", docNum: 'CA0001020', posto: 'W 9',  pontile: 'Pontile W', catPosto: 'Cat. IV',  dimMax: 'max 15,5m', azioni: '480' },
]

const _BARCHE_REAL: Boat[] = [
  { id: 1,  clientId: 1,  nome: 'Seconda a Nessuno', matricola: 'CV2324',      tipo: 'Motore', modello: 'Calafuria',           lunghezza: 8.5,  larghezza: 2.8, pescaggio: 1.0, bandiera: 'Italia', posto: 'H 28' },
  { id: 2,  clientId: 2,  nome: 'Il mare in tasca',  matricola: 'STRA5555D',   tipo: 'Motore', modello: 'Sciallino 25',        lunghezza: 7.5,  larghezza: 2.5, pescaggio: 0.8, bandiera: 'Italia', posto: 'H 40' },
  { id: 3,  clientId: 3,  nome: 'Cabriolet',         matricola: 'IT-RM-5001',  tipo: 'Vela',   modello: 'Sun Odyssey 32i',     lunghezza: 9.8,  larghezza: 3.2, pescaggio: 1.6, bandiera: 'Italia', posto: 'H 41' },
  { id: 4,  clientId: 5,  nome: 'Violetta II',       matricola: 'IT-RM-5002',  tipo: 'Vela',   modello: 'Jeanneau Sun 29',     lunghezza: 9.2,  larghezza: 3.1, pescaggio: 1.5, bandiera: 'Italia', posto: 'H 43' },
  { id: 5,  clientId: 6,  nome: 'Itaca',             matricola: 'IT-RM-5003',  tipo: 'Vela',   modello: 'Bavaria 32',          lunghezza: 9.0,  larghezza: 3.0, pescaggio: 1.4, bandiera: 'Italia', posto: 'H 44' },
  { id: 6,  clientId: 7,  nome: 'Key West',          matricola: 'IT-RM-5004',  tipo: 'Vela',   modello: 'Sun Odyssey 34.2',    lunghezza: 10.4, larghezza: 3.6, pescaggio: 1.8, bandiera: 'Italia', posto: 'N 47' },
  { id: 7,  clientId: 8,  nome: 'Sanremo',           matricola: 'IT-RM-5005',  tipo: 'Motore', modello: 'Sanremo 34 fly',      lunghezza: 10.5, larghezza: 3.8, pescaggio: 1.2, bandiera: 'Italia', posto: 'N 48' },
  { id: 8,  clientId: 9,  nome: 'Effe III',          matricola: 'ROMA3920DX',  tipo: 'Vela',   modello: 'Grand Soleil 37',     lunghezza: 11.5, larghezza: 3.8, pescaggio: 1.9, bandiera: 'Italia', posto: 'N 49' },
  { id: 9,  clientId: 10, nome: 'Eklettic',          matricola: 'CV954DX',     tipo: 'Vela',   modello: 'Comet 36',            lunghezza: 11.0, larghezza: 3.6, pescaggio: 1.8, bandiera: 'Italia', posto: 'N 50' },
  { id: 10, clientId: 11, nome: 'Eos',               matricola: 'IT-RM-5006',  tipo: 'Vela',   modello: 'Elan 340',            lunghezza: 10.8, larghezza: 3.5, pescaggio: 1.7, bandiera: 'Italia', posto: 'N 51' },
  { id: 11, clientId: 12, nome: 'Alien',             matricola: 'IT-RM-5007',  tipo: 'Motore', modello: 'Next 330 Lx',         lunghezza: 10.2, larghezza: 3.5, pescaggio: 1.1, bandiera: 'Italia', posto: 'W 1'  },
  { id: 12, clientId: 13, nome: 'Paradiso',          matricola: 'IT-RM-5008',  tipo: 'Motore', modello: 'Heaven 34',           lunghezza: 10.4, larghezza: 3.6, pescaggio: 1.2, bandiera: 'Italia', posto: 'W 2'  },
  { id: 13, clientId: 14, nome: 'Elan',              matricola: 'IT-RM-5009',  tipo: 'Vela',   modello: 'Impression 434',      lunghezza: 13.2, larghezza: 4.1, pescaggio: 1.9, bandiera: 'Italia', posto: 'W 3'  },
  { id: 14, clientId: 15, nome: 'Scotch',            matricola: 'ROMA8360DX',  tipo: 'Vela',   modello: 'Beneteau Oceanis 35', lunghezza: 10.0, larghezza: 3.4, pescaggio: 1.6, bandiera: 'Italia', posto: 'W 4'  },
  { id: 15, clientId: 17, nome: 'Ikaroa 2',          matricola: '1ROMA4511',   tipo: 'Vela',   modello: 'Dufour 430',          lunghezza: 13.1, larghezza: 4.2, pescaggio: 1.9, bandiera: 'Italia', posto: 'W 6'  },
  { id: 16, clientId: 19, nome: 'Sirius Black',      matricola: 'LILL2773D',   tipo: 'Vela',   modello: 'Dufour 430',          lunghezza: 13.1, larghezza: 4.2, pescaggio: 1.9, bandiera: 'Italia', posto: 'W 8'  },
  { id: 17, clientId: 20, nome: 'Gia che ci sei..', matricola: 'IT-RM-5010',  tipo: 'Vela',   modello: 'Sun Odyssey 45.2',    lunghezza: 13.8, larghezza: 4.3, pescaggio: 2.0, bandiera: 'Italia', posto: 'W 9'  },
]

const _STAYS_REAL: Stay[] = [
  { id: 1,  boatId: 1,  berthId: 'H 28', inizio: '2026-04-01T09:00:00', tipologia: 'socio' },
  { id: 2,  boatId: 2,  berthId: 'H 40', inizio: '2026-04-03T10:00:00', tipologia: 'socio' },
  { id: 3,  boatId: 3,  berthId: 'H 41', inizio: '2026-04-05T11:00:00', tipologia: 'socio' },
  { id: 4,  boatId: 4,  berthId: 'H 43', inizio: '2026-04-02T08:30:00', tipologia: 'socio' },
  { id: 5,  boatId: 5,  berthId: 'H 44', inizio: '2026-04-06T14:00:00', tipologia: 'socio' },
  { id: 6,  boatId: 6,  berthId: 'N 47', inizio: '2026-04-10T09:00:00', tipologia: 'socio' },
  { id: 7,  boatId: 7,  berthId: 'N 48', inizio: '2026-04-08T10:30:00', tipologia: 'socio' },
  { id: 8,  boatId: 8,  berthId: 'N 49', inizio: '2026-04-12T08:00:00', tipologia: 'socio' },
  { id: 9,  boatId: 9,  berthId: 'N 50', inizio: '2026-04-07T15:00:00', tipologia: 'socio' },
  { id: 10, boatId: 10, berthId: 'N 51', inizio: '2026-04-11T09:30:00', tipologia: 'socio' },
  { id: 11, boatId: 11, berthId: 'W 1',  inizio: '2026-04-15T10:00:00', tipologia: 'socio' },
  { id: 12, boatId: 12, berthId: 'W 2',  inizio: '2026-04-14T11:00:00', tipologia: 'socio' },
  { id: 13, boatId: 13, berthId: 'W 3',  inizio: '2026-04-13T09:00:00', tipologia: 'socio' },
  { id: 14, boatId: 14, berthId: 'W 4',  inizio: '2026-04-16T08:00:00', tipologia: 'socio' },
  { id: 15, boatId: 15, berthId: 'W 6',  inizio: '2026-04-17T10:30:00', tipologia: 'socio' },
  { id: 16, boatId: 16, berthId: 'W 8',  inizio: '2026-04-18T09:00:00', tipologia: 'socio' },
  { id: 17, boatId: 17, berthId: 'W 9',  inizio: '2026-04-19T11:00:00', tipologia: 'socio' },
]

const _TITOLI_REAL: OwnershipTitle[] = [
  { id: 1,  clientId: 1,  berthId: 'H 28', boatId: 1,  attivo: true, numero: 'PTRT-2016-0101', dataAcquisizione: '2016-03-15', azioni: 340, catAzioni: 'B', canone: 'Regolare', scadenzaCanone: '2027-01-31' },
  { id: 2,  clientId: 2,  berthId: 'H 40', boatId: 2,  attivo: true, numero: 'PTRT-2014-0102', dataAcquisizione: '2014-07-22', azioni: 340, catAzioni: 'B', canone: 'Regolare', scadenzaCanone: '2027-01-31' },
  { id: 3,  clientId: 3,  berthId: 'H 41', boatId: 3,  attivo: true, numero: 'PTRT-2019-0103', dataAcquisizione: '2019-05-10', azioni: 340, catAzioni: 'B', canone: 'Regolare', scadenzaCanone: '2027-01-31' },
  { id: 4,  clientId: 4,  berthId: 'H 42',             attivo: true, numero: 'PTRT-2012-0104', dataAcquisizione: '2012-09-01', azioni: 340, catAzioni: 'B', canone: 'Regolare', scadenzaCanone: '2027-01-31' },
  { id: 5,  clientId: 5,  berthId: 'H 43', boatId: 4,  attivo: true, numero: 'PTRT-2018-0105', dataAcquisizione: '2018-02-14', azioni: 340, catAzioni: 'B', canone: 'Regolare', scadenzaCanone: '2027-01-31' },
  { id: 6,  clientId: 6,  berthId: 'H 44', boatId: 5,  attivo: true, numero: 'PTRT-2021-0106', dataAcquisizione: '2021-11-03', azioni: 340, catAzioni: 'B', canone: 'Regolare', scadenzaCanone: '2027-01-31' },
  { id: 7,  clientId: 7,  berthId: 'N 47', boatId: 6,  attivo: true, numero: 'PTRT-2015-0107', dataAcquisizione: '2015-06-18', azioni: 480, catAzioni: 'B', canone: 'Regolare', scadenzaCanone: '2027-01-31' },
  { id: 8,  clientId: 8,  berthId: 'N 48', boatId: 7,  attivo: true, numero: 'PTRT-2020-0108', dataAcquisizione: '2020-08-25', azioni: 480, catAzioni: 'B', canone: 'Regolare', scadenzaCanone: '2027-01-31' },
  { id: 9,  clientId: 9,  berthId: 'N 49', boatId: 8,  attivo: true, numero: 'PTRT-2013-0109', dataAcquisizione: '2013-04-30', azioni: 480, catAzioni: 'B', canone: 'Regolare', scadenzaCanone: '2027-01-31' },
  { id: 10, clientId: 10, berthId: 'N 50', boatId: 9,  attivo: true, numero: 'PTRT-2017-0110', dataAcquisizione: '2017-10-12', azioni: 480, catAzioni: 'B', canone: 'Regolare', scadenzaCanone: '2027-01-31' },
  { id: 11, clientId: 11, berthId: 'N 51', boatId: 10, attivo: true, numero: 'PTRT-2022-0111', dataAcquisizione: '2022-01-20', azioni: 480, catAzioni: 'B', canone: 'Regolare', scadenzaCanone: '2027-01-31' },
  { id: 12, clientId: 12, berthId: 'W 1',  boatId: 11, attivo: true, numero: 'PTRT-2016-0112', dataAcquisizione: '2016-09-05', azioni: 480, catAzioni: 'B', canone: 'Regolare', scadenzaCanone: '2027-01-31' },
  { id: 13, clientId: 13, berthId: 'W 2',  boatId: 12, attivo: true, numero: 'PTRT-2018-0113', dataAcquisizione: '2018-03-22', azioni: 480, catAzioni: 'B', canone: 'Regolare', scadenzaCanone: '2027-01-31' },
  { id: 14, clientId: 14, berthId: 'W 3',  boatId: 13, attivo: true, numero: 'PTRT-2014-0114', dataAcquisizione: '2014-11-17', azioni: 480, catAzioni: 'B', canone: 'Regolare', scadenzaCanone: '2027-01-31' },
  { id: 15, clientId: 15, berthId: 'W 4',  boatId: 14, attivo: true, numero: 'PTRT-2020-0115', dataAcquisizione: '2020-06-08', azioni: 480, catAzioni: 'B', canone: 'Regolare', scadenzaCanone: '2027-01-31' },
  { id: 16, clientId: 16, berthId: 'W 5',              attivo: true, numero: 'PTRT-2011-0116', dataAcquisizione: '2011-12-01', azioni: 480, catAzioni: 'B', canone: 'Regolare', scadenzaCanone: '2027-01-31' },
  { id: 17, clientId: 17, berthId: 'W 6',  boatId: 15, attivo: true, numero: 'PTRT-2019-0117', dataAcquisizione: '2019-07-14', azioni: 480, catAzioni: 'B', canone: 'Regolare', scadenzaCanone: '2027-01-31' },
  { id: 18, clientId: 18, berthId: 'W 7',              attivo: true, numero: 'PTRT-2015-0118', dataAcquisizione: '2015-02-28', azioni: 480, catAzioni: 'B', canone: 'Regolare', scadenzaCanone: '2027-01-31' },
  { id: 19, clientId: 19, berthId: 'W 8',  boatId: 16, attivo: true, numero: 'PTRT-2021-0119', dataAcquisizione: '2021-04-19', azioni: 480, catAzioni: 'B', canone: 'Regolare', scadenzaCanone: '2027-01-31' },
  { id: 20, clientId: 20, berthId: 'W 9',  boatId: 17, attivo: true, numero: 'PTRT-2017-0120', dataAcquisizione: '2017-08-31', azioni: 480, catAzioni: 'B', canone: 'Regolare', scadenzaCanone: '2027-01-31' },
]

// ════════════════════════════════════════════════════════════════
// DATI SINTETICI — generati proceduralmente (~30% riempimento)
// Nomi, CF, barche e modelli inventati ma plausibili.
// 80% dei soci con barca presente (Stay aperto), 20% assenti.
// I transiti hanno sempre la barca presente.
// ════════════════════════════════════════════════════════════════
function _generateSynthData() {
  const COGNOMI = ['Rossi','Ferrari','Bianchi','Romano','Colombo','Ricci','Marino','Greco','Bruno','Gallo','Conti','Mancini','Costa','Giordano','Rizzo','Lombardi','Moretti','Barbieri','Fontana','Santoro','Marini','Rinaldi','Caruso','Ferrara','Gatti','Pellegrini','Palumbo','Sanna','Vitale','Serra']
  const NOMI_M  = ['Marco','Luca','Giovanni','Paolo','Roberto','Stefano','Davide','Antonio','Francesco','Alessandro','Massimo','Claudio','Nicola','Giorgio','Bruno','Sergio','Enrico','Fabrizio','Alberto','Cristian']
  const NOMI_F  = ['Maria','Anna','Laura','Elena','Giulia','Francesca','Cristina','Paola','Valentina','Claudia','Sara','Monica','Roberta','Daniela','Silvia','Barbara','Patrizia','Rossella','Carla','Marta']
  const VIE     = ['Via Roma','Via Aurelia','Via Cassia','Via Flaminia','Via Tiburtina','Via Appia','Via Prenestina','Via Nomentana','Via Ostiense','Via Laurentina','Via Pontina','Lungomare','Corso Italia','Viale Europa','Via del Porto']
  const CITTA   = ['Roma','Civitavecchia','Anzio','Fiumicino','Ladispoli','Bracciano','Tarquinia','Viterbo','Cerveteri','Montalto di Castro','Orbetello','Grosseto','Santa Marinella','Ardea','Nettuno']

  const NOMI_BARCA = ['Libertà','Tramonto','Ponente','Levante','Scirocco','Maestrale','Grecale','Tramontana','Zephyr','Aurora','Aldebaran','Stella Polare','Sirio','Castore','Polluce','Rigel','Vega','Altair','Deneb','Spica','Antares','Canopus','Capella','Alkaid','Fomalhaut','Achernar','Adhara','Hamal','Mira','Alcor','Anima Libera','Brezza di Mare','Cuore Blu','Dolce Vita','Estate Azzurra','Fiocco di Neve','Gioia di Vivere','Horizonte','Isola Felice','Lago d\'Argento','Mare Nostrum','Notte Stellata','Onda Lunga','Primavera','Quinta Essenza','Raggio di Sole','Sole Nascente','Tra le Onde','Unico Amore','Vita Bella']

  const MODELLI: Record<string, { vela: string[]; motore: string[] }> = {
    '10':   { vela: ['Bavaria 30','Beneteau First 31.7','Jeanneau Sun 30','Dufour 305','Hanse 315','Elan 310','Dehler 31','Contessa 32','Westerly 33','Catalina 30'], motore: ['Cranchi 32','Fiart 30','Rio 29','Rizzardi 27','Apreamare 32','Gozzo 30','Mochi 28','Selfcraft 31','Aquamar 30','Riva 27'] },
    '12':   { vela: ['Bavaria 33','Beneteau Oceanis 35','Jeanneau 35','Dufour 375','Hanse 345','Elan 340','X-Yachts X35','Hallberg-Rassy 34','Moody 33','Oyster 336'], motore: ['Cranchi 36','Fiart 35','Azimut 36','Ferretti 38','Sunseeker 34','Princess V36','Beneteau Antares 36','Riva 36','Drago 33','Absolute 36'] },
    '15.5': { vela: ['Bavaria 40','Beneteau Oceanis 40.1','Jeanneau 44','Dufour 430','Hanse 418','Elan Impression 434','Dehler 42','X-Yachts X4.3','Nauticat 38','Moody 38'], motore: ['Azimut 40','Ferretti 44','Sunseeker 40','Princess V40','Cranchi 40','Riva 40','Absolute 40','Fiart 40','Bavaria 40 Sport','Galeon 405'] },
    '18':   { vela: ['Bavaria 46','Beneteau Oceanis 48','Jeanneau 49','Dufour 470','Hanse 458','Hallberg-Rassy 44','Oyster 47','Swan 48','Malo 39','X-Yachts X4.9'], motore: ['Azimut 46','Ferretti 50','Sunseeker 48','Princess V48','Cranchi 48','Riva 48','Absolute 48','Fairline 46','Pershing 50','Sanlorenzo 46'] },
    '30':   { vela: ['Swan 60','Hallberg-Rassy 55','Oyster 56','Malo 46','Moody 47','Wauquiez 45','Amel 55','Nauticat 52','Najad 511','X-Yachts X5.6'], motore: ['Azimut 60','Ferretti 670','Sunseeker 63','Princess Y72','Riva 63','Sanlorenzo 62','Absolute 62','Leopard 58','Galeon 640 FLY','Prestige 680'] },
  }

  const NOMI_TRANSITO = ['Wind Rider','Sea Dream','Blue Horizon','Ocean Spirit','Wave Dancer','Salty Dog','Nautilus','Pacific Star','Nordic Spirit','Mediterranean Queen','Adriatic Pearl','Aegean Dream','Caribbean Wind','Atlantic Breeze','Windfall','Seabird','Wayward Wind','Drifter','Wanderer','Explorer']
  const BANDIERE = ['Italia','Francia','Spagna','Germania','Olanda','Inghilterra','Grecia','Svezia','Norvegia','Danimarca']
  const PREFISSI_MAT = ['FR','DE','NL','ES','GB','SE','NO','GR','DK','PT']

  const clients: Client[] = []
  const boats:   Boat[]   = []
  const titles:  OwnershipTitle[] = []
  const stays:   Stay[]   = []

  let cId    = 21
  let bId    = 18
  let tId    = 21
  let sId    = 18
  let gIdx   = 0

  // ── Aggiunge un socio con barca su un posto ──
  function addSocio(berthId: string, lunMax: number, pontileNome: string) {
    const isM     = gIdx % 2 === 0
    const nome    = isM ? NOMI_M[gIdx % NOMI_M.length] : NOMI_F[gIdx % NOMI_F.length]
    const cognome = COGNOMI[(gIdx * 7) % COGNOMI.length]
    const azioni  = lunMax <= 10 ? 340 : lunMax <= 12 ? 480 : lunMax <= 15.5 ? 580 : 650
    const catPosto = lunMax <= 10 ? 'Cat. II' : lunMax <= 12 ? 'Cat. III' : lunMax <= 15.5 ? 'Cat. IV' : 'Cat. V'
    const dimMax  = `max ${lunMax}m`
    const anno    = 60 + (gIdx % 40)
    const mese    = ['A','B','C','D','E','H','L','M','P','R','S','T'][gIdx % 12]
    const giorno  = String(1 + (gIdx % 28)).padStart(2,'0')
    const comune  = ['H501','F839','H264','G273','G480','H501','F839'][gIdx % 7]

    clients.push({
      id: cId, tipo: 'so',
      nome: `${nome} ${cognome}`, iniziali: `${nome[0]}${cognome[0]}`,
      naz: 'Italiana',
      cf: `${cognome.slice(0,3).toUpperCase().padEnd(3,'X')}${nome.slice(0,3).toUpperCase().padEnd(3,'X')}${anno}${mese}${giorno}${comune}${String.fromCharCode(65 + gIdx % 26)}`,
      tel: `+39 3${String(30 + gIdx % 70).padStart(2,'0')} ${String(1000000 + cId * 7).slice(0,7)}`,
      email: `${nome.toLowerCase()}${cId}@email.it`,
      indirizzo: `${VIE[gIdx % VIE.length]} ${10 + gIdx % 200}, ${CITTA[gIdx % CITTA.length]}`,
      docTipo: gIdx % 3 === 0 ? 'Passaporto' : "Carta d'identità",
      docNum: `${['CA','YA','CB','AB'][gIdx % 4]}${String(1000000 + cId * 13).slice(0,7)}`,
      posto: berthId, pontile: pontileNome, catPosto, dimMax, azioni: String(azioni),
    })

    const isVela   = gIdx % 3 !== 0
    const catKey   = String(lunMax)
    const modelli  = MODELLI[catKey] ?? MODELLI['12']
    const lista    = isVela ? modelli.vela : modelli.motore
    const lun      = Math.round((lunMax - 0.5 - (gIdx % 3) * 0.3) * 10) / 10
    const lar      = Math.round((lunMax <= 10 ? 3.2 + (gIdx % 4) * 0.1 : lunMax <= 12 ? 3.5 + (gIdx % 5) * 0.1 : 4.0 + (gIdx % 5) * 0.1) * 10) / 10
    const pesc     = Math.round((lunMax <= 10 ? 1.3 + (gIdx % 5) * 0.1 : lunMax <= 12 ? 1.5 + (gIdx % 5) * 0.1 : 1.8 + (gIdx % 4) * 0.1) * 10) / 10

    // Fix (29 Apr 2026): NOMI_BARCA ha 51 elementi ma i soci sintetici
    // sono ~301. Il modulo % faceva riciclare i nomi (es. "Gioia di Vivere"
    // appariva 5 volte su berth diversi). Le ricerche per nome trovavano
    // match multipli → comportamento imprevedibile in Torre.
    // Soluzione: al secondo ciclo aggiungo suffisso romano (II, III, ecc.).
    // In marina è normale avere "Libertà II", "Tramonto III" ecc.
    const _baseNome = NOMI_BARCA[gIdx % NOMI_BARCA.length]
    const _ciclo    = Math.floor(gIdx / NOMI_BARCA.length)
    const _suffissi = ['','II','III','IV','V','VI','VII']
    const _nomeBoat = _ciclo === 0 ? _baseNome : `${_baseNome} ${_suffissi[_ciclo] ?? _ciclo + 1}`

    boats.push({
      id: bId, clientId: cId,
      nome: _nomeBoat,
      matricola: `IT-RM-${6000 + bId}`,
      tipo: isVela ? 'Vela' : 'Motore',
      modello: lista[gIdx % lista.length],
      lunghezza: lun, larghezza: lar, pescaggio: pesc,
      bandiera: 'Italia', posto: berthId,
    })

    const acqYear = 2010 + (gIdx % 13)
    const acqMese = String(1 + (gIdx % 12)).padStart(2,'0')
    const acqGg   = String(1 + (gIdx % 28)).padStart(2,'0')
    titles.push({
      id: tId++, clientId: cId, berthId, boatId: bId, attivo: true,
      numero: `PTRT-${acqYear}-${String(200 + gIdx).padStart(4,'0')}`,
      dataAcquisizione: `${acqYear}-${acqMese}-${acqGg}`,
      azioni, catAzioni: azioni >= 580 ? 'A' : 'B',
      canone: gIdx % 15 === 0 ? 'Scaduto' : 'Regolare',
      scadenzaCanone: '2027-01-31',
    })

    // 80% presente (Stay aperto), 20% assente
    if (gIdx % 5 !== 0) {
      const sm = String(1 + (gIdx % 4)).padStart(2,'0')
      const sd = String(1 + (gIdx % 27)).padStart(2,'0')
      const sh = String(8 + (gIdx % 10)).padStart(2,'0')
      stays.push({ id: sId++, boatId: bId, berthId, inizio: `2026-${sm}-${sd}T${sh}:00:00`, tipologia: 'socio' })
    }

    cId++; bId++; gIdx++
  }

  // ── Aggiunge un transito su un posto ──
  function addTransito(berthId: string, lunMax: number) {
    const isM   = gIdx % 2 === 0
    const nome  = isM ? NOMI_M[gIdx % NOMI_M.length] : NOMI_F[gIdx % NOMI_F.length]
    const cogn  = COGNOMI[(gIdx + 5) % COGNOMI.length]
    const band  = BANDIERE[gIdx % BANDIERE.length]

    clients.push({
      id: cId, tipo: 'pf',
      nome: `${nome} ${cogn}`, iniziali: `${nome[0]}${cogn[0]}`,
      naz: band,
      tel: `+39 3${String(40 + gIdx % 60).padStart(2,'0')} ${String(2000000 + cId * 11).slice(0,7)}`,
      email: `${nome.toLowerCase()}${cId}@mail.com`,
    })

    const isVela  = gIdx % 2 === 0
    const catKey  = String(lunMax)
    const modelli = MODELLI[catKey] ?? MODELLI['12']
    const lista   = isVela ? modelli.vela : modelli.motore
    const lun     = Math.round((lunMax - 0.5 - (gIdx % 3) * 0.5) * 10) / 10
    const lar     = Math.round((lunMax <= 10 ? 3.0 + (gIdx % 3) * 0.1 : lunMax <= 12 ? 3.4 + (gIdx % 4) * 0.1 : lunMax <= 18 ? 4.5 + (gIdx % 4) * 0.2 : 6.5 + (gIdx % 4) * 0.3) * 10) / 10
    const pesc    = Math.round((lunMax <= 10 ? 0.9 + (gIdx % 4) * 0.2 : lunMax <= 12 ? 1.2 + (gIdx % 5) * 0.2 : lunMax <= 18 ? 1.8 + (gIdx % 4) * 0.2 : 2.5 + (gIdx % 4) * 0.3) * 10) / 10

    boats.push({
      id: bId, clientId: cId,
      nome: NOMI_TRANSITO[gIdx % NOMI_TRANSITO.length],
      matricola: `${PREFISSI_MAT[gIdx % PREFISSI_MAT.length]}-${String(1000 + gIdx * 7)}-T`,
      tipo: isVela ? 'Vela' : 'Motore',
      modello: lista[gIdx % lista.length],
      lunghezza: lun, larghezza: lar, pescaggio: pesc,
      bandiera: band, posto: berthId,
    })

    const sd = String(15 + (gIdx % 13)).padStart(2,'0')
    const sh = String(8 + (gIdx % 12)).padStart(2,'0')
    stays.push({ id: sId++, boatId: bId, berthId, inizio: `2026-04-${sd}T${sh}:00:00`, tipologia: 'transito' })

    cId++; bId++; gIdx++
  }

  // ── SOCI: ~30% per pontile ──
  // A cantiere (A1-A14): 4 posti
  [1,2,3,4].forEach(n => addSocio(`A ${n}`, 12.0, 'Pontile A'))
  // E → K (10m)
  Array.from({length:12},(_,i)=>i+1).forEach(n => addSocio(`E ${n}`, 10.0, 'Pontile E'))
  Array.from({length:13},(_,i)=>i+1).forEach(n => addSocio(`F ${n}`, 10.0, 'Pontile F'))
  Array.from({length:13},(_,i)=>i+1).forEach(n => addSocio(`G ${n}`, 10.0, 'Pontile G'))
  Array.from({length:7}, (_,i)=>i+1).forEach(n => addSocio(`H ${n}`, 10.0, 'Pontile H'))
  Array.from({length:14},(_,i)=>i+1).forEach(n => addSocio(`I ${n}`, 10.0, 'Pontile I'))
  Array.from({length:14},(_,i)=>i+1).forEach(n => addSocio(`J ${n}`, 10.0, 'Pontile J'))
  Array.from({length:13},(_,i)=>i+1).forEach(n => addSocio(`K ${n}`, 10.0, 'Pontile K'))
  // L → W (12m)
  Array.from({length:14},(_,i)=>i+1).forEach(n => addSocio(`L ${n}`, 12.0, 'Pontile L'))
  Array.from({length:14},(_,i)=>i+1).forEach(n => addSocio(`M ${n}`, 12.0, 'Pontile M'))
  Array.from({length:10},(_,i)=>i+1).forEach(n => addSocio(`N ${n}`, 12.0, 'Pontile N'))
  Array.from({length:15},(_,i)=>i+1).forEach(n => addSocio(`O ${n}`, 12.0, 'Pontile O'))
  Array.from({length:16},(_,i)=>i+1).forEach(n => addSocio(`P ${n}`, 12.0, 'Pontile P'))
  Array.from({length:14},(_,i)=>i+1).forEach(n => addSocio(`Q ${n}`, 12.0, 'Pontile Q'))
  Array.from({length:15},(_,i)=>i+1).forEach(n => addSocio(`R ${n}`, 12.0, 'Pontile R'))
  Array.from({length:14},(_,i)=>i+1).forEach(n => addSocio(`S ${n}`, 12.0, 'Pontile S'))
  Array.from({length:15},(_,i)=>i+1).forEach(n => addSocio(`T ${n}`, 12.0, 'Pontile T'))
  Array.from({length:13},(_,i)=>i+1).forEach(n => addSocio(`U ${n}`, 12.0, 'Pontile U'))
  Array.from({length:13},(_,i)=>i+1).forEach(n => addSocio(`V ${n}`, 12.0, 'Pontile V'))
  addSocio('W 10', 15.5, 'Pontile W')
  // DS (15.5m)
  Array.from({length:23},(_,i)=>i+1).forEach(n => addSocio(`DS ${n}`, 15.5, 'Darsena Soci'))
  // FF soci (18m) — skip FF99 e FF108 che sono transito
  Array.from({length:34},(_,i)=>i+1).forEach(n => addSocio(`FF${n}`, 18.0, 'Frangiflutti'))

  // ── TRANSITI: ~30% per pontile ──
  // A transito (A15-A19)
  Array.from({length:5},(_,i)=>i+15).forEach(n => addTransito(`A ${n}`, 12.0))
  // B transito (B11-B20)
  Array.from({length:10},(_,i)=>i+11).forEach(n => addTransito(`B ${n}`, 9.0))
  // C (C1-C8)
  Array.from({length:8},(_,i)=>i+1).forEach(n => addTransito(`C ${n}`, 15.5))
  // D (D1-D10)
  Array.from({length:10},(_,i)=>i+1).forEach(n => addTransito(`D ${n}`, 12.0))
  // FF transito
  addTransito('FF99', 18.0)
  // TW (TW1-TW3)
  ;[1,2,3].forEach(n => addTransito(`TW${n}`, 30.0))

  return { clients, boats, titles, stays }
}

const _SYNTH = _generateSynthData()

// ════════════════════════════════════════════════════════════════
// EXPORT — array unificati (reali + sintetici)
// ════════════════════════════════════════════════════════════════
export const CLIENTI_DEMO: Client[]         = [..._CLIENTI_REAL, ..._SYNTH.clients]
export const BARCHE_DEMO:  Boat[]           = [..._BARCHE_REAL,  ..._SYNTH.boats]
export const STAYS_DEMO:   Stay[]           = [..._STAYS_REAL,   ..._SYNTH.stays]
export const TITOLI_POSSESSO_DEMO: OwnershipTitle[] = [..._TITOLI_REAL, ..._SYNTH.titles]

export const MOVIMENTI_DEMO:        Movement[]       = []
export const CANTIERE_SESSIONS_DEMO: CantiereSession[] = []
export const AUTORIZZAZIONI_DEMO:   Authorization[]  = []
export const RICEVUTE_DEMO:         Receipt[]        = []
export const MANUTENZIONI_DEMO:     MaintenanceJob[] = []
export const SEGNALAZIONI_DEMO:     Report[]         = []
export const ARRIVI_DEMO:           Arrival[]        = []
export const NOTIFICHE_DEMO:        SystemAlert[]    = []

// ── TARIFFE ──
export const TARIFFE_DEMO: Tariff[] = [
  { categoria: 'Cat. I',    dimMax: 'fino a 9,0m',   lunMax: 9.0,  prezzoGiorno: 40,  ivaInclusa: true, acquaInclusa: true },
  { categoria: 'Cat. II',   dimMax: 'fino a 10,0m',  lunMax: 10.0, prezzoGiorno: 50,  ivaInclusa: true, acquaInclusa: true },
  { categoria: 'Cat. III',  dimMax: 'fino a 12,0m',  lunMax: 12.0, prezzoGiorno: 70,  ivaInclusa: true, acquaInclusa: true },
  { categoria: 'Cat. IV',   dimMax: 'fino a 15,5m',  lunMax: 15.5, prezzoGiorno: 90,  ivaInclusa: true, acquaInclusa: true },
  { categoria: 'Cat. V',    dimMax: 'fino a 18,0m',  lunMax: 18.0, prezzoGiorno: 160, ivaInclusa: true, acquaInclusa: true },
  { categoria: 'Cat. VI',   dimMax: 'fino a 22,0m',  lunMax: 22.0, prezzoGiorno: 220, ivaInclusa: true, acquaInclusa: true },
  { categoria: 'Cat. VII',  dimMax: 'fino a 30,0m',  lunMax: 30.0, prezzoGiorno: 320, ivaInclusa: true, acquaInclusa: true },
  { categoria: 'Cat. VIII', dimMax: 'fino a 40,0m',  lunMax: 40.0, prezzoGiorno: 450, ivaInclusa: true, acquaInclusa: true },
  { categoria: 'Cat. IX',   dimMax: 'oltre 40,0m',   lunMax: 9999, prezzoGiorno: 600, ivaInclusa: true, acquaInclusa: true },
]

// ── UTENTI DI SISTEMA ──
export const UTENTI_SISTEMA_DEMO: SystemUser[] = [
  { id: 1, nome: 'Direzione',    email: 'direzione@marina.it',    ruolo: 'direzione',    stato: 'attivo' },
  { id: 2, nome: 'Ufficio',      email: 'ufficio@marina.it',      ruolo: 'responsabile', stato: 'attivo' },
  { id: 3, nome: 'Torre',        email: 'torre@marina.it',        ruolo: 'torre',        stato: 'attivo' },
  { id: 4, nome: 'Manutenzione', email: 'manutenzione@marina.it', ruolo: 'responsabile', stato: 'attivo' },
  { id: 5, nome: 'Ormeggiatore', email: 'ormeggiatore@marina.it', ruolo: 'ormeggiatore', stato: 'attivo' },
]
