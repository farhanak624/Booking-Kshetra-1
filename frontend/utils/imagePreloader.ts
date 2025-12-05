/**
 * Preload critical images for better UX
 */

export const preloadImage = (src: string, priority: 'high' | 'low' = 'high'): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    // Set loading priority
    if ('fetchPriority' in img) {
      (img as any).fetchPriority = priority
    }

    img.onload = () => resolve()
    img.onerror = () => reject(new Error(`Failed to preload image: ${src}`))
    img.src = src
  })
}

export const preloadImages = async (urls: string[]): Promise<void> => {
  try {
    await Promise.all(urls.map(url => preloadImage(url)))
  } catch (error) {
    console.error('Error preloading images:', error)
  }
}

/**
 * Create a preload link tag for critical images
 */
export const createPreloadLink = (href: string): HTMLLinkElement => {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.href = href
  link.fetchPriority = 'high'
  return link
}

/**
 * Preload hero images on page load
 */
export const preloadHeroImages = (imageUrls: string[]): void => {
  if (typeof window === 'undefined') return

  imageUrls.forEach(url => {
    const link = createPreloadLink(url)
    document.head.appendChild(link)
  })
}

/**
 * Generate a tiny blur placeholder data URL
 */
export const generateBlurDataURL = (width: number = 10, height: number = 10): string => {
  // Create a simple gradient as blur placeholder
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  
  if (!ctx) return ''

  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#1f2937')
  gradient.addColorStop(0.5, '#111827')
  gradient.addColorStop(1, '#000000')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  return canvas.toDataURL()
}

