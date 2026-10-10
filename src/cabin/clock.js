import { useEffect, useState } from 'react'

// Like Pokémon Gold, Silver and Crystal, the cabin runs on the real clock.
// Those games split the day into three parts, with these exact hours:
//   MORN  4:00 - 9:59
//   DAY   10:00 - 17:59
//   NITE  18:00 - 3:59
export function timeOfDay(date) {
  const h = date.getHours()
  if (h >= 4 && h < 10) return 'morn'
  if (h >= 10 && h < 18) return 'day'
  return 'nite'
}

// The current time of day and weekday, checked once a minute.
export function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60 * 1000)
    return () => clearInterval(timer)
  }, [])

  // While developing, ?time=morn|day|nite and ?friday show the other looks.
  const params = import.meta.env.DEV ? new URLSearchParams(location.search) : null
  return {
    time: params?.get('time') ?? timeOfDay(now),
    isFriday: params?.has('friday') || now.getDay() === 5,
  }
}
