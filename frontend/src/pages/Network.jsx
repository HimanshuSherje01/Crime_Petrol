import React from 'react'
import { Filter, X, Search, User, Phone, MapPin, Car, Building, FileText, Camera } from 'lucide-react'

export default function Network() {
  return (
    <div className="flex h-full -m-6 bg-[#0B0F1A]">
      {/* Left Sidebar - Filters */}
      <div className="w-72 border-r border-border p-6 flex flex-col overflow-y-auto bg-card/30">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white">Network Graph</h2>
          <button className="text-sm text-primary hover:underline">Reset</button>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Node Type</h3>
          <div className="space-y-2 text-sm">
            <FilterCheckbox label="People" count={12} icon={User} color="text-cyan-400" checked />
            <FilterCheckbox label="Phones" count={8} icon={Phone} color="text-purple-400" checked />
            <FilterCheckbox label="Locations" count={6} icon={MapPin} color="text-green-400" checked />
            <FilterCheckbox label="Vehicles" count={4} icon={Car} color="text-orange-400" checked />
            <FilterCheckbox label="Banks / Financial" count={5} icon={Building} color="text-amber-400" checked />
            <FilterCheckbox label="FIRs / Cases" count={3} icon={FileText} color="text-red-400" checked />
            <FilterCheckbox label="CCTV / Surveillance" count={7} icon={Camera} color="text-blue-400" checked />
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Date Range</h3>
          <div className="text-xs text-gray-500 mb-2">01 Jan 2024 - 31 Dec 2024</div>
          <div className="w-full h-1 bg-border rounded-full relative">
            <div className="absolute left-1/4 right-1/4 h-full bg-primary rounded-full"></div>
            <div className="absolute left-1/4 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-primary rounded-full"></div>
            <div className="absolute right-1/4 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white border-2 border-primary rounded-full"></div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Relationship Type</h3>
          <div className="space-y-2 text-sm">
            <FilterCheckbox label="Calls" count={23} />
            <FilterCheckbox label="Location Proximity" count={14} />
            <FilterCheckbox label="Financial Transfer" count={9} />
            <FilterCheckbox label="Co-travel" count={6} />
            <FilterCheckbox label="Communication" count={18} />
          </div>
        </div>
      </div>

      {/* Main Graph Area */}
      <div className="flex-1 relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-card/40 via-background to-background">
        
        {/* Placeholder for Graph */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-[600px] h-[400px]">
             {/* Center Node */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
               <div className="w-16 h-16 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.5)]">
                 <div className="w-8 h-8 rounded-full bg-cyan-400"></div>
               </div>
               <span className="mt-2 text-cyan-400 font-bold text-lg text-center bg-background/50 px-2 rounded">Ravi Kumar</span>
             </div>
             {/* Note: In a real implementation this would be Cytoscape.js. 
                 Since the user requested to see progress, I am placing a structural placeholder 
                 representing the graph layout. */}
             <div className="absolute top-1/4 left-1/4 w-4 h-4 rounded-full bg-purple-400 shadow-[0_0_15px_#c084fc]"></div>
             <div className="absolute top-3/4 left-1/4 w-4 h-4 rounded-full bg-orange-400 shadow-[0_0_15px_#fb923c]"></div>
             <div className="absolute top-1/4 right-1/4 w-4 h-4 rounded-full bg-red-400 shadow-[0_0_15px_#f87171]"></div>
             
             {/* Edges */}
             <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
               <line x1="50%" y1="50%" x2="25%" y2="25%" stroke="#c084fc" strokeWidth="2" />
               <line x1="50%" y1="50%" x2="25%" y2="75%" stroke="#fb923c" strokeWidth="2" />
               <line x1="50%" y1="50%" x2="75%" y2="25%" stroke="#f87171" strokeWidth="2" />
             </svg>
          </div>
        </div>

        {/* Top Right Badge */}
        <div className="absolute top-6 right-6">
          <div className="bg-success/20 border border-success/50 text-success px-4 py-2 rounded-full font-semibold flex items-center space-x-2">
            <CheckCircleIcon />
            <span>Ground Truth Match: 87%</span>
          </div>
        </div>

        {/* Bottom Left Stats */}
        <div className="absolute bottom-6 left-6 bg-card border border-border rounded-xl p-4 flex space-x-8 text-sm">
          <div>
            <div className="text-gray-500 uppercase text-[10px] tracking-wider">Nodes</div>
            <div className="text-2xl font-semibold text-white">45</div>
          </div>
          <div>
            <div className="text-gray-500 uppercase text-[10px] tracking-wider">Edges</div>
            <div className="text-2xl font-semibold text-white">78</div>
          </div>
          <div>
            <div className="text-gray-500 uppercase text-[10px] tracking-wider">Connected Components</div>
            <div className="text-2xl font-semibold text-white">3</div>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-6 right-6 bg-card border border-border rounded-xl p-4 flex items-center space-x-4 text-xs">
          <LegendItem color="bg-cyan-400" label="Person" />
          <LegendItem color="bg-purple-400" label="Phone" />
          <LegendItem color="bg-green-400" label="Location" />
          <LegendItem color="bg-orange-400" label="Vehicle" />
          <LegendItem color="bg-amber-400" label="Bank / Financial" />
          <LegendItem color="bg-red-400" label="FIR / Case" />
          <LegendItem color="bg-blue-400" label="CCTV" />
        </div>
      </div>

      {/* Right Sidebar - Node Details */}
      <div className="w-80 border-l border-border bg-card/50 flex flex-col relative">
        <button className="absolute top-4 right-4 text-gray-500 hover:text-white">
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-6 border-b border-border">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-400">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <span>Ravi Kumar</span>
              </h2>
              <p className="text-xs text-gray-500">ID P-00123 <span className="ml-2 px-1.5 py-0.5 rounded bg-cyan-900/50 text-cyan-400 border border-cyan-800">Person</span></p>
            </div>
          </div>
          
          <div className="flex space-x-4 text-sm border-b border-border">
            <button className="text-primary border-b-2 border-primary pb-2 font-medium">Overview</button>
            <button className="text-gray-500 pb-2 hover:text-gray-300">Connections (12)</button>
            <button className="text-gray-500 pb-2 hover:text-gray-300">Activity</button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          <div className="grid grid-cols-3 gap-2">
            <div className="text-gray-500">Full Name</div>
            <div className="col-span-2 text-white">Ravi Kumar</div>
            
            <div className="text-gray-500">Aliases</div>
            <div className="col-span-2 text-white">R.K. | Ravi Bhai | Sonu</div>
            
            <div className="text-gray-500">Known Addresses</div>
            <div className="col-span-2 text-white">Karol Bagh, New Delhi<br/>Meerut, Uttar Pradesh</div>
            
            <div className="text-gray-500 mt-2">Phone Numbers</div>
            <div className="col-span-2 text-white mt-2 space-y-1">
              <div>+91 98765 43210</div>
              <div>+91 98111 22334</div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-500">Risk Score</span>
              <span className="text-danger font-bold">78 / 100</span>
            </div>
            <div className="w-full h-2 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-danger w-[78%]"></div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 items-center">
            <div className="text-gray-500">Status</div>
            <div className="col-span-2 text-danger flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-danger"></div>
              <span>High Interest</span>
            </div>
            
            <div className="text-gray-500">Tags</div>
            <div className="col-span-2 flex flex-wrap gap-1 mt-1">
              <span className="px-2 py-1 rounded bg-border text-xs text-gray-300">Organized Crime</span>
              <span className="px-2 py-1 rounded bg-border text-xs text-gray-300">Repeat Offender</span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3 flex justify-between">
              Top Connections <span className="text-primary text-xs cursor-pointer hover:underline">View All</span>
            </h3>
            <div className="space-y-3">
              <ConnectionRow icon={Phone} name="+91 98765 43210" type="Phone" interactions={24} color="text-purple-400" />
              <ConnectionRow icon={User} name="Amit Shah" type="Person" interactions={18} color="text-cyan-400" />
              <ConnectionRow icon={FileText} name="FIR-1023" type="Case" interactions={12} color="text-red-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FilterCheckbox({ label, count, icon: Icon, color, checked }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <div className="flex items-center space-x-2">
        <input type="checkbox" defaultChecked={checked} className="rounded bg-background border-border text-primary focus:ring-primary" />
        {Icon && <Icon className={`w-4 h-4 ${color}`} />}
        <span className="text-gray-300 group-hover:text-white transition-colors">{label}</span>
      </div>
      <span className="text-gray-500 text-xs">{count}</span>
    </label>
  )
}

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center space-x-1.5">
      <div className={`w-2.5 h-2.5 rounded-full ${color}`}></div>
      <span className="text-gray-400">{label}</span>
    </div>
  )
}

function ConnectionRow({ icon: Icon, name, type, interactions, color }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center space-x-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-gray-300">{name}</span>
      </div>
      <span className="text-gray-500">{interactions} interactions</span>
    </div>
  )
}

function CheckCircleIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
