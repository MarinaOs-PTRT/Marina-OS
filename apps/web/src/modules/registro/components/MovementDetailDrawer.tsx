import React from 'react'
import { Movement } from '@shared/types'
import { Badge } from '../../../components/Badge'
import { MOVEMENT_TYPE_LABELS, MOVEMENT_TYPE_CLASS, SCENARIO_LABELS } from '@shared/constants'
import './MovementDetailDrawer.css'

interface DrawerProps {
  movement: Movement | null
  onClose: () => void
}

export function MovementDetailDrawer({ movement, onClose }: DrawerProps) {
  if (!movement) return null

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" onClick={e => e.stopPropagation()}>
        <div className="drawer-hdr">
          <h3 className="drawer-title">Dettaglio Movimento #{movement.id}</h3>
          <button className="drawer-close" onClick={onClose}>×</button>
        </div>
        
        <div className="drawer-body">
          <div className="drawer-section">
            <div className="drawer-section-title">Generale</div>
            <div className="drawer-grid">
              <div className="drawer-field">
                <div className="drawer-field-label">Data e Ora</div>
                <div className="drawer-field-val">
                  {movement.data || 'Oggi'} <span style={{ fontFamily: 'var(--font-mono)' }}>{movement.ora}</span>
                </div>
              </div>
              <div className="drawer-field">
                <div className="drawer-field-label">Tipo Movimento</div>
                <div className="drawer-field-val">
                  <Badge color={MOVEMENT_TYPE_CLASS[movement.tipo].replace('pill-', '') as any}>
                    {MOVEMENT_TYPE_LABELS[movement.tipo]}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="drawer-section">
            <div className="drawer-section-title">Imbarcazione & Posto</div>
            <div className="drawer-grid">
              <div className="drawer-field full">
                <div className="drawer-field-label">Imbarcazione</div>
                <div className="drawer-field-val" style={{ fontSize: '1.1rem' }}>{movement.nome}</div>
                <div className="drawer-field-label" style={{ marginTop: '4px' }}>Matricola: <span style={{ fontFamily: 'var(--font-mono)' }}>{movement.matricola}</span></div>
              </div>
              <div className="drawer-field">
                <div className="drawer-field-label">Scenario</div>
                <div className="drawer-field-val">{SCENARIO_LABELS[movement.scenario]}</div>
              </div>
              <div className="drawer-field">
                <div className="drawer-field-label">Posto Barca</div>
                <div className="drawer-field-val" style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{movement.posto}</div>
              </div>
            </div>
          </div>

          <div className="drawer-section">
            <div className="drawer-section-title">Operatore & Note</div>
            <div className="drawer-grid">
              <div className="drawer-field full">
                <div className="drawer-field-label">Operatore Torre</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                  <div style={{
                    width: '32px', height: '32px', 
                    borderRadius: '50%', background: 'var(--accent-light)', color: 'var(--accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.85rem', fontWeight: 'bold'
                  }}>
                    {movement.operatore.iniziali}
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{movement.operatore.nome}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>{movement.operatore.ruolo}</div>
                  </div>
                </div>
              </div>
              <div className="drawer-field full">
                <div className="drawer-field-label">Autorizzazione</div>
                <div className="drawer-field-val">
                  {movement.flag_attesa_auth ? (
                    <span style={{ color: 'var(--color-text-warning)' }}>
                      ⏳ In attesa di Autorizzazione — la Direzione deve compilare il documento
                    </span>
                  ) : movement.auth ? (
                    <span style={{ color: 'var(--green)' }}>✓ Autorizzato (Sistema Automatico)</span>
                  ) : (
                    <span style={{ color: 'var(--amber)' }}>⚠ In attesa di verifica manuale</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="drawer-actions">
          <button className="btn btn-outline" style={{ flex: 1 }}>Stampa Ricevuta</button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={onClose}>Chiudi</button>
        </div>
      </div>
    </div>
  )
}
