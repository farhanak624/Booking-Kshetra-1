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
      const response = await bookingAPI.getBookingById(id)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-blue-900">
      <Header />

      <div className="container mx-auto px-4 md:px-[100px] py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          {/* Success Icon */}
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>

          {/* Success Message */}
          <h1 className="text-4xl font-bold text-white mb-4">Booking Confirmed!</h1>
          <p className="text-xl text-gray-300 mb-8">
            Your services have been successfully booked. We'll contact you shortly with confirmation details.
          </p>

          {/* Booking Details */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6">Booking Details</h2>

            <div className="space-y-4 text-left">
              {(bookingId || searchParams.get('booking_id')) && (
                <div className="flex items-center justify-between p-4 bg-blue-500/20 rounded-xl border border-blue-400/30">
                  <div className="flex flex-col">
                    <span className="text-gray-300 text-sm">Booking ID:</span>
                    <span className="text-blue-400 font-mono text-lg font-semibold">{bookingId || searchParams.get('booking_id')}</span>
                    <span className="text-gray-400 text-xs mt-1">Use this ID to track your booking</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(bookingId || searchParams.get('booking_id') || '', 'booking')}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
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
                <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                  <span className="text-gray-300">Order ID:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-400 font-mono text-sm">{orderId}</span>
                    <button
                      onClick={() => copyToClipboard(orderId, 'order')}
                      className="p-1 hover:bg-white/10 rounded"
                    >
                      {copiedField === 'order' ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400 hover:text-white" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {paymentId && (
                <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                  <span className="text-gray-300">Payment ID:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 font-mono text-sm">{paymentId}</span>
                    <button
                      onClick={() => copyToClipboard(paymentId, 'payment')}
                      className="p-1 hover:bg-white/10 rounded"
                    >
                      {copiedField === 'payment' ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400 hover:text-white" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                <span className="text-gray-300">Status:</span>
                <span className="text-green-400 font-semibold">Confirmed</span>
              </div>

              {bookingDetails && bookingDetails.checkIn && (
                <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                  <span className="text-gray-300">Service Date:</span>
                  <div className="flex items-center gap-2 text-orange-400">
                    <Calendar className="w-4 h-4" />
                    <span className="font-semibold">{formatDate(bookingDetails.checkIn)}</span>
                  </div>
                </div>
              )}

              {bookingDetails && bookingDetails.totalAmount && (
                <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                  <span className="text-gray-300">Total Amount:</span>
                  <span className="text-green-400 font-bold text-lg">{formatCurrency(bookingDetails.totalAmount)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Booked Services */}
          {loading ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-8">
              <div className="flex items-center justify-center">
                <Loader className="w-8 h-8 animate-spin text-orange-400" />
                <span className="ml-3 text-white">Loading booking details...</span>
              </div>
            </div>
          ) : bookingDetails && bookingDetails.selectedServices && bookingDetails.selectedServices.length > 0 && (
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-6">Your Booked Services</h2>
              <div className="space-y-4">
                {bookingDetails.selectedServices.map((service: any, index: number) => {
                  const ServiceIcon = getServiceIcon(service.serviceId?.category || 'adventure')
                  return (
                    <div key={index} className="bg-white/10 rounded-2xl p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-xl">
                          <ServiceIcon className="w-6 h-6 text-orange-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-white">
                            {service.serviceId?.name || 'Service'}
                          </h4>
                          <p className="text-gray-300 text-sm">
                            Quantity: {service.quantity} | Category: {service.serviceId?.category || 'N/A'}
                          </p>
                          {service.serviceId?.description && (
                            <p className="text-gray-400 text-sm mt-1">
                              {service.serviceId.description}
                            </p>
                          )}
                          {service.details && (
                            <p className="text-gray-400 text-sm mt-1">
                              {service.details}
                            </p>
                          )}
                        </div>
                        <div className="text-orange-400 font-bold text-lg">
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
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">What happens next?</h3>
            <div className="space-y-3 text-gray-300 text-left">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span>You'll receive a confirmation email within 5 minutes</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span>Our team will contact you 24 hours before your service date</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span>Keep your booking confirmation handy</span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Need Help?</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-gray-300">
                <Phone className="w-4 h-4 text-orange-400" />
                <span>+91 98470 12345</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-gray-300">
                <Mail className="w-4 h-4 text-orange-400" />
                <span>info@kshetraretreat.com</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => router.push('/services')}
              className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-4 rounded-2xl font-semibold text-lg hover:from-orange-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2"
            >
              Book More Services
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => router.push('/')}
              className="w-full border border-white/20 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-white/10 transition-all"
            >
              Back to Home
            </button>
          </div>
        </motion.div>
      </div>
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