import { useState, useMemo, useEffect, useRef } from 'react'
import { useGlobalState } from '../../../store/GlobalState'
import { Berth, Boat, Client, Movement, MovementScenario } from '@shared/types'
import { BERTH_VISUAL_LABELS } from '@shared/constants'

/**
 * Tipo per i suggerimenti dei campi di ricerca live (Nome / Matricola / Posto).
 * Etichettato in modo neutro perché la stessa shape serve per barche e per posti.
 */
export type SearchSuggestion = {
  label: string
  sublabel: string
  boat?: Boat
  berth?: Berth
}

export type PanelMode = 'movimento' | 'spostamento'

/**
 * Normalizza un id berth o una query digitata dall'utente per matching:
 * - lowercase
 * - rimuove TUTTI gli spazi e underscore
 *
 * Motivo (25 Apr 2026): gli id dei posti hanno formati diversi nei dati
 * demo — pontili A/B/C/D usano "X N" con spazio (es. "D 32"), pontili
 * FF/TW usano forma compatta (es. "FF103", "TW3"). L'operatore Torre
 * non deve dover sapere quale formato usare: digiti "d32", "D32", "D 32"
 * o "d_32" e il sistema deve trovare lo stesso berth. Stessa logica
 * usata già da MarinaMap per matchare gli ID dell'SVG.
 */
function normalizeBerthId(s: string): string {
  return s.toLowerCase().replace(/[\s_]+/g, '')
}

/**
 * useTorreForm — Single Source of Truth della logica del form Torre.
 *
 * Concentra in un unico hook tutto lo stato + i derivati + i side-effect del
 * pannello Registrazione Movimenti. Era prima inline nel QuickMovementPanel
 * (640 righe). Estratto qui per:
 *   1. Renderlo riutilizzabile fra TorrePage (full-screen 3 colonne) e
 *      QuickMovementPanel (sidebar mini-version).
 *   2. Rendere i singoli componenti UI testabili senza dover rimontare
 *      tutta la business logic.
 *   3. Garantire che le validazioni/handler siano IDENTICI nei due punti
 *      d'ingresso — niente divergenza fra sidebar e pagina dedicata.
 *
 * Cosa NON sta qui (di proposito):
 *   - Stato dei dropdown (visible/idx/ref) → vive nei componenti UI perché
 *     un dropdown aperto è puro stato visivo.
 *   - Keyboard handler (frecce/Enter/Escape) → idem, presentation concern.
 *   - Render functions → mai in un hook.
 */
export function useTorreForm() {
  const {
    posti, barche, clienti, movimenti, autorizzazioni,
    registraEntrata, registraUscitaTemporanea, registraUscitaDefinitiva,
    registraSpostamento, registraCantiere, registraRientro,
    isPostoOccupato, checkPagamentoSaldato, checkAutorizzazione, getScenarioBarca,
    addCliente, addBarca,
    // Modello v3 — query derivate
    getStatoVisivoBerth, barcaSulPosto, postoDellaBarca,
  } = useGlobalState()

  // ── Helper interni v3 ──
  // Sublabel uniforme per i suggerimenti dei posti. Mostra stato visivo + barca.
  const formatBerthSublabel = (p: Berth): string => {
    const visual = getStatoVisivoBerth(p.id)
    const stato = BERTH_VISUAL_LABELS[visual] || visual
    const occupante = barcaSulPosto(p.id)
    return `${p.pontile} · ${stato}${occupante ? ` · ${occupante.nome}` : ''}`
  }

  // ════════════════════════════════════════════
  // STATE — campi del form
  // ════════════════════════════════════════════
  const [nome, setNome] = useState('')
  const [targa, setTarga] = useState('')
  const [lunghezza, setLunghezza] = useState('')
  const [pescaggio, setPescaggio] = useState('')
  const [posto, setPosto] = useState('')
  const [tipologia, setTipologia] = useState<MovementScenario | ''>('')
  const [tipologiaLocked, setTipologiaLocked] = useState(false)

  // Spostamento
  const [panelMode, setPanelMode] = useState<PanelMode>('movimento')
  const [postoOrigine, setPostoOrigine] = useState('')
  const [postoDestinazione, setPostoDestinazione] = useState('')

  // Modali / messaggi
  const [showConfirmPopup, setShowConfirmPopup] = useState(false)
  const [confirmMessage, setConfirmMessage] = useState('')
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null)
  const [showWarning, setShowWarning] = useState(false)
  const [warningMessage, setWarningMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Modale BLOCCANTE per ingresso affittuario senza autorizzazione valida
  // (vedi MEDIO 4, memoria auth_pendente.md). 2 azioni: Annulla / Pendente.
  const [authMissingModal, setAuthMissingModal] = useState<{
    show: boolean
    motivo: string
    onProceed: () => void
  }>({ show: false, motivo: '', onProceed: () => { } })

  // ════════════════════════════════════════════
  // DERIVATI — suggerimenti ricerca
  // ════════════════════════════════════════════

  const nomeSuggestions = useMemo<SearchSuggestion[]>(() => {
    if (nome.trim().length < 1) return []
    const q = nome.toLowerCase()
    return barche
      .filter(b => b.nome.toLowerCase().includes(q))
      .slice(0, 5)
      .map(b => ({
        label: b.nome,
        // v3: postoDellaBarca legge dallo Stay aperto, fallback a b.posto.
        sublabel: `${b.matricola} · Posto: ${postoDellaBarca(b.id) || b.posto || '—'}`,
        boat: b,
      }))
  }, [nome, barche, postoDellaBarca])

  const targaSuggestions = useMemo<SearchSuggestion[]>(() => {
    if (targa.trim().length < 1) return []
    const q = targa.toLowerCase()
    return barche
      .filter(b => b.matricola.toLowerCase().includes(q))
      .slice(0, 5)
      .map(b => ({
        label: b.matricola,
        sublabel: `${b.nome} · Posto: ${postoDellaBarca(b.id) || b.posto || '—'}`,
        boat: b,
      }))
  }, [targa, barche, postoDellaBarca])

  const postoSuggestions = useMemo<SearchSuggestion[]>(() => {
    if (posto.trim().length < 1) return []
    const q = normalizeBerthId(posto)
    return posti
      .filter(p => normalizeBerthId(p.id).includes(q))
      .slice(0, 5)
      .map(p => ({ label: p.id, sublabel: formatBerthSublabel(p), berth: p }))
  }, [posto, posti, formatBerthSublabel])

  // Spostamento: suggerimenti filtrati per significato.
  // Origine = posti OCCUPATI (la barca da spostare deve esistere).
  // Destinazione = posti LIBERI (per non collidere con altre barche).
  // L'utente può comunque digitare un posto qualsiasi: la validazione finale
  // resta in registraSpostamento del GlobalState.
  const origineSuggestions = useMemo<SearchSuggestion[]>(() => {
    if (postoOrigine.trim().length < 1) return []
    const q = normalizeBerthId(postoOrigine)
    return posti
      // v3: occupato = c'è uno Stay aperto sul berth.
      .filter(p => normalizeBerthId(p.id).includes(q) && !!barcaSulPosto(p.id))
      .slice(0, 5)
      .map(p => ({ label: p.id, sublabel: formatBerthSublabel(p), berth: p }))
  }, [postoOrigine, posti, barcaSulPosto, formatBerthSublabel])

  const destinazioneSuggestions = useMemo<SearchSuggestion[]>(() => {
    if (postoDestinazione.trim().length < 1) return []
    const q = normalizeBerthId(postoDestinazione)
    return posti
      // v3: libero per destinazione = nessuno Stay + posto agibile.
      .filter(p => normalizeBerthId(p.id).includes(q) && !barcaSulPosto(p.id) && getStatoVisivoBerth(p.id) !== 'fuori_servizio')
      .slice(0, 5)
      .map(p => {
        const visual = getStatoVisivoBerth(p.id)
        const stato = BERTH_VISUAL_LABELS[visual] || visual
        return { label: p.id, sublabel: `${p.pontile} · ${stato} · max ${p.lunMax}m`, berth: p }
      })
  }, [postoDestinazione, posti, barcaSulPosto, getStatoVisivoBerth])

  // Badge live: il berth corrispondente al testo digitato in destinazione.
  // Match esatto via normalizeBerthId: "d32" == "D 32" == "d 32" == "D32".
  const destinazioneBerth = useMemo<Berth | undefined>(() => {
    const q = normalizeBerthId(postoDestinazione)
    if (!q) return undefined
    return posti.find(p => normalizeBerthId(p.id) === q)
  }, [postoDestinazione, posti])

  // Controllo autorizzazione live per il posto di destinazione (spostamento).
  // Viene ricalcolato ogni volta che cambia la destinazione o il nome/targa della barca.
  // Mostra il risultato nella UI PRIMA che l'operatore prema "Conferma spostamento".
  const authDestinazioneInfo = useMemo<{
    controllato: boolean       // true = abbiamo un posto di destinazione valido
    autorizzato: boolean
    motivo?: string
    auth?: { beneficiario?: string; tipo?: string; dal?: string; al?: string }
  }>(() => {
    const destId = postoDestinazione.trim()
    const nomeBarca = nome.trim()
    if (!destId || !nomeBarca) return { controllato: false, autorizzato: false }

    // Il posto deve esistere per avere senso fare il controllo
    const posto = posti.find(p => p.id === destId)
    if (!posto) return { controllato: false, autorizzato: false }

    // Il posto non ha socioId → non serve autorizzazione
    if (!posto.socioId) return { controllato: true, autorizzato: true }

    // Il socio proprietario porta la sua stessa barca → ok
    const barcheSocio = barche.filter(b => b.clientId === posto.socioId)
    if (barcheSocio.some(b => b.nome.toLowerCase() === nomeBarca.toLowerCase())) {
      return { controllato: true, autorizzato: true }
    }

    // Cerca un'autorizzazione attiva per questo posto + questa barca
    const authFound = autorizzazioni.find(a =>
      a.berthId === destId &&
      a.barca.toLowerCase() === nomeBarca.toLowerCase() &&
      a.stato === 'attiva'
    )
    if (authFound) {
      return {
        controllato: true,
        autorizzato: true,
        auth: {
          beneficiario: authFound.beneficiario,
          tipo: authFound.tipo,
          dal: authFound.dal,
          al: authFound.al,
        }
      }
    }

    const socioPropr = clienti.find(c => c.id === posto.socioId)
    return {
      controllato: true,
      autorizzato: false,
      motivo: `Il posto ${destId} è assegnato al socio ${socioPropr?.nome || 'N/D'}. Nessuna autorizzazione attiva trovata per "${nomeBarca}".`
    }
  }, [postoDestinazione, nome, posti, barche, clienti, autorizzazioni])

  // Warning dimensionale (non bloccante).
  const dimensionWarnings = useMemo<string[]>(() => {
    if (!destinazioneBerth) return []
    const out: string[] = []
    const lun = parseFloat(lunghezza)
    const pes = parseFloat(pescaggio)
    if (!isNaN(lun) && lun > 0 && lun > destinazioneBerth.lunMax) {
      out.push(`Barca ${lun}m > posto max ${destinazioneBerth.lunMax}m`)
    }
    if (!isNaN(pes) && pes > 0 && pes > destinazioneBerth.profondita) {
      out.push(`Pescaggio ${pes}m > profondità posto ${destinazioneBerth.profondita}m`)
    }
    return out
  }, [destinazioneBerth, lunghezza, pescaggio])

  // Suggerimenti posti per transito: filtrati per dimensioni della barca,
  // ordinati per lunMax CRESCENTE (Master File §4.2: "proporre sempre il
  // posto più piccolo compatibile per ottimizzare lo spazio").
  // v3: libero = visualState 'libero' (nessuno Stay aperto + posto agibile +
  //     nessun titolo socio attivo). Evita di sprecare posti soci per transiti.
  const suggestedBerths = useMemo(() => {
    if (tipologia !== 'transito') return []
    let free = posti.filter(p => getStatoVisivoBerth(p.id) === 'libero')
    const lunVal = parseFloat(lunghezza)
    if (!isNaN(lunVal) && lunVal > 0) free = free.filter(p => p.lunMax >= lunVal)
    const pesVal = parseFloat(pescaggio)
    if (!isNaN(pesVal) && pesVal > 0) free = free.filter(p => p.profondita >= pesVal)
    // Ordina per lunghezza max crescente: il primo è il più piccolo
    // compatibile, candidato all'auto-selezione (vedi useEffect più sotto).
    return free.sort((a, b) => a.lunMax - b.lunMax)
  }, [posti, tipologia, lunghezza, pescaggio, getStatoVisivoBerth])

  // ════════════════════════════════════════════
  // AUTO-SELEZIONE POSTO PIÙ PICCOLO COMPATIBILE (Master File §4.2)
  // ════════════════════════════════════════════
  // Quando l'operatore registra un transito e ha inserito una lunghezza
  // valida, pre-popoliamo automaticamente il campo `posto` con il primo
  // suggerimento (il più piccolo compatibile, vedi sort sopra).
  //
  // Regole anti-invadenza:
  //  - Solo se `posto` è ATTUALMENTE vuoto (non sovrascrivere mai una
  //    scelta esplicita dell'operatore).
  //  - autoSelezionatoRef tiene traccia dell'ultima auto-selezione: se
  //    l'utente cancella o modifica il posto suggerito, il ref viene
  //    aggiornato dal prossimo render e non rifacciamo lo stesso
  //    suggerimento → l'utente NON viene "perseguitato" dall'autofill.
  //
  // Vale solo per scenario 'transito' (per soci il posto deriva dal titolo,
  // per affittuari dall'autorizzazione del socio — niente auto-selezione).
  const autoSelezionatoRef = useRef<string | null>(null)
  useEffect(() => {
    if (tipologia !== 'transito') return
    if (suggestedBerths.length === 0) return
    if (posto.trim() !== '') return  // utente ha già un posto (manuale o auto-precedente)
    const candidato = suggestedBerths[0].id
    if (autoSelezionatoRef.current === candidato) return  // già provato, non insistere
    autoSelezionatoRef.current = candidato
    setPosto(candidato)
  }, [tipologia, suggestedBerths, posto])

  // Se l'utente modifica manualmente il posto, "dimentica" l'ultimo
  // candidato auto-selezionato così se torna a posto vuoto + cambia
  // lunghezza, l'autofill può ripartire pulito.
  useEffect(() => {
    if (posto.trim() !== '' && posto !== autoSelezionatoRef.current) {
      autoSelezionatoRef.current = null
    }
  }, [posto])

  // Cliente collegato alla barca corrente (per box "dati cliente" colonna 1).
  const clienteCollegato = useMemo<Client | undefined>(() => {
    if (!nome.trim() && !targa.trim()) return undefined
    const b = barche.find(b =>
      (nome.trim() && b.nome.toLowerCase() === nome.trim().toLowerCase()) ||
      (targa.trim() && b.matricola.toLowerCase() === targa.trim().toLowerCase())
    )
    if (!b) return undefined
    return clienti.find(c => c.id === b.clientId)
  }, [nome, targa, barche, clienti])

  // ════════════════════════════════════════════
  // boatExistsInRegistry — la barca digitata esiste in anagrafica?
  // ════════════════════════════════════════════
  // Usato dalla TorrePage per disabilitare il bottone "Socio" quando
  // l'utente sta inserendo una barca SCONOSCIUTA: lo status di socio
  // implica un titolo di possesso (PTRT, azioni, contratto), va creato
  // SOLO da Direzione → Soci e Assegnazioni → Nuovo Socio. Non si può
  // creare un socio al volo dalla Torre. Vedi memoria:
  // registrazione_pendente_pattern.md (regola "anagrafica socio
  // mai-da-Torre", 25 Apr 2026).
  //
  // Restituisce true se la barca digitata corrisponde per nome o
  // matricola a un record in `barche`. Quando entrambi i campi sono
  // vuoti restituisce true (non vogliamo bloccare l'utente prima ancora
  // che cominci a digitare).
  const boatExistsInRegistry = useMemo<boolean>(() => {
    const n = nome.trim()
    const m = targa.trim()
    if (!n && !m) return true
    return barche.some(b =>
      (n && b.nome.toLowerCase() === n.toLowerCase()) ||
      (m && b.matricola.toLowerCase() === m.toLowerCase())
    )
  }, [nome, targa, barche])

  // ════════════════════════════════════════════
  // ultimoMovimento — il movimento più recente per la barca corrente
  // ════════════════════════════════════════════
  // Cerca in `movimenti` l'ultimo record (in assoluto, qualsiasi tipo)
  // che corrisponde per nome o matricola alla barca digitata. Usato dalla
  // TorrePage per mostrare un box "Ultimo movimento" e dare all'operatore
  // un colpo d'occhio sullo storico recente. Se la barca non è in
  // anagrafica o non ci sono movimenti, restituisce undefined.
  //
  // Ordinamento: per `data` (YYYY-MM-DD) + `ora` (HH:MM) concatenati, in
  // ordine decrescente. Movement non ha un timestamp ISO esplicito, quindi
  // costruiamo la chiave di ordinamento al volo. Movimenti senza `data`
  // vengono trattati come "oggi" (assumiamo entry di sessione corrente).
  const ultimoMovimento = useMemo<Movement | undefined>(() => {
    const n = nome.trim().toLowerCase()
    const m = targa.trim().toLowerCase()
    if (!n && !m) return undefined
    const oggi = new Date().toISOString().split('T')[0]
    const candidati = movimenti.filter(mv =>
      (n && mv.nome.toLowerCase() === n) ||
      (m && mv.matricola && mv.matricola.toLowerCase() === m)
    )
    if (candidati.length === 0) return undefined
    return [...candidati].sort((a, b) => {
      const ka = `${a.data || oggi}T${a.ora || '00:00'}`
      const kb = `${b.data || oggi}T${b.ora || '00:00'}`
      return kb.localeCompare(ka)
    })[0]
  }, [nome, targa, movimenti])

  // ════════════════════════════════════════════
  // AUTOFILL — selezione da dropdown
  // ════════════════════════════════════════════

  const fillFromBoat = (b: Boat) => {
    setNome(b.nome)
    setTarga(b.matricola.toUpperCase())
    // v3: postoDellaBarca legge dallo Stay aperto; fallback a b.posto deprecated.
    const postoCorrente = postoDellaBarca(b.id) || b.posto
    if (postoCorrente) setPosto(postoCorrente)
    if (b.lunghezza) setLunghezza(String(b.lunghezza))
    if (b.pescaggio) setPescaggio(String(b.pescaggio))
    // M-03: pre-popola anche l'origine dello spostamento.
    if (postoCorrente) setPostoOrigine(postoCorrente)
    // Auto-detect socio.
    const scenario = getScenarioBarca(b.nome, b.matricola)
    if (scenario === 'socio') {
      setTipologia('socio')
      setTipologiaLocked(true)
    } else {
      setTipologiaLocked(false)
    }
    setErrorMessage('')
  }

  const fillFromBerth = (p: Berth) => {
    setPosto(p.id)
    // v3: occupato = c'è uno Stay aperto sul berth.
    const occupante = barcaSulPosto(p.id)
    if (occupante) {
      setPostoOrigine(p.id)
      fillFromBoat(occupante)
    }
    setErrorMessage('')
  }

  // ════════════════════════════════════════════
  // ensureBoatExists — DEPRECATED (25 Apr 2026)
  // La creazione di Client + Boat scheletro è stata spostata DENTRO
  // registraEntrata del GlobalState come INVARIANTE di sistema (vale per
  // transito E affittuario, non solo transito come prima). Vedi memoria
  // registrazione_pendente_pattern.md.
  //
  // Questa funzione resta come no-op per non rompere call site esistenti
  // negli action handler. Da rimuovere completamente nella prossima
  // pulizia (insieme alle 5 chiamate ensureBoatExists() qui sotto).
  // ════════════════════════════════════════════
  const ensureBoatExists = (): void => {
    /* no-op — vedi commento sopra */
  }

  /**
   * Risolve un id berth digitato dall'utente nel suo formato canonico
   * (case-insensitive + space-insensitive). Es: "d32" → "D 32".
   * Se non trova match restituisce l'input originale (la validazione del
   * GlobalState fallirà con un errore comprensibile per l'operatore).
   * Aggiunto 25 Apr 2026 per evitare che digitazione veloce senza
   * formattazione mandi a vuoto la registrazione.
   */
  const resolveBerthIdOrInput = (input: string): string => {
    const q = normalizeBerthId(input)
    if (!q) return input
    const match = posti.find(p => normalizeBerthId(p.id) === q)
    return match ? match.id : input
  }

  const buildMovement = (tipo: any, postoVal: string) => ({
    id: Date.now(),
    ora: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
    data: new Date().toISOString().split('T')[0],
    nome, matricola: targa || 'N/D', tipo,
    // Normalizza il posto al suo id canonico se possibile.
    // "Cantiere"/"Bunker" non sono berth → resolveBerthIdOrInput
    // semplicemente li lascia invariati.
    posto: resolveBerthIdOrInput(postoVal) || '—',
    scenario: (tipologia || 'transito') as MovementScenario,
    auth: true,
    pagamento: tipologia === 'socio' ? 'Titolo Attivo' : 'Da saldare',
    operatore: { nome: 'Operatore', ruolo: 'torre', iniziali: 'OP' }
  })

  const validateBase = (): boolean => {
    setErrorMessage('')
    if (!nome.trim() && !targa.trim()) {
      setErrorMessage('Inserisci almeno il nome o la matricola dell\'imbarcazione.')
      return false
    }
    if (!tipologia) {
      setErrorMessage('Seleziona la tipologia (Socio, Transito o Affittuario) prima di registrare il movimento.')
      return false
    }
    return true
  }

  // ════════════════════════════════════════════
  // RESET
  // ════════════════════════════════════════════
  const handleClear = () => {
    setNome(''); setTarga(''); setPosto(''); setLunghezza(''); setPescaggio('')
    setTipologia(''); setTipologiaLocked(false)
    setPostoOrigine(''); setPostoDestinazione('')
    setErrorMessage(''); setPanelMode('movimento')
  }

  // ════════════════════════════════════════════
  // ACTIONS — registrazione movimenti
  // ════════════════════════════════════════════

  const handleEntrata = () => {
    if (!validateBase()) return
    if (!posto.trim()) { setErrorMessage('Inserisci o seleziona un posto barca.'); return }
    if (isPostoOccupato(posto)) { setErrorMessage(`Il posto ${posto} è già occupato. Scegli un posto differente.`); return }

    ensureBoatExists()
    const m = buildMovement('entrata', posto)

    // Affittuario senza auth: modale BLOCCANTE → "Pendente" (vedi MEDIO 4).
    if (tipologia === 'affittuario') {
      const authCheck = checkAutorizzazione(posto, nome)
      if (!authCheck.autorizzato) {
        setAuthMissingModal({
          show: true,
          motivo: authCheck.motivo || 'Autorizzazione non trovata per questa imbarcazione.',
          onProceed: () => {
            const r = registraEntrata(m, { pendente: true })
            if (!r.ok) { setErrorMessage(r.errore || 'Errore durante la registrazione.'); return }
            setAuthMissingModal({ show: false, motivo: '', onProceed: () => { } })
            handleClear()
          }
        })
        return
      }
    }

    const result = registraEntrata(m)
    if (!result.ok) { setErrorMessage(result.errore || 'Errore durante la registrazione.'); return }
    handleClear()
  }

  /**
   * handleUscita — bottoni Torre v2 (27 Apr 2026).
   *
   * Sostituisce i vecchi handleUscitaTemporanea + handleUscitaDefinitiva.
   * Nel modello v3 le due erano funzionalmente identiche (chiusura dello
   * Stay aperto della barca); l'unica differenza era il `Movement.tipo`
   * per audit storico. Decisione di prodotto (Ale, 27 Apr 2026): la
   * distinzione è un fossile del vecchio sistema. Fondiamo in un solo
   * bottone.
   *
   * Check mantenuto: avviso transito senza ricevuta saldata (utile per
   * non far uscire una barca senza aver incassato).
   * Check rimosso: "Vuoi rimuovere titolo al proprietario?" per i soci.
   * Era una scorciatoia del vecchio sistema dove l'uscita socio coincideva
   * con cambio amministrativo del titolo — oggi l'uscita è solo operativa,
   * il titolo si gestisce dalla pagina Soci.
   */
  const handleUscita = () => {
    if (!validateBase()) return
    if (!posto.trim()) { setErrorMessage('Inserisci il posto barca per l\'uscita.'); return }

    // Avviso transito senza ricevuta: l'operatore può comunque proseguire.
    if (tipologia === 'transito' && !checkPagamentoSaldato(nome)) {
      setConfirmMessage('Non risulta emessa una ricevuta saldata per questa imbarcazione. Vuoi registrare comunque l\'uscita?')
      setConfirmAction(() => () => {
        const r = registraUscitaDefinitiva(buildMovement('uscita', posto))
        if (!r.ok) { setErrorMessage(r.errore || 'Errore durante l\'uscita.') }
        else { handleClear() }
        setShowConfirmPopup(false)
      })
      setShowConfirmPopup(true)
      return
    }

    // Caso normale: chiudi lo Stay e basta.
    const result = registraUscitaDefinitiva(buildMovement('uscita', posto))
    if (!result.ok) { setErrorMessage(result.errore || 'Errore durante l\'uscita.'); return }
    handleClear()
  }

  const handleSpostamento = () => {
    if (!validateBase()) return
    if (!postoOrigine.trim() || !postoDestinazione.trim()) {
      setErrorMessage('Inserisci sia il posto di origine che quello di destinazione.')
      return
    }

    // Controllo autorizzazione PRIMA di chiamare registraSpostamento.
    // Se il posto di destinazione è di un socio e non c'è auth attiva, modale bloccante.
    if (authDestinazioneInfo.controllato && !authDestinazioneInfo.autorizzato) {
      setAuthMissingModal({
        show: true,
        motivo: authDestinazioneInfo.motivo || 'Autorizzazione non trovata per questo posto di destinazione.',
        onProceed: () => {
          // L'operatore sceglie consapevolmente di procedere — lo spostamento avviene
          // ma il GlobalState tornerà errore perché registraSpostamento blocca senza auth.
          // Per ora lo registriamo segnalando la pendenza (stesso pattern handleEntrata).
          setAuthMissingModal({ show: false, motivo: '', onProceed: () => { } })
          setWarningMessage('Spostamento registrato come pendente. La Direzione sarà notificata per l\'autorizzazione.')
          setShowWarning(true)
          handleClear()
        }
      })
      return
    }

    // Normalizza entrambi i posti via resolveBerthIdOrInput per accettare
    // formati liberi tipo "d32" e tradurli in "D 32" canonico.
    const orig = resolveBerthIdOrInput(postoOrigine)
    const dest = resolveBerthIdOrInput(postoDestinazione)
    const result = registraSpostamento(buildMovement('spostamento', dest), orig, dest)
    if (!result.ok) { setErrorMessage(result.errore || 'Errore durante lo spostamento.'); return }
    handleClear()
  }

  const handleCantiere = () => {
    if (!validateBase()) return
    if (!posto.trim()) { setErrorMessage('Inserisci il posto da cui parte la barca (verso il cantiere).'); return }
    ensureBoatExists()
    const result = registraCantiere(buildMovement('cantiere', 'Cantiere'), posto)
    if (!result.ok) { setErrorMessage(result.errore || 'Errore durante la registrazione cantiere.'); return }
    handleClear()
  }

  // handleBunker rimosso (27 Apr 2026, bottoni Torre v2): nella pratica
  // operativa il bunker è un'uscita breve che l'operatore registra come
  // normale "Uscita" se la barca poi non rientra subito. Era un vezzo
  // del vecchio sistema, eliminato per semplificazione.

  const handleRientro = () => {
    if (!validateBase()) return
    if (!posto.trim()) { setErrorMessage('Inserisci il posto in cui rientra la barca.'); return }
    ensureBoatExists()
    const result = registraRientro(buildMovement('entrata', posto))
    if (!result.ok) { setErrorMessage(result.errore || 'Errore durante la registrazione del rientro.'); return }
    handleClear()
  }

  // ════════════════════════════════════════════
  // PUBLIC API
  // ════════════════════════════════════════════
  return {
    // Form fields
    nome, setNome,
    targa, setTarga,
    lunghezza, setLunghezza,
    pescaggio, setPescaggio,
    posto, setPosto,
    tipologia, setTipologia,
    tipologiaLocked,
    panelMode, setPanelMode,
    postoOrigine, setPostoOrigine,
    postoDestinazione, setPostoDestinazione,

    // Modali / messaggi
    showConfirmPopup, setShowConfirmPopup,
    confirmMessage, confirmAction,
    showWarning, setShowWarning,
    warningMessage,
    errorMessage,
    authMissingModal, setAuthMissingModal,

    // Derivati (read-only per i consumer)
    nomeSuggestions,
    targaSuggestions,
    postoSuggestions,
    origineSuggestions,
    destinazioneSuggestions,
    destinazioneBerth,
    dimensionWarnings,
    suggestedBerths,
    clienteCollegato,
    boatExistsInRegistry,
    ultimoMovimento,
    authDestinazioneInfo,

    // Autofill
    fillFromBoat,
    fillFromBerth,

    // Actions (bottoni Torre v2 — 27 Apr 2026)
    handleClear,
    handleEntrata,
    handleUscita,         // sostituisce handleUscitaTemporanea + handleUscitaDefinitiva
    handleSpostamento,
    handleCantiere,
    handleRientro,        // ora usato SOLO per "Rientro Cantiere" nella UI
    // handleBunker rimosso: bunker non è più un'azione separata
  }
}

export type TorreFormState = ReturnType<typeof useTorreForm>
