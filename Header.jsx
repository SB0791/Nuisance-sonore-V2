import React, { useState, useEffect } from 'react'

export default function Header({ lastUpdate, loading, onRefresh }) {
  const [time, setTime] = useState(new Date())
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t) }, [])
  const fmt = (d) => d?.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) ?? '—'
  const timeFmt = time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <header className="header">
      <div className="header-title-group">
        <span className="header-eyebrow">Surveillance acoustique aérienne</span>
        <h1>Nuisances Sonores — Houilles</h1>
        <div className="header-airports">
          {['LBG · Le Bourget', 'CDG · Charles de Gaulle', 'ORY · Orly'].map((t) => (
            <span key={t} className="airport-tag">{t}</span>
          ))}
        </div>
      </div>
      <div className="header-controls">
        <span className="clock">{timeFmt}</span>
        {lastUpdate && <span className="last-update">Mise à jour {fmt(lastUpdate)}</span>}
        <button className={`refresh-btn${loading ? ' spinning' : ''}`} onClick={onRefresh} disabled={loading}>
          <svg className="refresh-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
            <path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
          </svg>
          Actualiser
        </button>
      </div>
    </header>
  )
}
