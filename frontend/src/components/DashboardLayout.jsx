import React, { useEffect, useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, FolderOpen, Network, Users, MessageSquare, 
  MapPin, DollarSign, Car, FileText, Video, FileBarChart, 
  Search, Bell, Settings, Target, ChevronDown, ChevronRight 
} from 'lucide-react'
import { useStore } from '../store/useStore'
import clsx from 'clsx'

export default function DashboardLayout() {
  const { user, signOut, cases, selectedCase, selectCase, fetchCases, alerts } = useStore()
  const [casesOpen, setCasesOpen] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    fetchCases()
  }, [fetchCases])

  // Map to real routes if needed, otherwise just stylistic for now
  const mainNav = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Cases', path: '#', icon: FolderOpen, isSection: true, open: casesOpen, setOpen: setCasesOpen,
      children: [
        { name: 'All Cases', path: '/cases' },
        { name: 'New Case', path: '/cases/new' },
        { name: 'Import & Analyze', path: '/case' },
        { name: 'Case Workspace', path: '/workspace' },
      ]
    },
    { name: 'Network', path: '/network', icon: Network },
    /* { name: 'Players', path: '/players', icon: Users },
    { name: 'Communications', path: '/communications', icon: MessageSquare },
    { name: 'Locations', path: '/locations', icon: MapPin },
    { name: 'Finances', path: '/finances', icon: DollarSign },
    { name: 'Vehicles', path: '/vehicles', icon: Car },
    { name: 'Evidence', path: '/evidence', icon: FileText },
    { name: 'CCTV', path: '/cctv', icon: Video },
    { name: 'Reports', path: '/reports', icon: FileBarChart },
    { name: 'Search', path: '/search', icon: Search },
    { name: 'Alerts', path: '/alerts', icon: Bell, badge: alerts.length || 12 }, */
    { name: 'Settings', path: '/settings', icon: Settings },
  ]

  const dateStr = new Intl.DateTimeFormat('en-GB', { 
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', 
    hour: '2-digit', minute: '2-digit', hour12: true 
  }).format(new Date())

  return (
    <div className="flex h-screen bg-background text-[13px] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-[#060913] border-r border-border flex flex-col shrink-0 z-20">
        <div className="p-4 flex items-center space-x-2">
          <Target className="w-6 h-6 text-primary" strokeWidth={1.5} />
          <div className="leading-tight">
            <h1 className="text-lg font-bold text-white tracking-wide">Crime<span className="text-primary">Petrol</span></h1>
            <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-0.5">Intelligence Drives<br/>Safer Societies</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 custom-scrollbar">
          {mainNav.map((item, idx) => (
            <div key={item.name}>
              {item.isSection ? (
                <>
                  <button 
                    onClick={() => item.setOpen(!item.open)}
                    className={clsx(
                      "w-full flex items-center justify-between px-4 py-2 hover:bg-border/40 transition-colors",
                      location.pathname.startsWith('/case') ? "text-primary bg-primary/5 border-l-2 border-primary" : "text-gray-400"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-4 h-4 opacity-80" />
                      <span>{item.name}</span>
                    </div>
                    <ChevronDown className={clsx("w-3 h-3 transition-transform", !item.open && "-rotate-90")} />
                  </button>
                  {item.open && (
                    <div className="bg-[#030509] py-1 border-y border-border/50">
                      {item.children.map(child => (
                        <NavLink
                          key={child.name}
                          to={child.path}
                          className={({ isActive }) => clsx(
                            "flex items-center pl-11 pr-4 py-1.5 transition-colors",
                            isActive ? "text-primary bg-primary/10 font-medium" : "text-gray-500 hover:text-gray-300"
                          )}
                        >
                          {child.name}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <NavLink
                  to={item.path}
                  className={({ isActive }) => clsx(
                    "flex items-center justify-between px-4 py-2 transition-colors",
                    isActive ? "text-primary bg-primary/5 border-l-2 border-primary font-medium" : "text-gray-400 hover:text-gray-300 border-l-2 border-transparent hover:bg-border/30"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-4 h-4 opacity-80" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-danger text-white text-[10px] font-bold px-1.5 py-0 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              )}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-border/50 text-[10px] text-gray-600 space-y-1">
          <p>v1.2.0</p>
          <p>Law Enforcement Intelligence Platform</p>
          <p>Restricted Access</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0A0F1C]">
        {/* Top Header */}
        <header className="h-14 border-b border-border bg-[#060913]/90 flex items-center justify-between px-4 backdrop-blur-md z-10 shrink-0">
          
          <div className="flex items-center space-x-2 text-gray-400 text-xs">
            <span className="cursor-pointer hover:text-gray-300">Case Workspace</span>
            <ChevronRight className="w-3 h-3" />
            <div className="flex items-center space-x-1 cursor-pointer hover:text-white">
              <span className="text-white">Import & Analyze</span>
              <ChevronDown className="w-3 h-3" />
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-8 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search cases, people, phones, locations, FIRs..."
              className="w-full bg-[#030509] border border-border rounded pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-primary/50 transition-colors text-white placeholder-gray-600"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 text-[10px] border border-gray-700 px-1 rounded">/</span>
          </div>

          {/* Right Topbar actions */}
          <div className="flex items-center space-x-5">
            <button className="relative text-gray-400 hover:text-white transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1.5 w-3 h-3 bg-danger rounded-full ring-2 ring-[#060913] text-[8px] flex items-center justify-center text-white font-bold">3</span>
            </button>

            <div className="flex items-center space-x-3 pl-5 border-l border-border/50">
              <div className="w-7 h-7 rounded-full bg-border flex items-center justify-center font-medium text-xs text-white relative">
                SK
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-success rounded-full border border-[#060913]"></div>
              </div>
              <div className="text-[11px] leading-tight">
                <p className="text-white font-medium">{user?.email?.split('@')[0] || 'Sudeep Kuralkar'}</p>
                <p className="text-gray-500">Investigator</p>
              </div>
            </div>

            <div className="text-[11px] text-gray-400 text-right leading-tight pl-5 border-l border-border/50">
              <p>{dateStr.split(', ')[0]}</p>
              <p>{dateStr.split(', ')[1]}</p>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-auto bg-[#0A0F1C]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
