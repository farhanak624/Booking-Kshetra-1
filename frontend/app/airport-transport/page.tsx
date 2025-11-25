'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Car,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Calendar,
  Plane,
  CheckCircle,
  ArrowRight,
  Users,
  Shield,
  Star,
  ChevronDown
} from 'lucide-react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

interface TransportBooking {
  pickup: boolean
  drop: boolean
  pickupDetails?: {
    flightNumber?: string
    arrivalTime?: string
    terminal?: 'T1' | 'T2' | 'T3'
  }
  dropDetails?: {
    flightNumber?: string
    departureTime?: string
    terminal?: 'T1' | 'T2' | 'T3'
  }
  airportLocation: 'kochi' | 'trivandrum'
}


export default function AirportTransportPage() {
  const router = useRouter()
  const [bookingData, setBookingData] = useState<TransportBooking>({
    pickup: false,
    drop: false,
    airportLocation: 'kochi'
  })


  const [totalAmount, setTotalAmount] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{
    pickup?: string;
    drop?: string;
    general?: string;
  }>({});

  const calculateTotal = () => {
    let total = 0
    if (bookingData.pickup) total += 1500
    if (bookingData.drop) total += 1500
    setTotalAmount(total)
  }

  // Calculate total on component mount and when bookingData changes
  useEffect(() => {
    calculateTotal()
  }, [bookingData.pickup, bookingData.drop])

  const handlePickupChange = (enabled: boolean) => {
    setBookingData(prev => ({
      ...prev,
      pickup: enabled,
      pickupDetails: enabled ? (prev.pickupDetails || {}) : undefined
    }))
    // Clear errors when service is toggled
    if (errors.pickup || errors.general) {
      setErrors(prev => ({ ...prev, pickup: undefined, general: undefined }));
    }
  }

  const handleDropChange = (enabled: boolean) => {
    setBookingData(prev => ({
      ...prev,
      drop: enabled,
      dropDetails: enabled ? (prev.dropDetails || {}) : undefined
    }))
    // Clear errors when service is toggled
    if (errors.drop || errors.general) {
      setErrors(prev => ({ ...prev, drop: undefined, general: undefined }));
    }
  }

  const clearFieldError = (field: 'pickup' | 'drop') => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }

  const validateForm = (): boolean => {
    const newErrors: { pickup?: string; drop?: string; general?: string } = {};

    // Check if at least one service is selected
    if (!bookingData.pickup && !bookingData.drop) {
      newErrors.general = 'Please select at least one service (pickup or drop)';
      setErrors(newErrors);
      return false;
    }

    // Validate pickup details if pickup is selected
    if (bookingData.pickup) {
      if (!bookingData.pickupDetails?.flightNumber?.trim()) {
        newErrors.pickup = 'Flight number is required for pickup service';
      } else if (!bookingData.pickupDetails?.arrivalTime) {
        newErrors.pickup = 'Arrival date and time is required for pickup service';
      } else if (!bookingData.pickupDetails?.terminal) {
        newErrors.pickup = 'Terminal selection is required for pickup service';
      } else {
        // Validate arrival time is not in the past
        const arrivalTime = new Date(bookingData.pickupDetails.arrivalTime);
        const now = new Date();
        if (arrivalTime < now) {
          newErrors.pickup = 'Arrival time cannot be in the past';
        }
      }
    }

    // Validate drop details if drop is selected
    if (bookingData.drop) {
      if (!bookingData.dropDetails?.flightNumber?.trim()) {
        newErrors.drop = 'Flight number is required for drop service';
      } else if (!bookingData.dropDetails?.departureTime) {
        newErrors.drop = 'Departure date and time is required for drop service';
      } else if (!bookingData.dropDetails?.terminal) {
        newErrors.drop = 'Terminal selection is required for drop service';
      } else {
        // Validate departure time is not in the past
        const departureTime = new Date(bookingData.dropDetails.departureTime);
        const now = new Date();
        if (departureTime < now) {
          newErrors.drop = 'Departure time cannot be in the past';
        }
      }
    }

    // Additional validation: if both pickup and drop are selected, departure should be after arrival
    if (bookingData.pickup && bookingData.drop &&
        bookingData.pickupDetails?.arrivalTime &&
        bookingData.dropDetails?.departureTime) {
      const arrivalTime = new Date(bookingData.pickupDetails.arrivalTime);
      const departureTime = new Date(bookingData.dropDetails.departureTime);

      if (departureTime <= arrivalTime) {
        newErrors.drop = 'Departure time must be after arrival time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate form before proceeding
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    // Prepare booking data
    const completeBookingData = {
      ...bookingData,
      totalAmount
    }

    console.log('Submitting booking data:', completeBookingData) // Debug log

    // Store booking data in localStorage for payment page
    localStorage.setItem('airportTransportBooking', JSON.stringify(completeBookingData))

    // Redirect to payment page
    router.push('/airport-transport/payment')
  }

  return (
    <div className="min-h-screen bg-transparent">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/Kshetra/airpotbg.png"
            style={{ objectFit: "cover" }}
            alt="Airport Transfers at Kshetra"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center">
          <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-[100px] 2xl:px-[120px]">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="max-w-3xl"
            >
              {/* Main Heading */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
                <span className="block uppercase tracking-wider mb-2 font-annie-telescope">
                  Smooth Rides
                </span>
                <span
                  className="block text-6xl md:text-7xl lg:text-8xl font-water-brush italic mt-4"
                  style={{ color: "#B23092" }}
                >
                  to Every Terminal
                </span>
              </h1>

              {/* Description */}
              <div className="text-lg md:text-xl text-white/90 mb-12 max-w-xl leading-relaxed font-urbanist space-y-2">
                <p>
                  Experience comfort and punctuality with our dedicated airport
                  transport service.
                </p>
              </div>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const element = document.getElementById("programs-section");
                  element?.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-[#B23092] hover:bg-[#9a2578] text-white font-semibold text-lg px-10 py-4 rounded-full transition-all duration-300 shadow-lg font-urbanist flex items-center gap-3"
              >
                View Programs
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Service Information */}
      <section className="relative py-20 md:py-30 overflow-hidden bg-transparent">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/Kshetra/airpotbg2.png?updatedAt=1763053652989"
            style={{
              objectFit: "cover",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
            alt="Airport Transfers at Kshetra"
            className="w-full h-auto object-cover"
          />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-[100px] 2xl:px-[120px]">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start max-w-6xl mx-auto">
            {/* Left Side - Service Information */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className=""
            >
              {/* Main Title */}
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-wider mb-2 font-annie-telescope">
                  WHY TRAVELERS
                </h2>
                <h3 className="text-5xl md:text-6xl font-bold text-[#B23092] mb-4 font-water-brush">
                  Trust Us
                </h3>
              </div>

              {/* Tagline */}
              <p className="text-lg md:text-xl text-white/90 leading-relaxed font-urbanist">
                Safe, punctual, and hassle-free rides designed for your comfort
                and peace of mind.
              </p>

              {/* Service Features Section */}
              <div className="mt-8">
                <h4 className="text-2xl md:text-3xl font-bold text-[#B23092] mb-6 font-annie-telescope">
                  Service Features
                </h4>
                <ul className="space-y-3">
                  {[
                    "Professional drivers with airport experience",
                    "Real-time flight tracking and delay notifications",
                    "Meet and greet service at arrivals",
                    "Comfortable, air-conditioned vehicles",
                    "24/7 customer support",
                    "Fixed pricing with no hidden charges",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-[#B23092] mt-1.5">•</span>
                      <span className="text-white font-urbanist">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Right Side - Vehicle Information Box */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* Vehicle Information Card with Gradient Border */}
              <div
                className="relative rounded-2xl p-[2px]"
                style={
                  {
                    // background: 'linear-gradient(135deg, #B23092, #9333ea)'
                  }
                }
              >
                {/* Inner content with dark background */}
                <div className="bg-transparent opacity-100 backdrop-blur-md rounded-2xl p-8 h-full border border-white/20">
                  <div className="relative">
                    <h3 className="text-2xl font-bold text-white mb-6 font-urbanist">
                      Vehicle Information
                    </h3>

                    <div className="space-y-6">
                      {/* Sedan */}
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-[#B23092]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Car className="w-6 h-6 text-[#B23092]" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white mb-1 font-urbanist">
                            Sedan (1-4 passengers)
                          </h4>
                          <p className="text-sm text-white/80 font-urbanist">
                            Comfortable sedan with AC and luggage space
                          </p>
                        </div>
                      </div>

                      {/* SUV */}
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-[#B23092]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Users className="w-6 h-6 text-[#B23092]" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white mb-1 font-urbanist">
                            SUV (5-7 passengers)
                          </h4>
                          <p className="text-sm text-white/80 font-urbanist">
                            Spacious SUV for larger groups and extra luggage
                          </p>
                        </div>
                      </div>

                      {/* Note */}
                      <div className="mt-6 pt-6 border-t border-white/10">
                        <p className="text-sm text-white/90 font-urbanist">
                          <span className="text-[#B23092] font-semibold">
                            Note:
                          </span>{" "}
                          Vehicle will be assigned based on group size and
                          availability. All vehicles are sanitized and
                          well-maintained.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section
        className="relative py-20 md:py-32 overflow-hidden"
        id="booking-section"
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/airpotbg3.png"
            alt="Airport terminal"
            className="w-full h-full object-cover opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-black/80"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-[100px] 2xl:px-[120px]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto"
          >
            {/* Header */}
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-2 font-annie-telescope">
                BOOK YOUR{" "}
                <span
                  className="text-5xl md:text-6xl font-water-brush"
                  style={{ color: "#B23092" }}
                >
                  Transfer
                </span>
              </h2>
              <p className="text-lg md:text-xl text-white/90 font-urbanist mt-4">
                Select your services and provide flight details for seamless
                transfers
              </p>
            </div>

            {/* Main Form Card */}
            <form
              onSubmit={handleSubmit}
              className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 md:p-10"
            >
              {/* Airport Selection */}
              <div className="mb-10">
                <h3 className="text-2xl font-semibold text-white mb-6 font-urbanist">
                  Select Airport
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <label
                    className={`relative flex items-start gap-4 p-6 rounded-xl cursor-pointer transition-all ${
                      bookingData.airportLocation === "kochi"
                        ? "bg-white/5 border-2 border-[#B23092]"
                        : "bg-white/5 border-2 border-white/20 hover:border-[#B23092]/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="airport"
                      value="kochi"
                      checked={bookingData.airportLocation === "kochi"}
                      onChange={(e) =>
                        setBookingData((prev) => ({
                          ...prev,
                          airportLocation: e.target.value as
                            | "kochi"
                            | "trivandrum",
                        }))
                      }
                      className="sr-only"
                    />
                    {/* Icon */}
                    <div className="w-12 h-12 bg-[#B23092] rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg width="35" height="35" viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M14.5677 20.9401L10.6882 17.4162L14.3387 16.4403L19.4965 19.6207L14.5677 20.9401ZM21.8549 6.37964C21.8549 2.86253 24.7209 0 28.2416 0C31.7639 0 34.6284 2.86086 34.6284 6.37964C34.6284 10.2591 31.4137 13.4173 29.0655 15.7225C28.8911 15.8934 28.7237 16.0591 28.563 16.2181C28.4742 16.3069 28.358 16.3514 28.24 16.3514C28.1238 16.3514 28.0076 16.3069 27.917 16.2181C27.7564 16.0591 27.5889 15.8934 27.4146 15.7225C25.0681 13.4171 21.8517 10.259 21.8517 6.37964H21.8549ZM28.2434 8.95337C29.6653 8.95337 30.8223 7.79981 30.8223 6.37964C30.8223 4.96117 29.6653 3.80591 28.2434 3.80591C26.8215 3.80591 25.6594 4.95947 25.6594 6.37964C25.6594 7.79811 26.8181 8.95337 28.2434 8.95337ZM6.39503 23.1551L1.64237 17.9357L0 18.3766L1.62355 24.4316L6.39328 23.155L6.39503 23.1551ZM34.9478 22.463C34.7307 21.6563 33.9378 21.1624 33.1875 21.3641L33.0559 21.3983L31.2016 21.8939C31.1093 21.9178 31.017 21.9298 30.9265 21.9298C30.4582 21.9298 30.0309 21.617 29.9045 21.1436C29.7541 20.5796 30.0891 19.9986 30.653 19.8482L31.7707 19.5492C31.1059 19.098 30.2839 18.922 29.4823 19.1356L0.955394 26.7831C0.712712 26.8463 0.569156 27.1129 0.640934 27.3744L1.12972 29.1996L8.6527 31.0795L15.9622 29.121L17.2508 25.0895C17.3601 24.746 17.637 24.4828 17.9857 24.3888L26.8023 22.0287C27.6996 21.7878 28.4481 22.7363 28.0072 23.5532L26.5323 26.2875L33.97 24.2931C34.722 24.0932 35.1595 23.2695 34.9458 22.4628L34.9478 22.463ZM16.3059 35L19.9581 34.0207L24.9807 24.7068L19.0932 26.2825L16.3058 34.9984L16.3059 35Z" fill="white"/>
</svg>

                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-white mb-1 font-urbanist">
                        Kochi Airport (COK)
                      </h4>
                      <p className="text-white/80 text-sm font-urbanist">
                        Cochin International Airport
                      </p>
                      <p className="text-white/60 text-xs mt-1 font-urbanist">
                        Distance: ~45 km from resort
                      </p>
                    </div>
                    {bookingData.airportLocation === "kochi" && (
                      <CheckCircle className="w-6 h-6 text-[#B23092] flex-shrink-0" />
                    )}
                  </label>

                  <label
                    className={`relative flex items-start gap-4 p-6 rounded-xl cursor-pointer transition-all ${
                      bookingData.airportLocation === "trivandrum"
                        ? "bg-white/5 border-2 border-[#B23092]"
                        : "bg-white/5 border-2 border-white/20 hover:border-[#B23092]/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="airport"
                      value="trivandrum"
                      checked={bookingData.airportLocation === "trivandrum"}
                      onChange={(e) =>
                        setBookingData((prev) => ({
                          ...prev,
                          airportLocation: e.target.value as
                            | "kochi"
                            | "trivandrum",
                        }))
                      }
                      className="sr-only"
                    />
                    {/* Icon */}
                    <div className="w-12 h-12 bg-[#B23092] rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg width="35" height="35" viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M14.5677 20.9401L10.6882 17.4162L14.3387 16.4403L19.4965 19.6207L14.5677 20.9401ZM21.8549 6.37964C21.8549 2.86253 24.7209 0 28.2416 0C31.7639 0 34.6284 2.86086 34.6284 6.37964C34.6284 10.2591 31.4137 13.4173 29.0655 15.7225C28.8911 15.8934 28.7237 16.0591 28.563 16.2181C28.4742 16.3069 28.358 16.3514 28.24 16.3514C28.1238 16.3514 28.0076 16.3069 27.917 16.2181C27.7564 16.0591 27.5889 15.8934 27.4146 15.7225C25.0681 13.4171 21.8517 10.259 21.8517 6.37964H21.8549ZM28.2434 8.95337C29.6653 8.95337 30.8223 7.79981 30.8223 6.37964C30.8223 4.96117 29.6653 3.80591 28.2434 3.80591C26.8215 3.80591 25.6594 4.95947 25.6594 6.37964C25.6594 7.79811 26.8181 8.95337 28.2434 8.95337ZM6.39503 23.1551L1.64237 17.9357L0 18.3766L1.62355 24.4316L6.39328 23.155L6.39503 23.1551ZM34.9478 22.463C34.7307 21.6563 33.9378 21.1624 33.1875 21.3641L33.0559 21.3983L31.2016 21.8939C31.1093 21.9178 31.017 21.9298 30.9265 21.9298C30.4582 21.9298 30.0309 21.617 29.9045 21.1436C29.7541 20.5796 30.0891 19.9986 30.653 19.8482L31.7707 19.5492C31.1059 19.098 30.2839 18.922 29.4823 19.1356L0.955394 26.7831C0.712712 26.8463 0.569156 27.1129 0.640934 27.3744L1.12972 29.1996L8.6527 31.0795L15.9622 29.121L17.2508 25.0895C17.3601 24.746 17.637 24.4828 17.9857 24.3888L26.8023 22.0287C27.6996 21.7878 28.4481 22.7363 28.0072 23.5532L26.5323 26.2875L33.97 24.2931C34.722 24.0932 35.1595 23.2695 34.9458 22.4628L34.9478 22.463ZM16.3059 35L19.9581 34.0207L24.9807 24.7068L19.0932 26.2825L16.3058 34.9984L16.3059 35Z" fill="white"/>
</svg>

                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-white mb-1 font-urbanist">
                        Trivandrum Airport (TRV)
                      </h4>
                      <p className="text-white/80 text-sm font-urbanist">
                        Thiruvananthapuram International Airport
                      </p>
                      <p className="text-white/60 text-xs mt-1 font-urbanist">
                        Distance: ~55 km from resort
                      </p>
                    </div>
                    {bookingData.airportLocation === "trivandrum" && (
                      <CheckCircle className="w-6 h-6 text-[#B23092] flex-shrink-0" />
                    )}
                  </label>
                </div>
              </div>

              {/* Service Selection */}
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-white mb-6 font-urbanist">
                  Select Services
                </h3>

                {/* Pickup Service */}
                <div className="mb-6">
                  <label
                    className={`flex items-center gap-4 p-6 rounded-xl cursor-pointer transition-all bg-white/5 border-2 ${
                      bookingData.pickup
                        ? "border-[#B23092]"
                        : "border-white/20 hover:border-[#B23092]/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={bookingData.pickup}
                      onChange={(e) => handlePickupChange(e.target.checked)}
                      className="w-5 h-5 text-[#B23092] rounded border-white/30 focus:ring-[#B23092] focus:ring-offset-0 bg-transparent cursor-pointer"
                    />
                    <div className="w-12 h-12 bg-[#B23092] rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg width="31" height="15" viewBox="0 0 31 15" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M28.5006 4.2186L25.0369 0.740165C24.5721 0.264935 23.9405 -0.00132412 23.2843 4.95192e-06H15.1668C14.5861 4.95192e-06 14.0236 0.207675 13.577 0.585753L9.24359 4.22913L4.53653 5.06113C3.25658 5.33536 2.10809 6.0502 1.28258 7.08722C0.457039 8.12424 0.00393338 9.41815 0 10.7548C0.00130202 11.4137 0.52214 11.9476 1.16668 11.9515H4.23965C4.48445 13.7007 5.95061 15 7.67837 15C9.40612 15 10.8724 13.7007 11.1171 11.9515H20.7072C20.952 13.7007 22.4169 15 24.1446 15C25.8738 15 27.3386 13.7007 27.5833 11.9515H28.1666C29.7318 11.9502 31 10.6523 31 9.05085V7.0953C30.9987 5.6283 29.9245 4.39294 28.5 4.21856L28.5006 4.2186ZM21.3272 1.02237H23.2842C23.6788 1.02104 24.0577 1.18078 24.3376 1.46567L27.0447 4.19198H21.3273L21.3272 1.02237ZM14.2074 1.36316C14.4796 1.14085 14.8181 1.01971 15.1671 1.02237H20.3271V4.19863H10.857L14.2074 1.36316ZM7.67733 13.9724C6.67602 13.967 5.77758 13.3467 5.39867 12.4002C5.01976 11.4537 5.2346 10.3661 5.94424 9.6446C6.65259 8.92309 7.7177 8.71009 8.64088 9.10282C9.56536 9.49551 10.1669 10.4181 10.1669 11.4404C10.1669 12.114 9.90391 12.761 9.43645 13.2362C8.96902 13.7114 8.33617 13.9763 7.67733 13.9724ZM24.1475 13.9724C23.1449 13.9724 22.2426 13.356 21.8584 12.4095C21.4756 11.4631 21.6879 10.3741 22.3962 9.64992C23.1046 8.92574 24.1697 8.70876 25.0955 9.10145C26.02 9.49282 26.6241 10.4167 26.6241 11.4404C26.6215 12.8382 25.5148 13.971 24.1475 13.9724Z" fill="white"/>
</svg>

                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-lg font-bold text-white font-urbanist">
                          Airport Pickup Service
                        </h4>
                        <span className="text-[#B23092] text-xl font-bold font-urbanist">
                          Rs.1500
                        </span>
                      </div>
                      <p className="text-white/70 text-sm font-urbanist">
                        Professional pickup service from airport to resort
                      </p>
                    </div>
                  </label>

                  {bookingData.pickup && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 p-6 bg-white/5 rounded-lg border border-white/10"
                    >
                      <h5 className="font-semibold text-white mb-4 font-urbanist">
                        Pickup Details
                      </h5>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2 font-urbanist">
                            Flight Number *
                          </label>
                          <input
                            type="text"
                            required
                            value={
                              bookingData.pickupDetails?.flightNumber || ""
                            }
                            onChange={(e) => {
                              setBookingData((prev) => ({
                                ...prev,
                                pickupDetails: {
                                  ...prev.pickupDetails,
                                  flightNumber: e.target.value.toUpperCase(),
                                },
                              }));
                              clearFieldError("pickup");
                            }}
                            placeholder="AI123"
                            className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:ring-[#B23092] focus:border-[#B23092] font-urbanist ${
                              errors.pickup &&
                              !bookingData.pickupDetails?.flightNumber
                                ? "border-red-400"
                                : "border-white/20"
                            }`}
                            maxLength={10}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2 font-urbanist">
                            Arrival Date & Time *
                          </label>
                          <input
                            type="datetime-local"
                            required
                            value={bookingData.pickupDetails?.arrivalTime || ""}
                            onChange={(e) => {
                              setBookingData((prev) => ({
                                ...prev,
                                pickupDetails: {
                                  ...prev.pickupDetails,
                                  arrivalTime: e.target.value,
                                },
                              }));
                              clearFieldError("pickup");
                            }}
                            min={new Date().toISOString().slice(0, 16)}
                            className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white focus:ring-[#B23092] focus:border-[#B23092] font-urbanist ${
                              errors.pickup &&
                              !bookingData.pickupDetails?.arrivalTime
                                ? "border-red-400"
                                : "border-white/20"
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2 font-urbanist">
                            Terminal *
                          </label>
                          <div className="relative">
                            <select
                              required
                              value={bookingData.pickupDetails?.terminal || ""}
                              onChange={(e) => {
                                setBookingData((prev) => ({
                                  ...prev,
                                  pickupDetails: {
                                    ...prev.pickupDetails,
                                    terminal: e.target.value as
                                      | "T1"
                                      | "T2"
                                      | "T3",
                                  },
                                }));
                                clearFieldError("pickup");
                              }}
                              className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white focus:ring-[#B23092] focus:border-[#B23092] appearance-none font-urbanist ${
                                errors.pickup &&
                                !bookingData.pickupDetails?.terminal
                                  ? "border-red-400"
                                  : "border-white/20"
                              }`}
                            >
                              <option value="" className="bg-black text-white">
                                Select Terminal
                              </option>
                              <option
                                value="T1"
                                className="bg-black text-white"
                              >
                                Terminal 1
                              </option>
                              <option
                                value="T2"
                                className="bg-black text-white"
                              >
                                Terminal 2
                              </option>
                              <option
                                value="T3"
                                className="bg-black text-white"
                              >
                                Terminal 3
                              </option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                      {errors.pickup && (
                        <div className="mt-3 p-3 bg-red-500/20 border border-red-400/50 rounded-lg">
                          <p className="text-red-300 text-sm font-medium font-urbanist">
                            {errors.pickup}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Drop Service */}
                <div className="mb-6">
                  <label
                    className={`flex items-center gap-4 p-6 rounded-xl cursor-pointer transition-all bg-white/5 border-2 ${
                      bookingData.drop
                        ? "border-[#B23092]"
                        : "border-white/20 hover:border-[#B23092]/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={bookingData.drop}
                      onChange={(e) => handleDropChange(e.target.checked)}
                      className="w-5 h-5 text-[#B23092] rounded border-white/30 focus:ring-[#B23092] focus:ring-offset-0 bg-transparent cursor-pointer"
                    />
                    <div className="w-12 h-12 bg-[#B23092] rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg width="31" height="15" viewBox="0 0 31 15" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M28.5006 4.2186L25.0369 0.740165C24.5721 0.264935 23.9405 -0.00132412 23.2843 4.95192e-06H15.1668C14.5861 4.95192e-06 14.0236 0.207675 13.577 0.585753L9.24359 4.22913L4.53653 5.06113C3.25658 5.33536 2.10809 6.0502 1.28258 7.08722C0.457039 8.12424 0.00393338 9.41815 0 10.7548C0.00130202 11.4137 0.52214 11.9476 1.16668 11.9515H4.23965C4.48445 13.7007 5.95061 15 7.67837 15C9.40612 15 10.8724 13.7007 11.1171 11.9515H20.7072C20.952 13.7007 22.4169 15 24.1446 15C25.8738 15 27.3386 13.7007 27.5833 11.9515H28.1666C29.7318 11.9502 31 10.6523 31 9.05085V7.0953C30.9987 5.6283 29.9245 4.39294 28.5 4.21856L28.5006 4.2186ZM21.3272 1.02237H23.2842C23.6788 1.02104 24.0577 1.18078 24.3376 1.46567L27.0447 4.19198H21.3273L21.3272 1.02237ZM14.2074 1.36316C14.4796 1.14085 14.8181 1.01971 15.1671 1.02237H20.3271V4.19863H10.857L14.2074 1.36316ZM7.67733 13.9724C6.67602 13.967 5.77758 13.3467 5.39867 12.4002C5.01976 11.4537 5.2346 10.3661 5.94424 9.6446C6.65259 8.92309 7.7177 8.71009 8.64088 9.10282C9.56536 9.49551 10.1669 10.4181 10.1669 11.4404C10.1669 12.114 9.90391 12.761 9.43645 13.2362C8.96902 13.7114 8.33617 13.9763 7.67733 13.9724ZM24.1475 13.9724C23.1449 13.9724 22.2426 13.356 21.8584 12.4095C21.4756 11.4631 21.6879 10.3741 22.3962 9.64992C23.1046 8.92574 24.1697 8.70876 25.0955 9.10145C26.02 9.49282 26.6241 10.4167 26.6241 11.4404C26.6215 12.8382 25.5148 13.971 24.1475 13.9724Z" fill="white"/>
</svg>

                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-lg font-bold text-white font-urbanist">
                          Airport Drop Service
                        </h4>
                        <span className="text-[#B23092] text-xl font-bold font-urbanist">
                          Rs.1500
                        </span>
                      </div>
                      <p className="text-white/70 text-sm font-urbanist">
                        Safe drop service from resort to airport
                      </p>
                    </div>
                  </label>

                  {bookingData.drop && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 p-6 bg-white/5 rounded-lg border border-white/10"
                    >
                      <h5 className="font-semibold text-white mb-4 font-urbanist">
                        Drop Details
                      </h5>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2 font-urbanist">
                            Flight Number *
                          </label>
                          <input
                            type="text"
                            required
                            value={bookingData.dropDetails?.flightNumber || ""}
                            onChange={(e) => {
                              setBookingData((prev) => ({
                                ...prev,
                                dropDetails: {
                                  ...prev.dropDetails,
                                  flightNumber: e.target.value.toUpperCase(),
                                },
                              }));
                              clearFieldError("drop");
                            }}
                            placeholder="AI456"
                            className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:ring-[#B23092] focus:border-[#B23092] font-urbanist ${
                              errors.drop &&
                              !bookingData.dropDetails?.flightNumber
                                ? "border-red-400"
                                : "border-white/20"
                            }`}
                            maxLength={10}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2 font-urbanist">
                            Departure Date & Time *
                          </label>
                          <input
                            type="datetime-local"
                            required
                            value={bookingData.dropDetails?.departureTime || ""}
                            onChange={(e) => {
                              setBookingData((prev) => ({
                                ...prev,
                                dropDetails: {
                                  ...prev.dropDetails,
                                  departureTime: e.target.value,
                                },
                              }));
                              clearFieldError("drop");
                            }}
                            min={new Date().toISOString().slice(0, 16)}
                            className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white focus:ring-[#B23092] focus:border-[#B23092] font-urbanist ${
                              errors.drop &&
                              !bookingData.dropDetails?.departureTime
                                ? "border-red-400"
                                : "border-white/20"
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2 font-urbanist">
                            Terminal *
                          </label>
                          <div className="relative">
                            <select
                              required
                              value={bookingData.dropDetails?.terminal || ""}
                              onChange={(e) => {
                                setBookingData((prev) => ({
                                  ...prev,
                                  dropDetails: {
                                    ...prev.dropDetails,
                                    terminal: e.target.value as
                                      | "T1"
                                      | "T2"
                                      | "T3",
                                  },
                                }));
                                clearFieldError("drop");
                              }}
                              className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white focus:ring-[#B23092] focus:border-[#B23092] appearance-none font-urbanist ${
                                errors.drop &&
                                !bookingData.dropDetails?.terminal
                                  ? "border-red-400"
                                  : "border-white/20"
                              }`}
                            >
                              <option value="" className="bg-black text-white">
                                Select Terminal
                              </option>
                              <option
                                value="T1"
                                className="bg-black text-white"
                              >
                                Terminal 1
                              </option>
                              <option
                                value="T2"
                                className="bg-black text-white"
                              >
                                Terminal 2
                              </option>
                              <option
                                value="T3"
                                className="bg-black text-white"
                              >
                                Terminal 3
                              </option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                      {errors.drop && (
                        <div className="mt-3 p-3 bg-red-500/20 border border-red-400/50 rounded-lg">
                          <p className="text-red-300 text-sm font-medium font-urbanist">
                            {errors.drop}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Show Drop Option hint when only pickup is selected */}
                {bookingData.pickup && !bookingData.drop && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-[#B23092]/20 border border-[#B23092]/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Car className="w-5 h-5 text-[#B23092]" />
                      <p className="text-white/90 font-urbanist">
                        <strong className="text-[#B23092]">Tip:</strong> You can
                        also add drop service for your return journey!
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Summary and Submit */}
              {(bookingData.pickup || bookingData.drop) && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-t border-white/20 pt-8"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2 font-urbanist">
                        Booking Summary
                      </h4>
                      <div className="space-y-1 text-white/80 font-urbanist">
                        {bookingData.pickup && <p>✓ Airport Pickup - ₹1,500</p>}
                        {bookingData.drop && <p>✓ Airport Drop - ₹1,500</p>}
                        <p className="font-semibold text-white text-xl font-urbanist">
                          Total Amount: ₹{totalAmount.toLocaleString()}
                        </p>
                      </div>
                      {errors.general && (
                        <div className="mt-3 p-3 bg-red-500/20 border border-red-400/50 rounded-lg">
                          <p className="text-red-300 text-sm font-medium font-urbanist">
                            {errors.general}
                          </p>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        (!bookingData.pickup && !bookingData.drop)
                      }
                      className="group bg-[#B23092] hover:bg-[#9a2578] text-white px-8 py-4 rounded-full text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 transition-all duration-300 font-urbanist"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Proceed to Payment
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </form>
          </motion.div>
        </div>
      </section>

      {/* Service Features */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-black">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/frame1.png?updatedAt=1762760253595"
            alt="Service Features Background"
            className="w-full h-full object-cover"
          />
          {/* <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-black/80"></div> */}
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-[100px] 2xl:px-[120px]">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-2 font-annie-telescope">
              Reliable Airport Transfers{" "}
              <span
                className="text-5xl md:text-6xl font-water-brush"
                style={{ color: "#B23092" }}
              >
                Every Time
              </span>
            </h2>
            <p className="text-lg md:text-xl text-white/90 mt-4 font-urbanist max-w-3xl mx-auto">
              Expert drivers, live tracking, and on-time pickups for your peace
              of mind.
            </p>
          </motion.div>

          {/* Service Cards */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {/* Card 1: Professional Drivers */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative rounded-2xl overflow-hidden group"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src="https://images.unsplash.com/photo-1502877338535-766e1452684a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Car interior"
                  className="w-full h-full object-cover opacity-100 group-hover:opacity-40 transition-opacity duration-300"
                />
              </div>

              {/* Glassmorphism Card */}
              <div className="relative bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-8 h-full">
                {/* Icon */}
                <div className="w-20 h-20 bg-[#B23092] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg width="27" height="30" viewBox="0 0 27 30" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6.72711 6.99679C8.65722 7.00892 10.2283 5.44454 10.2408 3.51678C10.2479 1.58127 8.68554 0.00643854 6.75508 3.40396e-05C4.81958 -0.00839294 3.24811 1.54891 3.24272 3.4797C3.23328 5.41825 4.78856 6.99342 6.72711 6.99679Z" fill="white"/>
<path d="M4.21921 8.43135C4.23707 8.41045 4.25628 8.39056 4.27449 8.37033L1.86909 5.9646L0.916504 6.91719L3.57336 9.57404C3.71426 9.15505 3.92999 8.76876 4.21921 8.43135Z" fill="white"/>
<path d="M10.9479 14.4424C11.349 14.8533 11.9318 15.0758 12.5443 14.9895L18.6208 14.131C19.1419 14.0575 19.5815 13.7743 19.8683 13.3796L19.0475 15.5817C18.9141 15.9407 19.0967 16.3402 19.4554 16.4737C19.8141 16.6075 20.2138 16.4248 20.3473 16.0658L22.6661 9.84195C22.7996 9.48296 22.6169 9.08353 22.2582 8.95004C21.8996 8.81622 21.4998 8.99892 21.3663 9.35791L20.2179 12.4405C20.2297 12.3036 20.2273 12.1638 20.2074 12.0218C20.0635 11.0015 19.119 10.2909 18.0983 10.4349L13.0947 11.1417L9.39257 8.72858C7.56257 6.52274 3.41751 7.92768 3.95549 11.3723L5.80133 20.5944C5.81616 20.6696 5.83369 20.7441 5.85324 20.8179L11.1616 15.5096L10.9479 14.4424Z" fill="white"/>
<path d="M25.582 26.8143L17.5022 18.7345C17.1429 18.3752 16.6726 18.1938 16.2014 18.1891C16.2129 18.1851 16.2236 18.1807 16.2351 18.177L11.694 18.1699L11.4793 17.0977L6.49756 22.0797C7.04666 22.7424 7.87891 23.1907 8.95251 23.1907H16.435L16.6844 23.1954L22.9426 29.4536C23.6714 30.1821 24.8532 30.1821 25.582 29.4536C26.3107 28.7249 26.3107 27.5431 25.582 26.8143Z" fill="white"/>
<path d="M4.58273 22.0891C4.46172 21.814 4.36835 21.5258 4.30869 21.2289L2.99475 14.1566C2.58689 11.9042 -0.376041 12.4409 0.0399144 14.6963L1.31003 21.7341C1.79913 24.2862 3.65576 26.4907 6.32408 27.2885C7.01139 27.4881 7.71217 27.5906 8.39611 27.5906L12.9076 27.6104C15.197 27.6199 15.2122 24.6145 12.9339 24.632L8.64723 24.6084C8.17734 24.5734 7.68892 24.5562 7.21363 24.4139C6.46599 24.1911 5.82858 23.7765 5.33644 23.2416L6.49802 22.08C6.19363 21.7122 5.97655 21.2791 5.85386 20.819L4.58273 22.0891Z" fill="white"/>
</svg>

                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white text-center mb-4 font-annie-telescope">
                  Professional Drivers
                </h3>
                <p className="text-white/90 text-center leading-relaxed font-urbanist">
                  Licensed, experienced drivers with airport pickup expertise
                </p>
              </div>
            </motion.div>

            {/* Card 2: Flight Tracking */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative rounded-2xl overflow-hidden group"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Flight tracking"
                  className="w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-300"
                />
              </div>

              {/* Glassmorphism Card */}
              <div className="relative bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-8 h-full">
                {/* Icon */}
                <div className="w-20 h-20 bg-[#B23092] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M24.6184 1.95714L19.3526 7.2081L15.256 6.04107L16.51 4.79104C16.8855 4.41668 16.8855 3.83235 16.51 3.45801C16.1344 3.08365 15.5483 3.08365 15.1728 3.45801L13.1661 5.45839L2.17272 2.37565L0.417524 4.12536L14.4626 11.9997C9.86479 16.7086 6.98154 20.3333 6.98154 20.3333L1.25558 19.0002L0 20.3333L5.26743 22.9587C5.26743 22.9587 4.43146 24.7084 4.84945 25.1674C5.26743 25.5841 7.0651 24.7507 7.0651 24.7507L9.6971 30L11.0343 28.667L9.6971 22.9589C9.6971 22.9589 13.3332 20.0845 18.0568 15.5012L25.9558 29.5024L27.711 27.7527L24.6186 16.7937L26.6253 14.7933C27.0008 14.4189 27.0008 13.8346 26.6253 13.4603C26.2497 13.0859 25.6636 13.0859 25.2881 13.4603L24.0341 14.7103L22.8634 10.6265L28.1308 5.37556C28.1308 5.37556 30.4298 3.0415 29.9285 0.0416754C26.9602 -0.334309 24.6189 1.95743 24.6189 1.95743L24.6184 1.95714Z" fill="white"/>
</svg>

                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white text-center mb-4 font-annie-telescope">
                  Flight Tracking
                </h3>
                <p className="text-white/90 text-center leading-relaxed font-urbanist">
                  Real-time flight monitoring and delay notifications
                </p>
              </div>
            </motion.div>

            {/* Card 3: Meet & Greet */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative rounded-2xl overflow-hidden group"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src="https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Meet and greet"
                  className="w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-300"
                />
              </div>

              {/* Glassmorphism Card */}
              <div className="relative bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-8 h-full">
                {/* Icon */}
                <div className="w-20 h-20 bg-[#B23092] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg width="41" height="24" viewBox="0 0 41 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M30.9199 1.87305C30.9199 1.87305 30.3003 2.55773 28.1808 2.19944L20.192 0.733533C20.192 0.733533 19.1465 0.67375 18.1355 1.1302L13.7002 2.68094C13.7002 2.68094 11.3225 4.53139 9.30079 6.68319C9.30079 6.68319 8.61771 8.06791 11.1937 7.90512C11.1937 7.90512 14.1607 7.12228 15.1713 5.81835C15.1713 5.81835 18.0228 4.69742 18.823 4.97048L29.8119 12.3392C29.8119 12.3392 31.8009 14.2959 31.9629 15.0133C31.9629 15.0133 33.9188 13.2521 34.6362 12.4697L36.4948 11.5568C36.4948 11.5568 33.3004 2.52502 30.9199 1.87305Z" fill="white"/>
<path d="M6.0436 15.707C6.0436 15.707 5.22844 17.7611 6.4023 18.3803C6.4023 18.3803 7.21747 18.9672 8.29317 18.3157L8.6846 17.6306C8.6846 17.6306 6.59781 15.8044 6.0436 15.707Z" fill="white"/>
<path d="M10.963 20.204L11.6275 18.6424C11.6275 18.6424 11.8872 17.3559 10.6164 16.9891C10.6164 16.9891 9.51891 16.6211 9.34561 17.2028L8.50702 18.5814C8.50702 18.5814 8.30505 19.5303 8.53611 19.8369C8.53611 19.8369 9.02731 20.6633 9.54678 20.7554C9.54678 20.7554 10.4427 20.9699 10.963 20.204Z" fill="white"/>
<path d="M13.8163 21.5641L14.4845 19.973C14.4845 19.973 14.7458 18.6626 13.4677 18.289C13.4677 18.289 12.3637 17.9137 12.1896 18.5067L11.347 19.9104C11.347 19.9104 11.1438 20.8778 11.3757 21.1893C11.3757 21.1893 11.8697 22.0311 12.3924 22.1256C12.3924 22.1256 13.2932 22.3433 13.8163 21.5641Z" fill="white"/>
<path d="M17.9323 23.4457C17.9323 23.4457 16.5269 22.3999 16.4025 22.1915C16.4025 22.1915 15.6528 20.9376 14.7471 21.3254C14.7471 21.3254 13.4355 21.7734 13.9663 22.8487L15.2157 23.9236C15.2157 23.9236 15.965 24.2819 17.9323 23.4457Z" fill="white"/>
<path d="M8.0531 3.83235C8.0531 3.83235 9.34047 4.33445 9.74846 4.30294L11.1506 4.41928C11.1506 4.41928 10.1338 5.40085 9.97709 5.49538L8.73779 6.73427C8.73779 6.73427 8.5035 8.15129 10.0732 8.40214C10.0732 8.40214 11.9568 8.59038 14.9392 6.39294C14.9392 6.39294 16.7456 5.62666 17.5757 5.48245L18.6409 5.57576L29.4113 12.7655C29.4113 12.7655 31.3886 14.555 31.4827 15.4651C31.4827 15.4651 32.0155 16.9722 30.7609 17.9453C30.7609 17.9453 30.2265 18.7616 28.6579 17.8516L23.6971 14.3983C23.6971 14.3983 27.2453 17.0041 27.4332 18.5112C27.4332 18.5112 27.7151 19.1389 27.0563 20.3944C27.0563 20.3944 26.4601 21.4923 24.7639 21.1162L21.3744 18.1028L21.1284 18.1868C21.1284 18.1868 24.2703 21.3105 24.3014 21.468C24.3014 21.468 25.0479 23.1876 22.1282 22.9364L19.145 20.6448L17.9837 20.1427L17.827 20.2372C17.827 20.2372 19.3127 21.0746 21.1648 22.8019C21.1648 22.8019 21.0925 23.9103 18.9257 23.659L16.54 21.9637C16.54 21.9637 16.1514 20.5333 14.7699 20.7216C14.7699 20.7216 15.7212 18.7689 14.183 18.0152C14.183 18.0152 13.0552 17.4751 12.1766 18.0083C12.1766 18.0083 12.114 16.4697 10.6699 16.3137C10.6699 16.3137 9.35138 15.9995 9.03711 17.2234L5.44482 14.559C5.44482 14.559 7.61361 3.29874 8.0531 3.83235Z" fill="white"/>
<path d="M7.35382 3.2936C7.35382 3.2936 4.69586 12.7543 4.79402 14.5801L0 13.7436L3.58623 2.05713L7.35382 3.2936Z" fill="white"/>
<path d="M31.3296 1.53256C31.3296 1.53256 33.3186 2.34771 35.1453 6.55355C35.1453 6.55355 37.1343 11.4768 37.1343 11.9987L40.3945 11.0203C40.3945 11.0203 37.5576 2.5105 34.7534 0L31.3296 1.53256Z" fill="white"/>
</svg>

                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white text-center mb-4 font-annie-telescope">
                  Meet & Greet
                </h3>
                <p className="text-white/90 text-center leading-relaxed font-urbanist">
                  Personal assistance at arrivals with name board
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}