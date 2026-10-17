import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'


// A dialogue box like in Pokémon Red and Blue: the text types itself out,
// a ▼ blinks when the page is done, and a click goes to the next page.
// Pages also move on by themselves after a while, so nothing gets in the way.
// (Cabin gives every message a new `key`, so a new message starts from page 1.)
export default function TextBox({ pages, onDone }) {
  const [page, setPage] = useState(0)
  const [shown, setShown] = useState(0) // how many letters of the page are out
  const text = pages[page]
  const typing = shown < text.length

  // Type the page out, one letter at a time.
  useEffect(() => {
    if (!typing) return
    const timer = setTimeout(() => setShown(n => n + 1), 28)
    return () => clearTimeout(timer)
  }, [typing, shown])

  // Once typed, move on by itself after enough time to read it.
  useEffect(() => {
    if (typing) return
    const timer = setTimeout(next, 2200 + text.length * 35)
    return () => clearTimeout(timer)
  })

  // A click on the window layer goes to the text box, except on things marked
  // data-through-dialogue (the truck): those still get their own click, so the
  // "click the truck 3 times" egg works while its messages are showing.
  function catchClick(e) {
    const under = document.elementsFromPoint(e.clientX, e.clientY).find(el => el.dataset?.throughDialogue)
    if (under) under.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    else next()
  }

  function next() {
    if (typing) return setShown(text.length) // first click: show the whole page
    if (page + 1 < pages.length) {
      setPage(page + 1)
      setShown(0)
    } else {
      onDone()
    }
  }

  // Drawn straight into <body>: the click layer above the cabin (but under the
  // pokeggdex, which keeps working), and the box itself above everything.
  return createPortal(
    <>
      {/* Like in the games, while someone is talking a click anywhere goes to
          the text box: this invisible layer covers the whole cabin until the
          last page closes, so nothing in the room gets clicked by accident.
          The pokeggdex is the one exception: it sits above this layer. */}
      <div className="textbox-catcher" onClick={catchClick} aria-hidden="true" />
      <div className="textbox" role="status" aria-live="polite" onClick={next}>
        <p>{text.slice(0, shown)}</p>
        {!typing && <span className="textbox-arrow" aria-hidden="true">▼</span>}
      </div>
    </>,
    document.body,
  )
}
