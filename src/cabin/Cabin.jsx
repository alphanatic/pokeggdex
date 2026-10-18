import { useCallback, useEffect, useState } from 'react'
import { Pixels, cellsToPath, ringCells } from './pixels.jsx'
import { C } from './palette.js'
import { useClock } from './clock.js'
import WallScreen, { ScreenFrame, ScreenGlow } from './WallScreen.jsx'
import { PortholeRim, PortholeView } from './Porthole.jsx'
import TextBox from './TextBox.jsx'
import { useLink } from './link.js'
import Pokeggdex from '../pokeggdex/Pokeggdex.jsx'
import { usePokeggdex } from '../pokeggdex/usePokeggdex.js'
import './vermillion.css'

// A cabin on the S.S. Anne, docked in Vermilion City: the world around the
// pokeggdex. It's pixel art, 320 x 180 pixels, scaled up to cover the window
// (like background-size: cover) and anchored at the top. It never shows less
// than VIEW_MIN of its width, so the wall screen and the porthole stay whole:
// narrower windows shrink it instead, and the floor grows downwards to fill the rest.
// This scene calls the pokeggdex in and stands it on the fold-out table; the
// wall screen shows what it shows. Clicking things in the cabin can tell you something, like reading a sign in the games. Some of
// them are easter eggs. Its styles are in vermillion.css.

export const SCENE = { w: 320, h: 180 }
const FLOOR_Y = 140 // where the wall meets the floor
const TABLE_H = 16 // the table layer's height in scene pixels: top board 12, legs 4 (see Table)
const TABLE_TOP = 1 // its top surface, where the pokeggdex stands, from the layer's top edge
const VIEW_MIN = 250 // the least of the scene's width that stays in view: x 35-285, wall screen to porthole

// Where the pokeggdex stands on the table: its middle, and how wide it is there.
const DEX_SPOT = { x: 250, width: 104 }
const DEX = { w: 764.4, h: 568 } // the open pokeggdex (.dex-stage), in CSS px
const DEX_SIZE = 1.05 // 5% larger than the base size below
const PHONE_W = 800 // in windows narrower than this, the pokeggdex is PHONE_SIZE as large
const PHONE_SIZE = 0.6

// Fits the scene to the current window size and places the table and the pokeggdex.
// Gives the scene's height in scene pixels (180, or more where the floor grows),
// the scale k (scene pixels -> screen pixels), where the table starts, and the
// pokeggdex's placement.
function useLayout() {
  const [layout, setLayout] = useState(null)
  useEffect(() => {
    function update() {
      const W = window.innerWidth
      const H = window.innerHeight
      const cover = Math.max(W / SCENE.w, H / SCENE.h)
      const k = Math.max(W / SCENE.w, Math.min(H / SCENE.h, W / VIEW_MIN)) // scene pixels -> screen pixels
      // its size follows the cabin (as if it covered the window), but never so small it's hard to use, nor bigger than the window
      let s = Math.max((DEX_SPOT.width / DEX.w) * cover, Math.min(0.6, (W * 0.42) / DEX.w)) * DEX_SIZE
      if (W < PHONE_W) s *= PHONE_SIZE
      s = Math.min(s, (W - 32) / DEX.w, (H - 32) / (DEX.h + 24))
      const halfW = (DEX.w * s) / 2 + 16
      const halfH = ((DEX.h + 24) * s) / 2 + 16
      const x = Math.min(Math.max((W - SCENE.w * k) / 2 + DEX_SPOT.x * k, halfW), W - halfW)
      const y = H - (TABLE_H - TABLE_TOP) * k - ((DEX.h + 20) * s) / 2 // stood on the table top
      setLayout({
        sceneH: Math.max(SCENE.h, Math.ceil(H / k)),
        k,
        tableX: Math.max(0, x - (DEX.w * s) / 2 - 6 * k), // from just left of the open pokeggdex
        placement: {
          '--dex-x': `${x}px`,
          '--dex-y': `${Math.min(Math.max(y, halfH), H - halfH)}px`,
          '--dex-scale': s,
        },
      })
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return layout
}

// ---------------------------------------------------------------- walls

function Wall() {
  const stripes = []
  const dots = []
  for (let x = 0; x < SCENE.w; x += 12) {
    stripes.push(`M${x} 6h1v110h-1Z`)
    for (let y = 12; y < 114; y += 12) dots.push([x + 6, y])
  }
  // wood panelling below the rail: raised frame, sunken panels
  const panels = []
  for (let x = 0; x < SCENE.w; x += 32) panels.push(x)
  return (
    <g>
      {/* cream wallpaper with a fine stripe */}
      <rect width={SCENE.w} height={116} fill={C.cream} />
      <path d={stripes.join('')} fill={C.creamD} />
      <path d={cellsToPath(dots)} fill={C.creamD} />
      <rect y={6} width={SCENE.w} height={1} fill={C.creamDD} />

      {/* ceiling beam with rivets */}
      <rect width={SCENE.w} height={5} fill={C.woodD} />
      <rect width={SCENE.w} height={1} fill={C.woodDD} />
      <rect y={5} width={SCENE.w} height={1} fill={C.ink} />
      <path d={cellsToPath(Array.from({ length: 14 }, (_, i) => [12 + i * 24, 2]))} fill={C.brassL} />
      <path d={cellsToPath(Array.from({ length: 14 }, (_, i) => [12 + i * 24, 3]))} fill={C.brassD} />

      {/* dado rail */}
      <rect y={116} width={SCENE.w} height={1} fill={C.woodHL} />
      <rect y={117} width={SCENE.w} height={2} fill={C.woodL} />
      <rect y={119} width={SCENE.w} height={1} fill={C.woodD} />
      <rect y={120} width={SCENE.w} height={1} fill={C.ink} />

      {/* panelling */}
      <rect y={121} width={SCENE.w} height={16} fill={C.woodL} />
      {panels.map(x => (
        <g key={x}>
          <rect x={x + 3} y={123} width={26} height={12} fill={C.wood} />
          <rect x={x + 3} y={123} width={26} height={1} fill={C.woodD} />
          <rect x={x + 3} y={123} width={1} height={12} fill={C.woodD} />
          <rect x={x + 3} y={135} width={26} height={1} fill={C.woodHL} />
          <rect x={x + 29} y={123} width={1} height={13} fill={C.woodHL} />
        </g>
      ))}

      {/* skirting board */}
      <rect y={137} width={SCENE.w} height={1} fill={C.woodHL} />
      <rect y={138} width={SCENE.w} height={1} fill={C.woodD} />
      <rect y={139} width={SCENE.w} height={1} fill={C.woodDD} />
      <rect y={FLOOR_Y} width={SCENE.w} height={1} fill={C.ink} />
    </g>
  )
}

function Floor({ h }) {
  const rows = []
  for (let r = 0, y = FLOOR_Y + 1; y < h; r++, y += 7) rows.push({ r, y })
  return (
    <g>
      {rows.map(({ r, y }) => (
        <g key={y}>
          <rect y={y} width={SCENE.w} height={7} fill={r % 2 ? '#b87a40' : '#c08245'} />
          <rect y={y} width={SCENE.w} height={1} fill={C.woodD} />
          {/* plank ends, staggered from row to row */}
          <path d={Array.from({ length: 8 }, (_, i) => `M${((r * 29) % 48) + i * 48} ${y + 1}h1v6h-1Z`).join('')} fill={C.woodD} />
        </g>
      ))}
    </g>
  )
}

// ---------------------------------------------------------------- props

// The fold-out table the pokeggdex stands on. It's its own layer, in front of
// the scene and anchored to the bottom of the window, so the pokeggdex always
// stands at the same height there. Drawn in scene pixels from its top edge:
// the top board, then just the top of its legs (TABLE_H in all). `w` is its
// width; it reaches past the window's right edge.
function Table({ w }) {
  return (
    <g>
      <rect x={1} y={12} width={w} height={TABLE_H} fill={C.ink} opacity={0.25} /> {/* its shadow */}
      {[8, w - 14].map(lx => (
        <g key={lx}>
          <rect x={lx - 1} y={12} width={6} height={TABLE_H} fill={C.ink} />
          <rect x={lx} y={12} width={4} height={TABLE_H} fill={C.woodD} />
          <rect x={lx} y={12} width={1} height={TABLE_H} fill={C.wood} />
        </g>
      ))}
      <rect x={1} y={0} width={w} height={12} fill={C.ink} />
      <rect x={0} y={1} width={1} height={10} fill={C.ink} />
      <rect x={1} y={1} width={w} height={1} fill={C.woodHL} />
      <rect x={1} y={2} width={w} height={2} fill={C.woodL} />
      <rect x={1} y={4} width={w} height={1} fill={C.ink} />
      <rect x={1} y={5} width={w} height={5} fill={C.wood} />
      <rect x={1} y={5} width={w} height={1} fill={C.woodL} />
      <rect x={1} y={10} width={w} height={1} fill={C.woodD} />
    </g>
  )
}

// The pixels on straight lines between points (Bresenham's algorithm).
function lineCells(points) {
  const cells = []
  for (let i = 1; i < points.length; i++) {
    let [x0, y0] = points[i - 1]
    const [x1, y1] = points[i]
    const dx = Math.abs(x1 - x0)
    const dy = -Math.abs(y1 - y0)
    const sx = x0 < x1 ? 1 : -1
    const sy = y0 < y1 ? 1 : -1
    let err = dx + dy
    for (;;) {
      cells.push([x0, y0])
      if (x0 === x1 && y0 === y1) break
      const e2 = 2 * err
      if (e2 >= dy) { err += dy; x0 += sx }
      if (e2 <= dx) { err += dx; y0 += sy }
    }
  }
  return cells
}
// A life ring on the wall between the screen and the porthole, red and white with rope ties.
const RING = { cx: 188, cy: 66 }
function LifeRing({ onClick }) {
  const { cx, cy } = RING
  const paint = { red: [], redD: [], white: [], whiteD: [] }
  for (const [x, y] of ringCells(cx, cy, 11, 5.5)) {
    const dx = x + 0.5 - cx
    const dy = y + 0.5 - cy
    const quarter = Math.floor(((Math.atan2(dy, dx) + Math.PI / 4 + 2 * Math.PI) % (2 * Math.PI)) / (Math.PI / 2))
    const shade = dx + dy > 7 ? 'D' : ''
    paint[(quarter % 2 ? 'white' : 'red') + shade].push([x, y])
  }
  const ties = [45, 135, 225, 315].flatMap(deg => {
    const a = (deg * Math.PI) / 180
    const x = Math.round(cx + 8.2 * Math.cos(a) - 0.5)
    const y = Math.round(cy + 8.2 * Math.sin(a) - 0.5)
    return [[x, y], [x + 1, y], [x, y + 1], [x + 1, y + 1]]
  })
  const rope = lineCells([[cx, cy - 16], [cx - 6, cy - 10]]).concat(lineCells([[cx, cy - 16], [cx + 6, cy - 10]]))
  return (
    <g className="clickable" onClick={onClick}>
      <rect x={cx - 12} y={cy - 17} width={25} height={30} fill="transparent" /> {/* the hole counts too */}
      <path d={cellsToPath(rope)} fill={C.woodHL} />
      <rect x={cx} y={cy - 17} width={1} height={1} fill={C.ink} />
      <path d={cellsToPath(ringCells(cx + 1, cy + 1, 12, 5).filter(([x, y]) => Math.hypot(x + 0.5 - cx, y + 0.5 - cy) > 11.5 || Math.hypot(x + 0.5 - cx, y + 0.5 - cy) < 5.5))} fill={C.creamDD} />
      <path d={cellsToPath(ringCells(cx, cy, 12, 11))} fill={C.ink} />
      <path d={cellsToPath(ringCells(cx, cy, 5.5, 4.5))} fill={C.ink} />
      <path d={cellsToPath(paint.red)} fill={C.red} />
      <path d={cellsToPath(paint.redD)} fill={C.redD} />
      <path d={cellsToPath(paint.white)} fill={C.white} />
      <path d={cellsToPath(paint.whiteD)} fill={C.creamD} />
      <path d={cellsToPath(ties)} fill={C.woodHL} />
    </g>
  )
}

// A brass plaque on the panelling.
function Plaque({ onClick }) {
  return (
    <g className="clickable" onClick={onClick}>
      <rect x={71} y={124} width={46} height={10} fill={C.ink} />
      <rect x={72} y={125} width={44} height={8} fill={C.brass} />
      <rect x={72} y={125} width={44} height={1} fill={C.brassL} />
      <rect x={72} y={132} width={44} height={1} fill={C.brassD} />
      <text x={94} y={131} className="plaque-text" textAnchor="middle">S.S.ANNE</text>
    </g>
  )
}

// The ship's lamp hangs from the beam and sways as the ship rocks:
// four frames (middle, left, middle, right), like a Game Boy animation.
const LAMP = [
  '...KKK...',
  '..KLBBK..',
  '.KLBBBDK.',
  'KKKKKKKKK',
  '.KgGGGgK.',
  '.KgGWGgK.',
  '.KgGGGgK.',
  '.KgggggK.',
  'KKKKKKKKK',
  '.KBBBBDK.',
  '..KDDDK..',
  '...KKK...',
]
const LAMP_X = 188
function Lamp({ lit }) {
  const palette = {
    K: C.ink, L: C.brassL, B: C.brass, D: C.brassD,
    ...(lit ? { g: '#f8c860', G: '#fff0a8', W: '#ffffff' } : { g: '#98a0a0', G: '#c8d0d0', W: '#e8e8e0' }),
  }
  const sway = [0, -1, 0, 1] // see .lamp-frame in vermillion.css for the order they show in
  return (
    <g>
      {lit && (
        <g>
          <path d={cellsToPath(ringCells(LAMP_X, 20, 18, 0).filter(([x, y]) => (x + y) % 2 === 0))} fill="#f8e080" opacity={0.18} />
          <path d={cellsToPath(ringCells(LAMP_X, 20, 10, 0))} fill="#f8e080" opacity={0.16} />
        </g>
      )}
      <rect x={LAMP_X - 2} y={5} width={5} height={1} fill={C.brassD} />
      {/* the lamp lights the way to the lore page */}
      <a href="lore/" className="clickable" aria-label="Lore">
        <rect x={LAMP_X - 5} y={6} width={11} height={20} fill="transparent" /> {/* its whole swing counts */}
        {sway.map((dx, i) => (
          <g key={i} className="lamp-frame">
            <path d={cellsToPath([6, 7, 8, 9].map(y => [LAMP_X, y]).concat([10, 11, 12, 13].map(y => [LAMP_X + dx, y])))} fill={C.brassD} />
            <Pixels rows={LAMP} palette={palette} x={LAMP_X - 4 + dx} y={14} />
          </g>
        ))}
      </a>
    </g>
  )
}

// ---------------------------------------------------------------- the cabin

const LIGHT = {
  morn: { tint: '#f09060', amount: 0.07, glow: 0.12 },
  day: { tint: null, amount: 0, glow: 0.08 },
  nite: { tint: '#0a1030', amount: 0.45, glow: 0.3 },
}

let greeted = false

export default function Cabin() {
  const { time, isFriday } = useClock()
  const [message, setMessage] = useState(null) // { id, pages } while the text box is up
  const light = LIGHT[time]

  // The pokeggdex this scene calls in, and where it stands. It arrives folded shut,
  // so visitors get to discover that it opens (the hinge, or a Pokémon dialogue).
  const dex = usePokeggdex({ startClosed: true })
  const { pokemon, loading, error, shiny, setShiny, select, setClosed } = dex
  const layout = useLayout()
  const sceneH = layout?.sceneH ?? SCENE.h

  // The wall screen's link to the pokeggdex (see link.js): its flashes are echoed
  // by the pokeggdex's lights. Switching the screen off also folds the pokeggdex shut.
  const { link, pressLink, pulse } = useLink()
  function pressLinkButton() {
    if (link === 'on') setClosed(true)
    pressLink()
  }

  // The pokeggdex trigger pulse: when a dialogue about a Pokémon starts here
  // (clicking a visitor in the porthole, Mew under the truck, MissingNo.), the
  // pokeggdex turns to that Pokémon and its sensor lights up: to 75%, held 0.2 s,
  // then fading out (pokeggdex.css). After that the dialogue has nothing to do with
  // it. If the pokeggdex is folded shut, it opens first. `dexTriggerPulse` counts
  // the pulses, to restart the glow.
  const [dexTriggerPulse, setDexTriggerPulse] = useState(0)
  const startPokemonDialogue = useCallback(id => {
    setClosed(false) // folded shut? it opens, as if you'd clicked the hinge
    select(id)
    setDexTriggerPulse(n => n + 1)
  }, [select, setClosed])

  // Every message gets a new id, so the text box starts over even for the same words.
  // A message about a Pokémon also names it (its pokeggdex number): that's a
  // Pokémon dialogue, and starting one fires the pokeggdex trigger pulse.
  const say = useCallback((pages, pokemonId) => {
    setMessage(m => ({ id: (m?.id ?? 0) + 1, pages }))
    if (pokemonId !== undefined) startPokemonDialogue(pokemonId)
  }, [startPokemonDialogue])

  // Easter egg: MissingNo. (No.000) does what it did in Red and Blue.
  useEffect(() => {
    if (pokemon?.id === 0) say(['!?', 'The 6th item in your BAG multiplied!', '...Better not save the game now.'], 0)
  }, [pokemon, say])

  // A hello for anyone who opens the browser's developer tools.
  useEffect(() => {
    if (greeted) return
    greeted = true
    console.log(
      '%cpokeggdex%c\nWelcome aboard the S.S. ANNE!\nPsst... not every Pokémon is in the list. Try No.000.',
      'font: 16px monospace; color: #d83a30; font-weight: bold',
      'font: 12px monospace',
    )
  }, [])

  return (
    <>
    <div className="cabin">
      <svg
        className="cabin-scene"
        viewBox={`0 0 ${SCENE.w} ${sceneH}`}
        preserveAspectRatio="xMidYMin slice"
        shapeRendering="crispEdges"
        aria-label="A cabin on the S.S. Anne, docked in Vermilion City"
      >
        {/* the room itself, lit by the time of day */}
        <Wall />
        <Floor h={sceneH} />
        <PortholeRim />
        <ScreenFrame />
        <LifeRing onClick={() => say(['OAK: RED!', "This isn't the time to use that!"])} />
        <Plaque onClick={() => say(['SAILOR: The S.S.ANNE is a famous luxury cruise ship.', 'We visit VERMILION once a year.'])} />
        {light.tint && <rect width={SCENE.w} height={sceneH} fill={light.tint} opacity={light.amount} pointerEvents="none" />}

        {/* things that make their own light, or show the light outside */}
        <ScreenGlow pokemon={pokemon} strength={light.glow} link={link} />
        <WallScreen pokemon={pokemon} loading={loading} error={error} link={link} onLink={pressLinkButton} pulse={pulse} shiny={shiny} onShiny={() => setShiny(s => !s)} />
        <PortholeView time={time} isFriday={isFriday} say={say} />
        <Lamp lit={time !== 'day'} />
      </svg>

      {/* the table, in front of the scene: see Table */}
      {layout && (() => {
        const w = (window.innerWidth - layout.tableX) / layout.k
        return (
          <svg
            className="cabin-table"
            style={{ left: layout.tableX, height: TABLE_H * layout.k }}
            viewBox={`0 0 ${w} ${TABLE_H}`}
            preserveAspectRatio="none"
            shapeRendering="crispEdges"
            aria-hidden="true"
          >
            <Table w={w} />
            {light.tint && <rect width={w} height={TABLE_H} fill={light.tint} opacity={light.amount} />}
          </svg>
        )
      })()}

      {message && <TextBox key={message.id} pages={message.pages} onDone={() => setMessage(null)} />}
    </div>

    {/* the pokeggdex, called into the cabin once we know where it stands */}
    {layout && <Pokeggdex dex={dex} placement={layout.placement} pulse={pulse} triggerPulse={dexTriggerPulse} />}
    </>
  )
}
