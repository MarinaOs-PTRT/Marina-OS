import React, { useEffect, useRef } from 'react'
import { Berth } from '@shared/types'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
// Vite syntax to import raw SVG string
// @ts-ignore
import mapSvgRaw from '../../../assets/mappaPtrt.svg?raw'

interface MarinaMapProps {
  berths: Berth[]
  onBerthSelect: (berth: Berth) => void
}

// Colori di stato — valori hex diretti per compatibilità SVG inline
// Allineati ai colori semantici del Design System Marina OS
const STATUS_COLORS: Record<string, string> = {
  'libero': '#1D9E75',             // Verde (transito/disponibile)
  'occupato_socio': '#2E6CBC',     // Blu (socio)
  'socio_assente': '#BA7517',      // Ambra (assente)
  'socio_assente_lungo': '#a8a29e',// Grigio (assente lungo)
  'occupato_transito': '#1D9E75',  // Verde (transito)
  'transito_assente': '#BA7517',   // Ambra (assente)
  'occupato_affittuario': '#7c3aed', // Viola (affittuario)
  'affittuario_assente': '#BA7517',  // Ambra (assente)
  'in_cantiere': '#A32D2D',       // Rosso (blocco/cantiere)
  'riservato': '#A32D2D',         // Rosso (blocco)
}

const SvgContainer = React.memo(React.forwardRef<HTMLDivElement, {}>((props, ref) => (
  <div
    ref={ref}
    dangerouslySetInnerHTML={{ __html: mapSvgRaw }}
    style={{
      width: '100%',
      height: 'auto'
    }}
  />
)))

export const MarinaMap = React.memo(function MarinaMap({ berths, onBerthSelect }: MarinaMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapContainerRef.current) return

    // Cerchiamo tutti gli elementi SVG con un ID per identificare i posti barca
    const elementsWithId = mapContainerRef.current.querySelectorAll('[id]')
    const clickHandlers: { el: Element, handler: EventListener }[] = []

    // Costruiamo una mappa veloce: svgId → Element SVG
    const svgElementMap = new Map<string, Element>()
    elementsWithId.forEach(el => {
      const id = el.getAttribute('id')
      if (id) svgElementMap.set(id, el)
    })

    // Per ogni posto barca nel database, cerchiamo il corrispondente nell'SVG
    berths.forEach(berth => {
      // Generiamo tutti i possibili formati di ID per il match:
      // "D 12" → "D_12"  |  "TW 3" → "TW3", "TW_3"  |  "FF 1" → "FF1", "FF_1"
      const candidateIds = [
        berth.id.replace(' ', '_'),                    // "D 12" → "D_12"
        berth.id.replace(' ', ''),                     // "TW 3" → "TW3"  
        berth.id,                                       // caso diretto
      ]

      let matchedEl: Element | undefined
      for (const cid of candidateIds) {
        matchedEl = svgElementMap.get(cid)
        if (matchedEl) break
      }

      if (matchedEl) {
        // È un posto barca con elemento SVG! Applichiamo colore e interattività.
        const color = STATUS_COLORS[berth.stato] || '#cbd5e1'
        matchedEl.setAttribute('style', `fill: ${color}; cursor: pointer; transition: opacity 0.2s; pointer-events: all;`)

        matchedEl.addEventListener('mouseenter', () => matchedEl!.setAttribute('opacity', '0.6'))
        matchedEl.addEventListener('mouseleave', () => matchedEl!.setAttribute('opacity', '1'))

        const handler = (e: Event) => {
          e.stopPropagation()
          e.preventDefault()
          onBerthSelect(berth)
        }
        matchedEl.addEventListener('click', handler)
        clickHandlers.push({ el: matchedEl, handler })
      }
    })

    return () => {
      clickHandlers.forEach(({ el, handler }) => {
        el.removeEventListener('click', handler)
      })
    }
  }, [berths, onBerthSelect])

  return (
    <div
      className="marina-map-container"
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        background: 'var(--bg4)'
      }}
    >
      <TransformWrapper
        initialScale={1}
        minScale={0.9}
        maxScale={5}
        centerOnInit={true}
        wheel={{ step: 0.005 }}
      >
        <TransformComponent
          wrapperStyle={{ width: '100%', height: '100%' }}
          contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <SvgContainer ref={mapContainerRef} />
        </TransformComponent>
      </TransformWrapper>
    </div>
  )
})
