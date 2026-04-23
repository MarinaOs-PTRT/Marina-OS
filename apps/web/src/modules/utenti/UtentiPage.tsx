import React, { useState } from 'react'
import { TopBar } from '../../components/TopBar'
import { UserTable } from './components/UserTable'
import { UserForm } from './components/UserForm'
import { useGlobalState } from '../../store/GlobalState'
import { SystemUser } from '@shared/types'
import './UtentiPage.css'

export function UtentiPage() {
  const { utenti: utentiGlobali } = useGlobalState()
  const [utenti, setUtenti] = useState<SystemUser[]>(utentiGlobali)
  const [showForm, setShowForm] = useState(false)

  const attivi = utenti.filter(u => u.stato === 'attivo').length
  const direzione = utenti.filter(u => u.ruolo === 'direzione').length

  const handleToggleStato = (id: number) => {
    setUtenti(prev => prev.map(u => {
      if (u.id === id) {
        return { ...u, stato: u.stato === 'attivo' ? 'disattivo' : 'attivo' }
      }
      return u
    }))
  }

  const handleNuovoUtente = (user: Omit<SystemUser, 'id' | 'ultimoAccesso'>) => {
    const newUser: SystemUser = {
      ...user,
      id: utenti.length + 1,
      ultimoAccesso: 'Mai'
    }
    setUtenti(prev => [...prev, newUser])
    setShowForm(false)
  }

  return (
    <>
      <TopBar
        title="Gestione Utenti e Ruoli"
        subtitle="Amministrazione degli accessi e dei permessi operativi"
      />

      <div className="page-container utenti-page">
        {/* Header / Stats */}
        <div className="utenti-header-row">
          <div className="utenti-stats">
            <div className="stat-pill">
              <span className="stat-label">Utenti Registrati</span>
              <span className="stat-val">{utenti.length}</span>
            </div>
            <div className="stat-pill">
              <span className="stat-label">Attivi Ora</span>
              <span className="stat-val accent">{attivi}</span>
            </div>
            <div className="stat-pill">
              <span className="stat-label">Admin (Direzione)</span>
              <span className="stat-val">{direzione}</span>
            </div>
          </div>
          
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Chiudi' : '+ Nuovo Operatore'}
          </button>
        </div>

        {/* Content */}
        <div className="utenti-content">
          {showForm && (
            <div className="utenti-form-wrapper">
              <UserForm onSubmit={handleNuovoUtente} onClose={() => setShowForm(false)} />
            </div>
          )}

          <UserTable data={utenti} onToggleStato={handleToggleStato} />
        </div>
      </div>
    </>
  )
}
