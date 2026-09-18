import React, { useEffect, useMemo } from 'react'
import { Users, Share2, Loader2, Shield, GitFork } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { COMMUNITY_COLORS } from './entityStyle'
import clsx from 'clsx'

export default function Communities() {
  const { players, graphData, selectedCase, analyzeState, analyzeCase, fetchCaseData } = useStore()

  useEffect(() => {
    if (selectedCase && (!graphData.nodes || graphData.nodes.length === 0)) {
      fetchCaseData(selectedCase)
    }
  }, [selectedCase, graphData, fetchCaseData])

  const communities = useMemo(() => {
    const map = {}
    players.forEach(p => {
      const cid = p.community ?? 0
      map[cid] = map[cid] || []
      map[cid].push(p)
    })
    return Object.entries(map)
      .map(([id, members]) => ({
        id: Number(id),
        members: members.sort((a, b) => b.risk_score - a.risk_score)
      }))
      .sort((a, b) => b.members.length - a.members.length)
  }, [players])

  const bridges = useMemo(() => {
    const playerById = {}
    players.forEach(p => { playerById[p.id] = p })
    const map = {}
    graphData?.edges?.forEach(e => {
      const s = playerById[e.data.source]
      const t = playerById[e.data.target]
      if (!s || !t || (s.community ?? 0) === (t.community ?? 0)) return
      const a = s.community ?? 0
      const b = t.community ?? 0
      const key = a < b ? `${a}-${b}` : `${b}-${a}`
      map[key] = (map[key] || 0) + 1
    })
    return Object.entries(map)
      .map(([k, count]) => {
        const [a, b] = k.split('-').map(Number)
        return { a, b, count }
      })
      .sort((x, y) => y.count - x.count)
  }, [players, graphData])

  if (analyzeState === 'loading') {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-gray-400">Running community detection...</p>
      </div>
    )
  }

  if (players.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
        <div className="w-14 h-14 rounded-full bg-card border border-border flex items-center justify-center">
          <Users className="w-6 h-6 text-primary" />
        </div>
        <p className="text-sm text-gray-400">No communities detected yet</p>
        <p className="text-[11px] max-w-sm text-center text-gray-500">
          Run the analysis pipeline for <span className="text-primary font-mono">{selectedCase}</span> to detect network clusters.
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

  const topCommunity = communities[0]

  return (
    <div className="p-6 h-full overflow-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Community Detection</h1>
          <p className="text-[11px] text-gray-500">Structural clusters (Louvain) revealing who operates together, plus bridges between rings.</p>
        </div>
        <div className="flex items-center space-x-3 text-[10px]">
          <InfoPill label="Communities" value={communities.length} />
          <InfoPill label="Key Individuals" value={players.length} />
          <InfoPill label="Cross-community links" value={bridges.reduce((s, b) => s + b.count, 0)} />
        </div>
      </div>

      {topCommunity && (
        <div className="glass-panel rounded-lg p-4 flex items-center space-x-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${COMMUNITY_COLORS[topCommunity.id % 10]}22`, color: COMMUNITY_COLORS[topCommunity.id % 10] }}>
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Dominant coalition</div>
            <div className="text-[11px] text-gray-500">
              Community <span className="text-primary font-mono">#{topCommunity.id}</span> — {topCommunity.members.length} operatives, led by{' '}
              <span className="text-white">{topCommunity.members[0]?.name}</span> (risk {Math.round(topCommunity.members[0]?.risk_score || 0)}).
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {communities.map(comm => {
          const color = COMMUNITY_COLORS[comm.id % COMMUNITY_COLORS.length]
          const hub = comm.members.reduce((a, b) => (b.betweenness > (a?.betweenness || 0) ? b : a), comm.members[0])
          return (
            <div key={comm.id} className="glass-panel rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: `${color}12`, borderBottom: `1px solid ${color}44` }}>
                <div className="flex items-center space-x-3">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
                  <span className="font-semibold text-white text-sm">Community #{comm.id}</span>
                </div>
                <span className="text-[10px] text-gray-400 font-mono">{comm.members.length} members</span>
              </div>

              <div className="p-3 space-y-1.5">
                {comm.members.map(p => (
                  <div key={p.id} className="flex items-center justify-between px-2 py-1.5 rounded bg-background/60 hover:bg-white/[0.03]">
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: riskColor(p.risk_score) }}></span>
                      <span className="text-gray-200 text-[12px] truncate">{p.name}</span>
                      {hub.id === p.id && (
                        <span className="text-[8px] uppercase tracking-widest px-1 py-0.5 rounded border" style={{ color, borderColor: `${color}55`, backgroundColor: `${color}11` }}>
                          Hub
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 text-[10px] font-mono text-gray-500 shrink-0">
                      <span className="text-gray-400">{p.connections} links</span>
                      <span className={clsx("font-semibold", p.risk_score >= 70 ? "text-danger" : p.risk_score >= 40 ? "text-amber-500" : "text-success")}>
                        {Math.round(p.risk_score)} risk
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="glass-panel rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <GitFork className="w-4 h-4 text-primary" />
          <h3 className="text-[11px] font-semibold text-gray-300 uppercase tracking-widest">Inter-community Bridges</h3>
        </div>
        {bridges.length === 0 ? (
          <p className="text-[11px] text-gray-600">No cross-community links detected in this case.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {bridges.slice(0, 12).map(b => (
              <div key={`${b.a}-${b.b}`} className="flex items-center space-x-2 border border-border rounded-full px-3 py-1 text-[11px]">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COMMUNITY_COLORS[b.a % 10] }}></span>
                  <span className="text-gray-300 font-mono">#{b.a}</span>
                </span>
                <Share2 className="w-3 h-3 text-gray-600" />
                <span className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COMMUNITY_COLORS[b.b % 10] }}></span>
                  <span className="text-gray-300 font-mono">#{b.b}</span>
                </span>
                <span className="text-primary font-mono">{b.count} link{b.count > 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function riskColor(score) {
  return score >= 70 ? '#EF4444' : score >= 40 ? '#F59E0B' : '#10B981'
}

function InfoPill({ label, value }) {
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-1.5 flex items-center space-x-2">
      <span className="text-[9px] text-gray-500 uppercase tracking-widest">{label}</span>
      <span className="text-white font-mono">{value}</span>
    </div>
  )
}