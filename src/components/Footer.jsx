function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white/80 px-4 py-2 text-[11px] text-slate-500 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-400">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
        <p>
          Data: simplified sample from the{' '}
          <a
            href="https://openplaques.org/"
            target="_blank"
            rel="noreferrer"
            className="underline-offset-2 hover:underline"
          >
            OpenPlaques London
          </a>{' '}
          dataset.
        </p>
        <p>
          Tech: Vite + React, Tailwind CSS, MapLibre GL via react-map-gl,
          react-chartjs-2 + Chart.js, csv2geojson.
        </p>
        <p>
          Tip: use the left panel to filter; the map, charts and table update
          together to tell a spatial story about how London commemorates its
          past.
        </p>
      </div>
    </footer>
  )
}

export default Footer

