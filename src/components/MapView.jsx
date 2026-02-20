/**
 * MapView Component
 * 
 * Interactive map visualization using MapLibre GL via react-map-gl.
 * Features:
 * - Point clustering at low zoom levels with count display
 * - Color-coded points by plaque type (Historical person/Building/Event/Other)
 * - Hover tooltips showing plaque details
 * - Click popups with full information
 * - Responsive to filters and chart/table selections
 * 
 * @component
 */
import { useMemo, useRef } from 'react'
import PropTypes from 'prop-types'
import Map, { Source, Layer, Popup, NavigationControl } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'

// Map layer configuration: clusters (grouped points at low zoom)
const clusterLayer = {
  id: 'clusters',
  type: 'circle',
  source: 'plaques',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': [
      'step',
      ['get', 'point_count'],
      '#38bdf8',
      20,
      '#22c55e',
      50,
      '#eab308'
    ],
    'circle-radius': ['step', ['get', 'point_count'], 15, 20, 18, 50, 22],
    'circle-opacity': 0.85
  }
}

const clusterCountLayer = {
  id: 'cluster-count',
  type: 'symbol',
  source: 'plaques',
  filter: ['has', 'point_count'],
  layout: {
    'text-field': '{point_count_abbreviated}',
    'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
    'text-size': 12
  },
  paint: {
    'text-color': '#0f172a'
  }
}

// Map layer configuration: individual plaques (visible at high zoom)
// Points are color-coded by plaqueType derived from data analysis
const plaquesLayer = {
  id: 'plaques-unclustered',
  type: 'circle',
  source: 'plaques',
  filter: ['!', ['has', 'point_count']], // Exclude clustered points
  paint: {
    // Circle size scales with zoom level for better visibility
    'circle-radius': [
      'interpolate',
      ['linear'],
      ['zoom'],
      8,
      4,
      10,
      6,
      12,
      9,
      14,
      11
    ],
    // Color mapping: each plaqueType gets a distinct color
    'circle-color': [
      'match',
      ['get', 'plaqueType'], // Derived field from plaqueUtils.js
      'Historical person',
      '#3b82f6', // Blue
      'Building',
      '#ef4444', // Red
      'Event',
      '#22c55e', // Green
      'Other',
      '#a855f7', // Purple
      '#6b7280' // Gray (fallback)
    ],
    'circle-stroke-width': 1.5,
    'circle-stroke-color': '#0f172a',
    'circle-opacity': 0.9
  }
}

function MapView({
  darkMode,
  features,
  onSelectFeature,
  selectedFeature,
  hoveredFeature,
  setHoveredFeature,
  mapFocus,
  setMapFocus
}) {
  const mapRef = useRef(null)

  const geojson = useMemo(
    () => ({
      type: 'FeatureCollection',
      features: features ?? []
    }),
    [features]
  )

  const handleClick = (event) => {
    const { features: f } = event
    if (!f || !f.length) return
    const feature = f[0]

    if (feature.layer?.id === 'clusters') {
      const clusterId = feature.properties.cluster_id
      const mapboxSource = mapRef.current.getSource('plaques')
      mapboxSource.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return
        mapRef.current.easeTo({
          center: feature.geometry.coordinates,
          zoom,
          duration: 500
        })
      })
    } else {
      onSelectFeature(feature)
      setMapFocus({
        longitude: feature.geometry.coordinates[0],
        latitude: feature.geometry.coordinates[1]
      })
    }
  }

  const handleMove = (evt) => {
    setMapFocus({
      longitude: evt.viewState.longitude,
      latitude: evt.viewState.latitude,
      zoom: evt.viewState.zoom
    })
  }

  const handleMouseMove = (evt) => {
    const { features: f } = evt
    if (f && f.length && f[0].layer?.id === 'plaques-unclustered') {
      setHoveredFeature(f[0])
    } else if (hoveredFeature) {
      setHoveredFeature(null)
    }
  }

  const handleMouseLeave = () => {
    if (hoveredFeature) setHoveredFeature(null)
  }

  const initialViewState = {
    longitude: mapFocus?.longitude ?? -0.1,
    latitude: mapFocus?.latitude ?? 51.51,
    zoom: mapFocus?.zoom ?? 10
  }

  // Use free Carto basemaps (no token required)
  const mapStyle = darkMode
    ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
    : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'

  return (
    <div className="relative h-full w-full">
      <Map
        ref={mapRef}
        initialViewState={initialViewState}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        interactiveLayerIds={['clusters', 'plaques-unclustered']}
        onClick={handleClick}
        onMoveEnd={handleMove}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <NavigationControl position="top-right" />

        <Source
          id="plaques"
          type="geojson"
          data={geojson}
          cluster
          clusterRadius={40}
          clusterMaxZoom={14}
        >
          <Layer {...clusterLayer} />
          <Layer {...clusterCountLayer} />
          <Layer {...plaquesLayer} />
        </Source>

        {hoveredFeature && (
          <Popup
            longitude={hoveredFeature.geometry.coordinates[0]}
            latitude={hoveredFeature.geometry.coordinates[1]}
            closeButton={false}
            closeOnClick={false}
            offset={12}
          >
            <div className="max-w-xs text-xs">
              <p className="font-semibold">
                {hoveredFeature.properties.title || 'Plaque'}
              </p>
              <p className="text-slate-600">
                {hoveredFeature.properties.address}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                {hoveredFeature.properties.plaqueType} ·{' '}
                {hoveredFeature.properties.year || 'year unknown'}
              </p>
            </div>
          </Popup>
        )}

        {selectedFeature && (
          <Popup
            longitude={selectedFeature.geometry.coordinates[0]}
            latitude={selectedFeature.geometry.coordinates[1]}
            closeButton
            closeOnMove={false}
            anchor="bottom"
          >
            <div className="max-w-xs text-xs">
              <p className="font-semibold">
                {selectedFeature.properties.title || 'Plaque'}
              </p>
              <p className="text-slate-600">
                {selectedFeature.properties.address}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                {selectedFeature.properties.plaqueType} ·{' '}
                {selectedFeature.properties.year || 'year unknown'}
              </p>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  )
}

MapView.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  features: PropTypes.array.isRequired,
  onSelectFeature: PropTypes.func.isRequired,
  selectedFeature: PropTypes.object,
  hoveredFeature: PropTypes.object,
  setHoveredFeature: PropTypes.func.isRequired,
  mapFocus: PropTypes.object,
  setMapFocus: PropTypes.func.isRequired
}

export default MapView

