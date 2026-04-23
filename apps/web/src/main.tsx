import React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'

// Import base styles
import './styles/tokens.css'
import './styles/reset.css'
import './styles/components.css'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
