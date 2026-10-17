import { formatName, formatNumber } from '../utils.js'

// The pokeggdex page as shown on the left screen (and mirrored on the TV),
// laid out like the pokeggdex page in Pokémon Red/Blue.
export default function DexPage({ pokemon, shiny, loading, error }) {
  if (error) return <p className="screen-message">{error}</p>
  if (!pokemon) return <p className="screen-message">LOADING...</p>

  return (
    // While the next Pokémon loads, fade the current one instead of blanking the screen.
    <div className={'dex-page' + (loading ? ' fading' : '')}>
      <div className="dex-top">
        <img
          className="dex-sprite"
          src={shiny ? pokemon.spriteShiny : pokemon.sprite}
          alt={pokemon.name}
        />
        <div className="dex-facts">
          <p className="dex-name">{formatName(pokemon.name)}</p>
          <p>{pokemon.genus}</p>
          <p>HT {pokemon.height}m</p>
          <p>WT {pokemon.weight}kg</p>
        </div>
      </div>
      <p className="dex-no">No.{formatNumber(pokemon.id)}</p>
      <div className="dex-line" />
    </div>
  )
}
