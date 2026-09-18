import React, { useState, useEffect } from 'react'
import { Search, Filter, ShieldAlert, ChevronDown, MoreHorizontal, Download, FileText, Car, MapPin, Building, Camera, MessageSquare } from 'lucide-react'
import { useStore } from '../store/useStore'
import clsx from 'clsx'

const ICONS = {
  VEHICLE: Car,
  LOCATION: MapPin,
  BANK: Building,
  CCTV: Camera,
  FIR: FileText,
  COMMUNICATION: MessageSquare
}

export default function EntityList({ type, title, subtitle }) {
  const { fetchEntitiesByType } = useStore()
  const [entities, setEntities] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    fetchEntitiesByType(type).then(data => {
      if (active) {
        setEntities(data || [])
        setLoading(false)
      }
    })
    return () => { active = false }
  }, [type, fetchEntitiesByType])

  const filteredEntities = entities.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const Icon = ICONS[type] || FileText

  return (
    <div className="bg-[#050914] min-h-full p-4 font-sans text-xs flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Icon className="w-5 h-5 text-primary" />
            <span>{title}</span>
          </h2>
          <p className="text-gray-500 mt-0.5">{subtitle}</p>
        </div>
        
        <div className="flex space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder={`Search ${title.toLowerCase()}...`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-[#0A0F1C] border border-[#1E293B] rounded text-white focus:border-primary/50 focus:outline-none transition-colors w-64"
            />
          </div>
          
          <button className="flex items-center space-x-2 bg-[#0A0F1C] border border-[#1E293B] text-gray-400 px-3 py-1.5 rounded hover:text-white transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="flex-1 bg-[#0A0F1C] border border-[#1E293B] rounded-lg overflow-hidden flex flex-col">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading {title.toLowerCase()}...</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-[#030509] text-gray-500 border-b border-[#1E293B] sticky top-0">
              <tr>
                <th className="px-6 py-3 font-medium uppercase tracking-wider text-[10px]">Name / Identifier</th>
                <th className="px-6 py-3 font-medium uppercase tracking-wider text-[10px]">Type</th>
                <th className="px-6 py-3 font-medium uppercase tracking-wider text-[10px]">Case ID</th>
                <th className="px-6 py-3 font-medium uppercase tracking-wider text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
              {filteredEntities.length === 0 ? (
                <tr><td colSpan="4" className="p-8 text-center text-gray-500">No records found.</td></tr>
              ) : (
                filteredEntities.map(e => (
                  <tr key={e.id} className="hover:bg-[#1E293B]/30 transition-colors group cursor-pointer">
                    <td className="px-6 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border bg-primary/5 border-primary/20 text-primary">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-primary transition-colors">{e.name}</div>
                          <div className="text-[10px] font-mono text-gray-500">ID: {e.id.substring(0,8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-0.5 rounded bg-[#1E293B] text-gray-300 text-[9px] uppercase tracking-wider font-bold">
                        {e.type}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-300 font-mono text-[11px]">
                      {e.case_id}
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
        )}
        <div className="p-4 border-t border-[#1E293B] bg-[#030509] flex justify-between items-center text-gray-500 text-[10px] mt-auto">
          <span>Showing {filteredEntities.length} records</span>
          <div className="flex space-x-1">
            <button className="px-2 py-1 border border-[#1E293B] rounded bg-[#1E293B] text-white">1</button>
          </div>
        </div>
      </div>
    </div>
  )
}
