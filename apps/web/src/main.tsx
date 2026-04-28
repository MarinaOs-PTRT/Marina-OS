import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { GlobalProvider } from './store/GlobalState'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'

// Import base styles
import './styles/tokens.css'
import './styles/reset.css'
import './styles/components.css'

// Ordine provider (dall'esterno verso l'interno):
//   AuthProvider  → gestisce sessione utente (prima di tutto)
//   GlobalProvider → stato operativo marina (dati porto)
//   RouterProvider → navigazione e rendering pagine
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider>
        <GlobalProvider>
          <RouterProvider router={router} />
        </GlobalProvider>
      </ToastProvider>
    </AuthProvider>
  </StrictMode>,
)
