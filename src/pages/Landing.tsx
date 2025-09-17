import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Shield , QrCode, MapPin, Share, BarChart3, Heart, Star } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { DiscoverStates } from '../components/DiscoverStates'
import Logo from "../components/Logo";

export const Landing: React.FC = () => {
  const navigate = useNavigate()

  const stats = [
    { number: '100+', label: 'Protected Tourists', color: 'text-orange-400' },
    { number: '50+',  label: 'Partner Hotels',     color: 'text-orange-400' },
    { number: '24/7', label: 'Safety Monitoring',  color: 'text-orange-400' },
    { number: '99.9%',label: 'Response Rate',      color: 'text-orange-400' }
  ]

  const testimonials = [
    {
      name: 'Priya Sharma',
      location: 'Delhi',
      rating: 5,
      text: 'Saarthi Suraksha gave me confidence while exploring new places. The SOS feature is amazing!'
    },
    {
      name: 'Raj Patel',
      location: 'Mumbai',
      rating: 5,
      text: 'My family loves the real-time tracking. We feel secure knowing help is always available.'
    },
    {
      name: 'Officer Kumar',
      location: 'Noida Police',
      rating: 5,
      text: 'The officer dashboard helps us respond to incidents faster and more efficiently.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Beautiful Mountain Background (limited to hero) */}
      <div
        className="absolute top-0 left-0 right-0 h-screen bg-cover bg-center bg-no-repeat opacity-70 z-0"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop')"
        }}
      />
      
      {/* Glassmorphism Overlay (limited to hero) */}
      <div className="absolute top-0 left-0 right-0 h-screen bg-gradient-to-br from-blue-900/40 via-purple-900/30 to-indigo-900/40 backdrop-blur-sm z-0" />
      
      {/* Background Pattern (limited to hero) */}
      <div className="absolute top-0 left-0 right-0 h-screen bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30 z-0"></div>
      
      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col justify-center items-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-6xl mx-auto"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Main Content */}
            <div className="text-left">
              {/* Logo and Brand */}
              <div className="flex items-center mb-8">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mr-4 shadow-2xl">
                  <Logo size={70} className="text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-orange-400">Saarthi</h1>
                  <h1 className="text-4xl font-bold text-white">Suraksha</h1>
                  <p className="text-orange-300 text-sm mt-1">सारथी सुरक्षा</p>
                </div>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Your Saarthi, Your Suraksha
              </h2>
              <p className="text-xl text-white mb-8 leading-relaxed max-w-2xl font-medium">
                Smart monitoring, instant response, and peace of mind for tourists. Your trusted companion for safe and secure travel adventures.
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button
                  onClick={() => navigate('/login?role=user')}
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 text-lg shadow-2xl rounded-2xl font-bold"
                >
                  Login as Tourist
                </Button>
                <Button
                  onClick={() => navigate('/login?role=officer')}
                  variant="secondary"
                  size="lg"
                  className="px-8 py-4 text-lg bg-white/30 hover:bg-white/40 text-white border border-white/40 shadow-xl rounded-2xl font-bold backdrop-blur-sm"
                >
                  Login as Officer
                </Button>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl p-6 text-center shadow-2xl hover:bg-white/25 transition-all duration-300"
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className={`text-3xl md:text-4xl font-bold ${stat.color} mb-2`}>
                    {stat.number}
                  </div>
                  <div className="text-white font-bold text-sm md:text-base">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Trip Creation Bar */}
      <section className="relative z-10 py-8 px-4 bg-white/10 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl shadow-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4 text-center">Plan Your Safe Journey</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-bold text-white mb-2">Destination</label>
                <input
                  type="text"
                  placeholder="Where are you going?"
                  className="w-full px-4 py-3 bg-white/30 border border-white/40 rounded-xl text-white placeholder-white/80 focus:ring-2 focus:ring-orange-500 focus:border-transparent backdrop-blur-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Check-in</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 bg-white/30 border border-white/40 rounded-xl text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent backdrop-blur-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Check-out</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 bg-white/30 border border-white/40 rounded-xl text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent backdrop-blur-sm font-medium"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => navigate('/login?role=user')}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 font-bold shadow-xl rounded-xl"
                >
                  Create Safe Trip
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Powerful Features for Your Safety
            </h2>
            <p className="text-xl text-white font-medium max-w-3xl mx-auto">
              Advanced technology meets human care to create the ultimate safety platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: QrCode,  title: 'Verified QR Identity', description: 'Blockchain-style digital identity for secure tourist verification', gradient: 'from-blue-500 to-cyan-500' },
              { icon: Shield,   title: 'Emergency SOS',        description: 'Multiple SOS modes including panic, silent, and voice activation', gradient: 'from-red-500 to-orange-500' },
              { icon: Share,    title: 'Family Share',         description: 'Real-time location sharing with privacy protection',              gradient: 'from-green-500 to-emerald-500' },
              { icon: BarChart3,title: 'Officer Dashboard',    description: 'Real-time monitoring and incident response system',              gradient: 'from-purple-500 to-violet-500' }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 1.5, y: 30 }}
                whileInView={{ opacity: 1.5, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ y: -8, scale: 1.05 }}
              >
                <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl p-8 text-center h-full shadow-2xl hover:bg-white/25 transition-all duration-300">
                  <div className={`inline-flex p-4 rounded-full bg-gradient-to-r ${feature.gradient} text-white mb-6 shadow-xl`}>
                    <feature.icon size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-white font-medium">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <DiscoverStates />

      {/* Testimonials Section — light cards with dark text */}
      <section className="relative z-10 py-20 px-4 bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 1, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-white font-medium max-w-3xl mx-auto">
              See what our users and law enforcement partners say about Saarthi Suraksha
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <Card className="bg-white/95 backdrop-blur-sm border border-white/40 text-gray-900 h-full p-6 shadow-xl">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={16} className="text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="mb-6 italic text-gray-700">"{testimonial.text}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-gray-600 font-medium text-sm">{testimonial.location}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-4 bg-black/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Travel Safely?
            </h2>
            <p className="text-xl text-white font-medium mb-8">
              Join thousands of travelers who trust Saarthi Suraksha for their safety
            </p>
            <Button
              onClick={() => navigate('/login')}
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-12 py-4 text-lg font-bold shadow-2xl rounded-2xl"
            >
              Start Your Safe Journey
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
