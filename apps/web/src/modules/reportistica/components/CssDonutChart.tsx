import React from 'react'

interface DonutData {
  label: string
  value: number
  color: string
}

interface Props {
  data: DonutData[]
}

export function CssDonutChart({ data }: Props) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  // Costruiamo il conic-gradient string
  let currentAngle = 0
  const gradientStops = data.map(item => {
    const percentage = (item.value / total) * 100
    const startAngle = currentAngle
    const endAngle = currentAngle + percentage
    currentAngle = endAngle
    return `${item.color} ${startAngle}% ${endAngle}%`
  })

  const conicGradient = `conic-gradient(${gradientStops.join(', ')})`

  return (
    <div className="donut-container">
      <div className="donut-chart" style={{ background: conicGradient }}>
        <div className="donut-hole">
          <span className="donut-total">{total}</span>
          <span className="donut-label">Posti Tot</span>
        </div>
      </div>
      <div className="donut-legend">
        {data.map(item => (
          <div key={item.label} className="donut-legend-item">
            <div className="donut-legend-color" style={{ backgroundColor: item.color }}></div>
            <span>{item.label} <strong>({item.value})</strong></span>
          </div>
        ))}
      </div>
    </div>
  )
}
