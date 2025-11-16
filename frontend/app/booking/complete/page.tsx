'use client'

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { bookingAPI } from '../../../lib/api';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Users, 
  MapPin, 
  CreditCard, 
  CheckCircle,
  AlertCircle,
  ArrowLeft 
} from 'lucide-react';
import Header from '../../../components/Header';
import PaymentButton from '../../../components/PaymentButton';

interface BookingSummary {
  roomDetails: {
    roomNumber: string;
    roomType: string;
    pricePerNight: number;
  };
  dates: {
    checkIn: Date;
    checkOut: Date;
    nights: number;
  };
  guests: Array<{
    name: string;
    age: number;
    isChild: boolean;
  }>;
  pricing: {
    roomCharges: number;
    foodCharges: number;
    transportCharges: number;
    serviceCharges: number;
    totalAmount: number;
  };
  services: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  transport?: {
    pickup: boolean;
    drop: boolean;
    flightNumber?: string;
    eta?: string;
  };
  specialRequests?: string;
}

const BookingCompletePageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1); // 1: Personal Details, 2: Review & Payment, 3: Confirmation
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<any>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  // Personal Information Form
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });

  // Guest Details
  const [guestDetails, setGuestDetails] = useState<Array<{
    name: string;
    age: number;
  }>>([]);

  // Booking Summary (from previous steps)
  const [bookingSummary, setBookingSummary] = useState<BookingSummary | null>(null);

  useEffect(() => {
    // Load booking data from localStorage or URL params
    const savedBookingData = localStorage.getItem('bookingFormData');
    if (savedBookingData) {
      const data = JSON.parse(savedBookingData);
      setBookingData(data);
      
      // Initialize guest details array based on guest count
      const totalGuests = data.guests.adults + data.guests.children;
      const initialGuests = Array.from({ length: totalGuests }, (_, index) => ({
        name: '',
        age: index < data.guests.adults ? 25 : 8
      }));
      setGuestDetails(initialGuests);
    }
  }, []);

  const handlePersonalInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personalInfo.name || !personalInfo.email || !personalInfo.phone) {
      setError('Please fill in all required personal information');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleGuestDetailsSubmit = () => {
    const incompleteGuests = guestDetails.filter(guest => !guest.name || !guest.age);
    if (incompleteGuests.length > 0) {
      setError('Please fill in details for all guests');
      return;
    }
    setError(null);
    proceedToPayment();
  };

  const proceedToPayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Create booking on backend
      const bookingPayload = {
        ...bookingData,
        personalInfo,
        guests: guestDetails.map((guest, index) => ({
          name: guest.name,
          age: guest.age,
          isChild: guest.age < 5
        }))
      };

      const response = await bookingAPI.createBooking(bookingPayload);
      const result = response.data;

      if (result.success) {
        setBookingId(result.data.booking._id);
        setBookingSummary({
          roomDetails: result.data.booking.roomId,
          dates: {
            checkIn: new Date(result.data.booking.checkIn),
            checkOut: new Date(result.data.booking.checkOut),
            nights: Math.ceil((new Date(result.data.booking.checkOut).getTime() - new Date(result.data.booking.checkIn).getTime()) / (1000 * 60 * 60 * 24))
          },
          guests: result.data.booking.guests,
          pricing: {
            roomCharges: result.data.booking.roomPrice,
            foodCharges: result.data.booking.foodPrice,
            transportCharges: result.data.booking.transportPrice,
            serviceCharges: result.data.booking.servicesPrice,
            totalAmount: result.data.booking.totalAmount
          },
          services: result.data.booking.selectedServices,
          transport: result.data.booking.transport,
          specialRequests: result.data.booking.specialRequests
        });
      } else {
        setError(result.message || 'Failed to create booking');
      }
    } catch (err) {
      setError('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentData: any) => {
    setStep(3);
    // Clear saved booking data
    localStorage.removeItem('bookingFormData');
  };

  const handlePaymentError = (error: any) => {
    setError(error.message || 'Payment failed. Please try again.');
  };

  const PersonalDetailsForm = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-xl shadow-sm p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <User className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
      </div>

      <form onSubmit={handlePersonalInfoSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={personalInfo.name}
              onChange={(e) => setPersonalInfo(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              value={personalInfo.email}
              onChange={(e) => setPersonalInfo(prev => ({ ...prev, email: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              value={personalInfo.phone}
              onChange={(e) => setPersonalInfo(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              value={personalInfo.address}
              onChange={(e) => setPersonalInfo(prev => ({ ...prev, address: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Emergency Contact</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Name
              </label>
              <input
                type="text"
                value={personalInfo.emergencyContact.name}
                onChange={(e) => setPersonalInfo(prev => ({
                  ...prev,
                  emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                value={personalInfo.emergencyContact.phone}
                onChange={(e) => setPersonalInfo(prev => ({
                  ...prev,
                  emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relationship
              </label>
              <select
                value={personalInfo.emergencyContact.relationship}
                onChange={(e) => setPersonalInfo(prev => ({
                  ...prev,
                  emergencyContact: { ...prev.emergencyContact, relationship: e.target.value }
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select</option>
                <option value="spouse">Spouse</option>
                <option value="parent">Parent</option>
                <option value="sibling">Sibling</option>
                <option value="friend">Friend</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Continue to Guest Details
        </button>
      </form>
    </motion.div>
  );

  const GuestDetailsForm = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-xl shadow-sm p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Guest Details</h2>
      </div>

      <div className="space-y-4">
        {guestDetails.map((guest, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Guest {index + 1} {index === 0 ? '(Primary)' : ''}
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={guest.name}
                  onChange={(e) => {
                    const updatedGuests = [...guestDetails];
                    updatedGuests[index].name = e.target.value;
                    setGuestDetails(updatedGuests);
                  }}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  placeholder={index === 0 ? personalInfo.name : ''}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Age *
                </label>
                <input
                  type="number"
                  value={guest.age}
                  onChange={(e) => {
                    const updatedGuests = [...guestDetails];
                    updatedGuests[index].age = parseInt(e.target.value) || 0;
                    setGuestDetails(updatedGuests);
                  }}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max="120"
                  required
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={() => setStep(1)}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handleGuestDetailsSubmit}
          disabled={loading}
          className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
        >
          {loading ? 'Creating Booking...' : 'Review & Pay'}
        </button>
      </div>
    </motion.div>
  );

  const PaymentSection = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-xl shadow-sm p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <CreditCard className="w-6 h-6 text-green-600" />
        <h2 className="text-xl font-semibold text-gray-900">Payment</h2>
      </div>

      {bookingSummary && bookingId && (
        <div className="space-y-6">
          {/* Booking Summary */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Booking Summary</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Room: {bookingSummary.roomDetails.roomNumber}</p>
                <p className="text-gray-600">Type: {bookingSummary.roomDetails.roomType}</p>
                <p className="text-gray-600">Guests: {bookingSummary.guests.length}</p>
              </div>
              <div>
                <p className="text-gray-600">
                  Check-in: {bookingSummary.dates.checkIn.toLocaleDateString()}
                </p>
                <p className="text-gray-600">
                  Check-out: {bookingSummary.dates.checkOut.toLocaleDateString()}
                </p>
                <p className="text-gray-600">Nights: {bookingSummary.dates.nights}</p>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Room Charges</span>
              <span>₹{bookingSummary.pricing.roomCharges.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Food Charges</span>
              <span>₹{bookingSummary.pricing.foodCharges.toLocaleString()}</span>
            </div>
            {bookingSummary.pricing.transportCharges > 0 && (
              <div className="flex justify-between">
                <span>Transport Charges</span>
                <span>₹{bookingSummary.pricing.transportCharges.toLocaleString()}</span>
              </div>
            )}
            {bookingSummary.pricing.serviceCharges > 0 && (
              <div className="flex justify-between">
                <span>Service Charges</span>
                <span>₹{bookingSummary.pricing.serviceCharges.toLocaleString()}</span>
              </div>
            )}
            <hr className="my-2" />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total Amount</span>
              <span>₹{bookingSummary.pricing.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <PaymentButton
            amount={bookingSummary.pricing.totalAmount}
            bookingId={bookingId}
            userDetails={{
              name: personalInfo.name,
              email: personalInfo.email,
              phone: personalInfo.phone
            }}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        </div>
      )}
    </motion.div>
  );

  const ConfirmationSection = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12"
    >
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm p-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
        <p className="text-gray-600 mb-6">
          Your booking has been confirmed. A confirmation email has been sent to {personalInfo.email}.
        </p>
        <div className="text-sm text-gray-500 mb-6">
          <p>Booking ID: {bookingId}</p>
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          View My Bookings
        </button>
      </div>
    </motion.div>
  );

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 md:px-[100px] py-8">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Booking Data Found</h2>
            <p className="text-gray-600 mb-4">Please start your booking from the beginning.</p>
            <button
              onClick={() => router.push('/booking')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Start New Booking
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 md:px-[100px] py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-light text-gray-900 mb-4">Complete Your Booking</h1>
            
            {/* Progress Steps */}
            <div className="flex items-center gap-4 mb-6">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNum 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step > stepNum ? <CheckCircle className="w-5 h-5" /> : stepNum}
                  </div>
                  <span className="text-sm text-gray-600">
                    {stepNum === 1 && 'Personal Details'}
                    {stepNum === 2 && 'Review & Payment'} 
                    {stepNum === 3 && 'Confirmation'}
                  </span>
                  {stepNum < 3 && <div className="w-8 h-0.5 bg-gray-200" />}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {step === 1 && <PersonalDetailsForm />}
          {step === 1 && guestDetails.length > 0 && (
            <div className="mt-6">
              <GuestDetailsForm />
            </div>
          )}
          {step === 2 && <PaymentSection />}
          {step === 3 && <ConfirmationSection />}
        </div>
      </div>
    </div>
  );
};

const BookingCompletePage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <BookingCompletePageContent />
    </Suspense>
  );
};

export default BookingCompletePage;