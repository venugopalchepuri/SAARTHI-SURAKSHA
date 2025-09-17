import React, { useState, useEffect } from 'react'
import { Mic, MicOff } from 'lucide-react'
import { Button } from '../ui/Button'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useAppStore } from '../../lib/store'
import { toast } from '../../hooks/useToast'

export const SilentSOS: React.FC = () => {
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  const { user } = useAuth()
  const { currentLocation, activeTripId } = useAppStore()

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase()
        console.log('Heard:', transcript)
        
        if (transcript.includes('help') || transcript.includes('emergency')) {
          handleSilentSOS()
        }
      }
      
      setRecognition(recognition)
    }
  }, [])

  const handleSilentSOS = async () => {
    try {
      if (!activeTripId) {
        console.error('No active trip for silent SOS')
        return
      }
      
      await supabase.from('alerts').insert({
        trip_id: activeTripId,
        type: 'PANIC',
        details: {
          location: currentLocation,
          timestamp: new Date().toISOString(),
          user_id: user?.id,
          trigger: 'SILENT_SOS'
        }
      })
      
      // Silent notification (no alert popup)
      console.log('Silent SOS activated')
    } catch (error) {
      console.error('Failed to send silent SOS:', error)
    }
  }

  const toggleListening = () => {
    if (!recognition) {
      toast({
        title: 'Speech recognition not supported',
        description: 'Use the manual button instead',
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

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        onClick={toggleListening}
        variant={isListening ? 'danger' : 'secondary'}
        className="w-16 h-16 rounded-full"
      >
        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
      </Button>
      <p className="text-xs text-gray-600 text-center">
        {isListening ? 'Listening...' : 'Silent SOS'}
      </p>
      
      {/* Fallback button */}
      <Button
        onClick={handleSilentSOS}
        variant="ghost"
        size="sm"
        className="text-xs"
      >
        Send Silent
      </Button>
    </div>
  )
}