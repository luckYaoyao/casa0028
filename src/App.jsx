import { useEffect, useMemo, useState, useCallback } from 'react'
import { plaqueData } from './data/open-plaques-london-2023-11-10-filtered'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import MapView from './components/MapView'
import ChartsView from './components/ChartsView'
import DataTable from './components/DataTable'
import Footer from './components/Footer'
import PlaqueDetailModal from './components/PlaqueDetailModal'
import {
  normaliseFeature,
  getYearExtent,
  buildStats,
  applyFilters
} from './utils/plaqueUtils'
import { enhancePlaqueData } from './utils/enhanceData'

const VIEWS = {
  MAP: 'map',
  CHARTS: 'charts',
  TABLE: 'table'
}

function App() {
  const [view, setView] = useState(VIEWS.MAP)
  const [darkMode, setDarkMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const [rawFeatures] = useState(() =>
    plaqueData.features.filter(
      (f) =>
        f.geometry &&
        Array.isArray(f.geometry.coordinates) &&
        f.geometry.coordinates.length === 2
    )
  )

  const [features, setFeatures] = useState([])
  const [loading, setLoading] = useState(true)

  const [selectedPlaque, setSelectedPlaque] = useState(null)
  const [hoveredPlaque, setHoveredPlaque] = useState(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [mapFocus, setMapFocus] = useState(null)

  const [chartFilter, setChartFilter] = useState(null)

  const [filters, setFilters] = useState({
    type: 'all',
    yearRange: [1900, 2020],
    search: '',
    boroughs: []
  })

  useEffect(() => {
    // Enhance data: add 2025/2026 entries and ensure type diversity
    const enhanced = enhancePlaqueData(rawFeatures.slice(0, 800))
    const normalised = enhanced.map(normaliseFeature)
    const extent = getYearExtent(normalised)
    setFeatures(normalised)
    setFilters((prev) => ({
      ...prev,
      yearRange: extent
    }))

    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [rawFeatures])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark-mode')
    } else {
      document.documentElement.classList.remove('dark-mode')
    }
  }, [darkMode])

  const stats = useMemo(() => buildStats(features), [features])

  const filteredFeatures = useMemo(
    () => applyFilters(features, filters, chartFilter),
    [features, filters, chartFilter]
  )

  const boroughOptions = useMemo(() => {
    const set = new Set()
    features.forEach((f) => {
      if (f.properties?.borough) set.add(f.properties.borough)
    })
    return Array.from(set).sort()
  }, [features])

  const yearExtent = useMemo(() => getYearExtent(features), [features])

  const handleResetFilters = () => {
    setFilters({
      type: 'all',
      yearRange: yearExtent,
      search: '',
      boroughs: []
    })
    setChartFilter(null)
  }

  const handleFiltersChange = (partial) => {
    setFilters((prev) => ({
      ...prev,
      ...partial
    }))
    setChartFilter(null)
  }

  const handleChartSelection = useCallback((payload) => {
    setChartFilter(payload)
    setView(VIEWS.MAP)
  }, [])

  const handleRowClick = useCallback((feature) => {
    setSelectedPlaque(feature)
    setDetailModalOpen(true)
    setView(VIEWS.MAP)
    if (feature.geometry?.coordinates) {
      setMapFocus({
        longitude: feature.geometry.coordinates[0],
        latitude: feature.geometry.coordinates[1]
      })
    }
  }, [])

  const handleMapSelect = useCallback((feature) => {
    setSelectedPlaque(feature)
    setDetailModalOpen(true)
  }, [])

  const handleCloseDetail = () => {
    setDetailModalOpen(false)
  }

  const mainContent = (() => {
    if (loading) {
      return (
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-blue-500" />
            <p className="text-sm text-slate-500">
              Loading London plaques data…
            </p>
          </div>
        </div>
      )
    }

    if (view === VIEWS.MAP) {
      return (
        <MapView
          darkMode={darkMode}
          features={filteredFeatures}
          onSelectFeature={handleMapSelect}
          selectedFeature={selectedPlaque}
          hoveredFeature={hoveredPlaque}
          setHoveredFeature={setHoveredPlaque}
          mapFocus={mapFocus}
          setMapFocus={setMapFocus}
        />
      )
    }

    if (view === VIEWS.CHARTS) {
      return (
        <ChartsView
          darkMode={darkMode}
          features={features}
          filteredFeatures={filteredFeatures}
          yearExtent={yearExtent}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onChartSelection={handleChartSelection}
        />
      )
    }

    return (
      <DataTable
        features={filteredFeatures}
        onRowClick={handleRowClick}
        darkMode={darkMode}
      />
    )
  })()

  return (
    <div className={`app-shell ${darkMode ? 'app-shell--dark' : ''}`}>
      <div className="flex h-screen w-full flex-col">
        <Navbar
          currentView={view}
          onViewChange={setView}
          darkMode={darkMode}
          onToggleDark={() => setDarkMode((v) => !v)}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
        />

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <Sidebar
            open={sidebarOpen}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            yearExtent={yearExtent}
            boroughOptions={boroughOptions}
            stats={stats}
            onResetFilters={handleResetFilters}
            darkMode={darkMode}
          />

          <main className="flex-1 overflow-hidden bg-slate-100 dark:bg-slate-900/60">
            {mainContent}
          </main>
        </div>

        <Footer />
      </div>

      <PlaqueDetailModal
        open={detailModalOpen && !!selectedPlaque}
        onClose={handleCloseDetail}
        plaque={selectedPlaque}
      />
    </div>
  )
}

export default App

