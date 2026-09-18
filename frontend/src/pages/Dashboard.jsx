import React from 'react'
import { Activity, Users, AlertTriangle, Database } from 'lucide-react'

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard title="Total Entities" value="1,248" icon={Database} color="text-primary" />
        <KPICard title="Key Players" value="12" icon={Users} color="text-amber-400" />
        <KPICard title="Active Alerts" value="5" icon={AlertTriangle} color="text-danger" />
        <KPICard title="Ground Truth Match" value="87%" icon={Activity} color="text-success" />
      </div>
      
      {/* Placeholder for Dashboard Charts / Top Players Table */}
      <div className="h-96 bg-card border border-border rounded-xl flex items-center justify-center text-gray-500">
        Dashboard Widgets (Top Communities, Alert Feed) goes here
      </div>
    </div>
  )
}

function KPICard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-card border border-border p-6 rounded-xl flex items-center space-x-4">
      <div className={`p-3 rounded-lg bg-background ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
      </div>
    </div>
  )
}
