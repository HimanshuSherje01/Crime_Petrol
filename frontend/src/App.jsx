import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'
import { supabase } from './lib/supabase'

import Landing from './pages/Landing'
import Auth from './pages/Auth'
import DashboardLayout from './components/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Network from './pages/Network'
import Players from './pages/Players'
import Alerts from './pages/Alerts'
import CaseImport from './pages/CaseImport'
import RecentAnalyses from './pages/RecentAnalyses'
import EntityList from './pages/EntityList'
import Settings from './pages/Settings'
import LinkAnalysis from './pages/analytics/LinkAnalysis'
import TimelineView from './pages/analytics/TimelineView'
import GeospatialView from './pages/analytics/GeospatialView'
import Communities from './pages/analytics/Communities'

export default function App() {
  const { user, setUser } = useStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [setUser])

  return (
    <Router>
      <Routes>
        <Route path="/" element={!user ? <Landing /> : <Navigate to="/dashboard" />} />
        <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/dashboard" />} />
        
        {user ? (
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/network" element={<Network />} />
            <Route path="/players" element={<Players />} />
            <Route path="/link-analysis" element={<LinkAnalysis />} />
            <Route path="/timeline" element={<TimelineView />} />
            <Route path="/geospatial" element={<GeospatialView />} />
            <Route path="/communities" element={<Communities />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/case" element={<CaseImport />} />
            <Route path="/recent-analyses" element={<RecentAnalyses />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* <Route path="/communications" element={<EntityList type="COMMUNICATION" title="Communications" subtitle="Call records, messages, and social media interactions." />} />
            <Route path="/locations" element={<EntityList type="LOCATION" title="Locations" subtitle="Geospatial data, known addresses, and safehouses." />} />
            <Route path="/finances" element={<EntityList type="BANK" title="Finances" subtitle="Bank transactions, crypto wallets, and money flows." />} />
            <Route path="/vehicles" element={<EntityList type="VEHICLE" title="Vehicles" subtitle="Registered vehicles, ANPR scans, and linked transport." />} />
            <Route path="/evidence" element={<EntityList type="FIR" title="Evidence" subtitle="FIRs, seized items, and physical reports." />} />
            <Route path="/cctv" element={<EntityList type="CCTV" title="CCTV Analysis" subtitle="Facial recognition logs and camera timestamps." />} />
            <Route path="/reports" element={<EntityList type="REPORT" title="Reports" subtitle="Generated analysis and intelligence summaries." />} />
             */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/" />} />
        )}
      </Routes>
    </Router>
  )
}
