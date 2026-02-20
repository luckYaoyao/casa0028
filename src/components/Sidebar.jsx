import PropTypes from 'prop-types'
import StatsCards from './StatsCards'
import CsvDemo from './CsvDemo'

function Sidebar({
  open,
  filters,
  onFiltersChange,
  yearExtent,
  boroughOptions,
  stats,
  onResetFilters,
  darkMode
}) {
  const [minYear, maxYear] = yearExtent
  const [currentMin, currentMax] = filters.yearRange

  const handleBoroughToggle = (borough) => {
    const set = new Set(filters.boroughs)
    if (set.has(borough)) {
      set.delete(borough)
    } else {
      set.add(borough)
    }
    onFiltersChange({ boroughs: Array.from(set) })
  }

  return (
    <aside
      className={`${
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } z-20 flex w-72 flex-col border-r border-slate-200 bg-slate-50/95 px-3 py-4 shadow-sm backdrop-blur transition-transform duration-300 dark:border-slate-700 dark:bg-slate-900/90`}
    >
      <div className="flex-1 space-y-4 overflow-y-auto pb-4 scrollbar-thin">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Filters
          </h2>
          <button
            type="button"
            onClick={onResetFilters}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            Reset
          </button>
        </div>

        <div className="space-y-1 text-xs">
          <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300">
            Plaque type
          </label>
          <select
            value={filters.type}
            onChange={(e) => onFiltersChange({ type: e.target.value })}
            className="mt-0.5 w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="all">All types</option>
            <option value="Historical person">Historical person</option>
            <option value="Building">Building</option>
            <option value="Event">Event</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="space-y-1 text-xs">
          <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300">
            Year range ({currentMin || '…'} – {currentMax || '…'})
          </label>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="range"
              min={minYear}
              max={maxYear}
              value={currentMin}
              onChange={(e) =>
                onFiltersChange({
                  yearRange: [Number(e.target.value), currentMax]
                })
              }
              className="h-1 flex-1 cursor-pointer"
            />
            <input
              type="range"
              min={minYear}
              max={maxYear}
              value={currentMax}
              onChange={(e) =>
                onFiltersChange({
                  yearRange: [currentMin, Number(e.target.value)]
                })
              }
              className="h-1 flex-1 cursor-pointer"
            />
          </div>
        </div>

        <div className="space-y-1 text-xs">
          <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300">
            Search by title or address
          </label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            placeholder="e.g. library, museum, author…"
            className="mt-0.5 w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="space-y-1 text-xs">
          <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300">
            Borough (subset of London)
          </label>
          <div className="mt-1 max-h-32 space-y-1 overflow-y-auto rounded-md border border-slate-200 bg-white p-2 text-[11px] shadow-sm scrollbar-thin dark:border-slate-700 dark:bg-slate-800">
            {boroughOptions.map((b) => (
              <label
                key={b}
                className="flex cursor-pointer items-center gap-1.5 text-slate-700 dark:text-slate-100"
              >
                <input
                  type="checkbox"
                  className="h-3 w-3 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  checked={filters.boroughs.includes(b)}
                  onChange={() => handleBoroughToggle(b)}
                />
                <span>{b}</span>
              </label>
            ))}
            {!boroughOptions.length && (
              <p className="text-[11px] text-slate-500">No boroughs found.</p>
            )}
          </div>
        </div>

        <StatsCards stats={stats} />

        <CsvDemo />
      </div>

      <p className="mt-3 text-[10px] text-slate-500 dark:text-slate-400">
        Filters are applied live to the map, charts and table so that the whole
        page behaves as a single coordinated view of the London OpenPlaques
        dataset.
      </p>
    </aside>
  )
}

Sidebar.propTypes = {
  open: PropTypes.bool.isRequired,
  filters: PropTypes.shape({
    type: PropTypes.string,
    yearRange: PropTypes.arrayOf(PropTypes.number),
    search: PropTypes.string,
    boroughs: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  onFiltersChange: PropTypes.func.isRequired,
  yearExtent: PropTypes.arrayOf(PropTypes.number).isRequired,
  boroughOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
  stats: PropTypes.object,
  onResetFilters: PropTypes.func.isRequired,
  darkMode: PropTypes.bool
}

export default Sidebar

