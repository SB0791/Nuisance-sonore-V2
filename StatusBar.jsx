import React from 'react'

export default function StatusBar({ reliability, sources }) {
  return (
    <div className="status-bar">
      <div className="reliability-group">
        <span className="reliability-label">Fiabilité</span>
        <div className="reliability-track">
          <div className="reliability-fill" style={{ width: `${reliability}%` }} />
        </div>
        <span className="reliability-pct">{reliability}/100</span>
      </div>
      <div className="sources-list">
        {[
          { key: 'meteo', label: 'Open-Meteo', ok: sources.meteo },
          { key: 'metar', label: 'METAR',      ok: sources.metar },
        ].map(({ key, label, ok }) => (
          <span key={key} className={`source-chip ${ok ? 'ok' : 'err'}`}>
            <span className="source-dot" />{label}
          </span>
        ))}
      </div>
    </div>
  )
}
