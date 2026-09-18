import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MapPin, Loader2, Maximize2 } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { typeColor } from './entityStyle'
import clsx from 'clsx'

const GAZETTEER = [
  { match: ['sitabuldi market'], coords: [79.081, 21.1415] },
  { match: ['sitabuldi ps'], coords: [79.0793, 21.1437] },
  { match: ['sitabuldi'], coords: [79.08, 21.142] },
  { match: ['civil lines'], coords: [79.073, 21.145] },
  { match: ['wardha road'], coords: [79.024, 21.004] },
  { match: ['wardha'], coords: [78.6022, 20.7453] },
  { match: ['kamptee road'], coords: [79.1298, 21.1834] },
  { match: ['kamptee'], coords: [79.187, 21.235] },
  { match: ['manish nagar'], coords: [79.1226, 21.099] },
  { match: ['manishagar'], coords: [79.1226, 21.099] },
  { match: ['mahal'], coords: [79.0797, 21.1517] },
]

function coordsFor(name) {
  const lower = (name || '').toLowerCase()
  let best = null
  GAZETTEER.forEach(g => {
    if (g.match.some(m => lower.includes(m)) && (!best || g.match[0].length > best.match[0].length)) {
      best = g
    }
  })
  return best ? { coords: best.coords.slice(), label: best.match[0] } : null
}

function markerEl(color, label) {
  const el = document.createElement('div')
  el.className = 'relative w-5 h-5'
  el.innerHTML = `
    <div class="absolute -inset-1.5 rounded-full" style="background:${color}33;filter:blur(3px)"></div>
    <div class="absolute inset-0 rounded-full border-2 flex items-center justify-center"
         style="background:${color}22;border-color:${color}">
      <div class="w-1.5 h-1.5 rounded-full" style="background:${color}"></div>
    </div>`
  el.title = label
  return el
}

const TILE_PROVIDERS = [
  { name: 'CARTO dark', url: 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>' },
  { name: 'CARTO voyager', url: 'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>' },
  { name: 'OpenStreetMap', url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' },
]

function buildMapStyle(provider) {
  return {
    version: 8,
    sources: {
      basemap: {
        type: 'raster',
        tiles: [provider.url],
        tileSize: 256,
        attribution: provider.attribution
      }
    },
    layers: [{ id: 'basemap', type: 'raster', source: 'basemap' }]
  }
}

export default function GeospatialView() {
  const { graphData, selectedCase, fetchCaseData } = useStore()
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const tileIdxRef = useRef(0)
  const [mapReady, setMapReady] = useState(false)
  const [selectedLoc, setSelectedLoc] = useState(null)
  const [tileName, setTileName] = useState(TILE_PROVIDERS[0].name)
  const [webglError, setWebglError] = useState(false)

  useEffect(() => {
    if (selectedCase && (!graphData.nodes || graphData.nodes.length === 0)) {
      fetchCaseData(selectedCase)
    }
  }, [selectedCase, graphData, fetchCaseData])

  const locationNodes = useMemo(() => {
    return (graphData?.nodes || []).filter(n => (n.data.type || '').toUpperCase() === 'LOCATION')
  }, [graphData])

  const located = useMemo(() => {
    const idToNode = {}
    graphData?.nodes?.forEach(n => { idToNode[n.data.id] = n.data })
    const linkedTo = {}
    graphData?.edges?.forEach(e => {
      const src = idToNode[e.data.source]
      const tgt = idToNode[e.data.target]
      if (src && tgt) {
        const key = src.type === 'LOCATION' ? src.id : tgt.id
        const other = src.type === 'LOCATION' ? tgt : src
        linkedTo[key] = linkedTo[key] || []
        linkedTo[key].push({ id: other.id, name: other.label, type: other.type })
      }
    })
    const out = []
    locationNodes.forEach((n, i) => {
      const geo = coordsFor(n.data.label)
      if (!geo) return
      geo.coords[0] += (i % 3) * 0.0012
      geo.coords[1] += Math.floor(i / 3) * 0.0012
      const linked = (linkedTo[n.data.id] || []).filter((v, idx, arr) => arr.findIndex(x => x.id === v.id) === idx)
      out.push({
        id: n.data.id,
        name: n.data.label,
        coords: geo.coords,
        match: geo.label,
        linked,
        people: linked.filter(l => l.type === 'PERSON').length,
        sources: linked.filter(l => l.type !== 'PERSON').length
      })
    })
    return out
  }, [graphData, locationNodes])

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const probe = document.createElement('canvas')
    const hasWebGL2 = !!(window.WebGL2RenderingContext && probe.getContext('webgl2'))
    if (!hasWebGL2) {
      setWebglError(true)
      return
    }

    tileIdxRef.current = 0
    let map
    try {
      map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: buildMapStyle(TILE_PROVIDERS[0]),
        center: [79.09, 21.14],
        zoom: 11,
        minZoom: 5,
        attributionControl: true,
        maxPitch: 60,
      })
    } catch {
      setWebglError(true)
      return
    }
    mapRef.current = map
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right')
    map.on('load', () => setMapReady(true))

    // If a tile provider fails (blocked / slow / 403), fall through the list.
    map.on('error', () => {
      if (tileIdxRef.current >= TILE_PROVIDERS.length - 1) return
      tileIdxRef.current += 1
      const next = TILE_PROVIDERS[tileIdxRef.current]
      try {
        map.getSource('basemap')?.setTiles([next.url])
        setTileName(next.name)
      } catch { /* noop */ }
    })

    return () => {
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []
      mapRef.current = null
      map.remove()
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady || !located.length) return
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []
    located.forEach(loc => {
      const el = markerEl(typeColor('LOCATION'), loc.name)
      const popup = new maplibregl.Popup({ offset: 18, closeButton: false, maxWidth: '260px' })
        .setHTML(buildPopup(loc))
      el.addEventListener('click', () => setSelectedLoc(loc))
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(loc.coords)
        .setPopup(popup)
        .addTo(map)
      markersRef.current.push(marker)
    })
  }, [located, mapReady])

  useEffect(() => {
    if (!selectedLoc && located.length && mapReady) {
      const first = located.find(l => l.people > 0) || located[0]
      setSelectedLoc(first)
      flyTo(first)
    }
  }, [located, mapReady, selectedLoc])

  function flyTo(loc) {
    if (!mapRef.current) return
    mapRef.current.flyTo({ center: loc.coords, zoom: 12.5, speed: 1.2 })
    setSelectedLoc(loc)
  }

  const unmatched = useMemo(() => {
    const matched = new Set(located.map(l => l.name.toLowerCase()))
    return locationNodes.filter(n => !matched.has(n.data.label.toLowerCase()))
  }, [locationNodes, located])

  return (
    <div className="flex h-full">
      <style>{`
        .geospatial-map .maplibregl-popup-content {
          background:#0A0F1C; color:#F8FAFC; border:1px solid #1E293B; border-radius:8px; padding:10px 12px; font-size:11px;
        }
        .geospatial-map .maplibregl-popup-tip { border-top-color:#0A0F1C; }
        .geospatial-map .maplibregl-ctrl-attrib { background:rgba(3,5,9,0.8); color:#64748B; font-size:9px; }
        .geospatial-map .maplibregl-ctrl-attrib a { color:#94A3B8; }
      `}</style>

      <div className="w-[300px] shrink-0 border-r border-border bg-card/70 p-4 overflow-y-auto space-y-4 z-20">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-primary" /> Geospatial View
          </h1>
          <p className="text-[11px] text-gray-500 mt-1">Entity locations plotted against city geography.</p>
        </div>

        {located.length === 0 && (
          <button
            onClick={() => fetchCaseData(selectedCase)}
            className="w-full text-left bg-card border border-border rounded-lg p-3 text-[11px] text-gray-400 hover:text-white transition-colors"
          >
            No geolocated entities — click to load case <span className="text-primary font-mono">{selectedCase}</span>.
          </button>
        )}

        <div className="space-y-2">
          {located.map(loc => (
            <button
              key={loc.id}
              onClick={() => flyTo(loc)}
              className={clsx(
                "w-full text-left rounded-lg border p-3 transition-colors hover:bg-white/[0.03]",
                selectedLoc?.id === loc.id ? "border-primary/60 bg-primary/5" : "border-border"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-200 font-medium text-[12px]">{loc.name}</span>
                <span className="text-[9px] text-gray-500 font-mono">{loc.coords[1].toFixed(3)}, {loc.coords[0].toFixed(3)}</span>
              </div>
              <div className="flex items-center space-x-3 mt-1.5 text-[10px] text-gray-500">
                <span className="text-primary">{loc.people} people</span>
                <span>{loc.sources} sources</span>
              </div>
              {loc.people > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {loc.linked.filter(l => l.type === 'PERSON').slice(0, 4).map(p => (
                    <span key={p.id} className="px-1.5 py-0.5 rounded-full text-[9px] border" style={{ borderColor: `${typeColor('PERSON')}55`, color: typeColor('PERSON') }}>
                      {p.name}
                    </span>
                  ))}
                </div>
              )}
            </button>
          ))}
          {unmatched.length > 0 && (
            <div className="pt-3 border-t border-border/60">
              <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-1.5">Unresolved locations ({unmatched.length})</div>
              <div className="flex flex-wrap gap-1">
                {unmatched.slice(0, 12).map(n => (
                  <span key={n.data.id} className="text-[9px] text-gray-600 border border-border rounded px-1.5 py-0.5">{n.data.label}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="relative flex-1 min-w-0">
        {!mapReady && !webglError && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        )}
        {webglError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-10 p-6">
            <div className="max-w-sm text-center space-y-2">
              <p className="text-sm text-white font-semibold">WebGL is not available</p>
              <p className="text-[11px] text-gray-500">
                The map needs WebGL 2. Enable hardware acceleration in your browser (Chrome: Settings &rarr;
                System &rarr; "Use graphics acceleration") then reload.
              </p>
            </div>
          </div>
        ) : (
          <div ref={mapContainerRef} className="geospatial-map absolute inset-0" />
        )}
        <div className="absolute top-3 right-3 z-10 bg-card/90 border border-border rounded-lg px-2.5 py-1.5 text-[10px] text-gray-400 shadow-xl backdrop-blur">
          <div className="flex items-center space-x-2">
            <Maximize2 className="w-3 h-3 text-primary" />
            <span>Tile: {tileName} · © OpenStreetMap contributors</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function buildPopup(loc) {
  const people = loc.linked.filter(l => l.type === 'PERSON')
  const others = loc.linked.filter(l => l.type !== 'PERSON')
  const chips = [...people, ...others]
    .slice(0, 8)
    .map(p => `<span style="color:${typeColor(p.type)};border:1px solid ${typeColor(p.type)}44;padding:1px 6px;border-radius:999px;font-size:9px;margin:2px;display:inline-block">${p.name}</span>`)
    .join('')
  return `
    <div style="font-weight:700;font-size:12px;color:#F8FAFC">${loc.name}</div>
    <div style="color:#64748B;font-size:10px;margin-top:2px">${loc.people} people · ${loc.sources} sources</div>
    <div style="margin-top:6px">${chips || '<span style="color:#475569;font-size:10px">No linked entities</span>'}</div>
  `
}