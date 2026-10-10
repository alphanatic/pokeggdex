// The Pokédex's real shape, measured from the reference render.
// How it was measured: see design/shape-study/README.md.
// Units: px, scaled so the base is 568 tall (1 mm = 3.783 px).

export const BASE = { w: 356, h: 568, r: 7 }

// The raised head (lens + lights). Its step runs flat on the outer side,
// then rises in an S towards the hinge, where only a thin rail is left.
export const HEAD = { lowY: 140.7, highY: 45.2, sx0: 100.5, sx1: 336.8 }

// Hinge: a cylinder as thick as the closed device, centred between the halves,
// running the halves' full height (2.1 short of the ends, top and bottom).
export const HINGE = { cx: 382.2, r: 21.35, y0: 2.1, y1: 565.9 }

// Like any real hinge it is split into knuckles: the top and bottom ones are
// joined to the base, the long middle one to the lid. A leaf bridges the gap
// between each knuckle and its own half.
export const KNUCKLES = [
  { y0: HINGE.y0, y1: 130, half: 'base' },
  { y0: 130, y1: 459, half: 'lid' },
  { y0: 459, y1: HINGE.y1, half: 'base' },
]

// Lid: mirrors the base over the hinge's centre line. Its top edge is the
// head's step mirrored (plus 2 clearance), so closed it fits around the head.
// x is measured from the lid's hinge side.
export const LID = { x: 2 * HINGE.cx - BASE.w, w: 356, topHi: 47.2, topLo: 142.8, sx0: 19.1, sx1: 255.3, rim: 19.1 }

// Heights above the table.
export const Z = { base: 22.7, head: 31, hinge: 42.7, lidRim: 17.4, lidFloor: 11.3 }

// We look at the device slightly from above: a surface at height z is drawn
// (base - z) / 2 lower than its plan position, so taller parts sit higher.
export const lift = z => (Z.base - z) / 2

// An S between two flat lines: a cubic Bézier with flat tangents at both ends.
function sCurve(x0, y0, x1, y1) {
  const xm = (x0 + x1) / 2
  return `C ${xm} ${y0} ${xm} ${y1} ${x1} ${y1}`
}

const { w, h, r } = BASE

export const basePath = `M 0 ${r} A ${r} ${r} 0 0 1 ${r} 0 H ${w} V ${h - r} A ${r} ${r} 0 0 1 ${w - r} ${h} H ${r} A ${r} ${r} 0 0 1 0 ${h - r} Z`

export const headPath =
  `M 0 ${r} A ${r} ${r} 0 0 1 ${r} 0 H ${w} V ${HEAD.highY} H ${HEAD.sx1} ` +
  sCurve(HEAD.sx1, HEAD.highY, HEAD.sx0, HEAD.lowY) + ` H 0 Z`

// The lid seen from inside (open): hinge side on the left.
export const lidPath =
  `M 0 ${LID.topHi} H ${LID.sx0} ` + sCurve(LID.sx0, LID.topHi, LID.sx1, LID.topLo) +
  ` H ${w} V ${h - r} A ${r} ${r} 0 0 1 ${w - r} ${h} H ${r} A ${r} ${r} 0 0 1 0 ${h - r} Z`

// The lid seen from outside (closed): lies over the base, hinge side on the right.
export const lidBackPath =
  `M 0 ${LID.topLo} H ${w - LID.sx1} ` + sCurve(w - LID.sx1, LID.topLo, w - LID.sx0, LID.topHi) +
  ` H ${w} V ${h - r} A ${r} ${r} 0 0 1 ${w - r} ${h} H ${r} A ${r} ${r} 0 0 1 0 ${h - r} Z`

// The pocket inside the lid's rim: the outline moved in by the rim's width.
// The top edge is offset along its normal, so the rim is equally wide on the S.
function bezier(t, p0, p1, p2, p3) {
  const u = 1 - t
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3
}

function lidPocketPath() {
  const { sx0, sx1, topHi, topLo, rim } = LID
  const xm = (sx0 + sx1) / 2
  const pts = [[rim, topHi + rim]]
  for (let i = 0; i <= 48; i++) {
    const t = i / 48
    const x = bezier(t, sx0, xm, xm, sx1)
    const y = bezier(t, topHi, topHi, topLo, topLo)
    const dx = bezier(t + 1e-4, sx0, xm, xm, sx1) - x
    const dy = bezier(t + 1e-4, topHi, topHi, topLo, topLo) - y
    const len = Math.hypot(dx, dy)
    pts.push([x - (dy / len) * rim, y + (dx / len) * rim])
  }
  pts.push([w - rim, topLo + rim], [w - rim, h - rim], [rim, h - rim])
  return 'M ' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L ') + ' Z'
}
export const lidPocket = lidPocketPath()
