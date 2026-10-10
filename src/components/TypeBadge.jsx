import { TYPE_COLORS } from '../utils.js'

export default function TypeBadge({ type }) {
  // `style` takes a JS object; here the colour depends on the type.
  return (
    <span className="type-badge" style={{ background: TYPE_COLORS[type] }}>
      {type}
    </span>
  )
}
