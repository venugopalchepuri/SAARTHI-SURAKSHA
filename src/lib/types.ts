export interface Trip {
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

export interface Location {
  id: number
  trip_id: string
  lat: number
  lng: number
  speed_kmh: number | null
  accuracy_m: number | null
  captured_at: string
}

export interface Alert {
  id: string
  trip_id: string
  type: 'PANIC' | 'GEOFENCE' | 'ANOMALY'
  status: 'OPEN' | 'ACK' | 'RESOLVED'
  details: any
  created_at: string
}

export interface Place {
  id: string
  name: string
  kind: 'eat' | 'shop' | 'spot'
  rating: number
  distance?: number
}

export interface Profile {
  id: string
  full_name: string | null
  role: 'TOURIST' | 'POLICE' | 'TOURISM'
  lang: 'en' | 'hi'
  created_at: string
}