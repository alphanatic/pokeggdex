// Entry point: finds <div id="root"> in index.html and puts our App inside it.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
// CSS order matters: later files win. FantaCSS gives the base look,
// then index.css adds our own touches on top.
import './fanta.css'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
