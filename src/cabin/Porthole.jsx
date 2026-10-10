import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { crystalSprite } from '../api.js'
import { seededRandom } from '../utils.js'
import { Pixels, cellsToPath, discCells, ringCells } from './pixels.jsx'
import { C, SKY } from './palette.js'

// The porthole: a brass ring in the wall, looking out over Vermilion City's
// harbour, where the S.S. Anne is docked. The sky follows the real time of day,
// the sea moves, and now and then a Pokémon surfaces.

export const PORT = { cx: 244, cy: 42, rim: 34, glass: 27 }
const HORIZON = 40 // first row of sea
const CREST = 60   // where the near waves start; things behind them are "in" the water

// ------------------------------------------------------------ the brass rim

export function PortholeRim() {
  const { cx, cy, rim, glass } = PORT
  const brass = { light: [], mid: [], dark: [] }
  for (const [x, y] of ringCells(cx, cy, rim, glass + 1)) {
    const dx = x + 0.5 - cx
    const dy = y + 0.5 - cy
    const dist = Math.hypot(dx, dy)
    const facing = -(dx + dy) / (dist * Math.SQRT2) // 1 = faces the light (top left)
    if (dist < glass + 2) brass.dark.push([x, y])                   // the inner lip, in shadow
    else if (dist > rim - 2.5 && facing > 0.45) brass.light.push([x, y])
    else if (dist > rim - 2.5 && facing < -0.45) brass.dark.push([x, y])
    else brass.mid.push([x, y])
  }
  // eight bolts around the ring
  const bolts = []
  const shine = []
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 + Math.PI / 8
    const bx = Math.round(cx + (rim - 3.5) * Math.cos(a) - 1)
    const by = Math.round(cy + (rim - 3.5) * Math.sin(a) - 1)
    bolts.push([bx, by], [bx + 1, by], [bx, by + 1], [bx + 1, by + 1])
    shine.push([bx, by])
  }
  return (
    <g>
      <path d={cellsToPath(discCells(cx + 1.5, cy + 1.5, rim + 1))} fill={C.creamDD} /> {/* shadow on the wall */}
      <path d={cellsToPath(ringCells(cx, cy, rim + 1, rim))} fill={C.ink} />
      <path d={cellsToPath(brass.mid)} fill={C.brass} />
      <path d={cellsToPath(brass.light)} fill={C.brassL} />
      <path d={cellsToPath(brass.dark)} fill={C.brassD} />
      <path d={cellsToPath(bolts)} fill={C.brassD} />
      <path d={cellsToPath(shine)} fill={C.brassL} />
      <path d={cellsToPath(ringCells(cx, cy, glass + 1, glass))} fill={C.ink} />
    </g>
  )
}

// ------------------------------------------------------------ what passes by

// Each visitor: its Pokédex number, how long its visit lasts, how often it comes.
const VISITORS = {
  magikarp: { id: 129, ms: 2400, weight: 5 },
  tentacool: { id: 72, ms: 5200, weight: 4 },
  gyarados: { id: 130, ms: 6800, weight: 2 },
  pikachu: { id: 25, ms: 6000, weight: 0.5 }, // rare: Pokémon Yellow's surfing Pikachu
  lapras: { id: 131, ms: 9500, weight: 4, fridaysOnly: true },
}

// Easter egg: like Pokémon Gold/Silver/Crystal, where LAPRAS surfaces in
// Union Cave only on Fridays, it only swims past the porthole on Fridays.
// And any visitor can be shiny, at the real Gen 2 odds: 1 in 8192.
function pickVisitor(isFriday) {
  const options = Object.entries(VISITORS).filter(([, v]) => isFriday || !v.fridaysOnly)
  let roll = Math.random() * options.reduce((sum, [, v]) => sum + v.weight, 0)
  for (const [type, v] of options) {
    roll -= v.weight
    if (roll <= 0) return { type, start: performance.now(), shiny: Math.random() < 1 / 8192 }
  }
}

// Where the visitor's 56 x 56 sprite is at `t` ms into its visit.
function pose(type, t) {
  const blink = ms => Math.floor(t / ms) % 2 // 0, 1, 0, 1... every `ms`
  const ramp = (from, to, t0, t1) => from + (to - from) * Math.min(1, Math.max(0, (t - t0) / (t1 - t0)))
  switch (type) {
    case 'magikarp': {
      // one big jump across, right to left, with a splash at each end
      const p = Math.min(1, t / 1800)
      const cx = 264 - 46 * p
      return {
        x: cx - 28,
        y: 58 - 40 * 4 * p * (1 - p),
        splash: t < 300 ? [261, CREST - 2] : t > 1650 && t < 2300 ? [215, CREST - 2] : null,
      }
    }
    case 'tentacool': {
      const y = t < 900 ? ramp(66, 30, 0, 900) : t > 4300 ? ramp(30, 66, 4300, 5200) : 30 + blink(450)
      return { x: 204, y }
    }
    case 'gyarados': {
      const y = t < 2200 ? ramp(72, 14, 0, 2200) : t > 4600 ? ramp(14, 72, 4600, 6800) : 14 + blink(600)
      const roar = t > 2600 && t < 3400 ? (blink(60) ? 1 : -1) : 0
      return { x: 216 + roar, y, sparkle: t > 2200 && t < 3200 }
    }
    case 'lapras':
      return { x: ramp(300, 188, 0, 9500) - 28, y: 24 + blink(600) }
    case 'pikachu': {
      const x = ramp(300, 180, 0, 6000) - 28
      return { x, y: 6 + blink(300), board: true, wake: blink(150) }
    }
  }
}

// What you hear when you click a visitor
const TALK = {
  magikarp: ['MAN: Hello, there! Have I got a deal just for you!', "I'll let you have a swell MAGIKARP for just ¥500!", 'MAGIKARP used SPLASH! ...But nothing happened!'],
  tentacool: ['A wild TENTACOOL appeared!', 'The sea is full of them. Better stock up on REPELs before you SURF.'],
  gyarados: ['A wild GYARADOS appeared!', 'Hard to believe it was a MAGIKARP once.'],
  lapras: ['A LAPRAS! It ferries people across the sea.', 'They say one surfaces in UNION CAVE... but only on FRIDAYS.'],
  pikachu: ['!? A PIKACHU is SURFING!', "It must be on its way to PIKACHU's BEACH."],
}
const SHINY_TALK = {
  gyarados: ['!? A red GYARADOS!', "Shouldn't it be at the LAKE OF RAGE?", '(The odds of seeing one: 1 in 8192.)'],
}
const name = type => type.toUpperCase()
const shinyTalk = type => SHINY_TALK[type] ?? [`!? This ${name(type)}'s colours are... different!`, '(The odds of seeing one: 1 in 8192.)']

// ------------------------------------------------------------ small sprites

const TRUCK = [
  '....KKKKKKKKK',
  '.KKKKWWWWWWWK',
  'KGGBKWWWWWWWK',
  'KBBBKWWWWWWWK',
  'KBBBBKKKKKKKK',
  'KDDDDDDDDDDDK',
  '.KK.....KK...',
  '.KK.....KK...',
]
const TRUCK_COLOURS = { K: C.ink, W: C.white, G: '#a8d8f8', B: '#4870c0', D: C.greyD }

const CLOUD = ['..WWW......', '.WWWWW.WW..', 'WWWWWWWWWWW', '.SSSSSSSSS.']
const SPLASH = ['.W...W.', '..W.W..', 'W.WWW.W', '.WWWWW.']
const STAR = ['.W.', 'WWW', '.W.']
const BOARD = ['..RRRRRRRRRRRRRRRRRRRR..', '.RWWWWWWWWWWWWWWWWWWWWR.', 'KKKKKKKKKKKKKKKKKKKKKKKK']

// The skyline of Vermilion across the water: [x, width, height]
const TOWN = [[217, 4, 4], [221, 3, 7], [224, 5, 5], [229, 4, 8], [233, 3, 4], [236, 5, 6], [241, 3, 3]]

// ------------------------------------------------------------ the view

const { cx, cy, glass } = PORT
const GLASS = cellsToPath(discCells(cx, cy, glass))
const GLARE = cellsToPath([0, 1, 2, 3, 4, 5].map(i => [226 + i, 31 - i]).concat([0, 1, 2].map(i => [229 + i, 33 - i])))
const DITHER = cellsToPath(Array.from({ length: glass }, (_, i) => [cx - glass + i * 2 + 1, 29]))
const FAR_WAVES = [[44, 2, 0], [48, 3, 6], [53, 4, 3], [57, 5, 9]].map(([y, len, off]) => ({
  y,
  d: cellsToPath(Array.from({ length: 6 }, (_, i) => Array.from({ length: len }, (_, j) => [cx - glass - 16 + off + i * 16 + j, y])).flat()),
}))
const CRESTS = cellsToPath(Array.from({ length: 10 }, (_, i) => {
  const x0 = cx - glass - 8 + i * 8
  return [[x0 + 2, CREST], [x0 + 3, CREST], [x0 + 4, CREST], [x0 + 1, CREST + 1], [x0 + 2, CREST + 1], [x0 + 3, CREST + 1], [x0 + 4, CREST + 1], [x0 + 5, CREST + 1]]
}).flat())
const STARS = (() => {
  const rnd = seededRandom(25)
  return Array.from({ length: 18 }, () => [Math.floor(cx - glass + rnd() * glass * 2), Math.floor(cy - glass + rnd() * (HORIZON - (cy - glass) - 3))])
})()

// Everything out there that doesn't move by itself: sky, town, sea.
// `memo` means it's only redrawn when the time of day changes, not on every
// frame while a Pokémon swims past.
const Harbour = memo(function Harbour({ time }) {
  const sky = SKY[time]
  const cloudShade = time === 'morn' ? '#f0c0b0' : '#d0e8f8'
  return (
    <g>
      {/* sky, in two bands with a dithered seam, like a Game Boy gradient */}
      <rect x={cx - glass} y={cy - glass - 2} width={glass * 2} height={HORIZON - (cy - glass) + 2} fill={sky.top} />
      <rect x={cx - glass} y={30} width={glass * 2} height={HORIZON - 30} fill={sky.low} />
      <path d={DITHER} fill={sky.low} />

      {time === 'day' && <path d={cellsToPath(discCells(229, 25, 3.6))} fill="#fff8c8" />}
      {time === 'morn' && <path d={cellsToPath(discCells(236, 35, 4.6))} fill="#f8a868" />}
      {time === 'nite' && (
        <>
          <path d={cellsToPath(discCells(232, 24, 3.6).filter(([x, y]) => Math.hypot(x + 0.5 - 233.6, y + 0.5 - 23) > 3.4))} fill="#f8f0c0" />
          <path d={cellsToPath(STARS)} fill="#f8f0c0" />
          <path d={cellsToPath(STARS.filter((_, i) => i % 3 === 0))} fill={sky.top} className="twinkle" />
        </>
      )}
      {time !== 'nite' && (
        <>
          <Pixels rows={CLOUD} palette={{ W: C.white, S: cloudShade }} x={246} y={21} />
          <Pixels rows={CLOUD} palette={{ W: C.white, S: cloudShade }} x={222} y={31} opacity={0.8} />
        </>
      )}

      {/* Vermilion's skyline; at night its windows are lit */}
      {TOWN.map(([x, w, h]) => <rect key={x} x={x} y={HORIZON - h} width={w} height={h} fill={sky.town} />)}
      <rect x={229} y={HORIZON - 9} width={4} height={1} fill={C.red} />
      {time === 'nite' && <path d={cellsToPath([[222, 35], [230, 34], [231, 36], [237, 37], [225, 37]])} fill={sky.light} />}

      {/* the sea, with far waves drifting by */}
      <rect x={cx - glass} y={HORIZON} width={glass * 2} height={cy + glass - HORIZON + 2} fill={sky.sea} />
      <g className="waves-far">
        {FAR_WAVES.map(({ y, d }) => <path key={y} d={d} fill={sky.foam} opacity={0.35 + (y - 44) * 0.04} />)}
      </g>
    </g>
  )
})

// The dock, with the truck on it.
const Dock = memo(function Dock() {
  return (
    <g>
      <rect x={256} y={HORIZON} width={18} height={1} fill={C.woodHL} />
      <rect x={256} y={HORIZON + 1} width={18} height={2} fill={C.woodD} />
      <path d={cellsToPath([258, 263, 268].flatMap(x => [0, 1, 2, 3].map(j => [x, HORIZON + 3 + j])))} fill={C.woodDD} />
      <Pixels rows={TRUCK} palette={TRUCK_COLOURS} x={258} y={HORIZON - 8} />
    </g>
  )
})

// The near waves, in front of anything in the water.
const NearWaves = memo(function NearWaves({ time }) {
  const sky = SKY[time]
  return (
    <g className="waves-near">
      <rect x={cx - glass - 8} y={CREST + 1} width={glass * 2 + 16} height={12} fill={sky.sea} />
      <rect x={cx - glass - 8} y={CREST + 5} width={glass * 2 + 16} height={8} fill={sky.seaD} />
      <path d={CRESTS} fill={sky.foam} />
    </g>
  )
})

export function PortholeView({ time, isFriday, say, onFindMew }) {
  const sky = SKY[time]
  const [visitor, setVisitor] = useState(null)
  const [now, setNow] = useState(0)
  const first = useRef(true)
  const truckTries = useRef(0)

  // Book the next visitor; when one is here, end its visit on time.
  useEffect(() => {
    if (visitor) {
      const leave = setTimeout(() => setVisitor(null), VISITORS[visitor.type].ms)
      return () => clearTimeout(leave)
    }
    const wait = first.current ? 3500 : 9000 + Math.random() * 14000 // the first one comes soon
    const arrive = setTimeout(() => {
      first.current = false
      setVisitor(pickVisitor(isFriday))
    }, wait)
    return () => clearTimeout(arrive)
  }, [visitor, isFriday])

  // While a visitor is here, redraw every frame so it moves.
  useEffect(() => {
    if (!visitor) return
    if (visitor.shiny) say(shinyTalk(visitor.type))
    let frame
    const tick = () => {
      setNow(performance.now())
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [visitor, say])

  // Load the sprites early, so nobody pops in half-drawn.
  useEffect(() => {
    Object.values(VISITORS).forEach(v => { new Image().src = crystalSprite(v.id) })
  }, [])

  // While developing: window.__visit('gyarados', true) calls a visitor now.
  useEffect(() => {
    if (!import.meta.env.DEV) return
    window.__visit = (type, shiny = false) => setVisitor({ type, start: performance.now(), shiny })
  }, [])

  // Easter egg: the truck on the dock. In Red and Blue there's a truck next to
  // the S.S. Anne, and the playground rumour said MEW was hiding under it.
  const clickTruck = useCallback(e => {
    e.stopPropagation()
    truckTries.current += 1
    if (truckTries.current === 1) {
      say(["There's a TRUCK parked on the dock.", 'People say MEW is hiding under it...'])
    } else if (truckTries.current === 2) {
      say(['RED used STRENGTH!', "...The TRUCK won't budge."])
    } else {
      truckTries.current = 0
      say(['...!?', 'Something pink darted out from under the TRUCK!'])
      onFindMew() // straight away, so nothing that happens to the message can lose it
    }
  }, [say, onFindMew])

  function clickVisitor(e) {
    e.stopPropagation()
    say(visitor.shiny ? shinyTalk(visitor.type) : TALK[visitor.type])
  }

  const t = visitor ? Math.max(0, now - visitor.start) : 0
  const p = visitor ? pose(visitor.type, t) : null
  const px = p && Math.round(p.x)
  const py = p && Math.round(p.y)
  const onTop = visitor?.type === 'pikachu' // rides on the waves instead of in them

  const visitorImage = visitor && (
    <g className="clickable" onClick={clickVisitor}>
      <image href={crystalSprite(VISITORS[visitor.type].id, visitor.shiny)} x={px} y={py} width={56} height={56} className="pixel-image" />
    </g>
  )

  return (
    <g>
      <clipPath id="porthole-glass">
        <path d={GLASS} />
      </clipPath>
      <g clipPath="url(#porthole-glass)" className="clickable" onClick={() => say(['VERMILION CITY', 'The Port of Exquisite Sunsets'])}>
        <g className="rock">
          <Harbour time={time} />
          <Dock />

          {!onTop && visitorImage}
          <NearWaves time={time} />
          {onTop && (
            <g>
              {visitorImage}
              <Pixels rows={BOARD} palette={{ R: C.red, W: C.white, K: C.ink }} x={px + 16} y={py + 54} className="clickable" onClick={clickVisitor} />
              {p.wake === 1 && <Pixels rows={SPLASH} palette={{ W: sky.foam }} x={px + 40} y={py + 52} />}
            </g>
          )}
          {p?.splash && <Pixels rows={SPLASH} palette={{ W: sky.foam }} x={p.splash[0]} y={p.splash[1]} />}
          {p?.sparkle && visitor.shiny && (
            <g className="sparkle">
              {[[6, 8], [46, 14], [12, 38], [40, 40]].map(([dx, dy]) => (
                <Pixels key={dx} rows={STAR} palette={{ W: '#fff8c8' }} x={px + dx} y={py + dy} />
              ))}
            </g>
          )}

          {/* the truck's click area sits on top, so a Pokémon passing in front can't block it */}
          <rect x={255} y={30} width={17} height={12} fill="transparent" className="clickable" onClick={clickTruck} />
        </g>

        {/* glare on the glass */}
        <path d={GLARE} fill="#ffffff" opacity={0.35} />
      </g>
    </g>
  )
}
