import { useState, useMemo } from 'react'
import { useGlobalState } from '../../../store/GlobalState'
import { Berth, Boat, Client, MovementScenario } from '@shared/types'
import { BERTH_STATUS_LABELS } from '@shared/constants'

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
    posti, barche, clienti,
    registraEntrata, registraUscitaTemporanea, registraUscitaDefinitiva,
    registraSpostamento, registraCantiere, registraBunker, registraRientro,
    isPostoOccupato, checkPagamentoSaldato, checkAutorizzazione, getScenarioBarca,
    addCliente, addBarca
  } = useGlobalState()

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
      .map(b => ({ label: b.nome, sublabel: `${b.matricola} · Posto: ${b.posto || '—'}`, boat: b }))
  }, [nome, barche])

  const targaSuggestions = useMemo<SearchSuggestion[]>(() => {
    if (targa.trim().length < 1) return []
    const q = targa.toLowerCase()
    return barche
      .filter(b => b.matricola.toLowerCase().includes(q))
      .slice(0, 5)
      .map(b => ({ label: b.matricola, sublabel: `${b.nome} · Posto: ${b.posto || '—'}`, boat: b }))
  }, [targa, barche])

  const postoSuggestions = useMemo<SearchSuggestion[]>(() => {
    if (posto.trim().length < 1) return []
    const q = posto.toLowerCase()
    return posti
      .filter(p => p.id.toLowerCase().includes(q))
      .slice(0, 5)
      .map(p => {
        const stato = BERTH_STATUS_LABELS[p.stato] || p.stato
        return { label: p.id, sublabel: `${p.pontile} · ${stato}${p.barcaOra ? ` · ${p.barcaOra}` : ''}`, berth: p }
      })
  }, [posto, posti])

  // Spostamento: suggerimenti filtrati per significato.
  // Origine = posti OCCUPATI (la barca da spostare deve esistere).
  // Destinazione = posti LIBERI (per non collidere con altre barche).
  // L'utente può comunque digitare un posto qualsiasi: la validazione finale
  // resta in registraSpostamento del GlobalState.
  const origineSuggestions = useMemo<SearchSuggestion[]>(() => {
    if (postoOrigine.trim().length < 1) return []
    const q = postoOrigine.toLowerCase()
    return posti
      .filter(p => p.id.toLowerCase().includes(q) && p.stato !== 'libero')
      .slice(0, 5)
      .map(p => {
        const stato = BERTH_STATUS_LABELS[p.stato] || p.stato
        return { label: p.id, sublabel: `${p.pontile} · ${stato}${p.barcaOra ? ` · ${p.barcaOra}` : ''}`, berth: p }
      })
  }, [postoOrigine, posti])

  const destinazioneSuggestions = useMemo<SearchSuggestion[]>(() => {
    if (postoDestinazione.trim().length < 1) return []
    const q = postoDestinazione.toLowerCase()
    return posti
      .filter(p => p.id.toLowerCase().includes(q) && p.stato === 'libero')
      .slice(0, 5)
      .map(p => {
        const stato = BERTH_STATUS_LABELS[p.stato] || p.stato
        return { label: p.id, sublabel: `${p.pontile} · ${stato} · max ${p.lunMax}m`, berth: p }
      })
  }, [postoDestinazione, posti])

  // Badge live: il berth corrispondente al testo digitato in destinazione.
  const destinazioneBerth = useMemo<Berth | undefined>(() => {
    const q = postoDestinazione.trim().toLowerCase()
    if (!q) return undefined
    return posti.find(p => p.id.toLowerCase() === q)
  }, [postoDestinazione, posti])

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

  // Suggerimenti posti per transito: filtrati per dimensioni della barca.
  const suggestedBerths = useMemo(() => {
    if (tipologia !== 'transito') return []
    let free = posti.filter(p => p.stato === 'libero')
    const lunVal = parseFloat(lunghezza)
    if (!isNaN(lunVal) && lunVal > 0) free = free.filter(p => p.lunMax >= lunVal)
    const pesVal = parseFloat(pescaggio)
    if (!isNaN(pesVal) && pesVal > 0) free = free.filter(p => p.profondita >= pesVal)
    return free
  }, [posti, tipologia, lunghezza, pescaggio])

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
  // AUTOFILL — selezione da dropdown
  // ════════════════════════════════════════════

  const fillFromBoat = (b: Boat) => {
    setNome(b.nome)
    setTarga(b.matricola)
    if (b.posto) setPosto(b.posto)
    if (b.lunghezza) setLunghezza(String(b.lunghezza))
    if (b.pescaggio) setPescaggio(String(b.pescaggio))
    // M-03: pre-popola anche l'origine dello spostamento.
    if (b.posto) setPostoOrigine(b.posto)
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
    if (p.stato !== 'libero') setPostoOrigine(p.id)
    if (p.barcaOra && p.stato !== 'libero') {
      const barca = barche.find(b => b.nome === p.barcaOra || b.posto === p.id)
      if (barca) fillFromBoat(barca)
    }
    setErrorMessage('')
  }

  // ════════════════════════════════════════════
  // INTERNAL — anagrafica scheletro per transiti (MEDIO 3-bis)
  // ════════════════════════════════════════════
  const ensureBoatExists = (): void => {
    if (tipologia !== 'transito') return
    const nomeTrim = nome.trim()
    const targaTrim = targa.trim()
    if (!nomeTrim && !targaTrim) return

    const esistente = barche.find(b =>
      (nomeTrim && b.nome.toLowerCase() === nomeTrim.toLowerCase()) ||
      (targaTrim && b.matricola.toLowerCase() === targaTrim.toLowerCase())
    )
    if (esistente) return

    const baseIniz = nomeTrim || targaTrim || '??'
    const iniziali = baseIniz.substring(0, 2).toUpperCase()

    const nuovoClientId = Math.max(0, ...clienti.map(c => c.id)) + 1
    const nuovoClient: Client = {
      id: nuovoClientId,
      tipo: 'pf',
      nome: `Transito — ${nomeTrim || targaTrim}`,
      iniziali
    }
    addCliente(nuovoClient)

    const nuovoBoatId = Math.max(0, ...barche.map(b => b.id)) + 1
    const lunVal = parseFloat(lunghezza) || 0
    const pesVal = parseFloat(pescaggio) || 0
    const nuovaBoat: Boat = {
      id: nuovoBoatId,
      clientId: nuovoClientId,
      nome: nomeTrim || `Barca ${targaTrim}`,
      matricola: targaTrim || 'N/D',
      tipo: 'Altro',
      tipologia: 'transito',
      lunghezza: lunVal,
      larghezza: 0,
      pescaggio: pesVal,
      bandiera: 'N/D',
      posto: posto.trim() || undefined,
      registrazioneCompleta: false
    }
    addBarca(nuovaBoat)
  }

  const buildMovement = (tipo: any, postoVal: string) => ({
    id: Date.now(),
    ora: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
    data: new Date().toISOString().split('T')[0],
    nome, matricola: targa || 'N/D', tipo,
    posto: postoVal || '—',
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

  const handleUscitaTemporanea = () => {
    if (!validateBase()) return
    if (!posto.trim()) { setErrorMessage('Inserisci il posto barca per l\'uscita temporanea.'); return }
    const result = registraUscitaTemporanea(buildMovement('uscita_temporanea', posto))
    if (!result.ok) { setErrorMessage(result.errore || 'Errore durante l\'uscita temporanea.'); return }
    handleClear()
  }

  const handleUscitaDefinitiva = () => {
    if (!validateBase()) return
    if (tipologia === 'socio') {
      setConfirmMessage('Vuoi rimuovere titolo al proprietario?')
      setConfirmAction(() => () => {
        const r = registraUscitaDefinitiva(buildMovement('uscita_definitiva', posto))
        if (!r.ok) { setErrorMessage(r.errore || 'Errore durante l\'uscita definitiva.') }
        else { handleClear() }
        setShowConfirmPopup(false)
      })
      setShowConfirmPopup(true)
      return
    }
    if (tipologia === 'transito' && !checkPagamentoSaldato(nome)) {
      setConfirmMessage('Non risulta emessa una ricevuta saldata per questa imbarcazione. Vuoi registrare comunque l\'uscita definitiva?')
      setConfirmAction(() => () => {
        const r = registraUscitaDefinitiva(buildMovement('uscita_definitiva', posto))
        if (!r.ok) { setErrorMessage(r.errore || 'Errore durante l\'uscita definitiva.') }
        else { handleClear() }
        setShowConfirmPopup(false)
      })
      setShowConfirmPopup(true)
      return
    }
    const result = registraUscitaDefinitiva(buildMovement('uscita_definitiva', posto))
    if (!result.ok) { setErrorMessage(result.errore || 'Errore durante l\'uscita definitiva.'); return }
    handleClear()
  }

  const handleSpostamento = () => {
    if (!validateBase()) return
    if (!postoOrigine.trim() || !postoDestinazione.trim()) { setErrorMessage('Inserisci sia il posto di origine che quello di destinazione.'); return }
    const result = registraSpostamento(buildMovement('spostamento', postoDestinazione), postoOrigine, postoDestinazione)
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

  const handleBunker = () => {
    if (!validateBase()) return
    if (!posto.trim()) { setErrorMessage('Inserisci il posto da cui parte la barca (verso il bunker).'); return }
    ensureBoatExists()
    const result = registraBunker(buildMovement('bunker', 'Bunker'), posto)
    if (!result.ok) { setErrorMessage(result.errore || 'Errore durante la registrazione bunker.'); return }
    handleClear()
  }

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

    // Autofill
    fillFromBoat,
    fillFromBerth,

    // Actions
    handleClear,
    handleEntrata,
    handleUscitaTemporanea,
    handleUscitaDefinitiva,
    handleSpostamento,
    handleCantiere,
    handleBunker,
    handleRientro,
  }
}

export type TorreFormState = ReturnType<typeof useTorreForm>
