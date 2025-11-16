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
  Car,
  Plane,
  Waves,
  Percent
} from 'lucide-react'
import Header from '../../../../components/Header'
import { bookingAPI } from '../../../../lib/api'
import { initiatePayment } from '../../../../utils/razorpay'
import { validateCoupon } from '../../../../lib/api/coupons'

// Types for services booking
interface Service {
  _id: string
  name: string
  category: 'vehicle_rental' | 'surfing' | 'adventure' | 'diving' | 'trekking'
  price: number
  priceUnit: string
  description: string
  duration?: string
  features: string[]
  maxQuantity?: number
  isActive: boolean
}

interface SelectedService extends Service {
  quantity: number
}

interface FormData {
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  specialRequests: string
}

interface CompleteBookingData {
  services: SelectedService[]
  date: string
  totalAmount: number
  user: FormData
  timestamp: string
}


export default function ServicesBookingPaymentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [bookingData, setBookingData] = useState<CompleteBookingData | null>(null)
  const [paymentMethods] = useState([
    { id: 'razorpay', name: 'Razorpay', icon: CreditCard, description: 'Credit/Debit Cards, UPI, Net Banking, Wallets' }
  ])

  // Coupon state
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponError, setCouponError] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [validatingCoupon, setValidatingCoupon] = useState(false)

  useEffect(() => {
    // Get complete booking data from localStorage
    const storedData = localStorage.getItem('servicesCompleteBookingData')
    if (!storedData) {
      router.push('/services')
      return
    }

    try {
      const data: CompleteBookingData = JSON.parse(storedData)
      setBookingData(data)
    } catch (error) {
      console.error('Error parsing booking data:', error)
      router.push('/services')
    }
  }, [router])

  const getServiceIcon = (category: 'vehicle_rental' | 'surfing' | 'adventure' | 'diving' | 'trekking') => {
    switch (category) {
      case 'vehicle_rental':
        return Car
      case 'surfing':
        return Waves
      case 'diving':
        return Waves
      case 'trekking':
        return Activity
      case 'adventure':
        return Activity
      default:
        return Activity
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const getServiceType = (): 'rental' | 'adventure' => {
    if (!bookingData) return 'adventure'
    return bookingData.services.some(s => s.category === 'vehicle_rental') ? 'rental' : 'adventure'
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !bookingData) return

    setValidatingCoupon(true)
    setCouponError('')

    try {
      const response = await validateCoupon({
        code: couponCode.trim(),
        serviceType: getServiceType(),
        orderValue: bookingData.totalAmount,
        phoneNumber: bookingData.user.phone
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
    if (!bookingData) return 0
    return bookingData.totalAmount - couponDiscount
  }

  const createServicesBooking = async () => {
    if (!bookingData) return null

    try {
      console.log('🚀 Creating services booking...')

      // Create booking payload
      const bookingPayload = {
        roomId: '000000000000000000000000', // Dummy room ID for services
        checkIn: new Date(bookingData.date).toISOString(),
        checkOut: new Date(new Date(bookingData.date).getTime() + 24 * 60 * 60 * 1000).toISOString(),
        primaryGuestInfo: {
          name: bookingData.user.name,
          email: bookingData.user.email,
          phone: bookingData.user.phone,
          address: bookingData.user.address,
          city: bookingData.user.city,
          state: bookingData.user.state,
          pincode: bookingData.user.pincode,
          emergencyContact: {
            name: '',
            phone: '',
            relationship: ''
          }
        },
        guests: [{
          name: bookingData.user.name,
          age: 25,
          gender: 'Other' as const
        }],
        includeFood: false,
        includeBreakfast: false,
        transport: {
          pickup: false,
          drop: false,
          arrivalTime: '',
          departureTime: '',
          airportFrom: 'Kochi'
        },
        selectedServices: bookingData.services.map(service => ({
          serviceId: service._id,
          quantity: service.quantity,
          totalPrice: service.price * service.quantity,
          details: service.description
        })),
        specialRequests: `Services: ${bookingData.services.map(s => s.name).join(', ')}. ${bookingData.user.specialRequests}`,
        totalAmount: bookingData.totalAmount,
        couponCode: appliedCoupon ? couponCode : undefined,
        paymentStatus: 'pending',
        bookingType: 'services'
      }

      const response = await bookingAPI.createPublicBooking(bookingPayload)

      if (response.data?.success) {
        console.log('✅ Services booking created successfully:', response.data.data)
        const bookingId = response.data.data.booking._id
        console.log('📋 Extracted booking ID:', bookingId)
        return bookingId
      } else {
        throw new Error(response.data?.message || 'Failed to create services booking')
      }
    } catch (error) {
      console.error('Services booking creation error:', error)
      throw error
    }
  }

  const handlePaymentSuccess = (paymentData: any) => {
    console.log('Payment successful:', paymentData)

    // Clear localStorage
    localStorage.removeItem('servicesBookingData')
    localStorage.removeItem('servicesCompleteBookingData')

    // Redirect to success page with proper parameters
    router.push(`/services/booking/success?payment_id=${paymentData.razorpay_payment_id}&order_id=${paymentData.razorpay_order_id}&booking_id=${paymentData.bookingId}`)
  }

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error)
    alert('Payment failed: ' + (error.message || 'Unknown error'))
    setLoading(false)
  }

  const handlePayment = async () => {
    if (!bookingData) return

    setLoading(true)

    try {
      console.log('🚀 Starting services booking flow...')

      // Create booking first
      const createdBookingId = await createServicesBooking()

      console.log('✅ Services booking created, now opening Razorpay...')

      // Immediately trigger payment after booking creation using the proper utils
      await initiatePayment({
        amount: getFinalAmount(),
        bookingId: createdBookingId,
        userDetails: {
          name: bookingData.user.name,
          email: bookingData.user.email,
          phone: bookingData.user.phone,
        },
        onSuccess: handlePaymentSuccess,
        onError: handlePaymentError
      })

    } catch (error) {
      console.error('❌ Services booking/Payment flow error:', error)
      alert('Failed to create services booking: ' + (error as Error).message)
      setLoading(false)
    }
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-blue-900">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-blue-900">
      <Header />

      <div className="container mx-auto px-4 md:px-[100px] py-8 max-w-6xl">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                ✓
              </div>
              <span className="text-sm font-medium text-green-400">Details</span>
            </div>
            <div className="w-16 h-px bg-green-400"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="text-sm font-medium text-orange-400">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Booking Summary */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-3xl p-8"
            >
              <h3 className="text-2xl font-bold text-white mb-8">Booking Summary</h3>

              <div className="space-y-6">
                {/* Service Date */}
                <div className="bg-white/10 rounded-2xl p-6 text-center">
                  <div className="flex items-center justify-center gap-2 text-orange-400 mb-2">
                    <Calendar className="w-5 h-5" />
                    <span className="font-medium">Service Date</span>
                  </div>
                  <div className="text-xl font-bold text-white">
                    {formatDate(bookingData.date)}
                  </div>
                </div>

                {/* Selected Services */}
                <div className="space-y-4">
                  {bookingData.services.map((service) => {
                    const ServiceIcon = getServiceIcon(service.category)
                    return (
                      <div key={service._id} className="bg-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="p-3 bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-xl">
                            <ServiceIcon className="w-6 h-6 text-orange-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-white">{service.name}</h4>
                            <p className="text-gray-300 text-sm">Quantity: {service.quantity}</p>
                          </div>
                          <div className="text-orange-400 font-bold">
                            {formatCurrency(service.price * service.quantity)}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Customer Details */}
                <div className="bg-white/10 rounded-2xl p-6">
                  <h4 className="font-semibold text-white mb-4">Your Details</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-orange-400" />
                      <span className="text-gray-300">{bookingData.user.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-orange-400" />
                      <span className="text-gray-300">{bookingData.user.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-orange-400" />
                      <span className="text-gray-300">{bookingData.user.phone}</span>
                    </div>
                    {bookingData.user.specialRequests && (
                      <div className="flex items-start gap-3 mt-4 pt-4 border-t border-white/20">
                        <Activity className="w-4 h-4 text-orange-400 mt-0.5" />
                        <div>
                          <div className="text-white font-medium mb-1">Special Requests</div>
                          <span className="text-gray-300 text-sm">{bookingData.user.specialRequests}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Coupon Section */}
                <div className="bg-white/10 rounded-2xl p-6">
                  <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Percent className="w-5 h-5 text-orange-400" />
                    Apply Coupon
                  </h4>

                  {!appliedCoupon ? (
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={!couponCode.trim() || validatingCoupon}
                        className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {validatingCoupon ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          'Apply'
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="bg-green-500/10 border border-green-400/30 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-green-400 font-medium">
                            <CheckCircle className="w-4 h-4" />
                            {appliedCoupon.code}
                          </div>
                          <p className="text-sm text-gray-300 mt-1">{appliedCoupon.description}</p>
                          <p className="text-sm text-green-400 mt-1">
                            Discount: {formatCurrency(couponDiscount)}
                          </p>
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}

                  {couponError && (
                    <p className="text-red-400 text-sm mt-2">{couponError}</p>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="bg-white/10 rounded-2xl p-6">
                  <h4 className="font-semibold text-white mb-4">Price Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-300">
                      <span>Subtotal</span>
                      <span>{formatCurrency(bookingData.totalAmount)}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-green-400">
                        <span>Coupon Discount</span>
                        <span>-{formatCurrency(couponDiscount)}</span>
                      </div>
                    )}
                    <div className="border-t border-white/20 pt-3">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold text-white">Total Amount</span>
                        <span className="text-lg font-bold text-orange-400">{formatCurrency(getFinalAmount())}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Payment Form */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-3xl p-8"
            >
              <div className="flex items-center gap-3 mb-8">
                <button
                  onClick={() => router.back()}
                  className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-white">Secure Payment</h1>
                  <p className="text-gray-300">Complete your services booking</p>
                </div>
              </div>

              <div className="space-y-8">
                {/* Payment Method */}
                <div>
                  <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-orange-400" />
                    Payment Method
                  </h2>

                  <div className="border border-orange-400/30 rounded-2xl p-6 bg-orange-500/10">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-orange-500/20 rounded-xl">
                        <CreditCard className="w-6 h-6 text-orange-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-white">Razorpay</h3>
                        <p className="text-sm text-gray-300">Cards, UPI, Net Banking, Wallets</p>
                      </div>
                      <div className="w-5 h-5 border-2 border-orange-400 rounded-full bg-orange-400 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Features */}
                <div className="bg-white/10 rounded-2xl p-6">
                  <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-400" />
                    Your Payment is Secure
                  </h3>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">SSL Encrypted</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">PCI DSS Compliant</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">Bank-grade Security</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">Trusted Platform</span>
                    </div>
                  </div>
                </div>

                {/* Payment Methods Icons */}
                <div>
                  <h3 className="font-medium text-white mb-4">Accepted Payment Methods</h3>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-white/10 p-3 rounded-xl text-center">
                      <CreditCard className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                      <span className="text-xs text-gray-400">Cards</span>
                    </div>
                    <div className="bg-white/10 p-3 rounded-xl text-center">
                      <Smartphone className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                      <span className="text-xs text-gray-400">UPI</span>
                    </div>
                    <div className="bg-white/10 p-3 rounded-xl text-center">
                      <span className="text-xs text-gray-400">Net Banking</span>
                    </div>
                    <div className="bg-white/10 p-3 rounded-xl text-center">
                      <span className="text-xs text-gray-400">Wallets</span>
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div className="text-xs text-gray-400 bg-white/5 p-4 rounded-xl">
                  <p className="mb-2">By proceeding with the payment, you agree to our:</p>
                  <ul className="space-y-1 text-gray-500">
                    <li>• Terms and Conditions</li>
                    <li>• Privacy Policy</li>
                    <li>• Cancellation and Refund Policy</li>
                  </ul>
                </div>

                {/* Payment Button */}
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-4 rounded-2xl font-bold text-lg hover:from-orange-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Pay {formatCurrency(getFinalAmount())}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}