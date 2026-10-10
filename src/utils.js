// Small helpers and lookup tables used by several components.

export const TYPE_COLORS = {
  normal: '#a8a77a', fire: '#ee8130', water: '#6390f0', electric: '#e6bc2f',
  grass: '#7ac74c', ice: '#76c8c4', fighting: '#c22e28', poison: '#a33ea1',
  ground: '#d4a843', flying: '#a98ff3', psychic: '#f95587', bug: '#a6b91a',
  rock: '#b6a136', ghost: '#735797', dragon: '#6f35fc', dark: '#705746',
  steel: '#9a9ab8', fairy: '#d685ad',
  bird: '#8c84b8', // only MissingNo. has it: a type cut from Red and Blue
}

export const STAT_LABELS = {
  hp: 'HP', attack: 'ATK', defense: 'DEF',
  'special-attack': 'SP.ATK', 'special-defense': 'SP.DEF', speed: 'SPD',
}

// 25 -> "025"
export function formatNumber(id) {
  return String(id).padStart(3, '0')
}

// "thunder-punch" -> "thunder punch"
export function formatName(name) {
  return name.replaceAll('-', ' ')
}

// Search by name or number. "11" matches every number containing "11"
// in that order (011, 110, 111, ...); "char" matches charmander, charizard...
export function filterPokemon(list, search) {
  const query = search.trim().toLowerCase().replace(/^#/, '')
  return list.filter(p => p.name.includes(query) || formatNumber(p.id).includes(query))
}

// A tiny seeded random generator (mulberry32): the same "random" numbers on
// every load, so drawn details (scratches, wood grain) don't change.
export function seededRandom(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
