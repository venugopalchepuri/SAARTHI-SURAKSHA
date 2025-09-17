import React from 'react'
import { motion } from 'framer-motion'
import { MapPin, AlertTriangle, Clock, Shield } from 'lucide-react'
import { Card } from './ui/Card'

interface Tourist {
  id: string
  name: string
  avatar?: string
  location: { lat: number; lng: number }
  safety_score: number
  trip_id: string
  last_update: string
  status?: 'SAFE' | 'ALERT' | 'DANGER'
  destination?: string
}

interface TouristCardProps {
  tourist: Tourist
  onClick: (tourist: Tourist) => void
  isSelected?: boolean
}

export const TouristCard: React.FC<TouristCardProps> = ({ 
  tourist, 
  onClick, 
  isSelected = false 
}) => {
  const getStatusColor = (status: string, safetyScore: number) => {
    if (status === 'DANGER' || safetyScore < 40) return 'bg-red-500'
    if (status === 'ALERT' || safetyScore < 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStatusText = (status: string, safetyScore: number) => {
    if (status === 'DANGER' || safetyScore < 40) return 'DANGER'
    if (status === 'ALERT' || safetyScore < 70) return 'ALERT'
    return 'SAFE'
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(tourist)}
      className={`cursor-pointer ${isSelected ? 'ring-2 ring-orange-500' : ''}`}
    >
      <Card className={`${isSelected ? 'bg-orange-50 border-orange-200' : 'bg-gray-800 border-gray-700'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-cyan-400">
                <img 
                  src={tourist.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'} 
                  alt={tourist.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(tourist.status || '', tourist.safety_score)} rounded-full border-2 border-white animate-pulse`}></div>
            </div>
            <div>
              <h4 className={`font-medium ${isSelected ? 'text-gray-900' : 'text-white'}`}>
                {tourist.name}
              </h4>
              <p className={`text-sm ${isSelected ? 'text-gray-600' : 'text-gray-200'}`}>
                {tourist.destination || 'In Transit'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-xs px-2 py-1 rounded-full ${
              tourist.safety_score >= 70 
                ? 'bg-green-100 text-green-700' 
                : tourist.safety_score >= 40 
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
            }`}>
              {getStatusText(tourist.status || '', tourist.safety_score)}
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className={`flex items-center gap-2 text-sm ${isSelected ? 'text-gray-600' : 'text-gray-300'}`}>
            <Shield size={12} />
            <span className="font-medium">Safety: {tourist.safety_score}/100</span>
          </div>
          <div className={`flex items-center gap-2 text-sm ${isSelected ? 'text-gray-600' : 'text-gray-300'}`}>
            <MapPin size={12} />
            <span className="font-mono text-xs">{tourist.location.lat.toFixed(4)}, {tourist.location.lng.toFixed(4)}</span>
          </div>
          <div className={`flex items-center gap-2 text-sm ${isSelected ? 'text-gray-600' : 'text-gray-300'}`}>
            <Clock size={12} />
            <span className="font-medium">{new Date(tourist.last_update).toLocaleTimeString()}</span>
          </div>
        </div>

        {tourist.safety_score < 70 && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mt-3 flex items-center gap-2 text-yellow-600"
          >
            <AlertTriangle size={14} />
            <span className="text-xs">Needs attention</span>
          </motion.div>
        )}
      </Card>
    </motion.div>
  )
}