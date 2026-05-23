export async function fetchMETAR(icaos) {
  const res = await fetch(
    `https://aviationweather.gov/api/data/metar?ids=${icaos}&format=json&hours=2`
  )
  if (!res.ok) throw new Error(`METAR ${res.status}`)
  const data = await res.json()
  const result = {}
  for (const m of data) {
    if (!m.icaoId) continue
    result[m.icaoId] = {
      windDir:   m.wdir ?? null,
      windSpeed: m.wspd ?? null,
      windGust:  m.wgst ?? null,
    }
  }
  return result
}
