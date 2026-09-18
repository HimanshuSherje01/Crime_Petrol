import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { LayoutDashboard, Network, Users, Bell, Folder, Search, Shield, ChevronDown, Bell as BellIcon, LogOut } from 'lucide-react'
import { useStore } from '../store/useStore'
import clsx from 'clsx'

export default function DashboardLayout() {
  const { user, signOut, cases, selectedCase, selectCase } = useStore()

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Network', path: '/network', icon: Network },
    { name: 'Players', path: '/players', icon: Users },
    { name: 'Alerts', path: '/alerts', icon: Bell, badge: 12 },
    { name: 'Case', path: '/case', icon: Folder },
    { name: 'Search', path: '/search', icon: Search },
  ]

  return (
    <div className="flex h-screen bg-background text-gray-200 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 flex items-center space-x-3">
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold text-white">Crime<span className="text-primary">Petrol</span></h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Connecting the dots</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map(item => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => clsx(
                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                isActive ? "bg-border text-primary font-medium" : "text-gray-400 hover:text-white hover:bg-border/50"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <span className="bg-danger text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-6 text-xs text-gray-600">
          <p>"DATA</p>
          <p>INTELLIGENCE</p>
          <p>SAFER SOCIETIES"</p>
          <p className="mt-4">v1.0.0</p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 border-b border-border bg-card/50 flex items-center justify-between px-6 backdrop-blur-md z-10">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative group">
              <button className="flex items-center space-x-2 bg-background border border-border px-4 py-2 rounded-lg text-sm hover:border-primary/50 transition-colors">
                <span>{selectedCase || 'Select a Case'}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              {/* Dropdown would go here */}
            </div>
            
            <div className="flex-1 max-w-xl relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search people, phones, locations, vehicles, FIRs..." 
                className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors text-white"
              />
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <button className="relative text-gray-400 hover:text-white transition-colors">
              <BellIcon className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-danger rounded-full ring-2 ring-card"></span>
            </button>
            
            <div className="flex items-center space-x-3 border-l border-border pl-6">
              <div className="w-8 h-8 rounded-full bg-border flex items-center justify-center font-semibold text-sm">
                SK
              </div>
              <div className="text-sm">
                <p className="font-medium text-white">{user?.email?.split('@')[0] || 'Investigator'}</p>
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-success"></span>
                  <span className="text-xs text-gray-400">Live</span>
                </div>
              </div>
              <button onClick={signOut} className="ml-2 text-gray-500 hover:text-danger">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-background p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
