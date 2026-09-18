import React, { useEffect } from 'react'
import { Loader2, MoreHorizontal, Clock, FileIcon } from 'lucide-react'
import { useStore } from '../store/useStore'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

export default function RecentAnalyses() {
  const {
    cases, selectedCase, selectCase, recentAnalyses, fetchAnalyses, analyzeState, dashboardStats
  } = useStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (selectedCase) {
      fetchAnalyses(selectedCase)
    }
  }, [selectedCase, fetchAnalyses])

  return (
    <div className="flex flex-col h-full bg-[#050914] text-[#94A3B8] p-4 font-sans text-xs">

      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-xl font-bold text-white">Recent Analyses</h1>
            <span className="bg-primary/10 text-primary border border-primary/30 px-2 py-0.5 rounded text-[10px] font-medium tracking-wide uppercase flex items-center space-x-1">
              <Clock className="w-3 h-3" /><span>History</span>
            </span>
          </div>
          <p className="text-gray-500 text-[11px]">Every extraction and relationship run across the selected case.</p>
        </div>

        <div className="flex items-center space-x-3">
          <label className="text-[10px] uppercase tracking-wider text-gray-500">Case</label>
          <select
            value={selectedCase || ''}
            onChange={e => selectCase(e.target.value)}
            className="bg-[#0A0F1C] border border-border text-white text-xs rounded px-2 py-1.5 min-w-[260px] cursor-pointer"
          >
            {cases.length === 0 && <option value="">No cases available on server</option>}
            {cases.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-hidden glass-panel rounded-lg flex flex-col">
        <div className="flex justify-between items-center px-4 py-3 border-b border-border/50 bg-[#0A0F1C]">
          <h3 className="text-white font-medium">Run History — {selectedCase || 'No case'}</h3>
          <span className="text-gray-500 text-[11px]">
            {recentAnalyses.length} run{(recentAnalyses.length === 1 ? '' : 's')}
            {dashboardStats.nodes > 0 && ` · ${dashboardStats.nodes} entities extracted`}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead className="text-gray-500 border-b border-border/50 sticky top-0 bg-[#0A0F1C] z-10">
              <tr>
                <th className="px-4 py-3 font-normal">Run ID</th>
                <th className="px-4 py-3 font-normal">Date & Time</th>
                <th className="px-4 py-3 font-normal">Files</th>
                <th className="px-4 py-3 font-normal">Modules</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3 font-normal">Findings</th>
                <th className="px-4 py-3 font-normal">Duration</th>
                <th className="px-4 py-3 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {recentAnalyses.length === 0 && analyzeState !== 'loading' && (
                <tr>
                  <td colSpan="8" className="py-16 text-center">
                    <Clock className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                    <p className="text-gray-500">No analyses yet for this case.</p>
                    <p className="text-gray-700 text-[10px] mt-1">Run an analysis from Import & Analyze or upload a folder.</p>
                    <button
                      onClick={() => navigate('/case')}
                      className="mt-4 px-4 py-2 bg-primary text-black font-semibold rounded hover:bg-primary-hover transition-colors cursor-pointer"
                    >
                      Go to Import & Analyze
                    </button>
                  </td>
                </tr>
              )}
              {recentAnalyses.map(r => (
                <tr key={r.id} className="hover:bg-border/10 transition-colors">
                  <td className="px-4 py-3 text-gray-300 font-mono">{r.id}</td>
                  <td className="px-4 py-3">{r.date}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center space-x-1.5">
                      <FileIcon className="w-3 h-3 text-gray-500 shrink-0" />
                      <span>{r.files ?? r.files_processed ?? '—'}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">All</td>
                  <td className="px-4 py-3">
                    <span className={clsx("flex items-center space-x-1.5",
                      r.status === 'Running' ? 'text-primary' :
                      r.status === 'Completed' ? 'text-success' :
                      r.status === 'Failed' ? 'text-danger' : 'text-gray-400')}>
                      {r.status === 'Running' && <Loader2 className="w-3 h-3 animate-spin" />}
                      {r.status !== 'Running' && (
                        <span className={clsx("w-1.5 h-1.5 rounded-full",
                          r.status === 'Completed' ? 'bg-success' : r.status === 'Failed' ? 'bg-danger' : 'bg-gray-400')}></span>
                      )}
                      <span>{r.status}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 max-w-md truncate">{r.findings || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{r.duration || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => navigate('/network')}
                      className="text-primary cursor-pointer hover:underline"
                    >
                      Open Graph
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-[10px] text-gray-700">
        <p>Analyses persist on the server database for each case.</p>
        <button className="text-gray-500 hover:text-white flex items-center space-x-1 cursor-pointer">
          <MoreHorizontal className="w-3 h-3" /><span>Export log</span>
        </button>
      </div>
    </div>
  )
}