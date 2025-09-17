import React, { useState, useEffect, useRef } from 'react'
import { Mic, MicOff } from 'lucide-react'
import { Button } from './ui/Button'
import { motion } from 'framer-motion'
import { useAppStore } from '../lib/store'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { toast } from '../hooks/useToast'

export const VoiceSOS: React.FC = () => {
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  const { voiceSosEnabled, setVoiceSosEnabled, currentLocation, activeTripId, language } = useAppStore()
  const { user } = useAuth()

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      
      recognitionInstance.continuous = true
      recognitionInstance.interimResults = true
      recognitionInstance.lang = language === 'hi' ? 'hi-IN' : 'en-US'
      
      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase()
        console.log('Voice detected:', transcript)
        
        // English keywords
        const englishKeywords = ['help', 'emergency', 'danger', 'rescue']
        // Hindi keywords
        const hindiKeywords = ['bachao', 'madad', 'sahaayata', 'khatre']
        
        const keywords = language === 'hi' ? hindiKeywords : englishKeywords
        const hasKeyword = keywords.some(keyword => transcript.includes(keyword))
        
        if (hasKeyword) {
          handleVoiceSOS()
        }
      }
      
      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }
      
      setRecognition(recognitionInstance)
    }
  }, [language])

  const handleVoiceSOS = async () => {
    try {
      if (!activeTripId) {
        toast({
          title: 'No active trip',
          description: 'Please create a trip first',
          type: 'error'
        })
        return
      }
      
      await supabase.from('alerts').insert({
        trip_id: activeTripId,
        type: 'PANIC',
        details: {
          location: currentLocation,
          timestamp: new Date().toISOString(),
          user_id: user?.id,
          trigger: 'VOICE_SOS'
        }
      })
      
      toast({
        title: 'Voice SOS activated!',
        description: 'Emergency alert sent',
        type: 'success'
      })
      
      setIsListening(false)
    } catch (error) {
      console.error('Failed to send voice SOS:', error)
    }
  }

  const toggleVoiceListening = () => {
    if (!recognition) {
      toast({
        title: 'Voice recognition not supported',
        description: 'Your browser does not support voice recognition',
        type: 'error'
      })
      return
    }

    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      recognition.start()
      setIsListening(true)
    }
  }

  const toggleVoiceSOS = () => {
    setVoiceSosEnabled(!voiceSosEnabled)
    if (!voiceSosEnabled && recognition) {
      recognition.start()
      setIsListening(true)
    } else if (recognition) {
      recognition.stop()
      setIsListening(false)
    }
  }

  return (
    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-blue-900">Voice SOS</h4>
        <Button
          onClick={toggleVoiceSOS}
          size="sm"
          variant={voiceSosEnabled ? 'primary' : 'secondary'}
          className="text-xs"
        >
          {voiceSosEnabled ? 'ON' : 'OFF'}
        </Button>
      </div>
      
      <p className="text-xs text-blue-700 mb-3">
        Say "{language === 'hi' ? 'Bachao' : 'Help'}" to trigger emergency alert
      </p>
      
      {voiceSosEnabled && (
        <div className="flex items-center gap-2">
          <motion.div
            animate={isListening ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 1, repeat: isListening ? Infinity : 0 }}
            className={`p-2 rounded-full ${isListening ? 'bg-red-100' : 'bg-gray-100'}`}
          >
            {isListening ? (
              <MicOff size={16} className="text-red-600" />
            ) : (
              <Mic size={16} className="text-gray-600" />
            )}
          </motion.div>
          <span className="text-xs text-blue-600">
            {isListening ? 'Listening...' : 'Voice detection ready'}
          </span>
        </div>
      )}
    </div>
  )
}