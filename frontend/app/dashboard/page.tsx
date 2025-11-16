'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  CreditCard,
  Eye,
  X,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Header from '../../components/Header';
import { bookingAPI } from '../../lib/api';

interface Booking {
  _id: string;
  roomId: {
    roomNumber: string;
    roomType: string;
    pricePerNight: number;
  };
  checkIn: string;
  checkOut: string;
  guests: Array<{
    name: string;
    age: number;
    isChild: boolean;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  selectedServices: Array<{
    serviceId: {
      name: string;
      category: string;
    };
    quantity: number;
    totalPrice: number;
  }>;
  transport?: {
    pickup: boolean;
    drop: boolean;
    flightNumber?: string;
  };
  specialRequests?: string;
  createdAt: string;
}

const DashboardPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view your bookings');
        return;
      }

      const response = await bookingAPI.getUserBookings();
      const data = response.data;
      
      if (data.success) {
        setBookings(data.data.bookings || []);
      } else {
        setError(data.message || 'Failed to fetch bookings');
      }
    } catch (err) {
      setError('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const response = await bookingAPI.cancelBooking(bookingId);
      const data = response.data;
      
      if (data.success) {
        await fetchBookings(); // Refresh bookings
      } else {
        alert(data.message || 'Failed to cancel booking');
      }
    } catch (err) {
      alert('Failed to cancel booking');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'checked_in':
        return 'bg-blue-100 text-blue-800';
      case 'checked_out':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Room {booking.roomId.roomNumber}
          </h3>
          <p className="text-gray-600">{booking.roomId.roomType}</p>
        </div>
        
        <div className="flex gap-2">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
            {booking.status.replace('_', ' ')}
          </span>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
            {booking.paymentStatus}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">
            {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-600">
          <Users className="w-4 h-4" />
          <span className="text-sm">
            {booking.guests.length} guest{booking.guests.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-600">
          <CreditCard className="w-4 h-4" />
          <span className="text-sm font-semibold">
            ₹{booking.totalAmount.toLocaleString()}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="w-4 h-4" />
          <span className="text-sm">
            Booked {new Date(booking.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Services */}
      {booking.selectedServices.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Services:</h4>
          <div className="flex flex-wrap gap-2">
            {booking.selectedServices.map((service, index) => (
              <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                {service.serviceId.name} (₹{service.totalPrice.toLocaleString()})
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setSelectedBooking(booking)}
          className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center gap-1"
        >
          <Eye className="w-4 h-4" />
          View Details
        </button>
        
        {(booking.status === 'pending' || booking.status === 'confirmed') && (
          <button
            onClick={() => handleCancelBooking(booking._id)}
            className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        )}
      </div>
    </motion.div>
  );

  const BookingDetailsModal = ({ booking, onClose }: { booking: Booking; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Room Information</h3>
                <p className="text-gray-600">Room {booking.roomId.roomNumber}</p>
                <p className="text-gray-600">{booking.roomId.roomType}</p>
                <p className="text-gray-600">₹{booking.roomId.pricePerNight.toLocaleString()}/night</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Booking Status</h3>
                <div className="space-y-2">
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                    {booking.status.replace('_', ' ')}
                  </span>
                  <br />
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
                    Payment: {booking.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Stay Duration</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Check-in</p>
                  <p className="font-medium">{new Date(booking.checkIn).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Check-out</p>
                  <p className="font-medium">{new Date(booking.checkOut).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Guests */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Guests ({booking.guests.length})</h3>
              <div className="grid md:grid-cols-2 gap-2">
                {booking.guests.map((guest, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded">
                    <p className="font-medium">{guest.name}</p>
                    <p className="text-sm text-gray-600">
                      Age: {guest.age} {guest.isChild ? '(Child)' : '(Adult)'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Services */}
            {booking.selectedServices.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Additional Services</h3>
                <div className="space-y-2">
                  {booking.selectedServices.map((service, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{service.serviceId.name}</p>
                        <p className="text-sm text-gray-600">Quantity: {service.quantity}</p>
                      </div>
                      <p className="font-semibold">₹{service.totalPrice.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transport */}
            {booking.transport && (booking.transport.pickup || booking.transport.drop) && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Transport Services</h3>
                <div className="p-3 bg-gray-50 rounded">
                  {booking.transport.pickup && <p className="text-sm">✓ Airport Pickup</p>}
                  {booking.transport.drop && <p className="text-sm">✓ Airport Drop</p>}
                  {booking.transport.flightNumber && (
                    <p className="text-sm">Flight: {booking.transport.flightNumber}</p>
                  )}
                </div>
              </div>
            )}

            {/* Special Requests */}
            {booking.specialRequests && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Special Requests</h3>
                <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded">
                  {booking.specialRequests}
                </p>
              </div>
            )}

            {/* Pricing */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-2">Total Amount</h3>
              <div className="text-2xl font-bold text-blue-600">
                ₹{booking.totalAmount.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 md:px-[100px] py-20 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <div className="text-red-500 text-xl mb-4">Error: {error}</div>
          <button 
            onClick={fetchBookings}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 md:px-[100px] py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-light text-gray-900 mb-4">My Bookings</h1>
          <p className="text-gray-600">Manage and track your resort bookings</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Bookings', count: bookings.length },
              { key: 'pending', label: 'Pending', count: bookings.filter(b => b.status === 'pending').length },
              { key: 'confirmed', label: 'Confirmed', count: bookings.filter(b => b.status === 'confirmed').length },
              { key: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Bookings Grid */}
        {filteredBookings.length > 0 ? (
          <div className="space-y-6">
            {filteredBookings.map(booking => (
              <BookingCard key={booking._id} booking={booking} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-gray-400 text-xl mb-2">
              {filter === 'all' ? 'No bookings found' : `No ${filter} bookings`}
            </div>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You haven't made any bookings yet. Start planning your perfect getaway!" 
                : `You don't have any ${filter} bookings at the moment.`
              }
            </p>
            <button
              onClick={() => window.location.href = '/booking'}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            >
              Make a Booking
            </button>
          </div>
        )}

        {/* Booking Details Modal */}
        {selectedBooking && (
          <BookingDetailsModal
            booking={selectedBooking}
            onClose={() => setSelectedBooking(null)}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardPage;