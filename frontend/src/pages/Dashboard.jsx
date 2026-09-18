import React from 'react'
import { Activity, Users, AlertTriangle, Database, Loader2, FolderOpen, ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react'
import { useStore } from '../store/useStore'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

export default function Dashboard() {
  const { selectedCase, players, alerts, graphData, dashboardStats, loading } = useStore()
  const navigate = useNavigate()

  const entityCount = graphData.nodes.length
  const playerCount = players.length
  const alertCount = alerts.length
  const gtMatch = dashboardStats.gtMatch

  const criticalAlerts = alerts.filter(a => a.severity?.toLowerCase() === 'critical')

  if (!selectedCase) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4 bg-[#050914]">
        <FolderOpen className="w-16 h-16 text-gray-800" />
        <h2 className="text-xl font-bold text-white">No Case Selected</h2>
        <p className="text-gray-500 text-sm max-w-sm">Select a case from the workspace dropdown to view the intelligence dashboard.</p>
        <button 
          onClick={() => navigate('/case')}
          className="mt-4 bg-primary/10 border border-primary/30 text-primary px-4 py-2 rounded-lg text-xs font-medium hover:bg-primary/20 transition-colors"
        >
          Go to Import & Analyze
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 bg-[#050914]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-gray-500 text-sm">Aggregating intelligence data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 bg-[#050914] min-h-full p-4 font-sans text-xs">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-bold text-white">Dashboard Overview</h2>
          <p className="text-gray-500 mt-0.5">High-level metrics and active intelligence for Case: {selectedCase}</p>
        </div>
        <div className="flex space-x-2">
          <button className="bg-[#0A0F1C] border border-[#1E293B] text-gray-400 px-3 py-1.5 rounded hover:text-white transition-colors">Export Report</button>
          <button onClick={() => navigate('/network')} className="bg-primary text-black font-semibold px-3 py-1.5 rounded hover:bg-primary-hover transition-colors">View Network Graph</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Total Entities" value={entityCount || '—'} trend="+12%" icon={Database} color="text-primary" />
        <KPICard title="Key Players" value={playerCount || '—'} trend="+2%" icon={Users} color="text-amber-500" />
        <KPICard title="Active Alerts" value={alertCount || '—'} trend="-5%" isNegative icon={AlertTriangle} color="text-danger" />
        <KPICard title="Ground Truth Match" value={gtMatch ? `${gtMatch}%` : '—'} trend="+1.2%" icon={Activity} color="text-success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Top Players Table */}
        <div className="lg:col-span-2 bg-[#0A0F1C] border border-[#1E293B] rounded-lg flex flex-col">
          <div className="p-4 border-b border-[#1E293B] flex justify-between items-center">
            <h3 className="font-semibold text-white flex items-center space-x-2">
              <Users className="w-4 h-4 text-amber-500" />
              <span>High Value Targets (HVTs)</span>
            </h3>
            <button onClick={() => navigate('/players')} className="text-primary text-[11px] hover:underline">View All</button>
          </div>
          
          <div className="flex-1 p-0">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-[#030509] text-gray-500 border-b border-[#1E293B]">
                <tr>
                  <th className="px-4 py-2 font-medium">Rank</th>
                  <th className="px-4 py-2 font-medium">Entity Name</th>
                  <th className="px-4 py-2 font-medium">Classification</th>
                  <th className="px-4 py-2 font-medium text-right">Risk Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/50">
                {players.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500">No key players identified yet.</td>
                  </tr>
                ) : (
                  players.slice(0, 6).map((p, i) => (
                    <tr key={p.id} className="hover:bg-[#1E293B]/30 transition-colors cursor-pointer" onClick={() => navigate('/players')}>
                      <td className="px-4 py-2.5 text-gray-500 font-mono">{(i + 1).toString().padStart(2, '0')}</td>
                      <td className="px-4 py-2.5 text-white font-medium flex items-center space-x-2">
                        <span>{p.name}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="px-1.5 py-0.5 rounded bg-[#1E293B] text-gray-300 capitalize text-[9px] uppercase tracking-wider">{p.type}</span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <div className="w-16 h-1 bg-[#030509] rounded-full overflow-hidden border border-[#1E293B]">
                            <div className="h-full bg-danger w-[85%]"></div>
                          </div>
                          <span className="text-danger font-mono font-medium">85</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Alerts List */}
        <div className="bg-[#0A0F1C] border border-[#1E293B] rounded-lg flex flex-col">
          <div className="p-4 border-b border-[#1E293B] flex justify-between items-center">
            <h3 className="font-semibold text-white flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-danger" />
              <span>Priority Alerts</span>
            </h3>
            {criticalAlerts.length > 0 && (
              <span className="bg-danger/20 text-danger border border-danger/30 px-1.5 py-0.5 rounded text-[9px] font-bold">
                {criticalAlerts.length} CRITICAL
              </span>
            )}
          </div>
          
          <div className="p-4 space-y-3 overflow-y-auto max-h-[300px] custom-scrollbar">
            {alerts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No alerts detected.</p>
            ) : (
              alerts.slice(0, 5).map(a => {
                const sev = a.severity?.toLowerCase()
                const badgeColor = sev === 'critical' ? 'bg-danger/20 text-danger border-danger/30' : 
                                   sev === 'high' ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' : 
                                   'bg-primary/20 text-primary border-primary/30'
                
                return (
                  <div key={a.id} className="bg-[#030509] border border-[#1E293B] p-3 rounded flex flex-col group cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate('/alerts')}>
                    <div className="flex justify-between items-start mb-1.5">
                      <span className={clsx("px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border", badgeColor)}>
                        {a.severity}
                      </span>
                      <span className="text-gray-600 text-[10px]">Just now</span>
                    </div>
                    <p className="text-white font-medium text-[11px] leading-tight mb-1 group-hover:text-primary transition-colors">{a.title}</p>
                    <p className="text-gray-500 text-[10px] line-clamp-2 leading-snug">{a.description}</p>
                  </div>
                )
              })
            )}
          </div>
          
          <div className="p-3 border-t border-[#1E293B] mt-auto">
            <button onClick={() => navigate('/alerts')} className="w-full text-center text-primary text-[11px] hover:underline font-medium">View All Alerts</button>
          </div>
        </div>

      </div>
    </div>
  )
}

function KPICard({ title, value, icon: Icon, color, trend, isNegative }) {
  const trendColor = isNegative ? 'text-danger' : 'text-success'
  const TrendIcon = isNegative ? ArrowDownRight : ArrowUpRight
  
  return (
    <div className="bg-[#0A0F1C] border border-[#1E293B] p-4 rounded-lg flex flex-col justify-between">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{title}</h3>
        <Icon className={clsx("w-4 h-4", color)} />
      </div>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold text-white">{value}</p>
        <div className={clsx("flex items-center text-[10px] font-medium", trendColor)}>
          <TrendIcon className="w-3 h-3 mr-0.5" />
          <span>{trend}</span>
        </div>
      </div>
    </div>
  )
}
