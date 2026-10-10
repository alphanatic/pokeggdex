// One small palette for the whole cabin, so every part looks like it came
// from the same Game Boy Color game: dark outlines, then 3-4 shades per material.
export const C = {
  ink: '#20181c', // outlines

  // the wall: cream paint above, wood panels below
  cream: '#f0e2bc',
  creamL: '#fbf3dc',
  creamD: '#dcc898',
  creamDD: '#c4ab78',

  // wood (panels, floor, table, beam)
  woodHL: '#e6b26a',
  woodL: '#cc8a48',
  wood: '#a8682f',
  woodD: '#7c4720',
  woodDD: '#57301a',

  // brass (porthole, lamp, plaque)
  brassL: '#f8de78',
  brass: '#d6a42c',
  brassD: '#9a6a14',

  red: '#d83a30',
  redD: '#94211c',
  white: '#f8f8f0',
  grey: '#9098a8',
  greyD: '#5a6070',
  // the Pokémon Center-style monitor: white plastic with a red Poké Ball top
  mon: '#eef2f6',
  monL: '#ffffff',
  monD: '#c2cad6',
  monDD: '#98a2b2',
  monRed: '#e03838',
  monRedL: '#f46868',
  monRedD: '#a82828',
}

// The view through the porthole for each part of the day.
export const SKY = {
  morn: { top: '#f0a080', low: '#f8d0a0', sea: '#5880c0', seaD: '#40609c', foam: '#f8e0c8', town: '#a87880', light: '#f8c0a0' },
  day: { top: '#68b8f0', low: '#a8dcf8', sea: '#3078c8', seaD: '#2058a0', foam: '#d8f0f8', town: '#7890b8', light: '#f8f8f0' },
  nite: { top: '#101838', low: '#283868', sea: '#182c58', seaD: '#0e1c40', foam: '#5870a8', town: '#202848', light: '#f8e070' },
}
