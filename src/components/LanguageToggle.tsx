import React from 'react'
import { Globe, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../lib/store'
import { Button } from './ui/Button'

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useAppStore()
  const [showDropdown, setShowDropdown] = React.useState(false)

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    { code: 'bn', label: 'বাংলা', flag: '🇧🇩' }, // Demo regional language
  ]

  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === language) || languages[0]
  }

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode as 'en' | 'hi')
    setShowDropdown(false)
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 min-w-[80px]"
      >
        <Globe size={16} />
        <span className="flex items-center gap-1">
          {getCurrentLanguage().flag}
          {getCurrentLanguage().code.toUpperCase()}
        </span>
        <ChevronDown 
          size={12} 
          className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} 
        />
      </Button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[140px] z-50"
          >
            {languages.map((lang) => (
              <motion.button
                key={lang.code}
                whileHover={{ backgroundColor: 'rgba(249, 115, 22, 0.1)' }}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 hover:text-orange-600 transition-colors ${
                  language === lang.code ? 'text-orange-600 bg-orange-50' : 'text-gray-700'
                }`}
              >
                <span className="text-base">{lang.flag}</span>
                <div>
                  <span className="font-medium">{lang.label}</span>
                  {language === lang.code && (
                    <div className="w-1 h-1 bg-orange-500 rounded-full ml-auto" />
                  )}
                </div>
              </motion.button>
            ))}
            
            <div className="border-t border-gray-200 my-2" />
            <div className="px-4 py-2 text-xs text-gray-500">
              More languages coming soon
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  )
}