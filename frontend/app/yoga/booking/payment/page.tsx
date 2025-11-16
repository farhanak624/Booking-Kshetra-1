'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  CreditCard,
  Lock,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCircle,
  Shield,
  Smartphone,
  Loader,
  Activity,
  Heart,
  BookOpen,
  Percent,
  MapPin,
  Building
} from 'lucide-react'
import Header from '../../../../components/Header'
import { bookingAPI } from '../../../../lib/api'
import { initiatePayment } from '../../../../utils/razorpay'
import { validateCoupon } from '../../../../lib/api/coupons'

// Types for our simplified booking
type SessionData = {
  id: string
  name: string
  type: 'program' | 'daily_regular' | 'daily_therapy'
  price: number
  duration: string
  description: string
  schedule?: string
  instructor?: string
  startDate?: string
  endDate?: string
}

type FormData = {
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  experience: 'beginner' | 'intermediate' | 'advanced'
}

type BookingData = {
  session: SessionData
  user: FormData
  timestamp: string
}


export default function YogaBookingPaymentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    experience: 'beginner'
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})

  // Coupon state
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponError, setCouponError] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [validatingCoupon, setValidatingCoupon] = useState(false)

  useEffect(() => {
    // Get booking data from localStorage
    const storedData = localStorage.getItem('yogaBookingData')
    if (!storedData) {
      router.push('/yoga')
      return
    }

    try {
      const data: BookingData = JSON.parse(storedData)
      setSessionData(data.session)
      // Pre-fill form if user data exists
      if (data.user) {
        setFormData(data.user)
      }
    } catch (error) {
      console.error('Error parsing booking data:', error)
      router.push('/yoga')
    }
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required'
    else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) newErrors.phone = 'Phone number is invalid'
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.state.trim()) newErrors.state = 'State is required'
    if (!formData.pincode.trim()) newErrors.pincode = 'PIN code is required'
    else if (!/^\d{6}$/.test(formData.pincode.trim())) newErrors.pincode = 'PIN code must be exactly 6 digits'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !sessionData) return

    setValidatingCoupon(true)
    setCouponError('')

    try {
      const response = await validateCoupon({
        code: couponCode.trim(),
        serviceType: 'yoga',
        orderValue: sessionData.price,
        phoneNumber: formData.phone
      })

      if ((response.data as any)?.success && (response.data as any)?.data) {
        setAppliedCoupon((response.data as any)?.data?.coupon)
        setCouponDiscount((response.data as any)?.data?.discount)
        setCouponError('')
      }
    } catch (error: any) {
      setCouponError(error.response?.data?.message || error.message || 'Invalid coupon code')
      setAppliedCoupon(null)
      setCouponDiscount(0)
    } finally {
      setValidatingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setCouponCode('')
    setAppliedCoupon(null)
    setCouponDiscount(0)
    setCouponError('')
  }

  const getFinalAmount = () => {
    if (!sessionData) return 0
    return sessionData.price - couponDiscount
  }

  const createYogaBooking = async () => {
    if (!sessionData) return null

    try {
      console.log('🚀 Creating yoga booking...')

      // Create booking payload that passes backend validation
      // Use a dummy room ID for yoga bookings to satisfy validation
      const YOGA_DUMMY_ROOM_ID = '000000000000000000000000' // Valid MongoDB ObjectId format

      const bookingPayload = {
        // Use dummy room ID to pass validation (backend should handle this as special case)
        roomId: YOGA_DUMMY_ROOM_ID,
        checkIn: new Date().toISOString(),
        checkOut: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        primaryGuestInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          emergencyContact: {
            name: '',
            phone: '',
            relationship: ''
          }
        },
        guests: [{
          name: formData.name,
          age: 25,
          gender: 'Other' as const
          // Skip ID fields for yoga bookings - not needed
        }],
        includeFood: false,
        includeBreakfast: false,
        transport: {
          pickup: false,
          drop: false,
          // Remove flightNumber field entirely to avoid validation error
          arrivalTime: '',
          departureTime: '',
          airportFrom: 'Kochi'
        },
        selectedServices: [],
        specialRequests: `Yoga Session: ${sessionData.name} - ${sessionData.description} - Experience Level: ${formData.experience}`,
        totalAmount: sessionData.price,
        couponCode: appliedCoupon ? couponCode : undefined,
        paymentStatus: 'pending',
        // Add yoga-specific data
        yogaSessionId: sessionData.id,
        bookingType: 'yoga'
      }

      const response = await bookingAPI.createPublicBooking(bookingPayload)

      if (response.data?.success) {
        console.log('✅ Yoga booking created successfully:', response.data.data)
        const bookingId = response.data.data.booking._id
        console.log('📋 Extracted booking ID:', bookingId)
        return bookingId
      } else {
        throw new Error(response.data?.message || 'Failed to create yoga booking')
      }
    } catch (error) {
      console.error('Yoga booking creation error:', error)
      throw error
    }
  }

  const handlePaymentSuccess = (paymentData: any) => {
    console.log('Payment successful:', paymentData)

    // Clear localStorage
    localStorage.removeItem('yogaBookingData')

    // Redirect to success page with proper parameters
    router.push(`/yoga/booking/success?payment_id=${paymentData.razorpay_payment_id}&order_id=${paymentData.razorpay_order_id}&booking_id=${paymentData.bookingId}`)
  }

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error)
    alert('Payment failed: ' + (error.message || 'Unknown error'))
    setLoading(false)
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form first
    if (!validateForm()) {
      return
    }

    if (!sessionData) return

    setLoading(true)

    try {
      // Update localStorage with form data
      const bookingData = {
        session: sessionData,
        user: formData,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem('yogaBookingData', JSON.stringify(bookingData))

      console.log('🚀 Starting yoga booking flow...')

      // Create booking first
      const createdBookingId = await createYogaBooking()

      console.log('✅ Yoga booking created, now opening Razorpay...')

      // Immediately trigger payment after booking creation using the proper utils
      await initiatePayment({
        amount: getFinalAmount(),
        bookingId: createdBookingId,
        userDetails: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        },
        onSuccess: handlePaymentSuccess,
        onError: handlePaymentError
      })

    } catch (error) {
      console.error('❌ Yoga booking/Payment flow error:', error)
      alert('Failed to create yoga booking: ' + (error as Error).message)
      setLoading(false)
    }
  }

  if (!sessionData) {
    return (
      <div className="min-h-screen bg-transparent">
        <Header />
        <div className="container mx-auto px-4 md:px-[100px] py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section with Background Image */}
      <section className="relative min-h-screen overflow-hidden w-full">
        {/* Background Image */}
        <div className="absolute inset-0 w-full min-h-full">
          <img
            src="https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/yoga.png?updatedAt=1762969684085"
            alt="Yoga Booking"
            className="w-full h-full min-h-screen object-cover"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex flex-col py-12">
          <div className="container mx-auto px-4 md:px-[100px] w-full flex-1 flex flex-col justify-center py-12">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 font-annie-telescope">
                READY TO STRETCH,
              </h1>
              <h2 className="text-5xl md:text-6xl font-bold text-[#B23092] mb-4 font-water-brush">
                Breathe & Feel Better?
              </h2>
              <p className="text-white/90 text-lg font-urbanist max-w-2xl mx-auto mb-0">
                Reserve your spot and begin your path to balance, peace, and inner strength.
              </p>
            </motion.div>

            {/* Payment Details Section */}
            <div className="container mx-auto px-4 md:px-[100px] max-w-7xl">
              <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Panel - Booking Details Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20"
            >
              <h3 className="text-2xl font-bold text-white mb-2 font-annie-telescope">
                Booking Details
              </h3>
              <p className="text-white/70 mb-8 font-urbanist">
                Complete your information to proceed
              </p>

              <form onSubmit={handlePayment} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Column 1 */}
                  <div className="space-y-6">
                    {/* Full Name */}
                    <div>
                      <label className="block text-white mb-2 font-urbanist">
                        Full Name <span className="text-[#B23092]">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 border border-[#B23092]/30 rounded-lg text-white placeholder-white/50 focus:border-[#B23092] focus:outline-none font-urbanist"
                        placeholder="Enter your full name"
                      />
                      {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-white mb-2 font-urbanist">
                        Phone Number <span className="text-[#B23092]">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 border border-[#B23092]/30 rounded-lg text-white placeholder-white/50 focus:border-[#B23092] focus:outline-none font-urbanist"
                        placeholder="Enter your phone number"
                      />
                      {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-white mb-2 font-urbanist">
                        City <span className="text-[#B23092]">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 border border-[#B23092]/30 rounded-lg text-white placeholder-white/50 focus:border-[#B23092] focus:outline-none font-urbanist"
                        placeholder="Enter your city"
                      />
                      {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
                    </div>

                    {/* PIN Code */}
                    <div>
                      <label className="block text-white mb-2 font-urbanist">
                        PIN Code <span className="text-[#B23092]">*</span>
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        maxLength={6}
                        className="w-full px-4 py-3 bg-white/10 border border-[#B23092]/30 rounded-lg text-white placeholder-white/50 focus:border-[#B23092] focus:outline-none font-urbanist"
                        placeholder="Enter PIN code"
                      />
                      {errors.pincode && <p className="text-red-400 text-sm mt-1">{errors.pincode}</p>}
                    </div>
                  </div>

                  {/* Column 2 */}
                  <div className="space-y-6">
                    {/* Email Address */}
                    <div>
                      <label className="block text-white mb-2 font-urbanist">
                        Email Address <span className="text-[#B23092]">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 border border-[#B23092]/30 rounded-lg text-white placeholder-white/50 focus:border-[#B23092] focus:outline-none font-urbanist"
                        placeholder="Enter your email"
                      />
                      {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-white mb-2 font-urbanist">
                        Address <span className="text-[#B23092]">*</span>
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 border border-[#B23092]/30 rounded-lg text-white placeholder-white/50 focus:border-[#B23092] focus:outline-none font-urbanist"
                        placeholder="Enter your address"
                      />
                      {errors.address && <p className="text-red-400 text-sm mt-1">{errors.address}</p>}
                    </div>

                    {/* State */}
                    <div>
                      <label className="block text-white mb-2 font-urbanist">
                        State <span className="text-[#B23092]">*</span>
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 border border-[#B23092]/30 rounded-lg text-white placeholder-white/50 focus:border-[#B23092] focus:outline-none font-urbanist"
                        placeholder="Enter your state"
                      />
                      {errors.state && <p className="text-red-400 text-sm mt-1">{errors.state}</p>}
                    </div>

                    {/* Yoga Experience */}
                    <div>
                      <label className="block text-white mb-2 font-urbanist">
                        Yoga Experience
                      </label>
                      <select
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 border border-[#B23092]/30 rounded-lg text-white focus:border-[#B23092] focus:outline-none font-urbanist appearance-none cursor-pointer"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23B23092' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', paddingRight: '2.5rem' }}
                      >
                        <option value="beginner" className="bg-black">Beginner</option>
                        <option value="intermediate" className="bg-black">Intermediate</option>
                        <option value="advanced" className="bg-black">Advanced</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Proceed to Payment Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#B23092] text-white py-4 rounded-full font-bold text-lg hover:bg-[#B23092]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-urbanist"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Proceed to Payment'
                  )}
                </button>
              </form>
            </motion.div>

            {/* Right Panel - Your Selection */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20"
            >
              <h3 className="text-2xl font-bold text-white mb-8 font-annie-telescope">
                Your Selection
              </h3>

              <div className="space-y-6">
                {/* Course Image and Title */}
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-800">
                    <img
                      src={sessionData.type === 'program' 
                        ? 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
                        : 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
                      }
                      alt={sessionData.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-white font-annie-telescope">
                      {sessionData.name}
                    </h4>
                  </div>
                </div>

                {/* Course Details - Three Columns */}
                <div className="grid grid-cols-3 gap-4 py-4 border-y border-white/10">
                  <div>
                    <p className="text-white/60 text-sm mb-1 font-urbanist">Duration</p>
                    <p className="text-white font-semibold font-urbanist">
                      {sessionData.duration.includes('days') 
                        ? sessionData.duration.split(' ')[0] + ' days'
                        : sessionData.duration
                      }
                    </p>
                  </div>
                  {sessionData.startDate && sessionData.endDate ? (
                    <div>
                      <p className="text-white/60 text-sm mb-1 font-urbanist">Program Dates</p>
                      <p className="text-white font-semibold text-xs font-urbanist leading-tight">
                        {formatDate(sessionData.startDate)} - {formatDate(sessionData.endDate)}
                      </p>
                    </div>
                  ) : sessionData.schedule ? (
                    <div>
                      <p className="text-white/60 text-sm mb-1 font-urbanist">Schedule</p>
                      <p className="text-white font-semibold text-xs font-urbanist">
                        {sessionData.schedule}
                      </p>
                    </div>
                  ) : (
                    <div></div>
                  )}
                  {sessionData.instructor ? (
                    <div>
                      <p className="text-white/60 text-sm mb-1 font-urbanist">Instructor</p>
                      <p className="text-white font-semibold text-sm font-urbanist">
                        {sessionData.instructor}
                      </p>
                    </div>
                  ) : (
                    <div></div>
                  )}
                </div>

                {/* Course Description */}
                <div>
                  <p className="text-white/80 text-sm leading-relaxed font-urbanist">
                    {sessionData.description}
                  </p>
                </div>

                {/* Coupon Section */}
                {!appliedCoupon ? (
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Have a coupon code?"
                        className="flex-1 px-4 py-2 bg-white/10 border border-[#B23092]/30 rounded-lg text-white placeholder-white/50 focus:border-[#B23092] focus:outline-none font-urbanist text-sm"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={!couponCode.trim() || validatingCoupon}
                        className="px-4 py-2 bg-[#B23092] text-white rounded-lg hover:bg-[#B23092]/90 disabled:opacity-50 disabled:cursor-not-allowed font-urbanist text-sm"
                      >
                        {validatingCoupon ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          'Apply'
                        )}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-red-400 text-sm mt-2">{couponError}</p>
                    )}
                  </div>
                ) : (
                  <div className="bg-white/5 rounded-xl p-4 border border-green-400/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-400 font-medium text-sm">{appliedCoupon.code}</p>
                        <p className="text-green-300 text-xs">{appliedCoupon.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-red-400 text-xs hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}

                {/* Total Amount */}
                <div className="pt-6 border-t border-white/10">
                  <div className="mb-3">
                    <p className="text-white/60 text-sm mb-2 font-urbanist">
                      {appliedCoupon ? 'Final Amount' : 'Total Amount'}
                    </p>
                    {appliedCoupon && (
                      <div className="mb-2 space-y-1">
                        <div className="flex justify-between text-white/60 text-sm font-urbanist">
                          <span>Subtotal</span>
                          <span className="line-through">{formatCurrency(sessionData.price)}</span>
                        </div>
                        <div className="flex justify-between text-green-400 text-sm font-urbanist">
                          <span>Coupon Discount</span>
                          <span>-{formatCurrency(couponDiscount)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-[#B23092] font-bold text-4xl font-annie-telescope">
                    {formatCurrency(getFinalAmount())}
                  </p>
                </div>
              </div>
            </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

    
    </div>
  )
}