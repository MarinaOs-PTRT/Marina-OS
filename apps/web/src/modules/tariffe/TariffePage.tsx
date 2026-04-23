import React, { useState } from 'react'
import { TopBar } from '../../components/TopBar'
import { TariffeTable } from './components/TariffeTable'
import { Calculator } from './components/Calculator'
import { ReceiptTable } from './components/ReceiptTable'
import './TariffePage.css'

type ActiveTab = 'listino' | 'calcolatore' | 'ricevute'

export function TariffePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('listino')

  return (
    <>
      <TopBar
        title="Tariffe e Fatturazione"
        subtitle="Listino prezzi, calcolo soste ed emissione ricevute"
      />

      <div className="page-container">
        {/* Tab bar */}
        <div className="tariffe-tabs">
          <button
            className={`tariffe-tab ${activeTab === 'listino' ? 'active' : ''}`}
            onClick={() => setActiveTab('listino')}
          >
            📋 Listino Tariffe
          </button>
          <button
            className={`tariffe-tab ${activeTab === 'calcolatore' ? 'active' : ''}`}
            onClick={() => setActiveTab('calcolatore')}
          >
            🧮 Calcolatore Sosta
          </button>
          <button
            className={`tariffe-tab ${activeTab === 'ricevute' ? 'active' : ''}`}
            onClick={() => setActiveTab('ricevute')}
          >
            🧾 Ricevute Emesse
          </button>
        </div>

        {/* Content */}
        <div className="tariffe-content">
          {activeTab === 'listino'     && <TariffeTable />}
          {activeTab === 'calcolatore' && <Calculator />}
          {activeTab === 'ricevute'    && <ReceiptTable />}
        </div>
      </div>
    </>
  )
}
