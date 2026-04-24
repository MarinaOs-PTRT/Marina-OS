import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../../../components/Card'
import { Badge } from '../../../components/Badge'
import { useGlobalState } from '../../../store/GlobalState'

/**
 * Widget Dashboard — lista dei transiti registrati al TEMPO 1 (Torre)
 * ma ancora privi di anagrafica completa / ricevuta.
 *
 * Criterio: `boat.registrazioneCompleta === false`.
 *
 * Il link "Completa" apre la pagina Registrazione Transiti in TEMPO 2,
 * dove Torre/Ufficio inserisce dati persona, dati barca e ricevuta.
 * Vedi memoria: transito_tempo1_tempo2.md
 */
export function PendingRegistrationsPanel() {
  const { barche, posti, clienti } = useGlobalState()

  const pendenti = barche.filter(b => b.registrazioneCompleta === false)

  return (
    <Card title={`⏳ Transiti da completare (${pendenti.length})`}>
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
          {pendenti.map(b => {
            const berth = b.posto ? posti.find(p => p.id === b.posto) : undefined
            const cliente = clienti.find(c => c.id === b.clientId)
            const isSkeleton = cliente?.nome.startsWith('Transito —')
            return (
              <div key={b.id} style={{
                padding: 'var(--space-md)',
                border: '1px solid var(--color-text-warning)',
                borderRadius: 'var(--radius)',
                background: 'var(--bg3)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong>{b.nome}</strong>
                  <Badge color="amber">In attesa</Badge>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text2)', marginBottom: 'var(--space-sm)' }}>
                  Matricola: {b.matricola || 'N/D'}<br />
                  Posto: {b.posto || '—'}{berth ? ` · ${berth.pontile}` : ''}<br />
                  Anagrafica: {isSkeleton ? <em>da compilare</em> : 'parziale'}
                </div>
                <Link
                  to="/registrazione-transiti"
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
