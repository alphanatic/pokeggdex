// All talking to the API lives in this one file.
//
// An API (Application Programming Interface) is a door into someone else's
// program. PokéAPI is a server full of Pokémon data. We send it a request
// (a URL), and it sends back data as JSON: plain text shaped like
// JavaScript objects. No webpage, no styling, just data for our code.

const BASE_URL = 'https://pokeapi.co/api/v2'

// A cache remembers answers we already got, so clicking back to a Pokémon
// doesn't ask the API again. A Map is like an object: cache.get(url), cache.set(url, data).
const cache = new Map()

// `async` marks a function that waits for slow things (like the internet).
// Inside it, `await` means "pause here until the answer arrives".
async function getJSON(url) {
  if (cache.has(url)) return cache.get(url)

  // 1. Send the request. fetch() is built into every browser.
  const response = await fetch(url)

  // 2. Check the status code. 200 = OK, 404 = not found.
  if (!response.ok) {
    throw new Error(`The API said no (status ${response.status})`)
  }

  // 3. Turn the JSON text into a real JavaScript object, and remember it.
  const data = await response.json()
  cache.set(url, data)
  return data
}

// Game text contains line breaks from the old Game Boy screen; squash them into spaces.
function cleanText(text) {
  return text.replace(/\s+/g, ' ')
}

// The first 151 Pokémon: just names, for the list mode.
export async function getPokemonList() {
  const data = await getJSON(`${BASE_URL}/pokemon?limit=151`)
  // The API gives [{ name, url }, ...]; we add the Pokédex number ourselves.
  return data.results.map((pokemon, index) => ({ id: index + 1, name: pokemon.name }))
}

// One Pokémon in detail. The data is split over two API addresses:
//   /pokemon/7          -> body: sprites, types, stats, moves, cry
//   /pokemon-species/7  -> "book" info: category and Pokédex entry text
export async function getPokemon(id) {
  // Promise.all sends both requests at the same time and waits for both answers.
  const [data, species] = await Promise.all([
    getJSON(`${BASE_URL}/pokemon/${id}`),
    getJSON(`${BASE_URL}/pokemon-species/${id}`),
  ])

  const englishEntries = species.flavor_text_entries.filter(e => e.language.name === 'en')
  // Prefer the text from Pokémon Red, the original game; otherwise any English one.
  const entry = englishEntries.find(e => e.version.name === 'red') ?? englishEntries[0]
  const genus = species.genera.find(g => g.language.name === 'en')?.genus ?? ''
  // The TV uses the Game Boy Color sprites from Pokémon Crystal, the first game with shiny Pokémon.
  const crystal = data.sprites.versions?.['generation-ii']?.crystal

  // 4. The API returns a LOT. We pick out only what we need, in a simpler shape.
  return {
    id: data.id,
    name: data.name,
    genus: genus.replace(' Pokémon', ''), // "Tiny Turtle Pokémon" -> "Tiny Turtle"
    entry: entry ? cleanText(entry.flavor_text) : 'No entry yet.',
    sprite: data.sprites.front_default,
    spriteShiny: data.sprites.front_shiny ?? data.sprites.front_default, // ?? = "if missing, use this"
    tvSprite: crystal?.front_transparent ?? data.sprites.front_default,
    tvSpriteShiny: crystal?.front_shiny_transparent ?? data.sprites.front_shiny ?? data.sprites.front_default,
    cry: data.cries?.legacy ?? data.cries?.latest, // legacy = the original 8-bit sound
    types: data.types.map(t => t.type.name),
    height: data.height / 10, // API gives decimetres; convert to metres
    weight: data.weight / 10, // API gives hectograms; convert to kg
    stats: data.stats.map(s => ({ name: s.stat.name, value: s.base_stat })),
    moves: data.moves
      .map(m => ({ name: m.move.name, url: m.move.url }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    sprites: [
      { label: 'Front', url: data.sprites.front_default },
      { label: 'Back', url: data.sprites.back_default },
      { label: 'Shiny front', url: data.sprites.front_shiny },
      { label: 'Shiny back', url: data.sprites.back_shiny },
    ].filter(s => s.url), // drop any the API doesn't have
  }
}

// A Pokémon Crystal sprite by number, for the cabin's extras (the Pokémon
// passing the porthole, the intro on the wall screen). These are plain image
// files, so we can build the address without asking the API first.
const CRYSTAL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-ii/crystal/transparent'
export function crystalSprite(id, shiny = false) {
  return `${CRYSTAL}/${shiny ? 'shiny/' : ''}${id}.png`
}

// A move's description. Each move has its own URL, which getPokemon gave us.
export async function getMoveDescription(url) {
  const data = await getJSON(url)
  const english = data.flavor_text_entries.filter(e => e.language.name === 'en')
  const newest = english[english.length - 1]
  return newest ? cleanText(newest.flavor_text) : 'No description available.'
}
