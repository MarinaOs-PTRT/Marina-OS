import React from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { ToastContainer } from '../components/ToastContainer'
import './AppLayout.css'

export function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
      {/* ToastContainer montato qui: sempre visibile sopra tutto il contenuto,
          indipendentemente dalla pagina corrente. z-index 2000. */}
      <ToastContainer />
    </div>
  )
}
