// The 2 x 6 grid of blue keys: five number keys and one wide key per row.
// In the anime they're never explained; we use them as a number pad for
// typing a pokeggdex number. The wide keys delete a digit and confirm.
// The letters are printed on the keys like on an old phone (decoration only).
const KEYS = [
  ['1', ''], ['2', 'ABC'], ['3', 'DEF'], ['4', 'GHI'], ['5', 'JKL'], ['DEL', ''],
  ['6', 'MNO'], ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'], ['0', ''], ['OK', ''],
]

export default function Keypad({ onDigit, onDelete, onEnter }) {
  function press(label) {
    if (label === 'DEL') onDelete()
    else if (label === 'OK') onEnter()
    else onDigit(label)
  }

  return (
    <div className="keypad">
      {KEYS.map(([label, letters]) => (
        <button key={label} className={'key' + (label.length > 1 ? ' key-wide' : '')} onClick={() => press(label)}>
          <span className="key-digit">{label}</span>
          <span className="key-letters">{letters}</span>
        </button>
      ))}
    </div>
  )
}
