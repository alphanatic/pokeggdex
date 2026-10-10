import { BASE, HINGE, KNUCKLES, LID, Z, lift, basePath, headPath, lidPath, lidBackPath, lidPocket } from '../shape.js'
import { seededRandom } from '../utils.js'

// The device's plastic body, drawn as SVG so the curves match the measured shape.
// Each part is drawn twice: once at table height (its side, darker) and once
// at its own height (its top face). See lift() in shape.js.
// The paint is worn like the reference render: grime, dusty scuffs, scratches
// and rubbed edges (see <Wear>).

const TABLE = lift(0)
const at = z => `translate(0 ${lift(z)})`

function Face({ id, stops, x2 = 0.35 }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2={x2} y2="1">
      {stops.map(([offset, color]) => <stop key={offset} offset={offset} stopColor={color} />)}
    </linearGradient>
  )
}

// The worn red plastic, lit from the top left. A deep red under a thin,
// slightly polished clear coat (see the sheen in <Wear>).
const PAINT = [[0, '#b03b35'], [0.5, '#a12f2c'], [1, '#842423']]
const PAINT_HIGH = [[0, '#b9443d'], [0.4, '#a6332f'], [1, '#8d2826']] // raised parts catch more light
const PAINT_LOW = [[0, '#9c2d2a'], [0.5, '#902927'], [1, '#7a2120']]  // the lid's floor sits in the rim's shade

// The gap between a half and the hinge: 4.85 wide on both sides
const GAP = LID.x - (HINGE.cx + HINGE.r)
const knuckles = half => KNUCKLES.filter(k => k.half === half)

// Short straight scratches, most of them running roughly the same way
// (like a device that's been slid across tables), some in any direction.
function scratches(seed, count, maxLength, w = BASE.w, h = BASE.h) {
  const rnd = seededRandom(seed)
  let d = ''
  for (let i = 0; i < count; i++) {
    const x = rnd() * w
    const y = rnd() * h
    const length = 3 + rnd() ** 2 * maxLength
    const angle = rnd() < 0.6 ? -0.6 + (rnd() - 0.5) * 0.7 : rnd() * Math.PI
    d += `M${x.toFixed(1)} ${y.toFixed(1)}l${(Math.cos(angle) * length).toFixed(1)} ${(Math.sin(angle) * length).toFixed(1)}`
  }
  return d
}

// Filters for the wear, shared by every surface. Rendered once, in App.
export function WearDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      {/* dark grime settled in patches */}
      <filter id="grime" x="0" y="0" width="1" height="1">
        <feTurbulence type="fractalNoise" baseFrequency="0.016" numOctaves="4" seed="7" />
        <feColorMatrix values="0 0 0 0 0.16  0 0 0 0 0.05  0 0 0 0 0.04  3 0 0 0 -1.45" />
      </filter>
      {/* pale dusty scuffs */}
      <filter id="dust" x="0" y="0" width="1" height="1">
        <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="21" />
        <feColorMatrix values="0 0 0 0 0.93  0 0 0 0 0.8  0 0 0 0 0.74  0 2.2 0 0 -1.15" />
      </filter>
      {/* fine grain of the matte plastic */}
      <filter id="grain" x="0" y="0" width="1" height="1">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="1" seed="2" />
        <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.9 0 0 0 -0.35" />
      </filter>
      {/* the polish: a soft warm sheen, one broad reflection, darker away from the light */}
      <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ffe9e2" stopOpacity="0.16" />
        <stop offset="0.16" stopColor="#ffe9e2" stopOpacity="0.03" />
        <stop offset="0.27" stopColor="#ffece6" stopOpacity="0.13" />
        <stop offset="0.36" stopColor="#ffece6" stopOpacity="0" />
        <stop offset="0.7" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity="0.2" />
      </linearGradient>
      {/* lets only patches of a shape through: paint rubbed off here and there */}
      <filter id="patchy">
        <feTurbulence type="fractalNoise" baseFrequency="0.025" numOctaves="2" seed="11" />
        <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3 0 0 0 -1.2" />
        <feComposite in="SourceGraphic" operator="in" />
        <feGaussianBlur stdDeviation="0.8" />
      </filter>
      {/* dirt gathers along edges and in corners */}
      <filter id="soft" x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur stdDeviation="6" />
      </filter>
    </svg>
  )
}

// Wear on one surface: everything is clipped to the surface's own shape.
// `turn` rotates the noise, so different parts don't share the same pattern.
function Wear({ id, d, transform, seed, turn = 0, evenodd = false, sheen = true }) {
  const { w, h } = BASE
  const size = h + 80 // square, so it still covers everything when turned
  const noise = { x: w / 2 - size / 2, y: h / 2 - size / 2, width: size, height: size, transform: `rotate(${turn} ${w / 2} ${h / 2})` }
  return (
    <>
      <clipPath id={id}>
        <path d={d} transform={transform} clipRule={evenodd ? 'evenodd' : undefined} />
      </clipPath>
      <g clipPath={`url(#${id})`} aria-hidden="true">
        <rect {...noise} filter="url(#grime)" opacity="0.4" />
        <rect {...noise} filter="url(#dust)" opacity="0.09" />
        <rect {...noise} filter="url(#grain)" opacity="0.35" />
        <path className="scratch" d={scratches(seed, 260, 26)} />
        <path className="scratch deep" d={scratches(seed + 1, 40, 70)} />
        <path className="edge-grime" d={d} transform={transform} filter="url(#soft)" />
        <path className="edge-wear" d={d} transform={transform} filter="url(#patchy)" />
        {sheen && <rect x="0" y="-12" width={w} height={h + 12} fill="url(#sheen)" />}
        {/* the polished edges facing the light catch a thin highlight */}
        <path className="edge-shine" d={d} transform={`${transform ?? ''} translate(0.8 0.8)`} />
      </g>
    </>
  )
}

// Left half: the base and its raised head.
export function BaseBody() {
  return (
    <svg className="body" width={BASE.w} height={BASE.h} aria-hidden="true">
      <defs>
        <Face id="base-face" stops={PAINT} />
        <Face id="head-face" stops={PAINT_HIGH} x2="0.6" />
      </defs>
      <path className="body-side" d={basePath} transform={`translate(0 ${TABLE})`} />
      {/* where a knuckle is ours, a leaf joins it; where it's the lid's, the gap stays open */}
      {knuckles('base').map(k => (
        <g key={k.y0} className="hinge-part">
          <rect className="body-side" x={BASE.w} y={k.y0 + TABLE} width={GAP + HINGE.r} height={k.y1 - k.y0} />
          <rect className="leaf" x={BASE.w - 2} y={k.y0} width={GAP + HINGE.r + 2} height={k.y1 - k.y0} />
        </g>
      ))}
      <path className="base-face" d={basePath} />
      <Wear id="wear-base" d={basePath} seed={1} />
      <path className="head-side" d={headPath} />
      <path className="head-face" d={headPath} transform={at(Z.head)} />
      <Wear id="wear-head" d={headPath} transform={at(Z.head)} seed={3} />
    </svg>
  )
}

// The hinge: a cylinder lying along the seam. Seen from slightly above, its
// round front end shows as an ellipse.
export function HingeBody() {
  const { r, y0, y1 } = HINGE
  const axis = lift(r) // the cylinder's centre line is r above the table
  const ry = r / 2     // a circle seen from our angle is squashed to half height
  const body = `M 0 ${y0 + axis} A ${r} ${ry} 0 0 1 ${2 * r} ${y0 + axis} V ${y1 + axis} H 0 Z`
  return (
    <svg className="body" width={2 * r} height={BASE.h} aria-hidden="true">
      <defs>
        <linearGradient id="hinge-shade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3a100d" />
          <stop offset="0.28" stopColor="#a33a33" />
          <stop offset="0.4" stopColor="#c45a4c" />  {/* worn shine along the top */}
          <stop offset="0.62" stopColor="#8c2a25" />
          <stop offset="1" stopColor="#3a100d" />
        </linearGradient>
        <linearGradient id="hinge-gloss" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffe6dc" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ffe6dc" stopOpacity="0.38" />
          <stop offset="1" stopColor="#ffe6dc" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path className="hinge-body" d={body} />
      <Wear id="wear-hinge" d={body} seed={5} turn={90} sheen={false} />
      {/* polished: a sharp shine running along the top */}
      <rect x={0.3 * r} y={y0 + axis - ry} width={0.5 * r} height={y1 - y0 + ry} fill="url(#hinge-gloss)" />
      {/* seams between the knuckles: circles around the cylinder, seen as arcs */}
      {KNUCKLES.slice(1).map(k => (
        <g key={k.y0}>
          <path className="knuckle-seam" d={`M 0 ${k.y0 + axis} A ${r} ${ry} 0 0 1 ${2 * r} ${k.y0 + axis}`} />
          <path className="knuckle-seam-light" d={`M 0 ${k.y0 + axis + 1.2} A ${r} ${ry} 0 0 1 ${2 * r} ${k.y0 + axis + 1.2}`} />
        </g>
      ))}
      <ellipse className="hinge-end" cx={r} cy={y1 + axis} rx={r} ry={ry} />
      <ellipse className="hinge-end-rim" cx={r} cy={y1 + axis} rx={r - 1} ry={ry - 1} />
    </svg>
  )
}

// The lid from inside: a raised rim around a lower floor that the controls sit on.
export function LidBody() {
  const rim = lidPath + ' ' + lidPocket // the outline with the pocket cut out
  return (
    <svg className="body" width={BASE.w} height={BASE.h} aria-hidden="true">
      <defs>
        <Face id="lid-rim" stops={PAINT} />
        <Face id="lid-floor" stops={PAINT_LOW} />
      </defs>
      {knuckles('lid').map(k => (
        <g key={k.y0} className="hinge-part">
          <rect className="body-side" x={-GAP} y={k.y0 + TABLE} width={GAP + 2} height={k.y1 - k.y0} />
          <rect className="leaf" x={-GAP} y={k.y0 + lift(Z.lidRim)} width={GAP + 2} height={k.y1 - k.y0} />
        </g>
      ))}
      <path className="body-side" d={lidPath} transform={`translate(0 ${TABLE})`} />
      <path className="lid-wall" d={lidPocket} transform={at(Z.lidRim)} />
      <path className="lid-floor-face" d={lidPocket} transform={at(Z.lidFloor)} />
      <Wear id="wear-lid-floor" d={lidPocket} transform={at(Z.lidFloor)} seed={7} turn={180} />
      <path className="lid-rim" d={rim} fillRule="evenodd" transform={at(Z.lidRim)} />
      <Wear id="wear-lid-rim" d={rim} transform={at(Z.lidRim)} seed={9} turn={180} evenodd />
    </svg>
  )
}

// The lid from outside, folded shut over the base. Drawn in the base's
// coordinates; its top edge sits around the head, 2 px clear of the step.
export function LidBack() {
  const top = Z.hinge                // closed, the lid's back is level with the top of the hinge
  const rimBottom = Z.hinge - Z.lidRim
  return (
    <svg className="body" width={BASE.w} height={BASE.h} aria-hidden="true">
      <defs>
        <Face id="lid-back" stops={PAINT_HIGH} x2="0.6" />
      </defs>
      <path className="lid-gap" d={lidBackPath} />
      {knuckles('lid').map(k => (
        <g key={k.y0}>
          <rect className="body-side" x={BASE.w - 2} y={k.y0 + lift(rimBottom)} width={GAP + 2} height={k.y1 - k.y0} />
          <rect className="leaf" x={BASE.w - 2} y={k.y0 + lift(top)} width={GAP + 2} height={k.y1 - k.y0} />
        </g>
      ))}
      <path className="body-side" d={lidBackPath} transform={at(rimBottom)} />
      <path className="lid-back-face" d={lidBackPath} transform={at(top)} />
      <g transform={at(top)}>
        <path className="lid-triangle" d="M 26 172 L 38 152 L 50 172 Z" />
        {[0, 8, 16, 24].map(y => <rect key={y} className="grip-line" x="24" y={505 + y} width="80" height="3" />)}
      </g>
      <Wear id="wear-lid-back" d={lidBackPath} transform={at(top)} seed={11} turn={90} />
    </svg>
  )
}
