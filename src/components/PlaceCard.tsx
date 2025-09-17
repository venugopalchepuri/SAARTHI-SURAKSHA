import React from 'react'
import { motion } from 'framer-motion'
import { MapPin, Star, ExternalLink } from 'lucide-react'
import { Place } from '../lib/types'
import { Button } from './ui/Button'

interface PlaceCardProps {
  place: Place
  onNavigate: (place: Place) => void
}

export const PlaceCard: React.FC<PlaceCardProps> = ({ place, onNavigate }) => {
  const getKindIcon = (kind: string) => {
    switch (kind) {
      case 'eat': return '🍽️'
      case 'shop': return '🛍️'
      case 'spot': return '📍'
      default: return '📍'
    }
  }

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg rounded-lg p-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getKindIcon(place.kind)}</span>
          <div>
            <h3 className="font-semibold text-gray-900">{place.name}</h3>
            <p className="text-sm text-gray-600 capitalize">{place.kind}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-yellow-500">
          <Star size={14} fill="currentColor" />
          <span className="text-sm font-medium">{place.rating}</span>
        </div>
      </div>
      
      {place.distance && (
        <div className="flex items-center gap-1 text-gray-500 mb-3">
          <MapPin size={12} />
          <span className="text-xs">{place.distance.toFixed(1)} km away</span>
        </div>
      )}
      
      <Button
        onClick={() => onNavigate(place)}
        size="sm"
        className="w-full flex items-center justify-center gap-2"
      >
        <ExternalLink size={14} />
        Navigate
      </Button>
    </motion.div>
  )
}