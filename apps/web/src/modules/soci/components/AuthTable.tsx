import React from 'react'
import { Authorization } from '@shared/types'
import { useGlobalState } from '../../../store/GlobalState'

type TableMode = 'attive' | 'pendenti' | 'storico'

interface Props {
  data: Authorization[]
  type: TableMode
  onRevoca?: (id: number) => void
  onCompleta?: (auth: Authorization) => void
}

const EMPTY_LABEL: Record<TableMode, string> = {
  attive: 'Nessuna autorizzazione attiva.',
  pendenti: 'Nessuna autorizzazione da compilare.',
  storico: 'Nessuna autorizzazione nello storico.'
}

/**
 * Calcola i giorni residui a partire dalla data fine — sempre fresca.
 * Fix (29 Apr 2026): prima veniva letto `a.giorniResidui` salvato al
 * momento della creazione e mai aggiornato. Adesso è sempre calcolato
 * a render-time da `al` (data fine) - oggi.
 */
function calcolaGiorniResidui(al: string | undefined): number | null {
  if (!al) return null
  const oggi = new Date()
  oggi.setHours(0, 0, 0, 0)
  const fine = new Date(al)
  if (isNaN(fine.getTime())) return null
  return Math.max(0, Math.round((fine.getTime() - oggi.getTime()) / 86400000))
}

export function AuthTable({ data, type, onRevoca, onCompleta }: Props) {
  // Fix (29 Apr 2026): colonna "Socio Proprietario" — senza useGlobalState
  // non era possibile risolvere socioId → nome. La colonna prima mancava.
  const { clienti } = useGlobalState()

  if (data.length === 0) {
    return <div className="empty-message">{EMPTY_LABEL[type]}</div>
  }

  const showAzioni = type === 'attive' || type === 'pendenti'

  return (
    <table className="soci-table">
      <thead>
        <tr>
          <th>Posto</th>
          <th>Socio Proprietario</th>
          <th>Beneficiario</th>
          <th>Tipo</th>
          <th>Periodo</th>
          {type === 'attive' && <th>Giorni Residui</th>}
          <th>Barca</th>
          <th>Autorizzato Da</th>
          <th>Stato</th>
          {showAzioni && <th>Azioni</th>}
        </tr>
      </thead>
      <tbody>
        {data.map(a => {
          const socioPropr = a.socioId ? clienti.find(c => c.id === a.socioId) : undefined
          const giorniResidui = calcolaGiorniResidui(a.al)
          // Evidenzia in rosso se restano meno di 7 giorni
          const giorniColor = giorniResidui !== null && giorniResidui <= 7
            ? 'var(--color-text-danger)'
            : giorniResidui !== null && giorniResidui <= 30
              ? 'var(--color-text-warning)'
              : undefined

          return (
            <tr key={a.id}>
              <td><span className="so-posto">{a.berthId}</span></td>
              <td>
                {socioPropr
                  ? <span style={{ fontWeight: 500 }}>{socioPropr.nome}</span>
                  : <span style={{ color: 'var(--text3)', fontStyle: 'italic' }}>—</span>
                }
              </td>
              <td>
                <div className="so-nome">{a.beneficiario}</div>
                <div className="so-tel">{a.tel}</div>
              </td>
              <td style={{ textTransform: 'capitalize', fontWeight: 600 }}>{a.tipo}</td>
              <td style={{ fontSize: '0.85rem' }}>
                {a.stato === 'pendente' ? (
                  <span style={{ color: 'var(--color-text-warning)', fontStyle: 'italic' }}>Da compilare</span>
                ) : (
                  <>{a.dal}<br />{a.al}</>
                )}
              </td>
              {type === 'attive' && (
                <td>
                  <strong style={{ color: giorniColor }}>
                    {giorniResidui !== null ? `${giorniResidui} gg` : '—'}
                  </strong>
                </td>
              )}
              <td>
                <div style={{ fontWeight: 600 }}>{a.barca}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{a.matricola}</div>
              </td>
              <td>{a.authDa ?? <span style={{ color: 'var(--text3)' }}>—</span>}</td>
              <td>
                <span className={`pill pill-auth-${a.stato}`}>
                  {a.stato === 'pendente'
                    ? 'In attesa di Autorizzazione'
                    : a.stato.charAt(0).toUpperCase() + a.stato.slice(1)}
                </span>
              </td>
              {type === 'attive' && (
                <td>
                  <button className="btn-revoca" onClick={() => onRevoca?.(a.id)}>Revoca</button>
                </td>
              )}
              {type === 'pendenti' && (
                <td>
                  <button
                    className="btn btn-primary"
                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                    onClick={() => onCompleta?.(a)}
                  >
                    Completa
                  </button>
                </td>
              )}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
