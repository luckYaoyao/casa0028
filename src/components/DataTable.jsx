import { useMemo, useState } from 'react'
import PropTypes from 'prop-types'

const PAGE_SIZES = [10, 20, 50]

const columns = [
  { id: 'title', label: 'Title' },
  { id: 'plaqueType', label: 'Type' },
  { id: 'year', label: 'Year' },
  { id: 'borough', label: 'Borough' },
  { id: 'address', label: 'Address' },
  { id: 'coords', label: 'Lon / Lat' }
]

function DataTable({ features, onRowClick }) {
  const [sortBy, setSortBy] = useState('title')
  const [sortDir, setSortDir] = useState('asc')
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(0)

  const sorted = useMemo(() => {
    const copy = [...features]
    copy.sort((a, b) => {
      const pa = a.properties || {}
      const pb = b.properties || {}

      let va
      let vb
      if (sortBy === 'coords') {
        va = a.geometry?.coordinates?.[0] ?? 0
        vb = b.geometry?.coordinates?.[0] ?? 0
      } else {
        va = pa[sortBy]
        vb = pb[sortBy]
      }

      if (va == null && vb == null) return 0
      if (va == null) return 1
      if (vb == null) return -1

      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDir === 'asc' ? va - vb : vb - va
      }

      const sa = String(va).toLowerCase()
      const sb = String(vb).toLowerCase()
      if (sa === sb) return 0
      if (sortDir === 'asc') {
        return sa < sb ? -1 : 1
      }
      return sa > sb ? -1 : 1
    })
    return copy
  }, [features, sortBy, sortDir])

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize))
  const clampedPage = Math.min(page, pageCount - 1)
  const start = clampedPage * pageSize
  const current = sorted.slice(start, start + pageSize)

  const handleSort = (id) => {
    if (id === sortBy) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(id)
      setSortDir('asc')
    }
  }

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Filtered plaque records
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click a row to zoom the map to that plaque and open the detail
            panel.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Rows per page
          </span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setPage(0)
            }}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
        <div className="h-full overflow-auto scrollbar-thin">
          <table className="min-w-full divide-y divide-slate-200 text-xs dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900/80">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.id}
                    scope="col"
                    className="cursor-pointer px-3 py-2 text-left font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/70"
                    onClick={() => handleSort(col.id)}
                  >
                    <div className="flex items-center gap-1">
                      <span>{col.label}</span>
                      {sortBy === col.id && (
                        <span className="text-[10px] text-slate-400">
                          {sortDir === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {current.map((f) => {
                const p = f.properties || {}
                const coords = f.geometry?.coordinates || []
                return (
                  <tr
                    key={p.id1}
                    className="cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-800"
                    onClick={() => onRowClick(f)}
                  >
                    <td className="px-3 py-2 text-slate-900 dark:text-slate-50">
                      {p.title}
                    </td>
                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                      {p.plaqueType}
                    </td>
                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                      {p.year ?? '—'}
                    </td>
                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                      {p.borough}
                    </td>
                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                      {p.address}
                    </td>
                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                      {coords.length === 2
                        ? `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`
                        : '—'}
                    </td>
                  </tr>
                )
              })}
              {!current.length && (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-3 py-6 text-center text-slate-500 dark:text-slate-400"
                  >
                    No plaques match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-300">
        <p>
          Showing{' '}
          <span className="font-semibold">
            {sorted.length ? start + 1 : 0}–
            {Math.min(start + pageSize, sorted.length)}
          </span>{' '}
          of <span className="font-semibold">{sorted.length}</span> plaques
        </p>

        <div className="inline-flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage(0)}
            disabled={clampedPage === 0}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            « First
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={clampedPage === 0}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            ‹ Prev
          </button>
          <span className="px-1">
            Page{' '}
            <span className="font-semibold">{clampedPage + 1}</span> of{' '}
            <span className="font-semibold">{pageCount}</span>
          </span>
          <button
            type="button"
            onClick={() =>
              setPage((p) => Math.min(pageCount - 1, p + 1))
            }
            disabled={clampedPage >= pageCount - 1}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            Next ›
          </button>
          <button
            type="button"
            onClick={() => setPage(pageCount - 1)}
            disabled={clampedPage >= pageCount - 1}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            Last »
          </button>
        </div>
      </div>
    </div>
  )
}

DataTable.propTypes = {
  features: PropTypes.array.isRequired,
  onRowClick: PropTypes.func.isRequired
}

export default DataTable

