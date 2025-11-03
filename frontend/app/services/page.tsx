'use client'

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Car,
  Bike,
  Waves,
  Plus,
  Minus,
  Calendar,
  ArrowRight,
  Clock,
  Users,
  MapPin,
  CheckCircle,
  Activity,
  Eye,
  Filter,
  Fuel,
  Settings,
  IndianRupee,
  Shield
} from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { vehicleAPI, adventureSportsAPI } from '../../lib/api';

interface Service {
  _id: string;
  name: string;
  category: 'vehicle_rental' | 'surfing' | 'adventure' | 'diving' | 'trekking';
  price: number;
  priceUnit: string;
  description: string;
  duration?: string;
  features: string[];
  image?: string;
  images?: string[];
  maxQuantity?: number;
  isActive: boolean;
  detailedDescription?: string;
  includedItems?: string[];
  requirements?: string[];
  ageRestriction?: {
    minAge?: number;
    maxAge?: number;
  };
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  location?: string;
  instructor?: {
    name: string;
    experience: string;
    certifications: string[];
  };
  safety?: string[];
  whatToBring?: string[];
  cancellationPolicy?: string;
}

interface Vehicle {
  _id: string;
  name: string;
  type: '2-wheeler' | '4-wheeler';
  category: 'scooter' | 'bike' | 'car' | 'suv';
  brand: string;
  vehicleModel: string;
  year: number;
  fuelType: 'petrol' | 'diesel' | 'electric';
  transmission: 'manual' | 'automatic';
  seatingCapacity: number;
  pricePerDay: number;
  images: string[];
  features: string[];
  description: string;
  specifications: {
    engine?: string;
    mileage?: string;
    fuelCapacity?: string;
    power?: string;
    torque?: string;
    topSpeed?: string;
  };
  availability: {
    isAvailable: boolean;
    availableFrom?: Date;
    availableTo?: Date;
  };
  location: {
    pickupLocation: string;
    dropLocation?: string;
  };
  insurance: {
    included: boolean;
    coverage?: string;
  };
  driverOption: {
    withDriver: boolean;
    withoutDriver: boolean;
    driverChargePerDay?: number;
  };
  depositAmount: number;
  termsAndConditions: string[];
  contactInfo: {
    phone: string;
    email: string;
  };
  isActive: boolean;
}

interface SelectedService extends Service {
  quantity: number;
  selectedOptions?: {
    // Vehicle rental options
    rentalDays?: number;
    // Surfing options
    sessionLevel?: 'beginner' | 'intermediate' | 'advanced';
  };
}

interface SelectedVehicle extends Vehicle {
  quantity: number;
  rentalDays: number;
  withDriver: boolean;
}

// Adventure sports will be fetched from API

const ServicesPage = () => {
  const router = useRouter();
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [selectedVehicles, setSelectedVehicles] = useState<SelectedVehicle[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [adventureSports, setAdventureSports] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<'all' | '2-wheeler' | '4-wheeler'>('all');
  const [selectedVehicleDetails, setSelectedVehicleDetails] = useState<Vehicle | null>(null);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [selectedServiceDetails, setSelectedServiceDetails] = useState<Service | null>(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  // Fetch vehicles and adventure sports from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchVehicles(),
        fetchAdventureSports()
      ]);
      setLoading(false);
    };
    fetchData();
  }, [vehicleTypeFilter]);

  const fetchVehicles = async () => {
    try {
      const response = vehicleTypeFilter === 'all'
        ? await vehicleAPI.getAllVehicles()
        : await vehicleAPI.getVehiclesByType(vehicleTypeFilter);

      if (response.data.success) {
        setVehicles(response.data.data.vehicles || []);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const fetchAdventureSports = async () => {
    try {
      const response = await adventureSportsAPI.getAllAdventureSports();
      if (response.data.success) {
        // Transform the adventure sports data to match Service interface
        const transformedSports = response.data.data.sports.map((sport: any) => ({
          _id: sport._id,
          name: sport.name,
          category: sport.category,
          price: sport.price,
          priceUnit: sport.priceUnit,
          description: sport.description,
          detailedDescription: sport.detailedDescription,
          duration: sport.duration,
          difficulty: sport.difficulty,
          location: sport.location,
          features: sport.features || [],
          includedItems: sport.includedItems || [],
          requirements: sport.requirements || [],
          images: sport.images || [],
          ageRestriction: sport.ageRestriction,
          instructor: sport.instructor,
          safety: sport.safety || [],
          whatToBring: sport.whatToBring || [],
          cancellationPolicy: sport.cancellationPolicy,
          maxQuantity: sport.maxQuantity,
          isActive: sport.isActive
        }));
        setAdventureSports(transformedSports);
      }
    } catch (error) {
      console.error('Error fetching adventure sports:', error);
    }
  };

  const getServiceIcon = (category: 'vehicle_rental' | 'surfing' | 'adventure' | 'diving' | 'trekking') => {
    switch (category) {
      case 'vehicle_rental':
        return Car;
      case 'surfing':
      case 'diving':
        return Waves;
      case 'adventure':
      case 'trekking':
        return Activity;
      default:
        return Activity;
    }
  };

  const formatPrice = (price: number, unit: string) => {
    const basePrice = `₹${price.toLocaleString()}`;
    switch (unit) {
      case 'per_person':
        return `${basePrice} per person`;
      case 'per_day':
        return `${basePrice} per day`;
      case 'per_session':
        return `${basePrice} per session`;
      case 'per_trip':
        return `${basePrice} per trip`;
      default:
        return basePrice;
    }
  };

  const addService = (service: Service) => {
    const existingService = selectedServices.find(s => s._id === service._id);
    if (existingService) {
      if (existingService.quantity < (service.maxQuantity || 10)) {
        setSelectedServices(prev =>
          prev.map(s =>
            s._id === service._id
              ? { ...s, quantity: s.quantity + 1 }
              : s
          )
        );
      }
    } else {
      const newService: SelectedService = {
        ...service,
        quantity: 1,
        selectedOptions: {}
      };

      setSelectedServices(prev => [...prev, newService]);
    }
  };

  const updateServiceOptions = (serviceId: string, options: SelectedService['selectedOptions']) => {
    setSelectedServices(prev =>
      prev.map(s =>
        s._id === serviceId
          ? { ...s, selectedOptions: { ...s.selectedOptions, ...options } }
          : s
      )
    );
  };

  const removeService = (serviceId: string) => {
    const existingService = selectedServices.find(s => s._id === serviceId);
    if (existingService && existingService.quantity > 1) {
      setSelectedServices(prev =>
        prev.map(s =>
          s._id === serviceId
            ? { ...s, quantity: s.quantity - 1 }
            : s
        )
      );
    } else {
      setSelectedServices(prev => prev.filter(s => s._id !== serviceId));
    }
  };

  const addVehicle = (vehicle: Vehicle, rentalDays: number = 1, withDriver: boolean = false) => {
    const existingVehicle = selectedVehicles.find(v => v._id === vehicle._id);
    if (existingVehicle) {
      setSelectedVehicles(prev =>
        prev.map(v =>
          v._id === vehicle._id
            ? { ...v, quantity: v.quantity + 1 }
            : v
        )
      );
    } else {
      const newVehicle: SelectedVehicle = {
        ...vehicle,
        quantity: 1,
        rentalDays,
        withDriver
      };
      setSelectedVehicles(prev => [...prev, newVehicle]);
    }
  };

  const removeVehicle = (vehicleId: string) => {
    const existingVehicle = selectedVehicles.find(v => v._id === vehicleId);
    if (existingVehicle && existingVehicle.quantity > 1) {
      setSelectedVehicles(prev =>
        prev.map(v =>
          v._id === vehicleId
            ? { ...v, quantity: v.quantity - 1 }
            : v
        )
      );
    } else {
      setSelectedVehicles(prev => prev.filter(v => v._id !== vehicleId));
    }
  };

  const updateVehicleOptions = (vehicleId: string, rentalDays?: number, withDriver?: boolean) => {
    setSelectedVehicles(prev =>
      prev.map(v =>
        v._id === vehicleId
          ? {
              ...v,
              ...(rentalDays !== undefined && { rentalDays }),
              ...(withDriver !== undefined && { withDriver })
            }
          : v
      )
    );
  };

  const getTotalAmount = () => {
    const servicesTotal = selectedServices.reduce((total, service) => {
      return total + (service.price * service.quantity);
    }, 0);

    const vehiclesTotal = selectedVehicles.reduce((total, vehicle) => {
      const basePrice = vehicle.pricePerDay * vehicle.rentalDays * vehicle.quantity;
      const driverCharge = vehicle.withDriver && vehicle.driverOption.driverChargePerDay
        ? vehicle.driverOption.driverChargePerDay * vehicle.rentalDays * vehicle.quantity
        : 0;
      return total + basePrice + driverCharge;
    }, 0);

    return servicesTotal + vehiclesTotal;
  };

  const handleBookServices = () => {
    if (selectedServices.length === 0 && selectedVehicles.length === 0) {
      alert('Please select at least one service or vehicle');
      return;
    }
    if (!selectedDate) {
      alert('Please select a service date');
      return;
    }

    // Store booking data in localStorage
    const bookingData = {
      services: selectedServices,
      vehicles: selectedVehicles,
      date: selectedDate,
      totalAmount: getTotalAmount(),
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('servicesBookingData', JSON.stringify(bookingData));

    // Redirect to booking details
    router.push('/services/booking/details');
  };

  const ServiceCard = ({ service }: { service: Service }) => {
    const ServiceIcon = getServiceIcon(service.category);
    const selectedService = selectedServices.find(s => s._id === service._id);
    const quantity = selectedService?.quantity || 0;

    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300 overflow-hidden">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4 lg:mb-6">
            {/* Service Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
                <div className="p-2 sm:p-3 bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-xl w-fit">
                  <ServiceIcon className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">{service.name}</h3>
                  <p className="text-gray-300 text-sm sm:text-base">{service.description}</p>
                </div>
              </div>

              {/* Duration */}
              {service.duration && (
                <div className="flex items-center gap-2 mb-3 sm:mb-4 text-gray-300">
                  <Clock className="w-4 h-4 text-orange-400" />
                  <span className="text-xs sm:text-sm">Duration: {service.duration}</span>
                </div>
              )}

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
                {service.features.slice(0, 4).map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300 text-xs sm:text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Price */}
              <div className="inline-block bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-xl px-3 py-2 sm:px-4 sm:py-2 mb-4">
                <div className="text-lg sm:text-2xl font-bold text-orange-400">
                  {formatPrice(service.price, service.priceUnit)}
                </div>
              </div>

              {/* View Details Button */}
              <button
                onClick={() => {
                  setSelectedServiceDetails(service);
                  setShowServiceModal(true);
                }}
                className="mb-4 text-orange-400 hover:text-orange-300 font-medium text-sm flex items-center gap-2 transition-colors"
              >
                <Eye className="w-4 h-4" />
                View Details
              </button>
            </div>

            {/* Quantity Controls */}
            <div className="mt-4 lg:mt-0 lg:ml-6 xl:ml-8">
              {quantity > 0 ? (
                <div className="text-center">
                  <div className="text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3">Selected</div>
                  <div className="flex items-center gap-2 sm:gap-3 bg-white/10 rounded-xl p-2 sm:p-3">
                    <button
                      onClick={() => removeService(service._id)}
                      className="w-7 h-7 sm:w-8 sm:h-8 bg-red-500/20 hover:bg-red-500/30 rounded-full flex items-center justify-center text-red-400 transition-colors"
                    >
                      <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    <span className="text-lg sm:text-xl font-bold text-white w-5 sm:w-6 text-center">{quantity}</span>
                    <button
                      onClick={() => addService(service)}
                      disabled={quantity >= (service.maxQuantity || 10)}
                      className="w-7 h-7 sm:w-8 sm:h-8 bg-green-500/20 hover:bg-green-500/30 rounded-full flex items-center justify-center text-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                  <div className="text-gray-500 text-xs mt-2">
                    Max: {service.maxQuantity || 10}
                  </div>
                  {quantity > 0 && (
                    <div className="text-orange-400 font-semibold text-xs sm:text-sm mt-2">
                      Total: ₹{(service.price * quantity).toLocaleString()}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => addService(service)}
                  className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base"
                >
                  Add Service
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  };

  const VehicleCard = ({ vehicle }: { vehicle: Vehicle }) => {
    const selectedVehicle = selectedVehicles.find(v => v._id === vehicle._id);
    const quantity = selectedVehicle?.quantity || 0;
    const [rentalDays, setRentalDays] = useState(selectedVehicle?.rentalDays || 1);
    const [withDriver, setWithDriver] = useState(selectedVehicle?.withDriver || false);

    const VehicleIcon = vehicle.type === '2-wheeler' ? Bike : Car;

    const getTotalPrice = () => {
      const basePrice = vehicle.pricePerDay * rentalDays;
      const driverCharge = withDriver && vehicle.driverOption.driverChargePerDay
        ? vehicle.driverOption.driverChargePerDay * rentalDays
        : 0;
      return basePrice + driverCharge;
    };

    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300 overflow-hidden">
        <div className="p-4 sm:p-6">
          {/* Vehicle Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="p-2 bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-lg flex-shrink-0">
                <VehicleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-white truncate">{vehicle.name}</h3>
                <p className="text-gray-300 text-xs sm:text-sm truncate">{vehicle.brand} {vehicle.vehicleModel}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedVehicleDetails(vehicle);
                setShowVehicleModal(true);
              }}
              className="p-2 text-gray-400 hover:text-white transition-colors flex-shrink-0"
            >
              <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Vehicle Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-4">
            <div className="flex items-center gap-2 text-gray-300 text-xs sm:text-sm">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400 flex-shrink-0" />
              <span>{vehicle.seatingCapacity} seats</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300 text-xs sm:text-sm">
              <Fuel className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400 flex-shrink-0" />
              <span>{vehicle.fuelType}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300 text-xs sm:text-sm">
              <Settings className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400 flex-shrink-0" />
              <span>{vehicle.transmission}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300 text-xs sm:text-sm">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400 flex-shrink-0" />
              <span className="truncate">{vehicle.location.pickupLocation}</span>
            </div>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
            {vehicle.features.slice(0, 3).map((feature, index) => (
              <span key={index} className="px-2 py-1 bg-white/10 rounded-lg text-gray-300 text-xs">
                {feature}
              </span>
            ))}
            {vehicle.features.length > 3 && (
              <span className="px-2 py-1 bg-white/10 rounded-lg text-gray-300 text-xs">
                +{vehicle.features.length - 3} more
              </span>
            )}
          </div>

          {/* Price */}
          <div className="bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-xl p-3 mb-4">
            <div className="flex items-center gap-2">
              <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
              <span className="text-lg sm:text-xl font-bold text-orange-400">
                {vehicle.pricePerDay.toLocaleString()}
              </span>
              <span className="text-gray-300 text-xs sm:text-sm">per day</span>
            </div>
            {vehicle.driverOption.withDriver && vehicle.driverOption.driverChargePerDay && (
              <div className="text-gray-400 text-xs mt-1">
                +₹{vehicle.driverOption.driverChargePerDay.toLocaleString()}/day with driver
              </div>
            )}
          </div>

          {/* Rental Options */}
          {quantity > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-xs sm:text-sm">Rental Days:</span>
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => {
                      const newDays = Math.max(1, rentalDays - 1);
                      setRentalDays(newDays);
                      updateVehicleOptions(vehicle._id, newDays, withDriver);
                    }}
                    className="w-6 h-6 bg-white/10 hover:bg-white/20 rounded flex items-center justify-center text-white"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-white font-medium w-6 sm:w-8 text-center text-sm">{rentalDays}</span>
                  <button
                    onClick={() => {
                      const newDays = rentalDays + 1;
                      setRentalDays(newDays);
                      updateVehicleOptions(vehicle._id, newDays, withDriver);
                    }}
                    className="w-6 h-6 bg-white/10 hover:bg-white/20 rounded flex items-center justify-center text-white"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {vehicle.driverOption.withDriver && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-xs sm:text-sm">With Driver:</span>
                  <button
                    onClick={() => {
                      const newWithDriver = !withDriver;
                      setWithDriver(newWithDriver);
                      updateVehicleOptions(vehicle._id, rentalDays, newWithDriver);
                    }}
                    className={`px-2 sm:px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      withDriver
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-white/10 text-gray-300'
                    }`}
                  >
                    {withDriver ? 'Yes' : 'No'}
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-xs sm:text-sm">Quantity:</span>
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => removeVehicle(vehicle._id)}
                    className="w-6 h-6 bg-red-500/20 hover:bg-red-500/30 rounded flex items-center justify-center text-red-400"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-white font-medium w-6 sm:w-8 text-center text-sm">{quantity}</span>
                  <button
                    onClick={() => addVehicle(vehicle, rentalDays, withDriver)}
                    className="w-6 h-6 bg-green-500/20 hover:bg-green-500/30 rounded flex items-center justify-center text-green-400"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10">
                <div className="text-orange-400 font-semibold text-sm">
                  Total: ₹{(getTotalPrice() * quantity).toLocaleString()}
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => addVehicle(vehicle, 1, false)}
              className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
            >
              Add to Booking
            </button>
          )}
        </div>
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-blue-900">
      <Header />

      {/* Hero Section with Background */}
      <section className="relative py-32 overflow-hidden">
        <motion.div
          style={{ y }}
          className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-pink-500/5 to-purple-500/10"
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Pre-title */}
            <div className="inline-flex items-center gap-2 text-orange-400 text-sm font-medium uppercase tracking-wider mb-6">
              <div className="w-8 h-px bg-orange-400" />
              <span>Adventure & Services</span>
              <div className="w-8 h-px bg-orange-400" />
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              Premium
              <span className="block text-orange-400">Experiences</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Elevate your stay with our curated collection of luxury services and thrilling adventures,
              designed to create unforgettable memories.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="bg-gradient-to-b from-gray-900 to-slate-800">
        <div className="container mx-auto px-4 py-20">
          {/* Vehicle Rental Section */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">Vehicle Rentals</h2>
              <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto">
                Explore Varkala and beyond with our premium vehicle rental service. From scooters to luxury cars.
              </p>
            </motion.div>

            {/* Vehicle Type Filter */}
            <div className="flex justify-center mb-8">
              <div className="flex bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
                <button
                  onClick={() => setVehicleTypeFilter('all')}
                  className={`px-3 sm:px-6 py-2 sm:py-3 font-medium transition-all text-sm sm:text-base ${
                    vehicleTypeFilter === 'all'
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Filter className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">All Vehicles</span>
                  <span className="sm:hidden">All</span>
                </button>
                <button
                  onClick={() => setVehicleTypeFilter('2-wheeler')}
                  className={`px-3 sm:px-6 py-2 sm:py-3 font-medium transition-all text-sm sm:text-base ${
                    vehicleTypeFilter === '2-wheeler'
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Bike className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                  2-Wheeler
                </button>
                <button
                  onClick={() => setVehicleTypeFilter('4-wheeler')}
                  className={`px-3 sm:px-6 py-2 sm:py-3 font-medium transition-all text-sm sm:text-base ${
                    vehicleTypeFilter === '4-wheeler'
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Car className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                  4-Wheeler
                </button>
              </div>
            </div>

            {/* Vehicles Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-300 mt-4">Loading vehicles...</p>
              </div>
            ) : vehicles.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-12 text-center">
                <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No vehicles available</h3>
                <p className="text-gray-300">Check back later for vehicle rental options.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {vehicles.map((vehicle, index) => (
                  <motion.div
                    key={vehicle._id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <VehicleCard vehicle={vehicle} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Adventure Sports Section */}
          <div className="mt-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">Adventure Sports</h2>
              <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto">
                Experience thrilling adventures and premium services designed to create unforgettable memories.
              </p>
            </motion.div>

            {/* Services Grid */}
            <div className="grid gap-8 max-w-4xl mx-auto">
              {adventureSports.map((service, index) => (
                <motion.div
                  key={service._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ServiceCard service={service} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Services Summary & Booking */}
      {(selectedServices.length > 0 || selectedVehicles.length > 0) && (
        <div className="bg-white border-t border-gray-200 sticky bottom-0 z-20 shadow-lg">
          <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-4 sm:gap-6"
              >
                {/* Selected Items Summary */}
                <div className="flex-1">
                  <div className="space-y-3 sm:space-y-4">
                    {selectedServices.length > 0 && (
                      <div>
                        <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                          Services ({selectedServices.length})
                        </h4>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {selectedServices.map(service => (
                            <div key={service._id} className="flex items-center gap-1 sm:gap-2 bg-orange-50 rounded-lg px-2 sm:px-3 py-1 min-w-fit">
                              <div className="p-1 bg-orange-100 rounded">
                                {React.createElement(getServiceIcon(service.category), { className: "w-3 h-3 text-orange-600" })}
                              </div>
                              <span className="text-xs sm:text-sm font-medium text-gray-900 whitespace-nowrap">{service.quantity}x {service.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedVehicles.length > 0 && (
                      <div>
                        <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                          Vehicles ({selectedVehicles.length})
                        </h4>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {selectedVehicles.map(vehicle => (
                            <div key={vehicle._id} className="flex items-center gap-1 sm:gap-2 bg-blue-50 rounded-lg px-2 sm:px-3 py-1 min-w-fit">
                              <div className="p-1 bg-blue-100 rounded">
                                {React.createElement(vehicle.type === '2-wheeler' ? Bike : Car, { className: "w-3 h-3 text-blue-600" })}
                              </div>
                              <span className="text-xs sm:text-sm font-medium text-gray-900 whitespace-nowrap">
                                {vehicle.quantity}x {vehicle.name} ({vehicle.rentalDays}d)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Date Selection & Booking */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                  <div className="flex-1 sm:flex-initial">
                    <label className="block text-gray-700 text-xs sm:text-sm font-medium mb-1">Service Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
                    />
                  </div>

                  <div className="text-center sm:text-left flex-1 sm:flex-initial">
                    <div className="text-xs sm:text-sm text-gray-600 mb-1">Total</div>
                    <div className="text-lg sm:text-xl font-bold text-orange-600">
                      ₹{getTotalAmount().toLocaleString()}
                    </div>
                  </div>

                  <button
                    onClick={handleBookServices}
                    disabled={(selectedServices.length === 0 && selectedVehicles.length === 0) || !selectedDate}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md text-sm sm:text-base"
                  >
                    <Calendar className="w-4 h-4" />
                    Book Now
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {selectedServices.length === 0 && selectedVehicles.length === 0 && (
        <div className="bg-slate-800 py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-2xl mx-auto"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Activity className="w-10 h-10 text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Select Your Perfect Experience</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Choose from our premium services and vehicle rentals above to create your personalized adventure package.
                Each option is designed to enhance your stay with unforgettable memories.
              </p>
            </motion.div>
          </div>
        </div>
      )}

      {/* Service Details Modal */}
      {showServiceModal && selectedServiceDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="p-2 bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-lg flex-shrink-0">
                    {React.createElement(getServiceIcon(selectedServiceDetails.category), { className: "w-5 h-5 sm:w-6 sm:h-6 text-orange-600" })}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{selectedServiceDetails.name}</h2>
                    <div className="text-gray-600 text-sm flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      {selectedServiceDetails.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="truncate">{selectedServiceDetails.location}</span>
                        </div>
                      )}
                      {selectedServiceDetails.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>{selectedServiceDetails.duration}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowServiceModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Service Images */}
              {selectedServiceDetails.images && selectedServiceDetails.images.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Photos</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                    {selectedServiceDetails.images.slice(0, 6).map((image, index) => (
                      <div key={index} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <img src={image} alt={`${selectedServiceDetails.name} ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing and Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Pricing & Details</h3>
                  <div className="bg-gradient-to-r from-orange-500/10 to-pink-500/10 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <IndianRupee className="w-5 h-5 text-orange-600" />
                      <span className="text-2xl font-bold text-orange-600">
                        ₹{selectedServiceDetails.price.toLocaleString()}
                      </span>
                      <span className="text-gray-600">{selectedServiceDetails.priceUnit.replace('_', ' ')}</span>
                    </div>
                    {selectedServiceDetails.duration && (
                      <div className="text-gray-600 text-sm">Duration: {selectedServiceDetails.duration}</div>
                    )}
                    {selectedServiceDetails.difficulty && (
                      <div className="text-gray-600 text-sm">Difficulty: {selectedServiceDetails.difficulty.charAt(0).toUpperCase() + selectedServiceDetails.difficulty.slice(1)}</div>
                    )}
                    {selectedServiceDetails.maxQuantity && (
                      <div className="text-gray-600 text-sm">Max participants: {selectedServiceDetails.maxQuantity}</div>
                    )}
                  </div>
                </div>

                {/* Age Restrictions */}
                {selectedServiceDetails.ageRestriction && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Age Requirements</h3>
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-blue-800">
                        <Users className="w-5 h-5" />
                        <span className="font-medium">
                          Ages {selectedServiceDetails.ageRestriction.minAge} - {selectedServiceDetails.ageRestriction.maxAge} years
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Detailed Description */}
              {selectedServiceDetails.detailedDescription && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About This Experience</h3>
                  <p className="text-gray-600 leading-relaxed">{selectedServiceDetails.detailedDescription}</p>
                </div>
              )}

              {/* What's Included */}
              {selectedServiceDetails.includedItems && selectedServiceDetails.includedItems.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">What's Included</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedServiceDetails.includedItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-gray-600 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirements */}
              {selectedServiceDetails.requirements && selectedServiceDetails.requirements.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedServiceDetails.requirements.map((requirement, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">•</span>
                        <span className="text-gray-600 text-sm">{requirement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructor Info */}
              {selectedServiceDetails.instructor && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Instructor</h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="mb-2">
                      <h4 className="font-medium text-gray-900">{selectedServiceDetails.instructor.name}</h4>
                      <p className="text-gray-600 text-sm">{selectedServiceDetails.instructor.experience}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Certifications:</span>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {selectedServiceDetails.instructor.certifications.map((cert, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-lg">
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Safety Information */}
              {selectedServiceDetails.safety && selectedServiceDetails.safety.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Safety Measures</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedServiceDetails.safety.map((safety, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Shield className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600 text-sm">{safety}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* What to Bring */}
              {selectedServiceDetails.whatToBring && selectedServiceDetails.whatToBring.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">What to Bring</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedServiceDetails.whatToBring.map((item, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">•</span>
                        <span className="text-gray-600 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cancellation Policy */}
              {selectedServiceDetails.cancellationPolicy && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Cancellation Policy</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <p className="text-gray-700 text-sm">{selectedServiceDetails.cancellationPolicy}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    ₹{selectedServiceDetails.price.toLocaleString()}
                  </div>
                  <div className="text-gray-500 text-sm">{selectedServiceDetails.priceUnit.replace('_', ' ')}</div>
                </div>
                <button
                  onClick={() => {
                    addService(selectedServiceDetails);
                    setShowServiceModal(false);
                  }}
                  className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  Add to Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Details Modal */}
      {showVehicleModal && selectedVehicleDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="p-2 bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-lg flex-shrink-0">
                    {React.createElement(selectedVehicleDetails.type === '2-wheeler' ? Bike : Car, { className: "w-5 h-5 sm:w-6 sm:h-6 text-orange-600" })}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">{selectedVehicleDetails.name}</h2>
                    <p className="text-gray-600 text-sm truncate">{selectedVehicleDetails.brand} {selectedVehicleDetails.vehicleModel} ({selectedVehicleDetails.year})</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowVehicleModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Vehicle Images */}
              {selectedVehicleDetails.images.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Photos</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedVehicleDetails.images.slice(0, 4).map((image, index) => (
                      <div key={index} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <img src={image} alt={`${selectedVehicleDetails.name} ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed">{selectedVehicleDetails.description}</p>
              </div>

              {/* Specifications */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{selectedVehicleDetails.seatingCapacity} passengers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Fuel className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{selectedVehicleDetails.fuelType}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{selectedVehicleDetails.transmission}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{selectedVehicleDetails.location.pickupLocation}</span>
                  </div>
                  {selectedVehicleDetails.specifications.mileage && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">⛽</span>
                      <span className="text-gray-600">{selectedVehicleDetails.specifications.mileage}</span>
                    </div>
                  )}
                  {selectedVehicleDetails.specifications.engine && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">🔧</span>
                      <span className="text-gray-600">{selectedVehicleDetails.specifications.engine}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Features */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedVehicleDetails.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Pricing & Options</h3>
                <div className="bg-gradient-to-r from-orange-500/10 to-pink-500/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <IndianRupee className="w-5 h-5 text-orange-600" />
                    <span className="text-2xl font-bold text-orange-600">
                      ₹{selectedVehicleDetails.pricePerDay.toLocaleString()}
                    </span>
                    <span className="text-gray-600">per day</span>
                  </div>
                  {selectedVehicleDetails.driverOption.withDriver && selectedVehicleDetails.driverOption.driverChargePerDay && (
                    <div className="text-gray-600 text-sm">
                      Driver available: +₹{selectedVehicleDetails.driverOption.driverChargePerDay.toLocaleString()}/day
                    </div>
                  )}
                  <div className="text-gray-600 text-sm mt-2">
                    Security deposit: ₹{selectedVehicleDetails.depositAmount.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              {selectedVehicleDetails.termsAndConditions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Terms & Conditions</h3>
                  <ul className="space-y-1">
                    {selectedVehicleDetails.termsAndConditions.map((term, index) => (
                      <li key={index} className="text-gray-600 text-sm flex items-start gap-2">
                        <span className="text-orange-500 mt-1">•</span>
                        <span>{term}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">📞</span>
                    <span className="text-gray-600">{selectedVehicleDetails.contactInfo.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">✉️</span>
                    <span className="text-gray-600">{selectedVehicleDetails.contactInfo.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ServicesPage;