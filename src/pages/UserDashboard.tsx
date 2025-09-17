import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { 
  Shield, 
  MapPin, 
  Share, 
  Plus, 
  Star, 
  Navigation, 
  AlertTriangle, 
  Camera,
  Clock,
  Users,
  Phone,
  Settings,
  Download,
  Upload,
  Heart,
  Sun,
  Wifi,
  Battery
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { PanicButton } from '../components/sos/PanicButton'
import { SilentSOS } from '../components/sos/SilentSOS'
import { WhistleSOS } from '../components/sos/WhistleSOS'
import { FakeCall } from '../components/sos/FakeCall'
import { MapComponent } from '../components/maps/MapComponent'
import { SafetyBadge } from '../components/SafetyBadge'
import { Confetti } from '../components/Confetti'
import { SafeRouteCard } from '../components/SafeRouteCard'
import { BadgePopup } from '../components/BadgePopup'
import { VoiceSOS } from '../components/VoiceSOS'
import { LanguageToggle } from '../components/LanguageToggle'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useAppStore } from '../lib/store'
import { toast } from '../hooks/useToast'
import Logo from "../components/Logo";

interface Trip {
  id: string
  user_id: string
  itinerary: any
  emergency: any
  safety_score: number
  vc_hash: string | null
  valid_from: string
  valid_to: string
  created_at: string
}

interface Place {
  id: string
  name: string
  kind: 'eat' | 'shop' | 'spot'
  rating: number
  distance?: number
}

export const UserDashboard: React.FC = () => {
  const { user, signOut, loading: authLoading } = useAuth()
  const { 
    currentLocation, 
    setCurrentLocation, 
    setActiveTripId,
    ecoVisits,
    culturalExplorerBadge,
    largeSosMode,
    setLargeSosMode 
  } = useAppStore()
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null)
  const [showTripForm, setShowTripForm] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([])
  const [shareToken, setShareToken] = useState<string>('')
  const [savedPlaces, setSavedPlaces] = useState<Place[]>([])
  const [tripPhotos, setTripPhotos] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (authLoading || !user?.id) {
      return
    }

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        () => {
          // Fallback to Bennett University
          setCurrentLocation({
            lat: 28.4506,
            lng: 77.5847
          })
        }
      )
    }

    fetchActiveTrip()
    fetchNearbyPlaces()
  }, [setCurrentLocation, user?.id, authLoading])

  const fetchActiveTrip = async () => {
    if (!user?.id) {
      return
    }
    
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user?.id)
        .gte('valid_to', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)

      if (!error && data && data.length > 0) {
        setActiveTrip(data[0])
        setActiveTripId(data[0].id)
      } else {
        setActiveTripId(null)
      }
    } catch (error) {
      console.error('Error fetching active trip:', error)
      setActiveTripId(null)
    }
  }

  const fetchNearbyPlaces = async () => {
    try {
      const fallbackPlaces = [
        { id: '1', name: 'India Gate', kind: 'spot', rating: 4.6, distance: 5.2 },
        { id: '2', name: 'Red Fort Delhi', kind: 'spot', rating: 4.5, distance: 6.1 },
        { id: '3', name: 'Connaught Place', kind: 'shop', rating: 4.4, distance: 7.2 },
        { id: '4', name: 'Paranthe Wali Gali', kind: 'eat', rating: 4.5, distance: 6.8 },
        { id: '5', name: 'Chaat Corner', kind: 'eat', rating: 4.4, distance: 0.5 },
        { id: '6', name: 'Bazaar Lane', kind: 'shop', rating: 4.1, distance: 0.8 },
        { id: '7', name: 'Sunset Point', kind: 'spot', rating: 4.8, distance: 1.2 },
      ] as Place[]
      setNearbyPlaces(fallbackPlaces.sort((a, b) => (a.distance || 0) - (b.distance || 0)).slice(0, 6))
    } catch (error) {
      console.error('Error fetching places (using fallback):', error)
      setNearbyPlaces([
        { id: '1', name: 'Local Market', kind: 'shop', rating: 4.2, distance: 0.3 },
        { id: '2', name: 'Nearby Restaurant', kind: 'eat', rating: 4.5, distance: 0.6 },
        { id: '3', name: 'City Center', kind: 'spot', rating: 4.1, distance: 1.1 }
      ] as Place[])
    }
  }

  const createTrip = async (tripData: any) => {
    try {
      setLoading(true)
      const { data: trip, error: tripError } = await supabase
        .from('trips')
        .insert({
          user_id: user?.id,
          itinerary: tripData.itinerary,
          emergency: tripData.emergency,
          safety_score: 100,
          valid_from: tripData.valid_from,
          valid_to: tripData.valid_to
        })
        .select()
        .single()

      if (tripError) throw tripError
      
      setActiveTripId(trip.id)
      
      const vcHash = `saarthi-trip-${trip.id}-${Date.now()}`
      
      const { data: updatedTrip } = await supabase
        .from('trips')
        .update({ vc_hash: vcHash })
        .eq('id', trip.id)
        .select()
        .single()

      if (updatedTrip) {
        setActiveTrip(updatedTrip)
      } else {
        setActiveTrip({ ...trip, vc_hash: vcHash })
      }

      setShowTripForm(false)
      
      toast({
        title: 'Trip created successfully!',
        description: 'Your digital travel ID has been generated.',
        type: 'success'
      })
    } catch (error: any) {
      console.error('Error creating trip:', error)
      toast({
        title: 'Error creating trip',
        description: error.message,
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const createShareLink = async () => {
    if (!activeTrip) return

    try {
      const token = 'share-' + Math.random().toString(36).substring(2, 15)
      
      await supabase.from('share_tokens').insert({
        trip_id: activeTrip.id,
        token: token
      })

      setShareToken(token)
      const shareUrl = `${window.location.origin}/share/${token}`
      
      if (navigator.share) {
        await navigator.share({
          title: 'My Live Location - Saarthi Suraksha',
          text: 'Track my location for safety',
          url: shareUrl
        })
      } else {
        navigator.clipboard.writeText(shareUrl)
        toast({
          title: 'Share link copied!',
          description: 'Share this link with your family',
          type: 'success'
        })
      }
    } catch (error: any) {
      toast({
        title: 'Error creating share link',
        description: error.message,
        type: 'error'
      })
    }
  }

  const navigateToPlace = (place: Place) => {
    if (currentLocation) {
      const googleMapsUrl = `https://www.google.com/maps/dir/${currentLocation.lat},${currentLocation.lng}/${place.name}`
      window.open(googleMapsUrl, '_blank')
    }
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const photoUrl = e.target?.result as string
        setTripPhotos(prev => [...prev, photoUrl])
        toast({
          title: 'Photo uploaded!',
          description: 'Added to your trip gallery',
          type: 'success'
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const toggleSavePlace = (place: Place) => {
    setSavedPlaces(prev => {
      const isAlreadySaved = prev.some(p => p.id === place.id)
      if (isAlreadySaved) {
        toast({ title: 'Removed from saved places', type: 'success' })
        return prev.filter(p => p.id !== place.id)
      } else {
        toast({ title: 'Added to saved places', type: 'success' })
        return [...prev, place]
      }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-70"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop')"
        }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-purple-900/30 to-indigo-900/40 backdrop-blur-sm" />
      
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      
      <Confetti />
      <BadgePopup />

      {/* Header */}
      <header className="relative z-40 bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
              <Logo size={35} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Saarthi Suraksha</h1>
              <p className="text-white font-bold text-sm">आपकी सुरक्षा, हमारी जिम्मेदारी</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-1 text-white font-bold">
                <Wifi size={16} />
                <span className="text-xs">Online</span>
              </div>
              <div className="flex items-center gap-1 text-white font-bold">
                <Battery size={16} />
                <span className="text-xs">100%</span>
              </div>
              <div className="flex items-center gap-1 text-white font-bold">
                <Sun size={16} className="text-yellow-500" />
                <span className="text-xs">25°C</span>
              </div>
            </div>
            <LanguageToggle />
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowSettings(true)}
              className="text-white hover:bg-white/10"
            >
              <Settings size={16} />
            </Button>
            <Button variant="ghost" onClick={signOut} className="text-white hover:bg-white/10 font-bold">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl p-6 text-center shadow-xl"
          >
            <div className="text-orange-400 text-3xl font-bold">
              {activeTrip ? '1' : '0'}
            </div>
            <div className="text-white text-sm font-bold">Active Trips</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl p-6 text-center shadow-xl"
          >
            <div className="text-green-400 text-3xl font-bold">{savedPlaces.length}</div>
            <div className="text-white text-sm font-bold">Saved Places</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl p-6 text-center shadow-xl"
          >
            <div className="text-blue-400 text-3xl font-bold">{tripPhotos.length}</div>
            <div className="text-white text-sm font-bold">Trip Photos</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl p-6 text-center shadow-xl"
          >
            <div className="text-purple-400 text-3xl font-bold">{ecoVisits}</div>
            <div className="text-white text-sm font-bold">Eco Visits</div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Trip QR & Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Trip QR Code */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl p-6 shadow-2xl"
            >
              <h3 className="font-bold text-white mb-6 flex items-center gap-2 text-xl">
                <Logo size={50} className="text-orange-400" />
                Digital Travel ID
              </h3>
              {activeTrip ? (
                <div className="text-center">
                  <div className="bg-white p-8 rounded-3xl mb-6 shadow-2xl">
                    <QRCodeSVG 
                      value={activeTrip.vc_hash || `saarthi-trip-${activeTrip.id}`} 
                      size={200}
                      className="mx-auto drop-shadow-sm"
                      fgColor="#1e40af"
                      bgColor="#ffffff"
                      includeMargin={true}
                    />
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4">
                    <p className="text-white font-bold text-xl mb-2">
                      {activeTrip.itinerary?.destination || 'Active Trip'}
                    </p>
                    <p className="text-white text-sm font-bold bg-orange-500/20 px-3 py-1 rounded-full">
                      ✈️ Valid until: {new Date(activeTrip.valid_to).toLocaleDateString()}
                    </p>
                    <p className="text-white/90 text-xs mt-2 font-bold">
                      Trip ID: {activeTrip.id.substring(0, 8)}...
                    </p>
                  </div>
                  <div className="flex gap-3 mb-4">
                    <Button
                      onClick={createShareLink}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold shadow-lg"
                    >
                      <Share size={16} className="mr-2" />
                      Share Live
                    </Button>
                    <Button
                      onClick={() => {
                        const canvas = document.querySelector('canvas')
                        if (canvas) {
                          const link = document.createElement('a')
                          link.download = `saarthi-qr-${activeTrip.id}.png`
                          link.href = canvas.toDataURL()
                          link.click()
                        }
                      }}
                      variant="secondary"
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30 shadow-lg"
                    >
                      <Download size={16} />
                    </Button>
                  </div>
                  {shareToken && (
                    <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-3">
                      <p className="text-green-200 text-xs font-bold">✅ Share link created and copied!</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                    <Plus size={32} className="text-white" />
                  </div>
                  <h4 className="text-white font-bold text-xl mb-3">Ready for Adventure?</h4>
                  <p className="text-white mb-8 text-lg leading-relaxed font-bold">
                    Create your safe journey and get your<br/>
                    <span className="text-orange-200 font-bold">Digital Travel ID</span>
                  </p>
                  <Button
                    onClick={() => setShowTripForm(true)}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-10 py-4 text-xl font-bold shadow-2xl rounded-2xl"
                  >
                    🚀 Create Safe Trip
                  </Button>
                </div>
              )}
            </motion.div>

            {/* Safety Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl p-6 shadow-xl"
            >
              <SafetyBadge />
              
              {/* Achievement Badges */}
              <div className="mt-6 pt-4 border-t border-white/20">
                <h4 className="text-white font-bold mb-3">Achievements</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-3 text-center">
                    <span className="text-2xl mb-1 block">🌿</span>
                    <span className="text-green-200 text-sm font-bold">{ecoVisits} Eco Visits</span>
                  </div>
                  {culturalExplorerBadge && (
                    <div className="bg-orange-500/20 border border-orange-400/30 rounded-xl p-3 text-center">
                      <span className="text-2xl mb-1 block">🏆</span>
                      <span className="text-orange-200 text-sm font-bold">Cultural Explorer</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Emergency Contacts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl p-6 shadow-xl"
            >
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Phone size={18} className="text-red-400" />
                Emergency Contacts
              </h3>
              <div className="space-y-3">
                <Button className="w-full bg-red-500/80 hover:bg-red-600 text-white border border-red-400/50 font-bold">
                  <Phone size={16} className="mr-2" />
                  Police (100)
                </Button>
                <Button className="w-full bg-blue-500/80 hover:bg-blue-600 text-white border border-blue-400/50 font-bold">
                  <Phone size={16} className="mr-2" />
                  Ambulance (102)
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Center Column - SOS & Map */}
          <div className="space-y-6">
            {/* SOS Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-red-500/20 to-orange-500/20 backdrop-blur-lg border border-red-400/30 rounded-3xl p-6 shadow-xl"
            >
              <h3 className="font-bold text-white mb-6 text-center text-xl">🚨 Emergency SOS</h3>
              
              {largeSosMode ? (
                <div className="mb-6">
                  <PanicButton />
                </div>
              ) : (
                <div className="flex justify-center mb-6">
                  <PanicButton />
                </div>
              )}
              
              <div className="mb-6">
                <VoiceSOS />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <SilentSOS />
                <WhistleSOS />
                <FakeCall />
              </div>
            </motion.div>

            {/* Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl p-6 shadow-xl"
            >
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <MapPin size={18} className="text-green-400" />
                Live Location Tracking
              </h3>
              <div className="bg-gray-900/50 rounded-2xl overflow-hidden border border-gray-700/50">
                <MapComponent 
                  center={currentLocation ? [currentLocation.lat, currentLocation.lng] : [28.4506, 77.5847]}
                  showGeofences={true}
                  showPrivacyRing={!!shareToken}
                  places={nearbyPlaces}
                  className="h-80"
                />
              </div>
              {currentLocation && (
                <div className="mt-4 flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <div className="flex items-center gap-2 text-white/80">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-bold">Location Active</span>
                  </div>
                  <p className="text-white/60 text-xs font-mono font-bold">
                    {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                  </p>
                </div>
              )}
            </motion.div>

            <SafeRouteCard />
          </div>

          {/* Right Column - Places & Gallery */}
          <div className="space-y-6">
            {/* Trip Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl p-6 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Camera size={18} className="text-purple-400" />
                  Trip Gallery
                </h3>
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:from-purple-600 hover:to-pink-600 transition-all">
                    <Upload size={16} className="text-white" />
                  </div>
                </label>
              </div>
              
              <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto">
                {tripPhotos.map((photo, index) => (
                  <img 
                    key={index}
                    src={photo} 
                    alt={`Trip photo ${index + 1}`}
                    className="w-full h-20 object-cover rounded-xl border border-white/20"
                  />
                ))}
                {tripPhotos.length === 0 && (
                  <div className="col-span-2 text-center text-white/60 text-sm py-8 bg-white/10 rounded-xl border border-white/20">
                    📸 Start capturing memories!
                  </div>
                )}
              </div>
            </motion.div>

            {/* Must-Visit Places */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl p-6 shadow-xl"
            >
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Star size={18} className="text-yellow-400" />
                Discover Places
              </h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {nearbyPlaces.slice(0, 5).map((place) => (
                  <motion.div
                    key={place.id}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-bold text-white text-sm">{place.name}</h4>
                        <p className="text-white/60 text-xs capitalize flex items-center gap-1 font-bold">
                          {place.kind === 'eat' ? '🍽️' : place.kind === 'shop' ? '🛍️' : '📍'}
                          {place.kind}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Star size={12} fill="currentColor" />
                          <span className="text-xs font-bold">{place.rating}</span>
                        </div>
                        <button
                          onClick={() => toggleSavePlace(place)}
                          className={`p-1 rounded transition-colors ${
                            savedPlaces.some(p => p.id === place.id)
                              ? 'text-red-400'
                              : 'text-white/60 hover:text-white'
                          }`}
                        >
                          <Heart size={12} fill={savedPlaces.some(p => p.id === place.id) ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    </div>
                    {place.distance && (
                      <p className="text-white/50 text-xs mb-3 font-bold">📍 {place.distance} km away</p>
                    )}
                    <Button
                      onClick={() => navigateToPlace(place)}
                      size="sm"
                      className="w-full text-xs bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold"
                    >
                      <Navigation size={12} className="mr-1" />
                      Navigate
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Saved Places */}
            {savedPlaces.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl p-6 shadow-xl"
              >
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Heart size={18} className="text-red-400" />
                  Saved Places
                </h3>
                <div className="space-y-2">
                  {savedPlaces.slice(0, 3).map((place) => (
                    <div key={place.id} className="flex items-center justify-between p-3 bg-white/10 rounded-xl">
                      <span className="text-white text-sm font-bold">{place.name}</span>
                      <Button
                        onClick={() => navigateToPlace(place)}
                        size="sm"
                        variant="ghost"
                        className="text-orange-400 hover:text-orange-300 hover:bg-orange-400/10"
                      >
                        <Navigation size={12} />
                      </Button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl p-6 w-full max-w-md shadow-2xl"
            >
              <h3 className="text-xl font-bold mb-6 text-white">⚙️ Settings</h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">Large SOS Mode</p>
                    <p className="text-white/70 text-sm font-bold">Full-width emergency button</p>
                  </div>
                  <button
                    onClick={() => setLargeSosMode(!largeSosMode)}
                    className={`w-14 h-8 rounded-full transition-colors ${
                      largeSosMode ? 'bg-orange-500' : 'bg-white/30'
                    }`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full transition-transform ${
                      largeSosMode ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3 mt-8">
                <Button 
                  onClick={() => setShowSettings(false)}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 font-bold"
                >
                  Save Settings
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => setShowSettings(false)}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Trip Creation Modal */}
      <AnimatePresence>
        {showTripForm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl p-6 w-full max-w-md shadow-2xl"
            >
              <h3 className="text-xl font-bold mb-6 text-white">✈️ Create New Trip</h3>
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target as HTMLFormElement)
                createTrip({
                  itinerary: {
                    destination: formData.get('destination'),
                    activities: [formData.get('activities') as string]
                  },
                  emergency: {
                    contacts: [{
                      name: formData.get('emergency_name'),
                      phone: formData.get('emergency_phone'),
                      relation: formData.get('emergency_relation')
                    }]
                  },
                  valid_from: formData.get('start_date'),
                  valid_to: formData.get('end_date')
                })
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-white">🎯 Destination</label>
                    <input
                      name="destination"
                      type="text"
                      required
                      className="w-full p-3 bg-white/20 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-white/60 backdrop-blur-sm font-bold"
                      placeholder="Enter destination"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-bold mb-2 text-white">📅 Start Date</label>
                      <input
                        name="start_date"
                        type="date"
                        required
                        className="w-full p-3 bg-white/20 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-white backdrop-blur-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2 text-white">📅 End Date</label>
                      <input
                        name="end_date"
                        type="date"
                        required
                        className="w-full p-3 bg-white/20 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-white backdrop-blur-sm font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-white">🎨 Activities</label>
                    <input
                      name="activities"
                      type="text"
                      className="w-full p-3 bg-white/20 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-white/60 backdrop-blur-sm font-bold"
                      placeholder="Sightseeing, Shopping, Adventure..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-white">🚨 Emergency Contact</label>
                    <input
                      name="emergency_name"
                      type="text"
                      required
                      className="w-full p-3 bg-white/20 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-white/60 mb-2 backdrop-blur-sm font-bold"
                      placeholder="Contact name"
                    />
                    <input
                      name="emergency_phone"
                      type="tel"
                      required
                      className="w-full p-3 bg-white/20 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-white/60 backdrop-blur-sm font-bold"
                      placeholder="Phone number"
                    />
                    <input name="emergency_relation" type="hidden" value="Family" />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="submit" 
                      className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 font-bold"
                      disabled={loading}
                    >
                      {loading ? '⏳ Creating...' : '🚀 Create Trip'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="secondary" 
                      onClick={() => setShowTripForm(false)}
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}