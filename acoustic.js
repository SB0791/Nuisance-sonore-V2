export const NOISE_LABELS = {
  none:     'Faible',
  low:      'Modéré',
  moderate: 'Élevé',
  high:     'Fort',
  critical: 'Critique',
}

export function noiseCategory(dba) {
  if (dba < 45) return 'none'
  if (dba < 55) return 'low'
  if (dba < 65) return 'moderate'
  if (dba < 75) return 'high'
  return 'critical'
}

// Atténuation géométrique ICAO : ΔL = -20×log10(h/1000ft)
function attenuationDb(hFt) {
  return -20 * Math.log10(Math.max(500, hFt) / 1000)
}

// Niveaux source à 300m (1000ft) par aéroport
const SOURCE_DBA = { LBG: 83, CDG: 90, ORY: 88 }
const CALIB      = { LBG: 0.92, CDG: 1.05, ORY: 0.85 }

export function computeNoiseLevel({ code, distanceKm, altitudeFt, isOverflight }) {
  if (!isOverflight) {
    // Hors axe : atténuation supplémentaire ~6dB
    const base = (SOURCE_DBA[code] ?? 85) + attenuationDb(altitudeFt ?? 3000)
    return Math.round(Math.max(30, base - 6) * (CALIB[code] ?? 1))
  }
  const base = (SOURCE_DBA[code] ?? 85) + attenuationDb(altitudeFt ?? 3000)
  return Math.round(Math.max(30, base) * (CALIB[code] ?? 1))
}
