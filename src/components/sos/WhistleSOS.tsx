import React, { useState, useEffect, useRef } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { Button } from '../ui/Button'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useAppStore } from '../../lib/store'
import { toast } from '../../hooks/useToast'

export const WhistleSOS: React.FC = () => {
  const [isListening, setIsListening] = useState(false)
  const [clapCount, setClapCount] = useState(0)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  const animationRef = useRef<number | null>(null)
  const { user } = useAuth()
  const { currentLocation, activeTripId } = useAppStore()

  useEffect(() => {
    if (isListening) {
      startAudioDetection()
    } else {
      stopAudioDetection()
    }

    return () => stopAudioDetection()
  }, [isListening])

  const startAudioDetection = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioContextRef.current = new AudioContext()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      source.connect(analyserRef.current)
      
      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount)
      
      detectSounds()
    } catch (error) {
      console.error('Failed to start audio detection:', error)
      setIsListening(false)
    }
  }

  const detectSounds = () => {
    if (!analyserRef.current || !dataArrayRef.current) return

    analyserRef.current.getByteFrequencyData(dataArrayRef.current)
    
    // Simple sound threshold detection
    const average = dataArrayRef.current.reduce((a, b) => a + b) / dataArrayRef.current.length
    
    if (average > 50) { // Adjust threshold as needed
      setClapCount(prev => {
        const newCount = prev + 1
        if (newCount >= 3) {
          handleWhistleSOS()
          return 0
        }
        return newCount
      })
    }

    animationRef.current = requestAnimationFrame(detectSounds)
  }

  const stopAudioDetection = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
  }

  const handleWhistleSOS = async () => {
    setIsListening(false)
    setClapCount(0)
    
    try {
      if (!activeTripId) {
        console.error('No active trip for whistle SOS')
        return
      }
      
      await supabase.from('alerts').insert({
        trip_id: activeTripId,
        type: 'PANIC',
        details: {
          location: currentLocation,
          timestamp: new Date().toISOString(),
          user_id: user?.id,
          trigger: 'WHISTLE_CLAP_SOS'
        }
      })
      
      toast({
        title: 'Whistle/Clap SOS activated!',
        description: 'Emergency alert sent',
        type: 'success'
      })
    } catch (error) {
      console.error('Failed to send whistle/clap SOS:', error)
    }
  }

  const toggleListening = () => {
    setIsListening(!isListening)
    setClapCount(0)
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        onClick={toggleListening}
        variant={isListening ? 'danger' : 'secondary'}
        className="w-16 h-16 rounded-full"
      >
        {isListening ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </Button>
      <p className="text-xs text-gray-600 text-center">
        {isListening ? `${clapCount}/3` : 'Whistle SOS'}
      </p>
      
      {/* Fallback button */}
      <Button
        onClick={handleWhistleSOS}
        variant="ghost"
        size="sm"
        className="text-xs"
      >
        Send Sound
      </Button>
    </div>
  )
}