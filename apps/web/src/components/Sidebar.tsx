import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { MODULE_NAV } from '@shared/constants'
// @ts-ignore
import logoUrl from '../assets/logo.png'
import './Sidebar.css'

export function Sidebar() {
  const location = useLocation()

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-box">
          <img src={logoUrl} alt="Logo" />
        </div>
        <div className="logo-text">
          <h1>Marina OS</h1>
          <span>Riva di Traiano</span>
        </div>
      </div>

      <div className="role-badge">
        <span className="role-dot"></span>
        Torre di Controllo
      </div>

      <nav className="sidebar-nav">
        {MODULE_NAV.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="btn-logout">
          Esci/Logout
        </button>
      </div>
    </aside>
  )
}
