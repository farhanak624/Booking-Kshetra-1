'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
  blurDataURL?: string
  onLoad?: () => void
}

export default function OptimizedImage({
  src,
  alt,
  className = '',
  priority = false,
  blurDataURL,
  onLoad
}: OptimizedImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageSrc, setImageSrc] = useState<string | null>(null)

  useEffect(() => {
    // Preload the image
    const img = new Image()
    
    // Set loading priority
    if (priority) {
      img.fetchPriority = 'high'
    }

    img.onload = () => {
      setImageSrc(src)
      setImageLoaded(true)
      onLoad?.()
    }

    img.onerror = () => {
      console.error(`Failed to load image: ${src}`)
      setImageSrc(src) // Still try to display it
      setImageLoaded(true)
    }

    img.src = src

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src, priority, onLoad])

  return (
    <div className={`relative ${className}`}>
      <AnimatePresence mode="wait">
        {!imageLoaded && (
          <motion.div
            key="placeholder"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black"
            style={{
              backgroundImage: blurDataURL ? `url(${blurDataURL})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(20px)',
              transform: 'scale(1.1)'
            }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 shimmer-animation" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.img
        src={imageSrc || src}
        alt={alt}
        className={className}
        initial={{ opacity: 0 }}
        animate={{ opacity: imageLoaded ? 1 : 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        style={{
          opacity: imageLoaded ? 1 : 0,
          transition: 'opacity 0.5s ease-out'
        }}
      />
    </div>
  )
}

