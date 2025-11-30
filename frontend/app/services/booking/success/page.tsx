'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, Calendar, Phone, Mail, ArrowRight, Copy, Check, Car, Activity, Waves, Loader } from 'lucide-react'
import Header from '../../../../components/Header'
import { bookingAPI } from '../../../../lib/api'

function ServicesBookingSuccessPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [paymentId, setPaymentId] = useState('')
  const [orderId, setOrderId] = useState('')
  const [bookingId, setBookingId] = useState('')
  const [copiedField, setCopiedField] = useState('')
  const [bookingDetails, setBookingDetails] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const payment_id = searchParams.get('payment_id')
    const order_id = searchParams.get('order_id')
    const booking_id = searchParams.get('booking_id')

    console.log('Success page URL params:', { payment_id, order_id, booking_id })
    console.log('Full URL:', window.location.href)

    if (payment_id) setPaymentId(payment_id)
    if (order_id) setOrderId(order_id)
    if (booking_id) {
      setBookingId(booking_id)
      fetchBookingDetails(booking_id)
    }
  }, [searchParams])

  const fetchBookingDetails = async (id: string) => {
    try {
      setLoading(true)
      // Use public booking endpoint since this is a public booking (no auth required)
      const response = await bookingAPI.getPublicBookingById(id)
      console.log('Booking details:', response.data)
      if (response.data?.success) {
        setBookingDetails(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching booking details:', error)
    } finally {
      setLoading(false)
    }
  }

  const getServiceIcon = (category: string) => {
    switch (category) {
      case 'vehicle_rental':
        return Car
      case 'surfing':
      case 'diving':
        return Waves
      case 'adventure':
      case 'trekking':
        return Activity
      default:
        return Activity
    }
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

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(''), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />

      {/* Hero Section with Background Image */}
      <section className="relative min-h-[70vh] sm:min-h-[80vh] overflow-visible w-full">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src={'https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/Kshetra/rentbike.png'}
            alt={'Booking Success'}
            className="w-full h-full object-cover"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 min-h-[70vh] sm:min-h-[80vh] flex flex-col py-8">
          <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-[100px] 2xl:px-[120px] w-full flex-1 flex flex-col justify-center py-12">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="w-20 h-20 bg-[#B23092]/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#B23092]/50">
                <CheckCircle className="w-12 h-12 text-[#B23092]" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 font-annie-telescope uppercase tracking-wider">
                Booking Confirmed
              </h1>
              <h2 className="text-5xl md:text-6xl font-bold text-[#B23092] mb-6 font-water-brush">
                Success!
              </h2>
              <p className="text-white/90 text-lg md:text-xl font-urbanist max-w-2xl mx-auto">
                Your booking has been successfully confirmed. We'll contact you shortly with all the details.
              </p>
            </motion.div>
          </div>

          {/* Scroll Hint */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
            <div className="flex flex-col items-center gap-2">
              <p className="text-white/70 text-xs font-urbanist uppercase tracking-wider">Scroll for details</p>
              <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>

        {/* Booking Info Container - Starts from bottom of hero */}
        <div className="relative z-10 -mt-32 md:-mt-40">
          <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-[100px] 2xl:px-[120px] py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          {/* Success Icon */}
          <div className="w-24 h-24 bg-[#B23092] rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-[#B23092]/50">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>

          {/* Success Message */}
          <h1 className="text-4xl font-annie-telescope font-bold text-white mb-4">Booking Confirmed!</h1>
          <p className="text-xl font-urbanist text-gray-300 mb-8">
            Your services have been successfully booked. We'll contact you shortly with confirmation details.
          </p>

          {/* Booking Details */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-8 border border-white/20">
            <h2 className="text-2xl font-annie-telescope font-semibold text-white mb-6">Booking Details</h2>

            <div className="space-y-4 text-left">
              {(bookingId || searchParams.get('booking_id')) && (
                <div className="flex items-center justify-between p-4 bg-[#B23092]/20 rounded-xl border border-[#B23092]/30">
                  <div className="flex flex-col">
                    <span className="text-gray-300 text-sm font-urbanist">Booking ID:</span>
                    <span className="text-[#B23092] font-mono text-lg font-semibold">{bookingId || searchParams.get('booking_id')}</span>
                    <span className="text-gray-400 text-xs mt-1 font-urbanist">Use this ID to track your booking</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(bookingId || searchParams.get('booking_id') || '', 'booking')}
                    className="flex items-center gap-2 px-3 py-2 bg-[#B23092] hover:bg-[#9a2578] text-white rounded-lg transition-colors font-urbanist"
                  >
                    {copiedField === 'booking' ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span className="text-sm">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span className="text-sm">Copy</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {orderId && (
                <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl border border-white/10">
                  <span className="text-gray-300 font-urbanist">Order ID:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#B23092] font-mono text-sm">{orderId}</span>
                    <button
                      onClick={() => copyToClipboard(orderId, 'order')}
                      className="p-1 hover:bg-white/10 rounded"
                    >
                      {copiedField === 'order' ? (
                        <Check className="w-4 h-4 text-[#B23092]" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400 hover:text-[#B23092]" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {paymentId && (
                <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl border border-white/10">
                  <span className="text-gray-300 font-urbanist">Payment ID:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#B23092] font-mono text-sm">{paymentId}</span>
                    <button
                      onClick={() => copyToClipboard(paymentId, 'payment')}
                      className="p-1 hover:bg-white/10 rounded"
                    >
                      {copiedField === 'payment' ? (
                        <Check className="w-4 h-4 text-[#B23092]" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400 hover:text-[#B23092]" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl border border-white/10">
                <span className="text-gray-300 font-urbanist">Status:</span>
                <span className="text-[#B23092] font-semibold font-urbanist">Confirmed</span>
              </div>

              {bookingDetails && bookingDetails.checkIn && (
                <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl border border-white/10">
                  <span className="text-gray-300 font-urbanist">Service Date:</span>
                  <div className="flex items-center gap-2 text-[#B23092]">
                    <Calendar className="w-4 h-4" />
                    <span className="font-semibold font-urbanist">{formatDate(bookingDetails.checkIn)}</span>
                  </div>
                </div>
              )}

              {bookingDetails && bookingDetails.totalAmount && (
                <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl border border-white/10">
                  <span className="text-gray-300 font-urbanist">Total Amount:</span>
                  <span className="text-[#B23092] font-annie-telescope font-bold text-lg">{formatCurrency(bookingDetails.totalAmount)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Booked Services */}
          {loading ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-8 border border-white/20">
              <div className="flex items-center justify-center">
                <Loader className="w-8 h-8 animate-spin text-[#B23092]" />
                <span className="ml-3 text-white font-urbanist">Loading booking details...</span>
              </div>
            </div>
          ) : bookingDetails && bookingDetails.selectedServices && bookingDetails.selectedServices.length > 0 && (
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-8 border border-white/20">
              <h2 className="text-2xl font-annie-telescope font-semibold text-white mb-6">Your Booked Services</h2>
              <div className="space-y-4">
                {bookingDetails.selectedServices.map((service: any, index: number) => {
                  const ServiceIcon = getServiceIcon(service.serviceId?.category || 'adventure')
                  return (
                    <div key={index} className="bg-white/10 rounded-2xl p-6 border border-white/10">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-[#B23092]/20 rounded-xl">
                          <ServiceIcon className="w-6 h-6 text-[#B23092]" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-white font-urbanist">
                            {service.serviceId?.name || 'Service'}
                          </h4>
                          <p className="text-gray-300 text-sm font-urbanist">
                            Quantity: {service.quantity} | Category: {service.serviceId?.category || 'N/A'}
                          </p>
                          {service.serviceId?.description && (
                            <p className="text-gray-400 text-sm mt-1 font-urbanist">
                              {service.serviceId.description}
                            </p>
                          )}
                          {service.details && (
                            <p className="text-gray-400 text-sm mt-1 font-urbanist">
                              {service.details}
                            </p>
                          )}
                        </div>
                        <div className="text-[#B23092] font-annie-telescope font-bold text-lg">
                          {formatCurrency(service.totalPrice || 0)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-8 border border-white/20">
            <h3 className="text-xl font-annie-telescope font-semibold text-white mb-4">What happens next?</h3>
            <div className="space-y-3 text-gray-300 text-left">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#B23092] rounded-full"></div>
                <span className="font-urbanist">You'll receive a confirmation email within 5 minutes</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#B23092] rounded-full"></div>
                <span className="font-urbanist">Our team will contact you 24 hours before your service date</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#B23092] rounded-full"></div>
                <span className="font-urbanist">Keep your booking confirmation handy</span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-8 border border-white/20">
            <h3 className="text-xl font-annie-telescope font-semibold text-white mb-4">Need Help?</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-gray-300">
                <Phone className="w-4 h-4 text-[#B23092]" />
                <span className="font-urbanist">+91 98470 12345</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-gray-300">
                <Mail className="w-4 h-4 text-[#B23092]" />
                <span className="font-urbanist">info@kshetraretreat.com</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => router.push('/services')}
              className="w-full bg-[#B23092] hover:bg-[#9a2578] text-white py-4 rounded-2xl font-urbanist font-semibold text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#B23092]/30"
            >
              Book More Services
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => router.push('/')}
              className="w-full border border-white/20 text-white py-4 rounded-2xl font-urbanist font-semibold text-lg hover:bg-white/10 transition-all"
            >
              Back to Home
            </button>
          </div>
        </motion.div>
          </div>
        </div>
      </section>

      {/* Additional spacing for content below */}
      <div className="bg-black py-16"></div>
    </div>
  )
}

export default function ServicesBookingSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ServicesBookingSuccessPageContent />
    </Suspense>
  );
}