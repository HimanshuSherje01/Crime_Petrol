import React, { useEffect, useMemo, useState } from 'react'
import { CalendarRange, FileText, Search, Loader2 } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { typeColor, typeLabel } from './entityStyle'
import clsx from 'clsx'

const SOURCE_FILTERS = ['ALL', 'FIR', 'CDR', 'DATASET', 'CCTV', 'AUDIO', 'SURVEILLANCE', 'DOCUMENT']

export default function TimelineView() {
  const { selectedCase, analyzeCase, graphData, fetchCaseData, fetchTimeline } = useStore()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [sourceFilter, setSourceFilter] = useState('ALL')
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!selectedCase) return
    if (!graphData.nodes || graphData.nodes.length === 0) fetchCaseData(selectedCase)
    setLoading(true)
    fetchTimeline(selectedCase).then(list => {
      setEvents(list || [])
      setLoading(false)
    })
  }, [selectedCase, graphData, fetchCaseData, fetchTimeline])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return events.filter(ev => {
      if (sourceFilter !== 'ALL' && (ev.source_type || '').toUpperCase() !== sourceFilter) return false
      if (q && !(ev.file || '').toLowerCase().includes(q)) return false
      return true
    })
  }, [events, sourceFilter, query])

  const sourceCounts = useMemo(() => {
    const c = {}
    events.forEach(ev => {
      const k = (ev.source_type || 'DOCUMENT').toUpperCase()
      c[k] = (c[k] || 0) + 1
    })
    return c
  }, [events])

  const grouped = useMemo(() => {
    const groups = []
    let prevKey = null
    filtered.forEach(ev => {
      const key = ev.date || '__undated'
      if (key !== prevKey) {
        groups.push({ key, display: ev.date ? ev.display : 'Date unknown', items: [] })
        prevKey = key
      }
      groups[groups.length - 1].items.push(ev)
    })
    return groups
  }, [filtered])

  return (
    <div className="p-6 h-full overflow-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Timeline View</h1>
          <p className="text-[11px] text-gray-500">Chronological events extracted from evidence — documents, dates, and the entities they mention.</p>
        </div>
        <div className="text-[10px] text-gray-500 text-right">
          <div>Case <span className="text-primary font-mono">{selectedCase}</span></div>
          <div className="mt-0.5">{filtered.length} events</div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search documents..."
            className="bg-background border border-border rounded pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-primary/50 text-white placeholder-gray-600"
          />
        </div>
        {SOURCE_FILTERS.map(sf => (
          <button
            key={sf}
            onClick={() => setSourceFilter(sf)}
            className={clsx(
              "px-3 py-1.5 rounded-md text-[11px] transition-colors border",
              sourceFilter === sf
                ? "bg-primary/20 text-primary border-primary/40 font-medium"
                : "text-gray-500 border-border hover:text-white hover:bg-white/5"
            )}
          >
            {sf === 'ALL' ? `All (${events.length})` : `${sf} (${sourceCounts[sf] || 0})`}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-gray-500">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      )}

      {!loading && events.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500 space-y-3">
          <CalendarRange className="w-10 h-10 text-gray-600" />
          <p className="text-sm text-gray-400">No timeline events found</p>
          <p className="text-[11px] max-w-sm text-center">
            Run the analysis for <span className="text-primary font-mono">{selectedCase}</span> to extract dated events from the evidence.
          </p>
          <button
            onClick={() => analyzeCase(selectedCase)}
            className="bg-primary text-black font-semibold px-4 py-2 rounded-lg text-xs hover:bg-primary-hover transition-colors"
          >
            Run Analysis
          </button>
        </div>
      )}

      {!loading && events.length > 0 && filtered.length === 0 && (
        <div className="text-center text-gray-600 py-16 text-xs">No events match your filters.</div>
      )}

      {!loading && events.length > 0 && (
        <div className="space-y-8 pb-8">
          {grouped.map(group => (
            <div key={group.key} className="relative pl-6 border-l border-border/60">
              <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-primary"></div>
              <div className="mb-3">
                <div className="text-sm font-semibold text-white">{group.display}</div>
                <div className="text-[10px] text-gray-500">{group.items.length} event{group.items.length > 1 ? 's' : ''}</div>
              </div>
              <div className="space-y-2">
                {group.items.map((ev, i) => (
                  <div key={i} className="glass-panel rounded-lg p-3 flex items-start justify-between space-x-4">
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2 mb-1.5">
                        <FileText className="w-3.5 h-3.5 text-gray-500" />
                        <span className="font-mono text-[11px] text-primary truncate">{ev.file}</span>
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest bg-card border border-border text-gray-400">
                          {ev.source_type}
                        </span>
                      </div>
                      {ev.entities.length === 0 ? (
                        <div className="text-[10px] text-gray-600">No canonical entities mentioned in this document.</div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {ev.entities.map(ent => (
                            <span
                              key={ent.id}
                              className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] border"
                              style={{ borderColor: `${typeColor(ent.type)}55`, color: typeColor(ent.type) }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: typeColor(ent.type) }}></span>
                              <span>{ent.name}</span>
                              <span className="text-gray-600 text-[8px]">{typeLabel(ent.type)}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}