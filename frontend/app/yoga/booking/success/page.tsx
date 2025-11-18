'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  CheckCircle,
  Download,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowLeft,
  Share2,
  Home,
  Copy,
  Package,
  CheckCircle2
} from 'lucide-react'
import Header from '../../../../components/Header'
import ApiInstance from '../../../../lib/api'

function YogaBookingSuccessPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentId = searchParams.get('payment_id')
  const orderId = searchParams.get('order_id')
  const bookingId = searchParams.get('booking_id')

  const [bookingDetails, setBookingDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0)

    // Fetch booking details
    const fetchBookingDetails = async () => {
      if (!bookingId) {
        setError('Booking ID is required')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await ApiInstance.get(`/bookings/public/${bookingId}`)

        if (response.data.success) {
          const booking = response.data.data.booking
          setBookingDetails(booking)
        } else {
          setError('Failed to fetch booking details')
        }
      } catch (error) {
        console.error('Error fetching booking details:', error)
        setError('Failed to fetch booking details')
      } finally {
        setLoading(false)
      }
    }

    fetchBookingDetails()
  }, [bookingId])

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

  const handleDownloadReceipt = async () => {
    try {
      const response = await ApiInstance.get(`/bookings/${bookingDetails._id}/receipt`, {
        responseType: 'blob'
      })

      if (response.status === 200) {
        const blob = response.data
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `yoga-booking-receipt-${bookingDetails._id}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Receipt downloaded successfully!')
      } else {
        toast.error('Error downloading receipt. Please try again.')
      }
    } catch (error) {
      console.error('Error downloading receipt:', error)
      toast.error('Error downloading receipt. Please try again.')
    }
  }

  const handleShareBooking = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Yoga Booking Confirmation',
        text: `I just booked a yoga session at Kshetra Retreat Resort!`,
        url: window.location.href
      })
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href)
      alert('Booking link copied to clipboard!')
    }
  }

  const handleCopyBookingId = () => {
    navigator.clipboard.writeText(bookingDetails._id)
    toast.success('Booking ID copied to clipboard!')
  }

  const handleTrackBooking = () => {
    router.push(`/track-booking?booking_id=${bookingDetails._id}`)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="container mx-auto px-4 md:px-[100px] py-8 max-w-4xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B23092] mx-auto mb-4"></div>
            <p className="text-white/80 font-urbanist">Loading booking details...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="container mx-auto px-4 md:px-[100px] py-8 max-w-4xl">
          <div className="text-center">
            <div className="w-20 h-20 bg-[#B23092]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-[#B23092]" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 font-annie-telescope">Error</h1>
            <p className="text-[#B23092] mb-4 font-urbanist">{error}</p>
            <button
              onClick={() => router.push('/yoga')}
              className="bg-[#B23092] text-white px-6 py-2 rounded-lg hover:bg-[#9a2578] font-urbanist"
            >
              Back to Yoga
            </button>
          </div>
        </div>
      </div>
    )
  }

  // No booking data
  if (!bookingDetails) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="container mx-auto px-4 md:px-[100px] py-8 max-w-4xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2 font-annie-telescope">Booking Not Found</h1>
            <p className="text-white/80 mb-4 font-urbanist">The booking details could not be found.</p>
            <button
              onClick={() => router.push('/yoga')}
              className="bg-[#B23092] text-white px-6 py-2 rounded-lg hover:bg-[#9a2578] font-urbanist"
            >
              Back to Yoga
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />

      {/* Hero Section with Background Image */}
      <section className="relative min-h-[70vh] sm:min-h-[80vh] overflow-visible w-full">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src="https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/yoga.png?updatedAt=1762969684085"
            alt="Yoga Booking Success"
            className="w-full h-full object-cover"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 min-h-[70vh] sm:min-h-[80vh] flex flex-col py-8">
          <div className="container mx-auto px-4 md:px-[100px] w-full flex-1 flex flex-col justify-center py-12">
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
                Your yoga session has been successfully booked. We'll contact you shortly with all the details.
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
          <div className="container mx-auto px-4 md:px-[100px] max-w-4xl">
            <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Confirmation Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Reference */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 backdrop-blur-md rounded-xl border border-white/20 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white font-annie-telescope">Booking Details</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleShareBooking}
                    className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleDownloadReceipt}
                    className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="min-w-0">
                  <span className="text-white/60 font-urbanist">Booking ID</span>
                  <div className="flex items-start gap-2 mt-1">
                    <p className="font-bold text-sm md:text-lg text-[#B23092] font-mono break-all flex-1 leading-relaxed">
                      {bookingDetails._id}
                    </p>
                    <button
                      onClick={handleCopyBookingId}
                      className="p-1 text-white/60 hover:text-[#B23092] hover:bg-white/10 rounded transition-colors flex-shrink-0 mt-0.5"
                      title="Copy Booking ID"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <span className="text-white/60 font-urbanist">Booking Date</span>
                  <p className="font-medium text-white font-urbanist">{formatDate(bookingDetails.createdAt)}</p>
                </div>
                <div>
                  <span className="text-white/60 font-urbanist">Payment ID</span>
                  <p className="font-medium text-white font-mono text-xs font-urbanist">{bookingDetails.paymentId || paymentId || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-white/60 font-urbanist">Amount Paid</span>
                  <p className="font-bold text-lg text-[#B23092] font-annie-telescope">{formatCurrency(bookingDetails.finalAmount || bookingDetails.totalAmount)}</p>
                </div>
              </div>
            </motion.div>

            {/* Session Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-md rounded-xl border border-white/20 p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-6 font-annie-telescope">Session Information</h2>

              <div className="bg-[#B23092]/20 border border-[#B23092]/30 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6 text-[#B23092]" />
                  <h3 className="text-lg font-semibold text-white font-annie-telescope">
                    {bookingDetails.primaryService || 'Yoga Session'}
                  </h3>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#B23092]" />
                    <span className="text-white/90 font-urbanist">
                      <strong>Date:</strong> {formatDate(bookingDetails.checkIn)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#B23092]" />
                    <span className="text-white/90 font-urbanist">
                      <strong>Duration:</strong> {bookingDetails.yogaSessionId?.type === 'daily' ? '90 minutes' : 'As scheduled'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#B23092]" />
                    <span className="text-white/90 font-urbanist">
                      <strong>Instructor:</strong> {bookingDetails.yogaSessionId?.instructor || 'TBA'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#B23092]" />
                    <span className="text-white/90 font-urbanist">
                      <strong>Participants:</strong> {bookingDetails.totalGuests} ({bookingDetails.adults} Adults, {bookingDetails.children} Children)
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[#B23092]/30">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#B23092] mt-1" />
                    <span className="text-white/90 font-urbanist">
                      <strong>Location:</strong> {bookingDetails.yogaSessionId?.location || 'Kshetra Retreat Resort, Varkala'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2 font-annie-telescope">What's Next?</h4>
                <ul className="text-sm text-white/80 space-y-1 font-urbanist">
                  <li>• You'll receive a confirmation email with detailed instructions</li>
                  <li>• Please arrive 15 minutes early for check-in</li>
                  <li>• Bring comfortable yoga clothes and a water bottle</li>
                  <li>• Yoga mats and props will be provided</li>
                </ul>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 backdrop-blur-md rounded-xl border border-white/20 p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-4 font-annie-telescope">Need Help?</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                  <Mail className="w-5 h-5 text-[#B23092]" />
                  <div>
                    <p className="font-medium text-white font-urbanist">Email Support</p>
                    <p className="text-sm text-white/70 font-urbanist">info@kshetraretreat.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                  <Phone className="w-5 h-5 text-[#B23092]" />
                  <div>
                    <p className="font-medium text-white font-urbanist">Phone Support</p>
                    <p className="text-sm text-white/70 font-urbanist">+91 XXXXXXXXXX</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-[#B23092]/20 border border-[#B23092]/30 rounded-lg">
                <p className="text-sm text-white/90 font-urbanist">
                  <strong>Note:</strong> Please save your booking ID for future correspondence and tracking.
                </p>
                <p className="text-sm text-[#B23092] mt-2 font-mono break-all bg-black/50 p-2 rounded border border-[#B23092]/30 font-urbanist">
                  <strong>{bookingDetails._id}</strong>
                </p>
              </div>
            </motion.div>
          </div>

          {/* Sidebar with Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/20 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-white mb-6 font-annie-telescope">Quick Actions</h3>

              <div className="space-y-4">
                <button
                  onClick={handleTrackBooking}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#B23092] text-white rounded-lg hover:bg-[#9a2578] transition-colors font-urbanist"
                >
                  <Package className="w-4 h-4" />
                  Track Booking
                </button>

                <button
                  onClick={handleDownloadReceipt}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#B23092] text-white rounded-lg hover:bg-[#9a2578] transition-colors font-urbanist"
                >
                  <Download className="w-4 h-4" />
                  Download Receipt
                </button>

                <button
                  onClick={handleShareBooking}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors font-urbanist"
                >
                  <Share2 className="w-4 h-4" />
                  Share Booking
                </button>

                <button
                  onClick={() => router.push('/yoga')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors font-urbanist"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Yoga
                </button>

                <button
                  onClick={() => router.push('/')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors font-urbanist"
                >
                  <Home className="w-4 h-4" />
                  Back to Home
                </button>
              </div>

              {/* Booking Status */}
              <div className="mt-8 p-4 bg-[#B23092]/20 border border-[#B23092]/30 rounded-lg">
                <div className="text-center">
                  <CheckCircle2 className="w-8 h-8 text-[#B23092] mx-auto mb-2" />
                  <h4 className="font-semibold text-white mb-2 font-annie-telescope">Booking Status</h4>
                  <p className="text-sm text-white/80 mb-3 font-urbanist">
                    Your booking is confirmed and ready
                  </p>
                  <button
                    onClick={handleTrackBooking}
                    className="text-sm text-[#B23092] font-medium hover:text-[#9a2578] font-urbanist"
                  >
                    Track Progress
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 p-6 bg-[#B23092]/20 border border-[#B23092]/30 rounded-xl"
        >
          <CheckCircle className="w-8 h-8 text-[#B23092] mx-auto mb-3" />
          <p className="text-white font-medium mb-2 font-annie-telescope">
            Thank you for choosing Kshetra Retreat Resort!
          </p>
          <p className="text-sm text-white/80 font-urbanist">
            We're excited to be part of your yoga journey. See you soon! 🧘‍♀️
          </p>
        </motion.div>
          </div>
        </div>
      </section>

      {/* Additional spacing for content below */}
      <div className="bg-black py-16"></div>
    </div>
  )
}

export default function YogaBookingSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <YogaBookingSuccessPageContent />
    </Suspense>
  );
}