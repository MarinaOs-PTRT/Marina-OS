import React, { useState } from 'react'
import { Client, Boat } from '@shared/types'
import { Card } from '../../../components/Card'
import { Badge } from '../../../components/Badge'

interface ClientProfileProps {
  client: Client
  boats: Boat[]
}

export function ClientProfile({ client, boats }: ClientProfileProps) {
  const [activeTab, setActiveTab] = useState('info')

  const typeMap: Record<string, { label: string, color: any }> = {
    pf: { label: 'Persona Fisica', color: 'accent' },
    az: { label: 'Azienda', color: 'purple' },
    so: { label: 'Socio', color: 'green' }
  }

  const typeInfo = typeMap[client.tipo]

  return (
    <div className="client-profile">
      {/* Hero Header */}
      <Card className="profile-hero" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div className={`cs-avatar cs-av-${client.tipo}`} style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
          {client.iniziali}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', color: 'var(--accent)', fontSize: '1.8rem' }}>
              {client.nome}
            </h2>
            <Badge color={typeInfo.color}>{typeInfo.label}</Badge>
          </div>
          <div style={{ color: 'var(--text2)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <span>📧 {client.email || 'Nessuna email'}</span>
            <span>📱 {client.tel || 'Nessun telefono'}</span>
            <span>🌍 {client.naz}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
          <button className="btn btn-primary">Modifica Dati</button>
          <button className="btn btn-outline">Invia Messaggio</button>
        </div>
      </Card>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '20px', gap: '24px' }}>
        {['info', 'imbarcazioni', 'documenti'].map(tab => (
          <div 
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ 
              padding: '12px 4px', 
              cursor: 'pointer', 
              fontWeight: 'bold',
              textTransform: 'uppercase',
              fontSize: '0.85rem',
              color: activeTab === tab ? 'var(--accent)' : 'var(--text3)',
              borderBottom: activeTab === tab ? '3px solid var(--accent)' : '3px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            {tab} {tab === 'imbarcazioni' && `(${boats.length})`}
          </div>
        ))}
        {client.tipo === 'so' && (
          <div 
            onClick={() => setActiveTab('posto')}
            style={{ 
              padding: '12px 4px', 
              cursor: 'pointer', 
              fontWeight: 'bold',
              textTransform: 'uppercase',
              fontSize: '0.85rem',
              color: activeTab === 'posto' ? 'var(--green)' : 'var(--text3)',
              borderBottom: activeTab === 'posto' ? '3px solid var(--green)' : '3px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            Posto Barca
          </div>
        )}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        
        {activeTab === 'info' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <Card title="Dati Anagrafici">
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 'bold' }}>Codice Fiscale / P.IVA</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>{client.cf || client.piva || '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 'bold' }}>Indirizzo / Sede</div>
                  <div>{client.indirizzo || client.sede || '-'}</div>
                </div>
              </div>
            </Card>

            {client.tipo === 'az' && client.referenti && (
              <Card title="Referenti Aziendali">
                <div style={{ display: 'grid', gap: '12px' }}>
                  {client.referenti.map((r, i) => (
                    <div key={i} style={{ padding: '12px', background: 'var(--bg3)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontWeight: 'bold' }}>{r.nome}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>{r.ruolo} · {r.tel}</div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'imbarcazioni' && (
          <Card title="Imbarcazioni Collegate" actions={<button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>+ Aggiungi</button>}>
            {boats.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text3)' }}>
                Nessuna imbarcazione collegata.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {boats.map(b => (
                  <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--bg2)' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ fontSize: '2rem' }}>⛵</div>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{b.nome}</div>
                        <div style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>
                          Matricola: <span style={{ fontFamily: 'var(--font-mono)' }}>{b.matricola}</span> · {b.tipo} · {b.lunghezza}m
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 'bold', color: 'var(--accent)' }}>Posto: {b.posto || '-'}</div>
                      <Badge color="gray">{b.bandiera}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {activeTab === 'documenti' && (
          <Card title="Documenti di Riconoscimento">
            {client.docTipo ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg3)', borderRadius: 'var(--radius)' }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{client.docTipo}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text2)', marginTop: '4px' }}>N. {client.docNum}</div>
                </div>
                <Badge color="green">Valido</Badge>
              </div>
            ) : (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text3)' }}>
                Nessun documento caricato.
              </div>
            )}
          </Card>
        )}

        {activeTab === 'posto' && client.tipo === 'so' && (
          <Card title="Dettaglio Posto Barca e Quote">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ padding: '20px', background: 'var(--green-bg)', borderRadius: 'var(--radius)', border: '1px solid var(--green-border)' }}>
                <div style={{ color: 'var(--green)', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px' }}>Posto Assegnato</div>
                <div style={{ fontSize: '3rem', fontFamily: 'var(--font-display)', color: 'var(--green)', lineHeight: 1 }}>{client.posto}</div>
                <div style={{ color: 'var(--green)', marginTop: '8px' }}>{client.pontile}</div>
              </div>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ background: 'var(--bg3)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 'bold' }}>Categoria Posto</div>
                  <div style={{ fontWeight: 'bold' }}>{client.catPosto}</div>
                </div>
                <div style={{ background: 'var(--bg3)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 'bold' }}>Dimensioni Massime</div>
                  <div style={{ fontWeight: 'bold' }}>{client.dimMax}</div>
                </div>
                <div style={{ background: 'var(--bg3)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 'bold' }}>Azioni Possedute</div>
                  <div style={{ fontWeight: 'bold' }}>{client.azioni} quote</div>
                </div>
              </div>
            </div>
          </Card>
        )}

      </div>
    </div>
  )
}
