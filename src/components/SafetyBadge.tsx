import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Award, Crown } from 'lucide-react'
import { useAppStore } from '../lib/store'

export const SafetyBadge: React.FC = () => {
  const { safetyScore, badgeTier } = useAppStore()

  const getBadgeConfig = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return {
          icon: Shield,
          color: 'text-amber-600',
          bgColor: 'bg-amber-100',
          borderColor: 'border-amber-300'
        }
      case 'silver':
        return {
          icon: Award,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-300'
        }
      case 'gold':
        return {
          icon: Crown,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-300'
        }
      default:
        return {
          icon: Shield,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-300'
        }
    }
  }

  const config = getBadgeConfig(badgeTier)
  const Icon = config.icon

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`flex items-center gap-3 p-4 rounded-lg border-2 ${config.bgColor} ${config.borderColor}`}
    >
      <div className={`p-2 rounded-full ${config.color}`}>
        <Icon size={24} />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 capitalize">{badgeTier} Traveler</h3>
        <p className="text-sm text-gray-600">Safety Score: {safetyScore}/100</p>
        <div className="w-32 h-2 bg-gray-200 rounded-full mt-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${safetyScore}%` }}
            className={`h-full rounded-full ${safetyScore >= 85 ? 'bg-yellow-500' : safetyScore >= 60 ? 'bg-gray-400' : 'bg-amber-500'}`}
          />
        </div>
      </div>
    </motion.div>
  )
}