'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  CheckCircle,
  Download,
  Mail,
  Phone,
  Car,
  Plane,
  Calendar,
  MapPin,
  User,
  ArrowRight,
  Home,
  Clock,
  Shield,
  Star,
  Copy,
  Share2
} from 'lucide-react'
import Header from '../../../components/Header'

interface BookingData {
  personalInfo: {
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
  paymentId: string
  orderId: string
  bookingId: string
  bookingDate: string
}

export default function SuccessPage() {
  const router = useRouter()
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0)

    const data = localStorage.getItem('lastTransportBooking')
    if (data) {
      setBookingData(JSON.parse(data))
    } else {
      router.push('/airport-transport')
    }

    // Hide confetti after animation
    setTimeout(() => setShowConfetti(false), 3000)
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleCopyBookingId = () => {
    if (!bookingData) return
    navigator.clipboard.writeText(bookingData.bookingId)
    alert('Booking ID copied to clipboard!')
  }

  const handleShareBooking = () => {
    if (navigator.share && bookingData) {
      navigator.share({
        title: 'Airport Transport Booking Confirmation',
        text: `I just booked airport transport at Kshetra Retreat Resort!`,
        url: window.location.href
      })
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href)
      alert('Booking link copied to clipboard!')
    }
  }

  const downloadBookingDetails = () => {
    if (!bookingData) return

    const details = `
KSHETRA RETREAT RESORT
Airport Transport Booking Confirmation

Booking ID: ${bookingData.bookingId}
Booking Date: ${formatDateTime(bookingData.bookingDate)}
Payment ID: ${bookingData.paymentId}

GUEST DETAILS:
Name: ${bookingData.personalInfo.firstName} ${bookingData.personalInfo.lastName}
Email: ${bookingData.personalInfo.email}
Phone: ${bookingData.personalInfo.phone}
Address: ${bookingData.personalInfo.address}, ${bookingData.personalInfo.city}, ${bookingData.personalInfo.state} - ${bookingData.personalInfo.pincode}

EMERGENCY CONTACT:
Name: ${bookingData.personalInfo.emergencyContact.name}
Phone: ${bookingData.personalInfo.emergencyContact.phone}
Relation: ${bookingData.personalInfo.emergencyContact.relation}

TRANSPORT DETAILS:
Airport: ${bookingData.airportLocation === 'kochi' ? 'Kochi Airport (COK)' : 'Trivandrum Airport (TRV)'}
${bookingData.pickup ? `
PICKUP SERVICE:
${bookingData.pickupDetails?.flightNumber ? `Flight: ${bookingData.pickupDetails.flightNumber}` : ''}
${bookingData.pickupDetails?.arrivalTime ? `Arrival: ${formatDateTime(bookingData.pickupDetails.arrivalTime)}` : ''}
${bookingData.pickupDetails?.terminal ? `Terminal: ${bookingData.pickupDetails.terminal}` : ''}
Cost: ₹1,500` : ''}

${bookingData.drop ? `
DROP SERVICE:
${bookingData.dropDetails?.flightNumber ? `Flight: ${bookingData.dropDetails.flightNumber}` : ''}
${bookingData.dropDetails?.departureTime ? `Departure: ${formatDateTime(bookingData.dropDetails.departureTime)}` : ''}
${bookingData.dropDetails?.terminal ? `Terminal: ${bookingData.dropDetails.terminal}` : ''}
Cost: ₹1,500` : ''}

TOTAL AMOUNT PAID: ${formatCurrency(bookingData.totalAmount)}

For any queries, contact us at:
Phone: +91 98470 12345
Email: transport@kshetraretreat.com

Thank you for choosing Kshetra Retreat Resort!
    `

    const blob = new Blob([details], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Booking_${bookingData.bookingId}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!bookingData) {
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

  return (
    <div className="min-h-screen bg-black">
      <Header />

      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-[#B23092] rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: -10,
                rotate: 0,
              }}
              animate={{
                y: window.innerHeight + 10,
                rotate: 360,
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                ease: "easeOut",
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      )}

      <div className="container mx-auto px-4 md:px-[100px] py-8 max-w-4xl">
        {/* Success Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-[#B23092]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-[#B23092]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 font-annie-telescope">
            Booking Confirmed!
          </h1>
          <p className="text-xl text-white/80 font-urbanist">
            Your airport transport has been successfully booked
          </p>
        </motion.div>

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
                    onClick={downloadBookingDetails}
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
                      {bookingData.bookingId}
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
                  <p className="font-medium text-white font-urbanist">{formatDateTime(bookingData.bookingDate)}</p>
                </div>
                <div>
                  <span className="text-white/60 font-urbanist">Payment ID</span>
                  <p className="font-medium text-white font-mono text-xs font-urbanist">{bookingData.paymentId || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-white/60 font-urbanist">Amount Paid</span>
                  <p className="font-bold text-lg text-[#B23092] font-annie-telescope">{formatCurrency(bookingData.totalAmount)}</p>
                </div>
              </div>
            </motion.div>

            {/* Guest Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-md rounded-xl border border-white/20 p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3 font-annie-telescope">
                <User className="w-6 h-6 text-[#B23092]" />
                Guest Information
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-white mb-3 font-annie-telescope">Personal Details</h3>
                  <div className="space-y-2 text-sm font-urbanist">
                    <p className="text-white/90"><span className="font-medium text-white">Name:</span> {bookingData.personalInfo.firstName} {bookingData.personalInfo.lastName}</p>
                    <p className="text-white/90"><span className="font-medium text-white">Email:</span> {bookingData.personalInfo.email}</p>
                    <p className="text-white/90"><span className="font-medium text-white">Phone:</span> {bookingData.personalInfo.phone}</p>
                    <p className="text-white/90"><span className="font-medium text-white">Address:</span> {bookingData.personalInfo.address}, {bookingData.personalInfo.city}, {bookingData.personalInfo.state} - {bookingData.personalInfo.pincode}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-3 font-annie-telescope">Emergency Contact</h3>
                  <div className="space-y-2 text-sm font-urbanist">
                    <p className="text-white/90"><span className="font-medium text-white">Name:</span> {bookingData.personalInfo.emergencyContact.name}</p>
                    <p className="text-white/90"><span className="font-medium text-white">Phone:</span> {bookingData.personalInfo.emergencyContact.phone}</p>
                    <p className="text-white/90"><span className="font-medium text-white">Relation:</span> {bookingData.personalInfo.emergencyContact.relation}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Transport Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 backdrop-blur-md rounded-xl border border-white/20 p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3 font-annie-telescope">
                <Car className="w-6 h-6 text-[#B23092]" />
                Transport Details
              </h2>

              <div className="space-y-6">
                <div className="bg-[#B23092]/20 border border-[#B23092]/30 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Plane className="w-6 h-6 text-[#B23092]" />
                    <div>
                      <h3 className="font-semibold text-white font-annie-telescope">
                        {bookingData.airportLocation === 'kochi' ? 'Kochi Airport (COK)' : 'Trivandrum Airport (TRV)'}
                      </h3>
                      <p className="text-sm text-white/80 font-urbanist">
                        {bookingData.airportLocation === 'kochi'
                          ? 'Cochin International Airport'
                          : 'Thiruvananthapuram International Airport'}
                      </p>
                    </div>
                  </div>
                </div>

                {bookingData.pickup && (
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-[#B23092] rounded-full"></div>
                      <h3 className="font-semibold text-[#B23092] font-annie-telescope">Airport Pickup Service</h3>
                    </div>
                    <div className="space-y-1 text-sm ml-4 font-urbanist">
                      {bookingData.pickupDetails?.flightNumber && (
                        <p className="text-white/90"><span className="font-medium text-white">Flight Number:</span> {bookingData.pickupDetails.flightNumber}</p>
                      )}
                      {bookingData.pickupDetails?.arrivalTime && (
                        <p className="text-white/90"><span className="font-medium text-white">Arrival Time:</span> {formatDateTime(bookingData.pickupDetails.arrivalTime)}</p>
                      )}
                      {bookingData.pickupDetails?.terminal && (
                        <p className="text-white/90"><span className="font-medium text-white">Terminal:</span> {bookingData.pickupDetails.terminal}</p>
                      )}
                      <p className="text-[#B23092] font-semibold">Cost: ₹1,500</p>
                    </div>
                  </div>
                )}

                {bookingData.drop && (
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-[#B23092] rounded-full"></div>
                      <h3 className="font-semibold text-[#B23092] font-annie-telescope">Airport Drop Service</h3>
                    </div>
                    <div className="space-y-1 text-sm ml-4 font-urbanist">
                      {bookingData.dropDetails?.flightNumber && (
                        <p className="text-white/90"><span className="font-medium text-white">Flight Number:</span> {bookingData.dropDetails.flightNumber}</p>
                      )}
                      {bookingData.dropDetails?.departureTime && (
                        <p className="text-white/90"><span className="font-medium text-white">Departure Time:</span> {formatDateTime(bookingData.dropDetails.departureTime)}</p>
                      )}
                      {bookingData.dropDetails?.terminal && (
                        <p className="text-white/90"><span className="font-medium text-white">Terminal:</span> {bookingData.dropDetails.terminal}</p>
                      )}
                      <p className="text-[#B23092] font-semibold">Cost: ₹1,500</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Payment Confirmation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/5 backdrop-blur-md rounded-xl border border-white/20 p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3 font-annie-telescope">
                <CheckCircle className="w-6 h-6 text-[#B23092]" />
                Payment Confirmation
              </h2>

              <div className="bg-[#B23092]/20 border border-[#B23092]/30 rounded-lg p-6 text-center">
                <p className="text-white/80 text-sm mb-2 font-urbanist">Amount Paid</p>
                <p className="text-[#B23092] font-bold text-4xl font-annie-telescope">{formatCurrency(bookingData.totalAmount)}</p>
                <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-4 text-sm text-left">
                  <div>
                    <span className="text-white/60 font-urbanist">Payment ID</span>
                    <p className="font-medium text-white font-mono text-xs font-urbanist mt-1">{bookingData.paymentId || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-white/60 font-urbanist">Order ID</span>
                    <p className="font-medium text-white font-mono text-xs font-urbanist mt-1">{bookingData.orderId || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Quick Actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/5 backdrop-blur-md rounded-xl border border-white/20 p-6"
              >
                <h3 className="text-xl font-bold text-white mb-4 font-annie-telescope">Quick Actions</h3>

                <div className="space-y-3">
                  <button
                    onClick={downloadBookingDetails}
                    className="w-full flex items-center justify-center gap-3 bg-[#B23092] hover:bg-[#9a2578] text-white py-3 px-4 rounded-full transition-colors font-urbanist"
                  >
                    <Download className="w-5 h-5" />
                    Download Details
                  </button>

                  <button
                    onClick={() => router.push('/')}
                    className="w-full flex items-center justify-center gap-3 bg-transparent border border-white/20 hover:bg-white/10 text-white py-3 px-4 rounded-full transition-colors font-urbanist"
                  >
                    <Home className="w-5 h-5" />
                    Back to Home
                  </button>

                  <button
                    onClick={() => router.push('/airport-transport')}
                    className="w-full flex items-center justify-center gap-3 bg-transparent border border-white/20 hover:bg-white/10 text-white py-3 px-4 rounded-full transition-colors font-urbanist"
                  >
                    <Car className="w-5 h-5" />
                    Book Another Transfer
                  </button>
                </div>
              </motion.div>

              {/* What's Next */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white/5 backdrop-blur-md rounded-xl border border-white/20 p-6"
              >
                <h3 className="text-xl font-bold text-white mb-4 font-annie-telescope">What's Next?</h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#B23092]/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-[#B23092]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white font-annie-telescope">Confirmation Email</h4>
                      <p className="text-sm text-white/80 font-urbanist">You'll receive a confirmation email with all booking details</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#B23092]/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4 text-[#B23092]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white font-annie-telescope">Driver Contact</h4>
                      <p className="text-sm text-white/80 font-urbanist">Driver details will be shared 24 hours before pickup</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#B23092]/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-[#B23092]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white font-annie-telescope">Pickup Time</h4>
                      <p className="text-sm text-white/80 font-urbanist">Driver will arrive 15 minutes before scheduled time</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white/5 backdrop-blur-md rounded-xl border border-white/20 p-6"
              >
                <h3 className="text-xl font-bold text-white mb-4 font-annie-telescope">Need Assistance?</h3>
                <p className="text-white/80 mb-4 font-urbanist">
                  Our team is available 24/7 to assist you with your transport booking.
                </p>

                <div className="space-y-3">
                  <a
                    href="tel:+919847012345"
                    className="flex items-center gap-3 text-white/90 hover:text-[#B23092] transition-colors font-urbanist"
                  >
                    <Phone className="w-5 h-5 text-[#B23092]" />
                    <span>+91 98470 12345</span>
                  </a>
                  <a
                    href="mailto:transport@kshetraretreat.com"
                    className="flex items-center gap-3 text-white/90 hover:text-[#B23092] transition-colors font-urbanist"
                  >
                    <Mail className="w-5 h-5 text-[#B23092]" />
                    <span>transport@kshetraretreat.com</span>
                  </a>
                </div>
              </motion.div>

              {/* Booking Status */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-[#B23092]/20 border border-[#B23092]/30 rounded-xl p-6 text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-[#B23092]" />
                  <h4 className="font-semibold text-white font-annie-telescope">Booking Status</h4>
                </div>
                <p className="text-[#B23092] font-bold text-lg font-annie-telescope">Confirmed</p>
                <p className="text-white/80 text-sm mt-2 font-urbanist">Your booking is confirmed and payment has been received</p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Final Confirmation Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-8 bg-[#B23092]/20 border border-[#B23092]/30 rounded-xl p-6 text-center"
        >
          <p className="text-white/90 text-lg font-urbanist">
            Thank you for choosing <span className="text-[#B23092] font-bold font-annie-telescope">Kshetra Retreat Resort</span>! We look forward to serving you.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
