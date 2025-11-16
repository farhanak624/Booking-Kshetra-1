"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Download,
  Home,
  Search,
} from "lucide-react";
import Header from "../../components/Header";
import Link from "next/link";
import { bookingAPI } from "../../lib/api";
import { generateReceipt, BookingDetails } from "../../utils/receiptGenerator";

const BookingSuccessPageContent = () => {
  const searchParams = useSearchParams();
  const bookingId = searchParams?.get("bookingId");
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) {
        setError("No booking ID provided");
        setLoading(false);
        return;
      }

      try {
        console.log('📋 Fetching booking details for ID:', bookingId);
        const response = await bookingAPI.getPublicBookingById(bookingId);

        if (response.data?.success) {
          console.log('✅ Booking details fetched:', response.data.data.booking);
          setBookingDetails(response.data.data.booking);
        } else {
          setError(response.data?.message || 'Failed to fetch booking details');
        }
      } catch (error: any) {
        console.error('❌ Error fetching booking details:', error);
        setError('Failed to fetch booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  const handleDownloadReceipt = () => {
    if (bookingDetails) {
      console.log('📥 Generating receipt for booking:', bookingDetails._id);
      generateReceipt(bookingDetails);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading booking details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Booking</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link
              href="/"
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!bookingDetails) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-gray-600">No booking details found.</p>
            <Link
              href="/"
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors mt-4 inline-block"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 md:px-[100px] py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto"
        >
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🎉 Booking Confirmed!
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              Your payment was successful and your booking has been confirmed.
            </p>
            <p className="text-sm text-gray-500">
              You will receive a confirmation email shortly.
            </p>
          </div>

          {/* Booking Details Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Booking Details
              </h2>
              <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span className="text-blue-600 font-mono font-semibold">
                  {bookingDetails._id}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Save this ID to track your booking anytime
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Check-in</p>
                      <p className="text-gray-600">
                        {new Date(bookingDetails.checkIn).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Check-out</p>
                      <p className="text-gray-600">
                        {new Date(bookingDetails.checkOut).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Duration</p>
                      <p className="text-gray-600">
                        {Math.ceil((new Date(bookingDetails.checkOut).getTime() - new Date(bookingDetails.checkIn).getTime()) / (1000 * 60 * 60 * 24))} night(s)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Room</p>
                      <p className="text-gray-600">
                        {bookingDetails.roomDetails?.roomNumber || 'N/A'} - {bookingDetails.roomDetails?.roomType || 'Standard'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Guests</p>
                      <p className="text-gray-600">{bookingDetails.guests.length} Guest(s)</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Total Amount</p>
                      <p className="text-gray-900 font-semibold">₹{bookingDetails.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Payment Status</p>
                      <p className={`font-semibold ${
                        bookingDetails.paymentStatus === 'paid' ? 'text-green-600' :
                        bookingDetails.paymentStatus === 'pending' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {bookingDetails.paymentStatus === 'paid' ? '✅ Paid' :
                         bookingDetails.paymentStatus === 'pending' ? '⏳ Pending' :
                         '❌ Failed'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              📋 Important Information
            </h3>
            <ul className="space-y-2 text-blue-800 text-sm">
              <li>• Check-in time: 2:00 PM</li>
              <li>• Check-out time: 12:00 PM</li>
              <li>• Please carry a valid ID proof for check-in</li>
              <li>• For any changes or cancellations, contact us at least 24 hours in advance</li>
              <li>• Contact our front desk for any assistance during your stay</li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              📞 Contact Us
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700">+91 9876543210</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700">booking@kshetraresort.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700">Kshetra Retreat Resort, Kerala</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleDownloadReceipt}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download Receipt
            </button>

            <Link
              href="/track-booking"
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              Track Your Booking
            </Link>

            <Link
              href="/"
              className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </Link>
          </div>

          {/* Thank You Message */}
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Thank you for choosing Kshetra Retreat Resort. We look forward to hosting you!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const BookingSuccessPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingSuccessPageContent />
    </Suspense>
  );
};

export default BookingSuccessPage;