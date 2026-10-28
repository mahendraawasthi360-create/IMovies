// Generates a realistic 10×12 seat grid for a mock show
export const generateMockSeats = (showId) => {
  const rows    = 'ABCDEFGHIJ'.split('')
  const cols    = 12
  const seats   = []
  const rng     = (seed) => { let x = Math.sin(seed) * 10000; return x - Math.floor(x) }

  rows.forEach((row, ri) => {
    let category = 'standard'
    if (ri < 2)       category = 'recliner'
    else if (ri < 5)  category = 'premium'

    for (let c = 1; c <= cols; c++) {
      // Deterministically mark ~25% seats booked, ~5% held using showId hash
      const seed   = showId.charCodeAt(showId.length - 1) + ri * cols + c
      const chance = rng(seed)
      let status   = 'available'
      if (chance < 0.25) status = 'booked'
      else if (chance < 0.30) status = 'held'

      seats.push({
        seatId: `${row}${c}`,
        row: row,
        col: c,
        category,
        status,
        heldBy:        null,
        holdExpiresAt: null,
      })
    }
  })
  return seats
}
