'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Clock,
  CheckCircle,
  ArrowRight,
  Eye,
  Star,
  X,
  Loader2,
} from 'lucide-react'
import Header from '../../components/Header'
import { adventureSportsAPI } from '../../lib/api'
import { useRouter } from 'next/navigation'
import Footer from '@/components/Footer'

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
  const [selectedServices, setSelectedServices] = useState<{ _id: string; name: string; price: number; priceUnit: string; category: string; quantity: number }[]>([])
  const [selectedServiceDetails, setSelectedServiceDetails] = useState<Service | null>(null)
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedDate, setSelectedDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)

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
      return [...prev, { 
        _id: service._id, 
        name: service.name, 
        price: service.price, 
        priceUnit: service.priceUnit, 
        category: service.category,
        quantity: 1 
      }]
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

  const handleBook = async () => {
    // Validate that at least one service is selected
    if (selectedServices.length === 0) {
      alert('Please enroll at least one adventure sport before proceeding')
      // Scroll to services section
      const servicesSection = document.getElementById('adventure-list')
      if (servicesSection) {
        servicesSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      return
    }
    // Validate that date is selected
    if (!selectedDate) {
      alert('Please select a service date to continue with booking')
      // Scroll to date picker
      const stickyBar = document.querySelector('.sticky.bottom-0')
      if (stickyBar) {
        stickyBar.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
      return
    }
    
    setBookingLoading(true)
    try {
      const bookingData = {
        services: selectedServices,
        vehicles: [],
        date: selectedDate,
        totalAmount: getTotalAmount(),
        timestamp: new Date().toISOString()
      }
      localStorage.setItem('servicesBookingData', JSON.stringify(bookingData))
      router.push('/services/booking/details')
    } catch (error) {
      console.error('Error proceeding to booking:', error)
      setBookingLoading(false)
    }
  }

  const ServiceCard = ({ service }: { service: Service }) => {
    const selected = selectedServices.find(s => s._id === service._id)
    const quantity = selected?.quantity || 0
    const isSelected = quantity > 0

    return (
      <div className={`rounded-2xl overflow-hidden border transition-all duration-300 relative ${
        isSelected 
          ? 'border-[#B23092] bg-[#B23092]/10 backdrop-blur-md shadow-lg shadow-[#B23092]/20' 
          : 'border-white/15 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:border-white/30'
      }`}>
        {isSelected && (
          <div className="absolute top-2 left-2 z-10 bg-[#B23092] text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Selected
          </div>
        )}
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
                onClick={() => { 
                  setSelectedServiceDetails(service)
                  setSelectedImageIndex(0)
                  setShowServiceModal(true) 
                }}
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
          <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-[100px] 2xl:px-[120px]">
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
      <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-[100px] 2xl:px-[120px] py-8" id="adventure-list"
      style={{backgroundImage: 'url(https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/Kshetra/adventure.png)', backgroundSize: 'cover', backgroundPosition: 'center'}}
      >
        

        {/* Listing */}
        {/* Section header */}
        <div className="text-center mb-8 mt-[100px]">
          <h2 className="text-3xl md:text-4xl text-white font-annie-telescope">
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

      {/* Sticky Booking Summary Bar */}
      {selectedServices.length > 0 && (
        <div className="sticky bottom-0 z-40 bg-black/95 backdrop-blur-md border-t border-white/20 shadow-2xl">
          <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-[100px] 2xl:px-[120px] py-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-xs font-urbanist mb-1">Service Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:border-[#B23092] focus:ring-2 focus:ring-[#B23092] outline-none"
                  />
                </div>
                <div className="flex items-end">
                  <div className="text-white/90 font-urbanist w-full">
                    <div className="text-xs text-white/70 mb-1">Total Amount</div>
                    <div className="text-xl sm:text-2xl font-annie-telescope text-[#B23092]">₹{getTotalAmount().toLocaleString()}</div>
                  </div>
                </div>
              </div>
              <button
                onClick={handleBook}
                disabled={selectedServices.length === 0 || !selectedDate || bookingLoading}
                className="bg-[#B23092] hover:bg-[#9a2578] text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#B23092] min-w-[180px]"
              >
                {bookingLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {!selectedDate ? 'Select Date First' : 'Proceed to Booking'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Progress Indicator */}
      {selectedServices.length > 0 && (
        <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-[100px] 2xl:px-[120px] py-8 bg-black">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/20 p-6 mb-8">
            <div className="mb-4">
              <h3 className="text-white font-urbanist font-semibold text-lg mb-2">Booking Progress</h3>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <CheckCircle className="w-4 h-4 text-[#B23092]" />
                <span>Step 1: Select Services ({selectedServices.length} selected)</span>
                <ArrowRight className="w-4 h-4 mx-2" />
                <span className={selectedDate ? "text-white" : "text-white/50"}>
                  Step 2: {selectedDate ? "Date Selected ✓" : "Select Date"}
                </span>
                <ArrowRight className="w-4 h-4 mx-2" />
                <span className="text-white/50">Step 3: Enter Details</span>
                <ArrowRight className="w-4 h-4 mx-2" />
                <span className="text-white/50">Step 4: Payment</span>
              </div>
            </div>
            
            {/* Selected Services Summary */}
            <div className="mt-4 pt-4 border-t border-white/20">
              <h4 className="text-white font-urbanist font-medium mb-3">Selected Services</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedServices.map((service) => (
                  <div key={service._id} className="flex items-center justify-between text-sm bg-white/5 rounded-lg p-2">
                    <span className="text-white/90 font-urbanist">{service.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-white/70">Qty: {service.quantity}</span>
                      <span className="text-[#B23092] font-semibold">₹{(service.price * service.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between">
                <span className="text-white font-urbanist font-semibold">Total:</span>
                <span className="text-2xl font-annie-telescope text-[#B23092]">₹{getTotalAmount().toLocaleString()}</span>
              </div>
            </div>

            {/* Helpful Next Steps */}
            {selectedServices.length > 0 && !selectedDate && (
              <div className="mt-4 p-4 bg-[#B23092]/10 border border-[#B23092]/30 rounded-lg animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <Clock className="w-5 h-5 text-[#B23092]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-urbanist font-medium text-sm mb-1">Next Step Required</p>
                    <p className="text-white/80 font-urbanist text-xs mb-2">Please select a date for your adventure activities. Use the date picker in the sticky bar at the bottom of the page.</p>
                    <button
                      onClick={() => {
                        const stickyBar = document.querySelector('.sticky.bottom-0');
                        if (stickyBar) {
                          stickyBar.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }
                      }}
                      className="text-[#B23092] text-xs font-semibold hover:underline flex items-center gap-1"
                    >
                      Scroll to Date Picker <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {selectedServices.length > 0 && selectedDate && (
              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-urbanist font-medium text-sm mb-1">Ready to Book! ✓</p>
                    <p className="text-white/80 font-urbanist text-xs">All set! Click "Proceed to Booking" in the sticky bar below to continue with your details and payment. Next, you'll enter your contact information.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Service Details Modal */}
      {showServiceModal && selectedServiceDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowServiceModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-black/90 backdrop-blur-md border border-white/20 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-thumb]:bg-[#B23092]/50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-[#B23092] scrollbar-thin scrollbar-thumb-[#B23092]/50 scrollbar-track-white/5"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#B2309280 transparent'
            }}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-black/95 backdrop-blur-md border-b border-white/20 p-6 flex items-center justify-between">
              <h3 className="text-2xl font-annie-telescope text-white">{selectedServiceDetails.name}</h3>
              <button
                onClick={() => setShowServiceModal(false)}
                className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Image Gallery */}
              {selectedServiceDetails.images && selectedServiceDetails.images.length > 0 && (
                <div className="space-y-3">
                  {/* Main Image */}
                  <div className="relative h-64 sm:h-80 rounded-xl overflow-hidden bg-white/5 group">
                    <img
                      src={selectedServiceDetails.images[selectedImageIndex]}
                      alt={selectedServiceDetails.name}
                      className="w-full h-full object-cover transition-opacity duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Navigation Arrows (if multiple images) */}
                    {selectedServiceDetails.images && selectedServiceDetails.images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            const images = selectedServiceDetails.images
                            if (images) {
                              setSelectedImageIndex((prev) => 
                                prev === 0 ? images.length - 1 : prev - 1
                              )
                            }
                          }}
                          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ArrowRight className="w-5 h-5 rotate-180" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            const images = selectedServiceDetails.images
                            if (images) {
                              setSelectedImageIndex((prev) => 
                                prev === images.length - 1 ? 0 : prev + 1
                              )
                            }
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ArrowRight className="w-5 h-5" />
                        </button>
                        
                        {/* Image Counter */}
                        <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur text-white text-xs">
                          {selectedImageIndex + 1} / {selectedServiceDetails.images.length}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Thumbnail Gallery (if multiple images) */}
                  {selectedServiceDetails.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-thumb]:bg-[#B23092]/50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-[#B23092]"
                      style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#B2309280 transparent'
                      }}
                    >
                      {selectedServiceDetails.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            selectedImageIndex === index
                              ? 'border-[#B23092] ring-2 ring-[#B23092]/50'
                              : 'border-transparent hover:border-white/30'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${selectedServiceDetails.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              <div>
                <h4 className="text-lg font-urbanist font-semibold text-white mb-2">Description</h4>
                <p className="text-white/80 font-urbanist">{selectedServiceDetails.description}</p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                {selectedServiceDetails.duration && (
                  <div className="flex items-center gap-2 text-white/80">
                    <Clock className="w-4 h-4 text-[#B23092]" />
                    <span className="font-urbanist text-sm">{selectedServiceDetails.duration}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-white/80">
                  <Star className="w-4 h-4 text-[#B23092]" />
                  <span className="font-urbanist text-sm">Rating: 4.5</span>
                </div>
              </div>

              {/* Price */}
              <div className="pt-4 border-t border-white/20">
                <div className="flex items-center justify-between">
                  <span className="text-white/80 font-urbanist">Price:</span>
                  <span className="text-2xl font-annie-telescope font-bold text-[#B23092]">
                    {formatPrice(selectedServiceDetails.price, selectedServiceDetails.priceUnit)}
                  </span>
                </div>
              </div>

              {/* Features */}
              {selectedServiceDetails.features && selectedServiceDetails.features.length > 0 && (
                <div>
                  <h4 className="text-lg font-urbanist font-semibold text-white mb-3">Features</h4>
                  <div className="space-y-2">
                    {selectedServiceDetails.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-white/80">
                        <CheckCircle className="w-4 h-4 text-[#B23092] flex-shrink-0" />
                        <span className="font-urbanist text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-white/20 flex gap-3">
                {selectedServices.find(s => s._id === selectedServiceDetails._id) ? (
                  <div className="flex-1 flex items-center justify-center gap-3 bg-white/10 rounded-xl p-3">
                    <button
                      onClick={() => removeService(selectedServiceDetails._id)}
                      className="w-8 h-8 rounded-full bg-[#B23092]/20 text-[#B23092] flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="text-white font-urbanist text-lg min-w-[2rem] text-center">
                      {selectedServices.find(s => s._id === selectedServiceDetails._id)?.quantity || 0}
                    </span>
                    <button
                      onClick={() => addService(selectedServiceDetails)}
                      className="w-8 h-8 rounded-full bg-[#B23092]/20 text-[#B23092] flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      addService(selectedServiceDetails)
                      setShowServiceModal(false)
                    }}
                    className="flex-1 bg-[#B23092] hover:bg-[#9a2578] text-white px-6 py-3 rounded-xl font-urbanist font-semibold transition-colors"
                  >
                    Enroll Now
                  </button>
                )}
                <button
                  onClick={() => setShowServiceModal(false)}
                  className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl font-urbanist font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default AdventurePage


