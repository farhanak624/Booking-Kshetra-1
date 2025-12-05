'use client'

import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import OptimizedImage from './OptimizedImage'

interface HeroSectionProps {
  backgroundImage: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  children?: React.ReactNode
  className?: string
  overlayOpacity?: number
  enableParallax?: boolean
  minHeight?: string
  blurDataURL?: string
}

export default function HeroSection({
  backgroundImage,
  title,
  subtitle,
  children,
  className = '',
  overlayOpacity = 0.2,
  enableParallax = false,
  minHeight = 'min-h-screen',
  blurDataURL
}: HeroSectionProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])

  // Preload image on mount
  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = backgroundImage
    link.fetchPriority = 'high'
    document.head.appendChild(link)

    // Create an image element to check if loaded
    const img = new Image()
    img.fetchPriority = 'high'
    img.onload = () => {
      setImageLoaded(true)
    }
    img.src = backgroundImage

    return () => {
      document.head.removeChild(link)
    }
  }, [backgroundImage])

  return (
    <section className={`relative ${minHeight} overflow-hidden bg-black ${className}`}>
      {/* Background Image Layer */}
      <motion.div
        className="absolute inset-0 bg-black"
        style={enableParallax ? { y } : {}}
      >
        {/* Immediate black background to prevent white flash */}
        <div className="absolute inset-0 bg-black" />
        
        {/* Blur placeholder - visible before image loads */}
        {!imageLoaded && (
          <div
            className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black animate-pulse z-10"
            style={{
              backgroundImage: blurDataURL ? `url(${blurDataURL})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(20px)',
              transform: 'scale(1.1)'
            }}
          />
        )}

        {/* Actual background image */}
        <motion.img
          src={backgroundImage}
          alt="Hero Background"
          className={`w-full ${enableParallax ? 'h-[120%]' : 'h-full'} object-cover relative z-20`}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ 
            opacity: imageLoaded ? 1 : 0,
            scale: 1
          }}
          transition={{ 
            duration: 0.6,
            ease: 'easeOut'
          }}
          onLoad={() => setImageLoaded(true)}
          style={{
            willChange: enableParallax ? 'transform' : 'auto'
          }}
        />

        {/* Overlay */}
        <div 
          className="absolute inset-0 bg-black z-30"
          style={{ opacity: overlayOpacity }}
        />
      </motion.div>

      {/* Content Layer */}
      <div className={`relative z-40 ${minHeight} flex items-center`}>
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[100px] 2xl:px-[120px] w-full">
          {title && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {title}
            </motion.div>
          )}

          {subtitle && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {subtitle}
            </motion.div>
          )}

          {children}
        </div>
      </div>
    </section>
  )
}

