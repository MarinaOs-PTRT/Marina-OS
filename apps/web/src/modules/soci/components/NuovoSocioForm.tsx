import React, { useState, useMemo } from 'react'
import { useGlobalState } from '../../../store/GlobalState'
import { Client, Boat, OwnershipTitle } from '@shared/types'
import './NuovoSocioForm.css'

type Step = 'anagrafica' | 'barca' | 'posto' | 'conferma'
const STEPS: Step[] = ['anagrafica', 'barca', 'posto', 'conferma']
const STEP_LABELS: Record<Step, string> = {
  anagrafica: '1. Anagrafica',
  barca:      '2. Imbarcazione',
  posto:      '3. Posto Fisso',
  conferma:   '4. Conferma',
}

interface Props {
  onSuccess: (clienteId: number) => void
}

export function NuovoSocioForm({ onSuccess }: Props) {
  const { posti, registraNuovoSocio } = useGlobalState()
  const [step, setStep] = useState<Step>('anagrafica')
  const [errore, setErrore] = useState('')
  const [salvato, setSalvato] = useState(false)

  // ── Step 1: Anagrafica ──
  const [nome, setNome] = useState('')
  const [tipoCliente, setTipoCliente] = useState<'pf' | 'az'>('pf')
  const [tel, setTel] = useState('')
  const [email, setEmail] = useState('')
  const [cf, setCf] = useState('')
  const [piva, setPiva] = useState('')
  const [indirizzo, setIndirizzo] = useState('')
  const [note, setNote] = useState('')

  // ── Step 2: Barca ──
  const [nomeBarca, setNomeBarca] = useState('')
  const [matricola, setMatricola] = useState('')
  const [tipoBarca, setTipoBarca] = useState<Boat['tipo']>('Motore')
  const [lunghezza, setLunghezza] = useState('')
  const [larghezza, setLarghezza] = useState('')
  const [pescaggio, setPescaggio] = useState('')
  const [bandiera, setBandiera] = useState('Italia')
  const [modello, setModello] = useState('')
  const [anno, setAnno] = useState('')

  // ── Step 3: Posto ──
  const [postoId, setPostoId] = useState('')
  const [numeroPratica, setNumeroPratica] = useState('')
  const [dataAcquisizione, setDataAcquisizione] = useState(
    new Date().toISOString().slice(0, 10)
  )
  const [azioni, setAzioni] = useState('')
  const [catAzioni, setCatAzioni] = useState('A')
  const [canone, setCanone] = useState('')
  const [scadenzaCanone, setScadenzaCanone] = useState('')

  // Posti liberi disponibili (senza socioId)
  const postiDisponibili = useMemo(() =>
    posti
      .filter(p => !p.socioId && p.stato === 'libero')
      .sort((a, b) => a.id.localeCompare(b.id, 'it', { numeric: true })),
    [posti]
  )

  const postoSelezionato = useMemo(() =>
    posti.find(p => p.id === postoId),
    [posti, postoId]
  )

  // ── Navigazione step ──
  const stepIdx = STEPS.indexOf(step)

  const validateStep = (): boolean => {
    setErrore('')
    if (step === 'anagrafica') {
      if (!nome.trim()) { setErrore('Il nome è obbligatorio.'); return false }
      if (tipoCliente === 'pf' && cf.trim() && cf.trim().length !== 16) {
        setErrore('Il codice fiscale deve avere 16 caratteri.'); return false
      }
    }
    if (step === 'barca') {
      if (!nomeBarca.trim()) { setErrore('Il nome della barca è obbligatorio.'); return false }
      if (!matricola.trim()) { setErrore('La matricola è obbligatoria.'); return false }
      if (!lunghezza || parseFloat(lunghezza) <= 0) { setErrore('Inserisci una lunghezza valida.'); return false }
    }
    if (step === 'posto') {
      if (!postoId) { setErrore('Seleziona un posto fisso.'); return false }
      if (!numeroPratica.trim()) { setErrore('Inserisci il numero pratica / titolo.'); return false }
      if (!dataAcquisizione) { setErrore('Inserisci la data di acquisizione.'); return false }
      if (!azioni.trim() || isNaN(Number(azioni))) { setErrore('Inserisci le azioni (numero).'); return false }
    }
    return true
  }

  const goNext = () => {
    if (!validateStep()) return
    const next = STEPS[stepIdx + 1]
    if (next) setStep(next)
  }

  const goBack = () => {
    setErrore('')
    const prev = STEPS[stepIdx - 1]
    if (prev) setStep(prev)
  }

  const handleSubmit = () => {
    setErrore('')
    const iniziali = nome.trim().split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)

    const clienteData: Omit<Client, 'id'> = {
      tipo: 'so',
      nome: nome.trim(),
      iniziali,
      tel: tel || undefined,
      email: email || undefined,
      indirizzo: indirizzo || undefined,
      ...(tipoCliente === 'pf' ? { cf: cf || undefined } : { piva: piva || undefined }),
      posto: postoId,
    }

    const barcaData: Omit<Boat, 'id' | 'clientId'> = {
      nome: nomeBarca.trim(),
      matricola: matricola.toUpperCase(),
      tipo: tipoBarca,
      modello: modello || undefined,
      anno: anno ? parseInt(anno) : undefined,
      lunghezza: parseFloat(lunghezza),
      larghezza: larghezza ? parseFloat(larghezza) : 0,
      pescaggio: pescaggio ? parseFloat(pescaggio) : 0,
      bandiera: bandiera || 'Italia',
      posto: postoId,
      tipologia: 'socio',
      registrazioneCompleta: true,
    }

    const titoloData: Omit<OwnershipTitle, 'id' | 'clientId'> = {
      berthId: postoId,
      numero: numeroPratica.trim(),
      dataAcquisizione,
      azioni: parseInt(azioni),
      catAzioni,
      canone: canone || '—',
      scadenzaCanone: scadenzaCanone || '—',
    }

    const result = registraNuovoSocio({
      cliente: clienteData,
      barca: barcaData,
      titolo: titoloData,
    })

    if (!result.ok) {
      setErrore(result.errore || 'Errore durante la registrazione.')
      return
    }

    setSalvato(true)
    onSuccess(result.clienteId!)
  }

  // ── Render schermata successo ──
  if (salvato) {
    return (
      <div className="nsf-success">
        <div className="nsf-success-icon">✓</div>
        <h3>Socio registrato con successo!</h3>
        <p>
          <strong>{nome}</strong> è ora socio del porto con posto fisso <strong>{postoId}</strong>.
        </p>
        <p className="nsf-success-sub">
          Il posto è stato impostato in stato "Socio Assente".
          Al primo ingresso della barca, la Torre registrerà l'entrata normalmente.
        </p>
      </div>
    )
  }

  return (
    <div className="nsf-container">
      {/* Progress bar */}
      <div className="nsf-steps">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`nsf-step ${s === step ? 'active' : ''} ${i < stepIdx ? 'done' : ''}`}
          >
            <div className="nsf-step-dot">{i < stepIdx ? '✓' : i + 1}</div>
            <span className="nsf-step-label">{STEP_LABELS[s]}</span>
          </div>
        ))}
      </div>

      {/* Errore inline */}
      {errore && <div className="nsf-error">{errore}</div>}

      {/* ══════════════════ STEP 1 — ANAGRAFICA ══════════════════ */}
      {step === 'anagrafica' && (
        <div className="nsf-panel">
          <h3 className="nsf-panel-title">Dati anagrafici del socio</h3>

          <div className="nsf-type-selector">
            <button
              type="button"
              className={`nsf-type-btn ${tipoCliente === 'pf' ? 'active' : ''}`}
              onClick={() => setTipoCliente('pf')}
            >Persona Fisica</button>
            <button
              type="button"
              className={`nsf-type-btn ${tipoCliente === 'az' ? 'active' : ''}`}
              onClick={() => setTipoCliente('az')}
            >Azienda</button>
          </div>

          <div className="nsf-grid">
            <div className="form-group full">
              <label>{tipoCliente === 'pf' ? 'Nome e Cognome *' : 'Ragione Sociale *'}</label>
              <input
                type="text"
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder={tipoCliente === 'pf' ? 'Es. Mario Rossi' : 'Es. Nautica Rossi S.r.l.'}
                required
              />
            </div>

            {tipoCliente === 'pf' && (
              <div className="form-group">
                <label>Codice Fiscale</label>
                <input
                  type="text"
                  value={cf}
                  onChange={e => setCf(e.target.value.toUpperCase())}
                  placeholder="RSSMRA70A01H501Z"
                  maxLength={16}
                />
              </div>
            )}

            {tipoCliente === 'az' && (
              <div className="form-group">
                <label>Partita IVA</label>
                <input
                  type="text"
                  value={piva}
                  onChange={e => setPiva(e.target.value)}
                  placeholder="12345678901"
                />
              </div>
            )}

            <div className="form-group">
              <label>Telefono</label>
              <input type="tel" value={tel} onChange={e => setTel(e.target.value)} placeholder="+39 06 123456" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="mario@esempio.it" />
            </div>
            <div className="form-group full">
              <label>Indirizzo</label>
              <input type="text" value={indirizzo} onChange={e => setIndirizzo(e.target.value)} placeholder="Via Roma 1, 00100 Roma" />
            </div>
            <div className="form-group full">
              <label>Note / Riferimento contratto</label>
              <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Es. Pratica notarile n. 123/2026..." />
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ STEP 2 — BARCA ══════════════════ */}
      {step === 'barca' && (
        <div className="nsf-panel">
          <h3 className="nsf-panel-title">Imbarcazione del socio</h3>
          <div className="nsf-grid">
            <div className="form-group full">
              <label>Nome Imbarcazione *</label>
              <input
                type="text"
                value={nomeBarca}
                onChange={e => setNomeBarca(e.target.value)}
                placeholder="Es. M/Y Stella del Mare"
                required
              />
            </div>
            <div className="form-group">
              <label>Matricola *</label>
              <input
                type="text"
                value={matricola}
                onChange={e => setMatricola(e.target.value.toUpperCase())}
                placeholder="Es. IT-RM-1234"
                required
              />
            </div>
            <div className="form-group">
              <label>Tipo</label>
              <select value={tipoBarca} onChange={e => setTipoBarca(e.target.value as Boat['tipo'])}>
                <option value="Motore">Motore</option>
                <option value="Vela">Vela</option>
                <option value="Catamarano">Catamarano</option>
                <option value="Gommone">Gommone</option>
                <option value="Altro">Altro</option>
              </select>
            </div>
            <div className="form-group">
              <label>Modello</label>
              <input type="text" value={modello} onChange={e => setModello(e.target.value)} placeholder="Es. Azimut 55" />
            </div>
            <div className="form-group">
              <label>Anno costruzione</label>
              <input type="number" min="1950" max="2030" value={anno} onChange={e => setAnno(e.target.value)} placeholder="Es. 2015" />
            </div>
            <div className="form-group">
              <label>Lunghezza (m) *</label>
              <input type="number" step="0.1" min="1" value={lunghezza} onChange={e => setLunghezza(e.target.value)} placeholder="Es. 14.5" required />
            </div>
            <div className="form-group">
              <label>Larghezza (m)</label>
              <input type="number" step="0.1" min="1" value={larghezza} onChange={e => setLarghezza(e.target.value)} placeholder="Es. 4.2" />
            </div>
            <div className="form-group">
              <label>Pescaggio (m)</label>
              <input type="number" step="0.1" min="0" value={pescaggio} onChange={e => setPescaggio(e.target.value)} placeholder="Es. 1.8" />
            </div>
            <div className="form-group">
              <label>Bandiera</label>
              <input type="text" value={bandiera} onChange={e => setBandiera(e.target.value)} placeholder="Italia" />
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ STEP 3 — POSTO ══════════════════ */}
      {step === 'posto' && (
        <div className="nsf-panel">
          <h3 className="nsf-panel-title">Assegnazione posto fisso</h3>
          <div className="nsf-grid">
            <div className="form-group full">
              <label>Posto fisso acquistato *</label>
              <select value={postoId} onChange={e => setPostoId(e.target.value)} required>
                <option value="">Seleziona posto...</option>
                {postiDisponibili.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.id} — {p.pontile} · max {p.lunMax}m · {p.categoria}
                  </option>
                ))}
              </select>
            </div>

            {postoSelezionato && (
              <div className="nsf-posto-preview">
                <div className="nsf-posto-preview-row">
                  <span>Pontile</span><strong>{postoSelezionato.pontile}</strong>
                </div>
                <div className="nsf-posto-preview-row">
                  <span>Lunghezza max</span><strong>{postoSelezionato.lunMax} m</strong>
                </div>
                <div className="nsf-posto-preview-row">
                  <span>Larghezza max</span><strong>{postoSelezionato.larMax} m</strong>
                </div>
                <div className="nsf-posto-preview-row">
                  <span>Profondità</span><strong>{postoSelezionato.profondita} m</strong>
                </div>
                <div className="nsf-posto-preview-row">
                  <span>Categoria</span><strong>{postoSelezionato.categoria}</strong>
                </div>
                {lunghezza && parseFloat(lunghezza) > postoSelezionato.lunMax && (
                  <div className="nsf-posto-warning">
                    ⚠ La barca ({parseFloat(lunghezza)}m) supera la lunghezza massima del posto ({postoSelezionato.lunMax}m)
                  </div>
                )}
              </div>
            )}

            <div className="form-group">
              <label>N° Pratica / Titolo *</label>
              <input
                type="text"
                value={numeroPratica}
                onChange={e => setNumeroPratica(e.target.value)}
                placeholder="Es. PTRT-2026-0123"
                required
              />
            </div>
            <div className="form-group">
              <label>Data acquisizione *</label>
              <input type="date" value={dataAcquisizione} onChange={e => setDataAcquisizione(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Numero azioni *</label>
              <input
                type="number"
                min="1"
                value={azioni}
                onChange={e => setAzioni(e.target.value)}
                placeholder="Es. 100"
                required
              />
            </div>
            <div className="form-group">
              <label>Categoria azioni</label>
              <select value={catAzioni} onChange={e => setCatAzioni(e.target.value)}>
                <option value="A">Categoria A</option>
                <option value="B">Categoria B</option>
                <option value="C">Categoria C</option>
              </select>
            </div>
            <div className="form-group">
              <label>Canone annuo (€)</label>
              <input type="text" value={canone} onChange={e => setCanone(e.target.value)} placeholder="Es. 3.200,00" />
            </div>
            <div className="form-group">
              <label>Scadenza canone</label>
              <input type="date" value={scadenzaCanone} onChange={e => setScadenzaCanone(e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ STEP 4 — CONFERMA ══════════════════ */}
      {step === 'conferma' && (
        <div className="nsf-panel">
          <h3 className="nsf-panel-title">Riepilogo e conferma</h3>
          <div className="nsf-summary-grid">
            <div className="nsf-summary-section">
              <div className="nsf-summary-section-title">Socio</div>
              <div className="nsf-summary-row"><span>Nome</span><strong>{nome}</strong></div>
              <div className="nsf-summary-row"><span>Tipo</span><strong>{tipoCliente === 'pf' ? 'Persona Fisica' : 'Azienda'}</strong></div>
              {tel && <div className="nsf-summary-row"><span>Tel</span><strong>{tel}</strong></div>}
              {email && <div className="nsf-summary-row"><span>Email</span><strong>{email}</strong></div>}
              {cf && <div className="nsf-summary-row"><span>C.F.</span><strong>{cf}</strong></div>}
              {piva && <div className="nsf-summary-row"><span>P.IVA</span><strong>{piva}</strong></div>}
            </div>

            <div className="nsf-summary-section">
              <div className="nsf-summary-section-title">Imbarcazione</div>
              <div className="nsf-summary-row"><span>Nome</span><strong>{nomeBarca}</strong></div>
              <div className="nsf-summary-row"><span>Matricola</span><strong>{matricola.toUpperCase()}</strong></div>
              <div className="nsf-summary-row"><span>Tipo</span><strong>{tipoBarca}</strong></div>
              <div className="nsf-summary-row"><span>Lunghezza</span><strong>{lunghezza} m</strong></div>
              {modello && <div className="nsf-summary-row"><span>Modello</span><strong>{modello}</strong></div>}
            </div>

            <div className="nsf-summary-section">
              <div className="nsf-summary-section-title">Posto Fisso</div>
              <div className="nsf-summary-row"><span>Posto</span><strong>{postoId}</strong></div>
              <div className="nsf-summary-row"><span>N° Pratica</span><strong>{numeroPratica}</strong></div>
              <div className="nsf-summary-row"><span>Data acquisto</span><strong>{dataAcquisizione}</strong></div>
              <div className="nsf-summary-row"><span>Azioni</span><strong>{azioni} ({catAzioni})</strong></div>
              {canone && <div className="nsf-summary-row"><span>Canone</span><strong>€ {canone}</strong></div>}
            </div>
          </div>

          <div className="nsf-confirm-notice">
            Confermando, <strong>{nome}</strong> verrà registrato come socio PTRT S.p.A. con posto fisso <strong>{postoId}</strong>.
            Il posto verrà impostato in stato <em>Socio Assente</em>.
          </div>
        </div>
      )}

      {/* ── Azioni navigazione ── */}
      <div className="nsf-actions">
        {stepIdx > 0 && (
          <button type="button" className="btn btn-outline" onClick={goBack}>← Indietro</button>
        )}
        <div style={{ flex: 1 }} />
        {step !== 'conferma' && (
          <button type="button" className="btn btn-primary" onClick={goNext}>
            Avanti →
          </button>
        )}
        {step === 'conferma' && (
          <button type="button" className="btn btn-mode-entrata" onClick={handleSubmit}>
            ✓ Registra Socio
          </button>
        )}
      </div>
    </div>
  )
}
