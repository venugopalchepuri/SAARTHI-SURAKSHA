import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, MapPin, Phone, Navigation, AlertTriangle } from 'lucide-react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { useAppStore } from '../lib/store'

interface NearbyService {
  id: string
  name: string
  type: 'police' | 'hospital'
  lat: number
  lng: number
  distance: number
  phone: string
}

export const SafeRouteCard: React.FC = () => {
  const [nearbyServices, setNearbyServices] = useState<NearbyService[]>([])
  const [showRiskAlert, setShowRiskAlert] = useState(false)
  const { currentLocation } = useAppStore()

  useEffect(() => {
    fetchNearbyServices()
    checkRiskZones()
  }, [currentLocation])

  const fetchNearbyServices = async () => {
    try {
      const response = await fetch('/data/nearby.json')
      const data = await response.json()
      setNearbyServices(data)
    } catch (error) {
      console.error('Failed to load nearby services:', error)
    }
  }

  const checkRiskZones = () => {
    // Simple risk zone detection (mock)
    if (currentLocation) {
      const riskZones = [
        { lat: 28.45, lng: 77.58, radius: 0.5 }, // Restricted Forest Track
        { lat: 28.445, lng: 77.575, radius: 0.3 } // Cliff Zone
      ]
      
      const isNearRisk = riskZones.some(zone => {
        const distance = calculateDistance(
          currentLocation.lat, currentLocation.lng,
          zone.lat, zone.lng
        )
        return distance < zone.radius * 1000 // Convert to meters
      })
      
      setShowRiskAlert(isNearRisk)
    }
  }

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371e3
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lng2 - lng1) * Math.PI) / 180
    
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    
    return R * c
  }

  const getServiceIcon = (type: string) => {
    return type === 'police' ? Shield : MapPin
  }

  const getServiceColor = (type: string) => {
    return type === 'police' ? 'text-blue-600 bg-blue-100' : 'text-red-600 bg-red-100'
  }

  return (
    <Card className="mb-6">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Navigation size={18} />
        Safe Route & Nearby
      </h3>

      {/* Risk Alert */}
      {showRiskAlert && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-orange-100 border border-orange-300 rounded-lg"
        >
          <div className="flex items-center gap-2 text-orange-800">
            <AlertTriangle size={16} />
            <span className="text-sm font-medium">Safer path suggested</span>
          </div>
          <Button
            size="sm"
            className="mt-2 text-xs bg-orange-500 hover:bg-orange-600"
            onClick={() => setShowRiskAlert(false)}
          >
            Tap to view
          </Button>
        </motion.div>
      )}

      {/* Nearby Services */}
      <div className="space-y-3">
        {nearbyServices.slice(0, 3).map((service, index) => {
          const Icon = getServiceIcon(service.type)
          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${getServiceColor(service.type)}`}>
                  <Icon size={16} />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{service.name}</p>
                  <p className="text-xs text-gray-500">{service.distance}km away</p>
                </div>
              </div>
              <button
                onClick={() => window.open(`tel:${service.phone}`)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <Phone size={14} />
              </button>
            </motion.div>
          )
        })}
      </div>
    </Card>
  )
}