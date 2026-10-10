import { useEffect, useState } from 'react'
import { getPokemon, getPokemonList } from '../api.js'
import { MISSINGNO } from '../missingno.js'

// The Pokédex's state that a scene can read and drive: which Pokémon it's on,
// that Pokémon's details, shiny colours, and whether it's folded shut.
// A scene calls usePokedex() and hands the result to <Pokedex dex={...} />,
// so both the scene (a wall screen, an easter egg...) and the device itself
// work on the same Pokédex.
//   startClosed: arrive folded shut, for the visitor to open (the scene decides)
export function usePokedex({ startClosed = false } = {}) {
  const [list, setList] = useState([])            // all 151 names, for the list mode
  const [selectedId, select] = useState(1)        // which Pokémon is shown
  const [pokemon, setPokemon] = useState(null)    // its details, once they arrive
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [shiny, setShiny] = useState(false)       // shiny colours
  const [closed, setClosed] = useState(startClosed) // is the lid folded shut?

  // Load the list once, when the Pokédex starts.
  useEffect(() => {
    getPokemonList()
      .then(setList)
      .catch(err => setError(err.message))
  }, [])

  // Load the details every time the selection changes.
  useEffect(() => {
    // If the user clicks fast, an old request may finish after a newer one.
    // `ignore` makes sure only the latest answer is shown.
    let ignore = false
    setError(null)
    // No.000 is MissingNo., an easter egg that isn't in the API (see missingno.js)
    if (selectedId === 0) {
      setPokemon(MISSINGNO)
      setLoading(false)
      return
    }
    setLoading(true)
    getPokemon(selectedId)
      .then(data => { if (!ignore) setPokemon(data) })
      .catch(err => { if (!ignore) setError(err.message) })
      .finally(() => { if (!ignore) setLoading(false) })
    return () => { ignore = true } // runs when the selection changes again
  }, [selectedId])

  return { list, selectedId, select, pokemon, loading, error, shiny, setShiny, closed, setClosed }
}
