import { useEffect, useState } from 'react'
import { createWirelessPulse } from './wirelessPulse.js'

// The link between the cabin's wall screen and the pokeggdex.
// The screen starts off. Its link button (or a click on the dark screen)
// connects it: it searches for a moment, then shows what the pokeggdex shows.
// Pressing the button again switches it off.
//
// While they're linked, every 3 to 4.5 seconds the link button flashes 1, 2
// or 3 times (how many: wireless pulse logic, see wirelessPulse.js), and the pokeggdex answers 0.2 seconds later with the same
// rhythm (the delay lives in pokeggdex.css): its green light dims (or lights up if
// it was off) and its yellow light glows faintly, like two devices keeping in
// touch. `pulse` changes every time: { id, count }.
export function useLink() {
  const [link, setLink] = useState('off') // 'off' | 'linking' | 'on'
  const [pulse, setPulse] = useState(null)

  function pressLink() {
    if (link === 'off') {
      setLink('linking')
      setTimeout(() => setLink('on'), 2200)
    } else if (link === 'on') {
      setLink('off')
    }
  }

  useEffect(() => {
    if (link !== 'on') {
      setPulse(null)
      return
    }
    let timer
    let id = 0
    const pulses = createWirelessPulse()
    function scheduleNext() {
      timer = setTimeout(() => {
        id += 1
        setPulse({ id, count: pulses.next() })
        scheduleNext()
      }, 3000 + Math.random() * 1500)
    }
    scheduleNext()
    return () => clearTimeout(timer)
  }, [link])

  return { link, pressLink, pulse }
}
