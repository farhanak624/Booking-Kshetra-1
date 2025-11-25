"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Users,
  Wifi,
  Car,
  Coffee,
  Star,
  Calendar,
  Search,
  Tv,
  Wind,
  Utensils,
  Waves,
  TreePine,
  Bath,
  Bed,
  Mountain,
  Loader,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Camera,
  Clock,
  Heart,
  Zap,
  Percent
} from "lucide-react";
import Header from "../../components/Header";
import { bookingAPI, roomAPI } from "../../lib/api";
import { initiatePayment } from "../../utils/razorpay";
import { validateCoupon } from "../../lib/api/coupons";

interface Room {
  _id: string;
  roomNumber: string;
  roomType: "AC" | "Non-AC";
  pricePerNight: number;
  capacity: number;
  amenities: string[];
  description?: string;
  images: string[];
  isAvailable: boolean;
}

interface Guest {
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  idType: "Aadhaar" | "Passport" | "Driving License" | "PAN Card";
  idNumber: string;
  email?: string;
  phone?: string;
}

interface BookingData {
  // Step 1: Room & Dates
  roomId: string;
  checkIn: Date | null;
  checkOut: Date | null;

  // Step 2: Guest Details
  primaryGuest: {
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
  guests: Guest[];

  // Step 3: Services & Preferences
  services: {
    includeFood: boolean;
    includeBreakfast: boolean;
    transport: {
      pickup: boolean;
      drop: boolean;
      flightNumber?: string;
      arrivalTime?: string;
      departureTime?: string;
      airportLocation: "Kochi" | "Trivandrum";
    };
    bikeRental: {
      enabled: boolean;
      bikes: number;
      days: number;
    };
    yoga: {
      enabled: boolean;
      type: "200hr" | "300hr" | "single";
      participants: number;
    };
    sightseeing: boolean;
    surfing: boolean;
    additionalServices: string[];
  };

  specialRequests: string;
}

const BookingPageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Multi-step booking states
  const [currentStep, setCurrentStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);

  // Room loading states
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Room filtering states
  const [filters, setFilters] = useState({
    roomType: "all",
    priceRange: "all",
    capacity: "all",
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Booking data
  const [bookingData, setBookingData] = useState<BookingData>(() => ({
    roomId: "",
    checkIn: null,
    checkOut: null,
    primaryGuest: {
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
    guests: [],
    services: {
      includeFood: false,
      includeBreakfast: false,
      transport: {
        pickup: false,
        drop: false,
        airportLocation: "Kochi",
      },
      bikeRental: {
        enabled: false,
        bikes: 1,
        days: 1,
      },
      yoga: {
        enabled: false,
        type: "single",
        participants: 1,
      },
      sightseeing: false,
      surfing: false,
      additionalServices: [],
    },
    specialRequests: "",
  }));

  const [priceBreakdown, setPriceBreakdown] = useState<{
    nights: number;
    baseAmount: number;
    foodAmount: number;
    breakfastAmount: number;
    transportAmount: number;
    bikeRentalAmount: number;
    yogaAmount: number;
    sightseeingAmount: number;
    surfingAmount: number;
    total: number;
  }>({
    nights: 0,
    baseAmount: 0,
    foodAmount: 0,
    breakfastAmount: 0,
    transportAmount: 0,
    bikeRentalAmount: 0,
    yogaAmount: 0,
    sightseeingAmount: 0,
    surfingAmount: 0,
    total: 0,
  });

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Check for yoga session booking from URL params or localStorage
  useEffect(() => {
    const urlBookingType = searchParams.get('type');
    const selectedYogaSession = localStorage.getItem('selectedYogaSession');

    if (urlBookingType === 'yoga' && selectedYogaSession) {
      try {
        const yogaSession = JSON.parse(selectedYogaSession);

        // Pre-fill yoga booking data
        setBookingData(prev => ({
          ...prev,
          services: {
            ...prev.services,
            yoga: {
              enabled: true,
              type: yogaSession.type === '200hr' ? '200hr' : '300hr',
              participants: 1
            }
          }
        }));

        // Set pre-selected dates based on yoga session
        const checkIn = new Date(yogaSession.startDate);
        const checkOut = new Date(yogaSession.endDate);

        setBookingData(prev => ({
          ...prev,
          checkIn: checkIn,
          checkOut: checkOut
        }));

        // Clear the stored session
        localStorage.removeItem('selectedYogaSession');
      } catch (error) {
        console.error('Failed to parse yoga session data:', error);
      }
    }
  }, [searchParams]);

  // Fetch rooms from API using availability endpoint
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use tomorrow and day after for default dates
        const checkIn = new Date();
        checkIn.setDate(checkIn.getDate() + 1);
        const checkOut = new Date();
        checkOut.setDate(checkOut.getDate() + 2);

        const response = await roomAPI.checkAvailability({
          checkIn: checkIn.toISOString().split('T')[0],
          checkOut: checkOut.toISOString().split('T')[0]
        });

        const data = response.data;

        if (data.success && data.data?.availableRooms) {
          setRooms(data.data.availableRooms);
        } else {
          setError(data.message || 'Failed to fetch rooms');
        }
      } catch (err) {
        console.error('Error fetching rooms:', err);
        setError('Failed to load rooms. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Step navigation functions
  const nextStep = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(prev => Math.min(5, prev + 1));
      setIsTransitioning(false);
    }, 400);
  };

  const prevStep = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(prev => Math.max(1, prev - 1));
      setIsTransitioning(false);
    }, 400);
  };

  const goToStep = (step: number) => {
    if (isTransitioning || step === currentStep) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(step);
      setIsTransitioning(false);
    }, 400);
  };

  // Coupon helper functions
  const getServiceType = () => {
    if (bookingData.services.transport.pickup || bookingData.services.transport.drop) {
      return 'airport';
    }
    if (bookingData.services.yoga.enabled) {
      return 'yoga';
    }
    if (bookingData.services.bikeRental.enabled) {
      return 'rental';
    }
    if (bookingData.services.sightseeing || bookingData.services.surfing) {
      return 'adventure';
    }
    return 'airport'; // Default to airport for room bookings
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setValidatingCoupon(true);
    setCouponError('');

    try {
      const response = await validateCoupon({
        code: couponCode.trim(),
        serviceType: getServiceType(),
        orderValue: priceBreakdown.total,
        phoneNumber: bookingData.primaryGuest.phone
      });

      if ((response.data as any)?.success && (response.data as any)?.data) {
        setAppliedCoupon((response.data as any)?.data?.coupon);
        setCouponDiscount((response.data as any)?.data?.discount);
        setCouponError('');
      }
    } catch (error: any) {
      setCouponError(error.response?.data?.message || error.message || 'Invalid coupon code');
      setAppliedCoupon(null);
      setCouponDiscount(0);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponError('');
  };

  const getFinalAmount = () => {
    return priceBreakdown.total - couponDiscount;
  };

  // Calculate pricing
  const calculatePricing = () => {
    if (!selectedRoom || !bookingData.checkIn || !bookingData.checkOut) {
      setPriceBreakdown({
        nights: 0,
        baseAmount: 0,
        foodAmount: 0,
        breakfastAmount: 0,
        transportAmount: 0,
        bikeRentalAmount: 0,
        yogaAmount: 0,
        sightseeingAmount: 0,
        surfingAmount: 0,
        total: 0,
      });
      setTotalAmount(0);
      return;
    }

    const nights = Math.ceil(
      (bookingData.checkOut.getTime() - bookingData.checkIn.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const adults = bookingData.guests.filter((g) => g.age >= 5).length || 1;

    const baseAmount = selectedRoom.pricePerNight * nights;
    let foodAmount = 0;
    let breakfastAmount = 0;
    let transportAmount = 0;
    let bikeRentalAmount = 0;
    let yogaAmount = 0;
    let sightseeingAmount = 0;
    let surfingAmount = 0;

    // Food charges
    if (bookingData.services.includeFood) {
      foodAmount = adults * nights * 150;
    }

    // Breakfast charges
    if (bookingData.services.includeBreakfast) {
      breakfastAmount = adults * nights * 200;
    }

    // Transport charges
    if (bookingData.services.transport.pickup) transportAmount += 1500;
    if (bookingData.services.transport.drop) transportAmount += 1500;

    // Bike rental charges (₹500 per bike per day)
    if (bookingData.services.bikeRental.enabled) {
      bikeRentalAmount = bookingData.services.bikeRental.bikes * bookingData.services.bikeRental.days * 500;
    }

    // Yoga charges
    if (bookingData.services.yoga.enabled) {
      const participants = bookingData.services.yoga.participants;
      switch (bookingData.services.yoga.type) {
        case "200hr":
          yogaAmount = participants * 15000;
          break;
        case "300hr":
          yogaAmount = participants * 20000;
          break;
        case "single":
          yogaAmount = participants * 500; // Single session
          break;
      }
    }

    // Sightseeing charges (₹1500 per person)
    if (bookingData.services.sightseeing) {
      sightseeingAmount = adults * 1500;
    }

    // Surfing charges (₹2000 per person)
    if (bookingData.services.surfing) {
      surfingAmount = adults * 2000;
    }

    const total = baseAmount + foodAmount + breakfastAmount + transportAmount +
                  bikeRentalAmount + yogaAmount + sightseeingAmount + surfingAmount;

    setPriceBreakdown({
      nights,
      baseAmount,
      foodAmount,
      breakfastAmount,
      transportAmount,
      bikeRentalAmount,
      yogaAmount,
      sightseeingAmount,
      surfingAmount,
      total,
    });
    setTotalAmount(total);
  };

  useEffect(() => {
    calculatePricing();
  }, [selectedRoom, bookingData]);

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filters.roomType === "all" || room.roomType === filters.roomType;

    const matchesPrice =
      filters.priceRange === "all" ||
      (filters.priceRange === "budget" && room.pricePerNight < 2000) ||
      (filters.priceRange === "mid" &&
        room.pricePerNight >= 2000 &&
        room.pricePerNight < 4000) ||
      (filters.priceRange === "luxury" && room.pricePerNight >= 4000);

    const matchesCapacity =
      filters.capacity === "all" ||
      parseInt(filters.capacity) === room.capacity;

    return (
      matchesSearch &&
      matchesType &&
      matchesPrice &&
      matchesCapacity &&
      room.isAvailable
    );
  });

  const handleBookRoom = (room: Room) => {
    // Set selected room and booking data
    setSelectedRoom(room);
    setBookingData((prev) => ({
      ...prev,
      roomId: room._id,
      checkIn: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      checkOut: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
      guests: [], // Start with empty guests array
    }));

    // Go to next step (Guest Details)
    nextStep();
  };

  const RoomCard = ({ room }: { room: Room }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Room Image */}
      <div className="h-64 bg-gray-200 relative">
        {room.images.length > 0 ? (
          <img
            src={room.images[0]}
            alt={`Room ${room.roomNumber}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Car className="w-12 h-12 mx-auto mb-2" />
              <p>No Image Available</p>
            </div>
          </div>
        )}

        <div className="absolute top-4 right-4">
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              room.roomType === "AC"
                ? "bg-blue-100 text-blue-800"
                : "bg-orange-100 text-orange-800"
            }`}
          >
            {room.roomType}
          </span>
        </div>
      </div>

      {/* Room Details */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              Room {room.roomNumber}
            </h3>
            <div className="flex items-center text-gray-600 text-sm">
              <Users className="w-4 h-4 mr-1" />
              Up to {room.capacity} guests
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              ₹{room.pricePerNight.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">per night</div>
          </div>
        </div>

        {room.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {room.description}
          </p>
        )}

        {/* Amenities */}
        {room.amenities.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {room.amenities.slice(0, 4).map((amenity, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded flex items-center gap-1"
                >
                  {getAmenityIcon(amenity)}
                  {amenity}
                </span>
              ))}
              {room.amenities.length > 4 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  +{room.amenities.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-4 h-4 fill-yellow-400 text-yellow-400"
              />
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-600">4.8 (127 reviews)</span>
        </div>

        {/* Book Button */}
        <button
          onClick={() => handleBookRoom(room)}
          className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          Book Now
        </button>
      </div>
    </motion.div>
  );

  const getAmenityIcon = (amenity: string) => {
    const lowerAmenity = amenity.toLowerCase();
    if (lowerAmenity.includes("wifi")) return <Wifi className="w-3 h-3" />;
    if (lowerAmenity.includes("ac")) return <Wind className="w-3 h-3" />;
    if (lowerAmenity.includes("tv")) return <Tv className="w-3 h-3" />;
    if (lowerAmenity.includes("bathroom")) return <Bath className="w-3 h-3" />;
    if (lowerAmenity.includes("coffee") || lowerAmenity.includes("tea")) return <Coffee className="w-3 h-3" />;
    if (lowerAmenity.includes("balcony") || lowerAmenity.includes("terrace")) return <Mountain className="w-3 h-3" />;
    if (lowerAmenity.includes("view")) return <Waves className="w-3 h-3" />;
    if (lowerAmenity.includes("fridge")) return <Utensils className="w-3 h-3" />;
    if (lowerAmenity.includes("fan")) return <Wind className="w-3 h-3" />;
    if (lowerAmenity.includes("garden")) return <TreePine className="w-3 h-3" />;
    if (lowerAmenity.includes("sitting") || lowerAmenity.includes("living")) return <Bed className="w-3 h-3" />;
    return null;
  };

  // Step 1: Room Selection Component
  const RoomSelectionStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full mb-4 border border-blue-200/60 shadow-sm">
          <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-bold text-blue-700 tracking-wider">STEP 1 OF 3</span>
        </div>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
          Choose Your Perfect Room
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select from our carefully designed accommodations
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-6 mb-8"
      >
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <select
              value={filters.roomType}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, roomType: e.target.value }))
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="AC">AC Rooms</option>
              <option value="Non-AC">Non-AC Rooms</option>
            </select>

            <select
              value={filters.priceRange}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  priceRange: e.target.value,
                }))
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Prices</option>
              <option value="budget">Under ₹2,000</option>
              <option value="mid">₹2,000 - ₹4,000</option>
              <option value="luxury">Above ₹4,000</option>
            </select>

            <select
              value={filters.capacity}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, capacity: e.target.value }))
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Any Capacity</option>
              <option value="1">1 Guest</option>
              <option value="2">2 Guests</option>
              <option value="3">3 Guests</option>
              <option value="4">4+ Guests</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading rooms...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-20">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
            <div className="text-red-600 text-xl mb-2">Error</div>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Rooms Grid */}
      {!loading && !error && filteredRooms.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRooms.map((room) => (
            <RoomCard key={room._id} room={room} />
          ))}
        </div>
      )}

      {/* No Rooms States */}
      {!loading && !error && filteredRooms.length === 0 && rooms.length > 0 && (
        <div className="text-center py-20">
          <div className="text-gray-400 text-xl mb-2">No rooms found</div>
          <p className="text-gray-600">
            Try adjusting your filters or search criteria
          </p>
        </div>
      )}

      {!loading && !error && rooms.length === 0 && (
        <div className="text-center py-20">
          <div className="text-gray-400 text-xl mb-2">No rooms available</div>
          <p className="text-gray-600">
            Please check back later or contact us for more information.
          </p>
        </div>
      )}
    </motion.div>
  );

  // Step 2: Guest Details Component
  const GuestDetailsStep = () => {
    const handleGuestDetailsSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);

      setBookingData((prev) => ({
        ...prev,
        primaryGuest: {
          ...prev.primaryGuest,
          name: (formData.get("name") as string) || "",
          email: (formData.get("email") as string) || "",
          phone: (formData.get("phone") as string) || "",
          address: (formData.get("address") as string) || "",
          city: (formData.get("city") as string) || "",
          state: (formData.get("state") as string) || "",
          pincode: (formData.get("pincode") as string) || "",
          emergencyContact: {
            name: (formData.get("emergencyName") as string) || "",
            phone: (formData.get("emergencyPhone") as string) || "",
            relationship: (formData.get("emergencyRelationship") as string) || "",
          },
        },
      }));

      nextStep();
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-8"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full mb-4 border border-green-200/60 shadow-sm">
            <div className="w-1.5 h-1.5 bg-gradient-to-r from-green-500 to-blue-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-green-700 tracking-wider">STEP 2 OF 3</span>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            Your Information
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We need your details to create the perfect stay experience
          </p>
        </motion.div>

        <form
          onSubmit={handleGuestDetailsSubmit}
          className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-3">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={bookingData.primaryGuest.name}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-3">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                defaultValue={bookingData.primaryGuest.email}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-800 mb-3">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                defaultValue={bookingData.primaryGuest.phone}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
                placeholder="+91 9876543210"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-semibold text-gray-800 mb-3">
                Address *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                defaultValue={bookingData.primaryGuest.address}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
                placeholder="Your address"
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-semibold text-gray-800 mb-3">
                City *
              </label>
              <input
                type="text"
                id="city"
                name="city"
                defaultValue={bookingData.primaryGuest.city}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
              />
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-semibold text-gray-800 mb-3">
                State *
              </label>
              <input
                type="text"
                id="state"
                name="state"
                defaultValue={bookingData.primaryGuest.state}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-8">
            <button
              type="button"
              onClick={prevStep}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Rooms
            </button>

            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300"
            >
              Continue to Services
              <ArrowRight className="w-5 h-5 ml-2 inline" />
            </button>
          </div>
        </form>
      </motion.div>
    );
  };

  // Step 3: Services Component
  const ServicesStep = () => {
    const handleServicesSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);

      setBookingData((prev) => ({
        ...prev,
        services: {
          ...prev.services,
          includeFood: formData.get("includeFood") === "on",
          includeBreakfast: formData.get("includeBreakfast") === "on",
          transport: {
            ...prev.services.transport,
            pickup: formData.get("pickup") === "on",
            drop: formData.get("drop") === "on",
          },
        },
        specialRequests: (formData.get("specialRequests") as string) || "",
      }));

      // Show summary/confirmation
      nextStep();
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-8"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full mb-4 border border-orange-200/60 shadow-sm">
            <div className="w-1.5 h-1.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-orange-700 tracking-wider">STEP 3 OF 3</span>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            Customize Your Experience
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Add services to make your stay perfect
          </p>
        </motion.div>

        <form onSubmit={handleServicesSubmit} className="space-y-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Food Services</h3>
            <div className="space-y-4">
              <label className="flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md">
                <input
                  type="checkbox"
                  name="includeFood"
                  checked={bookingData.services.includeFood}
                  onChange={(e) => {
                    setBookingData((prev) => ({
                      ...prev,
                      services: {
                        ...prev.services,
                        includeFood: e.target.checked,
                      },
                    }));
                  }}
                  className="mr-4 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold text-gray-900">Include Meals</span>
                      <p className="text-sm text-gray-600 mt-1">3 meals per day for all guests</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-green-600">+₹150</span>
                      <p className="text-xs text-gray-500">per person/day</p>
                    </div>
                  </div>
                </div>
              </label>

              <label className="flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md">
                <input
                  type="checkbox"
                  name="includeBreakfast"
                  checked={bookingData.services.includeBreakfast}
                  onChange={(e) => {
                    setBookingData((prev) => ({
                      ...prev,
                      services: {
                        ...prev.services,
                        includeBreakfast: e.target.checked,
                      },
                    }));
                  }}
                  className="mr-4 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold text-gray-900">Breakfast Only</span>
                      <p className="text-sm text-gray-600 mt-1">Daily breakfast service</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-green-600">+₹200</span>
                      <p className="text-xs text-gray-500">per person/day</p>
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Transport Services</h3>
            <div className="space-y-4">
              <label className="flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md">
                <input
                  type="checkbox"
                  name="pickup"
                  checked={bookingData.services.transport.pickup}
                  onChange={(e) => {
                    setBookingData((prev) => ({
                      ...prev,
                      services: {
                        ...prev.services,
                        transport: {
                          ...prev.services.transport,
                          pickup: e.target.checked,
                        },
                      },
                    }));
                  }}
                  className="mr-4 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Car className="w-5 h-5 text-blue-600" />
                      <div>
                        <span className="font-semibold text-gray-900">Airport Pickup</span>
                        <p className="text-sm text-gray-600 mt-1">Comfortable pickup service from airport</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-blue-600">+₹1,500</span>
                      <p className="text-xs text-gray-500">one-time</p>
                    </div>
                  </div>
                </div>
              </label>

              <label className="flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md">
                <input
                  type="checkbox"
                  name="drop"
                  checked={bookingData.services.transport.drop}
                  onChange={(e) => {
                    setBookingData((prev) => ({
                      ...prev,
                      services: {
                        ...prev.services,
                        transport: {
                          ...prev.services.transport,
                          drop: e.target.checked,
                        },
                      },
                    }));
                  }}
                  className="mr-4 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Car className="w-5 h-5 text-blue-600" />
                      <div>
                        <span className="font-semibold text-gray-900">Airport Drop</span>
                        <p className="text-sm text-gray-600 mt-1">Safe drop service to airport</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-blue-600">+₹1,500</span>
                      <p className="text-xs text-gray-500">one-time</p>
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Bike Rental Services */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Bike Rental</h3>
            <label className="flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md">
              <input
                type="checkbox"
                checked={bookingData.services.bikeRental.enabled}
                onChange={(e) => {
                  setBookingData((prev) => ({
                    ...prev,
                    services: {
                      ...prev.services,
                      bikeRental: {
                        ...prev.services.bikeRental,
                        enabled: e.target.checked,
                      },
                    },
                  }));
                }}
                className="mt-1 mr-4 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm3 2h2v2H7V4zm8 0h2v2h-2V4zM7 8h2v2H7V8zm8 0h2v2h-2V8zM7 12h2v2H7v-2zm8 0h2v2h-2v-2z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <span className="font-semibold text-gray-900">Rent a Bike</span>
                      <p className="text-sm text-gray-600 mt-1">Explore the beautiful countryside and beaches</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-green-600">₹500</span>
                    <p className="text-xs text-gray-500">per bike/day</p>
                  </div>
                </div>
                {bookingData.services.bikeRental.enabled && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Number of Bikes</label>
                      <select
                        value={bookingData.services.bikeRental.bikes}
                        onChange={(e) => {
                          setBookingData((prev) => ({
                            ...prev,
                            services: {
                              ...prev.services,
                              bikeRental: {
                                ...prev.services.bikeRental,
                                bikes: parseInt(e.target.value),
                              },
                            },
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        {[1, 2, 3, 4, 5].map(num => (
                          <option key={num} value={num}>{num} bike{num > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Number of Days</label>
                      <select
                        value={bookingData.services.bikeRental.days}
                        onChange={(e) => {
                          setBookingData((prev) => ({
                            ...prev,
                            services: {
                              ...prev.services,
                              bikeRental: {
                                ...prev.services.bikeRental,
                                days: parseInt(e.target.value),
                              },
                            },
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        {[1, 2, 3, 4, 5, 6, 7].map(num => (
                          <option key={num} value={num}>{num} day{num > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </label>
          </div>

          {/* Yoga Services */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Yoga Sessions</h3>
            <label className="flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md">
              <input
                type="checkbox"
                checked={bookingData.services.yoga.enabled}
                onChange={(e) => {
                  setBookingData((prev) => ({
                    ...prev,
                    services: {
                      ...prev.services,
                      yoga: {
                        ...prev.services.yoga,
                        enabled: e.target.checked,
                      },
                    },
                  }));
                }}
                className="mt-1 mr-4 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <span className="font-semibold text-gray-900">Yoga Sessions</span>
                      <p className="text-sm text-gray-600 mt-1">Join our peaceful yoga sessions by the beach</p>
                    </div>
                  </div>
                </div>
                {bookingData.services.yoga.enabled && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Session Type</label>
                      <select
                        value={bookingData.services.yoga.type}
                        onChange={(e) => {
                          setBookingData((prev) => ({
                            ...prev,
                            services: {
                              ...prev.services,
                              yoga: {
                                ...prev.services.yoga,
                                type: e.target.value as "200hr" | "300hr" | "single",
                              },
                            },
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="single">Single Session (₹500)</option>
                        <option value="200hr">200hr Course (₹15,000)</option>
                        <option value="300hr">300hr Course (₹20,000)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Participants</label>
                      <select
                        value={bookingData.services.yoga.participants}
                        onChange={(e) => {
                          setBookingData((prev) => ({
                            ...prev,
                            services: {
                              ...prev.services,
                              yoga: {
                                ...prev.services.yoga,
                                participants: parseInt(e.target.value),
                              },
                            },
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        {[1, 2, 3, 4, 5, 6].map(num => (
                          <option key={num} value={num}>{num} person{num > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </label>
          </div>

          {/* Adventure Activities */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Adventure Activities</h3>
            <div className="space-y-4">
              <label className="flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md">
                <input
                  type="checkbox"
                  checked={bookingData.services.sightseeing}
                  onChange={(e) => {
                    setBookingData((prev) => ({
                      ...prev,
                      services: {
                        ...prev.services,
                        sightseeing: e.target.checked,
                      },
                    }));
                  }}
                  className="mr-4 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Mountain className="w-5 h-5 text-green-600" />
                      <div>
                        <span className="font-semibold text-gray-900">Sightseeing Tour</span>
                        <p className="text-sm text-gray-600 mt-1">Explore local attractions and scenic spots</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-green-600">+₹1,500</span>
                      <p className="text-xs text-gray-500">per person</p>
                    </div>
                  </div>
                </div>
              </label>

              <label className="flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md">
                <input
                  type="checkbox"
                  checked={bookingData.services.surfing}
                  onChange={(e) => {
                    setBookingData((prev) => ({
                      ...prev,
                      services: {
                        ...prev.services,
                        surfing: e.target.checked,
                      },
                    }));
                  }}
                  className="mr-4 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Waves className="w-5 h-5 text-blue-600" />
                      <div>
                        <span className="font-semibold text-gray-900">Surfing Lessons</span>
                        <p className="text-sm text-gray-600 mt-1">Learn surfing with professional instructors</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-blue-600">+₹2,000</span>
                      <p className="text-xs text-gray-500">per person</p>
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Requests</h3>
            <textarea
              name="specialRequests"
              defaultValue={bookingData.specialRequests}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Any special requests or requirements..."
            />
          </div>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={prevStep}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Details
            </button>

            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300"
            >
              Review & Book
              <CheckCircle className="w-5 h-5 ml-2 inline" />
            </button>
          </div>
        </form>
      </motion.div>
    );
  };

  // Confirmation Step
  const ConfirmationStep = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const createBooking = async () => {
      try {
        setIsProcessing(true);

        // Validate primary guest data
        if (!bookingData.primaryGuest.name || !bookingData.primaryGuest.email || !bookingData.primaryGuest.phone) {
          throw new Error('Please fill in all required primary guest details (name, email, phone)');
        }

        // Include primary guest in guests array if no other guests are added
        const filteredGuests = bookingData.guests.filter(guest => guest.name.trim() !== '');
        const guestsArray = filteredGuests.length > 0 ? filteredGuests : [
          {
            name: bookingData.primaryGuest.name,
            age: 25, // Default age for primary guest
            gender: 'Other' as const
          }
        ];

        const bookingPayload = {
          roomId: bookingData.roomId,
          checkIn: bookingData.checkIn?.toISOString(),
          checkOut: bookingData.checkOut?.toISOString(),
          primaryGuestInfo: {
            name: bookingData.primaryGuest.name,
            email: bookingData.primaryGuest.email,
            phone: bookingData.primaryGuest.phone,
            address: bookingData.primaryGuest.address || '',
            city: bookingData.primaryGuest.city || '',
            state: bookingData.primaryGuest.state || '',
            pincode: bookingData.primaryGuest.pincode || '',
            emergencyContact: bookingData.primaryGuest.emergencyContact || {
              name: '',
              phone: '',
              relationship: ''
            }
          },
          guests: guestsArray,
          includeFood: bookingData.services.includeFood,
          includeBreakfast: bookingData.services.includeBreakfast,
          transport: bookingData.services.transport,
          selectedServices: [], // Map services if needed
          specialRequests: bookingData.specialRequests,
          totalAmount: priceBreakdown.total,
          couponCode: appliedCoupon ? couponCode : undefined,
          paymentStatus: 'pending'
        };

        const response = await bookingAPI.createPublicBooking(bookingPayload);

        if (response.data?.success) {
          console.log('✅ Booking created successfully:', response.data.data);
          const bookingId = response.data.data.booking._id;
          console.log('📋 Extracted booking ID:', bookingId);
          setBookingId(bookingId);
          return bookingId;
        } else {
          throw new Error(response.data?.message || 'Failed to create booking');
        }
      } catch (error) {
        console.error('Booking creation error:', error);
        throw error;
      } finally {
        setIsProcessing(false);
      }
    };

    const handlePaymentSuccess = (paymentData: any) => {
      setPaymentSuccess(true);
      console.log('Payment successful:', paymentData);
      // You can redirect to success page or show success message
      setTimeout(() => {
        router.push('/booking-success?bookingId=' + bookingId);
      }, 2000);
    };

    const handlePaymentError = (error: any) => {
      console.error('Payment error:', error);
      alert('Payment failed: ' + (error.message || 'Unknown error'));
    };

    const handleConfirmBooking = async () => {
      try {
        console.log('🚀 Starting one-click booking flow...');

        // Create booking first
        const createdBookingId = await createBooking();

        console.log('✅ Booking created, now opening Razorpay...');

        // Immediately trigger payment after booking creation
        await initiatePayment({
          amount: getFinalAmount(),
          bookingId: createdBookingId,
          userDetails: {
            name: bookingData.primaryGuest.name,
            email: bookingData.primaryGuest.email,
            phone: bookingData.primaryGuest.phone,
          },
          onSuccess: handlePaymentSuccess,
          onError: handlePaymentError
        });

      } catch (error) {
        console.error('❌ Booking/Payment flow error:', error);
        alert('Failed to create booking: ' + (error as Error).message);
      }
    };

    if (paymentSuccess) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="text-center py-12"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            🎉 Booking Confirmed!
          </h2>
          <p className="text-lg text-gray-600 mb-4">
            Your payment was successful and your booking has been confirmed.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Booking ID: <span className="font-mono font-semibold">{bookingId}</span>
          </p>
          <div className="text-sm text-gray-600">
            Redirecting to booking details...
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-8"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full mb-4 border border-emerald-200/60 shadow-sm">
            <div className="w-1.5 h-1.5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-emerald-700 tracking-wider">FINAL STEP</span>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            Booking Summary
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Review your booking details and complete the payment
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Booking Details */}
          <div className="space-y-6">
            {/* Room Details */}
            {selectedRoom && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Bed className="w-5 h-5 text-blue-600" />
                  Room Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room Number:</span>
                    <span className="font-semibold">{selectedRoom.roomNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room Type:</span>
                    <span className="font-semibold">{selectedRoom.roomType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Capacity:</span>
                    <span className="font-semibold">{selectedRoom.capacity} guests</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price per night:</span>
                    <span className="font-semibold">₹{selectedRoom.pricePerNight.toLocaleString()}</span>
                  </div>
                  {bookingData.checkIn && bookingData.checkOut && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Check-in:</span>
                        <span className="font-semibold">{bookingData.checkIn.toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Check-out:</span>
                        <span className="font-semibold">{bookingData.checkOut.toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-semibold">{priceBreakdown.nights} nights</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Guest Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                Guest Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-semibold">{bookingData.primaryGuest.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-semibold">{bookingData.primaryGuest.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-semibold">{bookingData.primaryGuest.phone}</span>
                </div>
              </div>
            </div>

            {/* Services */}
            {(bookingData.services.includeFood || bookingData.services.includeBreakfast ||
              bookingData.services.transport.pickup || bookingData.services.transport.drop) && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Coffee className="w-5 h-5 text-orange-600" />
                  Additional Services
                </h3>
                <div className="space-y-3">
                  {bookingData.services.includeFood && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Meals included</span>
                      <span className="font-semibold text-green-600">✓</span>
                    </div>
                  )}
                  {bookingData.services.includeBreakfast && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Breakfast included</span>
                      <span className="font-semibold text-green-600">✓</span>
                    </div>
                  )}
                  {bookingData.services.transport.pickup && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Airport pickup</span>
                      <span className="font-semibold text-green-600">✓</span>
                    </div>
                  )}
                  {bookingData.services.transport.drop && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Airport drop</span>
                      <span className="font-semibold text-green-600">✓</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Price Breakdown & Payment */}
          <div className="space-y-6">
            {/* Coupon Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Percent className="w-5 h-5 text-orange-600" />
                Apply Coupon
              </h3>

              {!appliedCoupon ? (
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={!couponCode.trim() || validatingCoupon}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {validatingCoupon ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      'Apply'
                    )}
                  </button>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-green-700 font-medium">
                        <CheckCircle className="w-4 h-4" />
                        {appliedCoupon.code}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{appliedCoupon.description}</p>
                      <p className="text-sm text-green-600 mt-1">
                        Discount: ₹{couponDiscount.toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              {couponError && (
                <p className="text-red-600 text-sm mt-2">{couponError}</p>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Price Breakdown
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Room ({priceBreakdown.nights} nights)</span>
                  <span className="font-semibold">₹{priceBreakdown.baseAmount.toLocaleString()}</span>
                </div>
                {priceBreakdown.foodAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Food services</span>
                    <span className="font-semibold">₹{priceBreakdown.foodAmount.toLocaleString()}</span>
                  </div>
                )}
                {priceBreakdown.breakfastAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Breakfast services</span>
                    <span className="font-semibold">₹{priceBreakdown.breakfastAmount.toLocaleString()}</span>
                  </div>
                )}
                {priceBreakdown.transportAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transport services</span>
                    <span className="font-semibold">₹{priceBreakdown.transportAmount.toLocaleString()}</span>
                  </div>
                )}
                {priceBreakdown.bikeRentalAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bike rental</span>
                    <span className="font-semibold">₹{priceBreakdown.bikeRentalAmount.toLocaleString()}</span>
                  </div>
                )}
                {priceBreakdown.yogaAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Yoga sessions</span>
                    <span className="font-semibold">₹{priceBreakdown.yogaAmount.toLocaleString()}</span>
                  </div>
                )}
                {priceBreakdown.sightseeingAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sightseeing tour</span>
                    <span className="font-semibold">₹{priceBreakdown.sightseeingAmount.toLocaleString()}</span>
                  </div>
                )}
                {priceBreakdown.surfingAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Surfing lessons</span>
                    <span className="font-semibold">₹{priceBreakdown.surfingAmount.toLocaleString()}</span>
                  </div>
                )}
                <hr className="my-4" />
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">₹{priceBreakdown.total.toLocaleString()}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount</span>
                    <span>-₹{couponDiscount.toLocaleString()}</span>
                  </div>
                )}
                <hr className="my-4" />
                <div className="flex justify-between text-xl font-bold">
                  <span>Total Amount</span>
                  <span className="text-blue-600">₹{getFinalAmount().toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 border border-blue-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                Secure Payment
              </h3>

              <div className="space-y-4">
                <p className="text-gray-600 text-sm">
                  Click below to book your stay and complete payment securely with Razorpay.
                </p>
                <button
                  onClick={handleConfirmBooking}
                  disabled={isProcessing}
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Book & Pay ₹{getFinalAmount().toLocaleString()}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6">
          <button
            onClick={prevStep}
            disabled={isProcessing}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Services
          </button>

          {bookingData.specialRequests && (
            <div className="flex-1 mx-8">
              <p className="text-sm text-gray-600">
                <strong>Special Requests:</strong> {bookingData.specialRequests}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const steps = [
    { number: 1, title: "Select Room", component: <RoomSelectionStep /> },
    { number: 2, title: "Guest Details", component: <GuestDetailsStep /> },
    { number: 3, title: "Services", component: <ServicesStep /> },
    { number: 4, title: "Confirmation", component: <ConfirmationStep /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-[100px] 2xl:px-[120px] text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-light mb-4">Book Your Room</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Complete your booking in just a few simple steps
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-[100px] 2xl:px-[120px] py-8">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {steps.slice(0, 4).map((step) => (
              <motion.div
                key={step.number}
                className="flex flex-col items-center cursor-pointer group"
                onClick={() => step.number <= currentStep && goToStep(step.number)}
                whileHover={{ y: -2 }}
              >
                <motion.div
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold border-4 transition-all duration-300 ${
                    currentStep === step.number
                      ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white border-blue-200 shadow-lg"
                      : currentStep > step.number
                      ? "bg-gradient-to-br from-green-400 to-emerald-500 text-white border-green-200"
                      : "bg-white text-gray-400 border-gray-300"
                  }`}
                  animate={{
                    scale: currentStep === step.number ? [1, 1.05, 1] : 1,
                  }}
                  transition={{
                    duration: 2,
                    repeat: currentStep === step.number ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                >
                  {currentStep > step.number ? (
                    <CheckCircle className="w-7 h-7" />
                  ) : (
                    <span>{step.number}</span>
                  )}
                </motion.div>
                <h3
                  className={`mt-3 text-sm font-semibold transition-colors duration-300 ${
                    currentStep === step.number
                      ? "text-blue-600"
                      : currentStep > step.number
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  {step.title}
                </h3>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.5 }}
          >
            {steps[currentStep - 1]?.component}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

const BookingPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingPageContent />
    </Suspense>
  );
};

export default BookingPage;