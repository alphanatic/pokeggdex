import { useEffect, useState } from 'react'
import { filterPokemon, formatNumber } from '../utils.js'
import MainScreen from '../components/MainScreen.jsx'
import InfoScreen from '../components/InfoScreen.jsx'
import DPad from '../components/DPad.jsx'
import Keypad from '../components/Keypad.jsx'
import { BaseBody, HingeBody, LidBody, LidBack, WearDefs } from '../components/Shell.jsx'

// The pokeggdex: the device on its own. It knows nothing about the scene it's in.
// A scene calls it into view:
//   const dex = usePokeggdex()          // its state, which the scene can also drive
//   <Pokeggdex dex={dex} placement={...} pulse={...} triggerPulse={...} />
//   - placement:    where it stands: { '--dex-x', '--dex-y', '--dex-scale' }
//   - pulse:        { id, count } flashes the three lights on top echo (or null)
//   - triggerPulse: a count; each time it goes up, the sensor lights up once
// When it first appears it slides in from the side of the screen nearest to
// its spot, then settles there.

const TOTAL = 151
const MODES = ['entry', 'stats', 'moves', 'sprites', 'list'] // what the right screen can show
const DEX_WIDTH = 764.4 // the open pokeggdex, in CSS px before scaling

// How far to the side it starts: past whichever screen edge is closer to its spot.
function entranceOffset(placement) {
  const x = parseFloat(placement['--dex-x'])
  const halfWidth = (DEX_WIDTH * placement['--dex-scale']) / 2 + 40
  return x < window.innerWidth / 2 ? -(x + halfWidth) : window.innerWidth - x + halfWidth
}

export default function Pokeggdex({ dex, placement, pulse = null, triggerPulse = 0 }) {
  const { list, selectedId, select, pokemon, loading, error, shiny, setShiny, closed, setClosed } = dex
  const [mode, setMode] = useState('entry')
  const [entry, setEntry] = useState('')            // digits typed on the keypad
  const [message, setMessage] = useState('No.___')  // keypad feedback, e.g. "Found #025"
  const [search, setSearch] = useState('')          // text in the search box
  const [playingCry, setPlayingCry] = useState(false)
  // worked out once, when it first appears, so resizing the window doesn't replay it
  const [enterFrom] = useState(() => entranceOffset(placement))

  // Move forwards/backwards through the pokeggdex, wrapping around at the ends.
  function step(amount) {
    select(id => {
      if (id === 0) return amount > 0 ? 1 : TOTAL // from MissingNo. back into the real list
      return ((id - 1 + amount + TOTAL) % TOTAL) + 1
    })
  }

  function cycleMode(amount) {
    setMode(m => MODES[(MODES.indexOf(m) + amount + MODES.length) % MODES.length])
  }

  function randomPokemon() {
    const id = Math.floor(Math.random() * TOTAL) + 1
    select(id)
    setMessage(`Random #${formatNumber(id)}`)
  }

  // Play the Pokémon's cry. The API gives us the URL of a sound file.
  function playCry() {
    if (!pokemon?.cry) return
    const audio = new Audio(pokemon.cry)
    audio.volume = 0.4
    setPlayingCry(true)
    audio.onended = () => setPlayingCry(false)
    audio.play().catch(() => setPlayingCry(false))
  }

  // ----- Keypad: type up to 3 digits, then OK (or it goes by itself at 3 digits) -----
  function pressDigit(digit) {
    const next = entry + digit
    if (next.length === 3) {
      submit(next)
    } else {
      setEntry(next)
    }
  }

  function submit(value = entry) {
    setEntry('')
    if (value === '') return setMessage('No.___')
    const id = Number(value)
    if (id >= 1 && id <= TOTAL) {
      select(id)
      setMessage(`Found #${formatNumber(id)}`)
    } else if (id === 0) {
      select(0) // the hidden one
      setMessage('!? #000')
    } else {
      setMessage(`No #${value}: 1-151`)
    }
  }

  function deleteDigit() {
    setEntry(e => e.slice(0, -1))
  }

  function clearEntry() {
    setEntry('')
    setMessage('No.___')
  }

  // ----- Search box: typing shows the matches in the list on the right screen -----
  function handleSearch(value) {
    setSearch(value)
    setMode('list')
  }

  function handleSearchKey(e) {
    if (e.key === 'Enter') {
      // Enter picks the first match (and the hidden one answers to its name)
      if (search.trim().toLowerCase().startsWith('missingno')) return select(0)
      const first = filterPokemon(list, search)[0]
      if (first) select(first.id)
    } else if (e.key === 'Escape') {
      setSearch('')
    }
  }

  // Keyboard works too: arrows = D-pad, digits = keypad, Enter = OK, Esc = clear.
  // (Not while typing in the search box.)
  useEffect(() => {
    function handleKey(e) {
      if (e.target.tagName === 'INPUT') return
      if (/^[0-9]$/.test(e.key)) return pressDigit(e.key)
      const actions = {
        ArrowLeft: () => step(-1),
        ArrowRight: () => step(1),
        ArrowUp: () => cycleMode(-1),
        ArrowDown: () => cycleMode(1),
        Enter: () => submit(),
        Escape: clearEntry,
        Backspace: deleteDigit,
      }
      if (actions[e.key]) {
        e.preventDefault() // stop the page from scrolling
        actions[e.key]()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey) // clean up
  }, [entry]) // re-attach when `entry` changes, so the handler sees the latest digits

  return (
    <>
      <WearDefs />

      <div className="dex-stage entering" style={{ ...placement, '--enter-dx': `${enterFrom}px` }}>
        <main className={'pokeggdex' + (closed ? ' closed' : '')}>
          {/* ---------- Left half ----------
              Every part sits where it is on the measured device (see shape.js). */}
          <section className="half-left">
            <BaseBody />

            {/* On the raised head */}
            <div className="head-parts">
              {/* scans while asking the API; lights up once each time the scene
                  sends a trigger pulse (the key restarts its glow every time) */}
              <span
                key={'lens-' + triggerPulse}
                className={'lens' + (loading ? ' scanning' : '') + (triggerPulse ? ' dex-trigger-pulse' : '')}
                title="Scans while asking the API"
              />
              {/* The three lights don't react to using the pokeggdex (browsing, loading,
                  errors): green stays on, red and yellow stay off. Only the scene's
                  pulses move them: with each, 0.2 s later, green dims and yellow
                  glows faintly (see pokeggdex.css). */}
              <span className="led led-red" />
              <span
                key={pulse ? 'yellow-pulse-' + pulse.id : 'yellow'}
                className={'led led-yellow' + (pulse ? ' link-pulse-' + pulse.count : '')}
              />
              <span
                key={pulse ? 'green-pulse-' + pulse.id : 'green'}
                className={'led led-green on' + (pulse ? ' link-pulse-' + pulse.count : '')}
              />
            </div>

            <MainScreen pokemon={pokemon} shiny={shiny} loading={loading} error={error} />

            <button className="round-button" onClick={playCry} title="Play cry" />
            {/* normal / shiny colours (a scene can show them too, e.g. on a wall screen) */}
            <button className={'pill pill-red' + (!shiny ? ' pressed' : '')} onClick={() => setShiny(false)} title="Normal colours" />
            <button className={'pill pill-blue' + (shiny ? ' pressed' : '')} onClick={() => setShiny(true)} title="Shiny colours" />
            <DPad
              onUp={() => cycleMode(-1)}
              onDown={() => cycleMode(1)}
              onLeft={() => step(-1)}
              onRight={() => step(1)}
            />
            <div className="recessed-panel base-panel" />
            <span className="brand">pokeggdex</span>
          </section>

          {/* Click the hinge to fold the lid shut (or open it again) */}
          <button
            className="hinge"
            onClick={() => setClosed(c => !c)}
            title={closed ? 'Open the pokeggdex' : 'Fold the pokeggdex shut'}
            aria-label={closed ? 'Open the pokeggdex' : 'Fold the pokeggdex shut'}
          >
            <HingeBody />
          </button>

          {/* ---------- Right half: the lid ----------
              It has two faces, like a page in a book: the inside (all the controls)
              and the outside (what you see when it's closed). CSS flips it in 3D. */}
          <div className="lid">
            <section className="lid-face lid-inside">
              <LidBody />

              {/* Everything on the lid's floor, inside the rim */}
              <div className="lid-floor">
                <InfoScreen
                  pokemon={pokemon}
                  mode={mode}
                  list={list}
                  search={search}
                  selectedId={selectedId}
                  onSelect={select}
                />

                <Keypad onDigit={pressDigit} onDelete={deleteDigit} onEnter={() => submit()} />

                <span className={'led small lid-led-1 led-green' + (entry ? ' on' : '')} title="Typing a number" />
                <span className={'led small lid-led-2 led-green' + (playingCry ? ' on' : '')} title="Playing cry" />
                <button className="black-slit slit-1" onClick={clearEntry} title="Clear number" />
                <button className="black-slit slit-2" onClick={randomPokemon} title="Random Pokémon" />
                <div className="arrow-buttons">
                  <button className="grey-button" onClick={() => cycleMode(-1)} aria-label="Previous screen">◀</button>
                  <button className="grey-button" onClick={() => cycleMode(1)} aria-label="Next screen">▶</button>
                </div>
                <button className="yellow-button" onClick={() => submit()} title="OK: go to number" />

                {/* Left: the keypad's number while typing, otherwise its last message */}
                <div className="recessed-panel readout lid-panel-1">
                  {entry ? `No.${entry.padEnd(3, '_')}` : message}
                </div>
                {/* Right: search by name or number */}
                <input
                  className="recessed-panel readout search-box lid-panel-2"
                  value={search}
                  onChange={e => handleSearch(e.target.value)}
                  onKeyDown={handleSearchKey}
                  placeholder="Search..."
                  aria-label="Search Pokémon by name or number"
                />
              </div>
            </section>

            <div className="lid-face lid-outside" onClick={() => setClosed(false)} title="Open the pokeggdex">
              <LidBack />
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
