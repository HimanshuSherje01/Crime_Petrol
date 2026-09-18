import React, { useState } from 'react'
import { 
  UploadCloud, Play, CheckCircle2, Circle, Clock, Loader2, 
  MoreHorizontal, FileText, FileSpreadsheet, Film, LayoutDashboard, 
  Share2, Network, PieChart, Archive, Settings, FileIcon, Search, AlertCircle
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

export default function CaseImport() {
  const { cases, selectedCase, selectCase, analyzeCase, loading } = useStore()
  const [localCase, setLocalCase] = useState(selectedCase || cases[0] || 'mock_case_id')
  const [analyzed, setAnalyzed] = useState(false)
  const navigate = useNavigate()

  const handleAnalyze = async () => {
    if (!localCase) return
    selectCase(localCase)
    await analyzeCase(localCase)
    setAnalyzed(true)
    setTimeout(() => navigate('/network'), 1500)
  }

  const tabs = ['Overview', 'Import & Analyze', 'Evidence', 'Network', 'Timeline', 'Findings', 'Reports', 'Settings']

  return (
    <div className="flex flex-col h-full bg-[#050914] text-[#94A3B8] p-4 font-sans text-xs">
      
      {/* Case Header Area */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-xl font-bold text-white">Case A: {localCase}</h1>
            <span className="bg-success/10 text-success border border-success/30 px-2 py-0.5 rounded text-[10px] font-medium tracking-wide uppercase">Active</span>
            <button className="text-gray-500 hover:text-white"><MoreHorizontal className="w-4 h-4" /></button>
          </div>
          <p className="text-gray-500">Import evidence, run analysis, and uncover connections</p>
        </div>

        <div className="flex space-x-8 text-right bg-[#0A0F1C] border border-border p-3 rounded-lg">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500">Case ID</div>
            <div className="text-white font-medium">CH-2026-1023</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500">Opened On</div>
            <div className="text-white font-medium">14 Sep 2026</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500">Priority</div>
            <div className="text-danger font-medium">High</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500">Status</div>
            <div className="text-success font-medium flex items-center justify-end space-x-1">
              <span className="w-1.5 h-1.5 bg-success rounded-full"></span>
              <span>Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex space-x-6 border-b border-border mb-4">
        {tabs.map((t) => (
          <button 
            key={t}
            className={clsx(
              "pb-2 font-medium transition-colors border-b-2",
              t === 'Import & Analyze' ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-300"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto grid grid-cols-12 gap-4">
        
        {/* Left Column: Upload & Options */}
        <div className="col-span-8 flex flex-col space-y-4">
          
          {/* Upload Area */}
          <div className="glass-panel rounded-lg p-4 flex flex-col flex-1">
            <div className="flex space-x-6 border-b border-border/50 mb-4 pb-2">
              <button className="text-primary font-medium border-b border-primary pb-2 -mb-[9px]">Upload Files</button>
              <button className="text-gray-500 hover:text-gray-300">Connect Data Sources</button>
              <button className="text-gray-500 hover:text-gray-300">Manual Input</button>
            </div>

            <div className="flex space-x-4 h-full">
              {/* Drag Drop Box */}
              <div className="flex-1 border border-dashed border-[#1E293B] rounded-lg bg-[#060913] flex flex-col items-center justify-center p-6 text-center hover:bg-border/20 transition-colors">
                <UploadCloud className="w-10 h-10 text-primary mb-3" />
                <h3 className="text-white font-medium text-sm mb-1">Drag and drop files here</h3>
                <p className="text-gray-500 mb-4">or click to browse</p>
                
                {/* Temp: Case Selector just for functionality */}
                <select 
                  value={localCase} 
                  onChange={e => setLocalCase(e.target.value)}
                  className="mb-4 bg-background border border-border text-white text-xs rounded px-2 py-1"
                >
                  {cases.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <button className="px-6 py-2 border border-primary text-primary rounded hover:bg-primary/10 transition-colors font-medium">
                  Browse Files
                </button>

                <div className="mt-6 text-[10px] text-gray-600">
                  <p>Supported formats: PDF, DOCX, XLSX, CSV, JPG, PNG, MP4, MP3, WAV, JSON, KML, ZIP</p>
                  <p>Max file size: 5 GB (per file)</p>
                </div>
              </div>

              {/* What happens steps */}
              <div className="w-64 pl-4 border-l border-border/50 flex flex-col justify-center">
                <h4 className="text-white font-medium mb-4">What happens after upload?</h4>
                <div className="space-y-4 relative">
                  <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border/50 z-0"></div>
                  
                  <Step num="1" title="File validation" desc="Check file type, size and integrity" active />
                  <Step num="2" title="Data extraction" desc="Extract text, metadata, entities (people, phones, locations, etc.)" />
                  <Step num="3" title="Normalization" desc="Clean and standardize data" />
                  <Step num="4" title="Entity linking" desc="Match with existing database" />
                  <Step num="5" title="Graph construction" desc="Add to knowledge graph" />
                  <Step num="6" title="Analysis & insights" desc="Identify patterns and generate leads" />
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Options */}
          <div className="glass-panel rounded-lg p-4 shrink-0">
            <h3 className="text-white font-medium mb-4">Analysis Options</h3>
            <div className="grid grid-cols-3 gap-6">
              
              <div>
                <h4 className="text-gray-400 font-medium mb-2 border-b border-border/50 pb-1">Data to Analyze</h4>
                <div className="space-y-2">
                  <Check label="Documents (FIRs, reports, statements)" checked />
                  <Check label="Images (photos, scanned docs)" checked />
                  <Check label="Videos (CCTV, bodycam, etc.)" checked />
                  <Check label="Call Records (CDRs)" checked />
                  <Check label="Financial Transactions" checked />
                  <Check label="Locations (GPS, cell towers)" checked />
                  <Check label="Social Media (if available)" />
                  <Check label="Vehicles (RTO, ANPR data)" />
                </div>
              </div>

              <div>
                <h4 className="text-gray-400 font-medium mb-2 border-b border-border/50 pb-1">Analysis Modules</h4>
                <div className="space-y-2">
                  <Check label="Entity Extraction (People, phones, orgs)" checked />
                  <Check label="Relationship Mapping" checked />
                  <Check label="Timeline Generation" checked />
                  <Check label="Facial Matching (CCTV)" checked />
                  <Check label="Communication Analysis" checked />
                  <Check label="Financial Flow Analysis" checked />
                  <Check label="Geolocation Mapping" checked />
                  <Check label="Similarity Matching (across cases)" />
                  <Check label="Risk Scoring" />
                </div>
              </div>

              <div className="flex flex-col">
                <h4 className="text-gray-400 font-medium mb-2 border-b border-border/50 pb-1">Advanced Settings</h4>
                <div className="space-y-4 mb-auto">
                  <div>
                    <label className="text-gray-500 block mb-1">Date Range (if applicable)</label>
                    <div className="flex items-center space-x-2">
                      <input type="text" defaultValue="01-01-2024" className="w-full bg-[#030509] border border-border rounded px-2 py-1 text-white" />
                      <span className="text-gray-600">→</span>
                      <input type="text" defaultValue="31-12-2024" className="w-full bg-[#030509] border border-border rounded px-2 py-1 text-white" />
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-500 block mb-1">Case Context (optional)</label>
                    <textarea 
                      placeholder="e.g. focus on suspects, financial trail, CCTV analysis..." 
                      className="w-full bg-[#030509] border border-border rounded px-2 py-1.5 text-white h-16 resize-none"
                    ></textarea>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Use AI for advanced insights</span>
                    <div className="w-8 h-4 bg-primary/20 rounded-full relative border border-primary/50 cursor-pointer">
                      <div className="w-3 h-3 bg-primary rounded-full absolute right-0.5 top-0.5"></div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="w-full mt-4 bg-primary text-black font-semibold py-2 rounded hover:bg-primary-hover flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /><span>Processing...</span></>
                  ) : analyzed ? (
                    <><CheckCircle2 className="w-4 h-4" /><span>Complete</span></>
                  ) : (
                    <><Play className="w-4 h-4 fill-black" /><span>Start Analysis</span></>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column: Files & Logs */}
        <div className="col-span-4 flex flex-col space-y-4">
          
          {/* Uploaded Files Table */}
          <div className="glass-panel rounded-lg p-4 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-medium">Uploaded Files (8)</h3>
              <div className="flex space-x-2">
                <button className="text-primary border border-primary/30 bg-primary/5 px-2 py-1 rounded flex items-center space-x-1 hover:bg-primary/10">
                  <span>+</span><span>Add Files</span>
                </button>
                <button className="text-danger border border-danger/30 bg-danger/5 px-2 py-1 rounded flex items-center space-x-1 hover:bg-danger/10">
                  <AlertCircle className="w-3 h-3" /><span>Clear All</span>
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              <table className="w-full text-left">
                <thead className="text-gray-500 border-b border-border/50 sticky top-0 bg-[#0A0F1C]">
                  <tr>
                    <th className="pb-2 font-normal">Name</th>
                    <th className="pb-2 font-normal text-right">Size</th>
                    <th className="pb-2 font-normal text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  <FileRow name="FIR_1023_JewelryHeist.pdf" size="2.4 MB" status="Parsed" color="text-success" />
                  <FileRow name="CCTV_Mall_Entrance.mp4" size="256.3 MB" status="Processing 42%" color="text-primary" />
                  <FileRow name="Call_Detail_Records.csv" size="12.8 MB" status="Parsed" color="text-success" />
                  <FileRow name="Bank_Transactions.xlsx" size="5.1 MB" status="Parsed" color="text-success" />
                  <FileRow name="Suspects_List.docx" size="1.2 MB" status="Parsed" color="text-success" />
                  <FileRow name="Crime_Scene_Photos.zip" size="48.6 MB" status="Queued" color="text-gray-400" />
                </tbody>
              </table>
            </div>
          </div>

          {/* System Log */}
          <div className="glass-panel rounded-lg p-4 h-64 flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white font-medium flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>System Log</span>
              </h3>
              <select className="bg-[#030509] border border-border text-gray-400 text-[10px] rounded px-2 py-0.5 focus:outline-none">
                <option>All Activities</option>
              </select>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 text-[11px] font-mono">
              {loading && <LogEntry time="10:24:11" msg="Analysis started. Run ID: RUN-2026-0918-01" color="text-primary" />}
              <LogEntry time="10:24:08" msg="8 files queued for processing" />
              <LogEntry time="10:24:06" msg="File uploaded: Location_Data.kml (912 KB)" color="text-success" />
              <LogEntry time="10:24:03" msg="File uploaded: Witness_Statements.pdf (3.6 MB)" color="text-success" />
              <LogEntry time="10:24:01" msg="File uploaded: Crime_Scene_Photos.zip (48.6 MB)" color="text-success" />
              <LogEntry time="10:23:58" msg="File uploaded: Suspects_List.docx (1.2 MB)" color="text-success" />
              <LogEntry time="10:23:54" msg="File uploaded: Bank_Transactions.xlsx (5.1 MB)" color="text-success" />
            </div>
          </div>

        </div>

      </div>

      {/* Bottom Area: Recent Analyses */}
      <div className="mt-4 glass-panel rounded-lg p-4">
        <h3 className="text-white font-medium mb-3">Recent Analyses</h3>
        <table className="w-full text-left">
          <thead className="text-gray-500 border-b border-border/50">
            <tr>
              <th className="pb-2 font-normal">Run ID</th>
              <th className="pb-2 font-normal">Date & Time</th>
              <th className="pb-2 font-normal">Files</th>
              <th className="pb-2 font-normal">Modules</th>
              <th className="pb-2 font-normal">Status</th>
              <th className="pb-2 font-normal">Findings</th>
              <th className="pb-2 font-normal">Duration</th>
              <th className="pb-2 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            <tr>
              <td className="py-2 text-gray-300">RUN-2026-0918-01</td>
              <td className="py-2">18 Sep 2026, 10:24</td>
              <td className="py-2">8 files</td>
              <td className="py-2 truncate max-w-[150px]">All</td>
              <td className="py-2 text-primary flex items-center space-x-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span><span>Running</span></td>
              <td className="py-2">-</td>
              <td className="py-2 text-gray-500">12m 14s</td>
              <td className="py-2 text-right text-primary cursor-pointer hover:underline">View</td>
            </tr>
            <tr>
              <td className="py-2 text-gray-300">RUN-2026-0917-02</td>
              <td className="py-2">17 Sep 2026, 16:03</td>
              <td className="py-2">5 files</td>
              <td className="py-2 truncate max-w-[150px]">Documents, Calls, Locations</td>
              <td className="py-2 text-success flex items-center space-x-1.5"><span className="w-1.5 h-1.5 rounded-full bg-success"></span><span>Completed</span></td>
              <td className="py-2 text-white">28 entities</td>
              <td className="py-2 text-gray-500">4m 32s</td>
              <td className="py-2 text-right text-primary cursor-pointer hover:underline">View</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  )
}

function Step({ num, title, desc, active }) {
  return (
    <div className="flex items-start space-x-3 relative z-10">
      <div className={clsx(
        "w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 border mt-0.5",
        active ? "bg-[#060913] border-primary text-primary" : "bg-[#060913] border-border text-gray-600"
      )}>
        {num}
      </div>
      <div>
        <div className={clsx("font-medium text-[11px]", active ? "text-primary" : "text-gray-300")}>{title}</div>
        <div className="text-[10px] text-gray-600 leading-tight mt-0.5">{desc}</div>
      </div>
    </div>
  )
}

function Check({ label, checked }) {
  return (
    <label className="flex items-start space-x-2 cursor-pointer group">
      <input type="checkbox" defaultChecked={checked} className="mt-0.5 rounded-sm bg-[#030509] border-border text-primary focus:ring-primary focus:ring-offset-0 focus:ring-1" />
      <span className="text-gray-400 group-hover:text-gray-200 transition-colors">{label}</span>
    </label>
  )
}

function FileRow({ name, size, status, color }) {
  return (
    <tr>
      <td className="py-2">
        <div className="flex items-center space-x-2 text-gray-300">
          <FileIcon className="w-3 h-3 text-gray-500 shrink-0" />
          <span className="truncate max-w-[120px]" title={name}>{name}</span>
        </div>
      </td>
      <td className="py-2 text-right text-gray-500">{size}</td>
      <td className="py-2 text-center">
        <span className={clsx("flex justify-center items-center space-x-1.5", color)}>
          <span className={clsx("w-1.5 h-1.5 rounded-full", color.replace('text-', 'bg-'))}></span>
          <span>{status}</span>
        </span>
      </td>
    </tr>
  )
}

function LogEntry({ time, msg, color = "text-gray-400" }) {
  return (
    <div className="flex space-x-3">
      <span className="text-gray-600 shrink-0">{time}</span>
      <span className={color}>{msg}</span>
    </div>
  )
}
