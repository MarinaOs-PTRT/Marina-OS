import React, { useState } from 'react'
import { Authorization, Client, AuthType } from '@shared/types'
import { useGlobalState } from '../../../store/GlobalState'

interface Props {
  onSubmit: (auth: Omit<Authorization, 'id'>) => void
  onClose: () => void
  soci: Client[]
  /** Se valorizzato, il form parte in modalità EDIT (completa una pendente).
   *  Socio e posto vengono bloccati perché legati al placeholder originale
   *  creato dalla Torre al momento dell'ingresso fisico della barca. */
  initial?: Authorization
}

export function AuthForm({ onSubmit, onClose, soci, initial }: Props) {
  const { titoli } = useGlobalState()
  const isEditMode = initial !== undefined

  // Pre-popolazione dai dati che la Torre aveva inserito (in edit-mode)
  // o stringhe vuote/default per la creazione manuale.
  const [socioId, setSocioId] = useState(initial ? String(initial.socioId) : '')
  const [tipo, setTipo] = useState<AuthType>(initial?.tipo ?? 'affitto')
  const [beneficiario, setBeneficiario] = useState(initial?.beneficiario ?? '')
  const [tel, setTel] = useState(initial?.tel ?? '')
  const [barca, setBarca] = useState(initial?.barca ?? '')
  const [matricola, setMatricola] = useState(initial?.matricola ?? '')
  const [dal, setDal] = useState(initial?.dal ?? '')
  const [al, setAl] = useState(initial?.al ?? '')
  const [note, setNote] = useState(initial?.note ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!socioId || !beneficiario || !barca || !dal || !al) return

    const sId = parseInt(socioId)

    // In edit-mode: usa il berthId originale (è bloccato in UI ma confermiamo qui).
    // In create-mode: deriva dal titolo di possesso del socio selezionato.
    let berthId: string
    if (isEditMode) {
      berthId = initial!.berthId
    } else {
      const titolo = titoli.find(t => t.clientId === sId)
      if (!titolo) {
        alert("Il socio selezionato non ha un posto fisso assegnato.")
        return
      }
      berthId = titolo.berthId
    }

    const d2 = new Date(al)
    const oggi = new Date()
    oggi.setHours(0, 0, 0, 0)
    const residui = Math.max(0, Math.round((d2.getTime() - oggi.getTime()) / 86400000))

    onSubmit({
      socioId: sId,
      berthId,
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
      authDa: isEditMode ? 'Direzione' : 'Operatore Torre',
      // In edit-mode preserviamo la tracciabilità dell'origine (Torre).
      creatoDaMovementId: initial?.creatoDaMovementId,
      creatoDa: initial?.creatoDa,
      creatoIl: initial?.creatoIl
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="so-form-title">
        {isEditMode
          ? `Completa Autorizzazione — Posto ${initial!.berthId}`
          : 'Registra Nuova Autorizzazione'}
      </h3>

      {isEditMode && (
        <div style={{
          background: 'var(--bg2)',
          border: '1px solid var(--color-text-warning)',
          borderRadius: '6px',
          padding: '10px 14px',
          marginBottom: '14px',
          fontSize: '0.85rem'
        }}>
          ⚠ <strong>Modalità completamento.</strong> La Torre ha registrato l'ingresso il{' '}
          {initial!.creatoIl ? new Date(initial!.creatoIl).toLocaleString('it-IT') : 'data non disponibile'}
          {initial!.creatoDa && ` (operatore: ${initial!.creatoDa})`}.
          Verifica i dati provvisori, completa periodo e tipo, salva per attivare l'autorizzazione.
        </div>
      )}

      <div className="so-form-grid">
        <div className="form-group">
          <label>Socio Titolare *</label>
          <select
            value={socioId}
            onChange={e => setSocioId(e.target.value)}
            required
            disabled={isEditMode}
          >
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
        <button type="submit" className="btn btn-primary">
          {isEditMode ? 'Salva e Attiva' : 'Salva Autorizzazione'}
        </button>
      </div>
    </form>
  )
}
