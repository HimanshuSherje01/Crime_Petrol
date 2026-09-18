import React, { useState } from 'react'
import { Search, Filter, ShieldAlert, User, ChevronDown, MoreHorizontal, Download } from 'lucide-react'
import { useStore } from '../store/useStore'
import clsx from 'clsx'

export default function Players() {
  const { players, selectedCase } = useStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('ALL')

  const filteredPlayers = players.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'ALL' || p.type === filterType
    return matchesSearch && matchesType
  })

  return (
    <div className="bg-[#050914] min-h-full p-4 font-sans text-xs flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <User className="w-5 h-5 text-primary" />
            <span>Key Players {selectedCase ? `(Case ${selectedCase})` : ''}</span>
          </h2>
          <p className="text-gray-500 mt-0.5">Identified entities, suspects, and persons of interest.</p>
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
              {['ALL', 'PERSON', 'PHONE', 'VEHICLE'].map(t => (
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

          <button className="flex items-center space-x-2 bg-[#0A0F1C] border border-[#1E293B] text-gray-400 px-3 py-1.5 rounded hover:text-white transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
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
              <th className="px-6 py-3 font-medium uppercase tracking-wider text-[10px]">Threat Level</th>
              <th className="px-6 py-3 font-medium uppercase tracking-wider text-[10px] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E293B]">
            {filteredPlayers.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500">No players found matching criteria.</td></tr>
            ) : (
              filteredPlayers.map(p => (
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
                        <div className="text-[10px] font-mono text-gray-500">ID: {p.id.substring(0,8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span className="px-2 py-0.5 rounded bg-[#1E293B] text-gray-300 text-[9px] uppercase tracking-wider font-bold">
                      {p.type}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-300 font-mono">
                    {Math.floor(Math.random() * 50) + 1} {/* Mocking connection count for UI richness */}
                  </td>
                  <td className="px-6 py-3">
                    {p.type === 'PERSON' ? (
                      <div className="flex items-center space-x-2">
                        <ShieldAlert className="w-4 h-4 text-danger" />
                        <span className="text-danger font-bold text-[10px] uppercase tracking-wider">High</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button className="text-gray-500 hover:text-white p-1 rounded hover:bg-[#1E293B]">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
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
