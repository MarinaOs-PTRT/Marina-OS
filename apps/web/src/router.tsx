import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { DashboardPage } from './modules/dashboard/DashboardPage'
import { MovimentoPage } from './modules/movimento/MovimentoPage'
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
import { PlaceholderPage } from './components/PlaceholderPage'

export const router = createBrowserRouter([
  {
    path: '/',
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
        path: 'movimento',
        element: <MovimentoPage />
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
])
