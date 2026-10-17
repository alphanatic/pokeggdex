// Entry point: finds <div id="root"> in index.html and puts our App inside it.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
// CSS order matters: later files win. FantaCSS gives the base look,
// then the pokeggdex's own styles go on top (each scene imports its own CSS).
import './fanta.css'
import './pokeggdex/pokeggdex.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
