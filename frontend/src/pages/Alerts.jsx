import React from 'react'
import { Bell, AlertTriangle } from 'lucide-react'

export default function Alerts() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
        <Bell className="w-6 h-6 text-primary" />
        <span>System Alerts</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AlertCard severity="Critical" title="High Betweenness Node Detected" desc="Node Ravi Kumar acts as a critical broker in the network." time="10m ago" />
        <AlertCard severity="High" title="Suspicious Circular Pattern" desc="Detected a circular financial transfer involving 4 entities." time="1h ago" />
        <AlertCard severity="Medium" title="Highly Active Phone" desc="Entity +91 98765 43210 has unusually high connections." time="2h ago" />
      </div>
    </div>
  )
}

function AlertCard({ severity, title, desc, time }) {
  const color = severity === 'Critical' ? 'text-danger border-danger/30 bg-danger/10' :
                severity === 'High' ? 'text-amber-400 border-amber-400/30 bg-amber-400/10' :
                'text-primary border-primary/30 bg-primary/10'
                
  return (
    <div className={`border p-6 rounded-xl relative overflow-hidden ${color.split(' ')[1]} bg-card`}>
      <div className={`absolute top-0 left-0 w-1 h-full ${severity === 'Critical' ? 'bg-danger' : severity === 'High' ? 'bg-amber-400' : 'bg-primary'}`}></div>
      
      <div className="flex justify-between items-start mb-4">
        <div className={`px-2 py-1 rounded text-xs font-bold ${color.split(' ')[2]} ${color.split(' ')[0]}`}>
          {severity}
        </div>
        <span className="text-gray-500 text-xs">{time}</span>
      </div>
      
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm mb-4">{desc}</p>
      
      <button className="text-sm font-medium hover:underline text-white flex items-center space-x-1">
        <span>Investigate</span>
        <span>→</span>
      </button>
    </div>
  )
}
