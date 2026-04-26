import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useGlobalState } from '../../../store/GlobalState'
import { Tariff, Boat } from '@shared/types'

interface CalcResult {
  categoria: string
  tariffaGg: number
  giorni: number
  subtotale: number
  extra: number
  totale: number
}

function getTariffaDaLunghezza(tariffe: any[], lunghezza: number) {
  const sorted = [...tariffe].sort((a, b) => a.lunMax - b.lunMax)
  for (const t of sorted) {
    if (lunghezza <= t.lunMax) return t
  }
  return sorted[sorted.length - 1]
}

function calcola(tariffe: any[], lunghezza: number, dal: string, al: string, tariffaForzata: number, extra: number): CalcResult | null {
  if (!dal || !al || lunghezza <= 0) return null
  const giorni = Math.max(0, Math.round((new Date(al).getTime() - new Date(dal).getTime()) / 86400000))
  if (giorni <= 0) return null

  let categoria: string
  let tariffaGg: number

  if (tariffaForzata > 0) {
    tariffaGg = tariffaForzata
    categoria = tariffe.find(t => t.prezzoGiorno === tariffaForzata)?.categoria || 'Personalizzata'
  } else {
    const t = getTariffaDaLunghezza(tariffe, lunghezza)
    categoria = t.categoria
    tariffaGg = t.prezzoGiorno
  }

  const subtotale = tariffaGg * giorni
  const totale = subtotale + (extra || 0)
  return { categoria, tariffaGg, giorni, subtotale, extra: extra || 0, totale }
}

export function Calculator() {
  const { tariffe, barche } = useGlobalState()
  const [nome, setNome] = useState('')
  const [matricola, setMatricola] = useState('')
  const [posto, setPosto] = useState('')
  const [lunghezza, setLunghezza] = useState('')
  const [dal, setDal] = useState('')
  const [al, setAl] = useState('')
  const [tariffaForzata, setTariffaForzata] = useState('')
  const [extra, setExtra] = useState('')
  const [metodo, setMetodo] = useState<'contante' | 'pos'>('pos')

  // Autocomplete state
  const [nomeSuggestions, setNomeSuggestions] = useState<Boat[]>([])
  const [matricolaSuggestions, setMatricolaSuggestions] = useState<Boat[]>([])
  const [showNomeSug, setShowNomeSug] = useState(false)
  const [showMatricolaSug, setShowMatricolaSug] = useState(false)
  const nomeRef = useRef<HTMLDivElement>(null)
  const matricolaRef = useRef<HTMLDivElement>(null)

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (nomeRef.current && !nomeRef.current.contains(e.target as Node)) setShowNomeSug(false)
      if (matricolaRef.current && !matricolaRef.current.contains(e.target as Node)) setShowMatricolaSug(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleNomeChange = (v: string) => {
    setNome(v)
    if (v.length >= 2) {
      const found = barche.filter(b => b.nome.toLowerCase().includes(v.toLowerCase()))
      setNomeSuggestions(found)
      setShowNomeSug(found.length > 0)
    } else {
      setShowNomeSug(false)
    }
  }

  const handleMatricolaChange = (v: string) => {
    setMatricola(v.toUpperCase())
    if (v.length >= 2) {
      const found = barche.filter(b => b.matricola.toLowerCase().includes(v.toLowerCase()))
      setMatricolaSuggestions(found)
      setShowMatricolaSug(found.length > 0)
    } else {
      setShowMatricolaSug(false)
    }
  }

  const fillFromBarca = (b: Boat) => {
    setNome(b.nome)
    setMatricola(b.matricola)
    setLunghezza(String(b.lunghezza))
    if (b.posto) setPosto(b.posto)
    setShowNomeSug(false)
    setShowMatricolaSug(false)
  }

  const result = useMemo(() =>
    calcola(
      tariffe,
      parseFloat(lunghezza) || 0,
      dal,
      al,
      parseFloat(tariffaForzata) || 0,
      parseFloat(extra) || 0
    ),
    [tariffe, lunghezza, dal, al, tariffaForzata, extra]
  )

  const nextNumero = '2026/0045'

  const handleEmetti = () => {
    if (!result) return
    alert(`Ricevuta ${nextNumero} emessa!\nBarca: ${nome}\nTotale: € ${result.totale}\nMetodo: ${metodo === 'pos' ? 'POS' : 'Contante'}`)
  }

  return (
    <div className="calc-layout">
      {/* Left: Form */}
      <div className="calc-form-panel">
        <h2>Calcolo Sosta</h2>
        <div className="calc-grid">

          {/* Nome with autocomplete */}
          <div className="form-group full calc-autocomplete-wrap" ref={nomeRef}>
            <label>Nome Imbarcazione</label>
            <input
              type="text"
              value={nome}
              onChange={e => handleNomeChange(e.target.value)}
              onFocus={() => nome.length >= 2 && setShowNomeSug(nomeSuggestions.length > 0)}
              placeholder="Es. M/Y Neptune Dream"
              autoComplete="off"
            />
            {showNomeSug && (
              <ul className="calc-suggestions">
                {nomeSuggestions.map(b => (
                  <li key={b.id} onClick={() => fillFromBarca(b)}>
                    <span className="sug-nome">{b.nome}</span>
                    <span className="sug-meta">{b.matricola} · {b.lunghezza}m · {b.tipo}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Matricola with autocomplete */}
          <div className="form-group calc-autocomplete-wrap" ref={matricolaRef}>
            <label>Matricola</label>
            <input
              type="text"
              value={matricola}
              onChange={e => handleMatricolaChange(e.target.value)}
              onFocus={() => matricola.length >= 2 && setShowMatricolaSug(matricolaSuggestions.length > 0)}
              placeholder="Es. IT-RM-2847"
              autoComplete="off"
            />
            {showMatricolaSug && (
              <ul className="calc-suggestions">
                {matricolaSuggestions.map(b => (
                  <li key={b.id} onClick={() => fillFromBarca(b)}>
                    <span className="sug-nome">{b.nome}</span>
                    <span className="sug-meta">{b.matricola} · {b.lunghezza}m</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="form-group">
            <label>Posto Barca</label>
            <input type="text" value={posto} onChange={e => setPosto(e.target.value)} placeholder="Es. C 1" />
          </div>
          <div className="form-group">
            <label>Lunghezza (m)</label>
            <input type="number" step="0.1" min="1" max="100" value={lunghezza} onChange={e => setLunghezza(e.target.value)} placeholder="Es. 12.5" />
          </div>
          <div className="form-group">
            <label>Tariffa Forzata (€/gg)</label>
            <input type="number" step="1" min="0" value={tariffaForzata} onChange={e => setTariffaForzata(e.target.value)} placeholder="Lascia vuoto per auto" />
          </div>
          <div className="form-group">
            <label>Data Arrivo</label>
            <input type="date" value={dal} onChange={e => setDal(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Data Partenza</label>
            <input type="date" value={al} onChange={e => setAl(e.target.value)} />
          </div>
          <div className="form-group full">
            <label>Extra / Servizi (€)</label>
            <input type="number" step="0.01" min="0" value={extra} onChange={e => setExtra(e.target.value)} placeholder="Es. 15.00 per corrente" />
          </div>
        </div>
      </div>

      {/* Right: Preview */}
      <div className="calc-preview-panel">
        <h2>Anteprima Ricevuta</h2>

        {!result ? (
          <div className="preview-empty">
            <span>🧮</span>
            <p>Compila lunghezza e date per vedere il calcolo</p>
          </div>
        ) : (
          <div className="receipt-preview">
            <div className="receipt-header">
              <div className="receipt-company">Porto Turistico Riva di Traiano S.p.A.</div>
              <div className="receipt-company-sub">Via Aurelia Km 67,580 · 00053 Civitavecchia (RM) · P.IVA 01234567890</div>
              <div className="receipt-num">Ricevuta {nextNumero}</div>
            </div>

            <div className="receipt-rows">
              <div className="receipt-row">
                <span className="label">Imbarcazione</span>
                <span className="value">{nome || '—'}</span>
              </div>
              <div className="receipt-row">
                <span className="label">Matricola</span>
                <span className="value">{matricola || '—'}</span>
              </div>
              <div className="receipt-row">
                <span className="label">Posto</span>
                <span className="value">{posto || '—'}</span>
              </div>
              <div className="receipt-row">
                <span className="label">Periodo</span>
                <span className="value">{dal || '—'} → {al || '—'}</span>
              </div>
              <hr className="receipt-divider" />
              <div className="receipt-row">
                <span className="label">Categoria</span>
                <span className="value">{result.categoria}</span>
              </div>
              <div className="receipt-row">
                <span className="label">Tariffa/giorno</span>
                <span className="value">€ {result.tariffaGg}</span>
              </div>
              <div className="receipt-row">
                <span className="label">Giorni</span>
                <span className="value">{result.giorni}</span>
              </div>
              <div className="receipt-row">
                <span className="label">Subtotale</span>
                <span className="value">€ {result.subtotale.toFixed(2)}</span>
              </div>
              {result.extra > 0 && (
                <div className="receipt-row">
                  <span className="label">Extra / Servizi</span>
                  <span className="value">€ {result.extra.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="receipt-total-row">
              <span className="total-label">Totale (IVA incl.)</span>
              <span className="total-value">€ {result.totale.toFixed(2)}</span>
            </div>

            <div className="receipt-payment-row">
              <button className={`payment-btn ${metodo === 'pos' ? 'selected' : ''}`} onClick={() => setMetodo('pos')}>💳 POS</button>
              <button className={`payment-btn ${metodo === 'contante' ? 'selected' : ''}`} onClick={() => setMetodo('contante')}>💵 Contante</button>
            </div>

            <div className="receipt-actions">
              <button className="btn btn-mode-entrata" style={{ flex: 1 }} onClick={handleEmetti}>
                Emetti Ricevuta
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
