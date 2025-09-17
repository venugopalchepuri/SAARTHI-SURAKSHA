import React, { useState } from 'react'
import { Phone, PhoneOff } from 'lucide-react'
import { Button } from '../ui/Button'
import { motion, AnimatePresence } from 'framer-motion'

export const FakeCall: React.FC = () => {
  const [showFakeCall, setShowFakeCall] = useState(false)

  const startFakeCall = () => {
    setShowFakeCall(true)
  }

  const endFakeCall = () => {
    setShowFakeCall(false)
  }

  return (
    <>
      <div className="flex flex-col items-center gap-2">
        <Button
          onClick={startFakeCall}
          variant="secondary"
          className="w-16 h-16 rounded-full"
        >
          <Phone size={20} />
        </Button>
        <p className="text-xs text-gray-600 text-center">Fake Call</p>
      </div>

      <AnimatePresence>
        {showFakeCall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center text-white"
          >
            <div className="text-center mb-8">
              <div className="w-32 h-32 bg-gray-600 rounded-full mb-4 mx-auto flex items-center justify-center">
                <Phone size={48} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Police Control Room</h2>
              <p className="text-lg text-gray-300">+91-100</p>
              <p className="text-sm text-gray-400 mt-4">Incoming call...</p>
            </div>

            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="mb-8"
            >
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
                <Phone size={32} />
              </div>
            </motion.div>

            <div className="flex gap-16">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={endFakeCall}
                className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center"
              >
                <PhoneOff size={24} />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={endFakeCall}
                className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center"
              >
                <Phone size={24} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}