import React from 'react'
import { Berth } from '@shared/types'
import { useGlobalState } from '../../../store/GlobalState'
import { Badge } from '../../../components/Badge'
import { BERTH_STATUS_LABELS } from '@shared/constants'

const BERTH_STATUS_BADGE: Record<string, any> = {
  libero: 'green',
  occupato_socio: 'accent',
  socio_assente: 'gray',
  socio_assente_lungo: 'gray',
  occupato_transito: 'teal',
  transito_assente: 'gray',
  occupato_affittuario: 'purple',
  affittuario_assente: 'gray',
  in_cantiere: 'red',
}

interface BerthDetailDrawerProps {
  berth: Berth
  onClose: () => void
}

export function BerthDetailDrawer({ berth, onClose }: BerthDetailDrawerProps) {
  const { clienti } = useGlobalState()
  // Trovo il socio proprietario se presente
  const socio = berth.socioId ? clienti.find(c => c.id === berth.socioId) : null

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
          <Badge color={BERTH_STATUS_BADGE[berth.stato]}>{BERTH_STATUS_LABELS[berth.stato]}</Badge>
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

        {/* Info Imbarcazione / Stato */}
        <div className="drawer-section">
          <h3>Situazione Attuale</h3>
          <div style={{ padding: '16px', background: 'var(--bg3)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 'bold' }}>Occupante</div>
            <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginTop: '4px' }}>{berth.barcaOra || '-'}</div>
          </div>
        </div>

        {/* Info Socio */}
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

        {/* Piantina = sola lettura. I movimenti si registrano nel
            QuickMovementPanel della Dashboard. Deciso con Ale il 24 Apr 2026. */}
      </div>
    </div>
  )
}
