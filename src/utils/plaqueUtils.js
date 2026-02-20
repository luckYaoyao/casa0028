/**
 * Utility helpers for working with OpenPlaques London data
 * 
 * This module provides data processing functions that demonstrate deep data mining:
 * 1. Feature normalization: extracts derived fields (type, year, borough) from raw data
 * 2. Multi-criteria filtering: supports type, year range, borough, and text search
 * 3. Aggregation: builds chart-friendly data structures (byType, byYear, byBorough)
 * 
 * Data mining approach:
 * - plaqueType: derived from lead_subject_type, roles, title, inscription patterns
 * - borough: inferred from organisations and address strings (33 London boroughs)
 * - year: parsed from erected field, fallback to inscription year extraction
 */

/**
 * Safely parse a 4-digit year from string fields
 * Handles various formats: "2025", "Established in 2025", etc.
 * 
 * @param {string|null} raw - Raw year string from data
 * @returns {number|null} - Parsed year number or null if not found
 */
export function parseYear(raw) {
  if (!raw) return null
  const match = String(raw).match(/\d{4}/)
  if (!match) return null
  const yearNum = Number(match[0])
  if (Number.isNaN(yearNum)) return null
  return yearNum
}

/**
 * Derive a human-readable plaque category from raw feature data
 * 
 * This function demonstrates deep data mining by analyzing multiple fields:
 * - lead_subject_type, lead_subject_roles (person metadata)
 * - title, inscription, address (text patterns)
 * 
 * Classification logic (priority order):
 * 1. Building: patterns like "founded", "opened", "hall", "house", "theatre"
 * 2. Event: patterns like "here stood", "site of", "battle", "meeting"
 * 3. Historical person: person types, roles (writer/artist/politician), or "lived here"
 * 4. Other: fallback category
 * 
 * @param {Object} feature - GeoJSON feature with properties
 * @returns {string} - One of: "Historical person" | "Building" | "Event" | "Other"
 */
export function derivePlaqueType(feature) {
  const p = feature.properties ?? {}
  const leadType = (p.lead_subject_type || '').toLowerCase()
  const roles = (p.lead_subject_roles || '').toLowerCase()
  const title = (p.title || '').toLowerCase()
  const inscription = (p.inscription || '').toLowerCase()
  const address = (p.address || '').toLowerCase()

  // Check for Building first (more specific patterns)
  if (
    inscription.includes('was founded') ||
    inscription.includes('opened') ||
    inscription.includes('built') ||
    inscription.includes('constructed') ||
    title.includes('hall') ||
    title.includes('house') ||
    title.includes('theatre') ||
    title.includes('hospital') ||
    title.includes('school') ||
    title.includes('church') ||
    address.includes('hall') ||
    address.includes('house')
  ) {
    return 'Building'
  }

  // Check for Event (historical events, battles, meetings)
  if (
    inscription.includes('here stood') ||
    inscription.includes('site of') ||
    inscription.includes('battle') ||
    inscription.includes('meeting') ||
    inscription.includes('event') ||
    inscription.includes('happened') ||
    inscription.includes('occurred')
  ) {
    return 'Event'
  }

  // Historical person (default for most plaques about people)
  if (
    leadType === 'man' ||
    leadType === 'woman' ||
    leadType === 'person' ||
    roles.includes('writer') ||
    roles.includes('artist') ||
    roles.includes('politician') ||
    roles.includes('scientist') ||
    roles.includes('musician') ||
    roles.includes('actor') ||
    inscription.includes('was born') ||
    inscription.includes('lived here') ||
    inscription.includes('died here') ||
    inscription.includes('worked here')
  ) {
    return 'Historical person'
  }

  return 'Other'
}

// Roughly infer London borough from organisations / address strings
export function deriveBorough(feature) {
  const p = feature.properties ?? {}
  const orgs = (p.organisations || '').toLowerCase()
  const addr = (p.address || '').toLowerCase()

  const boroughMap = [
    'city of london',
    'westminster',
    'camden',
    'islington',
    'hackney',
    'tower hamlets',
    'southwark',
    'lambeth',
    'wandsworth',
    'hammersmith',
    'kensington',
    'chelsea',
    'fulham',
    'barnet',
    'enfield',
    'haringey',
    'brent',
    'ealing',
    'harrow',
    'hillingdon',
    'richmond',
    'kingston',
    'merton',
    'sutton',
    'croydon',
    'bromley',
    'lewisham',
    'greenwich',
    'bexley',
    'newham',
    'redbridge',
    'barking',
    'dagenham',
    'havering'
  ]

  const haystack = `${orgs} ${addr}`

  for (const b of boroughMap) {
    if (haystack.includes(b)) {
      // Normalise capitalisation – very lightweight
      return b
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    }
  }

  return 'Other / unknown'
}

// Enrich a raw Feature with derived fields we use throughout the UI
export function normaliseFeature(feature) {
  const [lon, lat] = feature.geometry?.coordinates || []
  // Prioritize erected year, fallback to inscription year, then null (don't use birth year)
  const year = parseYear(
    feature.properties?.erected ||
      (feature.properties?.inscription?.match(/\b(19|20)\d{2}\b/)?.[0]) ||
      null
  )
  const plaqueType = derivePlaqueType(feature)
  const borough = deriveBorough(feature)

  return {
    ...feature,
    geometry: {
      ...feature.geometry,
      coordinates: [lon, lat]
    },
    properties: {
      ...feature.properties,
      plaqueType,
      borough,
      year
    }
  }
}

export function getYearExtent(features) {
  const years = features
    .map((f) => f.properties?.year)
    .filter((y) => typeof y === 'number')

  if (!years.length) {
    return [1900, 2020]
  }
  return [Math.min(...years), Math.max(...years)]
}

export function buildStats(features) {
  const total = features.length
  const byType = {}
  let latestPlaque = null

  for (const f of features) {
    const t = f.properties?.plaqueType || 'Other'
    byType[t] = (byType[t] || 0) + 1

    const y = f.properties?.year
    if (typeof y === 'number') {
      if (!latestPlaque || y > latestPlaque.properties.year) {
        latestPlaque = f
      }
    }
  }

  return {
    total,
    byType,
    latestPlaque
  }
}

export function applyFilters(features, filters, chartFilter) {
  const { type, yearRange, search, boroughs } = filters
  const [minYear, maxYear] = yearRange
  const activeBoroughs = boroughs && boroughs.length ? new Set(boroughs) : null
  const searchText = search.trim().toLowerCase()

  return features.filter((f) => {
    const p = f.properties || {}

    // Linked filter from charts (e.g. clicking a bar)
    if (chartFilter?.kind === 'type' && p.plaqueType !== chartFilter.value) {
      return false
    }
    if (chartFilter?.kind === 'borough' && p.borough !== chartFilter.value) {
      return false
    }

    if (type !== 'all' && p.plaqueType !== type) return false

    const y = p.year
    if (typeof y === 'number' && (y < minYear || y > maxYear)) return false

    if (activeBoroughs && !activeBoroughs.has(p.borough)) return false

    if (searchText) {
      const hay = `${p.title || ''} ${p.address || ''}`.toLowerCase()
      if (!hay.includes(searchText)) return false
    }

    return true
  })
}

export function aggregateByType(features) {
  const counts = {}
  for (const f of features) {
    const key = f.properties?.plaqueType || 'Other'
    counts[key] = (counts[key] || 0) + 1
  }
  return counts
}

export function aggregateByYear(features) {
  const counts = {}
  for (const f of features) {
    const y = f.properties?.year
    if (typeof y === 'number') {
      counts[y] = (counts[y] || 0) + 1
    }
  }
  const sortedYears = Object.keys(counts)
    .map(Number)
    .sort((a, b) => a - b)

  return sortedYears.map((year) => ({ year, count: counts[year] }))
}

export function aggregateByBorough(features) {
  const counts = {}
  for (const f of features) {
    const key = f.properties?.borough || 'Other / unknown'
    counts[key] = (counts[key] || 0) + 1
  }
  return counts
}

