import React, { useState } from 'react'
import { useGlobalState } from '../../../store/GlobalState'

interface Props {
  onClose: () => void
}

export function ReportForm({ onClose }: Props) {
  const { addSegnalazione } = useGlobalState()

  const [zona, setZona] = useState('')
  const [tipoProblema, setTipoProblema] = useState('')
  const [descrizione, setDescrizione] = useState('')
  const [urgenza, setUrgenza] = useState<'normale' | 'urgente'>('normale')
  const [canale, setCanale] = useState<'di_persona' | 'telefono' | 'email' | 'ispezione'>('di_persona')
  const [assegnatoA, setAssegnatoA] = useState('manutenzione')
  const [errore, setErrore] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrore('')
    if (!zona.trim()) { setErrore('Inserisci la zona o localizzazione.'); return }
    if (!tipoProblema) { setErrore('Seleziona il tipo di problema.'); return }

    addSegnalazione({
      zona: zona.trim(),
      tipoProblema,
      descrizione: descrizione.trim() || undefined,
      urgenza,
      stato: 'dafare',
      canale,
      assegnatoA,
      dataSegnalazione: new Date().toISOString().split('T')[0],
    })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3 style={{ margin: '0 0 var(--space-lg) 0', color: 'var(--text)', fontFamily: 'var(--font-display)' }}>
        Nuova Segnalazione
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
          <label>Zona / Localizzazione *</label>
          <input
            type="text"
            value={zona}
            onChange={e => setZona(e.target.value)}
            placeholder="Es. Pontile B — lato destro"
          />
        </div>
        <div className="form-group">
          <label>Tipo Problema *</label>
          <select value={tipoProblema} onChange={e => setTipoProblema(e.target.value)}>
            <option value="">-- Seleziona --</option>
            <option value="Illuminazione pontile">Illuminazione pontile</option>
            <option value="Impianto elettrico">Impianto elettrico</option>
            <option value="Banchina/pavimentazione">Banchina / pavimentazione</option>
            <option value="Ormeggio">Ormeggio</option>
            <option value="Altro">Altro</option>
          </select>
        </div>
        <div className="form-group">
          <label>Urgenza</label>
          <select value={urgenza} onChange={e => setUrgenza(e.target.value as typeof urgenza)}>
            <option value="normale">Normale</option>
            <option value="urgente">Urgente</option>
          </select>
        </div>
        <div className="form-group">
          <label>Canale Segnalazione</label>
          <select value={canale} onChange={e => setCanale(e.target.value as typeof canale)}>
            <option value="di_persona">Di persona</option>
            <option value="telefono">Telefono</option>
            <option value="email">Email</option>
            <option value="ispezione">Ispezione</option>
          </select>
        </div>
        <div className="form-group">
          <label>Assegnato a</label>
          <select value={assegnatoA} onChange={e => setAssegnatoA(e.target.value)}>
            <option value="manutenzione">Manutenzione</option>
            <option value="ormeggiatori">Ormeggiatori</option>
            <option value="subacquei">Subacquei</option>
            <option value="esterno">Esterno</option>
          </select>
        </div>
        <div className="form-group form-group-full">
          <label>Descrizione</label>
          <textarea
            rows={3}
            value={descrizione}
            onChange={e => setDescrizione(e.target.value)}
            placeholder="Descrizione dettagliata del problema..."
          />
        </div>
      </div>

      <div className="maint-form-actions">
        <button type="button" className="btn btn-outline" onClick={onClose}>Annulla</button>
        <button type="submit" className="btn btn-mode-entrata">Inserisci Segnalazione</button>
      </div>
    </form>
  )
}
