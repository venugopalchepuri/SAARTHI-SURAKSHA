import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  language: 'en' | 'hi'
  setLanguage: (lang: 'en' | 'hi') => void
  safetyScore: number
  setSafetyScore: (score: number) => void
  badgeTier: 'bronze' | 'silver' | 'gold'
  setBadgeTier: (tier: 'bronze' | 'silver' | 'gold') => void
  showConfetti: boolean
  setShowConfetti: (show: boolean) => void
  currentLocation: { lat: number; lng: number } | null
  setCurrentLocation: (location: { lat: number; lng: number } | null) => void
  isTracking: boolean
  setIsTracking: (tracking: boolean) => void
  activeTripId: string | null
  setActiveTripId: (tripId: string | null) => void
  
  // New features
  monumentsViewed: number
  setMonumentsViewed: (count: number) => void
  ecoVisits: number
  setEcoVisits: (count: number) => void
  culturalExplorerBadge: boolean
  setCulturalExplorerBadge: (earned: boolean) => void
  largeSosMode: boolean
  setLargeSosMode: (enabled: boolean) => void
  voiceSosEnabled: boolean
  setVoiceSosEnabled: (enabled: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist((set) => ({
  language: 'en',
  setLanguage: (lang) => set({ language: lang }),
  safetyScore: 100,
  setSafetyScore: (score) => set({ safetyScore: score }),
  badgeTier: 'gold',
  setBadgeTier: (tier) => set({ badgeTier: tier }),
  showConfetti: false,
  setShowConfetti: (show) => set({ showConfetti: show }),
  currentLocation: null,
  setCurrentLocation: (location) => set({ currentLocation: location }),
  isTracking: false,
  setIsTracking: (tracking) => set({ isTracking: tracking }),
  activeTripId: null,
    setActiveTripId: (tripId) => set({ activeTripId: tripId }),
    
    // New features
    monumentsViewed: 0,
    setMonumentsViewed: (count) => set({ monumentsViewed: count }),
    ecoVisits: 0,
    setEcoVisits: (count) => set({ ecoVisits: count }),
    culturalExplorerBadge: false,
    setCulturalExplorerBadge: (earned) => set({ culturalExplorerBadge: earned }),
    largeSosMode: false,
    setLargeSosMode: (enabled) => set({ largeSosMode: enabled }),
    voiceSosEnabled: false,
    setVoiceSosEnabled: (enabled) => set({ voiceSosEnabled: enabled })
  }), {
    name: 'saarthi-storage',
  })
)