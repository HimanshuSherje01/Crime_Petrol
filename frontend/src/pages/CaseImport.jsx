import React from 'react'
import { UploadCloud, FileText, FileSpreadsheet, Image as ImageIcon, Video, Music, FileJson, Archive, CheckCircle2, Trash2 } from 'lucide-react'

export default function CaseImport() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center text-sm text-gray-400 space-x-2">
        <span>Case</span>
        <span>›</span>
        <span className="text-white">Import Data</span>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Import Case Data</h2>
          <p className="text-gray-400">Upload and integrate all available evidence and data sources. Our system will extract entities, relationships and build the intelligence graph.</p>
        </div>
        
        {/* Stepper */}
        <div className="flex items-center space-x-8 text-sm">
          <Step active num="1" label="Import Data" />
          <div className="w-16 h-px bg-border" />
          <Step num="2" label="Configure" />
          <div className="w-16 h-px bg-border" />
          <Step num="3" label="Analyze" />
          <div className="w-16 h-px bg-border" />
          <Step num="4" label="Results" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mt-8">
        <div className="col-span-2 space-y-6">
          {/* Upload Zone */}
          <div className="border-2 border-dashed border-primary/50 rounded-2xl p-12 flex flex-col items-center justify-center bg-card/30 hover:bg-card/50 transition-colors cursor-pointer group">
            <UploadCloud className="w-16 h-16 text-primary mb-4 group-hover:scale-110 transition-transform" />
            <p className="text-xl font-semibold text-white mb-2">Drag & drop files here</p>
            <p className="text-gray-400 mb-6">or click to browse from your device</p>
            <button className="px-6 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors">
              Choose Files
            </button>
            <p className="text-xs text-gray-500 mt-4">You can upload multiple files at once</p>
          </div>

          {/* Supported Types */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3">Supported File Types</h3>
            <div className="flex flex-wrap gap-3">
              <TypeBadge icon={FileText} label="Documents" sub="(PDF, DOCX, TXT)" color="text-danger" />
              <TypeBadge icon={FileSpreadsheet} label="Spreadsheets" sub="(XLSX, CSV)" color="text-success" />
              <TypeBadge icon={ImageIcon} label="Images" sub="(JPG, PNG)" color="text-primary" />
              <TypeBadge icon={Video} label="Video" sub="(MP4, AVI, MOV)" color="text-purple-400" />
              <TypeBadge icon={Music} label="Audio" sub="(MP3, WAV)" color="text-amber-400" />
            </div>
          </div>

          {/* Uploaded Files */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Uploaded Files (5)</h3>
              <button className="flex items-center space-x-2 text-danger text-sm border border-danger/30 px-3 py-1.5 rounded-lg hover:bg-danger/10">
                <Trash2 className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            </div>
            
            <table className="w-full text-left text-sm">
              <thead className="text-gray-400 border-b border-border">
                <tr>
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Size</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-gray-300">
                <FileRow name="FIR_1023_JewelryHeist.pdf" type="PDF" size="2.4 MB" icon={FileText} color="text-danger" />
                <FileRow name="Call_Detail_Records.csv" type="CSV" size="12.8 MB" icon={FileSpreadsheet} color="text-gray-400" />
                <FileRow name="CCTV_Footage_1.mp4" type="MP4" size="256.3 MB" icon={Video} color="text-primary" />
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-span-1 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center space-x-2">
              <Archive className="w-5 h-5 text-gray-400" />
              <span>Case Information</span>
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <label className="text-gray-400 block mb-1">Case Name</label>
                <input type="text" defaultValue="Flagship Jewelry Heist" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white" />
              </div>
              <div>
                <label className="text-gray-400 block mb-1">Case ID</label>
                <input type="text" defaultValue="CH-2026-1023" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-white mb-4">Analysis Options</h3>
            <div className="space-y-4 text-sm">
              <Checkbox label="Entity Extraction" desc="Extract people, phones, locations" checked />
              <Checkbox label="Relationship Mapping" desc="Identify connections" checked />
              <Checkbox label="CCTV Analysis" desc="Process video files" checked />
              <Checkbox label="Communication Analysis" desc="Process call records" checked />
            </div>

            <button className="w-full bg-primary text-background font-semibold py-3 rounded-lg mt-6 hover:bg-primary/90 flex justify-center items-center space-x-2">
              <span>Analyze Case</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Step({ active, num, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mb-2 ${active ? 'border-primary text-primary' : 'border-border text-gray-500'}`}>
        {num}
      </div>
      <span className={active ? 'text-primary' : 'text-gray-500'}>{label}</span>
    </div>
  )
}

function TypeBadge({ icon: Icon, label, sub, color }) {
  return (
    <div className="flex items-center space-x-3 bg-card border border-border px-4 py-2 rounded-lg">
      <Icon className={`w-6 h-6 ${color}`} />
      <div className="flex flex-col">
        <span className="text-sm font-medium text-white">{label}</span>
        <span className="text-xs text-gray-500">{sub}</span>
      </div>
    </div>
  )
}

function FileRow({ name, type, size, icon: Icon, color }) {
  return (
    <tr>
      <td className="py-3 flex items-center space-x-3">
        <Icon className={`w-5 h-5 ${color}`} />
        <span>{name}</span>
      </td>
      <td className="py-3">{type}</td>
      <td className="py-3">{size}</td>
      <td className="py-3">
        <div className="flex items-center space-x-1 text-success">
          <CheckCircle2 className="w-4 h-4" />
          <span>Ready</span>
        </div>
      </td>
      <td className="py-3 text-right">
        <button className="text-gray-500 hover:text-danger"><Trash2 className="w-4 h-4 ml-auto" /></button>
      </td>
    </tr>
  )
}

function Checkbox({ label, desc, checked }) {
  return (
    <label className="flex items-start space-x-3 cursor-pointer">
      <input type="checkbox" defaultChecked={checked} className="mt-1 rounded bg-background border-border text-primary focus:ring-primary" />
      <div>
        <p className="text-white font-medium">{label}</p>
        <p className="text-gray-500 text-xs">{desc}</p>
      </div>
    </label>
  )
}
