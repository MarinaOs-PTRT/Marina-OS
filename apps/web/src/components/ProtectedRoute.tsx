import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * ProtectedRoute — wrapper per le rotte che richiedono autenticazione.
 *
 * Se l'utente non è loggato, redirige a /login (replace: true per
 * non lasciare traccia nella history — il tasto "indietro" non riporta
 * a una pagina protetta).
 *
 * Usa <Outlet /> per rendere i figli del router (pattern React Router v6).
 *
 * In produzione: qui si verificherà anche la validità del JWT
 * (scadenza, signature) prima di consentire l'accesso.
 */
export function ProtectedRoute() {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
