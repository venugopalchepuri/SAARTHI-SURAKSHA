import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export const Card: React.FC<CardProps> = ({ children, className, hover = false }) => {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.02 } : undefined}
      className={cn(
        'rounded-xl bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg p-6',
        className
      )}
    >
      {children}
    </motion.div>
  )
}