import { useState } from 'react'
import { getMoveDescription } from '../api.js'
import { formatName } from '../utils.js'

// The "moves" mode of the big screen. Click a move to fetch its description.
export default function MovesPanel({ moves }) {
  const [move, setMove] = useState(null) // { name, text } of the clicked move

  async function showMove(m) {
    setMove({ name: m.name, text: 'Loading...' })
    let text
    try {
      text = await getMoveDescription(m.url)
    } catch (err) {
      text = err.message
    }
    // Only show it if the user hasn't clicked another move in the meantime.
    setMove(current => (current?.name === m.name ? { name: m.name, text } : current))
  }

  return (
    <>
      {move ? (
        <div className="move-detail">
          <strong>{formatName(move.name)}</strong>
          <p>{move.text}</p>
        </div>
      ) : (
        <p className="hint">Tap a move to read about it.</p>
      )}
      <div className="move-grid">
        {moves.map((m, i) => (
          <button
            key={m.name + i} // a name can repeat (MissingNo. knows Water Gun twice)
            className={move?.name === m.name ? 'active' : ''}
            onClick={() => showMove(m)}
          >
            {formatName(m.name)}
          </button>
        ))}
      </div>
    </>
  )
}
