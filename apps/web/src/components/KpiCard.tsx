import React from 'react'
import './KpiCard.css'

interface KpiCardProps {
  label: string
  value: string | number
  color: 'green' | 'amber' | 'accent' | 'teal' | 'red' | 'purple'
}

export function KpiCard({ label, value, color }: KpiCardProps) {
  return (
    <div className={`kpi kpi-${color}`}>
      <div className="kpi-val">{value}</div>
      <div className="kpi-label">{label}</div>
    </div>
  )
}
