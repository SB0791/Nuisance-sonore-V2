import React from 'react'
import { noiseCategory, NOISE_LABELS } from '../utils/acoustic.js'

const WEIGHTS   = { LBG: 0.20, CDG: 0.55, ORY: 0.25 }
const DIRS      = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSO','SO','OSO','O','ONO','NO','NNO']
const cardinal  = (d) => DIRS[Math.round(d / 22.5) % 16]

export default function GlobalCard({ airportData }) {
  if (!airportData?.length) return null

  const globalNoise = Math.round(
    airportData.reduce((sum, ap) => sum + (ap.noiseLevel ?? 0) * (WEIGHTS[ap.code] ?? 0), 0)
  )
  const cat   = noiseCategory(globalNoise)
  const label = NOISE_LABELS[cat]

  // Tri par contribution décroissante
  const sorted = [...airportData].sort(
    (a, b) => (b.noiseLevel ?? 0) * (WEIGHTS[b.code] ?? 0) - (a.noiseLevel ?? 0) * (WEIGHTS[a.code] ?? 0)
  )
  const dominant = sorted[0]

  // Résumé contextuel
  const wind  = airportData.find(ap => ap.windDir != null)
  const windD = wind?.windDir ?? null
  const windCtx = windD == null ? null
    : windD >= 60 && windD <= 120  ? "vent d'Est · décollages vers Houilles"
    : windD >= 240 && windD <= 300 ? "vent d'Ouest · finales sur Houilles"
    : `vent ${cardinal(windD)}`
  const summary = [
    dominant ? `${dominant.name} domine` : null,
    windCtx,
    wind?.windSpeed ? `${wind.windSpeed} kt` : null,
  ].filter(Boolean).join(' · ')

  const pct = (noise) => Math.min(100, Math.max(4, ((noise - 28) / (80 - 28)) * 100))

  return (
    <article className={`airport-card global-card level-${cat}`}>
      {/* En-tête */}
      <div className="card-top">
        <div className="airport-code-block">
          <span className="airport-code global-card-title">VUE GLOBALE</span>
          <span className="airport-icao">Houilles (78) — score pondéré</span>
        </div>
        <div className="airport-name-block">
          <div className="airport-badges">
            {airportData.map(ap => (
              <span key={ap.code} className="badge badge-dist">
                {ap.code} ×{Math.round(WEIGHTS[ap.code] * 100)}%
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Corps */}
      <div className="noise-section global-noise-section">
        {/* Score global */}
        <div className="noise-readout">
          <span className="noise-value">{globalNoise}</span>
          <span className="noise-unit">dB(A)</span>
          <span className="noise-pill">{label}</span>
        </div>

        {/* Contributions */}
        <div className="global-contributions">
          {sorted.map(ap => {
            const apCat = noiseCategory(ap.noiseLevel ?? 0)
            return (
              <div key={ap.code} className="contrib-row">
                <div className="contrib-header">
                  <span className="contrib-code">{ap.code}</span>
                  <span className="contrib-name">{ap.name}</span>
                  <span className={`contrib-noise level-${apCat}`}>{ap.noiseLevel ?? '—'} dB</span>
                  <span className="contrib-weight">×{Math.round(WEIGHTS[ap.code] * 100)}%</span>
                  {ap.activeRunway && (
                    <span className="runway-code contrib-rwy">{ap.activeRunway.end}</span>
                  )}
                  {ap.isOverflight != null && (
                    <span className={`overflight-tag ${ap.isOverflight ? 'yes' : 'no'}`}>
                      {ap.isOverflight ? 'Survol' : 'Écarté'}
                    </span>
                  )}
                </div>
                <div className="forecast-bar">
                  <div className="forecast-bar-fill" style={{ width: `${pct(ap.noiseLevel ?? 0)}%` }} />
                </div>
              </div>
            )
          })}
          {summary && <p className="global-summary">{summary}</p>}
        </div>
      </div>
    </article>
  )
}
