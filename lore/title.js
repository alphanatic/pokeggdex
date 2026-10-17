// The title bar's two Exeggcute: pokeggdex No.102's shiny sprite from Pokémon
// Crystal, looked up from PokéAPI like the pokeggdex looks up its Pokémon.
// If the API can't be reached, the title simply shows without them.
const SHINY_EXEGGCUTE = 102

async function showTitleSprites() {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${SHINY_EXEGGCUTE}`)
  if (!response.ok) return
  const data = await response.json()
  const crystal = data.sprites.versions?.['generation-ii']?.crystal
  const url = crystal?.front_shiny_transparent ?? data.sprites.front_shiny
  if (!url) return
  for (const img of document.querySelectorAll('.title-mon')) {
    img.src = url
    img.hidden = false
  }
}

showTitleSprites().catch(() => {}) // no sprites is fine; the title still reads
