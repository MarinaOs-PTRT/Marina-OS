import React from 'react'
import { TopBar } from './TopBar'

interface PlaceholderPageProps {
  title: string
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <>
      <TopBar title={title} />
      <div className="page-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text3)' }}>
          <div style={{ fontSize: '4rem', marginBottom: 'var(--space-md)' }}>🚧</div>
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>Modulo in costruzione</h2>
          <p>La migrazione di <strong>{title}</strong> è prevista nelle prossime fasi.</p>
        </div>
      </div>
    </>
  )
}
