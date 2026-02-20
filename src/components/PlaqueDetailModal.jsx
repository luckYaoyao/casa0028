import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'

function PlaqueDetailModal({ open, onClose, plaque }) {
  const [dragging, setDragging] = useState(false)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragStart = useRef({ x: 0, y: 0 })
  const posStart = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handleMove = (e) => {
      if (!dragging) return
      const dx = e.clientX - dragStart.current.x
      const dy = e.clientY - dragStart.current.y
      setOffset({ x: posStart.current.x + dx, y: posStart.current.y + dy })
    }
    const handleUp = () => {
      if (dragging) {
        setDragging(false)
        posStart.current = { ...offset }
      }
    }
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
  }, [dragging, offset])

  if (!open || !plaque) return null
  const p = plaque.properties || {}

  const handleMouseDown = (e) => {
    setDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4 py-8">
      <div
        className="relative w-full max-w-md rounded-xl bg-white p-4 shadow-xl dark:bg-slate-900"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px)`,
          cursor: dragging ? 'grabbing' : 'default'
        }}
      >
        <div
          className="flex cursor-grab items-start justify-between gap-2 border-b border-slate-200 pb-2 dark:border-slate-700"
          onMouseDown={handleMouseDown}
        >
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              {p.title || 'Plaque'}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {p.address}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none dark:hover:bg-slate-800"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="mt-3 space-y-1 text-xs text-slate-700 dark:text-slate-200">
          <p>
            <span className="font-semibold">Type:</span> {p.plaqueType}
          </p>
          <p>
            <span className="font-semibold">Year established:</span>{' '}
            {p.year ?? 'unknown'}
          </p>
          {p.borough && (
            <p>
              <span className="font-semibold">Borough:</span> {p.borough}
            </p>
          )}
          {p.inscription && (
            <p className="mt-2 whitespace-pre-wrap text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
              {p.inscription}
            </p>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-slate-200 pt-2 text-[11px] text-slate-500 dark:border-slate-700 dark:text-slate-400">
          <div>
            {p.id1 && (
              <a
                href={`https://openplaques.org/plaques/${p.id1}`}
                target="_blank"
                rel="noreferrer"
                className="underline-offset-2 hover:underline"
              >
                View on OpenPlaques
              </a>
            )}
          </div>
          <p>Drag this panel by its header to reposition it on top of the map.</p>
        </div>
      </div>
    </div>
  )
}

PlaqueDetailModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  plaque: PropTypes.object
}

export default PlaqueDetailModal

