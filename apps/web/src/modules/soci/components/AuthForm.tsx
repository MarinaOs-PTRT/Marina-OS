import React, { useState } from 'react'
import { Authorization, Client, AuthType } from '@shared/types'
import { useGlobalState } from '../../../store/GlobalState'

interface Props {
  onSubmit: (auth: Omit<Authorization, 'id'>) => void
  onClose: () => void
  soci: Client[]
}

export function AuthForm({ onSubmit, onClose, soci }: Props) {
  const { titoli } = useGlobalState()
  const [socioId, setSocioId] = useState('')
  const [tipo, setTipo] = useState<AuthType>('affitto')
  const [beneficiario, setBeneficiario] = useState('')
  const [tel, setTel] = useState('')
  const [barca, setBarca] = useState('')
  const [matricola, setMatricola] = useState('')
  const [dal, setDal] = useState('')
  const [al, setAl] = useState('')
  const [note, setNote] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!socioId || !beneficiario || !barca || !dal || !al) return

    const sId = parseInt(socioId)
    const titolo = titoli.find(t => t.clientId === sId)
    if (!titolo) {
      alert("Il socio selezionato non ha un posto fisso assegnato.")
      return
    }

    const d1 = new Date(dal)
    const d2 = new Date(al)
    const residui = Math.max(0, Math.round((d2.getTime() - new Date().getTime()) / 86400000))

    onSubmit({
      socioId: sId,
      berthId: titolo.berthId,
      tipo,
      beneficiario,
      tel,
      barca,
      matricola,
      dal,
      al,
      giorniResidui: residui,
      stato: 'attiva',
      note,
      authDa: 'Operatore Torre'
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="so-form-title">Registra Nuova Autorizzazione</h3>
      <div className="so-form-grid">
        <div className="form-group">
          <label>Socio Titolare *</label>
          <select value={socioId} onChange={e => setSocioId(e.target.value)} required>
            <option value="">Seleziona socio...</option>
            {soci.map(s => (
              <option key={s.id} value={s.id}>{s.nome} ({s.posto || 'Senza posto'})</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Tipo Autorizzazione *</label>
          <select value={tipo} onChange={e => setTipo(e.target.value as AuthType)} required>
            <option value="affitto">Affitto (a pagamento)</option>
            <option value="ospite">Ospite (gratuito)</option>
            <option value="amico">Amico (gratuito)</option>
          </select>
        </div>
        <div className="form-group">
          <label>Beneficiario *</label>
          <input type="text" value={beneficiario} onChange={e => setBeneficiario(e.target.value)} placeholder="Nome e Cognome" required />
        </div>
        <div className="form-group">
          <label>Telefono Beneficiario</label>
          <input type="text" value={tel} onChange={e => setTel(e.target.value)} placeholder="+39..." />
        </div>
        <div className="form-group">
          <label>Nome Barca *</label>
          <input type="text" value={barca} onChange={e => setBarca(e.target.value)} placeholder="Es. M/Y Stella" required />
        </div>
        <div className="form-group">
          <label>Matricola</label>
          <input type="text" value={matricola} onChange={e => setMatricola(e.target.value)} placeholder="Es. IT-RM-1234" />
        </div>
        <div className="form-group">
          <label>Data Inizio *</label>
          <input type="date" value={dal} onChange={e => setDal(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Data Fine (Obbligatoria) *</label>
          <input type="date" value={al} onChange={e => setAl(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Note aggiuntive</label>
          <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Documenti verificati, info specifiche..." />
        </div>
      </div>
      <div className="so-form-actions">
        <button type="button" className="btn btn-outline" onClick={onClose}>Annulla</button>
        <button type="submit" className="btn btn-primary">Salva Autorizzazione</button>
      </div>
    </form>
  )
}
