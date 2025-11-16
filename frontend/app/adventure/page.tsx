'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Clock,
  CheckCircle,
  ArrowRight,
  Eye,
  Star,
} from 'lucide-react'
import Header from '../../components/Header'
import { adventureSportsAPI } from '../../lib/api'
import { useRouter } from 'next/navigation'

interface Service {
  _id: string
  name: string
  category: 'vehicle_rental' | 'surfing' | 'adventure' | 'diving' | 'trekking'
  price: number
  priceUnit: string
  description: string
  duration?: string
  features: string[]
  images?: string[]
  maxQuantity?: number
  isActive: boolean
}

const AdventurePage = () => {
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [selectedServices, setSelectedServices] = useState<{ _id: string; name: string; price: number; priceUnit: string; quantity: number }[]>([])
  const [selectedServiceDetails, setSelectedServiceDetails] = useState<Service | null>(null)
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await adventureSportsAPI.getAllAdventureSports()
        if (response.data?.success) {
          setServices(response.data.data.sports || [])
        } else if (response.data?.data?.sports) {
          setServices(response.data.data.sports)
        }
      } catch (e) {
        console.error('Failed to fetch adventure sports:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchServices()
  }, [])

  const formatPrice = (price: number, unit?: string) => {
    if (!price && price !== 0) return '—'
    return `₹${price.toLocaleString()}${unit ? ` / ${unit}` : ''}`
  }

  const addService = (service: Service) => {
    setSelectedServices(prev => {
      const idx = prev.findIndex(s => s._id === service._id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], quantity: Math.min((service.maxQuantity || 10), next[idx].quantity + 1) }
        return next
      }
      return [...prev, { _id: service._id, name: service.name, price: service.price, priceUnit: service.priceUnit, quantity: 1 }]
    })
  }
  const removeService = (serviceId: string) => {
    setSelectedServices(prev => {
      const idx = prev.findIndex(s => s._id === serviceId)
      if (idx < 0) return prev
      const next = [...prev]
      const qty = next[idx].quantity - 1
      if (qty <= 0) {
        next.splice(idx, 1)
      } else {
        next[idx] = { ...next[idx], quantity: qty }
      }
      return next
    })
  }

  const getTotalAmount = () => {
    return selectedServices.reduce((sum, s) => sum + s.price * s.quantity, 0)
  }

  const handleBook = () => {
    if (!selectedDate) {
      alert('Please select a service date')
      return
    }
    const bookingData = {
      services: selectedServices,
      vehicles: [],
      date: selectedDate,
      totalAmount: getTotalAmount(),
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('servicesBookingData', JSON.stringify(bookingData))
    router.push('/services/booking/details')
  }

  const ServiceCard = ({ service }: { service: Service }) => {
    const selected = selectedServices.find(s => s._id === service._id)
    const quantity = selected?.quantity || 0

    return (
      <div className="rounded-2xl overflow-hidden border border-white/15 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:border-white/30 transition-all duration-300">
        {/* Image header */}
        <div className="relative h-44 sm:h-52">
          <img
            src={(service.images && service.images[0]) || 'https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/frame1.png?updatedAt=1762760253595'}
            alt={service.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          {/* Rating badge (static for now) */}
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur text-white text-xs flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-yellow-400" />
            4.5
          </div>
          {/* Title on image */}
          <div className="absolute bottom-3 left-3">
            <div className="text-white font-urbanist font-semibold text-lg sm:text-xl">
              {service.name}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Info chips */}
          <div className="flex flex-wrap gap-2 text-[11px] text-white/80">
            {service.duration && (
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 bg-white/10 border border-white/20">
                <Clock className="w-3.5 h-3.5 text-[#B23092]" />
                <span className="leading-none">Time: {service.duration}</span>
              </span>
            )}
            {service.features.slice(0, 2).map((f, i) => (
              <span key={i} className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 bg-white/10 border border-white/20">
                <CheckCircle className="w-3.5 h-3.5 text-[#B23092]" />
                <span className="leading-none">{f}</span>
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm sm:text-base font-bold text-[#B23092]">
              {formatPrice(service.price, service.priceUnit)}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setSelectedServiceDetails(service); setShowServiceModal(true) }}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs"
              >
                View Details
              </button>
              {quantity > 0 ? (
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-2 py-1">
                  <button onClick={() => removeService(service._id)} className="w-6 h-6 rounded-full bg-[#B23092]/20 text-[#B23092]">-</button>
                  <span className="text-white text-sm min-w-[1.25rem] text-center">{quantity}</span>
                  <button onClick={() => addService(service)} className="w-6 h-6 rounded-full bg-[#B23092]/20 text-[#B23092]">+</button>
                </div>
              ) : (
                <button
                  onClick={() => addService(service)}
                  className="px-3 py-1.5 rounded-full bg-[#B23092] hover:bg-[#9a2578] text-white text-xs"
                >
                  Enroll Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden min-h-screen ">
        {/* Background Image */}
        <div className="absolute inset-0">
        
        <img
            src={'https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/adventure.jpg?updatedAt=1763305822583'}
            alt={'Adventure Sports'}
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10 min-h-screen flex items-center">
          <div className="container mx-auto px-4 md:px-[100px]">
            <div className="max-w-3xl">
              <h1 className="text-white mb-6">
                <span className="block text-3xl sm:text-4xl md:text-5xl font-annie-telescope">
                  WHERE EVERY MOMENT
                </span>
                <span className="block text-5xl sm:text-6xl md:text-7xl font-water-brush text-[#B23092] mt-3">
                  Sparks Adventure
                </span>
              </h1>
              <p className="text-white/90 font-urbanist text-sm sm:text-base md:text-lg max-w-2xl">
                Dive into heart‑racing experiences designed to push your limits and ignite your spirit.
                Our premium adventure sports combine excitement, safety, and world‑class service to
                turn your getaway into a story worth telling.
              </p>
              <button
                onClick={() => {
                  const el = document.getElementById('adventure-list')
                  if (el) el.scrollIntoView({ behavior: 'smooth' })
                }}
                className="mt-8 inline-flex items-center gap-2 bg-[#B23092] hover:bg-[#9a2578] text-white px-6 py-3 rounded-full font-urbanist font-semibold"
              >
                View Programs
                <span className="inline-block"><svg width="13" height="14" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6.11901 7.40916C6.45814 7.40916 6.79726 7.27646 7.03318 7.0258L11.8694 2.20432C12.3707 1.703 12.3707 0.877304 11.8694 0.375987C11.3681 -0.125329 10.5424 -0.125329 10.0411 0.375987L6.11901 4.28331L2.21169 0.375987C1.71037 -0.125329 0.884676 -0.125329 0.38336 0.375987C0.132702 0.626646 0 0.965771 0 1.29015C0 1.61453 0.132702 1.95366 0.38336 2.20432L5.20485 7.0258C5.44076 7.27646 5.77989 7.40916 6.11901 7.40916Z" fill="white"/>
<path d="M7.03318 13.6165L11.8694 8.79502C12.3707 8.2937 12.3707 7.468 11.8694 6.96669C11.3681 6.46537 10.5424 6.46537 10.0411 6.96669L6.11901 10.874L2.21169 6.96669C1.71037 6.46537 0.884676 6.46537 0.38336 6.96669C0.132702 7.21734 0 7.55647 0 7.88085C0 8.20523 0.132702 8.54436 0.38336 8.79502L5.20485 13.6165C5.44076 13.8524 5.77989 13.9999 6.11901 13.9999C6.45814 13.9999 6.79726 13.8672 7.03318 13.6165Z" fill="white"/>
</svg>
</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Date + Summary */}
      <div className="container mx-auto px-4 md:px-[100px] py-8" id="adventure-list">
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/20 p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex-1">
              <label className="block text-white/80 text-sm font-urbanist mb-2">Service Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-[#B23092] focus:ring-2 focus:ring-[#B23092] outline-none"
              />
            </div>
            <div className="text-white/90 font-urbanist">
              <div className="text-sm">Total</div>
              <div className="text-2xl font-annie-telescope text-[#B23092]">₹{getTotalAmount().toLocaleString()}</div>
            </div>
            <button
              onClick={handleBook}
              className="bg-[#B23092] hover:bg-[#9a2578] text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2"
            >
              Proceed to Details
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Listing */}
        {/* Section header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl text-white">
            <span className="font-annie-telescope">Adventure</span>{' '}
            <span className="font-water-brush text-[#B23092]">Sports</span>
          </h2>
          <p className="text-white/80 font-urbanist mt-2">
            Experience thrilling adventures and premium services designed to create unforgettable memories.
          </p>
        </div>
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-10 h-10 border-4 border-[#B23092] border-t-transparent rounded-full animate-spin" />
            <p className="text-white/70 mt-4">Loading adventures...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <ServiceCard service={service} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdventurePage


