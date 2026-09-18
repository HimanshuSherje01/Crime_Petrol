import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import axios from 'axios'

const API_URL = 'http://localhost:8000/api'

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
  }
}))
