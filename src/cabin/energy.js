// Type icons for the wall screen, in the style of the basic Energy cards of the
// Pokémon Trading Card Game: 20 x 20 pixel art in public/energy/, one per type,
// named after the type as the API gives it (e.g. 'electric' -> electric.png).
// Each icon's colour is its type's colour (TYPE_COLORS in utils.js), so it
// matches the half of the screen it sits in. The symbols are the cards' Energy
// symbols where the card game has one, and drawn to match for the rest.

// The icon file for a Pokémon type, e.g. 'flying' -> '/energy/flying.png'
export function energyIcon(type) {
  return `${import.meta.env.BASE_URL}energy/${type}.png`
}
