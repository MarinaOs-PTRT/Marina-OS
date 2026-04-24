#!/usr/bin/env node
/**
 * import-csv.js — Marina OS
 * ------------------------------------------------------------------
 * Legge un CSV con i posti barca reali e stampa un array TypeScript
 * pronto da incollare in `packages/shared/src/demo-data.ts`
 * (al posto del blocco POSTI_DEMO).
 *
 * Uso:
 *   node tools/seed-berths/import-csv.js tools/seed-berths/posti-template.csv
 *
 * Output:
 *   Stampa su STDOUT il blocco `export const POSTI_DEMO: Berth[] = [...]`.
 *   Puoi redirigere:
 *   node tools/seed-berths/import-csv.js posti.csv > posti-generato.ts
 *
 * Formato CSV atteso (separatore ";"):
 *   id;pontile;lato;lunMax;larMax;profondita;categoria;stato;barcaOra;socioId
 *
 * Campi obbligatori: id, pontile, lato, lunMax, larMax, profondita, categoria, stato
 * Campi opzionali: barcaOra, socioId (lasciare vuoti se non applicabili)
 *
 * Validazioni:
 *  - stato deve essere uno dei BerthStatus ammessi
 *  - lato deve essere "Sinistro" o "Destro"
 *  - lunMax/larMax/profondita devono essere numeri positivi
 *  - socioId se presente deve essere intero
 * ------------------------------------------------------------------
 */

const fs = require('fs')
const path = require('path')

const STATI_AMMESSI = new Set([
  'libero',
  'occupato_socio',
  'socio_assente',
  'socio_assente_lungo',
  'occupato_transito',
  'transito_assente',
  'occupato_affittuario',
  'affittuario_assente',
  'in_cantiere',
  'bunker',
  'riservato',
])

const LATI_AMMESSI = new Set(['Sinistro', 'Destro'])

const HEADER_ATTESO = [
  'id',
  'pontile',
  'lato',
  'lunMax',
  'larMax',
  'profondita',
  'categoria',
  'stato',
  'barcaOra',
  'socioId',
]

function fatal(msg) {
  console.error('❌ ERRORE:', msg)
  process.exit(1)
}

function parseCSVLine(line) {
  // Parser minimale: separatore ";" e supporto virgolette per valori con ";".
  const out = []
  let buf = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      inQuotes = !inQuotes
      continue
    }
    if (c === ';' && !inQuotes) {
      out.push(buf)
      buf = ''
      continue
    }
    buf += c
  }
  out.push(buf)
  return out.map((s) => s.trim())
}

function main() {
  const file = process.argv[2]
  if (!file) fatal('passa il path del CSV come argomento.\n  es: node import-csv.js posti.csv')

  const abs = path.resolve(file)
  if (!fs.existsSync(abs)) fatal(`file non trovato: ${abs}`)

  const raw = fs.readFileSync(abs, 'utf-8').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const lines = raw.split('\n').filter((l) => l.trim().length > 0)

  if (lines.length < 2) fatal('il CSV è vuoto o contiene solo l\'header.')

  const header = parseCSVLine(lines[0])
  for (let i = 0; i < HEADER_ATTESO.length; i++) {
    if (header[i] !== HEADER_ATTESO[i]) {
      fatal(
        `header non valido alla colonna ${i + 1}: atteso "${HEADER_ATTESO[i]}", trovato "${header[i]}"\n` +
          `header completo atteso: ${HEADER_ATTESO.join(';')}`,
      )
    }
  }

  const berths = []
  const errors = []
  const seenIds = new Set()

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (line.startsWith('#')) continue // commento
    const fields = parseCSVLine(line)
    const rowNum = i + 1 // riga 1-based

    const [id, pontile, lato, lunMax, larMax, profondita, categoria, stato, barcaOra, socioId] = fields

    // Validazioni
    if (!id) { errors.push(`riga ${rowNum}: id vuoto`); continue }
    if (seenIds.has(id)) { errors.push(`riga ${rowNum}: id duplicato "${id}"`); continue }
    seenIds.add(id)
    if (!pontile) errors.push(`riga ${rowNum}: pontile vuoto`)
    if (!LATI_AMMESSI.has(lato)) errors.push(`riga ${rowNum}: lato "${lato}" non valido (Sinistro|Destro)`)
    if (!STATI_AMMESSI.has(stato)) errors.push(`riga ${rowNum}: stato "${stato}" non valido`)

    const lunN = parseFloat(lunMax.replace(',', '.'))
    const larN = parseFloat(larMax.replace(',', '.'))
    const proN = parseFloat(profondita.replace(',', '.'))
    if (!Number.isFinite(lunN) || lunN <= 0) errors.push(`riga ${rowNum}: lunMax non numerico o ≤0`)
    if (!Number.isFinite(larN) || larN <= 0) errors.push(`riga ${rowNum}: larMax non numerico o ≤0`)
    if (!Number.isFinite(proN) || proN <= 0) errors.push(`riga ${rowNum}: profondita non numerico o ≤0`)
    if (!categoria) errors.push(`riga ${rowNum}: categoria vuota`)

    const socioN = socioId ? parseInt(socioId, 10) : undefined
    if (socioId && !Number.isInteger(socioN)) errors.push(`riga ${rowNum}: socioId "${socioId}" non intero`)

    berths.push({
      id,
      pontile,
      lato,
      lunMax: lunN,
      larMax: larN,
      profondita: proN,
      categoria,
      stato,
      barcaOra: barcaOra || undefined,
      socioId: socioN,
    })
  }

  if (errors.length) {
    console.error(`❌ ${errors.length} errore/i di validazione:`)
    errors.forEach((e) => console.error('  - ' + e))
    process.exit(1)
  }

  // Genera output TypeScript
  let out = '// ── POSTI BARCA (Berths) ──\n'
  out += `// Generato da tools/seed-berths/import-csv.js il ${new Date().toISOString().slice(0, 10)}\n`
  out += `// Fonte: ${path.basename(file)} (${berths.length} posti)\n`
  out += 'export const POSTI_DEMO: Berth[] = [\n'

  for (const b of berths) {
    const parts = [
      `id: ${JSON.stringify(b.id)}`,
      `pontile: ${JSON.stringify(b.pontile)}`,
      `lato: ${JSON.stringify(b.lato)}`,
      `lunMax: ${b.lunMax}`,
      `larMax: ${b.larMax}`,
      `profondita: ${b.profondita}`,
      `categoria: ${JSON.stringify(b.categoria)}`,
      `stato: ${JSON.stringify(b.stato)}`,
    ]
    if (b.barcaOra) parts.push(`barcaOra: ${JSON.stringify(b.barcaOra)}`)
    if (b.socioId !== undefined) parts.push(`socioId: ${b.socioId}`)
    out += `  { ${parts.join(', ')} },\n`
  }

  out += ']\n'

  process.stdout.write(out)
  console.error(`\n✅ Generati ${berths.length} posti barca. Redirigi stdout per salvare su file.`)
}

main()
