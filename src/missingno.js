// Easter egg: No.000, MissingNo. ("Missing Number"), the famous glitch
// Pokémon of Red and Blue, met by surfing along the east coast of Cinnabar
// Island after talking to the old man in Viridian City.
// Everything here is as the original games show it:
//   - types: BIRD (a type cut from the games) and NORMAL
//   - height 10'00" (3.0 m), weight 3507.2 lb (1590.8 kg)
//   - base stats HP 33, Attack 136, Defense 0, Speed 29, Special 6
//   - moves: Water Gun, Water Gun, Sky Attack
//   - its pokeggdex text in the Japanese games: "コメント さくせいちゅう",
//     "comment being written": nobody ever wrote one.
//   - meeting it adds 128 to the 6th item in your bag.
import { cellsToPath } from './cabin/pixels.jsx'

// The sprite: a "backwards L" of scrambled pixels, 56 x 56 like the others.
const GREYS = ['#20181c', '#5a6070', '#9098a8', '#f8f8f0']

function missingnoCells() {
  const byColour = GREYS.map(() => [])
  let n = 151
  for (let y = 6; y < 54; y++) {
    for (let x = 10; x < 46; x++) {
      const inBar = x >= 30            // the tall stroke on the right
      const inFoot = y >= 40           // the foot along the bottom
      if (!inBar && !inFoot) continue
      n = (n * 1103515245 + 12345) & 0x7fffffff
      // mostly dark, in short horizontal streaks like corrupted tile data
      const pick = (n >> 16) % 7
      const colour = pick < 3 ? 0 : pick < 5 ? 1 : pick < 6 ? 2 : 3
      byColour[colour].push([x, y])
    }
  }
  return byColour
}

// [{ fill, d }] for drawing it in an SVG at (x, y)
export function missingnoPaths(x = 0, y = 0) {
  return missingnoCells().map((cells, i) => ({
    fill: GREYS[i],
    d: cellsToPath(cells.map(([cx, cy]) => [cx + x, cy + y])),
  }))
}

// The same sprite as an image file (a data URL), for the pokeggdex's own screens.
// Those show 96 x 96 sprites with empty space around the Pokémon, so it gets the same margin.
const svg =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 -20 96 96" shape-rendering="crispEdges">` +
  missingnoPaths().map(p => `<path fill="${p.fill}" d="${p.d}"/>`).join('') +
  `</svg>`
const SPRITE = `data:image/svg+xml,${encodeURIComponent(svg)}`

const MOVE = 'https://pokeapi.co/api/v2/move'

export const MISSINGNO = {
  id: 0,
  name: 'missingno.',
  genus: '???',
  entry: 'コメント さくせいちゅう (comment being written)',
  sprite: SPRITE,
  spriteShiny: SPRITE,
  tvSprite: SPRITE,
  tvSpriteShiny: SPRITE,
  cry: null,
  types: ['bird', 'normal'],
  height: 3.0,
  weight: 1590.8,
  stats: [
    { name: 'hp', value: 33 },
    { name: 'attack', value: 136 },
    { name: 'defense', value: 0 },
    { name: 'special-attack', value: 6 }, // Gen 1 had one "Special" stat for both
    { name: 'special-defense', value: 6 },
    { name: 'speed', value: 29 },
  ],
  moves: [
    { name: 'water-gun', url: `${MOVE}/55/` },
    { name: 'water-gun', url: `${MOVE}/55/` },
    { name: 'sky-attack', url: `${MOVE}/143/` },
  ],
  sprites: [{ label: 'Front', url: SPRITE }],
}
