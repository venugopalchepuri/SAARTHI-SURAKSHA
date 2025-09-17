import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '../lib/store'

export const Confetti: React.FC = () => {
  const { showConfetti, setShowConfetti } = useAppStore()

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [showConfetti, setShowConfetti])

  if (!showConfetti) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: -10,
            rotate: 0,
          }}
          animate={{
            y: window.innerHeight + 10,
            rotate: 360,
            x: Math.random() * window.innerWidth,
          }}
          transition={{
            duration: 3,
            ease: 'easeOut',
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  )
}