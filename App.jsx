import React, { useState, useEffect, useCallback } from 'react'
import Header from './components/Header.jsx'
import StatusBar from './components/StatusBar.jsx'
import GlobalCard from './components/GlobalCard.jsx'
import AirportCard from './components/AirportCard.jsx'
import ForecastGrid from './components/ForecastGrid.jsx'
import { fetchWeatherForecast, summarizeDailyForecast } from './services/openmeteo.js'
import { fetchMETAR } from './services/metar.js'
import { computeNoiseLevel } from './utils/acoustic.js'
import { determineActiveRunway, isApproachOverPoint, getBearing, getDistance, estimateApproachAltitude } from './utils/runway.js'

const HOUILLES = { lat: 48.9177, lon: 2.1944 }

const AIRPORTS = [
  { code:'LBG', icao:'LFPB', name:'Le Bourget',        type:'business',     lat:48.9694, lon:2.4414, runways:[{id:'07/25',hdg:70},{id:'03/21',hdg:30}] },
  { code:'CDG', icao:'LFPG', name:'Charles de Gaulle', type:'international', lat:49.0097, lon:2.5479, runways:[{id:'08L/26R',hdg:83},{id:'08R/26L',hdg:83},{id:'09L/27R',hdg:93},{id:'09R/27L',hdg:93}] },
  { code:'ORY', icao:'LFPO', name:'Orly',              type:'international', lat:48.7233, lon:2.3794, runways:[{id:'06/24',hdg:62},{id:'08/26',hdg:82}] },
]

function computeAirportData(airport, metars, currentWind) {
  const metar      = metars[airport.icao]
  const windDir    = metar?.windDir    ?? currentWind?.windDir    ?? null
  const windSpeed  = metar?.windSpeed  ?? currentWind?.windSpeed  ?? null
  const windGust   = metar?.windGust   ?? currentWind?.windGust   ?? null
  const distanceKm = getDistance(airport.lat, airport.lon, HOUILLES.lat, HOUILLES.lon)
  const bearing    = getBearing(airport.lat, airport.lon, HOUILLES.lat, HOUILLES.lon)
  const activeRunway = determineActiveRunway(airport.runways, windDir)
  const isOverflight = isApproachOverPoint(activeRunway, bearing)
  const altitudeFt   = estimateApproachAltitude(distanceKm)
  const noiseLevel   = computeNoiseLevel({ code: airport.code, distanceKm, altitudeFt, isOverflight })
  return { ...airport, distanceKm, windDir, windSpeed, windGust, activeRunway, isOverflight, noiseLevel }
}

export default function App() {
  const [weather,    setWeather]    = useState(null)
  const [metars,     setMetars]     = useState({})
  const [lastUpdate, setLastUpdate] = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [sources,    setSources]    = useState({ meteo: false, metar: false })

  const refresh = useCallback(async () => {
    setLoading(true)
    let meteoOk = false, metarOk = false, wx = null, mx = {}
    try { wx = await fetchWeatherForecast(HOUILLES.lat, HOUILLES.lon); setWeather(wx); meteoOk = true }
    catch (e) { console.warn('Open-Meteo:', e.message) }
    try { const icaos = AIRPORTS.map(a => a.icao).join(','); mx = await fetchMETAR(icaos); setMetars(mx); metarOk = true }
    catch (e) { console.warn('METAR:', e.message) }
    setSources({ meteo: meteoOk, metar: metarOk })
    setLastUpdate(new Date())
    setLoading(false)
  }, [])

  useEffect(() => { refresh(); const iv = setInterval(refresh, 30*60*1000); return () => clearInterval(iv) }, [refresh])

  const reliability = 48 + (sources.meteo ? 32 : 0) + (sources.metar ? 16 : 0)

  const currentWind = weather?.hourly ? {
    windDir:   weather.hourly.wind_direction_10m?.[0] ?? null,
    windSpeed: weather.hourly.wind_speed_10m?.[0]    ?? null,
    windGust:  weather.hourly.wind_gusts_10m?.[0]    ?? null,
  } : null

  const airportData = AIRPORTS.map(ap => computeAirportData(ap, metars, currentWind)).map(ap => ({ ...ap, loading }))

  const forecastDays = weather
    ? summarizeDailyForecast(weather.hourly).map(day => {
        const noises = AIRPORTS.map(ap => {
          const distanceKm  = getDistance(ap.lat, ap.lon, HOUILLES.lat, HOUILLES.lon)
          const bearing     = getBearing(ap.lat, ap.lon, HOUILLES.lat, HOUILLES.lon)
          const activeRwy   = determineActiveRunway(ap.runways, day.windDir)
          const overfly     = isApproachOverPoint(activeRwy, bearing)
          const altFt       = estimateApproachAltitude(distanceKm)
          return computeNoiseLevel({ code: ap.code, distanceKm, altitudeFt: altFt, isOverflight: overfly })
        })
        return { ...day, noiseLevel: Math.max(...noises) }
      })
    : []

  return (
    <div className="app">
      <Header lastUpdate={lastUpdate} loading={loading} onRefresh={refresh} />
      <StatusBar reliability={reliability} sources={sources} />
      <main className="main-content">
        <div className="airports-grid">
          <GlobalCard airportData={airportData} />
          {airportData.map(ap => <AirportCard key={ap.code} data={ap} />)}
        </div>
        {forecastDays.length > 0 && <ForecastGrid days={forecastDays} />}
      </main>
      <footer className="footer">
        <p>Modèle prévisionnel indicatif · loi sphérique ICAO · calibration Bruitparif/ACNUSA 2022-23</p>
        <p>Ne remplace pas les mesures officielles — Sources : Open-Meteo · METAR aviationweather.gov</p>
      </footer>
    </div>
  )
}
