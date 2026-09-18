import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Filter, X, Search, User, Phone, MapPin, Car, Building, FileText, Camera, Loader2, Maximize2, RotateCw, ZoomIn, Hand, RotateCcw, ChevronDown } from 'lucide-react'
import ForceGraph3D from 'react-force-graph-3d'
import * as THREE from 'three'
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

const NODE_REL_SIZE = 4 // matches 3d-force-graph default nodeRelSize

function nodeRadius(node) {
  return Math.cbrt(node.val || 1) * NODE_REL_SIZE
}

function makeCanvasSprite(canvasW, canvasH, draw) {
  const canvas = document.createElement('canvas')
  canvas.width = canvasW
  canvas.height = canvasH
  draw(canvas.getContext('2d'))
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  })
  const sprite = new THREE.Sprite(material)
  sprite.scale.set(canvasW / 128, canvasH / 128, 1)
  return sprite
}

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function makeNameSprite(name, score, connectionCount, color, isSelected) {
  return makeCanvasSprite(640, 200, ctx => {
    let fontSize = 44
    ctx.font = `700 ${fontSize}px Inter, system-ui, sans-serif`
    while (ctx.measureText(name).width > 600 && fontSize > 24) {
      fontSize -= 2
      ctx.font = `700 ${fontSize}px Inter, system-ui, sans-serif`
    }
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Name with a soft "bloom" glow behind the glyphs
    ctx.shadowColor = isSelected ? '#ffffff' : color
    ctx.shadowBlur = isSelected ? 22 : 14
    ctx.fillStyle = '#ffffff'
    ctx.fillText(name, 320, 58)
    ctx.shadowBlur = 0

    // Connection-count pill below the name
    const annotation = `${connectionCount} connections`
    ctx.font = `700 26px Inter, system-ui, sans-serif`
    const pillW = Math.min(560, Math.max(160, ctx.measureText(annotation).width + 46))
    const pillH = 46
    roundRectPath(ctx, 320 - pillW / 2, 112, pillW, pillH, pillH / 2)
    ctx.fillStyle = 'rgba(3,5,9,0.78)'
    ctx.fill()
    ctx.strokeStyle = color
    ctx.lineWidth = 3
    ctx.stroke()
    ctx.fillStyle = color
    ctx.textAlign = 'center'
    ctx.fillText(annotation, 320, 112 + pillH / 2)

    // Risk score badge on the right of the pill
    if (score !== undefined && score !== null) {
      const badge = `${Math.round(score)} risk`
      ctx.font = `700 24px Inter, system-ui, sans-serif`
      const bw = ctx.measureText(badge).width + 36
      roundRectPath(ctx, 320 - pillW / 2 - bw + 8, 112, bw - 8, pillH, pillH / 2)
      ctx.fillStyle = isSelected ? '#ffffff' : 'rgba(148,163,184,0.15)'
      ctx.fill()
      ctx.fillStyle = isSelected ? '#050914' : '#e2e8f0'
      ctx.fillText(badge, 320 - pillW / 2 - bw / 2 + 4, 112 + pillH / 2)
    }
  })
}

function makeGlowSprite(color) {
  return makeCanvasSprite(128, 128, ctx => {
    const g = ctx.createRadialGradient(64, 64, 2, 64, 64, 62)
    g.addColorStop(0, color)
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 128, 128)
  })
}

function makeNodeVisual(node, connectionCount, risk, isSelected) {
  const group = new THREE.Group()
  const radius = nodeRadius(node)
  const color = node.color || '#06B6D4'

  // Soft halo/gloom behind the node
  const glow = makeGlowSprite(color)
  const gs = radius * (isSelected ? 6.5 : 4)
  glow.scale.set(gs, gs, 1)
  glow.position.set(0, 0, -radius * 0.6)
  group.add(glow)

  // Persistent name label + connection count
  const label = makeNameSprite(node.name || node.id, risk?.risk_score, connectionCount, isSelected ? '#ffffff' : color, isSelected)
  label.position.set(0, radius + 3.4, 0)
  group.add(label)

  return group
}

function resolveLinkEndpoint(endpoint) {
  if (endpoint == null) return ''
  if (typeof endpoint === 'object') return endpoint.id != null ? String(endpoint.id) : ''
  return String(endpoint)
}

export default function Network() {
  const { graphData, dashboardStats, fetchEntityDetails, players, selectedCase, analyzeState, analyzeCase } = useStore()
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

  // Relationship counts derived from the live graph data
  const relationshipCounts = useMemo(() => {
    const counts = {}
    graphData?.edges?.forEach(e => {
      const label = e.data?.label || 'ASSOCIATED_WITH'
      counts[label] = (counts[label] || 0) + 1
    })
    return Object.entries(counts).map(([label, count]) => ({ label, count }))
  }, [graphData])

  const playerRiskById = useMemo(() => {
    const map = {}
    players.forEach(p => { map[p.id] = p })
    return map
  }, [players])

  const gData = useMemo(() => {
    if (!graphData || !graphData.nodes) return { nodes: [], links: [] }

    const nodeDegree = {}
    graphData.edges.forEach(e => {
      nodeDegree[e.data.source] = (nodeDegree[e.data.source] || 0) + 1
      nodeDegree[e.data.target] = (nodeDegree[e.data.target] || 0) + 1
    })
    const maxDeg = Math.max(1, ...Object.values(nodeDegree))

    const filteredNodes = graphData.nodes
      .filter(n => visibleTypes.has(n.data.type?.toUpperCase()))
      .map(n => ({
        id: n.data.id,
        name: n.data.label,
        group: n.data.type?.toUpperCase(),
        color: NODE_COLORS[n.data.type?.toUpperCase()] || NODE_COLORS.DEFAULT,
        connections: nodeDegree[n.data.id] || 0,
        val: 2 + (nodeDegree[n.data.id] || 0) / maxDeg * 6
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

  // ---- Node rendering: persistent labels, glow, and risk badges ----
  // Rebuild node visuals when the selection changes so highlight/bloom updates.
  const nodeVisualizer = useCallback((node) => {
    const risk = node.group === 'PERSON' ? playerRiskById[node.id] : null
    return makeNodeVisual(node, node.connections ?? 0, risk, selectedNode?.id === node.id)
  }, [selectedNode, playerRiskById])

  // ---- Link rendering: white connections, expanded when a node is selected ----
  const isLinkActive = useCallback((link) => {
    if (!selectedNode) return true
    const s = resolveLinkEndpoint(link.source)
    const t = resolveLinkEndpoint(link.target)
    return s === selectedNode.id || t === selectedNode.id
  }, [selectedNode])

  // Memoize on selection so 3d-force-graph reconstitutes links when it changes
  const linkColorFn = useCallback(() => '#ffffff', [])
  const linkOpacityFn = useCallback((link) => (isLinkActive(link) ? 0.95 : 0.12), [isLinkActive])
  const linkWidthFn = useCallback((link) => (isLinkActive(link) ? 1.6 : 0.3), [isLinkActive])
  const nodeValSelected = useCallback((node) => node.val * (selectedNode?.id === node.id ? 1.7 : 1), [selectedNode])

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
          <h3 className="text-[10px] font-semibold text-gray-500 mb-3 uppercase tracking-widest">Case Scope</h3>
          <div className="text-[10px] text-gray-400 space-y-1">
            <div className="flex items-center justify-between">
              <span>Case</span>
              <span className="text-white font-mono truncate max-w-[150px]">{selectedCase || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Nodes</span>
              <span className="text-white font-mono">{gData.nodes.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Links</span>
              <span className="text-white font-mono">{gData.links.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Ground Truth</span>
              <span className="text-success font-mono">{dashboardStats?.gtMatch ? `${dashboardStats.gtMatch}%` : 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-[10px] font-semibold text-gray-500 mb-3 uppercase tracking-widest">Relationship Type</h3>
          {relationshipCounts.length === 0 ? (
            <div className="text-[10px] text-gray-600">No relationships in the current graph.</div>
          ) : (
            <div className="space-y-2">
              {relationshipCounts.map(r => (
                <FilterCheckbox key={r.label} label={r.label} count={r.count} icon={null} checked />
              ))}
            </div>
          )}
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
          {analyzeState === 'idle' && (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#0A0F1C] border border-[#1E293B] flex items-center justify-center pointer-events-auto">
                <Filter className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm text-gray-400">Click to Analyze</p>
              <p className="text-[11px] max-w-sm text-center -mt-2">
                Case <span className="text-primary font-mono">{selectedCase}</span> has no graph yet. Run the analysis pipeline to build the criminal network.
              </p>
              <button
                onClick={() => analyzeCase(selectedCase)}
                className="bg-primary text-black font-semibold px-4 py-2 rounded-lg text-xs hover:bg-primary-hover transition-colors pointer-events-auto"
              >
                Run Analysis
              </button>
            </div>
          )}
          {analyzeState === 'loading' && (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-gray-400">Building network graph...</p>
            </div>
          )}
          {analyzeState === 'error' && (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-3">
              <Loader2 className="w-8 h-8 text-danger" />
              <p className="text-sm text-gray-400">Analysis failed. Retry from Import & Analyze.</p>
            </div>
          )}
          {analyzeState === 'ready' && gData.nodes.length === 0 && (
            <div className="flex items-center justify-center h-full text-gray-500">
              No graph data available matching filters.
            </div>
          )}
          {analyzeState === 'ready' && gData.nodes.length > 0 && (
            <ForceGraph3D
              ref={graphRef}
              width={dimensions.width}
              height={dimensions.height}
              graphData={gData}
              nodeLabel="name"
              nodeColor="color"
              nodeVal={nodeValSelected}
              nodeResolution={16}
              nodeOpacity={1}
              nodeThreeObjectExtend={nodeVisualizer}
              linkColor={linkColorFn}
              linkOpacity={linkOpacityFn}
              linkWidth={linkWidthFn}
              linkResolution={4}
              onNodeClick={handleNodeClick}
              onBackgroundClick={() => setSelectedNode(null)}
              backgroundColor="#000000"
              showNavInfo={false}
              enableNodeDrag={false}
            />
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
                  <div className="text-gray-500">Entity ID</div>
                  <div className="text-white font-mono text-[10px] break-all">{nodeDetails.id}</div>

                  <div className="text-gray-500">Full Name</div>
                  <div className="text-white">{nodeDetails.name}</div>

                  <div className="text-gray-500">Type</div>
                  <div>
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
                  </div>

                  <div className="text-gray-500">Connections</div>
                  <div className="text-gray-300 font-mono">{nodeDetails.connections}</div>

                  {selectedNode.group === 'PERSON' && playerRiskById[selectedNode.id] && (
                    <>
                      <div className="text-gray-500 pt-1">Risk Score</div>
                      <div className="text-gray-300 pt-1">
                        <PlayerRisk player={playerRiskById[selectedNode.id]} />
                      </div>
                      <div className="text-gray-500">Threat Level</div>
                      <div className="text-gray-300 capitalize">{playerRiskById[selectedNode.id].threat_level}</div>
                      {playerRiskById[selectedNode.id].community !== undefined && (
                        <>
                          <div className="text-gray-500">Community</div>
                          <div className="text-gray-300 font-mono">#{playerRiskById[selectedNode.id].community}</div>
                        </>
                      )}
                    </>
                  )}
                </div>

                <div className="my-4 border-t border-[#1E293B]"></div>

                {selectedNode.group === 'PERSON' && playerRiskById[selectedNode.id] ? (
                  <div className="grid grid-cols-[100px_1fr] gap-y-3 items-center">
                    <div className="text-gray-500">Pagerank</div>
                    <div className="text-gray-300 font-mono text-[10px]">{playerRiskById[selectedNode.id].pagerank}</div>
                    <div className="text-gray-500">Betweenness</div>
                    <div className="text-gray-300 font-mono text-[10px]">{playerRiskById[selectedNode.id].betweenness}</div>
                    <div className="text-gray-500">Linked Nodes</div>
                    <div className="text-gray-300 font-mono text-[10px]">{nodeDetails.connections}</div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-[10px] leading-relaxed">
                    No risk analytics available for this entity type. Switch to a PERSON node to view risk scoring and network metrics.
                  </p>
                )}
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

function PlayerRisk({ player }) {
  const score = player.risk_score ?? 0
  const color = score >= 70 ? 'bg-danger' : score >= 40 ? 'bg-amber-500' : 'bg-success'
  return (
    <div className="flex items-center space-x-2">
      <div className="w-24 h-1.5 bg-[#030509] rounded-full overflow-hidden border border-[#1E293B]">
        <div className={clsx("h-full", color)} style={{ width: `${Math.min(100, Math.max(0, score))}%` }}></div>
      </div>
      <span className={clsx("font-mono text-[10px]", score >= 70 ? 'text-danger' : score >= 40 ? 'text-amber-500' : 'text-success')}>{Math.round(score)}</span>
    </div>
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
