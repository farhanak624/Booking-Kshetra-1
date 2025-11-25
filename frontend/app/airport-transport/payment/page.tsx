'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Car,
  Plane,
  CreditCard,
  Shield,
  CheckCircle,
  ArrowLeft,
  Lock,
  Smartphone,
  Loader,
  Clock,
  Percent
} from 'lucide-react'
import Header from '../../../components/Header'
import { bookingAPI } from '../../../lib/api'
import { initiatePayment } from '../../../utils/razorpay'
import { validateCoupon } from '../../../lib/api/coupons'

interface BookingDetails {
  pickup: boolean
  drop: boolean
  pickupDetails?: {
    flightNumber?: string
    arrivalTime?: string
    terminal?: string
  }
  dropDetails?: {
    flightNumber?: string
    departureTime?: string
    terminal?: string
  }
  airportLocation: string
  totalAmount: number
}

interface PersonalInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  emergencyContact: {
    name: string
    phone: string
    relation: string
  }
}

function PaymentPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null)
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    emergencyContact: {
      name: '',
      phone: '',
      relation: ''
    }
  })
  const [loading, setLoading] = useState(false)

  // Coupon state
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponError, setCouponError] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [validatingCoupon, setValidatingCoupon] = useState(false)

  useEffect(() => {
    // Load booking details from localStorage
    const bookingData = localStorage.getItem('airportTransportBooking')
    if (bookingData) {
      const parsedData = JSON.parse(bookingData)
      console.log('Loaded booking data:', parsedData)
      setBookingDetails(parsedData)

      // Personal info will be filled by user on this page
    } else {
      // Redirect back if no booking data
      router.push('/airport-transport')
    }
  }, [router])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !bookingDetails) return

    setValidatingCoupon(true)
    setCouponError('')

    try {
      const response = await validateCoupon({
        code: couponCode.trim(),
        serviceType: 'airport',
        orderValue: bookingDetails.totalAmount,
        phoneNumber: personalInfo.phone
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
    if (!bookingDetails) return 0
    return bookingDetails.totalAmount - couponDiscount
  }

  const createTransportBooking = async () => {
    if (!bookingDetails) return null

    try {
      console.log('🚀 Creating transport booking...')

      // Create booking payload for transport service
      const TRANSPORT_DUMMY_ROOM_ID = '000000000000000000000000' // Valid MongoDB ObjectId format

      const bookingPayload = {
        roomId: TRANSPORT_DUMMY_ROOM_ID,
        checkIn: new Date().toISOString(),
        checkOut: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        primaryGuestInfo: {
          name: `${personalInfo.firstName} ${personalInfo.lastName}`,
          email: personalInfo.email,
          phone: personalInfo.phone,
          address: personalInfo.address,
          city: personalInfo.city,
          state: personalInfo.state,
          pincode: personalInfo.pincode,
          emergencyContact: {
            name: personalInfo.emergencyContact.name,
            phone: personalInfo.emergencyContact.phone,
            relationship: personalInfo.emergencyContact.relation
          }
        },
        guests: [{
          name: `${personalInfo.firstName} ${personalInfo.lastName}`,
          age: 25,
          gender: 'Other' as const
        }],
        includeFood: false,
        includeBreakfast: false,
        transport: {
          pickup: bookingDetails.pickup,
          drop: bookingDetails.drop,
          arrivalTime: bookingDetails.pickupDetails?.arrivalTime || '',
          departureTime: bookingDetails.dropDetails?.departureTime || '',
          airportFrom: bookingDetails.airportLocation === 'kochi' ? 'Kochi' : 'Trivandrum',
          ...(bookingDetails.pickupDetails?.terminal && { pickupTerminal: bookingDetails.pickupDetails.terminal }),
          ...(bookingDetails.dropDetails?.terminal && { dropTerminal: bookingDetails.dropDetails.terminal }),
          pickupFlightNumber: bookingDetails.pickupDetails?.flightNumber || '',
          dropFlightNumber: bookingDetails.dropDetails?.flightNumber || ''
        },
        selectedServices: [],
        specialRequests: `Airport Transfer Service - ${bookingDetails.pickup ? 'Pickup' : ''} ${bookingDetails.pickup && bookingDetails.drop ? '& ' : ''}${bookingDetails.drop ? 'Drop' : ''} - Airport: ${bookingDetails.airportLocation}`,
        totalAmount: bookingDetails.totalAmount,
        couponCode: appliedCoupon ? couponCode : undefined,
        paymentStatus: 'pending',
        bookingType: 'transport'
      }

      const response = await bookingAPI.createPublicBooking(bookingPayload)

      if (response.data?.success) {
        console.log('✅ Transport booking created successfully:', response.data.data)
        const bookingId = response.data.data.booking._id
        console.log('📋 Extracted booking ID:', bookingId)
        return bookingId
      } else {
        throw new Error(response.data?.message || 'Failed to create transport booking')
      }
    } catch (error) {
      console.error('Transport booking creation error:', error)
      throw error
    }
  }

  const handlePaymentSuccess = (paymentData: any) => {
    console.log('Payment successful:', paymentData)

    // Store final booking data
    const finalBookingData = {
      ...bookingDetails,
      personalInfo,
      paymentId: paymentData.razorpay_payment_id,
      orderId: paymentData.razorpay_order_id,
      bookingId: paymentData.bookingId,
      status: 'completed',
      bookingDate: new Date().toISOString()
    }

    localStorage.setItem('lastTransportBooking', JSON.stringify(finalBookingData))
    localStorage.removeItem('airportTransportBooking')

    // Redirect to success page
    router.push('/airport-transport/success')
  }

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error)
    alert('Payment failed: ' + (error.message || 'Unknown error'))
    setLoading(false)
  }

  const handlePayment = async () => {
    if (!bookingDetails) return

    // Validate personal info
    if (!personalInfo.firstName || !personalInfo.lastName || !personalInfo.email || !personalInfo.phone || !personalInfo.address || !personalInfo.city || !personalInfo.state || !personalInfo.pincode || !personalInfo.emergencyContact.name || !personalInfo.emergencyContact.phone || !personalInfo.emergencyContact.relation) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      console.log('🚀 Starting transport booking flow...')

      // Create booking first
      const createdBookingId = await createTransportBooking()

      console.log('✅ Transport booking created, now opening Razorpay...')

      // Immediately trigger payment after booking creation
      await initiatePayment({
        amount: getFinalAmount(),
        bookingId: createdBookingId,
        userDetails: {
          name: `${personalInfo.firstName} ${personalInfo.lastName}`,
          email: personalInfo.email,
          phone: personalInfo.phone,
        },
        onSuccess: handlePaymentSuccess,
        onError: handlePaymentError
      })

    } catch (error) {
      console.error('❌ Transport booking/Payment flow error:', error)
      alert('Failed to create transport booking: ' + (error as Error).message)
      setLoading(false)
    }
  }

  if (!bookingDetails) {
    return (
      <div className="min-h-screen bg-transparent">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-[100px] 2xl:px-[120px] py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B23092] mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />

      {/* Hero Section with Background Image */}
      <section className="relative min-h-screen overflow-hidden w-full">
        {/* Background Image */}
        <div className="absolute inset-0 w-full min-h-full">
          <img
            src="https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/airpotbg3.png"
            alt="Airport Transfer Booking"
            className="w-full h-full min-h-screen object-cover"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 min-h-screen flex flex-col py-12">
          <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-[100px] 2xl:px-[120px] w-full flex-1 flex flex-col justify-center py-12">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 font-annie-telescope uppercase tracking-wider">
                Smooth Transfers
              </h1>
              <h2 className="text-5xl md:text-6xl font-bold text-[#B23092] mb-6 font-water-brush">
                Seamless Booking
              </h2>
              <p className="text-white/90 text-lg md:text-xl font-urbanist max-w-2xl mx-auto">
                Choose your location, time, and vehicle — we'll handle the rest with care and precision.
              </p>
            </motion.div>

            {/* Payment Details Section */}
            <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-[100px] 2xl:px-[120px] max-w-7xl">
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

                  <form onSubmit={(e) => { e.preventDefault(); handlePayment(); }} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* First Name */}
                      <div>
                        <label className="block text-white mb-2 font-urbanist">
                          First Name <span className="text-[#B23092]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={personalInfo.firstName}
                          onChange={(e) => setPersonalInfo(prev => ({ ...prev, firstName: e.target.value }))}
                          className="w-full px-4 py-3 bg-white/10 border border-[#B23092]/30 rounded-lg text-white placeholder-white/50 focus:border-[#B23092] focus:outline-none font-urbanist"
                          placeholder="Enter first name"
                        />
                      </div>

                      {/* Last Name */}
                      <div>
                        <label className="block text-white mb-2 font-urbanist">
                          Last Name <span className="text-[#B23092]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={personalInfo.lastName}
                          onChange={(e) => setPersonalInfo(prev => ({ ...prev, lastName: e.target.value }))}
                          className="w-full px-4 py-3 bg-white/10 border border-[#B23092]/30 rounded-lg text-white placeholder-white/50 focus:border-[#B23092] focus:outline-none font-urbanist"
                          placeholder="Enter last name"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-white mb-2 font-urbanist">
                        Email Address <span className="text-[#B23092]">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={personalInfo.email}
                        onChange={(e) => setPersonalInfo(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-[#B23092]/30 rounded-lg text-white placeholder-white/50 focus:border-[#B23092] focus:outline-none font-urbanist"
                        placeholder="your.email@example.com"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-white mb-2 font-urbanist">
                        Phone Number <span className="text-[#B23092]">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={personalInfo.phone}
                        onChange={(e) => setPersonalInfo(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/10 border border-[#B23092]/30 rounded-lg text-white placeholder-white/50 focus:border-[#B23092] focus:outline-none font-urbanist"
                        placeholder="+91 9876543210"
                      />
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-white mb-2 font-urbanist">
                        Address <span className="text-[#B23092]">*</span>
                      </label>
                      <textarea
                        required
                        value={personalInfo.address}
                        onChange={(e) => setPersonalInfo(prev => ({ ...prev, address: e.target.value }))}
                        rows={2}
                        className="w-full px-4 py-3 bg-white/10 border border-[#B23092]/30 rounded-lg text-white placeholder-white/50 focus:border-[#B23092] focus:outline-none font-urbanist"
                        placeholder="Enter your full address"
                      />
                    </div>

                    {/* City, State, PIN */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-white mb-2 font-urbanist">
                          City <span className="text-[#B23092]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={personalInfo.city}
                          onChange={(e) => setPersonalInfo(prev => ({ ...prev, city: e.target.value }))}
                          className="w-full px-4 py-3 bg-white/10 border border-[#B23092]/30 rounded-lg text-white placeholder-white/50 focus:border-[#B23092] focus:outline-none font-urbanist"
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="block text-white mb-2 font-urbanist">
                          State <span className="text-[#B23092]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={personalInfo.state}
                          onChange={(e) => setPersonalInfo(prev => ({ ...prev, state: e.target.value }))}
                          className="w-full px-4 py-3 bg-white/10 border border-[#B23092]/30 rounded-lg text-white placeholder-white/50 focus:border-[#B23092] focus:outline-none font-urbanist"
                          placeholder="State"
                        />
                      </div>
                      <div>
                        <label className="block text-white mb-2 font-urbanist">
                          PIN Code <span className="text-[#B23092]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={personalInfo.pincode}
                          onChange={(e) => setPersonalInfo(prev => ({ ...prev, pincode: e.target.value }))}
                          className="w-full px-4 py-3 bg-white/10 border border-[#B23092]/30 rounded-lg text-white placeholder-white/50 focus:border-[#B23092] focus:outline-none font-urbanist"
                          placeholder="123456"
                        />
                      </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="border-t border-white/20 pt-6">
                      <h4 className="text-sm font-semibold text-white mb-4 font-annie-telescope">Emergency Contact</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <input
                            type="text"
                            required
                            value={personalInfo.emergencyContact.name}
                            onChange={(e) => setPersonalInfo(prev => ({
                              ...prev,
                              emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                            }))}
                            className="w-full px-4 py-3 bg-white/10 border border-[#B23092]/30 rounded-lg text-white placeholder-white/50 focus:border-[#B23092] focus:outline-none font-urbanist"
                            placeholder="Contact name"
                          />
                        </div>
                        <div>
                          <input
                            type="tel"
                            required
                            value={personalInfo.emergencyContact.phone}
                            onChange={(e) => setPersonalInfo(prev => ({
                              ...prev,
                              emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                            }))}
                            className="w-full px-4 py-3 bg-white/10 border border-[#B23092]/30 rounded-lg text-white placeholder-white/50 focus:border-[#B23092] focus:outline-none font-urbanist"
                            placeholder="Contact phone"
                          />
                        </div>
                        <div>
                          <select
                            required
                            value={personalInfo.emergencyContact.relation}
                            onChange={(e) => setPersonalInfo(prev => ({
                              ...prev,
                              emergencyContact: { ...prev.emergencyContact, relation: e.target.value }
                            }))}
                            className="w-full px-4 py-3 bg-white/10 border border-[#B23092]/30 rounded-lg text-white focus:border-[#B23092] focus:outline-none font-urbanist appearance-none"
                          >
                            <option className="bg-black text-white" value="" disabled>Relationship</option>
                            <option className="bg-black text-white" value="spouse">Spouse</option>
                            <option className="bg-black text-white" value="parent">Parent</option>
                            <option className="bg-black text-white" value="sibling">Sibling</option>
                            <option className="bg-black text-white" value="friend">Friend</option>
                            <option className="bg-black text-white" value="relative">Relative</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#B23092] text-white py-4 rounded-full font-bold text-lg hover:bg-[#B23092]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-urbanist"
                    >
                      {loading ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Processing Payment...
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5" />
                          Proceed to Payment
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>

                {/* Right Panel - Booking Summary */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20"
                >
                  <h3 className="text-2xl font-bold text-white mb-2 font-annie-telescope">
                    Your Selection
                  </h3>

                  <div className="space-y-6 mt-8">
                    {/* Service Icon */}
                    <div className="flex items-center justify-center w-20 h-20 bg-[#B23092] rounded-2xl mx-auto">
                      <Car className="w-10 h-10 text-white" />
                    </div>

                    {/* Airport Details */}
                    <div className="bg-white/5 rounded-2xl p-6 space-y-4 border border-white/10">
                      <div className="text-center mb-4">
                        <h4 className="text-xl font-semibold text-white font-annie-telescope">Airport Transfer Service</h4>
                        <p className="text-white/70 text-sm mt-2 font-urbanist">Professional airport transfer service</p>
                      </div>

                      <div className="flex items-center gap-3 justify-center">
                        <Plane className="w-5 h-5 text-[#B23092]" />
                        <div className="text-center">
                          <p className="text-white font-medium font-urbanist">
                            {bookingDetails.airportLocation === 'kochi' ? 'Kochi Airport (COK)' : 'Trivandrum Airport (TRV)'}
                          </p>
                          <p className="text-white/70 text-sm font-urbanist">
                            {bookingDetails.airportLocation === 'kochi'
                              ? 'Cochin International Airport'
                              : 'Thiruvananthapuram International Airport'
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Services Selected */}
                    <div className="space-y-4">
                      {bookingDetails.pickup && (
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-2 h-2 bg-[#B23092] rounded-full"></div>
                            <h5 className="font-semibold text-[#B23092] font-annie-telescope">Airport Pickup Service</h5>
                          </div>
                          <div className="space-y-2 text-sm ml-5 font-urbanist">
                            {bookingDetails.pickupDetails?.flightNumber && (
                              <p className="text-white/80">Flight: {bookingDetails.pickupDetails.flightNumber}</p>
                            )}
                            {bookingDetails.pickupDetails?.arrivalTime && (
                              <p className="text-white/80">Arrival: {formatDateTime(bookingDetails.pickupDetails.arrivalTime)}</p>
                            )}
                            {bookingDetails.pickupDetails?.terminal && (
                              <p className="text-white/80">Terminal: {bookingDetails.pickupDetails.terminal}</p>
                            )}
                            <p className="text-[#B23092] font-medium">₹1,500</p>
                          </div>
                        </div>
                      )}

                      {bookingDetails.drop && (
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-2 h-2 bg-[#B23092] rounded-full"></div>
                            <h5 className="font-semibold text-[#B23092] font-annie-telescope">Airport Drop Service</h5>
                          </div>
                          <div className="space-y-2 text-sm ml-5 font-urbanist">
                            {bookingDetails.dropDetails?.flightNumber && (
                              <p className="text-white/80">Flight: {bookingDetails.dropDetails.flightNumber}</p>
                            )}
                            {bookingDetails.dropDetails?.departureTime && (
                              <p className="text-white/80">Departure: {formatDateTime(bookingDetails.dropDetails.departureTime)}</p>
                            )}
                            {bookingDetails.dropDetails?.terminal && (
                              <p className="text-white/80">Terminal: {bookingDetails.dropDetails.terminal}</p>
                            )}
                            <p className="text-[#B23092] font-medium">₹1,500</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Coupon Section */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <h4 className="text-white font-semibold mb-4 flex items-center gap-2 font-annie-telescope">
                        <Percent className="w-5 h-5 text-[#B23092]" />
                        Have a Coupon Code?
                      </h4>

                      {!appliedCoupon ? (
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                              placeholder="Enter coupon code"
                              className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:border-[#B23092] focus:outline-none font-urbanist"
                            />
                            <button
                              type="button"
                              onClick={handleApplyCoupon}
                              disabled={!couponCode.trim() || validatingCoupon}
                              className="px-4 py-2 bg-[#B23092] text-white rounded-lg hover:bg-[#B23092]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-urbanist"
                            >
                              {validatingCoupon ? (
                                <Loader className="w-4 h-4 animate-spin" />
                              ) : (
                                'Apply'
                              )}
                            </button>
                          </div>
                          {couponError && (
                            <p className="text-red-400 text-sm font-urbanist">{couponError}</p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-green-400/30">
                            <div>
                              <p className="text-green-400 font-medium font-urbanist">{appliedCoupon.code}</p>
                              <p className="text-green-300 text-sm font-urbanist">{appliedCoupon.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-green-400 font-bold font-urbanist">-{formatCurrency(couponDiscount)}</p>
                              <button
                                type="button"
                                onClick={handleRemoveCoupon}
                                className="text-red-400 text-sm hover:text-red-300 font-urbanist"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Total Amount */}
                    <div className="bg-white/5 rounded-2xl p-6 text-center border border-white/10">
                      {appliedCoupon && (
                        <div className="mb-4 pb-4 border-b border-white/20">
                          <div className="flex justify-between text-white/80 text-sm mb-2 font-urbanist">
                            <span>Subtotal</span>
                            <span>{formatCurrency(bookingDetails.totalAmount)}</span>
                          </div>
                          <div className="flex justify-between text-green-400 text-sm font-urbanist">
                            <span>Coupon Discount</span>
                            <span>-{formatCurrency(couponDiscount)}</span>
                          </div>
                        </div>
                      )}
                      <p className="text-white/70 text-sm mb-2 font-urbanist">
                        {appliedCoupon ? 'Final Amount' : 'Total Amount'}
                      </p>
                      <p className="text-[#B23092] font-bold text-4xl font-annie-telescope">{formatCurrency(getFinalAmount())}</p>
                      {appliedCoupon && (
                        <p className="text-green-400 text-sm mt-2 font-urbanist">
                          You saved {formatCurrency(couponDiscount)}!
                        </p>
                      )}
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

export default function PaymentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentPageContent />
    </Suspense>
  );
}
