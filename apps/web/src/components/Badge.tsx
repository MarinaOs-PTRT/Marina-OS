import React, { ReactNode } from 'react'

interface BadgeProps {
  color?: 'green' | 'amber' | 'red' | 'purple' | 'teal' | 'gray' | 'accent' | 'blue'
  children: ReactNode
}

export function Badge({ color = 'gray', children }: BadgeProps) {
  return (
    <span className={`pill pill-${color}`}>
      {children}
    </span>
  )
}
