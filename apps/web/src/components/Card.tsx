import React, { ReactNode, CSSProperties } from 'react'

interface CardProps {
  title?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export function Card({ title, actions, children, className = '', style }: CardProps) {
  return (
    <div className={`card ${className}`} style={style}>
      {(title || actions) && (
        <div className="card-hdr">
          {title && <h3 className="card-title">{title}</h3>}
          {actions && <div className="card-action">{actions}</div>}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
    </div>
  )
}
