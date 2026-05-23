export function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

export function getBearing(lat1, lon1, lat2, lon2) {
  const dLon = (lon2 - lon1) * Math.PI / 180
  const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180)
  const x = Math.cos(lat1*Math.PI/180)*Math.sin(lat2*Math.PI/180) - Math.sin(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.cos(dLon)
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360
}

export function determineActiveRunway(runways, windDir) {
  if (windDir == null || !runways?.length) return null
  let best = null, bestScore = -Infinity
  for (const rwy of runways) {
    const ends = [
      { end: rwy.id.split('/')[0], hdg: rwy.hdg },
      { end: rwy.id.split('/')[1], hdg: (rwy.hdg + 180) % 360 },
    ]
    for (const e of ends) {
      const diff = Math.abs(((windDir - e.hdg) + 360) % 360)
      const score = Math.cos(diff * Math.PI / 180)
      if (score > bestScore) { bestScore = score; best = e }
    }
  }
  return best
}

export function isApproachOverPoint(activeRunway, bearing) {
  if (!activeRunway) return false
  const diff = Math.abs(((bearing - activeRunway.hdg) + 360) % 360)
  return diff <= 35 || diff >= 325
}

export function estimateApproachAltitude(distanceKm) {
  // Glide 3° : h = distance × tan(3°) × 3281 ft/km
  return Math.round(distanceKm * Math.tan(3 * Math.PI / 180) * 3281)
}
