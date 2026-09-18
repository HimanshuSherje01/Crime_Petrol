import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import axios from 'axios'

const API_URL = '/api'

const freshDashboard = () => ({ gtMatch: 0, nodes: 0, edges: 0, players: 0, alerts: 0 })

const formatTimestamp = (date) =>
  new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  }).format(date)

export const useStore = create((set, get) => ({
  user: null,
  cases: [],
  selectedCase: null,
  analyzeState: 'idle', // idle | loading | ready | error
  error: null,
  graphData: { nodes: [], edges: [] },
  players: [],
  alerts: [],
  dashboardStats: freshDashboard(),
  uploadedFiles: [],
  recentAnalyses: [],

  setUser: (user) => set({ user }),

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null })
  },

  fetchCases: async () => {
    try {
      const res = await axios.get(`${API_URL}/cases`)
      set({ cases: res.data })
      // Default to the first available case
      if (res.data.length > 0 && !get().selectedCase) {
        set({ selectedCase: res.data[0] })
      }
    } catch (e) {
      console.error(e)
    }
  },

  selectCase: (caseId) => {
    if (caseId === get().selectedCase) return
    set({
      selectedCase: caseId,
      analyzeState: 'idle',
      error: null,
      graphData: { nodes: [], edges: [] },
      players: [],
      alerts: [],
      dashboardStats: freshDashboard(),
      uploadedFiles: [],
      recentAnalyses: [],
    })
    // Pull any historical run history for this case (does not populate graph)
    get().fetchAnalyses(caseId)
  },

  analyzeCase: async (caseId) => {
    if (!caseId) return false
    const state = get()
    if (state.analyzeState === 'loading') return false

    // Optimistic "Running" row so Recent Analyses shows a spinner during the pipeline
    const runningRow = {
      id: `RUN-${Date.now()}`,
      date: formatTimestamp(new Date()),
      files: '...',
      findings: 'Running OCR / Whisper / entity extraction...',
      duration: '...',
      status: 'Running',
    }
    set({
      analyzeState: 'loading',
      error: null,
      recentAnalyses: [runningRow, ...state.recentAnalyses.filter(r => r.status !== 'Running')],
    })

    try {
      const res = await axios.post(`${API_URL}/analyze/${caseId}`)
      const data = res.data

      const counts = freshDashboard()
      counts.nodes = data.graph?.nodes?.length || 0
      counts.edges = data.graph?.edges?.length || 0
      counts.players = data.players?.length || 0
      counts.alerts = data.alerts?.length || 0
      counts.gtMatch = data.ground_truth?.match_percent ?? 0

      const completedRun = data.run || {
        ...runningRow,
        status: 'Completed',
        files: data.files_processed?.length || 0,
      }

      set({
        graphData: data.graph || { nodes: [], edges: [] },
        players: data.players || [],
        alerts: data.alerts || [],
        dashboardStats: counts,
        uploadedFiles: data.files_processed || [],
        recentAnalyses: [completedRun, ...get().recentAnalyses.filter(r => r.status !== 'Running')],
        analyzeState: 'ready',
      })
      return true
    } catch (e) {
      console.error(e)
      set({
        analyzeState: 'error',
        error: e.response?.data?.detail || e.message || 'Analysis failed',
        recentAnalyses: get().recentAnalyses.map(r =>
          r.status === 'Running' ? { ...r, status: 'Failed' } : r
        ),
      })
      return false
    }
  },

  resetCaseData: () => {
    set({
      analyzeState: 'idle',
      error: null,
      graphData: { nodes: [], edges: [] },
      players: [],
      alerts: [],
      dashboardStats: freshDashboard(),
      uploadedFiles: [],
    })
  },

  fetchCaseData: async (caseId) => {
    set({ loading: true })
    try {
      const [graphRes, playersRes, alertsRes, gtRes] = await Promise.all([
        axios.get(`${API_URL}/graph?case_id=${caseId}`),
        axios.get(`${API_URL}/players?case_id=${caseId}`),
        axios.get(`${API_URL}/alerts?case_id=${caseId}`),
        axios.get(`${API_URL}/ground-truth/${caseId}`)
      ])

      const counts = freshDashboard()
      counts.nodes = graphRes.data.nodes?.length || 0
      counts.edges = graphRes.data.edges?.length || 0
      counts.players = playersRes.data.length || 0
      counts.alerts = alertsRes.data.length || 0
      counts.gtMatch = gtRes.data.match_percent ?? 0

      set({
        graphData: graphRes.data,
        players: playersRes.data,
        alerts: alertsRes.data,
        dashboardStats: counts,
        analyzeState: 'ready',
        loading: false
      })
    } catch (e) {
      console.error(e)
      set({ loading: false })
    }
  },

  fetchEntityDetails: async (entityId) => {
    try {
      const res = await axios.get(`${API_URL}/entity/${entityId}`)
      return res.data
    } catch (e) {
      console.error(e)
      return null
    }
  },

  fetchFiles: async (caseId) => {
    try {
      const res = await axios.get(`${API_URL}/files/${caseId}`)
      set({ uploadedFiles: res.data })
    } catch (e) {
      console.error(e)
    }
  },

  fetchAnalyses: async (caseId) => {
    try {
      const res = await axios.get(`${API_URL}/analyses/${caseId}`)
      set({ recentAnalyses: res.data })
    } catch (e) {
      console.error(e)
    }
  },

  uploadFiles: async (caseId, fileList) => {
    const formData = new FormData()
    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i]
      // Preserve the folder structure from webkitdirectory uploads
      const relPath = (f.webkitRelativePath || '').split('/').slice(1).join('/') || f.name
      formData.append('files', f, relPath)
    }
    try {
      await axios.post(`${API_URL}/upload/${caseId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      await get().fetchFiles(caseId)
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  },

  fetchEntitiesByType: async (type) => {
    try {
      const res = await axios.get(`${API_URL}/entities/type/${type}`)
      return res.data
    } catch (e) {
      console.error(e)
      return []
    }
  },

  fetchTimeline: async (caseId) => {
    try {
      const res = await axios.get(`${API_URL}/timeline/${caseId}`)
      return res.data
    } catch (e) {
      console.error(e)
      return []
    }
  }
}))