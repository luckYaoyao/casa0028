import { useState } from 'react'
import { convertSampleCsvToGeoJSON } from '../utils/csvToGeojsonExample'

function CsvDemo() {
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleRun = async () => {
    setLoading(true)
    setError(null)
    try {
      const geojson = await convertSampleCsvToGeoJSON()
      setPreview({
        featureCount: geojson.features?.length ?? 0,
        sample: geojson.features?.[0] ?? null
      })
    } catch (e) {
      setError('Failed to convert CSV – see console for details.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          CSV → GeoJSON demo
        </h3>
        <button
          type="button"
          onClick={handleRun}
          disabled={loading}
          className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
        >
          {loading ? 'Converting…' : 'Run example'}
        </button>
      </div>

      {error && (
        <p className="text-[11px] text-red-500 dark:text-red-400">{error}</p>
      )}

      {preview && (
        <div className="rounded-md bg-slate-50 p-2 text-[11px] text-slate-700 dark:bg-slate-900/40 dark:text-slate-200">
          <p>
            Features generated:&nbsp;
            <span className="font-semibold">{preview.featureCount}</span>
          </p>
          {preview.sample && (
            <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap text-[10px]">
{JSON.stringify(preview.sample, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}

export default CsvDemo

