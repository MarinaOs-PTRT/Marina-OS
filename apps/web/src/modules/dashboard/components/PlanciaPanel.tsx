import React, { useState } from 'react'
import './PlanciaPanel.css'

/**
 * PlanciaPanel — Pannello laterale destro della Dashboard mappa-centrica.
 *
 * Composto da DUE blocchi verticali:
 *  1. Widget meteo compatto (temperatura grande + 4 metriche).
 *     v1: dati statici placeholder. In M-fase-successiva collegheremo
 *     un'API esterna (OpenWeather Marine / Windy). Quando vento > 25 kn
 *     il widget cambia colore di sfondo (allerta).
 *  2. Consegne turno: sezione unica (no tab), per appunti che il turno
 *     in uscita lascia al montante. Ogni nota ha timestamp + autore.
 *
 * Vedi memoria: dashboard_layout.md (sarà creata a fine refactor).
 */

type Consegna = {
  id: number
  ora: string
  autore: string
  testo: string
}

const CONSEGNE_DEMO: Consegna[] = [
  { id: 1, ora: '08:15', autore: 'Sara', testo: 'Bitta B12 traballante, segnalato a manutenzione.' },
  { id: 2, ora: '07:50', autore: 'Sara', testo: 'Ricevuta consegna gasolio TW3 ore 09:30.' },
]

// Placeholder meteo. Strutturato come oggetto perché in v2 verrà sostituito
// con dati live da hook/API. Mantenere la stessa shape minimizza il diff.
const METEO_DEMO = {
  temperatura: 19,
  condizione: 'Sereno',
  ventoNodi: 12,
  ventoDirezione: 'NE',
  mareDescr: 'poco mosso',
  ondaMetri: 0.4,
  visibKm: 10,
}

const SOGLIA_VENTO_ALLERTA = 25 // nodi → cambia sfondo widget meteo

export function PlanciaPanel() {
  const [consegne, setConsegne] = useState<Consegna[]>(CONSEGNE_DEMO)
  const [nuovaNota, setNuovaNota] = useState('')

  const isVentoAllerta = METEO_DEMO.ventoNodi >= SOGLIA_VENTO_ALLERTA

  const aggiungiConsegna = () => {
    const t = nuovaNota.trim()
    if (!t) return
    const ora = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
    const nuova: Consegna = {
      id: Date.now(),
      ora,
      autore: 'Operatore', // TODO: legare al ruolo/utente attivo quando sarà disponibile
      testo: t,
    }
    setConsegne(prev => [nuova, ...prev])
    setNuovaNota('')
  }

  return (
    <aside className="plancia-panel">
      {/* ── METEO ── */}
      <section className={`plancia-meteo ${isVentoAllerta ? 'allerta' : ''}`}>
        <div className="plancia-meteo-head">
          <span className="plancia-meteo-temp">{METEO_DEMO.temperatura}°</span>
          <span className="plancia-meteo-cond">{METEO_DEMO.condizione}</span>
        </div>
        <div className="plancia-meteo-grid">
          <div><span>Vento</span><strong>{METEO_DEMO.ventoNodi} kn {METEO_DEMO.ventoDirezione}</strong></div>
          <div><span>Mare</span><strong>{METEO_DEMO.mareDescr}</strong></div>
          <div><span>Onda</span><strong>{METEO_DEMO.ondaMetri} m</strong></div>
          <div><span>Visib.</span><strong>{METEO_DEMO.visibKm} km</strong></div>
        </div>
        {isVentoAllerta && (
          <div className="plancia-meteo-allerta">
            ⚠ Vento sopra soglia ({SOGLIA_VENTO_ALLERTA} kn) — attenzione alle manovre.
          </div>
        )}
      </section>

      {/* ── CONSEGNE TURNO ── */}
      <section className="plancia-consegne">
        <div className="plancia-section-head">
          <h3>Consegne turno</h3>
          <span className="plancia-counter">{consegne.length}</span>
        </div>

        <div className="plancia-consegne-list">
          {consegne.length === 0 ? (
            <div className="plancia-empty">Nessuna consegna in evidenza.</div>
          ) : (
            consegne.map(c => (
              <article key={c.id} className="plancia-consegna-item">
                <div className="plancia-consegna-meta">{c.ora} · {c.autore}</div>
                <div className="plancia-consegna-testo">{c.testo}</div>
              </article>
            ))
          )}
        </div>

        <div className="plancia-consegna-form">
          <textarea
            value={nuovaNota}
            onChange={e => setNuovaNota(e.target.value)}
            placeholder="Scrivi una consegna per il prossimo turno..."
            rows={2}
          />
          <button
            type="button"
            className="plancia-btn"
            onClick={aggiungiConsegna}
            disabled={!nuovaNota.trim()}
          >Aggiungi</button>
        </div>
      </section>
    </aside>
  )
}
