import React from 'react'
import { Client, OwnershipTitle, Berth, Authorization } from '@shared/types'

interface AggregatedSocio {
  socio: Client
  titolo?: OwnershipTitle
  posto?: Berth
  authAttiva?: Authorization
  statoPosto: string
  statoClass: string
}

interface Props {
  data: AggregatedSocio[]
}

export function SociTable({ data }: Props) {
  if (data.length === 0) return <div className="empty-message">Nessun socio trovato.</div>

  return (
    <table className="soci-table">
      <thead>
        <tr>
          <th>Socio</th>
          <th>Posto Assegnato</th>
          <th>Stato in Banchina</th>
          <th>Titolo Possesso</th>
          <th>Dettagli Titolo</th>
          <th>Autorizzazioni in corso</th>
        </tr>
      </thead>
      <tbody>
        {data.map(({ socio, titolo, posto, authAttiva, statoPosto, statoClass }) => (
          <tr key={socio.id}>
            <td>
              <div className="so-nome">{socio.nome}</div>
              <div className="so-tel">{socio.tel || socio.email}</div>
            </td>
            <td>
              <span className="so-posto">{titolo?.berthId || '—'}</span>
            </td>
            <td>
              <span className={`pill ${statoClass}`}>{statoPosto}</span>
            </td>
            <td>
              {titolo ? (
                <>
                  <div style={{ fontWeight: 600 }}>{titolo.numero}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>Azioni: {titolo.azioni} (Cat. {titolo.catAzioni})</div>
                </>
              ) : '—'}
            </td>
            <td>
              {titolo ? (
                <>
                  <div style={{ color: titolo.canone === 'Scaduto' ? 'var(--red)' : 'var(--text)' }}>
                    Canone: <strong>{titolo.canone}</strong>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>Scadenza: {titolo.scadenzaCanone}</div>
                </>
              ) : '—'}
            </td>
            <td>
              {authAttiva ? (
                <div>
                  <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{authAttiva.tipo}</span>: {authAttiva.beneficiario}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{authAttiva.dal} → {authAttiva.al}</div>
                </div>
              ) : (
                <span style={{ color: 'var(--text3)' }}>Nessuna</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
