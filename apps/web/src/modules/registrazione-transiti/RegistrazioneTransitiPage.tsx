import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { TopBar } from '../../components/TopBar'
import { Omnibar } from '../../components/Omnibar'
import { useGlobalState } from '../../store/GlobalState'
import { Boat, Client } from '@shared/types'
import './RegistrazioneTransitiPage.css'

/**
 * Ritorna la prima tariffa compatibile (lunghezza <= lunMax) dopo aver
 * ordinato in modo crescente per lunMax. Vedi Master File §4 — Calcolo Tariffe.
 *
 * Ritorna `null` se la lunghezza non è valida (0, NaN, negativa) o se
 * l'elenco tariffe è vuoto. Il chiamante DEVE gestire il caso null.
 */
function getTariffaDaLunghezza(tariffe: any[], lunghezza: number) {
  if (!Number.isFinite(lunghezza) || lunghezza <= 0) return null
  if (!tariffe || tariffe.length === 0) return null
  const sorted = [...tariffe].sort((a, b) => a.lunMax - b.lunMax)
  for (const t of sorted) { if (lunghezza <= t.lunMax) return t }
  return sorted[sorted.length - 1]
}

// ── Tipi interni ───────────────────────────────────────────
type StatoAnagrafica = 'nessuna' | 'incompleta' | 'completa'

export function RegistrazioneTransitiPage() {
  const {
    barche, clienti, tariffe, ricevute, autorizzazioni,
    addCliente, updateBarca, addRicevuta
    // NON importiamo registraEntrata: il movimento è già stato registrato
    // al Tempo 1 dal QuickMovementPanel. Questa pagina completa
    // anagrafica + ricevuta (Tempo 2).
  } = useGlobalState()

  // ── Selezione barca ──
  const [selectedBoat, setSelectedBoat] = useState<Boat | null>(null)
  const [selectedPostoId, setSelectedPostoId] = useState('')
  const [existingClient, setExistingClient] = useState<Client | null>(null)

  // ── Dati Comandante ──
  const [pNome, setPNome] = useState('')
  const [pCognome, setPCognome] = useState('')
  const [pTel, setPTel] = useState('')
  const [pIndirizzo, setPIndirizzo] = useState('')
  const [pNaz, setPNaz] = useState('')
  const [pDocTipo, setPDocTipo] = useState("Carta d'identità")
  const [pDocNum, setPDocNum] = useState('')
  const [pLicenza, setPLicenza] = useState('')
  const [pEmail, setPEmail] = useState('')
  const [pTipoCliente, setPTipoCliente] = useState<'pf' | 'az'>('pf')
  const [pPiva, setPPiva] = useState('')
  const [pRagione, setPRagione] = useState('')

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

  // ── Feedback UI ──
  const [erroreAnagrafica, setErroreAnagrafica] = useState('')
  const [erroreCassa, setErroreCassa] = useState('')
  const [salvatoOk, setSalvatoOk] = useState(false)
  const [completato, setCompletato] = useState(false)
  const [erroreOmnibar, setErroreOmnibar] = useState('')

  // ════════════════════════════════════════════
  // Stato anagrafica (badge)
  // ════════════════════════════════════════════
  const statoAnagrafica: StatoAnagrafica = useMemo(() => {
    if (!selectedBoat) return 'nessuna'
    const campiOk =
      pNome.trim() && pCognome.trim() && pTel.trim() &&
      pIndirizzo.trim() && pDocNum.trim() && pLicenza.trim() &&
      bNome.trim() && parseFloat(bLunghezza) > 0 &&
      parseFloat(bLarghezza) > 0 && parseFloat(bPescaggio) > 0
    return campiOk ? 'completa' : 'incompleta'
  }, [selectedBoat, pNome, pCognome, pTel, pIndirizzo, pDocNum, pLicenza,
    bNome, bLunghezza, bLarghezza, bPescaggio])

  // ════════════════════════════════════════════
  // Calcolo tariffa (reattivo)
  // ════════════════════════════════════════════
  const calcResult = useMemo(() => {
    const lun = parseFloat(bLunghezza) || 0
    if (!dal || !al || lun <= 0) return null
    const giorni = Math.max(0, Math.round(
      (new Date(al).getTime() - new Date(dal).getTime()) / 86400000
    ))
    if (giorni <= 0) return null
    const t = getTariffaDaLunghezza(tariffe, lun)
    if (!t) return null
    const subtotale = t.prezzoGiorno * giorni
    const extraVal = parseFloat(extra) || 0
    return {
      categoria: t.categoria,
      tariffaGg: t.prezzoGiorno,
      giorni,
      subtotale,
      extra: extraVal,
      totale: subtotale + extraVal
    }
  }, [tariffe, bLunghezza, dal, al, extra])

  const tariffaPreview = useMemo(() => {
    const lun = parseFloat(bLunghezza) || 0
    if (lun <= 0) return null
    const t = getTariffaDaLunghezza(tariffe, lun)
    if (!t) return null
    return `${t.categoria} — €${t.prezzoGiorno}/giorno`
  }, [tariffe, bLunghezza])

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

    if (!boat) { setErroreOmnibar('Barca non trovata nel sistema.'); return }

    setSelectedBoat(boat)
    setSelectedPostoId(boat.posto || '')
    setSalvatoOk(false)
    setErroreAnagrafica('')
    setErroreCassa('')
    setErroreOmnibar('')
    setCompletato(false)

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

    // Precompila dati cliente
    const cl = clienti.find(c => c.id === boat!.clientId)
    if (cl) {
      setExistingClient(cl)
      const isScheletro = cl.nome.startsWith('Transito —') || cl.nome.startsWith('Transito -')
      if (isScheletro) {
        // Scheletro Tempo 1: lascia nome/cognome vuoti — operatore inserisce i veri dati
        setPNome(''); setPCognome('')
      } else {
        setPNome(cl.nome.split(' ')[0] || '')
        setPCognome(cl.nome.split(' ').slice(1).join(' ') || '')
      }
      setPTel(cl.tel || '')
      setPIndirizzo(cl.indirizzo || '')
      setPNaz(cl.naz || '')
      setPDocTipo(cl.docTipo || "Carta d'identità")
      setPDocNum(cl.docNum || '')
      setPEmail(cl.email || '')
      setPLicenza((cl as any).licenza || '')
    } else {
      setExistingClient(null)
      setPNome(''); setPCognome(''); setPTel(''); setPIndirizzo('')
      setPNaz(''); setPDocTipo("Carta d'identità"); setPDocNum('')
      setPLicenza(''); setPEmail(''); setPTipoCliente('pf')
      setPPiva(''); setPRagione('')
    }
  }

  // ════════════════════════════════════════════
  // Pre-selezione da query param :boatId (25 Apr 2026)
  // Quando l'utente arriva da Pendenti cliccando "Completa →" sulla
  // Dashboard, l'URL è /completa-registrazione/:boatId. Carichiamo la
  // boat corrispondente UNA SOLA VOLTA al mount usando lo stesso flusso
  // di handleOmnibarSelect (per riusare tutta la pre-popolazione).
  // ════════════════════════════════════════════
  const { boatId } = useParams<{ boatId?: string }>()
  const prefilledRef = useRef(false)
  useEffect(() => {
    if (prefilledRef.current) return
    if (!boatId) return
    const id = parseInt(boatId, 10)
    if (!Number.isFinite(id)) return
    const boat = barche.find(b => b.id === id)
    if (!boat) return
    handleOmnibarSelect('select', { original: boat })
    prefilledRef.current = true
  }, [boatId, barche])

  // ════════════════════════════════════════════
  // Tipo di registrazione (transito vs affittuario)
  // L'affittuario non passa per la cassa interna — paga col canone fra
  // beneficiario e socio proprietario, fuori dal nostro sistema.
  // Quindi nella pagina nascondiamo l'intera sezione Cassa quando la
  // boat selezionata è un affittuario.
  // ════════════════════════════════════════════
  const isAffittuario = selectedBoat?.tipologia === 'affittuario'

  // ════════════════════════════════════════════
  // Validazioni
  // ════════════════════════════════════════════
  const validateAnagrafica = (): string | null => {
    if (!pNome.trim() || !pCognome.trim()) return 'Nome e cognome sono obbligatori.'
    if (!pTel.trim()) return 'Il telefono è obbligatorio.'
    if (!pIndirizzo.trim()) return "L'indirizzo è obbligatorio."
    if (!pDocNum.trim()) return 'Il numero del documento è obbligatorio.'
    if (!pLicenza.trim()) return 'La licenza di navigazione è obbligatoria.'
    if (!bNome.trim()) return 'Il nome della barca è obbligatorio.'
    if (!bLunghezza || parseFloat(bLunghezza) <= 0) return 'La lunghezza è obbligatoria e deve essere > 0.'
    if (!bLarghezza || parseFloat(bLarghezza) <= 0) return 'La larghezza è obbligatoria e deve essere > 0.'
    if (!bPescaggio || parseFloat(bPescaggio) <= 0) return 'Il pescaggio è obbligatorio e deve essere > 0.'
    if (pTipoCliente === 'az' && !pPiva.trim()) return 'La Partita IVA è obbligatoria per le aziende.'
    return null
  }

  // ════════════════════════════════════════════
  // Salva Anagrafica (senza emettere ricevuta)
  // ════════════════════════════════════════════
  const handleSalvaAnagrafica = () => {
    setErroreAnagrafica('')
    const err = validateAnagrafica()
    if (err) { setErroreAnagrafica(err); return }

    const clienteId = existingClient?.id || Date.now()
    const nomeCompleto = `${pNome.trim()} ${pCognome.trim()}`

    if (!existingClient) {
      const newClient: Client = {
        id: clienteId, tipo: pTipoCliente, nome: nomeCompleto,
        iniziali: `${pNome[0] || ''}${pCognome[0] || ''}`.toUpperCase(),
        naz: pNaz, docTipo: pDocTipo, docNum: pDocNum,
        tel: pTel, email: pEmail, indirizzo: pIndirizzo,
        ...(pTipoCliente === 'az' ? { piva: pPiva, ragione: pRagione || nomeCompleto } : {})
      }
      addCliente(newClient)
    }

    if (selectedBoat) {
      updateBarca(selectedBoat.id, {
        nome: bNome, matricola: bMatricola, tipo: bTipo,
        lunghezza: parseFloat(bLunghezza),
        larghezza: parseFloat(bLarghezza),
        pescaggio: parseFloat(bPescaggio),
        bandiera: bBandiera, portoIscrizione: bPortoIscr,
        stazzaGT: parseFloat(bStazza) || undefined,
        clientId: clienteId, tipologia: 'transito',
        registrazioneCompleta: true
      })
      // Aggiorna la barca locale per riflettere il nuovo stato
      setSelectedBoat(prev => prev ? { ...prev, registrazioneCompleta: true } : prev)
    }

    setSalvatoOk(true)
  }

  // ════════════════════════════════════════════
  // Conferma e Incassa (emette ricevuta)
  // ════════════════════════════════════════════
  const handleConfirm = () => {
    setErroreCassa('')
    if (!calcResult) { setErroreCassa('Compila le date per calcolare la tariffa.'); return }

    // Salva anche l'anagrafica se non era già stata salvata
    const errA = validateAnagrafica()
    if (errA) { setErroreCassa(`Completa l'anagrafica prima di incassare: ${errA}`); return }

    const clienteId = existingClient?.id || Date.now()
    const nomeCompleto = `${pNome.trim()} ${pCognome.trim()}`
    if (!existingClient) {
      const newClient: Client = {
        id: clienteId, tipo: pTipoCliente, nome: nomeCompleto,
        iniziali: `${pNome[0] || ''}${pCognome[0] || ''}`.toUpperCase(),
        naz: pNaz, docTipo: pDocTipo, docNum: pDocNum,
        tel: pTel, email: pEmail, indirizzo: pIndirizzo,
        ...(pTipoCliente === 'az' ? { piva: pPiva, ragione: pRagione || nomeCompleto } : {})
      }
      addCliente(newClient)
    }

    if (selectedBoat) {
      updateBarca(selectedBoat.id, {
        nome: bNome, matricola: bMatricola, tipo: bTipo,
        lunghezza: parseFloat(bLunghezza), larghezza: parseFloat(bLarghezza),
        pescaggio: parseFloat(bPescaggio), bandiera: bBandiera,
        portoIscrizione: bPortoIscr, stazzaGT: parseFloat(bStazza) || undefined,
        clientId: clienteId, tipologia: 'transito', registrazioneCompleta: true
      })
    }

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
      metodo, operatore: 'Operatore Ufficio'
    })

    setCompletato(true)
  }

  // ════════════════════════════════════════════
  // Reset
  // ════════════════════════════════════════════
  const handleReset = () => {
    setSelectedBoat(null); setSelectedPostoId(''); setExistingClient(null)
    setPNome(''); setPCognome(''); setPTel(''); setPIndirizzo(''); setPNaz('')
    setPDocTipo("Carta d'identità"); setPDocNum(''); setPLicenza(''); setPEmail('')
    setPTipoCliente('pf'); setPPiva(''); setPRagione('')
    setBNome(''); setBMatricola(''); setBTipo('Motore'); setBLunghezza('')
    setBLarghezza(''); setBPescaggio(''); setBBandiera(''); setBPortoIscr(''); setBStazza('')
    setDal(new Date().toISOString().split('T')[0]); setAl(''); setExtra(''); setMetodo('pos')
    setErroreAnagrafica(''); setErroreCassa(''); setSalvatoOk(false)
    setCompletato(false); setErroreOmnibar('')
  }

  const handlePrint = () => { window.print() }

  // ════════════════════════════════════════════
  // Badge anagrafica
  // ════════════════════════════════════════════
  const BadgeAnagrafica = () => {
    if (!selectedBoat) return null
    if (statoAnagrafica === 'completa') {
      return <span className="reg-badge reg-badge-completa">✓ Anagrafica completa</span>
    }
    return <span className="reg-badge reg-badge-incompleta">⚠ Anagrafica incompleta</span>
  }

  // ════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════
  return (
    <>
      <TopBar title="Registrazione Transiti" />
      <div className="page-container reg-transiti-page">

        {/* ── Schermata di completamento ── */}
        {completato && (
          <div className="reg-card reg-success">
            <div className="reg-success-icon">✅</div>
            <h2>Registrazione Completata</h2>
            <p>
              Il transito di <strong>{bNome}</strong> è stato registrato con successo
              {selectedPostoId && <> al posto <strong>{selectedPostoId}</strong></>}.
            </p>
            {calcResult && (
              <p className="reg-success-total">
                Totale incassato: <strong>€ {calcResult.totale.toFixed(2)}</strong>
                {' '}—{' '}
                {metodo === 'pos' ? 'POS' : metodo === 'contante' ? 'Contante' : 'Bonifico'}
              </p>
            )}
            <div className="reg-actions reg-actions-centered">
              <button className="btn btn-outline" onClick={handlePrint}>🖨️ Stampa Ricevuta</button>
              <button className="btn btn-mode-entrata" onClick={handleReset}>📋 Nuova Registrazione</button>
            </div>
          </div>
        )}

        {/* ── Riquadro unico: Omnibar + due colonne ── */}
        {!completato && (
          <div className="reg-main-card">

            {/* Omnibar header del riquadro */}
            <div className="reg-main-card-header">
              <div className="reg-omnibar-wrap">
                <Omnibar onAction={handleOmnibarSelect} />
              </div>
              {erroreOmnibar && <div className="reg-error" style={{ marginTop: 'var(--space-sm)' }}>{erroreOmnibar}</div>}
              {selectedBoat && (
                <div className="reg-selected-summary">
                  <span className="reg-selected-label">Selezionata:</span>
                  <strong>{bNome}</strong>
                  {selectedPostoId && <span className="reg-selected-posto">· Posto {selectedPostoId}</span>}
                  <BadgeAnagrafica />
                  {salvatoOk && <span className="reg-badge-saved">✅ Anagrafica salvata</span>}
                </div>
              )}
              {!selectedBoat && (
                <p className="reg-omnibar-hint">Cerca per nome barca, matricola, comandante o posto per pre-popolare i campi.</p>
              )}
            </div>

            {/* Divisore */}
            <div className="reg-main-card-divider" />

            {/* Due colonne */}
            <div className="reg-dashboard">

            {/* ═══════════════════════════════════════
                COLONNA SINISTRA — Anagrafica
            ═══════════════════════════════════════ */}
            <div className="reg-panel reg-panel-anagrafica">
              <div className="reg-panel-header">
                <h2>👤 Anagrafica</h2>
                <BadgeAnagrafica />
              </div>

              {selectedBoat?.registrazioneCompleta === false && (
                <div className="reg-info-banner reg-banner-warning">
                  ⏳ <strong>Tempo 1 completato.</strong> L'ingresso è già stato registrato in Torre.
                  Completa i dati del comandante e dell'imbarcazione.
                </div>
              )}
              {existingClient && selectedBoat?.registrazioneCompleta !== false && (
                <div className="reg-info-banner">
                  ℹ️ Cliente già presente: <strong>{existingClient.nome}</strong>. Verifica e aggiorna se necessario.
                </div>
              )}

              {erroreAnagrafica && <div className="reg-error">{erroreAnagrafica}</div>}

              {/* Tipo cliente */}
              <div className="reg-tipo-row">
                <button
                  className={`tipologia-btn ${pTipoCliente === 'pf' ? 'active socio' : ''}`}
                  onClick={() => setPTipoCliente('pf')}
                >👤 Persona Fisica</button>
                <button
                  className={`tipologia-btn ${pTipoCliente === 'az' ? 'active transito' : ''}`}
                  onClick={() => setPTipoCliente('az')}
                >🏢 Azienda</button>
              </div>

              {/* ── Dati Comandante ── */}
              <div className="reg-subsection-label">Comandante / Proprietario</div>
              <div className="reg-form-grid">
                <div className="reg-field">
                  <label>Nome *</label>
                  <input value={pNome} onChange={e => setPNome(e.target.value)} placeholder="Mario" />
                </div>
                <div className="reg-field">
                  <label>Cognome *</label>
                  <input value={pCognome} onChange={e => setPCognome(e.target.value)} placeholder="Rossi" />
                </div>
                <div className="reg-field">
                  <label>Telefono *</label>
                  <input type="tel" value={pTel} onChange={e => setPTel(e.target.value)} placeholder="+39 333 1234567" />
                </div>
                <div className="reg-field">
                  <label>Email</label>
                  <input type="email" value={pEmail} onChange={e => setPEmail(e.target.value)} placeholder="mario@email.com" />
                </div>
                <div className="reg-field full">
                  <label>Indirizzo *</label>
                  <input value={pIndirizzo} onChange={e => setPIndirizzo(e.target.value)} placeholder="Via Roma 1, 00100 Roma" />
                </div>
                <div className="reg-field">
                  <label>Nazionalità</label>
                  <input value={pNaz} onChange={e => setPNaz(e.target.value)} placeholder="Italiana" />
                </div>
                <div className="reg-field">
                  <label>Tipo Documento *</label>
                  <select value={pDocTipo} onChange={e => setPDocTipo(e.target.value)}>
                    <option>Carta d'identità</option>
                    <option>Passaporto</option>
                    <option>Patente nautica</option>
                  </select>
                </div>
                <div className="reg-field">
                  <label>Numero Documento *</label>
                  <input value={pDocNum} onChange={e => setPDocNum(e.target.value)} placeholder="AB1234567" />
                </div>
                <div className="reg-field">
                  <label>Licenza di Navigazione *</label>
                  <input value={pLicenza} onChange={e => setPLicenza(e.target.value)} placeholder="N. licenza" />
                </div>
                {pTipoCliente === 'az' && (
                  <>
                    <div className="reg-field">
                      <label>Ragione Sociale</label>
                      <input value={pRagione} onChange={e => setPRagione(e.target.value)} placeholder="Azienda SRL" />
                    </div>
                    <div className="reg-field">
                      <label>Partita IVA *</label>
                      <input value={pPiva} onChange={e => setPPiva(e.target.value)} placeholder="IT01234567890" />
                    </div>
                  </>
                )}
              </div>

              {/* ── Dati Imbarcazione ── */}
              <div className="reg-subsection-label" style={{ marginTop: 'var(--space-lg)' }}>Imbarcazione</div>
              <div className="reg-form-grid">
                <div className="reg-field">
                  <label>Nome Barca *</label>
                  <input value={bNome} onChange={e => setBNome(e.target.value)} />
                </div>
                <div className="reg-field">
                  <label>Matricola</label>
                  <input value={bMatricola} onChange={e => setBMatricola(e.target.value.toUpperCase())} />
                </div>
                <div className="reg-field">
                  <label>Tipo *</label>
                  <select value={bTipo} onChange={e => setBTipo(e.target.value as Boat['tipo'])}>
                    <option>Motore</option>
                    <option>Vela</option>
                    <option>Catamarano</option>
                    <option>Gommone</option>
                    <option>Altro</option>
                  </select>
                </div>
                <div className="reg-field">
                  <label>Lunghezza (m) *</label>
                  <input type="number" step="0.1" value={bLunghezza} onChange={e => setBLunghezza(e.target.value)} />
                </div>
                <div className="reg-field">
                  <label>Larghezza (m) *</label>
                  <input type="number" step="0.1" value={bLarghezza} onChange={e => setBLarghezza(e.target.value)} />
                </div>
                <div className="reg-field">
                  <label>Pescaggio (m) *</label>
                  <input type="number" step="0.1" value={bPescaggio} onChange={e => setBPescaggio(e.target.value)} />
                </div>
                <div className="reg-field">
                  <label>Bandiera</label>
                  <input value={bBandiera} onChange={e => setBBandiera(e.target.value)} />
                </div>
                <div className="reg-field">
                  <label>Porto Iscrizione</label>
                  <input value={bPortoIscr} onChange={e => setBPortoIscr(e.target.value)} />
                </div>
                <div className="reg-field">
                  <label>Stazza GT</label>
                  <input type="number" value={bStazza} onChange={e => setBStazza(e.target.value)} />
                </div>
              </div>

              {tariffaPreview && (
                <div className="reg-tariffa-preview">
                  📊 Categoria rilevata: <strong>{tariffaPreview}</strong>
                </div>
              )}

              <div className="reg-actions">
                <button className="btn btn-outline" onClick={handleReset}>✕ Annulla</button>
                <button className="btn btn-mode-entrata" onClick={handleSalvaAnagrafica}>
                  💾 Salva Anagrafica
                </button>
              </div>
            </div>

            {/* ═══════════════════════════════════════
                COLONNA DESTRA — Cassa / Pagamento (TRANSITI)
                Nascosta per affittuari: l'affittuario paga il canone
                fra beneficiario e socio proprietario, fuori dal nostro
                sistema. A noi basta l'autorizzazione.
                Vedi memoria: registrazione_pendente_pattern.md
            ═══════════════════════════════════════ */}
            {!isAffittuario && (
            <div className="reg-panel reg-panel-cassa">
              <div className="reg-panel-header">
                <h2>💶 Cassa</h2>
              </div>

              {erroreCassa && <div className="reg-error">{erroreCassa}</div>}

              <div className="reg-subsection-label">Periodo di permanenza</div>
              <div className="reg-form-grid reg-form-grid-single">
                <div className="reg-field">
                  <label>Posto Barca</label>
                  <input value={selectedPostoId} disabled className="reg-input-disabled" />
                </div>
                <div className="reg-field">
                  <label>Data Arrivo</label>
                  <input type="date" value={dal} onChange={e => setDal(e.target.value)} />
                </div>
                <div className="reg-field">
                  <label>Data Partenza Prevista</label>
                  <input type="date" value={al} onChange={e => setAl(e.target.value)} />
                </div>
                <div className="reg-field">
                  <label>Extra / Servizi (€)</label>
                  <input
                    type="number" step="0.01" value={extra}
                    onChange={e => setExtra(e.target.value)}
                    placeholder="Es. 15.00"
                  />
                </div>
              </div>

              {/* Anteprima Ricevuta */}
              <div className="reg-subsection-label" style={{ marginTop: 'var(--space-lg)' }}>
                Anteprima Ricevuta
              </div>
              <div id="print-receipt">
                {!calcResult ? (
                  <div className="reg-receipt-empty">
                    🧮 {(() => {
                      const lun = parseFloat(bLunghezza) || 0
                      if (lun <= 0) return 'Inserisci la lunghezza nella sezione Anagrafica.'
                      if (!al) return 'Inserisci la data di partenza per calcolare.'
                      return "La data di partenza deve essere successiva all'arrivo."
                    })()}
                  </div>
                ) : (
                  <div className="receipt-preview">
                    <div className="receipt-header">
                      <div className="receipt-company">Porto Turistico Riva di Traiano S.p.A.</div>
                      <div className="receipt-company-sub">Via Aurelia Km 67,580 · Civitavecchia (RM)</div>
                    </div>
                    <div className="receipt-rows">
                      <div className="receipt-row">
                        <span className="label">Imbarcazione</span>
                        <span className="value">{bNome}</span>
                      </div>
                      <div className="receipt-row">
                        <span className="label">Matricola</span>
                        <span className="value">{bMatricola || '—'}</span>
                      </div>
                      <div className="receipt-row">
                        <span className="label">Comandante</span>
                        <span className="value">{pNome} {pCognome}</span>
                      </div>
                      <div className="receipt-row">
                        <span className="label">Posto</span>
                        <span className="value">{selectedPostoId || '—'}</span>
                      </div>
                      <div className="receipt-row">
                        <span className="label">Periodo</span>
                        <span className="value">{dal} → {al}</span>
                      </div>
                      <hr className="receipt-divider" />
                      <div className="receipt-row">
                        <span className="label">Categoria</span>
                        <span className="value">{calcResult.categoria}</span>
                      </div>
                      <div className="receipt-row">
                        <span className="label">Tariffa/giorno</span>
                        <span className="value">€ {calcResult.tariffaGg}</span>
                      </div>
                      <div className="receipt-row">
                        <span className="label">Giorni</span>
                        <span className="value">{calcResult.giorni}</span>
                      </div>
                      <div className="receipt-row">
                        <span className="label">Subtotale</span>
                        <span className="value">€ {calcResult.subtotale.toFixed(2)}</span>
                      </div>
                      {calcResult.extra > 0 && (
                        <div className="receipt-row">
                          <span className="label">Extra</span>
                          <span className="value">€ {calcResult.extra.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                    <div className="receipt-total-row">
                      <span className="total-label">Totale (IVA incl.)</span>
                      <span className="total-value">€ {calcResult.totale.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Metodo pagamento */}
              <div className="reg-subsection-label" style={{ marginTop: 'var(--space-lg)' }}>
                Metodo di Pagamento
              </div>
              <div className="receipt-payment-row">
                <button
                  className={`payment-btn ${metodo === 'pos' ? 'selected' : ''}`}
                  onClick={() => setMetodo('pos')}
                >💳 POS</button>
                <button
                  className={`payment-btn ${metodo === 'contante' ? 'selected' : ''}`}
                  onClick={() => setMetodo('contante')}
                >💵 Contante</button>
                <button
                  className={`payment-btn ${metodo === 'bonifico' ? 'selected' : ''}`}
                  onClick={() => setMetodo('bonifico')}
                >🏦 Bonifico</button>
              </div>

              <div className="reg-actions">
                <div /> {/* spacer */}
                <button
                  className="btn btn-mode-entrata"
                  onClick={handleConfirm}
                  disabled={!calcResult}
                >
                  ✅ Conferma e Incassa
                </button>
              </div>
            </div>
            )}

            {/* ═══════════════════════════════════════
                COLONNA DESTRA — Autorizzazione (AFFITTUARI)
                Per gli affittuari non c'è cassa interna: il canone è
                regolato fuori sistema fra beneficiario e proprietario
                del posto. Questa colonna mostra solo lo stato dell'
                autorizzazione e ricorda all'operatore che il completamento
                anagrafico è sufficiente per chiudere la pendenza.
            ═══════════════════════════════════════ */}
            {isAffittuario && (
            <div className="reg-panel reg-panel-cassa">
              <div className="reg-panel-header">
                <h2>📜 Autorizzazione</h2>
              </div>

              <div className="reg-info-banner">
                ℹ️ Per gli <strong>affittuari</strong> il canone è regolato
                direttamente fra beneficiario e socio proprietario del
                posto. <br />Il sistema non gestisce pagamenti — è
                sufficiente che l'autorizzazione del proprietario sia
                presente e che l'anagrafica sia completa.
              </div>

              <div className="reg-subsection-label" style={{ marginTop: 'var(--space-lg)' }}>
                Stato autorizzazione
              </div>
              <div style={{
                padding: 'var(--space-md)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                background: 'var(--bg3)',
                fontSize: '0.88rem'
              }}>
                {(() => {
                  // Cerca un'auth (pendente o attiva) per questo posto + barca
                  const auth = (autorizzazioni || []).find((a: any) =>
                    a.berthId === selectedPostoId &&
                    a.barca?.toLowerCase() === bNome.toLowerCase()
                  )
                  if (!auth) {
                    return (
                      <span style={{ color: 'var(--color-text-warning)' }}>
                        ⚠ Nessuna autorizzazione collegata. Verifica che la
                        Direzione abbia compilato il documento prima di
                        chiudere la registrazione.
                      </span>
                    )
                  }
                  if (auth.stato === 'pendente') {
                    return (
                      <span style={{ color: 'var(--color-text-warning)' }}>
                        ⏳ Autorizzazione in attesa di compilazione dalla
                        Direzione (Soci e Assegnazioni → tab Pendenti).
                      </span>
                    )
                  }
                  return (
                    <span style={{ color: 'var(--color-text-success)' }}>
                      ✓ Autorizzazione <strong>{auth.tipo}</strong> attiva
                      — beneficiario: <strong>{auth.beneficiario}</strong>
                      {auth.dal && auth.al ? <> · dal {auth.dal} al {auth.al}</> : null}
                    </span>
                  )
                })()}
              </div>

              <div className="reg-actions" style={{ marginTop: 'var(--space-lg)' }}>
                <div />
                <button
                  className="btn btn-mode-entrata"
                  onClick={handleSalvaAnagrafica}
                >
                  ✅ Conferma Registrazione
                </button>
              </div>
            </div>
            )}
          </div>
        </div>
        )}
      </div>
    </>
  )
}
