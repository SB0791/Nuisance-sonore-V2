import React from 'react'
import { noiseCategory } from '../utils/acoustic.js'

const WEEKDAYS = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam']
const MONTHS   = ['jan','fév','mar','avr','mai','jun','jul','aoû','sep','oct','nov','déc']
const BAR_COLORS = { none:'var(--green-light)', low:'#6ee7b7', moderate:'var(--amber-light)', high:'var(--orange-light)', critical:'var(--red-light)' }

export default function ForecastGrid({ days }) {
  if (!days?.length) return null
  const todayStr = new Date().toISOString().slice(0, 10)
  return (
    <section className="forecast-section">
      <div className="section-header">
        <span className="section-title">Prévisions acoustiques — 14 jours</span>
        <span className="section-meta">Modèle ECMWF via Open-Meteo · ICAO spherical law</span>
      </div>
      <div className="forecast-grid">
        {days.map((day) => {
          const dateObj = new Date(day.date + 'T12:00:00')
          const isToday = day.date === todayStr
          const cat = noiseCategory(day.noiseLevel)
          const pct = Math.min(100, Math.max(4, ((day.noiseLevel - 28) / (80 - 28)) * 100))
          return (
            <div key={day.date} className={`forecast-day level-${cat}${isToday ? ' is-today' : ''}`}>
              <span className="forecast-weekday">{WEEKDAYS[dateObj.getDay()]}</span>
              <span className="forecast-date">{dateObj.getDate()} {MONTHS[dateObj.getMonth()]}</span>
              <span className="forecast-noise-val">{day.noiseLevel}</span>
              <span className="forecast-noise-unit">dB(A)</span>
              <span className="forecast-wind">{day.windSpeed} kt · {day.windDir}°</span>
              <div className="forecast-bar">
                <div className="forecast-bar-fill" style={{ width: `${pct}%`, background: BAR_COLORS[cat] }} />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
