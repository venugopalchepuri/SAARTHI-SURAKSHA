import React, { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polygon, Circle } from 'react-leaflet'
import { Icon, divIcon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useAppStore } from '../../lib/store'
import { Shield, Plus } from 'lucide-react'

// Fix for default markers
const customIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDOC4xMzQgMiA1IDUuMTM0IDUgOUM1IDEzLjg5IDExLjk0NSAyMS42NDQgMTEuOTg4IDIxLjY5OEMxMS45OTUgMjEuNzA4IDEyLjAwNCAyMS43MDggMTIuMDEyIDIxLjY5OEMxMi4wNTUgMjEuNjQ0IDE5IDEzLjg5IDE5IDlDMTkgNS4xMzQgMTUuODY2IDIgMTIgMlpNMTIgMTJDMTAuMzQzIDEyIDkgMTAuNjU3IDkgOVM5IDYgMTIgNlMxNSA3LjM0MyAxNSA5UzEzLjY1NyAxMiAxMiAxMloiIGZpbGw9IiNmOTczMTYiLz4KPHN2Zz4=',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24]
})

const pulsatingIcon = divIcon({
  html: `
    <div class="relative flex items-center justify-center">
      <div class="w-6 h-6 bg-orange-500 rounded-full animate-ping absolute opacity-75"></div>
      <div class="w-4 h-4 bg-orange-600 rounded-full border-2 border-white"></div>
    </div>
  `,
  className: 'custom-marker',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
})

const createTouristIcon = (status: string) => divIcon({
  html: `
    <div class="relative">
      <div class="w-8 h-8 ${
        status === 'DANGER' ? 'bg-red-500' : 
        status === 'ALERT' ? 'bg-yellow-500' : 
        'bg-green-500'
      } rounded-full border-3 border-white shadow-lg flex items-center justify-center">
        <div class="w-3 h-3 bg-white rounded-full"></div>
      </div>
      ${status === 'DANGER' || status === 'ALERT' ? 
        '<div class="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full animate-bounce"></div>' : 
        ''
      }
    </div>
  `,
  className: `tourist-marker tourist-${status.toLowerCase()}`,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
})

const policeIcon = divIcon({
  html: `
    <div class="flex items-center justify-center">
      <div class="w-8 h-8 bg-blue-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C8.134 2 5 5.134 5 9C5 13.89 11.945 21.644 11.988 21.698C11.995 21.708 12.004 21.708 12.012 21.698C12.055 21.644 19 13.89 19 9C19 5.134 15.866 2 12 2ZM12 12C10.343 12 9 10.657 9 9S9 6 12 6S15 7.343 15 9S13.657 12 12 12Z"/>
        </svg>
      </div>
    </div>
  `,
  className: 'police-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
})

const hospitalIcon = divIcon({
  html: `
    <div class="flex items-center justify-center">
      <div class="w-8 h-8 bg-red-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-sm">
        +
      </div>
    </div>
  `,
  className: 'hospital-marker', 
  iconSize: [32, 32],
  iconAnchor: [16, 16]
})

interface MapComponentProps {
  center?: [number, number]
  zoom?: number
  showGeofences?: boolean
  showPrivacyRing?: boolean
  places?: any[]
  tourists?: any[]
  onTouristClick?: (tourist: any) => void
  nearbyServices?: any[]
  className?: string
}

export const MapComponent: React.FC<MapComponentProps> = ({
  center = [28.4506, 77.5847], // Bennett University
  zoom = 13,
  showGeofences = true,
  showPrivacyRing = false,
  places = [],
  tourists = [],
  onTouristClick,
  nearbyServices = [],
  className = "h-64"
}) => {
  const { currentLocation } = useAppStore()
  const mapRef = useRef<any>(null)
  const [services, setServices] = useState<any[]>([])

  useEffect(() => {
    if (currentLocation && mapRef.current) {
      mapRef.current.setView([currentLocation.lat, currentLocation.lng], zoom)
    }
  }, [currentLocation, zoom])

  useEffect(() => {
    // Load nearby services data
    const fetchServices = async () => {
      try {
        const response = await fetch('/data/nearby.json')
        const data = await response.json()
        setServices(data)
      } catch (error) {
        console.error('Failed to load nearby services:', error)
      }
    }
    fetchServices()
  }, [])

  const geofences = [
    {
      name: 'Restricted Forest Track',
      risk: 'HIGH',
      coordinates: [
        [28.45, 77.58],
        [28.45, 77.59],
        [28.46, 77.59],
        [28.46, 77.58]
      ]
    },
    {
      name: 'Cliff Zone',
      risk: 'MED',
      coordinates: [
        [28.445, 77.575],
        [28.445, 77.583],
        [28.453, 77.583],
        [28.453, 77.575]
      ]
    }
  ]

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'HIGH': return '#ef4444'
      case 'MED': return '#f59e0b'
      case 'LOW': return '#10b981'
      default: return '#6b7280'
    }
  }

  return (
    <div className={className}>
      <MapContainer
        center={currentLocation ? [currentLocation.lat, currentLocation.lng] : center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {currentLocation && (
          <Marker 
            position={[currentLocation.lat, currentLocation.lng]} 
            icon={pulsatingIcon}
          >
            <Popup>You are here</Popup>
          </Marker>
        )}

        {showPrivacyRing && currentLocation && (
          <Circle
            center={[currentLocation.lat, currentLocation.lng]}
            radius={200}
            pathOptions={{
              fillColor: '#f97316',
              fillOpacity: 0.1,
              color: '#f97316',
              weight: 2,
              opacity: 0.5
            }}
          />
        )}

        {showGeofences && geofences.map((geofence, index) => (
          <Polygon
            key={index}
            positions={geofence.coordinates as any}
            pathOptions={{
              fillColor: getRiskColor(geofence.risk),
              fillOpacity: 0.2,
              color: getRiskColor(geofence.risk),
              weight: 2,
              opacity: 0.8
            }}
          >
            <Popup>
              <div>
                <h3 className="font-semibold">{geofence.name}</h3>
                <p className="text-sm">Risk Level: <span className="font-medium">{geofence.risk}</span></p>
              </div>
            </Popup>
          </Polygon>
        ))}

        {places.map((place, index) => (
          <Marker
            key={place.id}
            position={[place.lat || center[0] + (Math.random() - 0.5) * 0.01, place.lng || center[1] + (Math.random() - 0.5) * 0.01]}
            icon={customIcon}
          >
            <Popup>
              <div>
                <h3 className="font-semibold">{place.name}</h3>
                <p className="text-sm capitalize">{place.kind}</p>
                <p className="text-sm">Rating: ⭐ {place.rating}/5</p>
                {place.distance && <p className="text-xs text-gray-500">{place.distance.toFixed(1)} km away</p>}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Nearby Services (Police Stations & Hospitals) */}
        {services.map((service) => (
          <Marker
            key={service.id}
            position={[service.lat, service.lng]}
            icon={service.type === 'police' ? policeIcon : hospitalIcon}
          >
            <Popup>
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  {service.type === 'police' ? '👮‍♀️' : '🏥'} {service.name}
                </h3>
                <p className="text-sm capitalize">Type: {service.type}</p>
                <p className="text-sm">Distance: {service.distance}km</p>
                <p className="text-sm">Phone: {service.phone}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {tourists.map((tourist) => (
          <Marker
            key={tourist.id}
            position={[tourist.location.lat, tourist.location.lng]}
            icon={createTouristIcon(tourist.status || 'SAFE')}
            eventHandlers={{
              click: () => onTouristClick?.(tourist)
            }}
          >
            <Popup>
              <div>
                <h3 className="font-semibold">{tourist.name}</h3>
                <p className="text-sm capitalize">Status: {tourist.status || 'Safe'}</p>
                <p className="text-sm">Destination: {tourist.destination || 'Unknown'}</p>
                <p className="text-sm">Safety Score: {tourist.safety_score}/100</p>
                <p className="text-sm">Active Alerts: {tourist.active_alerts || 0}</p>
                <p className="text-xs text-gray-500">Last update: {new Date(tourist.last_update).toLocaleString()}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}