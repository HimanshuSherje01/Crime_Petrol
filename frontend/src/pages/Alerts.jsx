import React, { useState } from 'react'
import { AlertTriangle, Filter, CheckCircle2, Search, ArrowRight, ShieldAlert, Activity, ChevronDown } from 'lucide-react'
import { useStore } from '../store/useStore'
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'

export default function Alerts() {
  const { alerts, selectedCase, fetchEntityDetails } = useStore()
  const navigate = useNavigate()
  
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  const filteredAlerts = alerts.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase())
    const matchesSev = filter === 'ALL' || a.severity.toUpperCase() === filter
    return matchesSearch && matchesSev
  })

  return (
    <div className="bg-[#050914] min-h-full p-4 font-sans text-xs flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-danger" />
            <span>Active Alerts {selectedCase ? `(Case ${selectedCase})` : ''}</span>
          </h2>
          <p className="text-gray-500 mt-0.5">Automated threat detections and anomalies.</p>
        </div>
        
        <div className="flex space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search alerts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-[#0A0F1C] border border-[#1E293B] rounded text-white focus:border-primary/50 focus:outline-none transition-colors w-64"
            />
          </div>

          <div className="relative group cursor-pointer">
            <button className="flex items-center space-x-2 bg-[#0A0F1C] border border-[#1E293B] text-gray-400 px-3 py-1.5 rounded hover:text-white transition-colors">
              <Filter className="w-4 h-4" />
              <span>{filter === 'ALL' ? 'All Severities' : filter}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            <div className="absolute right-0 top-full mt-1 w-36 bg-[#0A0F1C] border border-[#1E293B] rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-10 py-1">
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(t => (
                <div 
                  key={t}
                  onClick={() => setFilter(t)}
                  className="px-3 py-1.5 hover:bg-primary/10 hover:text-primary text-gray-400 cursor-pointer transition-colors"
                >
                  {t === 'ALL' ? 'All Severities' : t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
        {filteredAlerts.length === 0 ? (
          <div className="col-span-full p-12 text-center border border-dashed border-[#1E293B] rounded-xl text-gray-500 bg-[#0A0F1C]/50">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-3 text-success/50" />
            <p>No alerts matching your criteria.</p>
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const sev = alert.severity?.toLowerCase()
            const colors = {
              critical: 'bg-danger/10 border-danger/30 text-danger shadow-[0_0_15px_rgba(239,68,68,0.1)]',
              high: 'bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]',
              medium: 'bg-primary/10 border-primary/30 text-primary',
              low: 'bg-gray-800 border-gray-700 text-gray-400'
            }
            const badgeColor = colors[sev] || colors.medium

            return (
              <div key={alert.id} className="bg-[#0A0F1C] border border-[#1E293B] rounded-xl flex flex-col group hover:border-primary/50 transition-colors h-full">
                <div className="p-4 border-b border-[#1E293B]/50 flex justify-between items-start">
                  <span className={clsx("px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border", badgeColor)}>
                    {alert.severity}
                  </span>
                  <span className="text-[10px] text-gray-600 font-mono flex items-center">
                    <Activity className="w-3 h-3 mr-1" />
                    ID: {alert.id.substring(0,6)}
                  </span>
                </div>
                
                <div className="p-4 flex-1">
                  <h3 className="text-sm font-bold text-white mb-2 leading-tight group-hover:text-primary transition-colors">
                    {alert.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed text-[11px]">
                    {alert.description}
                  </p>
                </div>

                <div className="p-3 border-t border-[#1E293B]/50 bg-[#030509] rounded-b-xl flex justify-between items-center">
                  <span className="text-[10px] text-gray-500">System generated</span>
                  <button 
                    onClick={() => navigate('/network')}
                    className="flex items-center space-x-1 text-primary hover:text-white transition-colors text-[11px] font-medium"
                  >
                    <span>Investigate</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
