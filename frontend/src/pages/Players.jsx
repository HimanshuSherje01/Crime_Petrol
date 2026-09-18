import React, { useState } from 'react'
import { Search, Filter, User, ChevronDown, MoreHorizontal, Download, FolderOpen, Play, Loader2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

const threatColor = (level) => {
  switch ((level || '').toLowerCase()) {
    case 'critical': return { text: 'text-danger', badge: 'bg-danger/10 border-danger/30' }
    case 'high': return { text: 'text-danger', badge: 'bg-danger/10 border-danger/30' }
    case 'medium': return { text: 'text-amber-500', badge: 'bg-amber-500/10 border-amber-500/30' }
    default: return { text: 'text-success', badge: 'bg-success/10 border-success/30' }
  }
}

const scoreColor = (score) => {
  if (score >= 70) return 'bg-danger'
  if (score >= 40) return 'bg-amber-500'
  return 'bg-success'
}

export default function Players() {
  const { players, selectedCase, analyzeState, analyzeCase } = useStore()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('ALL')

  const sortedPlayers = [...players].sort((a, b) => (b.risk_score ?? 0) - (a.risk_score ?? 0))

  const filteredPlayers = sortedPlayers.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'ALL' || p.type === filterType
    return matchesSearch && matchesType
  })

  const typeOptions = ['ALL', ...Array.from(new Set(players.map(p => p.type)))]

  if (analyzeState === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4 bg-[#050914]">
        <FolderOpen className="w-16 h-16 text-gray-800" />
        <h2 className="text-xl font-bold text-white">Click to Analyze</h2>
        <p className="text-gray-500 text-sm max-w-sm">
          Run the analysis pipeline for <span className="text-primary font-mono">{selectedCase}</span> to identify key players and risk scores.
        </p>
        <button
          onClick={() => analyzeCase(selectedCase)}
          className="bg-primary text-black font-semibold px-4 py-2 rounded-lg text-xs hover:bg-primary-hover transition-colors flex items-center space-x-2"
        >
          <Play className="w-3.5 h-3.5" />
          <span>Run Analysis</span>
        </button>
      </div>
    )
  }

  if (analyzeState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 bg-[#050914]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-gray-500 text-sm">Running intelligence pipeline...</p>
      </div>
    )
  }

  return (
    <div className="bg-[#050914] min-h-full p-4 font-sans text-xs flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <User className="w-5 h-5 text-primary" />
            <span>Key Players {selectedCase ? `(Case ${selectedCase})` : ''}</span>
          </h2>
          <p className="text-gray-500 mt-0.5">Identified persons ranked by risk score.</p>
        </div>

        <div className="flex space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search players..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-[#0A0F1C] border border-[#1E293B] rounded text-white focus:border-primary/50 focus:outline-none transition-colors w-64"
            />
          </div>

          <div className="relative group cursor-pointer">
            <button className="flex items-center space-x-2 bg-[#0A0F1C] border border-[#1E293B] text-gray-400 px-3 py-1.5 rounded hover:text-white transition-colors">
              <Filter className="w-4 h-4" />
              <span>{filterType === 'ALL' ? 'All Types' : filterType}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            <div className="absolute right-0 top-full mt-1 w-32 bg-[#0A0F1C] border border-[#1E293B] rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-10 py-1">
              {typeOptions.map(t => (
                <div
                  key={t}
                  onClick={() => setFilterType(t)}
                  className="px-3 py-1.5 hover:bg-primary/10 hover:text-primary text-gray-400 cursor-pointer transition-colors"
                >
                  {t === 'ALL' ? 'All Types' : t}
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => navigate('/network')} className="flex items-center space-x-2 bg-[#0A0F1C] border border-[#1E293B] text-gray-400 px-3 py-1.5 rounded hover:text-white transition-colors">
            <Download className="w-4 h-4" />
            <span>Open Graph</span>
          </button>
        </div>
      </div>

      <div className="flex-1 bg-[#0A0F1C] border border-[#1E293B] rounded-lg overflow-hidden flex flex-col">
        <table className="w-full text-left">
          <thead className="bg-[#030509] text-gray-500 border-b border-[#1E293B] sticky top-0">
            <tr>
              <th className="px-6 py-3 font-medium uppercase tracking-wider text-[10px]">Entity Name</th>
              <th className="px-6 py-3 font-medium uppercase tracking-wider text-[10px]">Type</th>
              <th className="px-6 py-3 font-medium uppercase tracking-wider text-[10px]">Connections</th>
              <th className="px-6 py-3 font-medium uppercase tracking-wider text-[10px]">Risk Score</th>
              <th className="px-6 py-3 font-medium uppercase tracking-wider text-[10px]">Threat Level</th>
              <th className="px-6 py-3 font-medium uppercase tracking-wider text-[10px] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E293B]">
            {filteredPlayers.length === 0 ? (
              <tr><td colSpan="6" className="p-8 text-center text-gray-500">No players found matching criteria.</td></tr>
            ) : (
              filteredPlayers.map(p => {
                const tl = threatColor(p.threat_level || (p.risk_score >= 60 ? 'High' : p.risk_score >= 40 ? 'Medium' : 'Low'))
                return (
                  <tr key={p.id} className="hover:bg-[#1E293B]/30 transition-colors group">
                    <td className="px-6 py-3">
                      <div className="flex items-center space-x-3">
                        <div className={clsx(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                          p.type === 'PERSON' ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-gray-800 border-gray-700 text-gray-400'
                        )}>
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-primary transition-colors cursor-pointer">{p.name}</div>
                          <div className="text-[10px] font-mono text-gray-500">ID: {p.id.substring(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-0.5 rounded bg-[#1E293B] text-gray-300 text-[9px] uppercase tracking-wider font-bold">
                        {p.type}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-300 font-mono">
                      {p.connections ?? 0}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-1.5 bg-[#030509] rounded-full overflow-hidden border border-[#1E293B]">
                          <div className={clsx("h-full", scoreColor(p.risk_score ?? 0))} style={{ width: `${Math.min(100, Math.max(0, p.risk_score ?? 0))}%` }}></div>
                        </div>
                        <span className={clsx("font-mono text-[10px]", (p.risk_score ?? 0) >= 70 ? 'text-danger' : (p.risk_score ?? 0) >= 40 ? 'text-amber-500' : 'text-success')}>
                          {Math.round(p.risk_score ?? 0)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className={clsx("px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border", tl.badge, tl.text)}>
                        {p.threat_level || (p.risk_score >= 60 ? 'High' : p.risk_score >= 40 ? 'Medium' : 'Low')}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button onClick={() => navigate('/network')} className="text-gray-500 hover:text-white p-1 rounded hover:bg-[#1E293B]">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
        <div className="p-4 border-t border-[#1E293B] bg-[#030509] flex justify-between items-center text-gray-500 text-[10px]">
          <span>Showing {filteredPlayers.length} of {players.length} entities</span>
          <div className="flex space-x-1">
            <button className="px-2 py-1 border border-[#1E293B] rounded hover:text-white disabled:opacity-50" disabled>Prev</button>
            <button className="px-2 py-1 border border-[#1E293B] rounded bg-[#1E293B] text-white">1</button>
            <button className="px-2 py-1 border border-[#1E293B] rounded hover:text-white disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}