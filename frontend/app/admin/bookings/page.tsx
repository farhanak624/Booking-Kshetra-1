"use client";

import { useState, useEffect } from "react";
import { adminAPI, roomAPI, serviceAPI, bookingAPI } from "../../../lib/api";
import {
  Calendar,
  Users,
  DollarSign,
  Eye,
  Edit3,
  Plus,
  Filter,
  Search,
  RefreshCw,
  MapPin,
  Clock,
  Mail,
  Phone,
  User,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  ShieldCheck,
  ShieldX,
  Loader,
} from "lucide-react";

interface Booking {
  _id: string;
  roomId?: {
    roomNumber: string;
    roomType: string;
    pricePerNight: number;
  };
  userId?: {
    name: string;
    email: string;
    phone: string;
  };
  guestEmail?: string;
  primaryGuestInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  checkIn: string;
  checkOut: string;
  totalGuests: number;
  adults: number;
  children: number;
  totalAmount: number;
  roomPrice: number;
  foodPrice: number;
  breakfastPrice: number;
  servicesPrice: number;
  transportPrice: number;
  yogaPrice: number;
  status: "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  specialRequests?: string;
  notes?: string;
  createdAt: string;
  bookingType?: "room" | "yoga";
  transport?: {
    pickup: boolean;
    drop: boolean;
    flightNumber?: string;
    airportFrom?: string;
    airportTo?: string;
  };
  selectedServices?: {
    serviceId: {
      name: string;
      category: string;
    };
    quantity: number;
    totalPrice: number;
  }[];
  yogaSessionId?:
    | {
        type: string;
        batchName: string;
      }
    | string;
  includeFood: boolean;
  includeBreakfast: boolean;
  licensePhoto?: string;
  licensePhotoUploadedAt?: string;
  licensePhotoVerified?: boolean;
}

interface Room {
  _id: string;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  capacity: number;
  isAvailable: boolean;
}

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  });

  // Filters
  const [filters, setFilters] = useState({
    status: "",
    paymentStatus: "",
    bookingType: "",
    hasTransport: "",
    hasYoga: "",
    hasServices: "",
    search: "",
    page: 1,
    limit: 10,
  });

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [verifyingLicense, setVerifyingLicense] = useState(false);
  const [fetchingBookingDetails, setFetchingBookingDetails] = useState(false);

  // Create booking form data
  const [createForm, setCreateForm] = useState({
    roomId: "",
    checkIn: "",
    checkOut: "",
    guests: [
      {
        name: "",
        age: 25,
        gender: "Male" as "Male" | "Female" | "Other",
        idType: "Aadhar" as
          | "Aadhar"
          | "Passport"
          | "Driving License"
          | "PAN Card",
        idNumber: "",
      },
    ],
    primaryGuestInfo: {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      emergencyContact: {
        name: "",
        phone: "",
        relationship: "",
      },
    },
    includeFood: true,
    includeBreakfast: false,
    transport: {
      pickup: false,
      drop: false,
      flightNumber: "",
      airportFrom: "Kochi",
      airportTo: "Kochi",
    },
    selectedServices: [],
    specialRequests: "",
    status: "confirmed" as
      | "pending"
      | "confirmed"
      | "checked_in"
      | "checked_out"
      | "cancelled",
    paymentStatus: "pending" as "pending" | "paid" | "failed" | "refunded",
    notes: "",
  });

  useEffect(() => {
    fetchBookings();
    fetchRooms();
    fetchServices();
  }, [filters]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllBookings(filters);
      const data = response.data;

      if (data.success) {
        setBookings(data.data.bookings);
        setPagination(data.data.pagination);
      } else {
        setError(data.message || "Failed to fetch bookings");
      }
    } catch (err: any) {
      setError("Failed to fetch bookings");
      console.error("Fetch bookings error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await adminAPI.getAllRooms({ limit: 100 });
      const data = response.data;
      if (data.success) {
        setRooms(data.data.rooms);
      }
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await adminAPI.getAllServices({ isActive: true });
      const data = response.data;
      if (data.success) {
        setServices(data.data.services);
      }
    } catch (err) {
      console.error("Failed to fetch services:", err);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handleCreateBooking = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.createBooking(createForm);
      const data = response.data;

      if (data.success) {
        setShowCreateModal(false);
        fetchBookings();
        resetCreateForm();
      } else {
        setError(data.message || "Failed to create booking");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create booking");
      console.error("Create booking error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLicensePhoto = async (bookingId: string, verified: boolean) => {
    try {
      setVerifyingLicense(true);
      const response = await bookingAPI.verifyLicensePhoto(bookingId, verified);
      if (response.data?.success) {
        // Update the booking in the list
        setBookings(prev => prev.map(booking => 
          booking._id === bookingId 
            ? { ...booking, licensePhotoVerified: verified }
            : booking
        ));
        // Update selected booking if it's the same one
        if (selectedBooking && selectedBooking._id === bookingId) {
          setSelectedBooking({ ...selectedBooking, licensePhotoVerified: verified });
        }
      } else {
        setError(response.data?.message || 'Failed to verify license photo');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify license photo');
      console.error('Verify license photo error:', err);
    } finally {
      setVerifyingLicense(false);
    }
  };

  const isVehicleRentalBooking = (booking: Booking): boolean => {
    if (!booking.selectedServices || booking.selectedServices.length === 0) {
      return false;
    }
    
    // Check if any service has vehicle_rental category
    return booking.selectedServices.some((service) => {
      // If serviceId is an object with category
      if (typeof service.serviceId === 'object' && service.serviceId !== null) {
        return service.serviceId.category === 'vehicle_rental';
      }
      // Also check service details or special requests for vehicle rental keywords
      if (booking.specialRequests) {
        const lowerRequest = booking.specialRequests.toLowerCase();
        return lowerRequest.includes('vehicle rental') || lowerRequest.includes('vehicle_rental');
      }
      return false;
    });
  };

  const resetCreateForm = () => {
    setCreateForm({
      roomId: "",
      checkIn: "",
      checkOut: "",
      guests: [
        {
          name: "",
          age: 25,
          gender: "Male",
          idType: "Aadhar",
          idNumber: "",
        },
      ],
      primaryGuestInfo: {
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        emergencyContact: {
          name: "",
          phone: "",
          relationship: "",
        },
      },
      includeFood: true,
      includeBreakfast: false,
      transport: {
        pickup: false,
        drop: false,
        flightNumber: "",
        airportFrom: "Kochi",
        airportTo: "Kochi",
      },
      selectedServices: [],
      specialRequests: "",
      status: "confirmed",
      paymentStatus: "pending",
      notes: "",
    });
  };

  const addGuest = () => {
    setCreateForm((prev) => ({
      ...prev,
      guests: [
        ...prev.guests,
        {
          name: "",
          age: 25,
          gender: "Male" as const,
          idType: "Aadhar" as const,
          idNumber: "",
        },
      ],
    }));
  };

  const removeGuest = (index: number) => {
    if (createForm.guests.length > 1) {
      setCreateForm((prev) => ({
        ...prev,
        guests: prev.guests.filter((_, i) => i !== index),
      }));
    }
  };

  const updateGuest = (index: number, field: string, value: any) => {
    setCreateForm((prev) => ({
      ...prev,
      guests: prev.guests.map((guest, i) =>
        i === index ? { ...guest, [field]: value } : guest
      ),
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "checked_in":
        return "bg-blue-100 text-blue-800";
      case "checked_out":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
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
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getBookingTypeDisplay = (booking: Booking) => {
    // Priority-based booking type detection

    // 1. Check if it's a room booking with accommodation
    if (booking.roomId && booking.roomPrice > 0) {
      return {
        type: "room",
        icon: "🏠",
        label: "Room Booking",
        description: `Room ${booking.roomId.roomNumber} (${booking.roomId.roomType})`,
      };
    }

    // 2. Check if it's primarily a yoga booking
    if (
      booking.bookingType === "yoga" ||
      booking.yogaPrice > 0 ||
      booking.yogaSessionId
    ) {
      return {
        type: "yoga",
        icon: "🧘‍♀️",
        label: "Yoga Session",
        description:
          typeof booking.yogaSessionId === "object" &&
          booking.yogaSessionId?.type
            ? `${booking.yogaSessionId.type} - ${booking.yogaSessionId.batchName}`
            : "Daily Session",
      };
    }

    // 3. Check for transport-only booking
    if (
      booking.transportPrice > 0 &&
      !booking.roomId &&
      !booking.yogaPrice &&
      (booking.servicesPrice === 0 || !booking.selectedServices?.length)
    ) {
      const transportTypes = [];
      if (booking.transport?.pickup) transportTypes.push("Pickup");
      if (booking.transport?.drop) transportTypes.push("Drop");

      return {
        type: "transport",
        icon: "✈️",
        label: "Transport Service",
        description:
          transportTypes.length > 0
            ? `Airport ${transportTypes.join(" & ")}`
            : "Transport Service",
      };
    }

    // 4. Check for adventure sports in selected services
    if (booking.selectedServices && booking.selectedServices.length > 0) {
      const adventureServices = booking.selectedServices.filter(
        (service) =>
          service.serviceId?.category === "adventure" ||
          ["surfing", "diving", "trekking", "adventure"].some((keyword) =>
            service.serviceId?.name?.toLowerCase().includes(keyword)
          )
      );

      if (adventureServices.length > 0) {
        return {
          type: "adventure",
          icon: "🏔️",
          label: "Adventure Sports",
          description:
            adventureServices.length === 1
              ? adventureServices[0].serviceId.name
              : `${adventureServices.length} Adventure Activities`,
        };
      }

      // Check for other specific service categories
      const yogaServices = booking.selectedServices.filter(
        (service) => service.serviceId?.category === "yoga"
      );

      if (yogaServices.length > 0) {
        return {
          type: "yoga",
          icon: "🧘‍♀️",
          label: "Yoga Services",
          description:
            yogaServices.length === 1
              ? yogaServices[0].serviceId.name
              : `${yogaServices.length} Yoga Services`,
        };
      }
    }

    // 5. Mixed booking (room + services/transport)
    if (
      booking.roomId &&
      (booking.servicesPrice > 0 ||
        booking.transportPrice > 0 ||
        booking.yogaPrice > 0)
    ) {
      const components = [];
      if (booking.roomPrice > 0) components.push("Room");
      if (booking.yogaPrice > 0) components.push("Yoga");
      if (booking.transportPrice > 0) components.push("Transport");
      if (booking.servicesPrice > 0) components.push("Services");

      return {
        type: "mixed",
        icon: "🏠",
        label: "Package Booking",
        description: `Room ${booking.roomId.roomNumber} + ${components
          .slice(1)
          .join(", ")}`,
      };
    }

    // 6. General service booking
    if (booking.selectedServices && booking.selectedServices.length > 0) {
      return {
        type: "service",
        icon: "🛎️",
        label: "Service Booking",
        description:
          booking.selectedServices.length === 1
            ? booking.selectedServices[0].serviceId?.name || "Service"
            : `${booking.selectedServices.length} Services`,
      };
    }

    // 7. Default fallback
    return {
      type: "other",
      icon: "📋",
      label: "Other Booking",
      description: "Service Booking",
    };
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Bookings Management
              </h1>
              <p className="text-gray-600">Manage all resort bookings</p>
            </div>
            {/* <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Booking
            </button> */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Booking Type
              </label>
              <select
                value={filters.bookingType}
                onChange={(e) =>
                  handleFilterChange("bookingType", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="room">Room Bookings</option>
                <option value="yoga">Yoga Bookings</option>
                <option value="adventure">Adventure Sports</option>
                <option value="transport">Transport Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transport
              </label>
              <select
                value={filters.hasTransport}
                onChange={(e) =>
                  handleFilterChange("hasTransport", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All</option>
                <option value="pickup">Airport Pickup</option>
                <option value="drop">Airport Drop</option>
                <option value="both">Both</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="checked_in">Checked In</option>
                <option value="checked_out">Checked Out</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Status
              </label>
              <select
                value={filters.paymentStatus}
                onChange={(e) =>
                  handleFilterChange("paymentStatus", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Payment</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchBookings}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Services
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.userId?.name ||
                          booking.primaryGuestInfo?.name ||
                          "Guest"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.userId?.email ||
                          booking.primaryGuestInfo?.email ||
                          booking.guestEmail}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.userId?.phone ||
                          booking.primaryGuestInfo?.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(() => {
                        const bookingDisplay = getBookingTypeDisplay(booking);
                        return (
                          <div>
                            <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                              <span className="text-lg">
                                {bookingDisplay.icon}
                              </span>
                              {bookingDisplay.label}
                            </div>
                            <div className="text-sm text-gray-500">
                              {bookingDisplay.description}
                            </div>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(booking.checkIn).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        to {new Date(booking.checkOut).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-900">
                          {booking.totalGuests} guests ({booking.adults}A,{" "}
                          {booking.children}C)
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {booking.includeFood && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                              Food
                            </span>
                          )}
                          {booking.includeBreakfast && (
                            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                              Breakfast
                            </span>
                          )}
                          {booking.transport?.pickup && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                              Pickup
                            </span>
                          )}
                          {booking.transport?.drop && (
                            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                              Drop
                            </span>
                          )}
                          {booking.selectedServices &&
                            booking.selectedServices.length > 0 && (
                              <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">
                                {booking.selectedServices.length} Services
                              </span>
                            )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ₹{booking.totalAmount.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        {booking.roomPrice > 0 && (
                          <div>Room: ₹{booking.roomPrice}</div>
                        )}
                        {booking.foodPrice > 0 && (
                          <div>Food: ₹{booking.foodPrice}</div>
                        )}
                        {booking.yogaPrice > 0 && (
                          <div>Yoga: ₹{booking.yogaPrice}</div>
                        )}
                        {booking.transportPrice > 0 && (
                          <div>Transport: ₹{booking.transportPrice}</div>
                        )}
                        {booking.servicesPrice > 0 && (
                          <div>Services: ₹{booking.servicesPrice}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(
                            booking.paymentStatus
                          )}`}
                        >
                          {booking.paymentStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center justify-center space-x-2">
                        {/* License Photo Indicator for Vehicle Rentals */}
                        {isVehicleRentalBooking(booking) && booking.licensePhoto && (
                          <div className="relative" title={booking.licensePhotoVerified ? "License verified" : "License pending verification"}>
                            {booking.licensePhotoVerified ? (
                              <div className="p-1.5 bg-green-100 rounded-full">
                                <ImageIcon className="w-4 h-4 text-green-600" />
                              </div>
                            ) : (
                              <div className="p-1.5 bg-yellow-100 rounded-full">
                                <ImageIcon className="w-4 h-4 text-yellow-600" />
                              </div>
                            )}
                          </div>
                        )}
                        <button
                          onClick={async () => {
                            // Fetch full booking details including license photo when opening modal
                            if (isVehicleRentalBooking(booking)) {
                              setFetchingBookingDetails(true);
                              try {
                                const response = await bookingAPI.getBookingById(booking._id);
                                console.log('Fetched booking response:', response.data);
                                if (response.data?.success) {
                                  // The booking is nested in data.data.booking
                                  const bookingData = response.data.data?.booking || response.data.data;
                                  console.log('License photo in fetched booking:', bookingData?.licensePhoto);
                                  console.log('Full booking data:', bookingData);
                                  setSelectedBooking(bookingData);
                                  setShowViewModal(true);
                                } else {
                                  // Fallback to existing booking data
                                  console.log('Response not successful, using existing booking data');
                                  setSelectedBooking(booking);
                                  setShowViewModal(true);
                                }
                              } catch (error) {
                                console.error('Error fetching booking details:', error);
                                // Fallback to existing booking data
                                setSelectedBooking(booking);
                                setShowViewModal(true);
                              } finally {
                                setFetchingBookingDetails(false);
                              }
                            } else {
                              setSelectedBooking(booking);
                              setShowViewModal(true);
                            }
                          }}
                          disabled={fetchingBookingDetails}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {/* <button
                          onClick={() => {
                            // Handle edit booking
                            console.log('Edit booking:', booking._id);
                          }}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() =>
                    handleFilterChange("page", Math.max(1, filters.page - 1))
                  }
                  disabled={filters.page <= 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    handleFilterChange(
                      "page",
                      Math.min(pagination.pages, filters.page + 1)
                    )
                  }
                  disabled={filters.page >= pagination.pages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page {pagination.current} of {pagination.pages} (
                    {pagination.total} total bookings)
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {[...Array(pagination.pages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => handleFilterChange("page", i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          i + 1 === pagination.current
                            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Booking Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Create New Booking
              </h2>

              {/* Room Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room
                  </label>
                  <select
                    value={createForm.roomId}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        roomId: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Room</option>
                    {rooms.map((room) => (
                      <option key={room._id} value={room._id}>
                        Room {room.roomNumber} - {room.roomType} (₹
                        {room.pricePerNight}/night)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Check-in
                    </label>
                    <input
                      type="date"
                      value={createForm.checkIn}
                      onChange={(e) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          checkIn: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Check-out
                    </label>
                    <input
                      type="date"
                      value={createForm.checkOut}
                      onChange={(e) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          checkOut: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Primary Guest Info */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Primary Guest Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={createForm.primaryGuestInfo.name}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        primaryGuestInfo: {
                          ...prev.primaryGuestInfo,
                          name: e.target.value,
                        },
                      }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={createForm.primaryGuestInfo.email}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        primaryGuestInfo: {
                          ...prev.primaryGuestInfo,
                          email: e.target.value,
                        },
                      }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={createForm.primaryGuestInfo.phone}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        primaryGuestInfo: {
                          ...prev.primaryGuestInfo,
                          phone: e.target.value,
                        },
                      }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  <input
                    type="text"
                    placeholder="Address"
                    value={createForm.primaryGuestInfo.address}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        primaryGuestInfo: {
                          ...prev.primaryGuestInfo,
                          address: e.target.value,
                        },
                      }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={createForm.primaryGuestInfo.city}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        primaryGuestInfo: {
                          ...prev.primaryGuestInfo,
                          city: e.target.value,
                        },
                      }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={createForm.primaryGuestInfo.state}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        primaryGuestInfo: {
                          ...prev.primaryGuestInfo,
                          state: e.target.value,
                        },
                      }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="text"
                    placeholder="PIN Code"
                    value={createForm.primaryGuestInfo.pincode}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        primaryGuestInfo: {
                          ...prev.primaryGuestInfo,
                          pincode: e.target.value,
                        },
                      }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Guests */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium text-gray-900">Guests</h3>
                  <button
                    type="button"
                    onClick={addGuest}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Add Guest
                  </button>
                </div>
                {createForm.guests.map((guest, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 p-4 border border-gray-200 rounded-lg"
                  >
                    <input
                      type="text"
                      placeholder="Guest Name"
                      value={guest.name}
                      onChange={(e) =>
                        updateGuest(index, "name", e.target.value)
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Age"
                      value={guest.age}
                      onChange={(e) =>
                        updateGuest(index, "age", parseInt(e.target.value))
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      max="120"
                      required
                    />
                    <select
                      value={guest.gender}
                      onChange={(e) =>
                        updateGuest(index, "gender", e.target.value)
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    <select
                      value={guest.idType}
                      onChange={(e) =>
                        updateGuest(index, "idType", e.target.value)
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Aadhar">Aadhar</option>
                      <option value="Passport">Passport</option>
                      <option value="Driving License">Driving License</option>
                      <option value="PAN Card">PAN Card</option>
                    </select>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="ID Number"
                        value={guest.idNumber}
                        onChange={(e) =>
                          updateGuest(index, "idNumber", e.target.value)
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {createForm.guests.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeGuest(index)}
                          className="bg-red-600 text-white px-2 py-2 rounded hover:bg-red-700"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Services and Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Services
                  </h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={createForm.includeFood}
                        onChange={(e) =>
                          setCreateForm((prev) => ({
                            ...prev,
                            includeFood: e.target.checked,
                          }))
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Include Food
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={createForm.includeBreakfast}
                        onChange={(e) =>
                          setCreateForm((prev) => ({
                            ...prev,
                            includeBreakfast: e.target.checked,
                          }))
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Include Breakfast
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={createForm.transport.pickup}
                        onChange={(e) =>
                          setCreateForm((prev) => ({
                            ...prev,
                            transport: {
                              ...prev.transport,
                              pickup: e.target.checked,
                            },
                          }))
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Airport Pickup
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={createForm.transport.drop}
                        onChange={(e) =>
                          setCreateForm((prev) => ({
                            ...prev,
                            transport: {
                              ...prev.transport,
                              drop: e.target.checked,
                            },
                          }))
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Airport Drop
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Booking Status
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={createForm.status}
                        onChange={(e) =>
                          setCreateForm((prev) => ({
                            ...prev,
                            status: e.target.value as any,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="checked_in">Checked In</option>
                        <option value="checked_out">Checked Out</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Status
                      </label>
                      <select
                        value={createForm.paymentStatus}
                        onChange={(e) =>
                          setCreateForm((prev) => ({
                            ...prev,
                            paymentStatus: e.target.value as any,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Special Requests and Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests
                  </label>
                  <textarea
                    value={createForm.specialRequests}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        specialRequests: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Any special requests from guest..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Notes
                  </label>
                  <textarea
                    value={createForm.notes}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Internal notes for this booking..."
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetCreateForm();
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateBooking}
                  disabled={
                    !createForm.roomId ||
                    !createForm.checkIn ||
                    !createForm.checkOut
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Booking Modal */}
      {showViewModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Booking Details
              </h2>

              <div className="space-y-6">
                {/* Main Information */}
                {(selectedBooking.specialRequests || selectedBooking.notes) && (
                  <div>
                    {/* <h3 className="text-lg font-medium text-gray-900 mb-3">Main Information</h3> */}
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      {selectedBooking.specialRequests && (
                        <div>
                          <span className="text-sm text-gray-600">
                            Special Requests:
                          </span>
                          <p className="text-sm text-gray-900 mt-1">
                            {selectedBooking.specialRequests}
                          </p>
                        </div>
                      )}
                      {selectedBooking.notes && (
                        <div>
                          <span className="text-sm text-gray-600">
                            Admin Notes:
                          </span>
                          <p className="text-sm text-gray-900 mt-1">
                            {selectedBooking.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Guest Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Guest Information
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Name:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedBooking.userId?.name ||
                            selectedBooking.primaryGuestInfo?.name ||
                            "Guest"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedBooking.userId?.email ||
                            selectedBooking.primaryGuestInfo?.email ||
                            selectedBooking.guestEmail}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Phone:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedBooking.userId?.phone ||
                            selectedBooking.primaryGuestInfo?.phone ||
                            "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Guests:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedBooking.totalGuests} (
                          {selectedBooking.adults} adults,{" "}
                          {selectedBooking.children} children)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Booking Details
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(() => {
                        const bookingDisplay =
                          getBookingTypeDisplay(selectedBooking);
                        return (
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {bookingDisplay.icon}
                            </span>
                            <span className="text-sm text-gray-600">
                              {bookingDisplay.label}:
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {bookingDisplay.description}
                            </span>
                          </div>
                        );
                      })()}

                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Check-in:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(
                            selectedBooking.checkIn
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Check-out:
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(
                            selectedBooking.checkOut
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Total Amount:
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          ₹{selectedBooking.totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Services & Transport */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Services & Add-ons
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Food:</span>
                        <span
                          className={`text-sm font-medium ${
                            selectedBooking.includeFood
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          {selectedBooking.includeFood
                            ? "✓ Included"
                            : "✗ Not included"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          Breakfast:
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            selectedBooking.includeBreakfast
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          {selectedBooking.includeBreakfast
                            ? "✓ Included"
                            : "✗ Not included"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          Airport Pickup:
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            selectedBooking.transport?.pickup
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          {selectedBooking.transport?.pickup ? "✓ Yes" : "✗ No"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          Airport Drop:
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            selectedBooking.transport?.drop
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          {selectedBooking.transport?.drop ? "✓ Yes" : "✗ No"}
                        </span>
                      </div>
                    </div>

                    {selectedBooking.transport &&
                      (selectedBooking.transport.pickup ||
                        selectedBooking.transport.drop) && (
                        <div className="border-t pt-3">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">
                            Transport Details:
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                            {selectedBooking.transport.flightNumber && (
                              <div>
                                Flight: {selectedBooking.transport.flightNumber}
                              </div>
                            )}
                            {selectedBooking.transport.airportFrom && (
                              <div>
                                From: {selectedBooking.transport.airportFrom}
                              </div>
                            )}
                            {selectedBooking.transport.airportTo && (
                              <div>
                                To: {selectedBooking.transport.airportTo}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                    {selectedBooking.selectedServices &&
                      selectedBooking.selectedServices.length > 0 && (
                        <div className="border-t pt-3">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">
                            Services:
                          </h4>
                          <div className="space-y-1">
                            {selectedBooking.selectedServices.map(
                              (service, index) => (
                                <div
                                  key={index}
                                  className="flex justify-between items-center text-sm"
                                >
                                  <span>
                                    {service.serviceId?.name || "Service"} (x
                                    {service.quantity})
                                  </span>
                                  <span className="font-medium">
                                    ₹{service.totalPrice.toLocaleString()}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    <div className="border-t pt-3">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Price Breakdown:
                      </h4>
                      <div className="space-y-1 text-sm">
                        {selectedBooking.roomPrice > 0 && (
                          <div className="flex justify-between">
                            <span>Room charges:</span>
                            <span>
                              ₹{selectedBooking.roomPrice.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {selectedBooking.foodPrice > 0 && (
                          <div className="flex justify-between">
                            <span>Food charges:</span>
                            <span>
                              ₹{selectedBooking.foodPrice.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {selectedBooking.yogaPrice > 0 && (
                          <div className="flex justify-between">
                            <span>Yoga charges:</span>
                            <span>
                              ₹{selectedBooking.yogaPrice.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {selectedBooking.transportPrice > 0 && (
                          <div className="flex justify-between">
                            <span>Transport charges:</span>
                            <span>
                              ₹{selectedBooking.transportPrice.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {selectedBooking.servicesPrice > 0 && (
                          <div className="flex justify-between">
                            <span>Additional services:</span>
                            <span>
                              ₹{selectedBooking.servicesPrice.toLocaleString()}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between font-medium border-t pt-1">
                          <span>Total:</span>
                          <span>
                            ₹{selectedBooking.totalAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* License Photo Section - Show for vehicle rentals or if license photo exists */}
                {(isVehicleRentalBooking(selectedBooking) || selectedBooking.licensePhoto) && (
                  <div className="mt-6 border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-blue-600" />
                      Driving License Photo
                      {isVehicleRentalBooking(selectedBooking) && (
                        <span className="text-xs text-gray-500 font-normal ml-2">(Vehicle Rental Booking)</span>
                      )}
                    </h3>
                    <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
                      {selectedBooking.licensePhoto ? (
                        <div className="space-y-4">
                          <div className="relative">
                            <img
                              src={selectedBooking.licensePhoto}
                              alt="Driving License"
                              className="w-full max-w-md mx-auto rounded-lg border-2 border-gray-300 shadow-md object-contain bg-white p-2 cursor-pointer hover:opacity-90 transition-opacity"
                              style={{ maxHeight: '400px' }}
                              onError={(e) => {
                                console.error('Error loading license image:', selectedBooking.licensePhoto);
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+not+found';
                              }}
                              onClick={() => {
                                // Open image in new tab on click
                                if (selectedBooking.licensePhoto) {
                                  window.open(selectedBooking.licensePhoto, '_blank');
                                }
                              }}
                            />
                            <div className="absolute top-2 right-2">
                              {selectedBooking.licensePhotoVerified ? (
                                <div className="flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded-full text-xs font-medium shadow-lg">
                                  <ShieldCheck className="w-3 h-3" />
                                  Verified
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500 text-white rounded-full text-xs font-medium shadow-lg">
                                  <Clock className="w-3 h-3" />
                                  Pending Verification
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {selectedBooking.licensePhotoUploadedAt && (
                            <div className="text-xs text-gray-500 text-center">
                              Uploaded on: {new Date(selectedBooking.licensePhotoUploadedAt).toLocaleString()}
                            </div>
                          )}

                          {!selectedBooking.licensePhotoVerified && (
                            <div className="flex gap-3 justify-center pt-2">
                              <button
                                onClick={() => handleVerifyLicensePhoto(selectedBooking._id, true)}
                                disabled={verifyingLicense}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {verifyingLicense ? (
                                  <>
                                    <Loader className="w-4 h-4 animate-spin" />
                                    Verifying...
                                  </>
                                ) : (
                                  <>
                                    <ShieldCheck className="w-4 h-4" />
                                    Verify License
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleVerifyLicensePhoto(selectedBooking._id, false)}
                                disabled={verifyingLicense}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {verifyingLicense ? (
                                  <>
                                    <Loader className="w-4 h-4 animate-spin" />
                                    Rejecting...
                                  </>
                                ) : (
                                  <>
                                    <ShieldX className="w-4 h-4" />
                                    Reject
                                  </>
                                )}
                              </button>
                            </div>
                          )}

                          {selectedBooking.licensePhotoVerified && (
                            <div className="text-center">
                              <button
                                onClick={() => handleVerifyLicensePhoto(selectedBooking._id, false)}
                                disabled={verifyingLicense}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
                              >
                                {verifyingLicense ? (
                                  <>
                                    <Loader className="w-4 h-4 animate-spin" />
                                    Updating...
                                  </>
                                ) : (
                                  <>
                                    <ShieldX className="w-4 h-4" />
                                    Mark as Unverified
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>No license photo uploaded yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Status */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Status
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-sm text-gray-600">
                          Booking Status:
                        </span>
                        <span
                          className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            selectedBooking.status
                          )}`}
                        >
                          {selectedBooking.status}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">
                          Payment Status:
                        </span>
                        <span
                          className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(
                            selectedBooking.paymentStatus
                          )}`}
                        >
                          {selectedBooking.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  Created on{" "}
                  {new Date(selectedBooking.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookingsPage;
