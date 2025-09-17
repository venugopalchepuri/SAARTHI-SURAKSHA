import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Logo from "../components/Logo";

export const Splash: React.FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/landing')
    }, 3000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 flex flex-col items-center justify-center">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="mb-8"
      >
        <div className="relative">
          {/* Glow effect */}
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 bg-orange-400 rounded-full blur-xl"
          />
          
          {/* Particle effects */}
          <div className="absolute inset-0">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full"
                animate={{
                  x: [0, Math.cos(i * Math.PI / 4) * 60, 0],
                  y: [0, Math.sin(i * Math.PI / 4) * 60, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
                style={{
                  left: '50%',
                  top: '50%',
                  marginLeft: '-4px',
                  marginTop: '-4px'
                }}
              />
            ))}
          </div>
          
          <motion.div
            animate={{ 
              boxShadow: [
                '0 0 20px rgba(255,255,255,0.5)',
                '0 0 60px rgba(255,255,255,1)',
                '0 0 40px rgba(255,165,0,0.8)',
                '0 0 20px rgba(255,255,255,0.5)'
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="relative bg-white rounded-full p-8 shadow-2xl"
          >
            <img 
              src="/saarthi-logo.svg" 
              alt="Saarthi Suraksha" 
              className="w-20 h-20"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                e.currentTarget.nextElementSibling?.removeAttribute('style')
              }}
            />
            <Logo size={80} className="mx-auto hidden" />
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="text-center text-white"
      >
        <h1 className="text-4xl font-bold mb-4">Saarthi Suraksha</h1>
        <motion.p 
          className="text-xl opacity-90"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Your Safety, Our Priority
        </motion.p>
        
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 2.5, delay: 0.5 }}
          className="mt-8 h-1 bg-gradient-to-r from-transparent via-white to-transparent rounded-full mx-auto max-w-xs"
        />
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="mt-4 text-sm opacity-75"
        >
          Redirecting to safety platform...
        </motion.div>
      </motion.div>
    </div>
  )
}