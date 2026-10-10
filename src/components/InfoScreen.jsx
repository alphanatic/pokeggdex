import MovesPanel from './MovesPanel.jsx'
import PokemonList from './PokemonList.jsx'
import TypeBadge from './TypeBadge.jsx'
import { STAT_LABELS } from '../utils.js'

const MAX_STAT = 255 // highest base stat any Pokémon has; used to size the bars

// The screen on the right half. `mode` decides what it shows.
export default function InfoScreen({ pokemon, mode, list, search, selectedId, onSelect }) {
  let content
  if (mode === 'list') {
    content = <PokemonList list={list} search={search} selectedId={selectedId} onSelect={onSelect} />
  } else if (!pokemon) {
    content = <p className="hint">...</p>
  } else if (mode === 'entry') {
    content = <p className="entry-text">{pokemon.entry}</p>
  } else if (mode === 'stats') {
    content = (
      <>
        <div className="types">
          {pokemon.types.map(type => (
            <TypeBadge key={type} type={type} />
          ))}
        </div>
        <ul className="stat-list">
          {pokemon.stats.map(s => (
            <li key={s.name}>
              <span>{STAT_LABELS[s.name] ?? s.name}</span>
              <span className="stat-bar">
                <span style={{ width: `${(s.value / MAX_STAT) * 100}%` }} />
              </span>
              <span>{s.value}</span>
            </li>
          ))}
        </ul>
      </>
    )
  } else if (mode === 'moves') {
    // key: a new Pokémon gives a fresh MovesPanel, so the old move text resets
    content = <MovesPanel key={pokemon.id} moves={pokemon.moves} />
  } else if (mode === 'sprites') {
    content = (
      <div className="sprite-grid">
        {pokemon.sprites.map(s => (
          <figure key={s.label}>
            <img src={s.url} alt={`${pokemon.name} ${s.label}`} />
            <figcaption>{s.label}</figcaption>
          </figure>
        ))}
      </div>
    )
  }

  return (
    <div className="screen info-screen">
      <p className="screen-title">◂ {mode} ▸</p>
      {content}
    </div>
  )
}
