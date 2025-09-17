import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          role: 'TOURIST' | 'POLICE' | 'TOURISM'
          lang: string
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: 'TOURIST' | 'POLICE' | 'TOURISM'
          lang?: string
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: 'TOURIST' | 'POLICE' | 'TOURISM'
          lang?: string
          created_at?: string
        }
      }
      trips: {
        Row: {
          id: string
          user_id: string
          itinerary: any
          emergency: any
          safety_score: number
          vc_hash: string | null
          valid_from: string
          valid_to: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          itinerary: any
          emergency: any
          safety_score?: number
          vc_hash?: string | null
          valid_from: string
          valid_to: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          itinerary?: any
          emergency?: any
          safety_score?: number
          vc_hash?: string | null
          valid_from?: string
          valid_to?: string
          created_at?: string
        }
      }
      locations: {
        Row: {
          id: number
          trip_id: string
          lat: number
          lng: number
          speed_kmh: number | null
          accuracy_m: number | null
          captured_at: string
        }
        Insert: {
          trip_id: string
          lat: number
          lng: number
          speed_kmh?: number | null
          accuracy_m?: number | null
          captured_at?: string
        }
        Update: {
          id?: number
          trip_id?: string
          lat?: number
          lng?: number
          speed_kmh?: number | null
          accuracy_m?: number | null
          captured_at?: string
        }
      }
      alerts: {
        Row: {
          id: string
          trip_id: string
          type: 'PANIC' | 'GEOFENCE' | 'ANOMALY'
          status: 'OPEN' | 'ACK' | 'RESOLVED'
          details: any
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          type: 'PANIC' | 'GEOFENCE' | 'ANOMALY'
          status?: 'OPEN' | 'ACK' | 'RESOLVED'
          details?: any
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          type?: 'PANIC' | 'GEOFENCE' | 'ANOMALY'
          status?: 'OPEN' | 'ACK' | 'RESOLVED'
          details?: any
          created_at?: string
        }
      }
      places: {
        Row: {
          id: string
          name: string
          kind: 'eat' | 'shop' | 'spot'
          rating: number
          geom: any
        }
      }
    }
  }
}