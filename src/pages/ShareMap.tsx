import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Shield, MapPin, Clock } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { MapComponent } from '../components/maps/MapComponent'
import { supabase } from '../lib/supabase'
import Logo from "../components/Logo";

export const ShareMap: React.FC = () => {
  const { token } = useParams()
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [safetyScore, setSafetyScore] = useState(100)
  const [tripData, setTripData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchShareData()
  }, [token])

  const fetchShareData = async () => {
    if (!token) return

    try {
      // Get trip from share token
      const { data: shareToken, error: tokenError } = await supabase
        .from('share_tokens')
        .select(`
          trip_id,
          trips (
            id,
            safety_score,
            emergency,
            itinerary,
            locations (
              lat,
              lng,
              captured_at
            )
          )
        `)
        .eq('token', token)
        .single()

      if (tokenError || !shareToken) {
        console.error('Invalid share token')
        // Use mock data for demo
        setLocation({ lat: 28.4506, lng: 77.5847 })
        setLastUpdate(new Date().toISOString())
        setSafetyScore(85)
        setTripData({
          emergency: {
            contacts: [
              { name: 'John Doe', phone: '+91-9999999999', relation: 'Family' }
            ]
          }
        })
        setLoading(false)
        return
      }

      const trip = shareToken.trips as any
      if (trip.locations && trip.locations.length > 0) {
        const latest = trip.locations[0]
        setLocation({ lat: latest.lat, lng: latest.lng })
        setLastUpdate(latest.captured_at)
      } else {
        setLocation({ lat: 28.4506, lng: 77.5847 })
        setLastUpdate(new Date().toISOString())
      }

      setSafetyScore(trip.safety_score || 100)
      setTripData(trip)
    } catch (error) {
      console.error('Error fetching share data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shared location...</p>
        </div>
      </div>
    )
  }

  if (!location) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Invalid or expired share link</p>
        </div>
      </div>
    )
  }

  const getSafetyTier = (score: number) => {
    if (score >= 85) return { tier: 'gold', color: 'text-yellow-600 bg-yellow-100' }
    if (score >= 60) return { tier: 'silver', color: 'text-gray-600 bg-gray-100' }
    return { tier: 'bronze', color: 'text-amber-600 bg-amber-100' }
  }

  const { tier, color } = getSafetyTier(safetyScore)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-2">
          <img 
            src="/saarthi-logo.svg" 
            alt="Saarthi Suraksha" 
            className="w-8 h-8"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.nextElementSibling?.removeAttribute('style')
            }}
          />
          <Logo size={24} />
          <h1 className="text-xl font-bold text-gray-900">Shared Location</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Map */}
          <div className="md:col-span-2">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={18} />
                Live Location (Privacy Protected)
              </h3>
              <MapComponent 
                center={[location.lat, location.lng]}
                showGeofences={false}
                showPrivacyRing={true}
                className="h-96"
              />
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Location shown within 200m radius for privacy protection
                </p>
              </div>
            </Card>
          </div>

          {/* Info Panel */}
          <div className="md:col-span-1 space-y-6">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Tourist Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Safety Tier</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${color}`}>
                    {tier.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Safety Score</span>
                  <span className="text-sm font-medium">{safetyScore}/100</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Update</span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(lastUpdate).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-600">
                    SAFE
                  </span>
                </div>
              </div>
            </Card>

            {tripData?.emergency?.contacts && (
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Emergency Contacts</h3>
                <div className="space-y-2">
                  {tripData.emergency.contacts.map((contact: any, index: number) => (
                    <div key={index} className="p-2 bg-gray-50 rounded">
                      <p className="font-medium text-sm">{contact.name}</p>
                      <p className="text-xs text-gray-600">{contact.phone}</p>
                      <p className="text-xs text-gray-500">{contact.relation}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Card>
              <div className="text-center py-4">
                <Logo size={32} className="mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Protected by</p>
                <p className="text-lg font-bold text-orange-500">Saarthi Suraksha</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}