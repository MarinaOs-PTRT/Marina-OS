# Seed Berths — Marina OS

Tool per popolare `POSTI_DEMO` (e in futuro la tabella `berths` del DB) a partire da un CSV.

## Perché esiste

L'SVG `apps/web/src/assets/mappaPtrt.svg` contiene **149 posti barca** interattivi. Mantenere a mano un array di 149 entry è scomodo e soggetto a errori. Questo tool permette di:

1. Editare i dati in un foglio di calcolo (Excel / Google Sheets / Numbers).
2. Esportare in CSV.
3. Generare il blocco TypeScript corretto e pronto all'uso.

## Come si usa

### 1. Prepara il CSV

Copia `posti-template.csv` e compilalo con i dati reali del Porto.

**Separatore: `;`** (non virgola — così i numeri con virgola decimale non creano conflitti).

**Colonne (obbligatorio rispettare l'ordine):**

| colonna      | tipo             | obbligatorio | note                                                         |
|--------------|------------------|--------------|--------------------------------------------------------------|
| `id`         | string           | sì           | es. `A 1`, `D 12`, `TW3`, `FF100`                            |
| `pontile`    | string           | sì           | es. `Pontile Alfa`                                           |
| `lato`       | `Sinistro`/`Destro` | sì        |                                                              |
| `lunMax`     | numero           | sì           | lunghezza massima barca accettata (metri)                    |
| `larMax`     | numero           | sì           | larghezza massima (metri)                                    |
| `profondita` | numero           | sì           | profondità acqua al posto (metri)                            |
| `categoria`  | string           | sì           | `Cat. I`…`Cat. IX` (vedi TARIFFE_DEMO)                       |
| `stato`      | BerthStatus      | sì           | `libero`, `occupato_socio`, `in_cantiere`, ecc.              |
| `barcaOra`   | string           | no           | nome barca ora attraccata (solo se occupato)                 |
| `socioId`    | intero           | no           | id del socio proprietario (solo per posti fissi)             |

### 2. Lancia lo script

Dalla root del monorepo:

```bash
node tools/seed-berths/import-csv.js tools/seed-berths/posti-template.csv > tools/seed-berths/output.ts
```

Lo script:
- valida ogni riga (stato ammesso, numeri, id univoci)
- stampa su STDOUT il blocco `export const POSTI_DEMO: Berth[] = [ ... ]`
- mostra gli errori su STDERR se ce ne sono

### 3. Sostituisci in `demo-data.ts`

Copia il contenuto del file generato e incollalo nel blocco `POSTI_DEMO` di `packages/shared/src/demo-data.ts`, sostituendo la versione precedente (anche quella generata proceduralmente tramite `genBerths`).

### Validazione e errori comuni

Lo script blocca con exit code 1 se trova:
- id vuoti o duplicati
- lato diverso da `Sinistro`/`Destro`
- stato non in `BerthStatus`
- valori numerici non validi (zero, negativi, non-numerici)

Esempio output errore:
```
❌ 2 errore/i di validazione:
  - riga 15: stato "occupato" non valido
  - riga 23: lunMax non numerico o ≤0
```

## Formato ID: note per l'integrazione con l'SVG

Gli ID nell'SVG usano underscore: `B_1`, `D_12`, `TW3`, `FF100`.
Nel database/TypeScript usiamo il formato con spazio (`B 1`, `D 12`) per coerenza con il resto del demo-data.

Il componente `MarinaMap.tsx` ha già il fallback: prova `B 1` → `B_1` → `B1` finché non trova un match nel SVG. Entrambi i formati funzionano.

## Prossimi passi (backend)

Quando sarà pronto il Layer 4 (PostgreSQL), questo script verrà esteso per:
- generare SQL `INSERT INTO berths (...)` al posto del TypeScript
- oppure chiamare direttamente un endpoint REST `/api/admin/seed-berths`
