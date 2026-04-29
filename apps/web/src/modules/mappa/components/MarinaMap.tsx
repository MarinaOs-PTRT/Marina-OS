import React, { useEffect, useRef, useState } from 'react'
import { Berth, BerthVisualState } from '@shared/types'
import { BERTH_VISUAL_HEX } from '@shared/constants'
import { useGlobalState } from '../../../store/GlobalState'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
// Vite syntax to import raw SVG string
// @ts-ignore
import mapSvgRaw from '../../../assets/mappaPtrt.svg?raw'

// Rimuove il tag <title> che Illustrator inserisce automaticamente
// con il nome del file — apparirebbe come testo sovrapposto alla mappa.
const mapSvgClean = (mapSvgRaw as string).replace(/<title>[^<]*<\/title>/gi, '')

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
    dangerouslySetInnerHTML={{ __html: mapSvgClean }}
    style={{
      width: '100%',
      height: 'auto',
      // Sposta visivamente la mappa rispetto al centro: translate(X, Y)
      // Valori positivi: Destra / Basso. Valori negativi: Sinistra / Alto.
      transform: 'translate(0px, 80px)' // <-- Modifica questi valori
    }}
  />
)))

// Label leggibili per ogni stato visivo
const STATO_LABEL: Record<BerthVisualState, string> = {
  'libero':             'Libero',
  'fuori_servizio':     'Fuori servizio',
  'socio_presente':     'Socio presente',
  'socio_assente':      'Socio assente',
  'socio_in_cantiere':  'In cantiere',
  'socio_su_altro_posto': 'Socio altrove',
  'transito':           'Transito',
  'affittuario_su_socio': 'Affittuario',
  'bunker':             'Bunker',
}

interface TooltipState {
  x: number
  y: number
  berthId: string
}

export const MarinaMap = React.memo(function MarinaMap({ berths, onBerthSelect }: MarinaMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  // v3: stays/cantieri/titoli come dipendenze esplicite dell'effect, così
  // la mappa si ridipinge quando un movimento cambia lo stato visivo dei posti.
  const { getStatoVisivoBerth, barcaSulPosto, titoloAttivoDelBerth, barche, stays, cantieri, titoli } = useGlobalState()

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
      // Applica fill sul wrapper (stile + attributo) e direttamente sui child
      // shapes (rect/polygon/path). Necessario perché l'SVG esportato da
      // Illustrator può avere elementi <g> come wrapper con fill sui rettangoli
      // interni — il fill sul gruppo non sovrascrive i fill presentation-attr
      // dei figli in SVG. Impostando il fill su ogni figlio visivo garantiamo
      // che il colore sia sempre corretto dopo ogni movimento.
      el.setAttribute('fill', color)
      el.setAttribute('style', `fill: ${color}; cursor: pointer; transition: opacity 0.2s; pointer-events: all;`)
      el.querySelectorAll('rect, polygon, path, circle, ellipse').forEach(shape => {
        shape.setAttribute('fill', color)
      })

      el.addEventListener('mouseenter', (e: Event) => {
        const me = e as MouseEvent
        // opacity sul wrapper — copre sia <g> che <rect> diretti
        el.setAttribute('opacity', '0.7')
        setTooltip({ x: me.clientX, y: me.clientY, berthId: berth.id })
      })
      el.addEventListener('mousemove', (e: Event) => {
        const me = e as MouseEvent
        setTooltip(prev => prev ? { ...prev, x: me.clientX, y: me.clientY } : null)
      })
      el.addEventListener('mouseleave', () => {
        el.setAttribute('opacity', '1')
        setTooltip(null)
      })

      const handler = (e: Event) => {
        e.stopPropagation()
        e.preventDefault()
        // Cerca il berth aggiornato in `berths` al momento del click
        // (la closure potrebbe avere uno snapshot stale se il posto è cambiato
        // senza che l'effect si sia rieseguito per qualche altro motivo).
        const freshBerth = berths.find(b => b.id === berth.id) ?? berth
        onBerthSelect(freshBerth)
      }
      el.addEventListener('click', handler)
      clickHandlers.push({ el, handler })
    })

    return () => {
      clickHandlers.forEach(({ el, handler }) => el.removeEventListener('click', handler))
    }
  }, [berths, onBerthSelect, stays, cantieri, titoli, getStatoVisivoBerth])

  // Dati per il tooltip (calcolati a render-time, non nell'effect)
  const tooltipStato   = tooltip ? getStatoVisivoBerth(tooltip.berthId) : null
  const tooltipColor   = tooltipStato ? BERTH_VISUAL_HEX[tooltipStato] : '#cbd5e1'
  const tooltipLabel   = tooltipStato ? STATO_LABEL[tooltipStato] : ''
  // Barca fisicamente presente (Stay aperto)
  const tooltipBarca   = tooltip ? barcaSulPosto(tooltip.berthId) : null
  // Fallback: se nessuno è presente, mostra la barca del socio titolare
  const tooltipTitolo  = tooltip ? titoloAttivoDelBerth(tooltip.berthId) : null
  const tooltipBarcaOwner = !tooltipBarca && tooltipTitolo?.boatId
    ? barche.find(b => b.id === tooltipTitolo.boatId)
    : null
  const barcaDaMostrare = tooltipBarca ?? tooltipBarcaOwner

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
      {/* Tooltip hover posto barca */}
      {tooltip && (
        <div style={{
          position: 'fixed',
          left: tooltip.x + 24,
          top: tooltip.y + 10,
          zIndex: 9999,
          pointerEvents: 'none',
          background: '#1e2433',
          border: '1px solid #3e4a6a',
          borderRadius: 8,
          padding: '7px 11px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          minWidth: 140,
        }}>
          {/* ID posto — sempre visibile */}
          <div style={{ fontSize: 14, fontWeight: 800, color: '#ffffff', marginBottom: 2 }}>
            {tooltip.berthId}
          </div>
          {/* Stato */}
          <div style={{ fontSize: 11, color: tooltipColor, marginBottom: tooltipBarca ? 4 : 0 }}>
            {tooltipLabel}
          </div>
          {/* Nome barca (presente) o barca del socio titolare (assente) */}
          {barcaDaMostrare && (
            <div style={{ fontSize: 12, color: tooltipBarca ? '#cbd5e1' : '#7a8faf', fontStyle: tooltipBarca ? 'normal' : 'italic' }}>
              {barcaDaMostrare.nome}
            </div>
          )}
        </div>
      )}

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
