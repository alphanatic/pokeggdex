import { useEffect, useState } from 'react'
import { TYPE_COLORS } from '../utils.js'
import { crystalSprite } from '../api.js'
import { missingnoPaths } from '../missingno.js'
import { Pixels, cellsToPath, discCells } from './pixels.jsx'
import { energyIcon } from './energy.js'
import { C } from './palette.js'

// The cabin's wall screen: it shows whatever
// the pokeggdex shows, Game Boy style.
// The screen is a Poké Ball: a round picture in a round casing, red on one
// side and white on the other with a black band between. The ball is tilted
// (and stays tilted) so its band runs along the same bottom-left -> top-right
// diagonal that splits the picture between the Pokémon's two types: the first
// type's colour sits on the red side, the second type's on the white side,
// each with its Energy symbol. On top stands the Pokémon's Crystal sprite;
// the button at the top end of the band switches it to its shiny colours and back.

export const SCREEN = { cx: 90, cy: 62, r: 51 } // the casing
const RP = 44                                    // the round picture's radius
const PIC = { x: SCREEN.cx - RP, y: SCREEN.cy - RP, w: RP * 2, h: RP * 2 } // the box around it
const SPRITE = 56                                // Crystal sprites are 56 x 56
const SPRITE_X = SCREEN.cx - SPRITE / 2
const SPRITE_Y = SCREEN.cy - SPRITE / 2 + 1
const ICON = 14                                  // energy icons: the 20 x 20 files, shown 30% smaller
const SMALL_LIFT = 3                             // how far Pokémon up to 1.15 m tall are raised
const SMALL_HEIGHT = 1.15                        // metres

// The tilt: the diagonal of a 4:3 picture rises 3 for every 4 across.
// side() > 0 is the upper-left side of that line through the middle (red, first type),
// side() < 0 the lower-right side (white, second type).
const UP_LEFT = { x: -0.6, y: -0.8 } // points away from the line, up and to the left
function side(px, py) {
  return (px + 0.5 - SCREEN.cx) * UP_LEFT.x + (py + 0.5 - SCREEN.cy) * UP_LEFT.y
}
function dist(px, py) {
  return Math.hypot(px + 0.5 - SCREEN.cx, py + 0.5 - SCREEN.cy)
}

const PICTURE = cellsToPath(discCells(SCREEN.cx, SCREEN.cy, RP))
// The second type's half of the picture, in whole pixels, so the diagonal steps like stairs.
const LOWER_HALF = cellsToPath(discCells(SCREEN.cx, SCREEN.cy, RP).filter(([x, y]) => side(x, y) < 0))

// The two Energy icons sit inside the picture, just within its edge: top
// centre in the first type's half, bottom centre in the second type's.
const BADGE = [-1, 1].map(dir => ({
  x: SCREEN.cx - ICON / 2,
  y: SCREEN.cy + dir * (RP - 2) - (dir < 0 ? 0 : ICON),
}))

// The casing, worked out pixel by pixel: band, red half, white half, with
// light from the top left and a shadowed lip around the picture.
const CASING = (() => {
  const paint = { band: [], red: [], redL: [], redD: [], white: [], whiteL: [], whiteD: [] }
  for (const [x, y] of discCells(SCREEN.cx, SCREEN.cy, SCREEN.r)) {
    const d = dist(x, y)
    if (d <= RP + 1) continue // the picture and its rim
    const s = side(x, y)
    const facing = -((x + 0.5 - SCREEN.cx) + (y + 0.5 - SCREEN.cy)) / (d * Math.SQRT2) // 1 = towards the light
    const lip = d < RP + 2.6
    const edge = d > SCREEN.r - 2.2
    let shade = ''
    if (lip || (edge && facing < -0.4)) shade = 'D'
    else if (edge && facing > 0.4) shade = 'L'
    if (Math.abs(s) < 2.3) paint.band.push([x, y])
    else paint[(s > 0 ? 'red' : 'white') + shade].push([x, y])
  }
  return Object.fromEntries(Object.entries(paint).map(([k, cells]) => [k, cellsToPath(cells)]))
})()

// Where the band meets the casing: the link button at the lower-left end,
// the shiny button at the upper-right end.
const ALONG = { x: 0.8, y: -0.6 } // along the band, towards the top right
const MID = (RP + SCREEN.r) / 2 + 0.5
const LINK_AT = [Math.round(SCREEN.cx - ALONG.x * MID), Math.round(SCREEN.cy - ALONG.y * MID)]
const BUTTON_AT = [Math.round(SCREEN.cx + ALONG.x * MID), Math.round(SCREEN.cy + ALONG.y * MID)]

const SHINY_BUTTON = [
  '.KKKKK.',
  'KWWWWGK',
  'KWGGGGK',
  'KWGGGGK',
  'KWGGGGK',
  'KGGGGDK',
  '.KKKKK.',
]

// The link button: the pokeggdex's red, with a signal symbol. Pressing it links
// the screen to the pokeggdex (see LinkButton below).
const LINK_BUTTON = [
  '..KKKKK..',
  '.KRRRRRK.',
  'KRWWWWWRK',
  'KWRRRRRWK',
  'KRRWWWRRK',
  'KRWRRRWRK',
  'KRRRWRRRK',
  '.KRRRRRK.',
  '..KKKKK..',
]

// The casing and its wall mount. Drawn under the cabin's lighting.
export function ScreenFrame() {
  const { cx, cy, r } = SCREEN
  return (
    <g>
      <path d={cellsToPath(discCells(cx + 2, cy + 2, r + 1))} fill={C.creamDD} /> {/* shadow on the wall */}
      <path d={cellsToPath(discCells(cx, cy, r + 1))} fill={C.ink} />
      <path d={CASING.red} fill={C.monRed} />
      <path d={CASING.redL} fill={C.monRedL} />
      <path d={CASING.redD} fill={C.monRedD} />
      <path d={CASING.white} fill={C.mon} />
      <path d={CASING.whiteL} fill={C.monL} />
      <path d={CASING.whiteD} fill={C.monD} />
      <path d={CASING.band} fill={C.ink} />
      <path d={cellsToPath(discCells(cx, cy, RP + 1))} fill={C.ink} /> {/* the picture's rim */}
    </g>
  )
}

// After a while without any input, the screen plays the opening of Pokémon
// Red and Blue: Gengar vs Nidorino. Any key, click or mouse move ends it.
function useIdle(ms) {
  const [idle, setIdle] = useState(false)
  useEffect(() => {
    let timer
    const wake = () => {
      setIdle(false)
      clearTimeout(timer)
      timer = setTimeout(() => setIdle(true), ms)
    }
    const events = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart']
    events.forEach(e => window.addEventListener(e, wake, { passive: true }))
    wake()
    return () => {
      clearTimeout(timer)
      events.forEach(e => window.removeEventListener(e, wake))
    }
  }, [ms])
  return idle
}

function Split({ first, second }) {
  return (
    <>
      <rect x={PIC.x} y={PIC.y} width={PIC.w} height={PIC.h} fill={TYPE_COLORS[first]} />
      {second && <path d={LOWER_HALF} fill={TYPE_COLORS[second]} />}
    </>
  )
}

function Sprite({ href, className = '', x = SPRITE_X, y = SPRITE_Y, mirror = false }) {
  return (
    <image
      href={href}
      x={mirror ? -x - SPRITE : x}
      y={y}
      width={SPRITE}
      height={SPRITE}
      className={'pixel-image ' + className}
      transform={mirror ? 'scale(-1 1)' : undefined}
    />
  )
}

// Red/Blue's intro: Nidorino (left, hopping) squares up to Gengar (right),
// on the plain white screen of the original.
function Intro() {
  return (
    <>
      <rect x={PIC.x} y={PIC.y} width={PIC.w} height={PIC.h} fill={C.white} />
      <g className="intro-hop">
        <Sprite href={crystalSprite(33)} x={SCREEN.cx - SPRITE + 10} mirror />
      </g>
      <Sprite href={crystalSprite(94)} x={SCREEN.cx - 10} />
    </>
  )
}

// MissingNo.: glitched colours and its famous backwards-L sprite.
function Glitch() {
  return (
    <>
      <g className="glitch-a"><GlitchBars seed={3} /></g>
      <g className="glitch-b"><GlitchBars seed={11} /></g>
      {missingnoPaths(SPRITE_X, SPRITE_Y).map(p => (
        <path key={p.fill} fill={p.fill} d={p.d} />
      ))}
    </>
  )
}

const GLITCH_COLOURS = ['#a8a77a', '#8c84b8', '#f8f8f0', '#20181c', '#d8a0d0', '#58b8a0']
function GlitchBars({ seed }) {
  // horizontal bars of random height and colour, the same on every load
  const bars = []
  let y = 0
  let n = seed
  while (y < PIC.h) {
    n = (n * 9301 + 49297) % 233280
    const h = 2 + (n % 7)
    bars.push(<rect key={y} x={PIC.x} y={PIC.y + y} width={PIC.w} height={h} fill={GLITCH_COLOURS[n % GLITCH_COLOURS.length]} />)
    y += h
  }
  return bars
}

// The link button, on the lit side of the cabin so it can light up.
// `link` is 'off', 'linking' or 'on'. While linking it blinks; once linked
// its symbol glows green.
const LINK_RED = '#b8413a'

// How light a colour looks (WCAG relative luminance, 0 = black, 1 = white).
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map(i => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
// The type colour, lifted towards white only if it would vanish on the red button
// (fighting and fire are close to it), so the symbol always stays readable.
function onRed(hex) {
  const contrast = (luminance(hex) + 0.05) / (luminance(LINK_RED) + 0.05)
  if (contrast >= 1.5 || contrast <= 1 / 1.5) return hex
  const mix = [1, 3, 5].map(i => Math.round(parseInt(hex.slice(i, i + 2), 16) * 0.45 + 255 * 0.55))
  return '#' + mix.map(c => c.toString(16).padStart(2, '0')).join('')
}

// Just the signal symbol, for the flash drawn over it.
const LINK_SYMBOL = LINK_BUTTON.map(row => row.replace(/[^W]/g, '.'))
const READY_GREEN = '#2dcb27' // the pokeggdex's green light

function LinkButton({ link, onPress, types = [], pulse }) {
  const [x, y] = LINK_AT
  const [first, second] = types
  // Linked, the symbol shows the Pokémon's second type colour, or the casing's
  // white (the Poké Ball's bottom half) for one-type Pokémon. Its flashes swap
  // that round: the first type's colour, or the pokeggdex's green light.
  const linked = second ? onRed(TYPE_COLORS[second]) : C.mon
  const flash = second ? onRed(TYPE_COLORS[first]) : READY_GREEN
  const symbol = { off: C.monL, linking: '#fff070', on: linked }[link]
  return (
    <g className={'clickable' + (link === 'linking' ? ' link-blink' : '')} onClick={onPress}>
      <rect x={x - 6} y={y - 6} width={13} height={13} fill="transparent" />
      <Pixels rows={LINK_BUTTON} palette={{ K: C.ink, R: LINK_RED, W: symbol }} x={x - 4} y={y - 4} />
      {/* now and then while linked: a quick flash, once or twice (see link.js) */}
      {link === 'on' && pulse && (
        <Pixels key={pulse.id} rows={LINK_SYMBOL} palette={{ W: flash }} x={x - 4} y={y - 4} className={'pulse pulse-' + pulse.count} />
      )}
    </g>
  )
}

// The screen while off: dark glass with a faint reflection.
function Off() {
  const glare = [0, 1, 2, 3, 4, 5, 6, 7].map(i => [SCREEN.cx - 26 + i, SCREEN.cy - 18 - i])
    .concat([0, 1, 2, 3].map(i => [SCREEN.cx - 22 + i, SCREEN.cy - 12 - i]))
  return (
    <>
      <rect x={PIC.x} y={PIC.y} width={PIC.w} height={PIC.h} fill="#1c2026" />
      <path d={cellsToPath(glare)} fill="#ffffff" opacity={0.12} />
    </>
  )
}

// While linking: three dots light up one after another, then repeat.
function Searching() {
  return (
    <>
      <Off />
      {[-6, 0, 6].map((dx, i) => (
        <rect key={dx} x={SCREEN.cx + dx - 1} y={SCREEN.cy - 1} width={2} height={2} fill="#58d868" className={'search-dot search-dot-' + i} />
      ))}
    </>
  )
}

// The shiny button: plain white plastic, glowing pale gold while shiny is on.
function ShinyButton({ shiny, onPress }) {
  const [x, y] = BUTTON_AT
  const palette = shiny
    ? { K: C.ink, W: '#ffffff', G: '#fff0a0', D: '#d8b850' }
    : { K: C.ink, W: C.monL, G: C.mon, D: C.monD }
  return (
    <g className="clickable" onClick={onPress}>
      <rect x={x - 5} y={y - 5} width={11} height={11} fill="transparent" />
      <Pixels rows={SHINY_BUTTON} palette={palette} x={x - 3} y={y - 3} />
    </g>
  )
}

export default function WallScreen({ pokemon, loading, error, link, onLink, pulse, shiny, onShiny }) {
  // (while developing, ?intro shows the intro straight away)
  const idle = useIdle(45 * 1000) || (import.meta.env.DEV && location.search.includes('intro'))

  let picture
  let badges = null
  if (link === 'off') {
    picture = <Off />
  } else if (link === 'linking') {
    picture = <Searching />
  } else if (idle) {
    picture = <Intro />
  } else if (error) {
    picture = <text x={SCREEN.cx} y={SCREEN.cy + 2} className="screen-text" textAnchor="middle">NO SIGNAL</text>
  } else if (!pokemon) {
    picture = <text x={SCREEN.cx} y={SCREEN.cy + 2} className="screen-text" textAnchor="middle">...</text>
  } else if (pokemon.id === 0) {
    picture = <Glitch />
  } else {
    const [first, second] = pokemon.types // `second` is undefined for one-type Pokémon
    // small Pokémon sit low in their sprites, so lift them a little
    const y = SPRITE_Y - (pokemon.height <= SMALL_HEIGHT ? SMALL_LIFT : 0)
    // each type's Energy symbol, in its own half of the picture
    badges = (
      <g opacity={loading ? 0.6 : 1}>
        <image href={energyIcon(first)} x={BADGE[0].x} y={BADGE[0].y} width={ICON} height={ICON} className="pixel-image" />
        {second && <image href={energyIcon(second)} x={BADGE[1].x} y={BADGE[1].y} width={ICON} height={ICON} className="pixel-image" />}
      </g>
    )
    picture = (
      <g opacity={loading ? 0.6 : 1}>
        <Split first={first} second={second} />
        <Sprite href={shiny ? pokemon.tvSpriteShiny : pokemon.tvSprite} y={y} />
      </g>
    )
  }

  return (
    <g>
      <path d={PICTURE} fill="#000" />
      <g clipPath="url(#screen-picture)">
        {picture}
        {/* the moment it links, the picture flashes on like an old screen */}
        {link === 'on' && <rect x={PIC.x} y={PIC.y} width={PIC.w} height={PIC.h} fill="#ffffff" className="power-on" pointerEvents="none" />}
      </g>
      {badges}
      {/* while off, clicking anywhere on the screen links it too */}
      {link === 'off' && <path d={PICTURE} fill="transparent" className="clickable" onClick={onLink} />}
      <LinkButton link={link} onPress={onLink} types={pokemon?.types} pulse={pulse} />
      <ShinyButton shiny={shiny} onPress={onShiny} />
      <clipPath id="screen-picture">
        <path d={PICTURE} />
      </clipPath>
    </g>
  )
}

// The screen's light on the wall around it, in the Pokémon's first type colour:
// a solid ring close to the casing, then dithered (every other pixel) as it fades out.
const GLOW = (() => {
  const near = []
  const far = []
  for (const [gx, gy] of discCells(SCREEN.cx, SCREEN.cy, SCREEN.r + 8)) {
    const out = dist(gx, gy) - (SCREEN.r + 1) // distance outside the casing
    if (out <= 0) continue
    if (out <= 3) near.push([gx, gy])
    else if ((gx + gy) % 2 === 0) far.push([gx, gy])
  }
  return { near: cellsToPath(near), far: cellsToPath(far) }
})()

export function ScreenGlow({ pokemon, strength, link }) {
  if (link !== 'on') return null // no light while the screen is off
  const colour = pokemon && pokemon.id !== 0 ? TYPE_COLORS[pokemon.types[0]] : '#ffffff'
  return (
    <g fill={colour} opacity={strength} pointerEvents="none">
      <path d={GLOW.near} />
      <path d={GLOW.far} />
    </g>
  )
}
