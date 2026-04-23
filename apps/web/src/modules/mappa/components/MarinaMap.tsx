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

// Colori di stato (ripresi in parte da CSS ma passati direttamente all'SVG)
const STATUS_COLORS: Record<string, string> = {
  'libero': 'var(--green, #22c55e)',
  'occupato_socio': 'var(--red, #ef4444)',
  'socio_assente': 'var(--amber, #eab308)',
  'socio_assente_lungo': 'var(--text3, #a8a29e)',
  'occupato_transito': 'var(--orange, #f97316)',
  'transito_assente': 'var(--amber, #eab308)',
  'occupato_affittuario': 'var(--purple, #8b5cf6)',
  'affittuario_assente': 'var(--amber, #eab308)',
  'in_cantiere': 'var(--blue, #3b82f6)',
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

    elementsWithId.forEach(el => {
      const idAttr = el.getAttribute('id')
      if (!idAttr) return

      // Mappiamo l'ID dell'SVG (es. "D_30") con l'ID del DB (es. "D 30")
      const matchingBerth = berths.find(b => b.id.replace(' ', '_') === idAttr)

      if (matchingBerth) {
        // È un posto barca censito! Applichiamo colore e interattività.
        const color = STATUS_COLORS[matchingBerth.stato] || '#cbd5e1'
        el.setAttribute('style', `fill: ${color}; cursor: pointer; transition: opacity 0.2s; pointer-events: all;`)

        // Aggiungo interattività base via DOM
        el.addEventListener('mouseenter', () => el.setAttribute('opacity', '0.6'))
        el.addEventListener('mouseleave', () => el.setAttribute('opacity', '1'))

        // Gestione del click
        const handler = (e: Event) => {
          e.stopPropagation()
          e.preventDefault()
          onBerthSelect(matchingBerth)
        }
        el.addEventListener('click', handler)
        clickHandlers.push({ el, handler })
      }
    })

    return () => {
      // Pulizia degli event listener al dismount
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
