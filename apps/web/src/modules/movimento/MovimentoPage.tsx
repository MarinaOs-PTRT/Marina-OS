import React from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { TopBar } from '../../components/TopBar'
import { Card } from '../../components/Card'
import { Badge } from '../../components/Badge'
import { BARCHE_DEMO, POSTI_DEMO } from '@shared/demo-data'

export function MovimentoPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const type = searchParams.get('type')
  const id = searchParams.get('id')
  const action = searchParams.get('action') // 'entrata' | 'uscita'
  
  if (!type || !id) {
    return (
      <>
        <TopBar title="Registra Movimento" />
        <div className="page-container">
          <Card>
            <div style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text3)' }}>
              <h3>Nessuna imbarcazione selezionata</h3>
              <p>Usa la barra di ricerca in alto (Ctrl+K) per trovare la barca o il posto da registrare.</p>
            </div>
          </Card>
        </div>
      </>
    )
  }

  let entityTitle = ''
  let entityDetails = ''
  
  if (type === 'boat') {
    const boat = BARCHE_DEMO.find(b => b.id.toString() === id)
    if (boat) {
      entityTitle = boat.nome
      entityDetails = `Matricola: ${boat.matricola} | Lunghezza: ${boat.lunghezza}m`
    }
  } else if (type === 'berth') {
    const berth = POSTI_DEMO.find(p => p.id === id)
    if (berth) {
      entityTitle = `Posto ${berth.id}`
      entityDetails = `${berth.pontile} | ${berth.categoria}`
    }
  }

  const isEntrata = action === 'entrata'

  return (
    <>
      <TopBar title={`Registra ${isEntrata ? 'Entrata' : 'Uscita'}`} />
      <div className="page-container">
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)', marginBottom: '8px' }}>
                {entityTitle}
              </h2>
              <div style={{ color: 'var(--text2)' }}>{entityDetails}</div>
            </div>
            <div>
              <Badge color={isEntrata ? 'green' : 'amber'}>
                {isEntrata ? '↑ Entrata' : '↓ Uscita'}
              </Badge>
            </div>
          </div>
          
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-xl)' }}>
            <p style={{ color: 'var(--text3)' }}>
              <em>Il form completo di registrazione verrà implementato nelle prossime fasi del refactoring.</em>
            </p>
            
            <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>
              <button 
                className={`btn btn-${isEntrata ? 'green' : 'primary'}`}
                onClick={() => alert(`Registrazione ${isEntrata ? 'Entrata' : 'Uscita'} simulata con successo!`)}
              >
                Conferma Registrazione
              </button>
              <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>
                Annulla
              </button>
            </div>
          </div>
        </Card>
      </div>
    </>
  )
}
