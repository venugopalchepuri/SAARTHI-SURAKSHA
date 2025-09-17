/*
  Edge function to detect location anomalies
  Analyzes recent location data for suspicious patterns
*/

import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

interface AnomalyRequest {
  trip_id: string
  current_location: {
    lat: number
    lng: number
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const { trip_id, current_location }: AnomalyRequest = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch last 5 locations
    const { data: locations, error } = await supabase
      .from('locations')
      .select('*')
      .eq('trip_id', trip_id)
      .order('captured_at', { ascending: false })
      .limit(5)

    if (error || !locations || locations.length < 2) {
      return new Response(
        JSON.stringify({ anomalies: [] }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        },
      )
    }

    const anomalies: any[] = []
    
    // Check for teleportation (sudden large distance jumps)
    if (locations.length >= 2) {
      const lastLoc = locations[0]
      const distance = calculateDistance(
        current_location.lat,
        current_location.lng,
        lastLoc.lat,
        lastLoc.lng
      )
      
      const timeDiff = (Date.now() - new Date(lastLoc.captured_at).getTime()) / 1000 / 60 // minutes
      const speedKmh = (distance / 1000) / (timeDiff / 60) // km/h
      
      if (speedKmh > 150) { // Unrealistic speed
        anomalies.push({
          type: 'TELEPORT',
          details: {
            distance_km: distance / 1000,
            time_minutes: timeDiff,
            speed_kmh: speedKmh
          }
        })
      }
    }

    // Check for drop-off (no movement for extended period)
    if (locations.length >= 3) {
      const recentDistances = []
      for (let i = 0; i < locations.length - 1; i++) {
        const dist = calculateDistance(
          locations[i].lat,
          locations[i].lng,
          locations[i + 1].lat,
          locations[i + 1].lng
        )
        recentDistances.push(dist)
      }
      
      const maxRecentDistance = Math.max(...recentDistances)
      if (maxRecentDistance < 30) { // Less than 30m movement in last few updates
        anomalies.push({
          type: 'DROP_OFF',
          details: {
            max_movement_m: maxRecentDistance,
            duration_checks: locations.length
          }
        })
      }
    }

    // Create alerts for detected anomalies
    for (const anomaly of anomalies) {
      await supabase.from('alerts').insert({
        trip_id,
        type: 'ANOMALY',
        details: anomaly
      })
    }

    return new Response(
      JSON.stringify({ 
        anomalies,
        location_count: locations.length 
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      },
    )
  } catch (error) {
    console.error('Error computing anomalies:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to compute anomalies' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      },
    )
  }
})

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI / 180)
  const Δλ = ((lng2 - lng1) * Math.PI / 180)

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ/2) * Math.sin(Δλ/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

  return R * c
}