import React, { useState } from 'react'
import { Settings as SettingsIcon, Shield, Database, Users, Bell, Key, LogOut } from 'lucide-react'
import { useStore } from '../store/useStore'
import clsx from 'clsx'

export default function Settings() {
  const { user, signOut } = useStore()
  const [activeTab, setActiveTab] = useState('Account')

  const tabs = [
    { id: 'Account', icon: Users },
    { id: 'Security', icon: Shield },
    { id: 'API & Integrations', icon: Key },
    { id: 'Data Management', icon: Database },
    { id: 'Notifications', icon: Bell }
  ]

  return (
    <div className="bg-[#050914] min-h-full p-4 md:p-8 font-sans flex justify-center">
      <div className="max-w-5xl w-full flex flex-col md:flex-row gap-8">
        
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
          <div className="mb-6 px-2">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <SettingsIcon className="w-5 h-5 text-primary" />
              <span>Settings</span>
            </h2>
            <p className="text-gray-500 text-xs mt-1">Manage workspace preferences.</p>
          </div>

          <div className="flex flex-col space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
                  activeTab === tab.id 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "text-gray-400 hover:bg-[#0A0F1C] hover:text-white border border-transparent"
                )}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.id}</span>
              </button>
            ))}
          </div>

          <div className="mt-auto pt-8">
            <button 
              onClick={signOut}
              className="flex items-center space-x-3 px-4 py-2.5 w-full text-left text-danger hover:bg-danger/10 rounded-lg transition-colors text-sm font-medium border border-transparent hover:border-danger/20"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 bg-[#0A0F1C] border border-[#1E293B] rounded-xl p-6 md:p-8 shadow-2xl">
          <div className="mb-8 border-b border-[#1E293B] pb-4">
            <h3 className="text-lg font-bold text-white">{activeTab} Preferences</h3>
            <p className="text-gray-500 text-xs mt-1">Update your {activeTab.toLowerCase()} configuration.</p>
          </div>

          {activeTab === 'Account' && (
            <div className="space-y-6 max-w-2xl text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-gray-400 text-xs uppercase tracking-wider font-bold">Email Address</label>
                  <input 
                    type="email" 
                    disabled 
                    value={user?.email || 'investigator@crimepetrol.gov'} 
                    className="w-full bg-[#030509] border border-[#1E293B] rounded px-3 py-2 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-gray-400 text-xs uppercase tracking-wider font-bold">Role / Clearance</label>
                  <input 
                    type="text" 
                    disabled 
                    value="Senior Investigator - Level 4" 
                    className="w-full bg-[#030509] border border-[#1E293B] rounded px-3 py-2 text-primary font-mono cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="space-y-2 pt-4">
                <button className="bg-primary text-[#050914] font-bold px-6 py-2 rounded hover:bg-primary-hover transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'Data Management' && (
            <div className="space-y-6 max-w-2xl text-sm">
              <div className="p-4 bg-danger/5 border border-danger/20 rounded-lg flex justify-between items-center">
                <div>
                  <h4 className="text-white font-bold mb-1 flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-danger" />
                    <span>Purge Workspace Data</span>
                  </h4>
                  <p className="text-gray-500 text-xs">Permanently deletes all parsed entities, ground truth data, and uploaded files for the active case.</p>
                </div>
                <button className="bg-danger/20 text-danger border border-danger/50 px-4 py-2 rounded font-medium hover:bg-danger hover:text-white transition-colors shrink-0 ml-4">
                  Delete All Data
                </button>
              </div>
            </div>
          )}

          {/* Placeholders for other tabs */}
          {['Security', 'API & Integrations', 'Notifications'].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <SettingsIcon className="w-12 h-12 text-gray-800 mb-4 animate-[spin_10s_linear_infinite]" />
              <h4 className="text-gray-300 font-medium text-base">Module Under Construction</h4>
              <p className="text-gray-600 text-xs max-w-sm mt-2">These advanced configuration options will be available in the next platform update.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
