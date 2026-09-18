import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import axios from 'axios'

const API_URL = '/api'

export const useStore = create((set, get) => ({
  user: null,
  cases: [],
  selectedCase: null,
  loading: false,
  graphData: { nodes: [], edges: [] },
  players: [],
  alerts: [],
  dashboardStats: { gtMatch: 0 },

  setUser: (user) => set({ user }),
  
  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null })
  },

  fetchCases: async () => {
    try {
      const res = await axios.get(`${API_URL}/cases`)
      set({ cases: res.data })
      
      // Auto-select first case if none is selected (prevents "No Case Selected" on reload)
      if (res.data.length > 0 && !get().selectedCase) {
        get().selectCase(res.data[0])
      }
    } catch (e) {
      console.error(e)
    }
  },

  selectCase: (caseId) => {
    set({ selectedCase: caseId })
    get().fetchCaseData(caseId)
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
      
      set({
        graphData: graphRes.data,
        players: playersRes.data,
        alerts: alertsRes.data,
        dashboardStats: { gtMatch: gtRes.data.match_percentage },
        loading: false
      })
    } catch (e) {
      console.error(e)
      set({ loading: false })
    }
  },

  analyzeCase: async (caseId) => {
    set({ loading: true })
    try {
      await axios.post(`${API_URL}/analyze/${caseId}`)
      await get().fetchCaseData(caseId)
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

  uploadFile: async (caseId, file) => {
    const formData = new FormData()
    formData.append('file', file)
    try {
      await axios.post(`${API_URL}/upload/${caseId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      // Refresh files list after upload
      await get().fetchFiles(caseId)
    } catch (e) {
      console.error(e)
    }
  },

  fetchFiles: async (caseId) => {
    try {
      const res = await axios.get(`${API_URL}/files/${caseId}`)
      set({ uploadedFiles: res.data }) // Need to add uploadedFiles to initial state
    } catch (e) {
      console.error(e)
    }
  },

  fetchAnalyses: async (caseId) => {
    try {
      const res = await axios.get(`${API_URL}/analyses/${caseId}`)
      set({ recentAnalyses: res.data }) // Need to add recentAnalyses to initial state
    } catch (e) {
      console.error(e)
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
  }
}))

