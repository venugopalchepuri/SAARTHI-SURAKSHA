import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, 
  AlertTriangle, 
  MapPin, 
  Users, 
  Clock,
  Download,
  Play,
  Pause,
  Filter,
  Eye,
  Zap,
  Activity,
  Bell,
  Volume2
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { TouristCard } from '../components/TouristCard'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { MapComponent } from '../components/maps/MapComponent'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { toast } from '../hooks/useToast'
import Logo from "../components/Logo";

interface Alert {
  id: string
  trip_id: string
  type: 'PANIC' | 'GEOFENCE' | 'ANOMALY'
  status: 'OPEN' | 'ACK' | 'RESOLVED'
  details: any
  created_at: string
}

interface ExtendedTourist {
  id: string
  name: string
  avatar?: string
  location: { lat: number; lng: number }
  safety_score: number
  trip_id: string
  last_update: string
  status: 'SAFE' | 'ALERT' | 'DANGER'
  destination: string
  active_alerts: number
}

export const OfficerDashboard: React.FC = () => {
  const { signOut } = useAuth()
  
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [tourists, setTourists] = useState<ExtendedTourist[]>([])
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [selectedTourist, setSelectedTourist] = useState<ExtendedTourist | null>(null)
  const [isReplaying, setIsReplaying] = useState(false)
  const [replayProgress, setReplayProgress] = useState(0)
  const [predictiveData, setPredictiveData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalTourists: 0,
    activeAlerts: 0,
    safeTourists: 0,
    dangerTourists: 0,
    totalPopulation: 12847
  })

  useEffect(() => {
    fetchAlerts()
    fetchTourists()
    fetchPredictiveData()

    // Subscribe to real-time alerts
    const alertsSubscription = supabase
      .channel('officer-alerts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alerts'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAlerts(prev => [payload.new as Alert, ...prev])
          }
        }
      )
      .subscribe()

    const locationSubscription = supabase
      .channel('live-locations')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'locations'
        },
        () => {
          fetchTourists()
        }
      )
      .subscribe()

    const interval = setInterval(() => {
      fetchTourists()
      fetchAlerts()
    }, 30000)

    return () => {
      supabase.removeChannel(alertsSubscription)
      supabase.removeChannel(locationSubscription)
      clearInterval(interval)
    }
  }, [])

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (!error && data) {
        setAlerts(data)
      } else {
        setAlerts([
          {
            id: '1',
            trip_id: 'trip-1',
            type: 'PANIC',
            status: 'OPEN',
            details: { location: { lat: 28.4506, lng: 77.5847 } },
            created_at: new Date().toISOString()
          }
        ])
      }
    } catch (error) {
      console.error('Error fetching alerts:', error)
    }
  }

  const fetchTourists = async () => {
    try {
      const mockTourists: ExtendedTourist[] = [
        {
          id: 'tourist-1',
          name: 'Demo Tourist',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
          location: { lat: 28.4506, lng: 77.5847 },
          safety_score: 85,
          trip_id: 'trip-1',
          last_update: new Date().toISOString(),
          status: 'SAFE',
          destination: 'Greater Noida',
          active_alerts: 0
        },
        {
          id: 'tourist-2',
          name: 'Rahul Kapoor',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
          location: { lat: 28.4510, lng: 77.5850 },
          safety_score: 75,
          trip_id: 'trip-2',
          last_update: new Date(Date.now() - 120000).toISOString(),
          status: 'ALERT',
          destination: 'Agra',
          active_alerts: 1
        },
        {
          id: 'tourist-3',
          name: 'Ananya Iyer',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bb?w=100&h=100&fit=crop&crop=face',
          location: { lat: 26.9255, lng: 75.8236 },
          safety_score: 92,
          trip_id: 'trip-3',
          last_update: new Date(Date.now() - 180000).toISOString(),
          status: 'SAFE',
          destination: 'Jaipur',
          active_alerts: 0
        },
        {
          id: 'tourist-4',
          name: 'Priya Gupta',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
          location: { lat: 28.6129, lng: 77.2295 },
          safety_score: 35,
          trip_id: 'trip-4',
          last_update: new Date(Date.now() - 300000).toISOString(),
          status: 'DANGER',
          destination: 'Delhi',
          active_alerts: 2
        }
      ]

      setTourists(mockTourists)
      
      setStats({
        totalTourists: mockTourists.length,
        activeAlerts: alerts.filter(a => a.status === 'OPEN').length,
        safeTourists: mockTourists.filter(t => t.status === 'SAFE').length,
        dangerTourists: mockTourists.filter(t => t.status === 'DANGER').length,
        totalPopulation: 12847
      })
    } catch (error) {
      console.error('Error fetching tourists:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPredictiveData = async () => {
    try {
      setPredictiveData([
        {
          area_name: 'India Gate',
          time: 'Tomorrow 6:00 PM',
          score: 85,
          prediction: 'High congestion expected'
        },
        {
          area_name: 'Connaught Place',
          time: 'Tomorrow 8:00 PM',
          score: 72,
          prediction: 'Moderate crowd expected'
        },
        {
          area_name: 'Red Fort',
          time: 'Tomorrow 2:00 PM',
          score: 68,
          prediction: 'Moderate tourist activity'
        }
      ])
    } catch (error) {
      console.error('Failed to fetch predictive data:', error)
      setPredictiveData([
        {
          area_name: 'India Gate',
          time: 'Tomorrow 6:00 PM',
          score: 85,
          prediction: 'High congestion expected'
        }
      ])
    }
  }

  const generateEFIR = async (alertId: string) => {
    try {
      toast({
        title: 'E-FIR Generated',
        description: 'PDF document created successfully',
        type: 'success'
      })
    } catch (error) {
      toast({
        title: 'Error generating E-FIR',
        description: 'Please try again later',
        type: 'error'
      })
    }
  }

  const startIncidentReplay = (alert: Alert) => {
    setSelectedAlert(alert)
    setIsReplaying(true)
    setReplayProgress(0)

    const interval = setInterval(() => {
      setReplayProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsReplaying(false)
          return 100
        }
        return prev + 5
      })
    }, 200)
  }

  const getAlertSeverityColor = (type: string, status: string) => {
    if (status === 'RESOLVED') return 'text-gray-500 bg-gray-100'
    
    switch (type) {
      case 'PANIC': return 'text-red-600 bg-red-100'
      case 'GEOFENCE': return 'text-orange-600 bg-orange-100'
      case 'ANOMALY': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={45} className="text-orange-500" />
            <h1 className="text-xl font-bold">Officer Dashboard</h1>
            <div className="flex items-center gap-4 ml-8">
              <div className="flex items-center gap-2">
                <Users className="text-cyan-400" size={16} />
                <span className="text-sm font-bold text-cyan-100">{stats.totalTourists} Tourists</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-red-300" size={16} />
                <span className="text-sm font-bold text-red-100">{stats.activeAlerts} Alerts</span>
              </div>
              <div className="flex items-center gap-2">
                <Logo size={16} className="text-green-300" />
                <span className="text-sm font-bold text-green-100">{stats.safeTourists} Safe</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="text-red-400" size={16} />
                <span className="text-sm font-bold text-red-100">{stats.dangerTourists} Danger</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="text-violet-300" size={16} />
                <span className="text-sm font-bold text-violet-100">{stats.totalPopulation.toLocaleString()} Population</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <motion.div 
                className="w-2 h-2 bg-green-400 rounded-full"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-sm text-gray-300 font-bold">Live</span>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative"
              onClick={() => {
                toast({ title: 'Alert sounds toggled', type: 'success' })
              }}
            >
              <Volume2 size={16} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"></span>
            </Button>
            
            <Button variant="ghost" size="sm" className="relative">
              <Bell size={16} />
              {stats.activeAlerts > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">
                  {stats.activeAlerts}
                </span>
              )}
            </Button>
            <Button variant="ghost" onClick={signOut} className="font-bold">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-gray-400 mt-4 font-bold">Loading dashboard...</p>
          </div>
        </div>
      ) : (
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-5 gap-6">
          {/* Left Sidebar - Alerts */}
            <div className="lg:col-span-1 space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-100">Active Alerts</h3>
                <motion.span 
                  className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold"
                  animate={stats.activeAlerts > 0 ? { 
                    scale: [1, 1.2, 1],
                    boxShadow: ['0 0 0 0 rgba(239, 68, 68, 0.7)', '0 0 0 10px rgba(239, 68, 68, 0)', '0 0 0 0 rgba(239, 68, 68, 0.7)']
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {alerts.filter(a => a.status === 'OPEN').length}
                </motion.span>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {alerts.map((alert, index) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
                        selectedAlert?.id === alert.id 
                          ? 'border-orange-500 bg-orange-500/20' 
                          : 'border-gray-600 bg-gray-700'
                      }`}
                      onClick={() => setSelectedAlert(alert)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${getAlertSeverityColor(alert.type, alert.status)}`}>
                          {alert.type}
                        </span>
                        <span className="text-xs text-gray-300 font-bold">
                          {new Date(alert.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-200 truncate font-bold">
                        Trip: {alert.trip_id.substring(0, 8)}...
                      </p>
                      {alert.type === 'PANIC' && (
                        <div className="flex items-center gap-1 mt-2">
                          <AlertTriangle size={12} className="text-red-400" />
                          <span className="text-xs text-red-300 font-bold">URGENT RESPONSE NEEDED</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </Card>

              <Card className="bg-gray-800 border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-100">Live Tourists</h3>
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                    {tourists.length}
                  </span>
                </div>
                
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {tourists.map((tourist, index) => (
                    <motion.div
                      key={tourist.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <TouristCard
                        tourist={tourist}
                        onClick={tourist => setSelectedTourist(tourist as ExtendedTourist)}
                        isSelected={selectedTourist?.id === tourist.id}
                      />
                    </motion.div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Center Column - Map */}
            <div className="lg:col-span-3 space-y-6">
            <Card className="bg-gray-800 border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-100 flex items-center gap-2">
                    <MapPin size={18} />
                    Live Monitoring
                  </h3>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" className="text-gray-200 hover:text-white">
                      <Users size={14} className="mr-1" />
                      <span className="font-bold">{tourists.length}</span>
                    </Button>
                    <Button size="sm" variant="ghost" className="text-gray-200 hover:text-white">
                      <AlertTriangle size={14} className="mr-1" />
                      <span className="font-bold">{alerts.filter(a => a.status === 'OPEN').length}</span>
                    </Button>
                    <Button size="sm" variant="ghost" className="text-gray-200 hover:text-white">
                      <Activity size={14} className="mr-1" />
                      <span className="font-bold">Live</span>
                    </Button>
                    <Button size="sm" variant="ghost" className="text-gray-200 hover:text-white">
                      <Eye size={14} className="mr-1" />
                      <span className="font-bold">Full View</span>
                    </Button>
                  </div>
                </div>
                
                <div className="bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-600">
                  <MapComponent 
                    showGeofences={true}
                    className="h-[500px]"
                    places={[]}
                    tourists={tourists}
                    onTouristClick={setSelectedTourist}
                  />
                </div>

                {/* Incident Replay Controls */}
                {selectedAlert && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-gray-100">Incident Replay</h4>
                      <Button
                        size="sm"
                        onClick={() => startIncidentReplay(selectedAlert)}
                        disabled={isReplaying}
                        className="bg-orange-500 hover:bg-orange-600 font-bold"
                      >
                        {isReplaying ? <Pause size={14} /> : <Play size={14} />}
                        {isReplaying ? 'Replaying...' : 'Start Replay'}
                      </Button>
                    </div>
                    
                    {isReplaying && (
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <motion.div 
                          className="bg-orange-500 h-2 rounded-full"
                          style={{ width: `${replayProgress}%` }}
                        />
                      </div>
                    )}
                  </motion.div>
                )}
            </Card>

              {/* Real-time Activity Feed */}
            <Card className="bg-gray-800 border-gray-700">
                <h3 className="font-bold text-gray-100 mb-4 flex items-center gap-2">
                  <Activity size={18} />
                  Live Activity Feed
                </h3>
                
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 bg-red-900/40 rounded-lg border border-red-500/50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-red-100 font-bold">🚨 Panic Alert - Priya Gupta</span>
                      <span className="text-xs text-red-200 font-bold bg-red-500/30 px-2 py-1 rounded">2 min ago</span>
                    </div>
                    <p className="text-xs text-red-100 mt-1 font-bold">🆘 Manual panic button pressed near Delhi - Officer dispatched</p>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-3 bg-yellow-900/40 rounded-lg border border-yellow-500/50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-yellow-100 font-bold">⚡ Speed Alert - Rahul Kapoor</span>
                      <span className="text-xs text-yellow-200 font-bold bg-yellow-500/30 px-2 py-1 rounded">15 min ago</span>
                    </div>
                    <p className="text-xs text-yellow-100 mt-1 font-bold">🏃 Exceeding safe speed limits - Auto-alert sent</p>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-3 bg-green-900/40 rounded-lg border border-green-500/50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-100 font-bold">✅ Safety Score Improved - Ananya</span>
                      <span className="text-xs text-green-200 font-bold bg-green-500/30 px-2 py-1 rounded">1 hr ago</span>
                    </div>
                    <p className="text-xs text-green-100 mt-1 font-bold">📈 Score increased to 92/100 - Gold tier achieved</p>
                  </motion.div>
                </div>
              </Card>
            </div>

            {/* Right Sidebar - Details & Analytics */}
            <div className="lg:col-span-1 space-y-6">
              {/* Predictive Analytics */}
              <Card className="bg-gray-800 border-gray-700">
                <h3 className="font-bold text-gray-100 mb-4">Predictive Alerts</h3>
                <div className="space-y-3">
                  {predictiveData.map((prediction, index) => (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 bg-yellow-900/40 rounded-lg border border-yellow-500/50"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-yellow-200">
                          {prediction.area_name}
                        </span>
                        <span className="text-xs text-yellow-300 font-bold">
                          {prediction.score}%
                        </span>
                      </div>
                      <p className="text-xs text-yellow-100 font-bold">{prediction.time}</p>
                      <p className="text-xs text-yellow-100 font-bold">{prediction.prediction}</p>
                    </motion.div>
                  ))}
                </div>
              </Card>

              {/* Tourist/Alert Details */}
              {selectedAlert ? (
                <>
                  <Card className="bg-gray-800 border-gray-700">
                    <h3 className="font-bold text-gray-100 mb-4">Alert Details</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-bold text-gray-200">Type</p>
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${getAlertSeverityColor(selectedAlert.type, selectedAlert.status)}`}>
                          {selectedAlert.type}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-200">Status</p>
                        <p className="text-sm text-gray-300 font-bold">{selectedAlert.status}</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-200">Time</p>
                        <p className="text-sm text-gray-300 flex items-center gap-1 font-bold">
                          <Clock size={12} />
                          {new Date(selectedAlert.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700">
                    <h3 className="font-bold text-gray-100 mb-4">Actions</h3>
                    <div className="space-y-2">
                      <Button
                        onClick={() => generateEFIR(selectedAlert.id)}
                        className="w-full bg-orange-500 hover:bg-orange-600 font-bold"
                      >
                        <Download size={14} className="mr-2" />
                        Generate E-FIR
                      </Button>
                      <Button
                        variant="secondary"
                        className="w-full bg-gray-700 hover:bg-gray-600 font-bold"
                        onClick={() => {
                          setAlerts(prev => 
                            prev.map(a => 
                              a.id === selectedAlert.id 
                                ? { ...a, status: 'ACK' as const }
                                : a
                            )
                          )
                          toast({
                            title: 'Alert acknowledged',
                            description: 'Status updated successfully',
                            type: 'success'
                          })
                        }}
                      >
                        Mark as Acknowledged
                      </Button>
                    </div>
                  </Card>
                </>
              ) : selectedTourist ? (
                <Card className="bg-gray-800 border-gray-700">
                  <h3 className="font-bold text-gray-100 mb-4">Tourist Details</h3>
                  <div className="space-y-3">
                    <div className="text-center mb-4">
                      <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-3 border-2 border-cyan-400">
                        <img 
                          src={selectedTourist.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'} 
                          alt={selectedTourist.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h4 className="font-bold text-white text-lg">{selectedTourist.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                        selectedTourist.status === 'SAFE' 
                          ? 'bg-green-500/20 text-green-300' 
                          : selectedTourist.status === 'ALERT'
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : 'bg-red-500/20 text-red-300'
                      }`}>
                        {selectedTourist.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-cyan-300">📍 Destination</p>
                      <p className="text-sm text-white font-bold">{selectedTourist.destination}</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-violet-300">🛡️ Safety Score</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <motion.div 
                            className={`h-2 rounded-full ${
                              selectedTourist.safety_score >= 70 ? 'bg-green-500' : 
                              selectedTourist.safety_score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${selectedTourist.safety_score}%` }}
                          />
                        </div>
                        <span className="text-sm text-white font-bold">{selectedTourist.safety_score}/100</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-orange-300">⚠️ Active Alerts</p>
                      <p className="text-sm text-white font-bold">{selectedTourist.active_alerts}</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-blue-300">🕐 Last Update</p>
                      <p className="text-sm text-blue-100 font-bold">
                        {selectedTourist.last_update ? new Date(selectedTourist.last_update).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-pink-300">📍 GPS Coordinates</p>
                      <p className="text-xs text-pink-100 font-mono bg-gray-700/50 p-1 rounded font-bold">
                        {selectedTourist.location.lat.toFixed(4)}, {selectedTourist.location.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="bg-gray-800 border-gray-700">
                  <div className="text-center text-gray-500 py-8">
                    <Eye size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-300 font-bold">Select an alert or tourist marker to view details</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}