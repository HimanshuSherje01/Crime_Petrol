import React, { useMemo, useState, useEffect } from 'react'
import { Search, Link2, Users, Layers, Network, Loader2 } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { typeColor, typeLabel } from './entityStyle'
import clsx from 'clsx'

export default function LinkAnalysis() {
  const { graphData, selectedCase, analyzeState, analyzeCase, fetchCaseData } = useStore()
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [relFilter, setRelFilter] = useState('ALL')

  const idToNode = useMemo(() => {
    const map = {}
    graphData?.nodes?.forEach(n => { map[n.data.id] = n.data })
    return map
  }, [graphData])

  useEffect(() => {
    if (selectedCase && (!graphData.nodes || graphData.nodes.length === 0)) {
      fetchCaseData(selectedCase)
    }
  }, [selectedCase, fetchCaseData])

  const relTypes = useMemo(() => {
    const set = new Set((graphData?.edges || []).map(e => e.data.label))
    return Array.from(set).sort()
  }, [graphData])

  const rows = useMemo(() => {
    const out = (graphData?.edges || []).map(e => {
      const src = idToNode[e.data.source]
      const tgt = idToNode[e.data.target]
      return {
        source: e.data.source,
        target: e.data.target,
        sourceName: src?.label || e.data.source,
        sourceType: src?.type || 'OTHER',
        targetName: tgt?.label || e.data.target,
        targetType: tgt?.type || 'OTHER',
        label: e.data.label || 'ASSOCIATED_WITH',
        weight: e.data.weight || 1
      }
    })
    const q = query.trim().toLowerCase()
    return out.filter(r => {
      if (typeFilter !== 'ALL' && r.sourceType !== typeFilter && r.targetType !== typeFilter) return false
      if (relFilter !== 'ALL' && r.label !== relFilter) return false
      if (q && ![r.sourceName, r.targetName].some(n => n.toLowerCase().includes(q))) return false
      return true
    }).sort((a, b) => b.weight - a.weight)
  }, [graphData, idToNode, query, typeFilter, relFilter])

  const hubs = useMemo(() => {
    const degree = {}
    graphData?.edges?.forEach(e => {
      const key = idToNode[e.data.source]?.label || e.data.source
      degree[key] = (degree[key] || 0) + 1
      const key2 = idToNode[e.data.target]?.label || e.data.target
      degree[key2] = (degree[key2] || 0) + 1
    })
    return Object.entries(degree)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [graphData, idToNode])

  const peopleInvolved = useMemo(() => {
    const set = new Set()
    rows.forEach(r => {
      if (r.sourceType === 'PERSON') set.add(r.sourceName)
      if (r.targetType === 'PERSON') set.add(r.targetName)
    })
    return set.size
  }, [rows])

  if (analyzeState === 'loading') {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-gray-400">Building network graph...</p>
      </div>
    )
  }

  if (!graphData.nodes || graphData.nodes.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
        <div className="w-14 h-14 rounded-full bg-card border border-border flex items-center justify-center">
          <Link2 className="w-6 h-6 text-primary" />
        </div>
        <p className="text-sm text-gray-400">No relationship data yet</p>
        <p className="text-[11px] max-w-sm text-center text-gray-500">
          Run the analysis pipeline for <span className="text-primary font-mono">{selectedCase}</span> to map how entities connect.
        </p>
        <button
          onClick={() => analyzeCase(selectedCase)}
          className="bg-primary text-black font-semibold px-4 py-2 rounded-lg text-xs hover:bg-primary-hover transition-colors"
        >
          Run Analysis
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 h-full overflow-auto space-y-6">
      <div>
        <h1 className="text-lg font-bold text-white">Link Analysis</h1>
        <p className="text-[11px] text-gray-500">Direct connections between extracted entities, filterable by type and relationship.</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Link2} label="Relationships" value={rows.length} color="text-primary" />
        <StatCard icon={Layers} label="Relationship Types" value={relTypes.length} color="text-violet-400" />
        <StatCard icon={Users} label="People Involved" value={peopleInvolved} color="text-success" />
        <StatCard icon={Network} label="Top Hub Links" value={hubs[0]?.count || 0} color="text-amber-400" />
      </div>

      <div className="grid grid-cols-[1fr_260px] gap-4 items-start">
        <div className="glass-panel rounded-lg overflow-hidden">
          <div className="p-3 border-b border-border flex items-center space-x-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Filter by entity name..."
                className="w-full bg-background border border-border rounded pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-primary/50 text-white placeholder-gray-600"
              />
            </div>
            <select
              value={relFilter}
              onChange={e => setRelFilter(e.target.value)}
              className="bg-background border border-border rounded px-2 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL">All relationships</option>
              {relTypes.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="bg-background border border-border rounded px-2 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL">All types</option>
              {['PERSON', 'ORG', 'LOCATION', 'PHONE', 'VEHICLE', 'BANK', 'FIR'].map(t =>
                <option key={t} value={t}>{typeLabel(t)}</option>
              )}
            </select>
          </div>

          <table className="w-full text-[11px]">
            <thead>
              <tr className="text-left text-[9px] text-gray-500 uppercase tracking-widest">
                <th className="px-3 py-2">Source</th>
                <th className="px-3 py-2">Relationship</th>
                <th className="px-3 py-2">Target</th>
                <th className="px-3 py-2 text-right">Weight</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={4} className="px-3 py-8 text-center text-gray-600">No connections match your filters.</td></tr>
              )}
              {rows.slice(0, 200).map((r, i) => (
                <tr key={i} className="border-t border-border/40 hover:bg-white/[0.02]">
                  <td className="px-3 py-2">
                    <div className="font-medium text-white">{r.sourceName}</div>
                    <div className="text-[9px] text-gray-500 font-mono">{r.sourceType}</div>
                  </td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: typeColor(r.sourceType) }}></span>
                      <span className="text-gray-300">{r.label}</span>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: typeColor(r.targetType) }}></span>
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-white">{r.targetName}</div>
                    <div className="text-[9px] text-gray-500 font-mono">{r.targetType}</div>
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-gray-400">{r.weight.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="glass-panel rounded-lg p-4 space-y-3">
          <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Top Connected Hubs</h3>
          {hubs.map((h, i) => (
            <div key={h.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-2 min-w-0">
                <span className={clsx(
                  "w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center",
                  i === 0 ? "bg-primary text-black" : "bg-card border border-border text-gray-400"
                )}>{i + 1}</span>
                <span className="text-gray-300 truncate">{h.name}</span>
              </div>
              <span className="text-[10px] font-mono text-primary">{h.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="glass-panel rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] text-gray-500 uppercase tracking-widest">{label}</span>
        <Icon className={`w-3.5 h-3.5 ${color}`} />
      </div>
      <div className="text-2xl font-bold text-white leading-none">{value}</div>
    </div>
  )
}