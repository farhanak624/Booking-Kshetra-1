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
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
          <div className="container mx-auto px-4 md:px-[100px] text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Track Your Booking
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Enter your booking ID to view all details about your
                reservation, including room information, services, and payment
                status.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Search Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-[100px] max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-8 mb-8"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Enter Your Booking ID
                </h2>
                <p className="text-gray-600">
                  You can find your booking ID in the confirmation email or
                  receipt you received after booking.
                </p>
              </div>

              <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
                <input
                  type="text"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  placeholder="Enter your booking ID (e.g., 68dcc2ec59e880899e1bbb9c)"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Search className="w-5 h-5" />
                  {loading ? "Searching..." : "Track Booking"}
                </button>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center"
                >
                  {error}
                </motion.div>
              )}
            </motion.div>

            {/* Booking Details */}
            {booking && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                {/* Status Overview */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">
                      Booking Overview
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 font-mono">
                        {booking._id}
                      </span>
                      <button
                        onClick={handleCopyBookingId}
                        className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
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
                        <p className="text-sm text-gray-600">Booking Status</p>
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
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Payment Status</p>
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
                      <Tag className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-600">Booking Type</p>
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
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
                      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Tag className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-green-800">
                            Coupon Applied
                          </span>
                        </div>
                        <p className="text-sm text-green-700">
                          Coupon{" "}
                          <span className="font-mono font-bold">
                            {booking.couponCode}
                          </span>{" "}
                          saved you ₹{booking.couponDiscount?.toLocaleString()}
                        </p>
                      </div>
                    )}
                </div>

                {/* Guest Information */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Guest Information
                  </h3>

                  {/* Primary Guest Details */}
                  {booking.primaryGuestInfo && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Primary Guest
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-blue-600">Full Name</p>
                          <p className="font-medium text-blue-900">
                            {booking.primaryGuestInfo.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-600">Email</p>
                          <p className="font-medium text-blue-900">
                            {booking.primaryGuestInfo.email}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-600">Phone</p>
                          <p className="font-medium text-blue-900">
                            {booking.primaryGuestInfo.phone}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-600">Location</p>
                          <p className="font-medium text-blue-900">
                            {booking.primaryGuestInfo.city},{" "}
                            {booking.primaryGuestInfo.state}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm text-blue-600">Address</p>
                          <p className="font-medium text-blue-900">
                            {booking.primaryGuestInfo.address},{" "}
                            {booking.primaryGuestInfo.city},{" "}
                            {booking.primaryGuestInfo.state} -{" "}
                            {booking.primaryGuestInfo.pincode}
                          </p>
                        </div>
                        {booking.primaryGuestInfo.emergencyContact?.name && (
                          <div className="md:col-span-2">
                            <p className="text-sm text-blue-600">
                              Emergency Contact
                            </p>
                            <p className="font-medium text-blue-900">
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
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">
                        {booking.totalGuests}
                      </p>
                      <p className="text-sm text-gray-600">Total Guests</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {booking.adults}
                      </p>
                      <p className="text-sm text-gray-600">Adults</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {booking.children}
                      </p>
                      <p className="text-sm text-gray-600">Children</p>
                    </div>
                  </div>

                  {/* All Guests List */}
                </div>

                {/* Booking Details */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Booking Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <p className="text-sm text-gray-600">Check-in Date</p>
                      <p className="font-medium text-gray-900">
                        {formatDateOnly(booking.checkIn)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Check-out Date</p>
                      <p className="font-medium text-gray-900">
                        {formatDateOnly(booking.checkOut)}
                      </p>
                    </div>
                  </div>

                  {/* Room Information */}
                  {booking.roomId && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        Room Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Room Number</p>
                          <p className="font-medium">
                            {booking.roomId.roomNumber}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Room Type</p>
                          <p className="font-medium">
                            {booking.roomId.roomType}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-600">Description</p>
                          <p className="font-medium">
                            {booking.roomId.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Yoga Session Information */}
                  {booking.bookingType === "yoga" && booking.yogaSessionId && (
                    <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Yoga Session Information
                      </h4>
                      <p className="text-sm text-gray-600">
                        Session ID: {typeof booking.yogaSessionId === 'string'
                          ? booking.yogaSessionId
                          : booking.yogaSessionId?._id || 'N/A'}
                      </p>
                    </div>
                  )}

                  {/* Transport Information */}
                  {booking.transport &&
                    (booking.transport.pickup || booking.transport.drop) && (
                      <div className="mb-6 p-4 bg-green-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <Car className="w-4 h-4" />
                          Transport Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {booking.transport.pickup && (
                            <div>
                              <p className="text-sm text-gray-600">Pickup</p>
                              <p className="font-medium">
                                From{" "}
                                {booking.transport.airportFrom || "Airport"}
                                {booking.transport.pickupTerminal &&
                                  ` (Terminal ${booking.transport.pickupTerminal})`}
                              </p>
                            </div>
                          )}
                          {booking.transport.drop && (
                            <div>
                              <p className="text-sm text-gray-600">Drop</p>
                              <p className="font-medium">
                                To {booking.transport.airportTo || "Airport"}
                                {booking.transport.dropTerminal &&
                                  ` (Terminal ${booking.transport.dropTerminal})`}
                              </p>
                            </div>
                          )}
                          {booking.transport.flightNumber && (
                            <div>
                              <p className="text-sm text-gray-600">
                                Flight Number
                              </p>
                              <p className="font-medium">
                                {booking.transport.flightNumber}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  {/* Special Requests */}
                  {booking.specialRequests && (
                    <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Special Requests
                      </h4>
                      <p className="text-gray-700">{booking.specialRequests}</p>
                    </div>
                  )}
                </div>

                {/* Pricing Breakdown */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Receipt className="w-5 h-5" />
                    Pricing Breakdown
                  </h3>

                  <div className="space-y-3">
                    {booking.roomPrice > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Room Charges</span>
                        <span className="font-medium">
                          ₹{booking.roomPrice.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {booking.yogaPrice > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Yoga Session</span>
                        <span className="font-medium">
                          ₹{booking.yogaPrice.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {booking.foodPrice > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Food</span>
                        <span className="font-medium">
                          ₹{booking.foodPrice.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {booking.breakfastPrice > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Breakfast</span>
                        <span className="font-medium">
                          ₹{booking.breakfastPrice.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {booking.servicesPrice > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Additional Services
                        </span>
                        <span className="font-medium">
                          ₹{booking.servicesPrice.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {booking.transportPrice > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transport</span>
                        <span className="font-medium">
                          ₹{booking.transportPrice.toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="border-t pt-3">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Subtotal</span>
                        <span>₹{booking.totalAmount.toLocaleString()}</span>
                      </div>

                      {booking.couponDiscount && booking.couponDiscount > 0 && (
                        <div className="flex justify-between text-green-600 mt-2">
                          <span>Discount ({booking.couponCode})</span>
                          <span>
                            -₹{booking.couponDiscount.toLocaleString()}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between text-xl font-bold mt-3 pt-3 border-t">
                        <span>Final Amount</span>
                        <span className="text-blue-600">
                          ₹
                          {(
                            booking.finalAmount || booking.totalAmount
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {booking.paymentId && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Payment ID</p>
                          <p className="font-mono text-sm font-medium">
                            {booking.paymentId}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Status</p>
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
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Booking Timeline
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Booking Created</p>
                      <p className="font-medium">
                        {formatDate(booking.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Updated</p>
                      <p className="font-medium">
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
