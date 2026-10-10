// Wireless pulse logic: how many times the link flashes in each sequence.
//
// While the wall screen is linked to the Pokédex, every few seconds the link
// button flashes 1, 2 or 3 times (and the Pokédex echoes it). Picking freely
// would sometimes give long runs of busy triple flashes, so:
//   - after a 3, the next 3 sequences can't be a 3
//   - after a 2, the next sequence can't be a 2 or a 3 (so it's a 1)
// Within those rules each allowed count is equally likely.

// Starts a fresh run of sequences; call next() for each one.
export function createWirelessPulse(random = Math.random) {
  let noThreeFor = 0     // sequences left in which 3 isn't allowed
  let onlyOneFor = 0     // sequences left in which only 1 is allowed

  return {
    next() {
      let allowed = [1, 2, 3]
      if (onlyOneFor > 0) allowed = [1]
      else if (noThreeFor > 0) allowed = [1, 2]
      const count = allowed[Math.floor(random() * allowed.length)]

      // this sequence uses up one round of each rule...
      if (noThreeFor > 0) noThreeFor -= 1
      if (onlyOneFor > 0) onlyOneFor -= 1
      // ...and may start a new one
      if (count === 3) noThreeFor = 3
      if (count === 2) onlyOneFor = 1
      return count
    },
  }
}
