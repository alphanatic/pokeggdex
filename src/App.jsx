import Cabin from './cabin/Cabin.jsx'

// The site shows one scene at a time, and the scene calls the Pokédex into it
// (see src/pokedex/). For now there's one scene: a cabin on the S.S. Anne,
// docked in Vermilion City.
export default function App() {
  return <Cabin />
}
