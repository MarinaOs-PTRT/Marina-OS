import React from 'react'

interface BarData {
  label: string
  value: number
  secondaryValue: number
}

interface Props {
  data: BarData[]
}

export function CssBarChart({ data }: Props) {
  // Trova il massimo per scalare le barre
  const maxVal = Math.max(...data.flatMap(d => [d.value, d.secondaryValue]))
  const chartHeight = 200

  return (
    <div className="bar-chart-container">
      {data.map((item, idx) => {
        const height1 = (item.value / maxVal) * chartHeight
        const height2 = (item.secondaryValue / maxVal) * chartHeight

        return (
          <div key={idx} className="bar-group">
            <div className="bars-wrapper">
              <div 
                className="bar bar-in" 
                style={{ height: `${height1}px` }}
                data-val={item.value}
              ></div>
              <div 
                className="bar bar-out" 
                style={{ height: `${height2}px` }}
                data-val={item.secondaryValue}
              ></div>
            </div>
            <span className="bar-label">{item.label}</span>
          </div>
        )
      })}
    </div>
  )
}
