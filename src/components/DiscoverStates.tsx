import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, ExternalLink, Leaf } from 'lucide-react'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { useAppStore } from '../lib/store'

interface Monument {
  name: string
  image: string
  info: string
  location: { lat: number; lng: number }
  eco: boolean
}

interface StateData {
  id: string
  name: string
  image: string
  monuments: Monument[]
}

interface StateModalProps {
  state: StateData
  isOpen: boolean
  onClose: () => void
}

const StateModal: React.FC<StateModalProps> = ({ state, isOpen, onClose }) => {
  const { 
    monumentsViewed, 
    setMonumentsViewed, 
    ecoVisits, 
    setEcoVisits,
    setCulturalExplorerBadge 
  } = useAppStore()

  if (!isOpen) return null

  const handleMonumentView = (monument: Monument) => {
    const newCount = monumentsViewed + 1
    setMonumentsViewed(newCount)
    
    if (monument.eco) {
      setEcoVisits(ecoVisits + 1)
    }
    
    if (newCount >= 2) {
      setCulturalExplorerBadge(true)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        >
          {/* Header */}
          <div className="relative">
            <img 
              src={state.image} 
              alt={state.name}
              className="w-full h-48 object-cover rounded-t-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-2xl" />
            <div className="absolute bottom-6 left-6 text-white">
              <h2 className="text-3xl font-bold font-poppins">{state.name}</h2>
              <p className="text-white/90">Heritage & Cultural Treasures</p>
            </div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Must-Visit Monuments</h3>
            <div className="space-y-4">
              {state.monuments.map((monument, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -2, boxShadow: '0 10px 25px rgba(249, 115, 22, 0.1)' }}
                  className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-orange-400 transition-all cursor-pointer"
                  onClick={() => handleMonumentView(monument)}
                >
                  <img 
                    src={monument.image} 
                    alt={monument.name}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{monument.name}</h4>
                      {monument.eco && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          className="flex items-center gap-1 text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs"
                        >
                          <Leaf size={12} />
                          <span>Eco Zone</span>
                        </motion.div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{monument.info}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      📍 {monument.location.lat.toFixed(4)}, {monument.location.lng.toFixed(4)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <Button
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
                onClick={() => {
                  // Navigate to map functionality (optional)
                  onClose()
                }}
              >
                <MapPin size={18} className="mr-2" />
                Navigate on Map
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export const DiscoverStates: React.FC = () => {
  const [states, setStates] = useState<StateData[]>([])
  const [selectedState, setSelectedState] = useState<StateData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStates = async () => {
      try {
        const response = await fetch('/data/states.json')
        const data = await response.json()
        setStates(data)
      } catch (error) {
        console.error('Failed to load states data:', error)
        setStates([
          {
            id: 'rajasthan',
            name: 'Rajasthan',
            image: 'src\images\rajastan.png',
            monuments: [
              {
                name: 'Hawa Mahal',
                image: 'https://images.pexels.com/photos/3881104/pexels-photo-3881104.jpeg?auto=compress&cs=tinysrgb&w=400',
                info: 'The iconic Palace of Winds in Jaipur, featuring 953 small windows and stunning pink sandstone architecture.',
                location: { lat: 26.9239, lng: 75.8267 },
                eco: false
              },
              {
                name: 'Amber Fort',
                image: 'https://images.pexels.com/photos/1603650/pexels-photo-1603650.jpeg?auto=compress&cs=tinysrgb&w=400',
                info: 'A magnificent hilltop fortress overlooking Maota Lake, known for its artistic Hindu style elements.',
                location: { lat: 26.9855, lng: 75.8513 },
                eco: false
              }
            ]
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    loadStates()
  }, [])

  if (loading) {
    return (
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-96 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-80 mx-auto mb-12"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="py-20 px-4 bg-gradient-to-b from-white to-orange-50/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold font-poppins text-gray-900 mb-6">
              Discover India's Eco & Cultural Treasures
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Explore heritage and natural wonders across India, safely with Saarthi Suraksha
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {states.map((state, index) => (
              <motion.div
                key={state.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  boxShadow: '0 20px 40px rgba(249, 115, 22, 0.15)' 
                }}
                className="group cursor-pointer"
                onClick={() => setSelectedState(state)}
              >
                <Card className="relative h-64 overflow-hidden border-0 shadow-lg">
                  <div className="absolute inset-0">
                    <motion.img 
                      src={state.image} 
                      alt={state.name}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  </div>
                  
                  <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                    >
                      <h3 className="text-xl font-bold font-poppins mb-2 group-hover:text-brand-300 transition-colors">
                        {state.name}
                      </h3>
                      <p className="text-white/90 text-sm font-medium">
                        Click to Explore
                      </p>
                    </motion.div>
                  </div>

                  {/* Hover Border Glow */}
                  <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-orange-400 transition-all duration-300" />
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* State Modal */}
      <StateModal
        state={selectedState!}
        isOpen={!!selectedState}
        onClose={() => setSelectedState(null)}
      />
    </>
  )
}