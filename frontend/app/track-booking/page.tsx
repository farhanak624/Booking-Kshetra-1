"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Calendar,
  Users,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Car,
  Activity,
  Home,
  Download,
  Plane,
  Info,
  User,
  Tag,
  Receipt,
  Copy,
  Building,
} from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { bookingAPI } from "../../lib/api";
import toast from "react-hot-toast";

interface BookingDetails {
  _id: string;
  userId?: string | null;
  guestEmail?: string;
  checkIn: string;
  checkOut: string;
  guests: Array<{
    _id: string;
    name: string;
    age: number;
    isChild: boolean;
    gender?: string;
  }>;
  totalGuests: number;
  adults: number;
  children: number;
  primaryGuestInfo?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  includeFood: boolean;
  includeBreakfast: boolean;
  transport?: {
    _id: string;
    pickup: boolean;
    drop: boolean;
    airportFrom?: string;
    airportTo?: string;
    pickupTerminal?: string;
    dropTerminal?: string;
    flightNumber?: string;
    flightArrivalTime?: string;
    flightDepartureTime?: string;
    arrivalTime?: string;
    departureTime?: string;
    specialInstructions?: string;
  };
  selectedServices: Array<{
    serviceId: {
      _id: string;
      name: string;
      category: string;
      price: number;
      description: string;
    };
    quantity: number;
    totalPrice: number;
    details?: any;
  }>;
  yogaSessionId?:
    | string
    | {
        _id: string;
        type: string;
        batchName: string;
        startDate: string;
        endDate: string;
        instructor: string;
        schedule: any;
        description: string;
        location: string;
        specialization: string;
      };
  roomId?: {
    _id: string;
    roomNumber: string;
    roomType: string;
    description: string;
    pricePerNight: number;
    amenities: string[];
    images: string[];
  } | null;
  roomPrice: number;
  foodPrice: number;
  breakfastPrice: number;
  servicesPrice: number;
  transportPrice: number;
  yogaPrice: number;
  totalAmount: number;
  couponCode?: string;
  couponDiscount?: number;
  finalAmount?: number;
  status: "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentId?: string;
  specialRequests?: string;
  bookingType?:
    | "room"
    | "yoga"
    | "transport"
    | "adventure"
    | "service"
    | "package";
  bookingCategory?: "accommodation" | "activity" | "transport" | "mixed";
  primaryService?: string;
  createdAt: string;
  updatedAt: string;
}

const TrackBookingPage = () => {
  const [bookingId, setBookingId] = useState("");
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCopyBookingId = () => {
    if (booking) {
      navigator.clipboard.writeText(booking._id);
      toast.success("Booking ID copied to clipboard!");
    }
  };

  const handleSearch = async () => {
    if (!bookingId.trim()) {
      setError("Please enter a booking ID");
      return;
    }

    setLoading(true);
    setError(null);
    setBooking(null);

    try {
      const response = await bookingAPI.getPublicBookingById(bookingId.trim());

      if (response.data?.success) {
        setBooking(response.data.data.booking);
      } else {
        setError(response.data?.message || "Booking not found");
      }
    } catch (err: any) {
      console.error("Error fetching booking:", err);
      setError(
        "Failed to fetch booking details. Please check your booking ID and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "checked_in":
        return <Home className="w-5 h-5 text-blue-600" />;
      case "checked_out":
        return <CheckCircle className="w-5 h-5 text-gray-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "checked_in":
        return "bg-blue-100 text-blue-800";
      case "checked_out":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <main>
        {/* Hero Section with Background Image */}
        <section className="relative min-h-screen overflow-hidden w-full">
          {/* Background Image */}
          <div className="absolute inset-0 w-full min-h-full">
            <img
              src="/carousal/airpotbg3.png"
              alt="Track Your Booking"
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
                  Track Your
                </h1>
                <h2 className="text-5xl md:text-6xl font-bold text-[#B23092] mb-6 font-water-brush">
                  Booking
                </h2>
                <p className="text-white/90 text-lg md:text-xl font-urbanist max-w-2xl mx-auto">
                  Enter your booking ID to view all details about your reservation, including room information, services, and payment status.
                </p>
              </motion.div>

              {/* Search Section */}
              <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-[100px] 2xl:px-[120px] max-w-4xl">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4 font-annie-telescope">
                      Enter Your Booking ID
                    </h2>
                    <p className="text-white/70 font-urbanist">
                      You can find your booking ID in the confirmation email or receipt you received after booking.
                    </p>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
                    <input
                      type="text"
                      value={bookingId}
                      onChange={(e) => setBookingId(e.target.value)}
                      placeholder="Enter your booking ID (e.g., 68dcc2ec59e880899e1bbb9c)"
                      className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:ring-2 focus:ring-[#B23092] focus:border-[#B23092] transition-colors"
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <button
                      onClick={handleSearch}
                      disabled={loading}
                      className="px-8 py-3 bg-[#B23092] text-white rounded-lg hover:bg-[#9a2578] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-urbanist font-semibold"
                    >
                      <Search className="w-5 h-5" />
                      {loading ? "Searching..." : "Track Booking"}
                    </button>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-6 p-4 bg-red-500/20 backdrop-blur-sm border border-red-500/50 rounded-lg text-red-300 text-center font-urbanist"
                    >
                      {error}
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Booking Details Section */}
        <section className="py-16 bg-black">
          <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-[100px] 2xl:px-[120px] max-w-4xl">

            {booking && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                {/* Status Overview */}
                <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/20 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-white font-annie-telescope">
                      Booking Overview
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white/70 font-mono">
                        {booking._id}
                      </span>
                      <button
                        onClick={handleCopyBookingId}
                        className="p-1 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
                        title="Copy Booking ID"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(booking.status)}
                      <div>
                        <p className="text-sm text-white/70 font-urbanist">Booking Status</p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status.charAt(0).toUpperCase() +
                            booking.status.slice(1).replace("_", " ")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-[#B23092]" />
                      <div>
                        <p className="text-sm text-white/70 font-urbanist">Payment Status</p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(
                            booking.paymentStatus
                          )}`}
                        >
                          {booking.paymentStatus.charAt(0).toUpperCase() +
                            booking.paymentStatus.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Tag className="w-5 h-5 text-[#B23092]" />
                      <div>
                        <p className="text-sm text-white/70 font-urbanist">Booking Type</p>
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-[#B23092]/20 text-[#B23092] border border-[#B23092]/30">
                          {booking.primaryService ||
                            (booking.bookingType ?
                              booking.bookingType.charAt(0).toUpperCase() + booking.bookingType.slice(1) :
                              "General")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {booking.finalAmount !== booking.totalAmount &&
                    booking.couponCode && (
                      <div className="mt-6 p-4 bg-[#B23092]/20 border border-[#B23092]/30 rounded-lg backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <Tag className="w-4 h-4 text-[#B23092]" />
                          <span className="font-semibold text-white font-annie-telescope">
                            Coupon Applied
                          </span>
                        </div>
                        <p className="text-sm text-white/90 font-urbanist">
                          Coupon{" "}
                          <span className="font-mono font-bold text-[#B23092]">
                            {booking.couponCode}
                          </span>{" "}
                          saved you ₹{booking.couponDiscount?.toLocaleString()}
                        </p>
                      </div>
                    )}
                </div>

                  {/* Guest Information */}
                <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/20 p-6">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 font-annie-telescope">
                    <Users className="w-5 h-5 text-[#B23092]" />
                    Guest Information
                  </h3>

                  {/* Primary Guest Details */}
                  {booking.primaryGuestInfo && (
                    <div className="mb-6 p-4 bg-[#B23092]/20 border border-[#B23092]/30 rounded-lg backdrop-blur-sm">
                      <h4 className="font-semibold text-white mb-3 flex items-center gap-2 font-annie-telescope">
                        <User className="w-4 h-4 text-[#B23092]" />
                        Primary Guest
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-white/70 font-urbanist">Full Name</p>
                          <p className="font-medium text-white font-urbanist">
                            {booking.primaryGuestInfo.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-white/70 font-urbanist">Email</p>
                          <p className="font-medium text-white font-urbanist">
                            {booking.primaryGuestInfo.email}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-white/70 font-urbanist">Phone</p>
                          <p className="font-medium text-white font-urbanist">
                            {booking.primaryGuestInfo.phone}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-white/70 font-urbanist">Location</p>
                          <p className="font-medium text-white font-urbanist">
                            {booking.primaryGuestInfo.city},{" "}
                            {booking.primaryGuestInfo.state}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm text-white/70 font-urbanist">Address</p>
                          <p className="font-medium text-white font-urbanist">
                            {booking.primaryGuestInfo.address},{" "}
                            {booking.primaryGuestInfo.city},{" "}
                            {booking.primaryGuestInfo.state} -{" "}
                            {booking.primaryGuestInfo.pincode}
                          </p>
                        </div>
                        {booking.primaryGuestInfo.emergencyContact?.name && (
                          <div className="md:col-span-2">
                            <p className="text-sm text-white/70 font-urbanist">
                              Emergency Contact
                            </p>
                            <p className="font-medium text-white font-urbanist">
                              {booking.primaryGuestInfo.emergencyContact.name} (
                              {
                                booking.primaryGuestInfo.emergencyContact
                                  .relationship
                              }
                              ) -{" "}
                              {booking.primaryGuestInfo.emergencyContact.phone}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Guest Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
                      <p className="text-2xl font-bold text-white font-annie-telescope">
                        {booking.totalGuests}
                      </p>
                      <p className="text-sm text-white/70 font-urbanist">Total Guests</p>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
                      <p className="text-2xl font-bold text-[#B23092] font-annie-telescope">
                        {booking.adults}
                      </p>
                      <p className="text-sm text-white/70 font-urbanist">Adults</p>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
                      <p className="text-2xl font-bold text-[#B23092] font-annie-telescope">
                        {booking.children}
                      </p>
                      <p className="text-sm text-white/70 font-urbanist">Children</p>
                    </div>
                  </div>

                  {/* All Guests List */}
                </div>

                {/* Booking Details */}
                <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/20 p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 font-annie-telescope">
                    <Calendar className="w-5 h-5 text-[#B23092]" />
                    Booking Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <p className="text-sm text-white/70 font-urbanist">Check-in Date</p>
                      <p className="font-medium text-white font-urbanist">
                        {formatDateOnly(booking.checkIn)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-white/70 font-urbanist">Check-out Date</p>
                      <p className="font-medium text-white font-urbanist">
                        {formatDateOnly(booking.checkOut)}
                      </p>
                    </div>
                  </div>

                  {/* Room Information */}
                  {booking.roomId && (
                    <div className="mb-6 p-4 bg-[#B23092]/20 border border-[#B23092]/30 rounded-lg backdrop-blur-sm">
                      <h4 className="font-semibold text-white mb-2 flex items-center gap-2 font-annie-telescope">
                        <Home className="w-4 h-4 text-[#B23092]" />
                        Room Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-white/70 font-urbanist">Room Number</p>
                          <p className="font-medium text-white font-urbanist">
                            {booking.roomId.roomNumber}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-white/70 font-urbanist">Room Type</p>
                          <p className="font-medium text-white font-urbanist">
                            {booking.roomId.roomType}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm text-white/70 font-urbanist">Description</p>
                          <p className="font-medium text-white font-urbanist">
                            {booking.roomId.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Yoga Session Information */}
                  {booking.bookingType === "yoga" && booking.yogaSessionId && (
                    <div className="mb-6 p-4 bg-[#B23092]/20 border border-[#B23092]/30 rounded-lg backdrop-blur-sm">
                      <h4 className="font-semibold text-white mb-2 flex items-center gap-2 font-annie-telescope">
                        <Activity className="w-4 h-4 text-[#B23092]" />
                        Yoga Session Information
                      </h4>
                      <p className="text-sm text-white/70 font-urbanist">
                        Session ID: {typeof booking.yogaSessionId === 'string'
                          ? booking.yogaSessionId
                          : booking.yogaSessionId?._id || 'N/A'}
                      </p>
                    </div>
                  )}

                  {/* Transport Information */}
                  {booking.transport &&
                    (booking.transport.pickup || booking.transport.drop) && (
                      <div className="mb-6 p-4 bg-[#B23092]/20 border border-[#B23092]/30 rounded-lg backdrop-blur-sm">
                        <h4 className="font-semibold text-white mb-2 flex items-center gap-2 font-annie-telescope">
                          <Car className="w-4 h-4 text-[#B23092]" />
                          Transport Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {booking.transport.pickup && (
                            <div>
                              <p className="text-sm text-white/70 font-urbanist">Pickup</p>
                              <p className="font-medium text-white font-urbanist">
                                From{" "}
                                {booking.transport.airportFrom || "Airport"}
                                {booking.transport.pickupTerminal &&
                                  ` (Terminal ${booking.transport.pickupTerminal})`}
                              </p>
                            </div>
                          )}
                          {booking.transport.drop && (
                            <div>
                              <p className="text-sm text-white/70 font-urbanist">Drop</p>
                              <p className="font-medium text-white font-urbanist">
                                To {booking.transport.airportTo || "Airport"}
                                {booking.transport.dropTerminal &&
                                  ` (Terminal ${booking.transport.dropTerminal})`}
                              </p>
                            </div>
                          )}
                          {booking.transport.flightNumber && (
                            <div>
                              <p className="text-sm text-white/70 font-urbanist">
                                Flight Number
                              </p>
                              <p className="font-medium text-white font-urbanist">
                                {booking.transport.flightNumber}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  {/* Special Requests */}
                  {booking.specialRequests && (
                    <div className="mb-6 p-4 bg-[#B23092]/20 border border-[#B23092]/30 rounded-lg backdrop-blur-sm">
                      <h4 className="font-semibold text-white mb-2 flex items-center gap-2 font-annie-telescope">
                        <Info className="w-4 h-4 text-[#B23092]" />
                        Special Requests
                      </h4>
                      <p className="text-white/90 font-urbanist">{booking.specialRequests}</p>
                    </div>
                  )}
                </div>

                {/* Pricing Breakdown */}
                <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/20 p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 font-annie-telescope">
                    <Receipt className="w-5 h-5 text-[#B23092]" />
                    Pricing Breakdown
                  </h3>

                  <div className="space-y-3">
                    {booking.roomPrice > 0 && (
                      <div className="flex justify-between">
                        <span className="text-white/70 font-urbanist">Room Charges</span>
                        <span className="font-medium text-white font-urbanist">
                          ₹{booking.roomPrice.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {booking.yogaPrice > 0 && (
                      <div className="flex justify-between">
                        <span className="text-white/70 font-urbanist">Yoga Session</span>
                        <span className="font-medium text-white font-urbanist">
                          ₹{booking.yogaPrice.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {booking.foodPrice > 0 && (
                      <div className="flex justify-between">
                        <span className="text-white/70 font-urbanist">Food</span>
                        <span className="font-medium text-white font-urbanist">
                          ₹{booking.foodPrice.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {booking.breakfastPrice > 0 && (
                      <div className="flex justify-between">
                        <span className="text-white/70 font-urbanist">Breakfast</span>
                        <span className="font-medium text-white font-urbanist">
                          ₹{booking.breakfastPrice.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {booking.servicesPrice > 0 && (
                      <div className="flex justify-between">
                        <span className="text-white/70 font-urbanist">
                          Additional Services
                        </span>
                        <span className="font-medium text-white font-urbanist">
                          ₹{booking.servicesPrice.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {booking.transportPrice > 0 && (
                      <div className="flex justify-between">
                        <span className="text-white/70 font-urbanist">Transport</span>
                        <span className="font-medium text-white font-urbanist">
                          ₹{booking.transportPrice.toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="border-t border-white/20 pt-3">
                      <div className="flex justify-between text-lg font-semibold text-white font-annie-telescope">
                        <span>Subtotal</span>
                        <span>₹{booking.totalAmount.toLocaleString()}</span>
                      </div>

                      {booking.couponDiscount && booking.couponDiscount > 0 && (
                        <div className="flex justify-between text-[#B23092] mt-2 font-urbanist">
                          <span>Discount ({booking.couponCode})</span>
                          <span>
                            -₹{booking.couponDiscount.toLocaleString()}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between text-xl font-bold mt-3 pt-3 border-t border-white/20 text-white font-annie-telescope">
                        <span>Final Amount</span>
                        <span className="text-[#B23092]">
                          ₹
                          {(
                            booking.finalAmount || booking.totalAmount
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {booking.paymentId && (
                    <div className="mt-6 p-4 bg-white/5 border border-white/20 rounded-lg backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-white/70 font-urbanist">Payment ID</p>
                          <p className="font-mono text-sm font-medium text-white">
                            {booking.paymentId}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-white/70 font-urbanist">Status</p>
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                              booking.paymentStatus
                            )}`}
                          >
                            {booking.paymentStatus.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Booking Timestamps */}
                <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/20 p-6">
                  <h3 className="text-xl font-bold text-white mb-4 font-annie-telescope">
                    Booking Timeline
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-white/70 font-urbanist">Booking Created</p>
                      <p className="font-medium text-white font-urbanist">
                        {formatDate(booking.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-white/70 font-urbanist">Last Updated</p>
                      <p className="font-medium text-white font-urbanist">
                        {formatDate(booking.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default TrackBookingPage;
