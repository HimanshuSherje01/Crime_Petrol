import React, { useRef, useState } from 'react'
import {
  UploadCloud, Play, CheckCircle2, Loader2, MoreHorizontal, FileIcon, AlertCircle,
  AlertTriangle, Clock, RotateCcw, FolderOpen, FileText
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

export default function CaseImport() {
  const {
    cases, selectedCase, selectCase, analyzeCase, analyzeState, error,
    uploadedFiles, dashboardStats, resetCaseData, uploadFiles
  } = useStore()
  const navigate = useNavigate()
  const fileInputRef = useRef()
  const folderInputRef = useRef()
  const logRef = useRef()
  const [uploading, setUploading] = useState(false)

  const handleUploadAndAnalyze = async (e) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (files.length === 0 || !selectedCase) return
    setUploading(true)
    try {
      const ok = await uploadFiles(selectedCase, files)
      if (ok) {
        await analyzeCase(selectedCase)
        if (useStore.getState().analyzeState === 'ready') navigate('/network')
      }
    } finally {
      setUploading(false)
    }
  }

  const handleAnalyze = async () => {
    if (!selectedCase || analyzeState === 'loading' || uploading) return
    const ok = await analyzeCase(selectedCase)
    if (ok) navigate('/network')
  }

  const busy = analyzeState === 'loading' || uploading

  const caseMeta = {
    'case_A_flagship_jewelry_heist_gang': { name: 'Flagship Jewelry Heist Gang', priority: 'High' },
    'case_B_wadi_bike_snatching_ring': { name: 'Wadi Bike Snatching Ring', priority: 'Medium' },
    'case_C_dharampeth_burglary_series': { name: 'Dharampeth Burglary Series', priority: 'High' }
  }
  const meta = caseMeta[selectedCase] || {}

  const statusLabel = busy ? 'Analyzing'
    : analyzeState === 'ready' ? 'Analyzed'
    : analyzeState === 'error' ? 'Failed'
    : 'Not Analyzed'

  const statusColor =
    analyzeState === 'ready' ? 'text-success' :
    analyzeState === 'error' ? 'text-danger' :
    busy ? 'text-primary' : 'text-gray-400'

  const logTime = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <div className="flex flex-col h-full bg-[#050914] text-[#94A3B8] p-4 font-sans text-xs">

      {/* Case Header Area */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-xl font-bold text-white">Case: {selectedCase || 'No case selected'}</h1>
            <span className="bg-success/10 text-success border border-success/30 px-2 py-0.5 rounded text-[10px] font-medium tracking-wide uppercase">Active</span>
            <button className="text-gray-500 hover:text-white"><MoreHorizontal className="w-4 h-4" /></button>
          </div>
          <p className="text-gray-500 text-[11px]">{meta.name || 'Select a case, upload evidence, and run analysis to uncover connections'}</p>
        </div>

        <div className="flex space-x-8 text-right bg-[#0A0F1C] border border-border p-3 rounded-lg">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500">Case ID</div>
            <div className="text-white font-medium max-w-[260px] truncate">{selectedCase || '—'}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500">Priority</div>
            <div className={clsx("font-medium", meta.priority === 'High' ? 'text-danger' : 'text-amber-500')}>{meta.priority || '—'}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500">Status</div>
            <div className={clsx("font-medium flex items-center justify-end space-x-1", statusColor)}>
              {busy && <Loader2 className="w-3 h-3 animate-spin" />}
              <span className={clsx("w-1.5 h-1.5 rounded-full", statusColor.replace('text-', 'bg-'))}></span>
              <span>{statusLabel}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto grid grid-cols-12 gap-4">

        {/* Left Column: Upload & Analyze */}
        <div className="col-span-8 flex flex-col space-y-4">

          {/* Upload / Run Analysis Area */}
          <div className="glass-panel rounded-lg p-4 flex flex-col flex-1">
            <div className="flex space-x-6 border-b border-border/50 mb-4 pb-2">
              <button className="text-primary font-medium border-b border-primary pb-2 -mb-[9px]">Import & Analyze</button>
              <button className="text-gray-500 hover:text-gray-300">Connect Data Sources</button>
              <button className="text-gray-500 hover:text-gray-300">Manual Input</button>
            </div>

            <div className="flex space-x-4 h-full">
              {/* Drop zone + case selector + actions */}
              <div className="flex-1 border border-dashed border-[#1E293B] rounded-lg bg-[#060913] flex flex-col items-center justify-center p-6 text-center">
                <div className="mb-4">
                  {busy ? (
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-3 mx-auto" />
                  ) : analyzeState === 'ready' ? (
                    <CheckCircle2 className="w-10 h-10 text-success mb-3 mx-auto" />
                  ) : analyzeState === 'error' ? (
                    <AlertTriangle className="w-10 h-10 text-danger mb-3 mx-auto" />
                  ) : (
                    <UploadCloud className="w-10 h-10 text-primary mb-3" />
                  )}
                  <h3 className="text-white font-medium text-sm mb-1">
                    {uploading ? 'Uploading evidence...' :
                     busy ? 'Running Intelligence Pipeline' :
                     analyzeState === 'ready' ? 'Analysis Complete' :
                     analyzeState === 'error' ? 'Analysis Failed' : 'Upload evidence or run analysis'}
                  </h3>
                  <p className="text-gray-500 text-[11px] leading-relaxed max-w-sm mx-auto">
                    {analyzeState === 'ready'
                      ? `Extracted ${dashboardStats.nodes} entities, ${dashboardStats.edges} connections and ${dashboardStats.alerts} alerts.`
                      : 'Upload a case folder (PDFs, images, audio, CSV, text) — the pipeline runs OCR, Whisper, entity extraction, relationship mapping and graph construction.'}
                  </p>
                </div>

                {/* Case selector */}
                <div className="flex items-center space-x-3 mb-4">
                  <label className="text-[10px] uppercase tracking-wider text-gray-500">Case</label>
                  <select
                    value={selectedCase || ''}
                    onChange={e => selectCase(e.target.value)}
                    disabled={busy}
                    className="bg-background border border-border text-white text-xs rounded px-2 py-1.5 min-w-[260px] disabled:opacity-50 cursor-pointer"
                  >
                    {cases.length === 0 && <option value="">No cases available on server</option>}
                    {cases.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Hidden file inputs */}
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  onChange={handleUploadAndAnalyze}
                  className="hidden"
                />
                <input
                  type="file"
                  multiple
                  webkitdirectory="true"
                  directory="true"
                  ref={folderInputRef}
                  onChange={handleUploadAndAnalyze}
                  className="hidden"
                />

                <div className="flex space-x-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={busy || !selectedCase}
                    className="px-4 py-2 border border-primary text-primary rounded hover:bg-primary/10 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Browse Files</span>
                  </button>
                  <button
                    onClick={() => folderInputRef.current?.click()}
                    disabled={busy || !selectedCase}
                    className="px-4 py-2 border border-primary/60 text-primary bg-primary/5 rounded hover:bg-primary/20 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Upload Folder</span>
                  </button>
                  <button
                    onClick={handleAnalyze}
                    disabled={busy || !selectedCase}
                    className="px-5 py-2 bg-primary text-black font-semibold rounded hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {busy ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /><span>Analyzing...</span></>
                    ) : analyzeState === 'ready' ? (
                      <><RotateCcw className="w-4 h-4" /><span>Re-run Analysis</span></>
                    ) : (
                      <><Play className="w-4 h-4 fill-black" /><span>Run Analysis</span></>
                    )}
                  </button>
                </div>

                {analyzeState === 'error' && (
                  <p className="mt-3 text-danger text-[10px] max-w-xs">{error}</p>
                )}

                <div className="mt-6 text-[10px] text-gray-600">
                  <p>Supported: PDF, DOCX, XLSX, CSV, JPG, PNG, MP4, MP3, WAV, JSON, KML, ZIP</p>
                  <p className="mt-0.5">Pipeline: OCR → Whisper → spaCy entities → relationship extraction → resolution → NetworkX graph → alerts → ground truth</p>
                </div>
              </div>

              {/* What happens during analysis */}
              <div className="w-64 pl-4 border-l border-border/50 flex flex-col justify-center">
                <h4 className="text-white font-medium mb-4">What happens during analysis?</h4>
                <div className="space-y-4 relative">
                  <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border/50 z-0"></div>
                  <Step num="1" title="Data extraction" desc="OCR on images, Whisper on audio, parse CSV and text evidence" active={busy} />
                  <Step num="2" title="Entity extraction" desc="People, phones, locations, vehicles, banks, FIRs" active={busy} />
                  <Step num="3" title="Relationship mapping" desc="Link entities co-mentioned in the same evidence" active={busy} />
                  <Step num="4" title="Resolution & linking" desc="Resolve duplicates and aliases" active={busy} />
                  <Step num="5" title="Analysis & alerts" desc="Risk scoring, patterns, and threat detections" active={busy} />
                  <Step num="6" title="Ground truth check" desc="Compare against known case entities" active={busy} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Files & Logs */}
        <div className="col-span-4 flex flex-col space-y-4">

          {/* Processed Files Table */}
          <div className="glass-panel rounded-lg p-4 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-medium">Processed Files ({(uploadedFiles || []).length})</h3>
              <button
                onClick={() => { if (window.confirm('Reset the workspace view? Data on the server is kept.')) resetCaseData() }}
                className="text-danger border border-danger/30 bg-danger/5 px-2 py-1 rounded flex items-center space-x-1 hover:bg-danger/10 cursor-pointer"
              >
                <AlertCircle className="w-3 h-3" /><span>Reset View</span>
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              <table className="w-full text-left">
                <thead className="text-gray-500 border-b border-border/50 sticky top-0 bg-[#0A0F1C]">
                  <tr>
                    <th className="pb-2 font-normal">Name</th>
                    <th className="pb-2 font-normal">Source</th>
                    <th className="pb-2 font-normal text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {!(uploadedFiles && uploadedFiles.length > 0) && (
                    <tr>
                      <td colSpan="3" className="py-6 text-center text-gray-600">
                        {busy
                          ? <span className="flex items-center justify-center space-x-2 text-primary"><Loader2 className="w-3 h-3 animate-spin" /><span>{uploading ? 'Uploading files...' : 'Reading evidence folder...'}</span></span>
                          : 'No files processed yet. Upload a folder or run analysis to see processed files.'}
                      </td>
                    </tr>
                  )}
                  {uploadedFiles?.map((f, i) => (
                    <FileRow key={f.name + i} name={f.name} type={f.type || f.source_type || '—'} status={f.status || 'Parsed'} bname={f.filename} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pipeline Log */}
          <div className="glass-panel rounded-lg p-4 h-64 flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white font-medium flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Pipeline Log</span>
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 text-[11px] font-mono" ref={logRef}>
              {analyzeState === 'idle' && !uploading && (
                <LogEntry time={logTime()} msg="Awaiting user action. Upload a folder or click Run Analysis." />
              )}
              {uploading && (
                <LogEntry time={logTime()} msg={`Uploading ${uploadedFiles.length || ''} files to server...`} color="text-primary" />
              )}
              {busy && !uploading && (
                <>
                  <LogEntry time={logTime()} msg={`Analysis started for ${selectedCase}`} color="text-primary" />
                  <LogEntry time={logTime()} msg="Step 1: Parsing evidence (OCR / Whisper / CSV / text)..." color="text-primary" />
                  <LogEntry time={logTime()} msg="Step 2: Extracting entities (people, phones, locations, vehicles, banks, FIRs)..." />
                  <LogEntry time={logTime()} msg="Step 3: Mapping relationships between co-mentioned entities..." />
                  <LogEntry time={logTime()} msg="Step 4: Resolving duplicates and aliases..." />
                  <LogEntry time={logTime()} msg="Step 5: Running graph analytics and generating alerts..." />
                </>
              )}
              {analyzeState === 'ready' && (
                <>
                  <LogEntry time={logTime()} msg={`Analysis completed for ${selectedCase}`} color="text-success" />
                  <LogEntry time={logTime()} msg={`Extracted ${dashboardStats.nodes} entities`} color="text-success" />
                  <LogEntry time={logTime()} msg={`Built ${dashboardStats.edges} relationships`} color="text-success" />
                  <LogEntry time={logTime()} msg={`Generated ${dashboardStats.alerts} alerts`} color="text-success" />
                  <LogEntry time={logTime()} msg={`Ground truth match: ${dashboardStats.gtMatch}%`} color="text-success" />
                </>
              )}
              {analyzeState === 'error' && (
                <LogEntry time={logTime()} msg={`Analysis failed: ${error}`} color="text-danger" />
              )}
            </div>
          </div>

        </div>

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

function FileRow({ name, type, status, bname }) {
  return (
    <tr>
      <td className="py-2">
        <div className="flex items-center space-x-2 text-gray-300">
          <FileIcon className="w-3 h-3 text-gray-500 shrink-0" />
          <span className="truncate max-w-[140px]" title={bname || name}>{bname || name}</span>
        </div>
      </td>
      <td className="py-2 text-gray-500">{type || '—'}</td>
      <td className="py-2 text-center">
        <span className="flex justify-center items-center space-x-1.5 text-success">
          <span className="w-1.5 h-1.5 bg-success rounded-full"></span>
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