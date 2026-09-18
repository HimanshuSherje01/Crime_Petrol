import React, { useState } from 'react'
import { Search as SearchIcon, User, Phone, MapPin } from 'lucide-react'

export default function Search() {
  const [query, setQuery] = useState('')

  return (
    <div className="max-w-4xl mx-auto space-y-6 pt-10">
      <div className="relative">
        <SearchIcon className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
        <input 
          type="text" 
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search entities, FIRs, locations..." 
          className="w-full bg-card border-2 border-border rounded-2xl pl-14 pr-6 py-4 text-lg focus:outline-none focus:border-primary transition-colors text-white shadow-xl"
        />
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-gray-400 mb-4">Recent Searches</h3>
        <div className="space-y-4">
          <SearchResult icon={User} name="Ravi Kumar" type="Person" color="text-cyan-400" />
          <SearchResult icon={Phone} name="+91 98765 43210" type="Phone" color="text-purple-400" />
          <SearchResult icon={MapPin} name="Dharampeth" type="Location" color="text-green-400" />
        </div>
      </div>
    </div>
  )
}

function SearchResult({ icon: Icon, name, type, color }) {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-background/50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-border">
      <div className="flex items-center space-x-4">
        <div className={`p-2 rounded-lg bg-background ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-white font-medium">{name}</div>
          <div className="text-gray-500 text-xs">{type}</div>
        </div>
      </div>
      <button className="text-primary text-sm hover:underline">View Profile</button>
    </div>
  )
}
