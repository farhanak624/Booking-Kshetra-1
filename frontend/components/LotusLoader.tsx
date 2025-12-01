'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

interface LotusLoaderProps {
  onComplete: () => void
}

const LotusLoader = ({ onComplete }: LotusLoaderProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete()
    }, 2000)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900 flex items-center justify-center"
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-30"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
            }}
            animate={{
              y: [null, -100],
              opacity: [0, 0.7, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeOut"
            }}
          />
        ))}
      </div>

      {/* Ripple effects */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute border border-white/20 rounded-full"
            animate={{
              scale: [0, 4],
              opacity: [1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.7,
              ease: "easeOut"
            }}
            style={{
              width: '200px',
              height: '200px',
            }}
          />
        ))}
      </div>

      {/* Main content container */}
      <div className="relative z-10 text-center">
        {/* Kshetra Logo container */}
        <motion.div
          initial={{ scale: 0, rotateY: 180 }}
          animate={{ scale: 1, rotateY: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative w-80 h-80 mb-8"
        >
          {/* Multiple animated rings around logo */}
          {[0, 1, 2, 3].map((ringIndex) => (
            <motion.div
              key={ringIndex}
              className={`absolute inset-0 rounded-full border-2 ${
                ringIndex === 0 ? 'border-t-[#B23092]/60 border-r-[#B23092]/30 border-b-transparent border-l-transparent' :
                ringIndex === 1 ? 'border-l-pink-400/40 border-b-pink-400/20 border-t-transparent border-r-transparent' :
                ringIndex === 2 ? 'border-r-purple-400/35 border-t-purple-400/15 border-b-transparent border-l-transparent' :
                'border-b-white/25 border-l-white/10 border-t-transparent border-r-transparent'
              }`}
              animate={{
                rotate: ringIndex % 2 === 0 ? 360 : -360,
                scale: [0.8, 1.1, 0.8]
              }}
              transition={{
                rotate: { duration: 4 + ringIndex, repeat: Infinity, ease: "linear" },
                scale: { duration: 2 + ringIndex * 0.5, repeat: Infinity, ease: "easeInOut" }
              }}
              style={{
                width: `${140 + ringIndex * 25}px`,
                height: `${140 + ringIndex * 25}px`,
                margin: 'auto',
                top: `${-20 - ringIndex * 12.5}px`,
                left: `${-20 - ringIndex * 12.5}px`,
                right: `${-20 - ringIndex * 12.5}px`,
                bottom: `${-20 - ringIndex * 12.5}px`,
              }}
            />
          ))}

          {/* Glowing background for logo */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-[#B23092]/30 to-pink-400/30 rounded-full blur-xl"
            animate={{
              scale: [0.6, 1.3, 0.6],
              opacity: [0.2, 0.8, 0.2]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Floating sparkles around logo */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30)
            const radius = 120 + Math.sin(i) * 20

            return (
              <motion.div
                key={`sparkle-${i}`}
                className="absolute w-2 h-2 bg-white rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                  transformOrigin: `${radius}px 0px`,
                }}
                animate={{
                  rotate: 360,
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 },
                  opacity: { duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }
                }}
                initial={{
                  rotate: angle
                }}
              />
            )
          })}

          {/* Kshetra Logo with enhanced animation */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
          >
            <motion.img
              src="https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/logo_new.png"
              alt="Kshetra Retreat Logo"
              className="w-48 h-auto relative z-10 drop-shadow-2xl"
              animate={{
                scale: [1, 1.1, 1],
                rotateY: [0, 8, -8, 0],
                filter: [
                  'brightness(1) drop-shadow(0 0 20px rgba(178, 48, 146, 0.3))',
                  'brightness(1.2) drop-shadow(0 0 30px rgba(178, 48, 146, 0.6))',
                  'brightness(1) drop-shadow(0 0 20px rgba(178, 48, 146, 0.3))'
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>

          {/* Energy pulses emanating from logo */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`pulse-${i}`}
              className="absolute inset-0 rounded-full border border-[#B23092]/40"
              animate={{
                scale: [0.5, 2.5],
                opacity: [0.8, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.7,
                ease: "easeOut"
              }}
            />
          ))}
        </motion.div>

        {/* Brand content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="space-y-6"
        >
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-white mb-4 font-water-brush"
            animate={{
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Kshetra Retreat
          </motion.h1>

          <motion.p
            className="text-xl text-pink-200 font-annie-telescope"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            Where Serenity Meets Luxury
          </motion.p>

          {/* Loading text with dots animation */}
          <motion.div
            className="flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.6 }}
          >
            <span className="text-white/90 font-urbanist">
              Crafting your perfect experience
            </span>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-pink-400 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.4, 1, 0.4],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Progress bar */}
          <motion.div
            className="w-80 h-1 bg-white/20 rounded-full mx-auto overflow-hidden"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2, duration: 0.6 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 rounded-full"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{
                duration: 2,
                ease: "easeInOut"
              }}
              style={{
                backgroundSize: '200% 100%'
              }}
            />
          </motion.div>

          {/* Subtitle */}
          <motion.p
            className="text-sm text-white/70 font-urbanist"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 0.5 }}
          >
            Preparing your spiritual journey...
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default LotusLoader