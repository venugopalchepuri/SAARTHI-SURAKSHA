import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAppStore } from '../../lib/store'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from '../../hooks/useToast'

export const PanicButton: React.FC = () => {
  const [isPressed, setIsPressed] = useState(false)
  const { currentLocation, activeTripId, largeSosMode } = useAppStore()
  const { user } = useAuth()

  const handlePanic = async () => {
    if (isPressed) return
    
    setIsPressed(true)
    
    try {
      if (!activeTripId) {
        toast({
          title: 'No active trip',
          description: 'Please create a trip first',
          type: 'error'
        })
        return
      }
      
      // Create panic alert
      const { data, error } = await supabase
        .from('alerts')
        .insert({
          trip_id: activeTripId,
          type: 'PANIC',
          details: {
            location: currentLocation,
            timestamp: new Date().toISOString(),
            user_id: user?.id
          }
        })

      if (error) throw error

      toast({
        title: 'Panic alert sent!',
        description: 'Help is on the way.',
        type: 'success'
      })
      
    } catch (error) {
      toast({
        title: 'Failed to send panic alert',
        description: 'Please try again.',
        type: 'error'
      })
    } finally {
      setTimeout(() => setIsPressed(false), 3000)
    }
  }

  const buttonClasses = largeSosMode 
    ? "w-full h-20 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-red-400 disabled:to-red-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg"
    : "w-32 h-32 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-red-400 disabled:to-red-500 rounded-full flex flex-col items-center justify-center text-white font-bold text-lg shadow-lg"

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={isPressed ? {
        scale: [1, 1.1, 1],
        boxShadow: [
          '0 0 0 0 rgba(239, 68, 68, 0.7)',
          '0 0 0 20px rgba(239, 68, 68, 0)',
          '0 0 0 0 rgba(239, 68, 68, 0)'
        ]
      } : {
        scale: [1, 1.05, 1],
        boxShadow: [
          '0 0 0 0 rgba(239, 68, 68, 0.4)',
          '0 0 0 10px rgba(239, 68, 68, 0.1)',
          '0 0 0 0 rgba(239, 68, 68, 0.4)'
        ]
      }}
      transition={{
        duration: isPressed ? 0.6 : 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      onClick={handlePanic}
      disabled={isPressed}
      className={buttonClasses}
    >
      <motion.div
        animate={{ rotate: isPressed ? [0, -5, 5, 0] : 0 }}
        transition={{ duration: 0.2, repeat: isPressed ? Infinity : 0 }}
      >
        <AlertTriangle size={largeSosMode ? 24 : 32} className={largeSosMode ? "mr-3" : "mb-2"} />
      </motion.div>
      {largeSosMode ? (
        <span>EMERGENCY PANIC</span>
      ) : (
        <span>PANIC</span>
      )}
    </motion.button>
  )
}