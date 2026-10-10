import { useEffect, useRef } from 'react'
import { filterPokemon, formatNumber } from '../utils.js'

// The "list" mode of the right screen. The search text comes from the
// search box in the bottom-right panel (it lives in App).
export default function PokemonList({ list, search, selectedId, onSelect }) {
  // useRef gives us a handle on a real HTML element, here the scrolling list.
  const listRef = useRef(null)
  const results = filterPokemon(list, search)

  // When the selection changes (e.g. via the D-pad), scroll it into the middle of the list.
  useEffect(() => {
    const container = listRef.current
    const item = container?.querySelector('.selected')
    if (item) {
      container.scrollTop = item.offsetTop - container.clientHeight / 2 + item.clientHeight / 2
    }
  }, [selectedId, list, search])

  return (
    <>
      {search && <p className="hint">{results.length} found for "{search}"</p>}
      <ul className="list-screen" ref={listRef}>
        {results.map(p => (
          <li key={p.id}>
            <button
              className={p.id === selectedId ? 'selected' : ''}
              onClick={() => onSelect(p.id)}
            >
              <span className="dex-number">{formatNumber(p.id)}</span> {p.name}
            </button>
          </li>
        ))}
        {results.length === 0 && (
          <li className="hint">{list.length === 0 ? 'Loading...' : 'No match'}</li>
        )}
      </ul>
    </>
  )
}
