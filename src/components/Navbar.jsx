import PropTypes from 'prop-types'

const views = [
  { id: 'map', label: 'Map view' },
  { id: 'charts', label: 'Charts view' },
  { id: 'table', label: 'Data table' }
]

function Navbar({
  currentView,
  onViewChange,
  darkMode,
  onToggleDark,
  sidebarOpen,
  onToggleSidebar
}) {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 lg:hidden"
        >
          {sidebarOpen ? 'Hide filters' : 'Show filters'}
        </button>

        <div className="flex flex-1 items-center justify-between gap-4">
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-base">
              CASA0028 — London Plaques Explorer
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Single-page spatial data story built with React, Mapbox and
              Chart.js
            </p>
          </div>

          <nav className="flex items-center gap-3">
            <div className="inline-flex rounded-full bg-slate-100 p-1 text-xs dark:bg-slate-800">
              {views.map((view) => (
                <button
                  key={view.id}
                  type="button"
                  onClick={() => onViewChange(view.id)}
                  className={`px-3 py-1.5 rounded-full font-medium transition-colors ${
                    currentView === view.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {view.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onToggleDark}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full ${
                  darkMode ? 'bg-amber-400' : 'bg-sky-400'
                }`}
              />
              {darkMode ? 'Dark mode' : 'Light mode'}
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}

Navbar.propTypes = {
  currentView: PropTypes.string.isRequired,
  onViewChange: PropTypes.func.isRequired,
  darkMode: PropTypes.bool.isRequired,
  onToggleDark: PropTypes.func.isRequired,
  sidebarOpen: PropTypes.bool.isRequired,
  onToggleSidebar: PropTypes.func.isRequired
}

export default Navbar

