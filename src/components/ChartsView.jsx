/**
 * ChartsView Component
 * 
 * Multi-chart dashboard using Chart.js via react-chartjs-2.
 * Provides three visualization types:
 * - Bar chart: plaque count by type (Historical person/Building/Event/Other)
 * - Line chart: plaques established per year (time series)
 * - Pie chart: distribution by London borough
 * 
 * Features:
 * - Chart type switcher dropdown
 * - PNG export functionality
 * - Interactive: clicking chart elements filters map and switches to map view
 * - Hover tooltips with precise values
 * - Dark mode support
 * 
 * @component
 */
import { useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from 'chart.js'
import { Bar, Line, Pie } from 'react-chartjs-2'
import {
  aggregateByType,
  aggregateByYear,
  aggregateByBorough
} from '../utils/plaqueUtils'

ChartJS.register(
  BarElement,
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
)

function ChartsView({
  darkMode,
  features,
  filteredFeatures,
  yearExtent,
  filters,
  onFiltersChange,
  onChartSelection
}) {
  const [chartType, setChartType] = useState('bar')
  const chartRef = useRef(null)
  const [minYear, maxYear] = yearExtent

  const typeCounts = useMemo(
    () => aggregateByType(filteredFeatures),
    [filteredFeatures]
  )
  const byYear = useMemo(
    () => aggregateByYear(filteredFeatures),
    [filteredFeatures]
  )
  const boroughCounts = useMemo(
    () => aggregateByBorough(filteredFeatures),
    [filteredFeatures]
  )

  const barData = {
    labels: Object.keys(typeCounts),
    datasets: [
      {
        label: 'Number of plaques',
        data: Object.values(typeCounts),
        backgroundColor: ['#3b82f6', '#ef4444', '#22c55e', '#a855f7', '#6b7280']
      }
    ]
  }

  const lineData = {
    labels: byYear.map((d) => d.year),
    datasets: [
      {
        label: 'Plaques established per year',
        data: byYear.map((d) => d.count),
        fill: false,
        borderColor: '#3b82f6',
        backgroundColor: '#3b82f6',
        tension: 0.2,
        pointRadius: 2
      }
    ]
  }

  const pieData = {
    labels: Object.keys(boroughCounts),
    datasets: [
      {
        data: Object.values(boroughCounts),
        backgroundColor: [
          '#0ea5e9',
          '#22c55e',
          '#eab308',
          '#f97316',
          '#a855f7',
          '#f43f5e',
          '#14b8a6',
          '#6366f1'
        ]
      }
    ]
  }

  const commonOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: chartType !== 'bar' ? true : false,
        labels: {
          color: darkMode ? '#e5e7eb' : '#0f172a'
        }
      },
      tooltip: {
        enabled: true
      }
    },
    scales:
      chartType === 'pie'
        ? {}
        : {
            x: {
              ticks: { color: darkMode ? '#e5e7eb' : '#0f172a' },
              grid: { color: darkMode ? '#4b5563' : '#e5e7eb' }
            },
            y: {
              ticks: { color: darkMode ? '#e5e7eb' : '#0f172a' },
              grid: { color: darkMode ? '#4b5563' : '#e5e7eb' }
            }
          }
  }

  const handleExport = () => {
    const chart = chartRef.current
    if (!chart) return
    const url = chart.toBase64Image('image/png', 1)
    const link = document.createElement('a')
    link.href = url
    link.download = `casa0028-plaques-${chartType}.png`
    link.click()
  }

  const handleClick = (evt) => {
    const chart = chartRef.current
    if (!chart) return
    const elements = chart.getElementsAtEventForMode(
      evt,
      'nearest',
      { intersect: true },
      true
    )
    if (!elements.length) return
    const { index } = elements[0]

    if (chartType === 'bar') {
      const typeLabel = barData.labels[index]
      onChartSelection({ kind: 'type', value: typeLabel })
    } else if (chartType === 'pie') {
      const borough = pieData.labels[index]
      onChartSelection({ kind: 'borough', value: borough })
    } else if (chartType === 'line') {
      const year = lineData.labels[index]
      onChartSelection({ kind: 'year', value: year })
    }
  }

  let chartContent = null
  if (chartType === 'bar') {
    chartContent = (
      <Bar
        ref={chartRef}
        data={barData}
        options={{ ...commonOptions, onClick: handleClick }}
      />
    )
  } else if (chartType === 'line') {
    chartContent = (
      <Line
        ref={chartRef}
        data={lineData}
        options={{ ...commonOptions, onClick: handleClick }}
      />
    )
  } else {
    chartContent = (
      <Pie
        ref={chartRef}
        data={pieData}
        options={{ ...commonOptions, onClick: handleClick }}
      />
    )
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Linked charts
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Hover to see precise values. Click a category to filter and focus
            the map on that subset of plaques.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Chart type
          </label>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="bar">By plaque type (bar)</option>
            <option value="line">By year (line)</option>
            <option value="pie">By borough (pie)</option>
          </select>

          <button
            type="button"
            onClick={handleExport}
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            Export PNG
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 md:flex-row">
        <div className="flex-1 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
          {chartContent}
        </div>

        <div className="w-full max-w-xs space-y-3 rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Time filter
          </h3>
          <p className="text-[11px] text-slate-600 dark:text-slate-300">
            Use the sliders to constrain the analysis to a particular
            establishment period. The same range is shared with the map and data
            table views.
          </p>
          <div className="space-y-1">
            <p className="text-[11px]">
              Current range:{' '}
              <span className="font-semibold">
                {filters.yearRange[0]} – {filters.yearRange[1]}
              </span>
            </p>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={minYear}
                max={maxYear}
                value={filters.yearRange[0]}
                onChange={(e) =>
                  onFiltersChange({
                    yearRange: [Number(e.target.value), filters.yearRange[1]]
                  })
                }
                className="h-1 flex-1 cursor-pointer"
              />
              <input
                type="range"
                min={minYear}
                max={maxYear}
                value={filters.yearRange[1]}
                onChange={(e) =>
                  onFiltersChange({
                    yearRange: [filters.yearRange[0], Number(e.target.value)]
                  })
                }
                className="h-1 flex-1 cursor-pointer"
              />
            </div>
          </div>

          <div className="border-t border-dashed border-slate-200 pt-2 text-[11px] text-slate-500 dark:border-slate-700 dark:text-slate-400">
            <p>
              The greyed-out points on the map and the table rows disappear as
              you narrow the time window, encouraging you to explore how
              different eras of London&apos;s history are commemorated in
              space.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

ChartsView.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  features: PropTypes.array.isRequired,
  filteredFeatures: PropTypes.array.isRequired,
  yearExtent: PropTypes.arrayOf(PropTypes.number).isRequired,
  filters: PropTypes.shape({
    yearRange: PropTypes.arrayOf(PropTypes.number).isRequired
  }).isRequired,
  onFiltersChange: PropTypes.func.isRequired,
  onChartSelection: PropTypes.func.isRequired
}

export default ChartsView

