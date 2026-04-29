import React, { useState } from 'react'
import { useGlobalState } from '../../../store/GlobalState'

interface Props {
  onClose: () => void
}

export function MaintenanceForm({ onClose }: Props) {
  const { addManutenzione } = useGlobalState()

  const [berthCodice, setBerthCodice] = useState('')
  const [tipoLavoro, setTipoLavoro] = useState('')
  const [descrizione, setDescrizione] = useState('')
  const [urgenza, setUrgenza] = useState<'normale' | 'urgente' | 'programmato'>('normale')
  const [assegnatoA, setAssegnatoA] = useState('Reparto subacquei')
  const [dataPrevista, setDataPrevista] = useState('')
  const [errore, setErrore] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrore('')
    if (!berthCodice.trim()) { setErrore('Inserisci il posto o l\'area.'); return }
    if (!tipoLavoro.trim()) { setErrore('Specifica il tipo di lavoro.'); return }
    if (!dataPrevista) { setErrore('Inserisci la data prevista.'); return }

    addManutenzione({
      berthCodice: berthCodice.trim().toUpperCase(),
      tipoLavoro: tipoLavoro.trim(),
      descrizione: descrizione.trim() || undefined,
      urgenza,
      stato: 'dafare',
      origine: 'manuale',
      assegnatoA: assegnatoA.trim(),
      dataPrevista,
    })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3 style={{ margin: '0 0 var(--space-lg) 0', color: 'var(--text)', fontFamily: 'var(--font-display)' }}>
        Nuovo Lavoro Subacqueo
      </h3>

      {errore && (
        <div style={{
          background: 'rgba(163,45,45,0.1)', border: '1px solid rgba(163,45,45,0.3)',
          color: 'var(--color-text-danger,#A32D2D)', padding: '10px 14px',
          borderRadius: '8px', fontSize: '0.88rem', marginBottom: 'var(--space-md)'
        }}>
          {errore}
        </div>
      )}

      <div className="maint-form-grid">
        <div className="form-group">
          <label>Posto / Area *</label>
          <input
            type="text"
            value={berthCodice}
            onChange={e => setBerthCodice(e.target.value)}
            placeholder="Es. C 1, Pontile Echo"
          />
        </div>
        <div className="form-group">
          <label>Tipo Lavoro *</label>
          <input
            type="text"
            value={tipoLavoro}
            onChange={e => setTipoLavoro(e.target.value)}
            placeholder="Es. Sostituzione catenaria"
          />
        </div>
        <div className="form-group">
          <label>Urgenza</label>
          <select value={urgenza} onChange={e => setUrgenza(e.target.value as typeof urgenza)}>
            <option value="normale">Normale</option>
            <option value="urgente">Urgente</option>
            <option value="programmato">Programmato</option>
          </select>
        </div>
        <div className="form-group">
          <label>Assegnato a</label>
          <input
            type="text"
            value={assegnatoA}
            onChange={e => setAssegnatoA(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Data Prevista *</label>
          <input
            type="date"
            value={dataPrevista}
            onChange={e => setDataPrevista(e.target.value)}
          />
        </div>
        <div className="form-group form-group-full">
          <label>Descrizione</label>
          <textarea
            rows={3}
            value={descrizione}
            onChange={e => setDescrizione(e.target.value)}
            placeholder="Dettaglio tecnico del lavoro..."
          />
        </div>
      </div>

      <div className="maint-form-actions">
        <button type="button" className="btn btn-outline" onClick={onClose}>Annulla</button>
        <button type="submit" className="btn btn-mode-entrata">Inserisci Lavoro</button>
      </div>
    </form>
  )
}
