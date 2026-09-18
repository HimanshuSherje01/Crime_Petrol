import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Filter, X, Search, User, Phone, MapPin, Car, Building, FileText, Camera, Loader2, Maximize2, RotateCw, ZoomIn, Hand, RotateCcw, ChevronDown, CheckCircle2 } from 'lucide-react'
import ForceGraph3D from 'react-force-graph-3d'
import { useStore } from '../store/useStore'
import clsx from 'clsx'

const NODE_COLORS = {
  PERSON: '#06B6D4',
  PHONE: '#A855F7',
  LOCATION: '#10B981',
  VEHICLE: '#F97316',
  BANK: '#F59E0B',
  FIR: '#EF4444',
  CCTV: '#3B82F6',
  DEFAULT: '#94A3B8'
}

const NODE_ICONS = {
  PERSON: User,
  PHONE: Phone,
  LOCATION: MapPin,
  VEHICLE: Car,
  BANK: Building,
  FIR: FileText,
  CCTV: Camera,
  DEFAULT: Search
}

const NODE_TYPES_CONFIG = [
  { id: 'PERSON', label: 'People', icon: User, color: 'text-[#06B6D4]' },
  { id: 'PHONE', label: 'Phones', icon: Phone, color: 'text-[#A855F7]' },
  { id: 'LOCATION', label: 'Locations', icon: MapPin, color: 'text-[#10B981]' },
  { id: 'VEHICLE', label: 'Vehicles', icon: Car, color: 'text-[#F97316]' },
  { id: 'BANK', label: 'Banks / Financial', icon: Building, color: 'text-[#F59E0B]' },
  { id: 'FIR', label: 'FIRs / Cases', icon: FileText, color: 'text-[#EF4444]' },
  { id: 'CCTV', label: 'CCTV', icon: Camera, color: 'text-[#3B82F6]' },
]

export default function Network() {
  const { graphData, dashboardStats, fetchEntityDetails } = useStore()
  const [selectedNode, setSelectedNode] = useState(null)
  const [nodeDetails, setNodeDetails] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [visibleTypes, setVisibleTypes] = useState(new Set(NODE_TYPES_CONFIG.map(t => t.id)))
  
  const graphRef = useRef()
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const containerRef = useRef()

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        setDimensions({
          width: entries[0].contentRect.width,
          height: entries[0].contentRect.height
        })
      }
    })
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const gData = useMemo(() => {
    if (!graphData || !graphData.nodes) return { nodes: [], links: [] }
    
    const filteredNodes = graphData.nodes
      .filter(n => visibleTypes.has(n.data.type?.toUpperCase()))
      .map(n => ({
        id: n.data.id,
        name: n.data.label,
        group: n.data.type?.toUpperCase(),
        color: NODE_COLORS[n.data.type?.toUpperCase()] || NODE_COLORS.DEFAULT,
        val: 1.5
      }))
      
    const nodeIds = new Set(filteredNodes.map(n => n.id))
    
    const filteredLinks = graphData.edges
      .filter(e => nodeIds.has(e.data.source) && nodeIds.has(e.data.target))
      .map(e => ({
        source: e.data.source,
        target: e.data.target,
        label: e.data.label,
        weight: e.data.weight || 1
      }))

    return { nodes: filteredNodes, links: filteredLinks }
  }, [graphData, visibleTypes])

  const toggleType = (type) => {
    setVisibleTypes(prev => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  const handleNodeClick = useCallback(async (node) => {
    const distance = 40
    const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z)
    graphRef.current?.cameraPosition(
      { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
      node,
      3000
    )

    setSelectedNode(node)
    setLoadingDetails(true)
    const details = await fetchEntityDetails(node.id)
    setNodeDetails(details)
    setLoadingDetails(false)
  }, [fetchEntityDetails])

  const handleResetCamera = useCallback(() => {
    graphRef.current?.cameraPosition(
      { x: 0, y: 0, z: 200 },
      { x: 0, y: 0, z: 0 },
      2000
    )
  }, [])

  // Right sidebar active tab
  const [activeTab, setActiveTab] = useState('Overview')

  return (
    <div className="flex h-full bg-[#050914] text-xs font-sans">
      
      {/* Left Sidebar */}
      <div className="w-[280px] bg-[#0A0F1C] border-r border-[#1E293B] p-4 flex flex-col shrink-0 overflow-y-auto custom-scrollbar z-10 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-white uppercase tracking-wider text-[11px]">Network Graph</h2>
          <button className="text-primary hover:underline text-[10px]" onClick={() => setVisibleTypes(new Set(NODE_TYPES_CONFIG.map(t=>t.id)))}>Reset</button>
        </div>

        <div className="mb-6">
          <h3 className="text-[10px] font-semibold text-gray-500 mb-3 uppercase tracking-widest">Node Type</h3>
          <div className="space-y-2">
            {NODE_TYPES_CONFIG.map(type => {
              // Count raw occurrences in original data for the label
              const count = graphData?.nodes?.filter(n => n.data.type?.toUpperCase() === type.id).length || 0
              return (
                <FilterCheckbox 
                  key={type.id}
                  label={type.label} 
                  count={count} 
                  icon={type.icon} 
                  color={type.color} 
                  checked={visibleTypes.has(type.id)}
                  onChange={() => toggleType(type.id)}
                />
              )
            })}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-[10px] font-semibold text-gray-500 mb-3 uppercase tracking-widest">Date Range</h3>
          <div className="text-[9px] text-gray-400 mb-2 font-mono flex justify-between">
            <span>01 JAN 2024</span>
            <span>31 DEC 2024</span>
          </div>
          <div className="w-full h-1 bg-[#1E293B] rounded-full relative mt-3">
            <div className="absolute left-1/4 right-1/4 h-full bg-primary rounded-full"></div>
            <div className="absolute left-1/4 top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border border-primary rounded-full cursor-pointer hover:scale-125 transition-transform"></div>
            <div className="absolute right-1/4 top-1/2 -translate-y-1/2 translate-x-1/2 w-2.5 h-2.5 bg-white border border-primary rounded-full cursor-pointer hover:scale-125 transition-transform"></div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-[10px] font-semibold text-gray-500 mb-3 uppercase tracking-widest">Relationship Type</h3>
          <div className="space-y-2">
            <FilterCheckbox label="Calls" count={71} icon={null} checked />
            <FilterCheckbox label="Location Proximity" count={46} icon={null} checked />
            <FilterCheckbox label="Financial Transfer" count={38} icon={null} checked />
            <FilterCheckbox label="Co-travel" count={24} icon={null} checked />
            <FilterCheckbox label="Communication" count={52} icon={null} checked />
            <FilterCheckbox label="Common Event" count={29} icon={null} checked />
          </div>
        </div>

        <div>
          <button className="flex items-center justify-between w-full text-[10px] font-semibold text-gray-500 uppercase tracking-widest hover:text-white transition-colors">
            <span>Advanced Filters</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative flex flex-col min-w-0 bg-[#000000]">
        
        {/* Top Graph Toolbar */}
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start pointer-events-none">
          <div className="flex bg-[#0A0F1C]/80 border border-[#1E293B] rounded-lg p-1 backdrop-blur-md pointer-events-auto">
            {['3D Graph', 'Link Analysis', 'Timeline View', 'Geospatial View', 'Community Detection'].map(tab => (
              <button 
                key={tab} 
                className={clsx(
                  "px-3 py-1.5 rounded-md text-[11px] transition-colors",
                  tab === '3D Graph' ? "bg-primary/20 text-primary font-medium" : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 pointer-events-auto">
            {dashboardStats?.gtMatch !== undefined && (
              <div className="bg-success/10 border border-success/30 text-success px-3 py-1.5 rounded-lg text-[11px] font-medium flex items-center space-x-1.5 backdrop-blur-md">
                <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></span>
                <span>Ground Truth: {dashboardStats.gtMatch}%</span>
              </div>
            )}
            <button className="bg-[#0A0F1C]/80 border border-[#1E293B] p-1.5 rounded-lg text-gray-400 hover:text-white backdrop-blur-md">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3D Graph */}
        <div className="flex-1 relative" ref={containerRef}>
          {gData.nodes.length > 0 ? (
            <ForceGraph3D
              ref={graphRef}
              width={dimensions.width}
              height={dimensions.height}
              graphData={gData}
              nodeLabel="name"
              nodeColor="color"
              nodeResolution={16}
              linkColor={() => 'rgba(255,255,255,0.15)'}
              linkWidth={0.5}
              onNodeClick={handleNodeClick}
              backgroundColor="#000000"
              showNavInfo={false}
              enableNodeDrag={false}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No graph data available matching filters.
            </div>
          )}
        </div>

        {/* Right Toolbar Controls */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col bg-[#0A0F1C]/80 border border-[#1E293B] rounded-lg p-1 backdrop-blur-md space-y-1">
          <ToolbarButton icon={RotateCw} label="Rotate" />
          <ToolbarButton icon={ZoomIn} label="Zoom" />
          <ToolbarButton icon={Hand} label="Pan" />
          <div className="h-px bg-[#1E293B] w-full my-1"></div>
          <ToolbarButton icon={RotateCcw} label="Reset" onClick={handleResetCamera} />
        </div>

        {/* Bottom Legend */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
          <div className="bg-[#0A0F1C]/80 border border-[#1E293B] rounded-lg p-3 flex space-x-6 backdrop-blur-md pointer-events-auto">
            <div>
              <div className="text-gray-500 uppercase tracking-widest text-[9px] mb-1">Nodes</div>
              <div className="text-xl font-semibold text-white leading-none">{gData.nodes.length}</div>
            </div>
            <div>
              <div className="text-gray-500 uppercase tracking-widest text-[9px] mb-1">Edges</div>
              <div className="text-xl font-semibold text-white leading-none">{gData.links.length}</div>
            </div>
          </div>

          <div className="flex items-center space-x-6 bg-[#0A0F1C]/80 border border-[#1E293B] px-4 py-2 rounded-lg backdrop-blur-md pointer-events-auto">
            <div className="flex space-x-4">
              {NODE_TYPES_CONFIG.map(t => (
                <LegendItem key={t.id} color={`bg-[${NODE_COLORS[t.id]}]`} label={t.label} />
              ))}
              <LegendItem color="bg-gray-500" label="Other" />
            </div>
            <div className="pl-6 border-l border-[#1E293B]">
              <button className="flex items-center space-x-2 text-gray-400 hover:text-white text-[11px]">
                <span>Layout: Force Directed</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Dense Details */}
      {selectedNode && (
        <div className="w-[320px] bg-[#0A0F1C] border-l border-[#1E293B] flex flex-col relative z-20 shrink-0 shadow-2xl">
          <button 
            onClick={() => setSelectedNode(null)}
            className="absolute top-4 right-4 text-gray-500 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="p-5 border-b border-[#1E293B]">
            <div className="flex items-start space-x-3 mt-2">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 border"
                style={{ 
                  backgroundColor: `${selectedNode.color}20`, 
                  borderColor: selectedNode.color,
                  color: selectedNode.color
                }}
              >
                {React.createElement(NODE_ICONS[selectedNode.group] || NODE_ICONS.DEFAULT, { className: "w-6 h-6" })}
              </div>
              <div className="pt-1">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1 mb-1">
                  <h2 className="text-lg font-bold text-white leading-tight">
                    {selectedNode.name}
                  </h2>
                  <span 
                    className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border"
                    style={{ 
                      backgroundColor: `${selectedNode.color}15`, 
                      borderColor: `${selectedNode.color}40`,
                      color: selectedNode.color
                    }}
                  >
                    {selectedNode.group}
                  </span>
                  {selectedNode.group === 'PERSON' && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border bg-danger/10 border-danger/30 text-danger">
                      High Priority
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4 mt-6 border-b border-[#1E293B]">
              {['Overview', `Connections (${nodeDetails?.connections || 0})`, 'Activity', 'Evidence (6)'].map(t => (
                <button 
                  key={t}
                  onClick={() => setActiveTab(t.split(' ')[0])}
                  className={clsx(
                    "pb-1.5 text-[11px] font-medium transition-colors border-b-2 whitespace-nowrap",
                    activeTab === t.split(' ')[0] ? "text-primary border-primary" : "text-gray-500 border-transparent hover:text-gray-300"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 overflow-y-auto space-y-4">
            {loadingDetails ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="w-5 h-5 text-primary animate-spin mb-2" />
                <span className="text-gray-500 text-[11px]">Retrieving intelligence...</span>
              </div>
            ) : nodeDetails && activeTab === 'Overview' ? (
              <div className="space-y-4 text-[11px]">
                
                {/* Dense Data Grid */}
                <div className="grid grid-cols-[100px_1fr] gap-y-2">
                  <div className="text-gray-500">Full Name</div>
                  <div className="text-white">{nodeDetails.name}</div>
                  
                  {selectedNode.group === 'PERSON' && (
                    <>
                      <div className="text-gray-500">Aliases</div>
                      <div className="text-gray-300">R.K. | Ravi Bhai | Sonu (Mocked)</div>
                      
                      <div className="text-gray-500">Date of Birth</div>
                      <div className="text-gray-300">14 Mar 1988 (Age 38)</div>
                      
                      <div className="text-gray-500 pt-1">Known Addresses</div>
                      <div className="text-gray-300 pt-1 leading-relaxed">
                        • Karol Bagh, New Delhi<br/>
                        • Meerut, Uttar Pradesh<br/>
                        • Rohini, New Delhi
                      </div>
                      
                      <div className="text-gray-500 pt-1">Phone Numbers</div>
                      <div className="text-gray-300 font-mono pt-1 leading-relaxed">
                        • +91 98765 43210<br/>
                        • +91 98111 22334<br/>
                        • +91 91234 56789
                      </div>

                      <div className="text-gray-500 pt-1">Associated Vehicles</div>
                      <div className="text-gray-300 pt-1">HR 26 XX 7788 (Black Thar)</div>
                    </>
                  )}

                  <div className="text-gray-500 pt-1">Linked Cases</div>
                  <div className="text-gray-300 pt-1 leading-relaxed">
                    • FIR-1023 (Jewelry Heist)<br/>
                    • PIR-998 (Armed Robbery)
                  </div>
                </div>

                <div className="my-4 border-t border-[#1E293B]"></div>

                <div className="grid grid-cols-[100px_1fr] gap-y-3 items-center">
                  <div className="text-gray-500">Risk Score</div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 h-1.5 bg-[#030509] rounded-full overflow-hidden border border-[#1E293B]">
                      <div className="h-full bg-danger w-[87%]"></div>
                    </div>
                    <span className="text-gray-300 font-mono text-[10px]">87 / 100</span>
                  </div>

                  <div className="text-gray-500">Threat Level</div>
                  <div className="flex items-center space-x-1.5 text-danger font-medium">
                    <span className="w-1.5 h-1.5 bg-danger rounded-full"></span>
                    <span>High</span>
                  </div>

                  <div className="text-gray-500">Status</div>
                  <div className="flex items-center space-x-1.5 text-success font-medium">
                    <span className="w-1.5 h-1.5 bg-success rounded-full"></span>
                    <span>Active</span>
                  </div>

                  <div className="text-gray-500 self-start mt-1">Tags</div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-1.5 py-0.5 border border-primary/30 text-primary bg-primary/10 rounded text-[9px]">Organized Crime</span>
                    <span className="px-1.5 py-0.5 border border-primary/30 text-primary bg-primary/10 rounded text-[9px]">Repeat Offender</span>
                    <button className="px-1.5 py-0.5 border border-[#1E293B] text-gray-400 bg-[#030509] hover:text-white rounded text-[9px]">+</button>
                  </div>
                </div>

                <div className="mt-4 p-3 border border-[#1E293B] bg-[#030509] rounded-lg text-gray-400 leading-relaxed relative group">
                  Key suspected member in the jewelry heist, frequent communication with known associates. Financial transactions indicate large cash movements.
                  <button className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-primary"><Maximize2 className="w-3 h-3" /></button>
                </div>

              </div>
            ) : (
              <div className="text-gray-500 text-center py-4">Select the Overview tab to view details.</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function FilterCheckbox({ label, count, icon: Icon, color, checked, onChange }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group py-0.5">
      <div className="flex items-center space-x-2">
        <input 
          type="checkbox" 
          checked={checked}
          onChange={onChange}
          className="rounded-sm bg-[#030509] border-border text-primary focus:ring-primary focus:ring-offset-0 focus:ring-1 cursor-pointer" 
        />
        {Icon && <Icon className={`w-3 h-3 ${color}`} />}
        <span className="text-gray-400 group-hover:text-gray-200 transition-colors text-[11px]">{label}</span>
      </div>
      <span className="text-gray-600 text-[10px] font-mono">{count}</span>
    </label>
  )
}

function ToolbarButton({ icon: Icon, label, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="p-2 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors flex flex-col items-center justify-center space-y-1"
      title={label}
    >
      <Icon className="w-4 h-4" />
      <span className="text-[8px] uppercase tracking-wider">{label}</span>
    </button>
  )
}

function LegendItem({ color, label }) {
  // Extract hex code if passed as bg-[...] or just use standard bg class
  let bgClass = color
  let style = {}
  if (color.startsWith('bg-[')) {
    bgClass = ''
    style = { backgroundColor: color.slice(4, -1) }
  }

  return (
    <div className="flex items-center space-x-1.5">
      <div className={`w-2 h-2 rounded-full ${bgClass}`} style={style}></div>
      <span className="text-gray-400 text-[10px]">{label}</span>
    </div>
  )
}
