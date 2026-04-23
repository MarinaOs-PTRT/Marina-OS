import React, { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { TopBar } from '../../components/TopBar'
import { Card } from '../../components/Card'
import { Badge } from '../../components/Badge'
import { useGlobalState } from '../../store/GlobalState'
import { Movement } from '@shared/types'

export function MovimentoPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const { barche, posti, addMovimento } = useGlobalState()
  
  const type = searchParams.get('type')
  const id = searchParams.get('id')
  const action = searchParams.get('action') as 'entrata' | 'uscita'
  
  const [ora, setOra] = useState(new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }))
  const [note, setNote] = useState('')

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
  let nomeBarca = 'Sconosciuta'
  let matricolaBarca = 'N/D'
  let postoBarcaId = ''
  
  if (type === 'boat') {
    const boat = barche.find(b => b.id.toString() === id)
    if (boat) {
      entityTitle = boat.nome
      entityDetails = `Matricola: ${boat.matricola} | Lunghezza: ${boat.lunghezza}m`
      nomeBarca = boat.nome
      matricolaBarca = boat.matricola
      postoBarcaId = boat.posto || ''
    }
  } else if (type === 'berth') {
    const berth = posti.find(p => p.id === id)
    if (berth) {
      entityTitle = `Posto ${berth.id}`
      entityDetails = `${berth.pontile} | ${berth.categoria}`
      postoBarcaId = berth.id
      // In un caso reale, cercheremmo la barca attualmente in questo posto
      nomeBarca = berth.barcaOra || 'Imbarcazione Transito'
      matricolaBarca = 'TRANSITO'
    }
  }

  const isEntrata = action === 'entrata'

  const handleSalva = () => {
    const nuovoMovimento: Movement = {
      id: Date.now(), // Genera ID univoco finto
      ora: ora,
      data: new Date().toISOString().split('T')[0],
      nome: nomeBarca,
      matricola: matricolaBarca,
      tipo: isEntrata ? 'entrata' : 'uscita',
      posto: postoBarcaId,
      scenario: 'transito', // Demo default
      auth: true,
      pagamento: 'Da saldare',
      note: note,
      operatore: { nome: 'Demo User', ruolo: 'torre', iniziali: 'DU' }
    }
    
    addMovimento(nuovoMovimento)
    navigate('/registro')
  }

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
          
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text2)' }}>Ora</label>
              <input 
                type="time" 
                value={ora} 
                onChange={e => setOra(e.target.value)}
                style={{ padding: '10px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontFamily: 'var(--font-ui)' }}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text2)' }}>Note</label>
              <textarea 
                value={note} 
                onChange={e => setNote(e.target.value)}
                placeholder="Eventuali note operative..."
                style={{ padding: '10px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontFamily: 'var(--font-ui)', minHeight: '80px', resize: 'vertical' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
              <button 
                className={`btn btn-${isEntrata ? 'green' : 'primary'}`}
                onClick={handleSalva}
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
