import PropTypes from 'prop-types'

function StatsCards({ stats }) {
  const { total, byType, latestPlaque } = stats || {}

  const topTypes = byType
    ? Object.entries(byType)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
    : []

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Dataset overview
      </h3>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/80">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Total plaques
          </p>
          <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-50">
            {total ?? '—'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/80">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Top plaque types
          </p>
          <ul className="mt-1 space-y-0.5 text-xs text-slate-700 dark:text-slate-200">
            {topTypes.map(([label, count]) => (
              <li key={label} className="flex justify-between">
                <span>{label}</span>
                <span className="font-semibold">{count}</span>
              </li>
            ))}
            {!topTypes.length && <li>–</li>}
          </ul>
        </div>

        <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/80">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Most recent plaque
          </p>
          {latestPlaque ? (
            <div className="mt-1 space-y-0.5 text-xs text-slate-700 dark:text-slate-200">
              <p className="font-semibold">{latestPlaque.properties?.title}</p>
              <p>{latestPlaque.properties?.address}</p>
              <p className="text-slate-500 dark:text-slate-400">
                Year&nbsp;
                <span className="font-semibold">
                  {latestPlaque.properties?.year ?? 'unknown'}
                </span>
                {latestPlaque.properties?.borough
                  ? ` · ${latestPlaque.properties.borough}`
                  : null}
              </p>
            </div>
          ) : (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">–</p>
          )}
        </div>
      </div>
    </div>
  )
}

StatsCards.propTypes = {
  stats: PropTypes.shape({
    total: PropTypes.number,
    byType: PropTypes.object,
    latestPlaque: PropTypes.object
  })
}

export default StatsCards

