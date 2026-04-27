import React from 'react'
import { Link } from 'react-router-dom'
import { Berth } from '@shared/types'
import { useGlobalState } from '../../../store/GlobalState'
import { Badge } from '../../../components/Badge'
import { BERTH_VISUAL_LABELS, BERTH_VISUAL_BADGE } from '@shared/constants'

interface BerthDetailDrawerProps {
  berth: Berth
  onClose: () => void
}

/**
 * BerthDetailDrawer — modello v3 (27 Apr 2026).
 *
 * Legge dal nuovo modello stati via query derivate del GlobalState:
 *  - getStatoVisivoBerth → stato visivo derivato
 *  - barcaSulPosto       → barca attualmente sul berth (se occupato)
 *  - titoloAttivoDelBerth → socio proprietario (se posto socio)
 *  - cantiereDellaBarca  → info cantiere (se la barca del socio è fuori)
 *
 * NON legge più Berth.stato/Berth.barcaOra (campi deprecated).
 */
export function BerthDetailDrawer({ berth, onClose }: BerthDetailDrawerProps) {
  const {
    clienti, barche,
    getStatoVisivoBerth, barcaSulPosto, titoloAttivoDelBerth,
    cantiereDellaBarca,
  } = useGlobalState()

  const visual = getStatoVisivoBerth(berth.id)
  const occupante = barcaSulPosto(berth.id)
  const titolo = titoloAttivoDelBerth(berth.id)
  const socio = titolo ? clienti.find(c => c.id === titolo.clientId) : undefined

  // Se è "socio_in_cantiere" dobbiamo trovare quanti giorni
  const cantiereInfo = visual === 'socio_in_cantiere' && titolo?.boatId !== undefined
    ? cantiereDellaBarca(titolo.boatId)
    : undefined
  const giorniInCantiere = cantiereInfo
    ? Math.max(0, Math.floor((Date.now() - new Date(cantiereInfo.inizio).getTime()) / 86400000))
    : 0

  // Se l'occupante è una barca di socio MA il posto NON ha titolo per quella
  // barca, è un socio "fuori posto" → mostra il suo posto fisso.
  const occupanteCliente = occupante ? clienti.find(c => c.id === occupante.clientId) : undefined
  const occupanteIsSocioFuoriPosto =
    occupante &&
    occupanteCliente?.tipo === 'so' &&
    titolo?.boatId !== occupante.id
  const postoFissoOccupante = occupanteIsSocioFuoriPosto
    ? barche.find(b => b.id === occupante.id)?.posto || '—'
    : undefined

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" onClick={e => e.stopPropagation()}>
        <div className="drawer-hdr">
          <h2 className="drawer-title">{berth.id}</h2>
          <button className="drawer-close" onClick={onClose}>✕</button>
        </div>
        <div className="drawer-body">

        {/* Stato e Categoria */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 'bold' }}>{berth.pontile}</div>
            <div style={{ fontWeight: 'bold' }}>{berth.id}</div>
          </div>
          <Badge color={BERTH_VISUAL_BADGE[visual] as any}>{BERTH_VISUAL_LABELS[visual]}</Badge>
        </div>

        {/* Dimensioni */}
        <div className="drawer-section">
          <h3>Specifiche Tecniche</h3>
          <div className="drawer-grid">
            <div className="drawer-field">
              <div className="drawer-field-label">Categoria</div>
              <div className="drawer-field-val" style={{ fontWeight: 'bold' }}>{berth.categoria}</div>
            </div>
            <div className="drawer-field">
              <div className="drawer-field-label">Profondità</div>
              <div className="drawer-field-val">{berth.profondita}m</div>
            </div>
            <div className="drawer-field full">
              <div className="drawer-field-label">Dimensioni Max</div>
              <div className="drawer-field-val">{berth.lunMax}m × {berth.larMax}m</div>
            </div>
          </div>
        </div>

        {/* Situazione Attuale — derivata dal modello v3 */}
        <div className="drawer-section">
          <h3>Situazione Attuale</h3>
          <div style={{ padding: '16px', background: 'var(--bg3)', borderRadius: 'var(--radius-sm)' }}>
            {visual === 'fuori_servizio' && (
              <>
                <div style={{ fontSize: '0.75rem', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 'bold' }}>Posto fuori servizio</div>
                {berth.notaAgibilita && (
                  <div style={{ marginTop: '6px', fontSize: '0.9rem', color: 'var(--text2)' }}>{berth.notaAgibilita}</div>
                )}
              </>
            )}
            {visual === 'libero' && (
              <div style={{ fontWeight: 'bold' }}>Posto libero — disponibile</div>
            )}
            {visual === 'socio_assente' && (
              <>
                <div style={{ fontSize: '0.75rem', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 'bold' }}>Posto del socio</div>
                <div style={{ fontWeight: 'bold', fontSize: '1.05rem', marginTop: '4px' }}>{socio?.nome ?? '—'}</div>
                <div style={{ marginTop: '6px', color: 'var(--text2)', fontSize: '0.9rem' }}>Barca attualmente assente</div>
              </>
            )}
            {visual === 'socio_in_cantiere' && (
              <>
                <div style={{ fontSize: '0.75rem', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 'bold' }}>Posto del socio</div>
                <div style={{ fontWeight: 'bold', fontSize: '1.05rem', marginTop: '4px' }}>{socio?.nome ?? '—'}</div>
                <div style={{ marginTop: '6px', color: 'var(--color-text-warning)', fontSize: '0.9rem' }}>
                  Barca in cantiere da {giorniInCantiere} {giorniInCantiere === 1 ? 'giorno' : 'giorni'}
                </div>
              </>
            )}
            {(visual === 'socio_presente' || visual === 'transito' || visual === 'affittuario_su_socio' || visual === 'bunker' || visual === 'socio_su_altro_posto') && occupante && (
              <>
                <div style={{ fontSize: '0.75rem', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 'bold' }}>Occupante</div>
                <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginTop: '4px' }}>{occupante.nome}</div>
                <div style={{ marginTop: '4px', fontSize: '0.85rem', color: 'var(--text2)' }}>
                  {occupanteCliente?.nome}
                  {occupanteIsSocioFuoriPosto && postoFissoOccupante && (
                    <> — socio temporaneo (posto fisso {postoFissoOccupante})</>
                  )}
                </div>
              </>
            )}
            {/* Caso edge: visual richiede occupante ma occupante non trovato (raro) */}
            {(visual === 'socio_presente' || visual === 'transito' || visual === 'affittuario_su_socio') && !occupante && (
              <div style={{ color: 'var(--text3)' }}>Stato incoerente — nessuna barca trovata</div>
            )}
          </div>
        </div>

        {/* Info Socio (proprietario amministrativo del posto) */}
        {socio && (
          <div className="drawer-section">
            <h3>Dati Proprietario (Socio)</h3>
            <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div className={`cs-avatar cs-av-so`} style={{ width: '40px', height: '40px' }}>
                  {socio.iniziali}
                </div>
                <div style={{ fontWeight: 'bold' }}>{socio.nome}</div>
              </div>
              <div style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>
                <div>Contatto: {socio.tel || '-'}</div>
                <div>Email: {socio.email || '-'}</div>
              </div>
              <button className="btn btn-outline" style={{ marginTop: '12px', width: '100%' }}>Vedi Fascicolo Completo</button>
            </div>
          </div>
        )}
        </div>

        {/* Azione di registrazione movimento.
            Strada A (Apr 2026): la mappa è "telecomando visivo" della Torre.
            Il drawer NON ospita le azioni: l'unico punto operativo per
            i movimenti è /torre. Il link porta lì con il posto già
            pre-selezionato via query param ?posto=XXX, gestito in TorrePage.
            Vedi memoria: dashboard_layout.md. */}
        <div className="drawer-foot">
          <Link
            to={`/torre?posto=${encodeURIComponent(berth.id)}`}
            className="btn btn-mode-entrata drawer-foot-btn"
            onClick={onClose}
          >
            Registra movimento →
          </Link>
        </div>
      </div>
    </div>
  )
}
