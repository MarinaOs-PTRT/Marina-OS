import React from 'react'
import { Movement } from '@shared/types'
import { MOVEMENT_TYPE_LABELS, MOVEMENT_TYPE_CLASS, SCENARIO_LABELS } from '@shared/constants'
import { Badge } from '../../../components/Badge'
import { useGlobalState } from '../../../store/GlobalState'

interface RegistroTableProps {
  movements: Movement[]
  onSelect: (mov: Movement) => void
}

/**
 * Calcola lo stato di "completezza" della pratica per un movimento.
 *
 * Distinzione semantica importante (25 Apr 2026):
 *  - `m.auth` = autorizzazione del proprietario del posto. Per transiti
 *    è sempre true (non serve auth). Per affittuari richiede Authorization
 *    formale firmata dalla Direzione.
 *  - `boat.registrazioneCompleta` = anagrafica completata in Ufficio.
 *    False per scheletri creati al volo dalla Torre, true dopo
 *    completamento via /completa-registrazione.
 *
 * In tabella la cella "Aut." DEVE riflettere ENTRAMBI gli aspetti, non
 * solo `m.auth`, altrimenti l'operatore vede "✓ OK" sotto un transito
 * sconosciuto e crede di aver chiuso la pratica quando in realtà
 * l'anagrafica è ancora vuota.
 *
 * Returns:
 *  - 'attesa-auth'  → flag_attesa_auth=true (auth pendente in Direzione)
 *  - 'incompleta'   → m.auth=true ma anagrafica boat incompleta
 *  - 'ok'           → tutto a posto
 *  - 'na'           → m.auth=false e nessuna delle altre condizioni
 */
function computeAuthStatus(
  m: Movement,
  isBoatIncompleta: boolean
): 'attesa-auth' | 'incompleta' | 'ok' | 'na' {
  if (m.flag_attesa_auth) return 'attesa-auth'
  if (m.auth && isBoatIncompleta) return 'incompleta'
  if (m.auth) return 'ok'
  return 'na'
}

export function RegistroTable({ movements, onSelect }: RegistroTableProps) {
  const { barche } = useGlobalState()

  // Helper: matching case-insensitive su nome o matricola.
  const isBoatIncompleta = (m: Movement): boolean => {
    const n = m.nome.trim().toLowerCase()
    const t = (m.matricola || '').trim().toLowerCase()
    const boat = barche.find(b =>
      (n && b.nome.toLowerCase() === n) ||
      (t && t !== 'n/d' && b.matricola.toLowerCase() === t)
    )
    return !!boat && boat.registrazioneCompleta === false
  }

  if (movements.length === 0) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text3)' }}>
        <div style={{ fontSize: '2rem', marginBottom: '16px' }}>📭</div>
        <h3>Nessun movimento trovato</h3>
        <p>Modifica i filtri per vedere altri risultati.</p>
      </div>
    )
  }

  return (
    <div className="table-wrap">
      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg4)', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text2)', textTransform: 'uppercase' }}>Risultati</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{movements.length} movimenti</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Data e Ora</th>
            <th>Imbarcazione</th>
            <th>Posto</th>
            <th>Tipo</th>
            <th>Scenario</th>
            <th>Aut.</th>
            <th>Operatore</th>
          </tr>
        </thead>
        <tbody>
          {movements.map(m => (
            <tr key={m.id} onClick={() => onSelect(m)} style={{ cursor: 'pointer' }}>
              <td>
                <div style={{ fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>{m.ora}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>{m.data || 'Oggi'}</div>
              </td>
              <td>
                <div style={{ fontWeight: 'bold' }}>{m.nome}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>{m.matricola || 'N/A'}</div>
              </td>
              <td>
                <div style={{ fontWeight: 'bold', color: 'var(--accent)' }}>{m.posto}</div>
              </td>
              <td>
                <Badge color={MOVEMENT_TYPE_CLASS[m.tipo].replace('pill-', '') as any}>
                  {MOVEMENT_TYPE_LABELS[m.tipo]}
                </Badge>
              </td>
              <td>
                <Badge color="gray">{SCENARIO_LABELS[m.scenario]}</Badge>
              </td>
              <td>
                {(() => {
                  const status = computeAuthStatus(m, isBoatIncompleta(m))
                  if (status === 'attesa-auth') {
                    return (
                      <span
                        style={{ color: 'var(--color-text-warning)', fontWeight: 'bold', fontSize: '0.8rem' }}
                        title="In attesa di Autorizzazione — da compilare in Direzione"
                      >In attesa auth</span>
                    )
                  }
                  if (status === 'incompleta') {
                    return (
                      <span
                        style={{ color: 'var(--color-text-warning)', fontWeight: 'bold', fontSize: '0.8rem' }}
                        title="Anagrafica della barca non completata — completare in /completa-registrazione"
                      >Attesa Registrazione</span>
                    )
                  }
                  if (status === 'ok') {
                    return <span style={{ color: 'var(--color-text-success)', fontWeight: 'bold' }}>OK</span>
                  }
                  return <span style={{ color: 'var(--text3)' }}>-</span>
                })()}
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '24px', height: '24px', 
                    borderRadius: '50%', background: 'var(--bg3)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', fontWeight: 'bold'
                  }}>
                    {m.operatore.iniziali}
                  </div>
                  <span style={{ fontSize: '0.85rem' }}>{m.operatore.nome}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
