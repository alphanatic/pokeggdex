// The cross-shaped direction pad. It only knows "which arrow was pressed";
// App decides what each direction does.
export default function DPad({ onUp, onDown, onLeft, onRight }) {
  return (
    <div className="dpad">
      <button className="dpad-up" onClick={onUp} aria-label="Previous tab">▲</button>
      <button className="dpad-left" onClick={onLeft} aria-label="Previous Pokémon">◀</button>
      <span className="dpad-center" />
      <button className="dpad-right" onClick={onRight} aria-label="Next Pokémon">▶</button>
      <button className="dpad-down" onClick={onDown} aria-label="Next tab">▼</button>
    </div>
  )
}
