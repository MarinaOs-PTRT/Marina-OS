import React, { useState, useMemo } from 'react'
import { TopBar } from '../../components/TopBar'
import { Omnibar } from '../../components/Omnibar'
import { useGlobalState } from '../../store/GlobalState'
import { Boat, Client } from '@shared/types'
import './RegistrazioneTransitiPage.css'

function getTariffaDaLunghezza(tariffe: any[], lunghezza: number) {
  const sorted = [...tariffe].sort((a, b) => a.lunMax - b.lunMax)
  for (const t of sorted) { if (lunghezza <= t.lunMax) return t }
  return sorted[sorted.length - 1]
}

export function RegistrazioneTransitiPage() {
  const {
    barche, clienti, tariffe, posti, movimenti, ricevute,
    addCliente, addBarca, updateBarca, addRicevuta, registraEntrata
  } = useGlobalState()

  // ── Barca selezionata ──
  const [selectedBoat, setSelectedBoat] = useState<Boat | null>(null)
  const [selectedPostoId, setSelectedPostoId] = useState('')

  // ── Step attivo ──
  const [step, setStep] = useState(0) // 0 = ricerca, 1 = persona, 2 = barca, 3 = pagamento

  // ── Dati Persona ──
  const [pNome, setPNome] = useState('')
  const [pCognome, setPCognome] = useState('')
  const [pTel, setPTel] = useState('')
  const [pIndirizzo, setPIndirizzo] = useState('')
  const [pNaz, setPNaz] = useState('')
  const [pDocTipo, setPDocTipo] = useState('Carta d\'identità')
  const [pDocNum, setPDocNum] = useState('')
  const [pLicenza, setPLicenza] = useState('')
  const [pEmail, setPEmail] = useState('')
  const [pTipoCliente, setPTipoCliente] = useState<'pf' | 'az'>('pf')
  const [pPiva, setPPiva] = useState('')
  const [pRagione, setPRagione] = useState('')
  const [existingClient, setExistingClient] = useState<Client | null>(null)

  // ── Dati Barca ──
  const [bNome, setBNome] = useState('')
  const [bMatricola, setBMatricola] = useState('')
  const [bTipo, setBTipo] = useState<Boat['tipo']>('Motore')
  const [bLunghezza, setBLunghezza] = useState('')
  const [bLarghezza, setBLarghezza] = useState('')
  const [bPescaggio, setBPescaggio] = useState('')
  const [bBandiera, setBBandiera] = useState('')
  const [bPortoIscr, setBPortoIscr] = useState('')
  const [bStazza, setBStazza] = useState('')

  // ── Pagamento ──
  const [dal, setDal] = useState(new Date().toISOString().split('T')[0])
  const [al, setAl] = useState('')
  const [extra, setExtra] = useState('')
  const [metodo, setMetodo] = useState<'contante' | 'pos' | 'bonifico'>('pos')

  // ── Errori e successo ──
  const [errore, setErrore] = useState('')
  const [completato, setCompletato] = useState(false)

  // ════════════════════════════════════════════
  // Omnibar seleziona una barca
  // ════════════════════════════════════════════
  const handleOmnibarSelect = (_action: string, data?: any) => {
    if (!data?.original) return
    const orig = data.original
    let boat: Boat | undefined

    if (orig.nome && orig.matricola !== undefined) {
      boat = orig as Boat
    } else if (orig.barcaOra) {
      boat = barche.find(b => b.nome === orig.barcaOra || b.posto === orig.id)
    }

    if (!boat) { setErrore('Barca non trovata nel sistema.'); return }

    setSelectedBoat(boat)
    setSelectedPostoId(boat.posto || '')

    // Precompila dati barca
    setBNome(boat.nome)
    setBMatricola(boat.matricola)
    setBTipo(boat.tipo)
    setBLunghezza(String(boat.lunghezza || ''))
    setBLarghezza(String(boat.larghezza || ''))
    setBPescaggio(String(boat.pescaggio || ''))
    setBBandiera(boat.bandiera || '')
    setBPortoIscr(boat.portoIscrizione || '')
    setBStazza(String(boat.stazzaGT || ''))

    // Controlla se il cliente esiste
    const cl = clienti.find(c => c.id === boat!.clientId)
    if (cl) {
      setExistingClient(cl)
      // Se è un cliente scheletro creato dal Tempo 1 (nome = "Transito — …"),
      // NON precompilare nome/cognome: l'operatore deve inserire i veri dati.
      const isScheletro = cl.nome.startsWith('Transito —') || cl.nome.startsWith('Transito -')
      if (isScheletro) {
        setPNome(''); setPCognome('')
      } else {
        setPNome(cl.nome.split(' ')[0] || '')
        setPCognome(cl.nome.split(' ').slice(1).join(' ') || '')
      }
      setPTel(cl.tel || '')
      setPIndirizzo(cl.indirizzo || '')
      setPNaz(cl.naz || '')
      setPDocTipo(cl.docTipo || 'Carta d\'identità')
      setPDocNum(cl.docNum || '')
      setPEmail(cl.email || '')
    }

    setStep(1)
    setErrore('')
  }

  // ════════════════════════════════════════════
  // Calcolo tariffa
  // ════════════════════════════════════════════
  const calcResult = useMemo(() => {
    const lun = parseFloat(bLunghezza) || 0
    if (!dal || !al || lun <= 0) return null
    const giorni = Math.max(0, Math.round((new Date(al).getTime() - new Date(dal).getTime()) / 86400000))
    if (giorni <= 0) return null
    const t = getTariffaDaLunghezza(tariffe, lun)
    const subtotale = t.prezzoGiorno * giorni
    const extraVal = parseFloat(extra) || 0
    return { categoria: t.categoria, tariffaGg: t.prezzoGiorno, giorni, subtotale, extra: extraVal, totale: subtotale + extraVal }
  }, [tariffe, bLunghezza, dal, al, extra])

  // ════════════════════════════════════════════
  // Validazioni step
  // ════════════════════════════════════════════
  const validateStep1 = () => {
    if (!pNome.trim() || !pCognome.trim()) return 'Nome e cognome sono obbligatori.'
    if (!pTel.trim()) return 'Il telefono è obbligatorio.'
    if (!pIndirizzo.trim()) return 'L\'indirizzo è obbligatorio.'
    if (!pDocNum.trim()) return 'Il numero del documento è obbligatorio.'
    if (!pLicenza.trim()) return 'La licenza di navigazione è obbligatoria.'
    if (pTipoCliente === 'az' && !pPiva.trim()) return 'La Partita IVA è obbligatoria per le aziende.'
    return null
  }

  const validateStep2 = () => {
    if (!bNome.trim()) return 'Il nome della barca è obbligatorio.'
    if (!bLunghezza || parseFloat(bLunghezza) <= 0) return 'La lunghezza è obbligatoria.'
    if (!bLarghezza || parseFloat(bLarghezza) <= 0) return 'La larghezza è obbligatoria.'
    if (!bPescaggio || parseFloat(bPescaggio) <= 0) return 'Il pescaggio è obbligatorio.'
    return null
  }

  // ════════════════════════════════════════════
  // Navigazione step
  // ════════════════════════════════════════════
  const goNext = () => {
    setErrore('')
    if (step === 1) {
      const err = validateStep1()
      if (err) { setErrore(err); return }
    } else if (step === 2) {
      const err = validateStep2()
      if (err) { setErrore(err); return }
    }
    setStep(s => s + 1)
  }

  const goBack = () => { setErrore(''); setStep(s => s - 1) }

  // ════════════════════════════════════════════
  // Conferma e Registra
  // ════════════════════════════════════════════
  const handleConfirm = () => {
    if (!calcResult) { setErrore('Compila le date per calcolare la tariffa.'); return }

    // 1. Crea/aggiorna cliente
    const clienteId = existingClient?.id || Date.now()
    const nomeCompleto = `${pNome.trim()} ${pCognome.trim()}`
    if (!existingClient) {
      const newClient: Client = {
        id: clienteId, tipo: pTipoCliente, nome: nomeCompleto,
        iniziali: `${pNome[0] || ''}${pCognome[0] || ''}`.toUpperCase(),
        naz: pNaz, docTipo: pDocTipo, docNum: pDocNum, tel: pTel,
        email: pEmail, indirizzo: pIndirizzo,
        ...(pTipoCliente === 'az' ? { piva: pPiva, ragione: pRagione || nomeCompleto } : {})
      }
      addCliente(newClient)
    }

    // 2. Aggiorna barca
    if (selectedBoat) {
      updateBarca(selectedBoat.id, {
        nome: bNome, matricola: bMatricola, tipo: bTipo,
        lunghezza: parseFloat(bLunghezza), larghezza: parseFloat(bLarghezza),
        pescaggio: parseFloat(bPescaggio), bandiera: bBandiera,
        portoIscrizione: bPortoIscr, stazzaGT: parseFloat(bStazza) || undefined,
        clientId: clienteId, tipologia: 'transito', registrazioneCompleta: true
      })
    }

    // 3. Emetti ricevuta
    const anno = new Date().getFullYear()
    const ultimoNumero = ricevute.length > 0
      ? Math.max(...ricevute.map(r => parseInt(r.numero.split('/')[1]) || 0))
      : 0
    const nextNum = `${anno}/${String(ultimoNumero + 1).padStart(4, '0')}`
    addRicevuta({
      numero: nextNum, data: new Date().toISOString().split('T')[0],
      nomeBarca: bNome, matricola: bMatricola, posto: selectedPostoId,
      periodo: `${dal} – ${al}`, giorni: calcResult.giorni,
      categoria: calcResult.categoria, tariffa: calcResult.tariffaGg,
      extra: calcResult.extra, totale: calcResult.totale,
      metodo, operatore: 'Operatore Torre'
    })

    setCompletato(true)
  }

  // ════════════════════════════════════════════
  // Stampa ricevuta
  // ════════════════════════════════════════════
  const handlePrint = () => { window.print() }

  // ════════════════════════════════════════════
  // Reset
  // ════════════════════════════════════════════
  const handleReset = () => {
    setSelectedBoat(null); setStep(0); setCompletato(false); setErrore('')
    setPNome(''); setPCognome(''); setPTel(''); setPIndirizzo(''); setPNaz('')
    setPDocTipo('Carta d\'identità'); setPDocNum(''); setPLicenza(''); setPEmail('')
    setPTipoCliente('pf'); setPPiva(''); setPRagione('')
    setBNome(''); setBMatricola(''); setBTipo('Motore'); setBLunghezza('')
    setBLarghezza(''); setBPescaggio(''); setBBandiera(''); setBPortoIscr(''); setBStazza('')
    setDal(new Date().toISOString().split('T')[0]); setAl(''); setExtra(''); setMetodo('pos')
    setExistingClient(null)
  }

  // ════════════════════════════════════════════
  // Tariffa in tempo reale (Step 2)
  // ════════════════════════════════════════════
  const tariffaPreview = useMemo(() => {
    const lun = parseFloat(bLunghezza) || 0
    if (lun <= 0) return null
    const t = getTariffaDaLunghezza(tariffe, lun)
    return `${t.categoria} — €${t.prezzoGiorno}/giorno`
  }, [tariffe, bLunghezza])

  // Steps label
  const steps = ['Ricerca', 'Dati Persona', 'Dati Barca', 'Pagamento']

  return (
    <>
      <TopBar title="Registrazione Transiti" />
      <div className="page-container reg-transiti-page">

        {/* Progress Bar */}
        {step > 0 && !completato && (
          <div className="reg-progress">
            {steps.map((s, i) => (
              <div key={i} className={`reg-progress-step ${i <= step ? 'active' : ''} ${i === step ? 'current' : ''}`}>
                <div className="reg-step-num">{i}</div>
                <span>{s}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── STEP 0: Ricerca ── */}
        {step === 0 && !completato && (
          <div className="reg-search-state">
            <div className="reg-search-icon">📋</div>
            <h2>Registrazione Transiti</h2>
            <p>Cerca la barca o il posto per completare la registrazione del transito.</p>
            <div className="reg-omnibar-wrap">
              <Omnibar onAction={handleOmnibarSelect} />
            </div>
            {errore && <div className="reg-error">{errore}</div>}
          </div>
        )}

        {/* ── STEP 1: Dati Persona ── */}
        {step === 1 && !completato && (
          <div className="reg-card">
            <h2>👤 Dati Comandante / Proprietario</h2>
            {selectedBoat && selectedBoat.registrazioneCompleta === false && (
              <div className="reg-info-banner" style={{ background: 'rgba(186,117,23,0.12)', color: 'var(--color-text-warning)', borderColor: 'var(--color-text-warning)' }}>
                ⏳ <strong>Registrazione incompleta (Tempo 1).</strong> L'ingresso è già stato registrato in Torre. Completa i dati del comandante e della barca per emettere la ricevuta.
              </div>
            )}
            {existingClient && !(selectedBoat && selectedBoat.registrazioneCompleta === false) && (
              <div className="reg-info-banner">ℹ️ Cliente già registrato nel sistema: <strong>{existingClient.nome}</strong>. Verifica e completa i dati.</div>
            )}
            {errore && <div className="reg-error">{errore}</div>}

            <div className="reg-tipo-row">
              <button className={`tipologia-btn ${pTipoCliente === 'pf' ? 'active socio' : ''}`} onClick={() => setPTipoCliente('pf')}>👤 Persona Fisica</button>
              <button className={`tipologia-btn ${pTipoCliente === 'az' ? 'active transito' : ''}`} onClick={() => setPTipoCliente('az')}>🏢 Azienda</button>
            </div>

            <div className="reg-form-grid">
              <div className="reg-field"><label>Nome *</label><input value={pNome} onChange={e => setPNome(e.target.value)} placeholder="Mario" /></div>
              <div className="reg-field"><label>Cognome *</label><input value={pCognome} onChange={e => setPCognome(e.target.value)} placeholder="Rossi" /></div>
              <div className="reg-field"><label>Telefono *</label><input type="tel" value={pTel} onChange={e => setPTel(e.target.value)} placeholder="+39 333 1234567" /></div>
              <div className="reg-field"><label>Email</label><input type="email" value={pEmail} onChange={e => setPEmail(e.target.value)} placeholder="mario@email.com" /></div>
              <div className="reg-field full"><label>Indirizzo *</label><input value={pIndirizzo} onChange={e => setPIndirizzo(e.target.value)} placeholder="Via Roma 1, 00100 Roma" /></div>
              <div className="reg-field"><label>Nazionalità</label><input value={pNaz} onChange={e => setPNaz(e.target.value)} placeholder="Italiana" /></div>
              <div className="reg-field"><label>Tipo Documento *</label>
                <select value={pDocTipo} onChange={e => setPDocTipo(e.target.value)}>
                  <option>Carta d'identità</option><option>Passaporto</option><option>Patente nautica</option>
                </select>
              </div>
              <div className="reg-field"><label>Numero Documento *</label><input value={pDocNum} onChange={e => setPDocNum(e.target.value)} placeholder="AB1234567" /></div>
              <div className="reg-field"><label>Licenza di Navigazione *</label><input value={pLicenza} onChange={e => setPLicenza(e.target.value)} placeholder="N. licenza" /></div>
              {pTipoCliente === 'az' && (
                <>
                  <div className="reg-field"><label>Ragione Sociale</label><input value={pRagione} onChange={e => setPRagione(e.target.value)} placeholder="Azienda SRL" /></div>
                  <div className="reg-field"><label>Partita IVA *</label><input value={pPiva} onChange={e => setPPiva(e.target.value)} placeholder="IT01234567890" /></div>
                </>
              )}
            </div>
            <div className="reg-actions">
              <button className="btn btn-outline" onClick={() => setStep(0)}>← Indietro</button>
              <button className="btn btn-mode-entrata" onClick={goNext}>Avanti →</button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Dati Barca ── */}
        {step === 2 && !completato && (
          <div className="reg-card">
            <h2>⛵ Dati Imbarcazione</h2>
            {errore && <div className="reg-error">{errore}</div>}
            <div className="reg-form-grid">
              <div className="reg-field"><label>Nome Barca *</label><input value={bNome} onChange={e => setBNome(e.target.value)} /></div>
              <div className="reg-field"><label>Matricola</label><input value={bMatricola} onChange={e => setBMatricola(e.target.value)} /></div>
              <div className="reg-field"><label>Tipo *</label>
                <select value={bTipo} onChange={e => setBTipo(e.target.value as Boat['tipo'])}>
                  <option>Motore</option><option>Vela</option><option>Catamarano</option><option>Gommone</option><option>Altro</option>
                </select>
              </div>
              <div className="reg-field"><label>Lunghezza (m) *</label><input type="number" step="0.1" value={bLunghezza} onChange={e => setBLunghezza(e.target.value)} /></div>
              <div className="reg-field"><label>Larghezza (m) *</label><input type="number" step="0.1" value={bLarghezza} onChange={e => setBLarghezza(e.target.value)} /></div>
              <div className="reg-field"><label>Pescaggio (m) *</label><input type="number" step="0.1" value={bPescaggio} onChange={e => setBPescaggio(e.target.value)} /></div>
              <div className="reg-field"><label>Bandiera</label><input value={bBandiera} onChange={e => setBBandiera(e.target.value)} /></div>
              <div className="reg-field"><label>Porto Iscrizione</label><input value={bPortoIscr} onChange={e => setBPortoIscr(e.target.value)} /></div>
              <div className="reg-field"><label>Stazza GT</label><input type="number" value={bStazza} onChange={e => setBStazza(e.target.value)} /></div>
            </div>
            {tariffaPreview && (
              <div className="reg-tariffa-preview">📊 Categoria rilevata: <strong>{tariffaPreview}</strong></div>
            )}
            <div className="reg-actions">
              <button className="btn btn-outline" onClick={goBack}>← Indietro</button>
              <button className="btn btn-mode-entrata" onClick={goNext}>Avanti →</button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Pagamento ── */}
        {step === 3 && !completato && (
          <div className="reg-card">
            <h2>💶 Assegnazione e Pagamento</h2>
            {errore && <div className="reg-error">{errore}</div>}
            <div className="reg-payment-layout">
              <div className="reg-payment-left">
                <div className="reg-field"><label>Posto Barca</label><input value={selectedPostoId} disabled className="reg-input-disabled" /></div>
                <div className="reg-field"><label>Data Arrivo</label><input type="date" value={dal} onChange={e => setDal(e.target.value)} /></div>
                <div className="reg-field"><label>Data Partenza Prevista</label><input type="date" value={al} onChange={e => setAl(e.target.value)} /></div>
                <div className="reg-field"><label>Extra / Servizi (€)</label><input type="number" step="0.01" value={extra} onChange={e => setExtra(e.target.value)} placeholder="Es. 15.00" /></div>
              </div>
              <div className="reg-payment-right" id="print-receipt">
                <h3>Anteprima Ricevuta</h3>
                {!calcResult ? (
                  <div className="reg-receipt-empty">🧮 Inserisci la data di partenza per vedere il calcolo</div>
                ) : (
                  <div className="receipt-preview">
                    <div className="receipt-header">
                      <div className="receipt-company">Porto Turistico Riva di Traiano S.p.A.</div>
                      <div className="receipt-company-sub">Via Aurelia Km 67,580 · Civitavecchia (RM)</div>
                    </div>
                    <div className="receipt-rows">
                      <div className="receipt-row"><span className="label">Imbarcazione</span><span className="value">{bNome}</span></div>
                      <div className="receipt-row"><span className="label">Matricola</span><span className="value">{bMatricola || '—'}</span></div>
                      <div className="receipt-row"><span className="label">Comandante</span><span className="value">{pNome} {pCognome}</span></div>
                      <div className="receipt-row"><span className="label">Posto</span><span className="value">{selectedPostoId}</span></div>
                      <div className="receipt-row"><span className="label">Periodo</span><span className="value">{dal} → {al}</span></div>
                      <hr className="receipt-divider" />
                      <div className="receipt-row"><span className="label">Categoria</span><span className="value">{calcResult.categoria}</span></div>
                      <div className="receipt-row"><span className="label">Tariffa/giorno</span><span className="value">€ {calcResult.tariffaGg}</span></div>
                      <div className="receipt-row"><span className="label">Giorni</span><span className="value">{calcResult.giorni}</span></div>
                      <div className="receipt-row"><span className="label">Subtotale</span><span className="value">€ {calcResult.subtotale.toFixed(2)}</span></div>
                      {calcResult.extra > 0 && (
                        <div className="receipt-row"><span className="label">Extra</span><span className="value">€ {calcResult.extra.toFixed(2)}</span></div>
                      )}
                    </div>
                    <div className="receipt-total-row">
                      <span className="total-label">Totale (IVA incl.)</span>
                      <span className="total-value">€ {calcResult.totale.toFixed(2)}</span>
                    </div>
                    <div className="receipt-payment-row">
                      <button className={`payment-btn ${metodo === 'pos' ? 'selected' : ''}`} onClick={() => setMetodo('pos')}>💳 POS</button>
                      <button className={`payment-btn ${metodo === 'contante' ? 'selected' : ''}`} onClick={() => setMetodo('contante')}>💵 Contante</button>
                      <button className={`payment-btn ${metodo === 'bonifico' ? 'selected' : ''}`} onClick={() => setMetodo('bonifico')}>🏦 Bonifico</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="reg-actions">
              <button className="btn btn-outline" onClick={goBack}>← Indietro</button>
              <button className="btn btn-mode-entrata" onClick={handleConfirm} disabled={!calcResult}>✅ Conferma e Registra</button>
            </div>
          </div>
        )}

        {/* ── COMPLETATO ── */}
        {completato && (
          <div className="reg-card reg-success">
            <div className="reg-success-icon">✅</div>
            <h2>Registrazione Completata</h2>
            <p>Il transito di <strong>{bNome}</strong> è stato registrato con successo al posto <strong>{selectedPostoId}</strong>.</p>
            {calcResult && <p className="reg-success-total">Totale incassato: <strong>€ {calcResult.totale.toFixed(2)}</strong> — {metodo === 'pos' ? 'POS' : metodo === 'contante' ? 'Contante' : 'Bonifico'}</p>}
            <div className="reg-actions">
              <button className="btn btn-outline" onClick={handlePrint}>🖨️ Stampa Ricevuta</button>
              <button className="btn btn-mode-entrata" onClick={handleReset}>📋 Nuova Registrazione</button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
