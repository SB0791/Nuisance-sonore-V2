import React from 'react'
import { noiseCategory, NOISE_LABELS } from '../utils/acoustic.js'

function WindCompass({ dir }) {
  if (dir == null) return <span className="wind-na">N/D</span>
  const cardinalDir = (d) => {
    const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSO','SO','OSO','O','ONO','NO','NNO']
    return dirs[Math.round(d / 22.5) % 16]
  }
  return (
    <svg className="wind-compass" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="12" stroke="var(--border-2)" strokeWidth="1" />
      <circle cx="14" cy="14" r="1.5" fill="var(--text-dim)" />
      {[0, 90, 180, 270].map((a) => {
        const r = (a * Math.PI) / 180
        return <line key={a} x1={14+9*Math.sin(r)} y1={14-9*Math.cos(r)} x2={14+11*Math.sin(r)} y2={14-11*Math.cos(r)} stroke="var(--border-2)" strokeWidth="1" />
      })}
      <g style={{ transform: `rotate(${dir}deg)`, transformOrigin: '14px 14px', transition: 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <line x1="14" y1="14" x2="14" y2="5" stroke="var(--cyan-light)" strokeWidth="1.5" strokeLinecap="round" />
        <polygon points="14,3 12.5,6.5 15.5,6.5" fill="var(--cyan-light)" />
      </g>
      <text x="14" y="28" textAnchor="middle" fontSize="5" fill="var(--text-dim)" fontFamily="var(--font-mono)">{cardinalDir(dir)}</text>
    </svg>
  )
}

export default function AirportCard({ data }) {
  const { code, icao, name, type, distanceKm, windDir, windSpeed, windGust, activeRunway, isOverflight, noiseLevel, loading } = data
  const cat = noiseCategory(noiseLevel ?? 0)
  const label = NOISE_LABELS[cat]
  const typeLabel = type === 'business' ? "Aviation d'affaires" : 'International'
  const typeBadge = type === 'business' ? 'badge-biz' : 'badge-intl'

  return (
    <article className={`airport-card level-${cat}${isOverflight ? ' overflight-active' : ''}`}>
      <div className="card-top">
        <div className="airport-code-block">
          <span className="airport-code">{code}</span>
          <span className="airport-icao">{icao}</span>
        </div>
        <div className="airport-name-block">
          <span className="airport-name">{name}</span>
          <div className="airport-badges">
            <span className={`badge ${typeBadge}`}>{typeLabel}</span>
            <span className="badge badge-dist">{Math.round(distanceKm)} km</span>
          </div>
        </div>
      </div>
      <div className="noise-section">
        <div className="noise-readout">
          {loading ? <div className="skeleton skeleton-big" /> : (
            <>
              <span className="noise-value">{noiseLevel ?? '—'}</span>
              <span className="noise-unit">dB(A)</span>
              <span className="noise-pill">{label}</span>
            </>
          )}
        </div>
        <div className="wind-runway">
          <div className="wind-row">
            <WindCompass dir={windDir} />
            {windDir != null ? (
              <div className="wind-values">
                <span className="wind-speed-val">
                  {windSpeed ?? '—'} kt
                  {windGust ? <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}> G{windGust}</span> : null}
                </span>
                <span className="wind-dir-val">{windDir}°</span>
              </div>
            ) : <span className="wind-na">Vent non disponible</span>}
          </div>
          {activeRunway ? (
            <div className="runway-row">
              <span className="runway-label">Piste active</span>
              <span className="runway-code">{activeRunway.end}</span>
              <span className={`overflight-tag ${isOverflight ? 'yes' : 'no'}`}>
                {isOverflight ? 'Survol' : 'Écarté'}
              </span>
            </div>
          ) : <p className="no-metar-note">Données piste non disponibles</p>}
        </div>
      </div>
    </article>
  )
}
