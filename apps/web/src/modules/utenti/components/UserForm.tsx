import React, { useState } from 'react'
import { SystemUser, UserRole } from '@shared/types'

interface Props {
  onSubmit: (user: Omit<SystemUser, 'id' | 'ultimoAccesso'>) => void
  onClose: () => void
}

export function UserForm({ onSubmit, onClose }: Props) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [ruolo, setRuolo] = useState<UserRole>('torre')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome || !email) return
    onSubmit({
      nome,
      email,
      ruolo,
      stato: 'attivo'
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="u-form-title">Crea Nuovo Profilo Operatore</h3>
      <div className="u-form-grid">
        <div className="form-group">
          <label>Nome Completo</label>
          <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Es. Mario Rossi" required />
        </div>
        <div className="form-group">
          <label>Email Lavorativa (Username)</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="mario.rossi@marinatraiano.it" required />
        </div>
        <div className="form-group">
          <label>Ruolo di Sistema</label>
          <select value={ruolo} onChange={e => setRuolo(e.target.value as UserRole)} required>
            <option value="direzione">Direzione (Admin completo)</option>
            <option value="torre">Torre di Controllo (Operativo)</option>
            <option value="ormeggiatore">Ormeggiatore (Sola lettura Mappa/Arrivi)</option>
          </select>
        </div>
      </div>
      <div className="u-form-actions">
        <button type="button" className="btn btn-outline" onClick={onClose}>Annulla</button>
        <button type="submit" className="btn btn-primary">Salva ed Invia Invito</button>
      </div>
    </form>
  )
}
