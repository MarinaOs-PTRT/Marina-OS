import React, { useState } from 'react'
import { Arrival } from '@shared/types'

interface Props {
  onSubmit: (a: Omit<Arrival, 'id' | 'createdAt'>) => void
  onClose:  () => void
}

export function ArrivalForm({ onSubmit, onClose }: Props) {
  const [nomeBarca,    setNomeBarca]    = useState('')
  const [matricola,    setMatricola]    = useState('')
  const [bandiera,     setBandiera]     = useState('')
  const [tipo,         setTipo]         = useState('motore')
  const [lunghezza,    setLunghezza]    = useState('')
  const [pescaggio,    setPescaggio]    = useState('')
  const [postoIndicato,setPostoIndicato]= useState('')
  const [dataPrevista, setDataPrevista] = useState('')
  const [oraPrevista,  setOraPrevista]  = useState('')
  const [note,         setNote]         = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nomeBarca || !matricola || !lunghezza || !postoIndicato || !dataPrevista) return

    // Data odierna in formato ISO (YYYY-MM-DD), coerente con il valore
    // scritto dall'input type="date".
    const oggi = new Date().toISOString().slice(0, 10)
    const stato = dataPrevista < oggi ? 'in_ritardo' : dataPrevista === oggi ? 'oggi' : 'atteso'

    onSubmit({
      nomeBarca,
      matricola,
      bandiera: bandiera || undefined,
      tipo,
      lunghezza: parseFloat(lunghezza),
      pescaggio: pescaggio ? parseFloat(pescaggio) : undefined,
      postoIndicato,
      dataPrevista,
      oraPrevista: oraPrevista || undefined,
      stato,
      note: note || undefined,
      inseritoDa: 'Operatore',
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="arr-form-title">Nuovo Arrivo Previsto</h3>
      <div className="arr-form-grid">
        <div className="form-group">
          <label>Nome Imbarcazione *</label>
          <input type="text" value={nomeBarca} onChange={e => setNomeBarca(e.target.value)} placeholder="Es. M/Y Neptune Dream" required />
        </div>
        <div className="form-group">
          <label>Matricola *</label>
          <input type="text" value={matricola} onChange={e => setMatricola(e.target.value)} placeholder="Es. IT-RM-2847" required />
        </div>
        <div className="form-group">
          <label>Bandiera</label>
          <input type="text" value={bandiera} onChange={e => setBandiera(e.target.value)} placeholder="Es. Italia" />
        </div>
        <div className="form-group">
          <label>Tipo</label>
          <select value={tipo} onChange={e => setTipo(e.target.value)}>
            <option value="motore">Motore</option>
            <option value="vela">Vela</option>
            <option value="catamarano">Catamarano</option>
            <option value="gommone">Gommone</option>
          </select>
        </div>
        <div className="form-group">
          <label>Lunghezza (m) *</label>
          <input type="number" step="0.1" min="1" max="100" value={lunghezza} onChange={e => setLunghezza(e.target.value)} placeholder="Es. 12.5" required />
        </div>
        <div className="form-group">
          <label>Pescaggio (m)</label>
          <input type="number" step="0.1" min="0.5" max="10" value={pescaggio} onChange={e => setPescaggio(e.target.value)} placeholder="Es. 1.8" />
        </div>
        <div className="form-group">
          <label>Posto Indicato *</label>
          <input type="text" value={postoIndicato} onChange={e => setPostoIndicato(e.target.value)} placeholder="Es. C 1" required />
        </div>
        <div className="form-group">
          <label>Data Prevista *</label>
          <input type="date" value={dataPrevista} onChange={e => setDataPrevista(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Ora Prevista</label>
          <input type="time" value={oraPrevista} onChange={e => setOraPrevista(e.target.value)} />
        </div>
        <div className="form-group full">
          <label>Note</label>
          <textarea rows={2} value={note} onChange={e => setNote(e.target.value)} placeholder="Es. Richiede allaccio 380V, 4 persone a bordo..." />
        </div>
      </div>
      <div className="arr-form-actions">
        <button type="button" className="btn btn-outline" onClick={onClose}>Annulla</button>
        <button type="submit" className="btn btn-mode-entrata">Inserisci Arrivo</button>
      </div>
    </form>
  )
}
