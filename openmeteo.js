const BASE = 'https://api.open-meteo.com/v1/forecast'

export async function fetchWeatherForecast(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat, longitude: lon,
    hourly: 'wind_speed_10m,wind_direction_10m,wind_gusts_10m',
    daily: 'wind_speed_10m_max,wind_direction_10m_dominant',
    wind_speed_unit: 'kn',
    timezone: 'Europe/Paris',
    forecast_days: 14,
  })
  const res = await fetch(`${BASE}?${params}`)
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`)
  return res.json()
}

export function summarizeDailyForecast(hourly) {
  if (!hourly?.time) return []
  const days = {}
  hourly.time.forEach((t, i) => {
    const date = t.slice(0, 10)
    if (!days[date]) days[date] = { date, windSpeeds: [], windDirs: [] }
    if (hourly.wind_speed_10m[i] != null) days[date].windSpeeds.push(hourly.wind_speed_10m[i])
    if (hourly.wind_direction_10m[i] != null) days[date].windDirs.push(hourly.wind_direction_10m[i])
  })
  return Object.values(days).map(d => ({
    date: d.date,
    windSpeed: d.windSpeeds.length ? Math.round(d.windSpeeds.reduce((a,b)=>a+b,0)/d.windSpeeds.length) : null,
    windDir:   d.windDirs.length   ? Math.round(d.windDirs.reduce((a,b)=>a+b,0)/d.windDirs.length)   : null,
  }))
}
