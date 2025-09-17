import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Shield, Mail, User, UserCheck, Lock, Zap } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import * as Tabs from '@radix-ui/react-tabs'
import { useAuth } from '../contexts/AuthContext'

import { toast } from '../hooks/useToast'
import Logo from '../components/Logo'

export const Login: React.FC = () => {
  const [searchParams] = useSearchParams()
  const roleParam = searchParams.get('role')
  const [activeRole, setActiveRole] = useState<'user' | 'officer'>(
    roleParam === 'officer' ? 'officer' : 'user'
  )
  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const { user, loading: authLoading, signInWithPassword, signInWithOtp, signUp } = useAuth()
  const navigate = useNavigate()

  // Navigate when user is authenticated
  useEffect(() => {
    if (user && !authLoading) {
      const isOfficer = activeRole === 'officer' || 
        (user.email && user.email.includes('venugopal'))
      
      const destination = isOfficer ? '/dashboard/officer' : '/dashboard/user'
      navigate(destination)
    }
  }, [user, authLoading, navigate, activeRole])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    setMessage('')

    try {
      if (isSignUp) {
        if (!password.trim()) throw new Error('Password is required for signup')
        await signUp(email, password, fullName)
        setMessage('Account created! Check your email to verify.')
      } else if (authMode === 'password') {
        if (!password.trim()) throw new Error('Password is required')
        await signInWithPassword(email, password)
        toast({ title: 'Login successful!', type: 'success' })
      } else {
        await signInWithOtp(email)
        setMessage('Check your email for the magic link!')
      }
    } catch (error: any) {
      setMessage(error.message || 'An error occurred during login')
      toast({ title: 'Authentication failed', description: error.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const fillDemoCredentials = (role: 'user' | 'officer') => {
    if (role === 'officer') {
      setEmail('venugopal@saarthi.in')
      setPassword('india123')
    } else {
      setEmail('demouser@saarthi.in')
      setPassword('user123')
    }
    setAuthMode('password')
    setIsSignUp(false)
  }

  return (
    <div
      className="min-h-screen bg-[url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center bg-fixed flex items-center justify-center px-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Logo size={32} className="mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">Saarthi Suraksha</h1>
          </div>
          <p className="text-gray-600 font-semibold">Sign in to continue your safe journey</p>
        </div>

        <Card className="p-8">
          <Tabs.Root value={activeRole} onValueChange={(value) => setActiveRole(value as 'user' | 'officer')}>
            <Tabs.List className="flex mb-8 bg-gray-100 rounded-lg p-1">
              <Tabs.Trigger
                value="user"
                className="flex-1 flex items-center justify-center py-3 px-4 rounded-md text-sm font-bold transition-colors data-[state=active]:bg-white data-[state=active]:text-orange-500 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900"
              >
                <User size={16} className="mr-2" />
                Tourist
              </Tabs.Trigger>
              <Tabs.Trigger
                value="officer"
                className="flex-1 flex items-center justify-center py-3 px-4 rounded-md text-sm font-bold transition-colors data-[state=active]:bg-white data-[state=active]:text-orange-500 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900"
              >
                <UserCheck size={16} className="mr-2" />
                Officer
              </Tabs.Trigger>
            </Tabs.List>
          </Tabs.Root>

          {/* Demo Credentials */}
          <div className="mb-6 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700 mb-2 font-bold">Quick Demo Access:</p>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => fillDemoCredentials(activeRole)}
              className="w-full text-xs font-bold"
            >
              🚀 Fill Demo {activeRole === 'officer' ? 'Officer (venugopal@saarthi.in)' : 'Tourist (demouser@saarthi.in)'} Credentials
            </Button>
          </div>

          {/* Auth Mode Toggle */}
          <div className="flex mb-6 bg-gray-50 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setAuthMode('password')}
              className={`flex-1 flex items-center justify-center py-2 px-3 rounded-md text-xs font-bold transition-colors ${
                authMode === 'password'
                  ? 'bg-white text-orange-500 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Lock size={14} className="mr-1" />
              Password
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('otp')}
              className={`flex-1 flex items-center justify-center py-2 px-3 rounded-md text-xs font-bold transition-colors ${
                authMode === 'otp'
                  ? 'bg-white text-orange-500 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Zap size={14} className="mr-1" />
              Magic Link
            </button>
          </div>

          <form onSubmit={handleAuth}>
            {isSignUp && authMode === 'password' && (
              <div className="mb-4">
                <label htmlFor="fullName" className="block text-sm font-bold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 font-semibold"
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 font-bold"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {authMode === 'password' && (
              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 font-bold"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>
            )}

            {message && (
              <div className={`mb-4 p-3 rounded-lg text-sm font-bold ${
                message.includes('Check your email') 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {message}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 font-bold text-lg"
              disabled={loading}
            >
              {loading ? (
                isSignUp ? 'Creating Account...' : 
                authMode === 'otp' ? 'Sending Magic Link...' : 'Signing In...'
              ) : (
                isSignUp ? 'Create Account' :
                authMode === 'otp' ? 'Send Magic Link' : 'Sign In'
              )}
            </Button>
          </form>

          {authMode === 'password' && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-orange-600 hover:text-orange-700 text-sm font-bold"
              >
                {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-700 font-bold">
              {activeRole === 'officer' 
                ? 'Only authorized officers can access the dashboard' 
                : 'New user? You\'ll be automatically registered on first login'
              }
            </p>
          </div>
        </Card>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-orange-600 hover:text-orange-700 text-sm font-bold"
          >
            ← Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  )
}
