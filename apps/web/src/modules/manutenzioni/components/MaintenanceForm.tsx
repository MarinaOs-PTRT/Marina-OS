import React, { useState } from 'react'

interface Props {
  onClose: () => void
}

export function MaintenanceForm({ onClose }: Props) {
  const [berthCodice, setBerthCodice] = useState('')
  const [tipoLavoro, setTipoLavoro] = useState('')
  const [descrizione, setDescrizione] = useState('')
  const [urgenza, setUrgenza] = useState('normale')
  const [assegnatoA, setAssegnatoA] = useState('Reparto subacquei')
  const [dataPrevista, setDataPrevista] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Lavoro subacqueo inserito!\nPosto: ${berthCodice}\nTipo: ${tipoLavoro}`)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3 style={{ margin: '0 0 var(--space-lg) 0', color: 'var(--text)', fontFamily: 'var(--font-display)' }}>Nuovo Lavoro Subacqueo</h3>
      <div className="maint-form-grid">
        <div className="form-group">
          <label>Posto / Area</label>
          <input type="text" value={berthCodice} onChange={e => setBerthCodice(e.target.value)} placeholder="Es. C 1, Pontile Echo" required />
        </div>
        <div className="form-group">
          <label>Tipo Lavoro</label>
          <input type="text" value={tipoLavoro} onChange={e => setTipoLavoro(e.target.value)} placeholder="Es. Sostituzione catenaria" required />
        </div>
        <div className="form-group">
          <label>Urgenza</label>
          <select value={urgenza} onChange={e => setUrgenza(e.target.value)}>
            <option value="normale">Normale</option>
            <option value="urgente">Urgente</option>
            <option value="programmato">Programmato</option>
          </select>
        </div>
        <div className="form-group">
          <label>Assegnato a</label>
          <input type="text" value={assegnatoA} onChange={e => setAssegnatoA(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Data Prevista</label>
          <input type="date" value={dataPrevista} onChange={e => setDataPrevista(e.target.value)} required />
        </div>
        <div className="form-group form-group-full">
          <label>Descrizione</label>
          <textarea rows={3} value={descrizione} onChange={e => setDescrizione(e.target.value)} placeholder="Dettaglio tecnico del lavoro..." />
        </div>
      </div>
      <div className="maint-form-actions">
        <button type="button" className="btn btn-outline" onClick={onClose}>Annulla</button>
        <button type="submit" className="btn btn-mode-entrata">Inserisci Lavoro</button>
      </div>
    </form>
  )
}
