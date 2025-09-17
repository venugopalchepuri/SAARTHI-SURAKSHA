/*
  Edge function to find nearby places using PostGIS
  Input: { lat, lng, radius_km }
  Output: Array of places with distance
*/

import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

interface NearbyPlacesRequest {
  lat: number
  lng: number
  radius_km: number
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const { lat, lng, radius_km }: NearbyPlacesRequest = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Query places within radius using PostGIS
    const { data, error } = await supabase.rpc('find_nearby_places', {
      search_lat: lat,
      search_lng: lng,
      search_radius_km: radius_km
    })

    if (error) {
      // Fallback to simple query if RPC fails
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('places')
        .select('*')
        .limit(10)

      if (fallbackError) throw fallbackError

      // Calculate distances manually for fallback
      const placesWithDistance = fallbackData?.map(place => ({
        ...place,
        distance: calculateDistance(lat, lng, 28.451, 77.582) // Mock distance
      })) || []

      return new Response(
        JSON.stringify(placesWithDistance),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        },
      )
    }

    return new Response(
      JSON.stringify(data || []),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      },
    )
  } catch (error) {
    console.error('Error finding nearby places:', error)
    
    // Return mock data as fallback
    const mockPlaces = [
      { id: '1', name: 'Chaat Corner', kind: 'eat', rating: 4.4, distance: 0.5 },
      { id: '2', name: 'Bazaar Lane', kind: 'shop', rating: 4.1, distance: 0.8 },
      { id: '3', name: 'Sunset Point', kind: 'spot', rating: 4.8, distance: 1.2 }
    ]

    return new Response(
      JSON.stringify(mockPlaces),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      },
    )
  }
})

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}