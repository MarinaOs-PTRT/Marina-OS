import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './modules/login/LoginPage'
import { DashboardPage } from './modules/dashboard/DashboardPage'
import { TorrePage } from './modules/torre/TorrePage'
import { RegistrazioneTransitiPage } from './modules/registrazione-transiti/RegistrazioneTransitiPage'
import { RegistroPage } from './modules/registro/RegistroPage'
import { ClientiPage } from './modules/clienti/ClientiPage'
import { MappaPage } from './modules/mappa/MappaPage'
import { ManutenzioniPage } from './modules/manutenzioni/ManutenzioniPage'
import { TariffePage } from './modules/tariffe/TariffePage'
import { ArriviPage } from './modules/arrivi/ArriviPage'
import { SociPage } from './modules/soci/SociPage'
import { ReportisticaPage } from './modules/reportistica/ReportisticaPage'
import { UtentiPage } from './modules/utenti/UtentiPage'
import { NotifichePage } from './modules/notifiche/NotifichePage'

export const router = createBrowserRouter([
  // ── Rotta pubblica: Login (nessun layout, nessuna protezione) ──
  {
    path: '/login',
    element: <LoginPage />,
  },

  // ── Rotte protette: richiedono autenticazione ──
  // ProtectedRoute verifica che l'utente sia loggato; se no → /login.
  // AppLayout aggiunge Sidebar + struttura della pagina.
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />
          },
          {
            path: 'dashboard',
            element: <DashboardPage />
          },
          {
            path: 'torre',
            element: <TorrePage />
          },
          // ── Completa Registrazione (M-RegPendente, 25 Apr 2026) ──
          // Pagina unificata per completare anagrafica di transiti e affittuari
          // pendenti. Per gli affittuari nasconde la sezione Cassa (non gestita
          // dal sistema). Vedi memoria registrazione_pendente_pattern.md.
          {
            path: 'completa-registrazione',
            element: <RegistrazioneTransitiPage />
          },
          {
            path: 'completa-registrazione/:boatId',
            element: <RegistrazioneTransitiPage />
          },
          // Redirect retrocompatibilità: il vecchio path /registrazione-transiti
          // rimane funzionante come reindirizzamento al nuovo nome neutro.
          {
            path: 'registrazione-transiti',
            element: <Navigate to="/completa-registrazione" replace />
          },
          {
            path: 'registrazione-transiti/:boatId',
            element: <Navigate to="/completa-registrazione" replace />
          },
          {
            path: 'registro',
            element: <RegistroPage />
          },
          {
            path: 'mappa',
            element: <MappaPage />
          },
          {
            path: 'manutenzioni',
            element: <ManutenzioniPage />
          },
          {
            path: 'clienti',
            element: <ClientiPage />
          },
          {
            path: 'tariffe',
            element: <TariffePage />
          },
          {
            path: 'arrivi',
            element: <ArriviPage />
          },
          {
            path: 'soci',
            element: <SociPage />
          },
          {
            path: 'reportistica',
            element: <ReportisticaPage />
          },
          {
            path: 'utenti',
            element: <UtentiPage />
          },
          {
            path: 'notifiche',
            element: <NotifichePage />
          }
        ]
      }
    ]
  }
])
