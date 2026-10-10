// Helpers for drawing pixel art as SVG.
//
// The cabin is a 320 x 180 pixel picture, like a Game Boy Color screen but
// wider, scaled up with hard edges. Every shape is made of whole pixels.
// Instead of one <rect> per pixel (thousands of elements), pixels of the same
// colour are merged into horizontal runs and written as a single <path>.

// [[x, y], ...] -> one SVG path, one "M x y h w v 1 h -w Z" box per run.
export function cellsToPath(cells) {
  const rows = new Map()
  for (const [x, y] of cells) {
    if (!rows.has(y)) rows.set(y, [])
    rows.get(y).push(x)
  }
  let d = ''
  for (const [y, xs] of rows) {
    xs.sort((a, b) => a - b)
    let start = xs[0]
    let prev = xs[0]
    for (let i = 1; i <= xs.length; i++) {
      if (xs[i] === prev + 1) {
        prev = xs[i]
        continue
      }
      d += `M${start} ${y}h${prev - start + 1}v1h${-(prev - start + 1)}Z`
      start = prev = xs[i]
    }
  }
  return d
}

// Pixels inside a circle, centred on (cx, cy). Each pixel counts if its
// middle is inside, which gives the stepped edge of a Game Boy circle.
export function discCells(cx, cy, r) {
  const cells = []
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
    for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
      const dx = x + 0.5 - cx
      const dy = y + 0.5 - cy
      if (dx * dx + dy * dy <= r * r) cells.push([x, y])
    }
  }
  return cells
}

// Pixels between two circles: a ring, like the porthole's brass rim.
export function ringCells(cx, cy, outer, inner) {
  return discCells(cx, cy, outer).filter(([x, y]) => {
    const dx = x + 0.5 - cx
    const dy = y + 0.5 - cy
    return dx * dx + dy * dy > inner * inner
  })
}

// A sprite drawn as text: one character per pixel, '.' is see-through.
//   rows    ['.KK.', 'KWWK', ...]
//   palette { K: '#20181c', W: '#f8f8f0' }
// Returns [{ fill, d }], one path per colour, placed at (x, y).
export function spritePaths(rows, palette, x = 0, y = 0) {
  const byColour = {}
  rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const ch = row[i]
      if (ch === '.' || ch === ' ') continue
      ;(byColour[ch] ??= []).push([x + i, y + j])
    }
  })
  return Object.entries(byColour).map(([ch, cells]) => ({ fill: palette[ch], d: cellsToPath(cells) }))
}

// Draws a text sprite (see spritePaths) as SVG paths.
export function Pixels({ rows, palette, x = 0, y = 0, ...rest }) {
  return (
    <g {...rest}>
      {spritePaths(rows, palette, x, y).map(p => (
        <path key={p.fill} fill={p.fill} d={p.d} />
      ))}
    </g>
  )
}
