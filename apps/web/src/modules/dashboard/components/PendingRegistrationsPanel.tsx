import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../../../components/Card'
import { Badge } from '../../../components/Badge'
import { useGlobalState } from '../../../store/GlobalState'
import { MotivoPendenza } from '@shared/types'

/**
 * PendingRegistrationsPanel — "Registrazioni Pendenti".
 *
 * Vista unificata sostitutiva dei vecchi widget separati per transito e
 * affittuario. Consuma getRegistrazioniPendenti() del GlobalState (SSOT).
 *
 * Ogni card mostra:
 *   - chip TIPO: Transito (verde mare) o Affittuario (giallo sole)
 *   - chip MOTIVI: Anagrafica / Auth / Pagamento (uno o più, in arancione)
 *   - link "Completa →" → /completa-registrazione/:boatId
 *
 * Vedi memorie: dashboard_layout.md, registrazione_pendente_pattern.md
 */

const MOTIVO_LABEL: Record<MotivoPendenza, string> = {
  anagrafica: 'Anagrafica',
  auth: 'Autorizzazione',
  pagamento: 'Pagamento',
}

export function PendingRegistrationsPanel() {
  const { getRegistrazioniPendenti } = useGlobalState()
  const pendenti = getRegistrazioniPendenti()

  return (
    <Card title={`Registrazioni Pendenti (${pendenti.length})`}>
      {pendenti.length === 0 ? (
        <div style={{
          padding: 'var(--space-md)',
          fontSize: '0.9rem',
          color: 'var(--text3)',
          textAlign: 'center'
        }}>
          Nessuna registrazione in sospeso.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {pendenti.map(p => {
            const tipoColor = p.tipo === 'affittuario'
              ? 'var(--color-text-warning)'
              : 'var(--color-text-success)'
            const tipoBg = p.tipo === 'affittuario'
              ? 'var(--color-bg-warning)'
              : 'var(--color-bg-success)'
            const tipoLabel = p.tipo === 'affittuario' ? 'Affittuario' : 'Transito'

            return (
              <div key={`${p.boat.id}-${p.authPendente?.id ?? 'noauth'}`} style={{
                padding: 'var(--space-md)',
                border: '1px solid var(--border)',
                borderLeft: `3px solid ${tipoColor}`,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                borderRadius: 'var(--radius)',
                background: 'var(--bg3)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <strong>{p.boat.nome}</strong>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: tipoBg,
                    color: tipoColor,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}>{tipoLabel}</span>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--text2)', marginBottom: 'var(--space-sm)' }}>
                  Matricola: {p.boat.matricola || 'N/D'}<br />
                  {/* v3: usiamo p.berth.id come fonte autoritativa del posto.
                      Boat.posto è deprecated (modello v2), può essere stale.
                      Vedi memoria: model_v3_stati.md */}
                  Posto: {p.berth?.id || p.boat.posto || '—'}{p.berth ? ` · ${p.berth.pontile}` : ''}
                </div>

                {/* Chip per ogni motivo di pendenza */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 'var(--space-sm)' }}>
                  {p.motivi.map(m => (
                    <span key={m} style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 999,
                      background: 'var(--color-bg-warning)',
                      color: 'var(--color-text-warning)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}>{MOTIVO_LABEL[m]}</span>
                  ))}
                </div>

                <Link
                  to={`/completa-registrazione/${p.boat.id}`}
                  className="btn btn-mode-entrata"
                  style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                >
                  Completa →
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
