import React, { useEffect, useRef } from 'react'
import { Berth } from '@shared/types'
import { BERTH_VISUAL_HEX } from '@shared/constants'
import { useGlobalState } from '../../../store/GlobalState'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
// Vite syntax to import raw SVG string
// @ts-ignore
import mapSvgRaw from '../../../assets/mappaPtrt.svg?raw'

interface MarinaMapProps {
  berths: Berth[]
  onBerthSelect: (berth: Berth) => void
}

// Modello v3 (27 Apr 2026): la colorazione dei posti deriva da
// getStatoVisivoBerth (BerthVisualState) tramite BERTH_VISUAL_HEX.
// Sostituisce il vecchio mapping basato su Berth.stato.

const SvgContainer = React.memo(React.forwardRef<HTMLDivElement, {}>((props, ref) => (
  <div
    ref={ref}
    dangerouslySetInnerHTML={{ __html: mapSvgRaw }}
    style={{
      width: '100%',
      height: 'auto',
      // Sposta visivamente la mappa rispetto al centro: translate(X, Y)
      // Valori positivi: Destra / Basso. Valori negativi: Sinistra / Alto.
      transform: 'translate(0px, 80px)' // <-- Modifica questi valori
    }}
  />
)))

export const MarinaMap = React.memo(function MarinaMap({ berths, onBerthSelect }: MarinaMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  // v3: stays/cantieri/titoli come dipendenze esplicite dell'effect, così
  // la mappa si ridipinge quando un movimento cambia lo stato visivo dei posti.
  const { getStatoVisivoBerth, stays, cantieri, titoli } = useGlobalState()

  useEffect(() => {
    if (!mapContainerRef.current) return

    // ── Mapping group Illustrator → lettera pontile (28 Apr 2026) ──
    // I pontili F-K sono stati esportati con IDs senza lettera (_1, _1-2, ecc.)
    // perché i layer in Illustrator erano nominati solo con il numero.
    // Risolviamo guardando il gruppo padre: ogni rect dentro #foxtrot è un
    // posto del Pontile F, ogni rect dentro #golf è un posto del Pontile G, ecc.
    const GROUP_TO_LETTER: Record<string, string> = {
      'foxtrot': 'F',
      'golf':    'G',
      'hotel':   'H',
      'india':   'I',
      'juliet':  'J',
      'kilo':    'K',
    }

    const clickHandlers: { el: Element, handler: EventListener }[] = []

    // Mappa berthId → Element SVG (costruita con due strategie distinte)
    const berthElementMap = new Map<string, Element>()

    // ── Strategia 1: lookup diretto per tutti gli elementi con ID ──
    // Copre: A_1→"A 1", L_47→"L 47", FF1→"FF1", TW3→"TW3"
    // (underscore→spazio per i pontili normali; compatto per FF/TW)
    mapContainerRef.current.querySelectorAll('[id]').forEach(el => {
      const rawId = el.getAttribute('id') || ''
      // Prova sia con underscore→spazio sia diretto (per FF/TW compatti)
      const candidates = [rawId.replace('_', ' '), rawId]
      for (const candidate of candidates) {
        const berth = berths.find(b => b.id === candidate)
        if (berth) { berthElementMap.set(berth.id, el); break }
      }
    })

    // ── Strategia 2: lookup per gruppo per i pontili F-K ──
    // Gli IDs sono _1/_1-2/_1-3 ecc. — il numero si estrae con regex,
    // la lettera si ricava dal gruppo padre.
    Object.entries(GROUP_TO_LETTER).forEach(([groupId, letter]) => {
      const group = mapContainerRef.current!.querySelector(`#${groupId}`)
      if (!group) return
      group.querySelectorAll('[id]').forEach(el => {
        const rawId = el.getAttribute('id') || ''
        // Pattern: _ + numero + opzionale(-contatore-dedup)
        // Esempi: "_1" → 1 | "_42-2" → 42 | "_43" → 43
        const m = rawId.match(/^_(\d+)(?:-\d+)?$/)
        if (!m) return
        const berthId = `${letter} ${m[1]}`
        if (!berthElementMap.has(berthId)) {
          const berth = berths.find(b => b.id === berthId)
          if (berth) berthElementMap.set(berth.id, el)
        }
      })
    })

    // ── Applica colori e interattività a ogni posto trovato ──
    berths.forEach(berth => {
      const el = berthElementMap.get(berth.id)
      if (!el) return

      // v3: colore deriva da getStatoVisivoBerth (BerthVisualState)
      const color = BERTH_VISUAL_HEX[getStatoVisivoBerth(berth.id)] || '#cbd5e1'
      el.setAttribute('style', `fill: ${color}; cursor: pointer; transition: opacity 0.2s; pointer-events: all;`)

      el.addEventListener('mouseenter', () => el.setAttribute('opacity', '0.6'))
      el.addEventListener('mouseleave', () => el.setAttribute('opacity', '1'))

      const handler = (e: Event) => {
        e.stopPropagation()
        e.preventDefault()
        onBerthSelect(berth)
      }
      el.addEventListener('click', handler)
      clickHandlers.push({ el, handler })
    })

    return () => {
      clickHandlers.forEach(({ el, handler }) => el.removeEventListener('click', handler))
    }
  }, [berths, onBerthSelect, stays, cantieri, titoli, getStatoVisivoBerth])

  return (
    <div
      className="marina-map-container"
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        background: 'var(--bg5)'
      }}
    >
      <TransformWrapper
        initialScale={1.2}
        minScale={1}
        maxScale={5}
        centerOnInit={true}
        wheel={{ step: 0.005 }}
      >
        <TransformComponent
          wrapperStyle={{ width: '100%', height: '100%' }}
          contentStyle={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SvgContainer ref={mapContainerRef} />
        </TransformComponent>
      </TransformWrapper>
    </div>
  )
})
