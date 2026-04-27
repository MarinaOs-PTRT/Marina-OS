import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { TopBar } from '../../components/TopBar'
import { useGlobalState } from '../../store/GlobalState'
import './NotifichePage.css'

/**
 * Soglia di auto-purge per le notifiche risolte. Decisione del 27 Apr 2026:
 * 30 giorni è un buon compromesso fra "tenere abbastanza storia per
 * ritrovare cose recenti" e "non lasciare che la lista cresca all'infinito".
 * Eseguito una sola volta per visita alla pagina (vedi useEffect più sotto).
 */
const PURGE_GIORNI = 30

export function NotifichePage() {
  const { notifiche, markNotifica, purgeNotificheRisolte } = useGlobalState()
  const [filterCat, setFilterCat] = useState<string>('tutte')
  /** Toggle "Mostra risolte". Off di default — le risolte sono rumore
   *  visivo per il flusso operativo quotidiano. L'utente può comunque
   *  consultarle attivando il toggle (o cliccando "Mostra" sul contatore). */
  const [mostraRisolte, setMostraRisolte] = useState(false)

  // Cleanup lazy: una sola volta al mount della pagina, non ad ogni render.
  // useRef garantisce che React StrictMode (doppio mount in dev) non lo
  // esegua due volte di fila.
  const purgeFatto = useRef(false)
  useEffect(() => {
    if (purgeFatto.current) return
    purgeFatto.current = true
    purgeNotificheRisolte(PURGE_GIORNI)
  }, [purgeNotificheRisolte])

  const handleMarkAs = (id: number, nuovoStato: 'letta' | 'risolta') => {
    markNotifica(id, nuovoStato)
  }

  // Filtra prima per categoria, poi separa risolte da attive per il
  // contatore "N risolte nascoste".
  const filteredByCat = useMemo(
    () => notifiche.filter(n => filterCat === 'tutte' || n.categoria === filterCat),
    [notifiche, filterCat]
  )

  const risolteCount = useMemo(
    () => filteredByCat.filter(n => n.stato === 'risolta').length,
    [filteredByCat]
  )

  // Lista finale: se toggle off, escludi le risolte.
  const visibili = useMemo(
    () => mostraRisolte ? filteredByCat : filteredByCat.filter(n => n.stato !== 'risolta'),
    [filteredByCat, mostraRisolte]
  )

  // Sort by stato (nuova > letta > risolta) then by id
  const sorted = useMemo(() => [...visibili].sort((a, b) => {
    const sMap = { nuova: 0, letta: 1, risolta: 2 }
    if (sMap[a.stato] !== sMap[b.stato]) return sMap[a.stato] - sMap[b.stato]
    return b.id - a.id
  }), [visibili])

  return (
    <>
      <TopBar
        title="Centro Notifiche"
        subtitle="Gestione avvisi di sistema, allerte operative e amministrative"
      />

      <div className="page-container notifiche-page">
        <div className="n-filters">
          <button className={`btn-filter ${filterCat === 'tutte' ? 'active' : ''}`} onClick={() => setFilterCat('tutte')}>Tutte</button>
          <button className={`btn-filter ${filterCat === 'operativo' ? 'active' : ''}`} onClick={() => setFilterCat('operativo')}>Operative</button>
          <button className={`btn-filter ${filterCat === 'amministrazione' ? 'active' : ''}`} onClick={() => setFilterCat('amministrazione')}>Amministrazione</button>
          <button className={`btn-filter ${filterCat === 'sistema' ? 'active' : ''}`} onClick={() => setFilterCat('sistema')}>Sistema</button>
        </div>

        {/* Banner contatore risolte: visibile solo se ci sono risolte
            nascoste (toggle off). Cliccabile per attivare la vista completa.
            Quando il toggle è on, il banner cambia in "Nascondi risolte". */}
        {risolteCount > 0 && (
          <div className="n-risolte-bar">
            {mostraRisolte ? (
              <>
                <span className="n-risolte-text">
                  Mostrando {risolteCount} {risolteCount === 1 ? 'notifica risolta' : 'notifiche risolte'}.
                  Le risolte da più di {PURGE_GIORNI} giorni vengono rimosse automaticamente.
                </span>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setMostraRisolte(false)}
                >
                  Nascondi risolte
                </button>
              </>
            ) : (
              <>
                <span className="n-risolte-text">
                  {risolteCount} {risolteCount === 1 ? 'notifica risolta nascosta' : 'notifiche risolte nascoste'}
                </span>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setMostraRisolte(true)}
                >
                  Mostra
                </button>
              </>
            )}
          </div>
        )}

        <div className="n-list">
          {sorted.length === 0 ? (
            <div className="empty-message">Nessuna notifica attiva per questa categoria.</div>
          ) : (
            sorted.map(n => (
              <div key={n.id} className={`n-card n-stato-${n.stato}`}>
                <div className="n-header">
                  <div className="n-title-group">
                    {n.stato === 'nuova' && <span className="new-dot"></span>}
                    <span className={`pill pill-urg-${n.urgenza}`}>{n.urgenza.toUpperCase()}</span>
                    <h3 className="n-title">{n.titolo}</h3>
                  </div>
                  <div className="n-meta">
                    <span className="n-cat">{n.categoria}</span>
                    <span className="n-date">{n.data}</span>
                  </div>
                </div>
                <div className="n-body">
                  <p>{n.descrizione}</p>
                </div>
                <div className="n-actions">
                  {/* Azione contestuale: per notifiche con relatedBoatId
                      (anagrafica transito da completare) link diretto alla
                      pagina di completamento, così la Direzione fa un click
                      in meno. Vedi MASTER_FILE_v2 §4.4 — Pattern Reg Pendente. */}
                  {n.relatedBoatId && n.stato !== 'risolta' && (
                    <Link
                      to={`/completa-registrazione/${n.relatedBoatId}`}
                      className="btn btn-primary btn-sm"
                    >
                      Completa registrazione
                    </Link>
                  )}
                  {n.stato === 'nuova' && (
                    <button className="btn btn-outline btn-sm" onClick={() => handleMarkAs(n.id, 'letta')}>Segna come letta</button>
                  )}
                  {n.stato !== 'risolta' && (
                    <button className="btn btn-outline btn-sm" onClick={() => handleMarkAs(n.id, 'risolta')}>Risolta</button>
                  )}
                  {n.stato === 'risolta' && (
                    <span className="n-resolved-text">Risolta</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
