import React, { useState, useEffect } from 'react'
import { Omnibar } from '../../../components/Omnibar'
import { useGlobalState } from '../../../store/GlobalState'
import { Berth } from '@shared/types'
import './QuickMovementPanel.css'

export function QuickMovementPanel() {
  const { posti, addMovimento } = useGlobalState()
  const [nome, setNome] = useState('')
  const [targa, setTarga] = useState('')
  const [lunghezza, setLunghezza] = useState('')
  const [pescaggio, setPescaggio] = useState('')
  const [posto, setPosto] = useState('')
  
  const [availableBerths, setAvailableBerths] = useState<Berth[]>([])

  useEffect(() => {
    const free = posti.filter(p => p.stato === 'libero')
    setAvailableBerths(free)
  }, [posti])

  // When user selects from Omnibar, pre-fill data
  const handleOmnibarAction = (action: string, data?: any) => {
    if (data?.original) {
      setNome(data.original.nome || '')
      setTarga(data.original.matricola || '')
      setPosto(data.original.posto || '')
    } else if (action === 'nuovo_transito') {
      setNome(data?.query || '')
      setTarga('')
      setLunghezza('')
      setPescaggio('')
      setPosto('')
    }
  }

  const handleClear = () => {
    setNome('')
    setTarga('')
    setPosto('')
    setLunghezza('')
    setPescaggio('')
  }

  const handleConfirm = (tipo: 'entrata' | 'uscita') => {
    if (!nome.trim()) {
      alert('Inserisci il nome dell\'imbarcazione.')
      return
    }
    if (tipo === 'entrata' && !posto.trim()) {
      alert('Inserisci o seleziona un posto barca.')
      return
    }

    addMovimento({
      id: Date.now(),
      ora: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      data: new Date().toISOString().split('T')[0],
      nome,
      matricola: targa || 'N/D',
      tipo,
      posto: posto || '—',
      scenario: 'transito',
      auth: true,
      pagamento: 'Da saldare',
      operatore: { nome: 'Operatore', ruolo: 'torre', iniziali: 'OP' }
    })

    alert(`Movimento di ${tipo} registrato per ${nome}`)
    handleClear()
  }

  return (
    <div className="quick-panel-container expanded">
      {/* Search Bar */}
      <div className="quick-panel-header">
        <div style={{ flex: 1 }}>
          <Omnibar onAction={handleOmnibarAction} />
        </div>
      </div>

      {/* Form Body */}
      <div className="quick-panel-body">
        <div className="quick-panel-title">
          <h3>Registra Movimento</h3>
          <p>Inserisci i dati e premi Entrata o Uscita per confermare.</p>
        </div>
        
        <div className="quick-panel-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Nome Imbarcazione</label>
              <input 
                type="text" 
                value={nome} 
                onChange={e => setNome(e.target.value)} 
                placeholder="Es. Flying Dutchman"
                required
              />
            </div>

            <div className="form-group">
              <label>Targa / Matricola</label>
              <input 
                type="text" 
                value={targa} 
                onChange={e => setTarga(e.target.value)} 
                placeholder="Es. NL-12345"
              />
            </div>

            <div className="form-group">
              <label>Lunghezza (m)</label>
              <input 
                type="number" 
                step="0.1" 
                value={lunghezza} 
                onChange={e => setLunghezza(e.target.value)} 
                placeholder="12.5"
              />
            </div>

            <div className="form-group">
              <label>Pescaggio (m)</label>
              <input 
                type="number" 
                step="0.1" 
                value={pescaggio} 
                onChange={e => setPescaggio(e.target.value)} 
                placeholder="2.1"
              />
            </div>

            <div className="form-group">
              <label>Posto Barca</label>
              <input 
                type="text" 
                className="posto-input"
                value={posto} 
                onChange={e => setPosto(e.target.value)} 
                placeholder="Es. A-05"
              />
            </div>
          </div>

          {/* Berth Suggestion Panel */}
          {availableBerths.length > 0 && (
            <div className="berths-suggestion-panel">
              <h4>Posti Liberi Disponibili</h4>
              <div className="berths-grid">
                {availableBerths.map(b => (
                  <button 
                    type="button"
                    key={b.id} 
                    className={`berth-chip ${posto === b.id ? 'selected' : ''}`}
                    onClick={() => setPosto(b.id)}
                  >
                    {b.id}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons: Entrata / Uscita as CONFIRM */}
          <div className="quick-panel-actions">
            <button type="button" className="btn btn-outline" onClick={handleClear}>Pulisci</button>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="button" 
                className="btn btn-mode-uscita" 
                onClick={() => handleConfirm('uscita')}
              >
                ↓ Uscita
              </button>
              <button 
                type="button" 
                className="btn btn-mode-entrata" 
                onClick={() => handleConfirm('entrata')}
              >
                ↑ Entrata
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
