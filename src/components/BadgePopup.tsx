import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Award, X } from 'lucide-react'
import { useAppStore } from '../lib/store'

export const BadgePopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)
  const { culturalExplorerBadge, monumentsViewed } = useAppStore()

  useEffect(() => {
    if (culturalExplorerBadge && monumentsViewed >= 2) {
      setIsVisible(true)
      // Auto-close after 5 seconds
      setTimeout(() => setIsVisible(false), 5000)
    }
  }, [culturalExplorerBadge, monumentsViewed])

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ 
            scale: 1, 
            opacity: 1, 
            y: 0,
            boxShadow: [
              '0 0 0 0 rgba(249, 115, 22, 0.4)',
              '0 0 0 20px rgba(249, 115, 22, 0.1)',
              '0 0 0 0 rgba(249, 115, 22, 0.4)'
            ]
          }}
          exit={{ scale: 0.5, opacity: 0, y: 50 }}
          transition={{ 
            duration: 0.6,
            boxShadow: { duration: 2, repeat: Infinity }
          }}
          className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center relative"
        >
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-4 right-4 w-6 h-6 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>

          {/* Confetti Effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full"
                initial={{
                  x: Math.random() * 300,
                  y: -10,
                  rotate: 0,
                }}
                animate={{
                  y: 400,
                  rotate: 360,
                  x: Math.random() * 300,
                }}
                transition={{
                  duration: 3,
                  ease: 'easeOut',
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* Badge Icon */}
          <motion.div
            animate={{ 
              rotate: [0, -5, 5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="mb-4"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Award size={32} className="text-white" />
            </div>
          </motion.div>

          {/* Badge Content */}
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            🎉 Badge Unlocked!
          </h3>
          <h4 className="text-lg font-semibold text-orange-600 mb-2">
            Cultural Explorer
          </h4>
          <p className="text-gray-600 text-sm mb-4">
            You've explored {monumentsViewed} monuments! Keep discovering India's heritage.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsVisible(false)}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg font-medium"
          >
            Awesome!
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}