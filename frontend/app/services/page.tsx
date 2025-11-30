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
  Shield,
  ChevronDown,
  X,
  Star
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
  rentalDays: number; // Calculated from dates
  startDate: string;
  endDate: string;
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
  const [selectedVehicleImageIndex, setSelectedVehicleImageIndex] = useState(0);
  const [modalRentalDays, setModalRentalDays] = useState(1);
  const [modalStartDate, setModalStartDate] = useState('');
  const [modalEndDate, setModalEndDate] = useState('');
  const [modalWithDriver, setModalWithDriver] = useState(false);

  // Helper function to calculate days between two dates
  const calculateDays = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1; // Minimum 1 day
  };

  // Update modal rental days when dates change
  useEffect(() => {
    if (modalStartDate && modalEndDate) {
      const days = calculateDays(modalStartDate, modalEndDate);
      setModalRentalDays(days);
    }
  }, [modalStartDate, modalEndDate]);
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

  const addVehicle = (vehicle: Vehicle, rentalDays: number = 1, startDate: string = '', endDate: string = '', withDriver: boolean = false) => {
    const existingVehicle = selectedVehicles.find(v => v._id === vehicle._id);
    // If dates are provided, use them. Otherwise, calculate from rentalDays or use existing dates
    const finalStartDate = startDate || (existingVehicle?.startDate || '');
    const finalEndDate = endDate || (existingVehicle?.endDate || '');
    const calculatedDays = finalStartDate && finalEndDate ? calculateDays(finalStartDate, finalEndDate) : rentalDays;
    
    if (existingVehicle) {
      setSelectedVehicles(prev =>
        prev.map(v =>
          v._id === vehicle._id
            ? { 
                ...v, 
                quantity: v.quantity + 1,
                ...(finalStartDate && { startDate: finalStartDate }),
                ...(finalEndDate && { endDate: finalEndDate }),
                rentalDays: calculatedDays
              }
            : v
        )
      );
    } else {
      const newVehicle: SelectedVehicle = {
        ...vehicle,
        quantity: 1,
        rentalDays: calculatedDays,
        startDate: finalStartDate,
        endDate: finalEndDate,
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

  const updateVehicleOptions = (vehicleId: string, rentalDays?: number, startDate?: string, endDate?: string, withDriver?: boolean) => {
    setSelectedVehicles(prev =>
      prev.map(v =>
        v._id === vehicleId
          ? {
              ...v,
              ...(rentalDays !== undefined && { rentalDays }),
              ...(startDate !== undefined && { startDate }),
              ...(endDate !== undefined && { endDate }),
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
    
    // Validate vehicle rentals have dates
    for (const vehicle of selectedVehicles) {
      if (!vehicle.startDate || !vehicle.endDate) {
        alert(`Please select start and end dates for ${vehicle.name}`);
        return;
      }
      if (vehicle.endDate < vehicle.startDate) {
        alert(`End date must be after start date for ${vehicle.name}`);
        return;
      }
    }
    
    // Service date is only required if there are adventure services
    if (selectedServices.length > 0 && !selectedDate) {
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
    const [startDate, setStartDate] = useState(selectedVehicle?.startDate || '');
    const [endDate, setEndDate] = useState(selectedVehicle?.endDate || '');
    const [withDriver, setWithDriver] = useState(selectedVehicle?.withDriver || false);
    
    // Calculate rental days from dates
    const rentalDays = startDate && endDate ? calculateDays(startDate, endDate) : (selectedVehicle?.rentalDays || 1);

    const VehicleIcon = vehicle.type === '2-wheeler' ? Bike : Car;

    const getTotalPrice = () => {
      const basePrice = vehicle.pricePerDay * rentalDays;
      const driverCharge = withDriver && vehicle.driverOption.driverChargePerDay
        ? vehicle.driverOption.driverChargePerDay * rentalDays
        : 0;
      return basePrice + driverCharge;
    };

    const mainImage = vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : '';

    return (
      <div className="relative rounded-2xl overflow-hidden group cursor-pointer shadow-sm border ">
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0">
          {mainImage && (
            <img
              src={mainImage}
              alt={vehicle.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-6 h-full min-h-[400px] flex flex-col">
          {/* Vehicle Image - Centered */}
          {/* {mainImage && (
            <div className="flex-1 flex items-center justify-center mb-6">
              <img
                src={mainImage}
                alt={vehicle.name}
                className="max-w-full max-h-48 object-contain drop-shadow-2xl"
              />
            </div>
          )} */}

          {/* Bottom Section - Name, Price, Button */}
          <div className="mt-auto">
            {/* Vehicle Name - Bottom Left */}
            <h3 className="text-white font-bold text-lg mb-3 font-urbanist">
              {vehicle.name}
            </h3>

            {/* Price and Button Row */}
            <div className="flex items-center justify-between">
              {/* Price - Bottom Left */}
              <div className="flex items-baseline gap-1">
                <span className="text-[#B23092] font-bold text-xl font-urbanist">
                  ₹{vehicle.pricePerDay.toLocaleString()}
                </span>
                <span className="text-white/70 text-sm font-urbanist">/day</span>
              </div>

              {/* View Details Button - Bottom Right */}
              <button
                onClick={() => {
                  setSelectedVehicleDetails(vehicle);
                  setSelectedVehicleImageIndex(0);
                  const existingVehicle = selectedVehicles.find(v => v._id === vehicle._id);
                  setModalRentalDays(existingVehicle?.rentalDays || 1);
                  setModalStartDate(existingVehicle?.startDate || '');
                  setModalEndDate(existingVehicle?.endDate || '');
                  setModalWithDriver(existingVehicle?.withDriver || false);
                  setShowVehicleModal(true);
                }}
                className="bg-black/60 hover:bg-black/80 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors font-urbanist"
              >
                View Details
              </button>
            </div>

            {/* Rental Options (Hidden by default, shown when quantity > 0) */}
            {quantity > 0 && (
              <div className="mt-4 pt-4 border-t border-white/20 space-y-2">
                {/* Start Date */}
                <div className="flex flex-col gap-1">
                  <span className="text-white/80 text-xs font-urbanist">Start Date:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      const newStartDate = e.target.value;
                      setStartDate(newStartDate);
                      // Auto-update end date if it's before new start date
                      if (endDate && newStartDate && endDate < newStartDate) {
                        const newEndDate = new Date(newStartDate);
                        newEndDate.setDate(newEndDate.getDate() + 1);
                        setEndDate(newEndDate.toISOString().split('T')[0]);
                        const days = calculateDays(newStartDate, newEndDate.toISOString().split('T')[0]);
                        updateVehicleOptions(vehicle._id, days, newStartDate, newEndDate.toISOString().split('T')[0], withDriver);
                      } else {
                        const days = endDate ? calculateDays(newStartDate, endDate) : 1;
                        updateVehicleOptions(vehicle._id, days, newStartDate, endDate, withDriver);
                      }
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    className="px-2 py-1.5 bg-white/10 border border-white/20 rounded text-white text-xs font-urbanist focus:outline-none focus:ring-2 focus:ring-[#B23092] focus:border-transparent"
                  />
                </div>
                
                {/* End Date */}
                <div className="flex flex-col gap-1">
                  <span className="text-white/80 text-xs font-urbanist">End Date:</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      const newEndDate = e.target.value;
                      setEndDate(newEndDate);
                      const days = startDate ? calculateDays(startDate, newEndDate) : 1;
                      updateVehicleOptions(vehicle._id, days, startDate, newEndDate, withDriver);
                    }}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    className="px-2 py-1.5 bg-white/10 border border-white/20 rounded text-white text-xs font-urbanist focus:outline-none focus:ring-2 focus:ring-[#B23092] focus:border-transparent"
                  />
                </div>
                
                {/* Calculated Rental Days Display */}
                {startDate && endDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/80 text-xs font-urbanist">Rental Period:</span>
                    <span className="text-white font-medium text-xs">{rentalDays} {rentalDays === 1 ? 'day' : 'days'}</span>
                  </div>
                )}

                {vehicle.driverOption.withDriver && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/80 text-xs font-urbanist">With Driver:</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newWithDriver = !withDriver;
                        setWithDriver(newWithDriver);
                        updateVehicleOptions(vehicle._id, rentalDays, startDate, endDate, newWithDriver);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors font-urbanist ${
                        withDriver
                          ? 'bg-[#B23092]/30 text-[#B23092] border border-[#B23092]/50'
                          : 'bg-white/10 text-white/80'
                      }`}
                    >
                      {withDriver ? 'Yes' : 'No'}
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-xs font-urbanist">Quantity:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeVehicle(vehicle._id);
                      }}
                      className="w-6 h-6 bg-red-500/30 hover:bg-red-500/40 rounded flex items-center justify-center text-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-white font-medium w-8 text-center text-sm">{quantity}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addVehicle(vehicle, rentalDays, startDate, endDate, withDriver);
                      }}
                      className="w-6 h-6 bg-green-500/30 hover:bg-green-500/40 rounded flex items-center justify-center text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/20">
                  <div className="text-[#B23092] font-semibold text-sm font-urbanist">
                    Total: ₹{(getTotalPrice() * quantity).toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-blue-900">
      <Header />

      {/* Hero Section with Background */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Background Image with Parallax */}
        <motion.div
          className="absolute inset-0"
          style={{ y }}
        >
          <img
            src="https://ik.imagekit.io/8xufknozx/kshetra%20all%20images/Kshetra/rentbike.png"
            alt="Rent a Vehicle Hero"
            className="w-full h-[120%] object-cover"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </motion.div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center">
          <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-[100px] 2xl:px-[120px]">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="max-w-3xl text-white"
            >
              {/* Main Heading */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
                <span className="block uppercase tracking-wider mb-2 font-annie-telescope">
                  FIND YOUR
                </span>
                <span className="block text-5xl md:text-6xl lg:text-7xl font-water-brush italic mt-4">
                  Perfect <span className="text-[#B23092]">Ride</span>
                </span>
              </h1>

              {/* Description */}
              <p className="text-lg md:text-xl text-white/90 mb-12 max-w-xl leading-relaxed font-urbanist">
                Choose from a wide range of vehicles for any journey, anytime.
              </p>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const vehicleSection = document.getElementById('vehicle-rental-section');
                  if (vehicleSection) {
                    vehicleSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="inline-flex items-center gap-2 bg-[#B23092] hover:bg-[#9a2578] text-white px-8 py-4 rounded-full transition-colors font-urbanist text-lg font-semibold"
              >
                View Details
                <ChevronDown className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="bg-black">
        <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-[100px] 2xl:px-[120px] py-20">
          {/* Vehicle Rental Section */}
          <div id="vehicle-rental-section">
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row md:items-start md:justify-between mb-12 gap-6"
            >
              {/* Left Side - Title and Description */}
              <div className="flex-1">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                  <span className="uppercase font-annie-telescope">VEHICLE</span>{' '}
                  <span className="text-[#B23092] font-water-brush text-4xl sm:text-5xl lg:text-6xl">Rentals</span>
                </h2>
                <p className="text-white/90 text-base sm:text-lg max-w-2xl font-urbanist">
                  Explore Varkala and beyond with our premium vehicle rental service. From scooters to luxury cars.
                </p>
              </div>

              {/* Right Side - Filter Dropdown */}
              <div className="flex justify-end">
                <div className="relative">
                  <button
                    onClick={() => {
                      // Toggle between filters
                      if (vehicleTypeFilter === 'all') setVehicleTypeFilter('2-wheeler');
                      else if (vehicleTypeFilter === '2-wheeler') setVehicleTypeFilter('4-wheeler');
                      else setVehicleTypeFilter('all');
                    }}
                    className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 px-4 py-3 text-white hover:bg-white/20 transition-colors font-urbanist"
                  >
                    <Car className="w-5 h-5 text-white" />
                    <span className="font-medium">
                      {vehicleTypeFilter === 'all' ? 'All Vehicle' : vehicleTypeFilter === '2-wheeler' ? '2-Wheeler' : '4-Wheeler'}
                    </span>
                    <ChevronDown className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Vehicles Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-[#B23092] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white/80 mt-4 font-urbanist">Loading vehicles...</p>
              </div>
            ) : vehicles.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-12 text-center">
                <Car className="w-16 h-16 text-[#B23092] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2 font-annie-telescope">No vehicles available</h3>
                <p className="text-white/80 font-urbanist">Check back later for vehicle rental options.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

          {/* Adventure Sports Section moved to /adventure */}
          {false && <div />}
        </div>
      </div>

      {/* Selected Services Summary & Booking */}
      {(selectedServices.length > 0 || selectedVehicles.length > 0) && (
        <div className="bg-black/95 backdrop-blur-md border-t border-white/20 sticky bottom-0 z-20 shadow-2xl">
          <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-[100px] 2xl:px-[120px] py-4 sm:py-6">
            <div className="max-w-6xl mx-auto">
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
                        <h4 className="text-base sm:text-lg font-annie-telescope font-bold text-white mb-3">
                          Services <span className="text-[#B23092]">({selectedServices.length})</span>
                        </h4>
                        <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-thumb]:bg-[#B23092]/50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-[#B23092]"
                          style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#B2309280 transparent'
                          }}
                        >
                          {selectedServices.map(service => (
                            <div key={service._id} className="flex items-center gap-2 bg-[#B23092]/20 border border-[#B23092]/30 rounded-xl px-3 sm:px-4 py-2 min-w-fit backdrop-blur-sm">
                              <div className="p-1.5 bg-[#B23092]/30 rounded-lg">
                                {React.createElement(getServiceIcon(service.category), { className: "w-4 h-4 text-[#B23092]" })}
                              </div>
                              <span className="text-xs sm:text-sm font-urbanist font-medium text-white whitespace-nowrap">
                                {service.quantity}x {service.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedVehicles.length > 0 && (
                      <div>
                        <h4 className="text-base sm:text-lg font-annie-telescope font-bold text-white mb-3">
                          Vehicles <span className="text-[#B23092]">({selectedVehicles.length})</span>
                        </h4>
                        <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-thumb]:bg-[#B23092]/50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-[#B23092]"
                          style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#B2309280 transparent'
                          }}
                        >
                          {selectedVehicles.map(vehicle => (
                            <div key={vehicle._id} className="flex items-center gap-2 bg-[#B23092]/20 border border-[#B23092]/30 rounded-xl px-3 sm:px-4 py-2 min-w-fit backdrop-blur-sm">
                              <div className="p-1.5 bg-[#B23092]/30 rounded-lg">
                                {React.createElement(vehicle.type === '2-wheeler' ? Bike : Car, { className: "w-4 h-4 text-[#B23092]" })}
                              </div>
                              <span className="text-xs sm:text-sm font-urbanist font-medium text-white whitespace-nowrap">
                                {vehicle.quantity}x {vehicle.name}
                                {vehicle.startDate && vehicle.endDate && (
                                  <span className="text-white/70"> ({new Date(vehicle.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(vehicle.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})</span>
                                )}
                                {!vehicle.startDate && vehicle.rentalDays && (
                                  <span className="text-white/70"> ({vehicle.rentalDays}d)</span>
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Date Selection & Booking */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2 border-t border-white/20">
                  {/* Only show service date if there are adventure services (not vehicle rentals) */}
                  {selectedServices.length > 0 && (
                    <div className="flex-1 sm:flex-initial">
                      <label className="block text-white/80 font-urbanist text-xs sm:text-sm font-medium mb-2">Service Date</label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 sm:px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-[#B23092] focus:outline-none focus:ring-2 focus:ring-[#B23092]/20 text-sm font-urbanist"
                      />
                    </div>
                  )}

                  <div className="text-center sm:text-left flex-1 sm:flex-initial bg-white/5 rounded-xl px-4 sm:px-6 py-3 border border-white/10">
                    <div className="text-xs sm:text-sm text-white/70 font-urbanist mb-1">Total Amount</div>
                    <div className="text-xl sm:text-2xl font-annie-telescope font-bold text-[#B23092]">
                      ₹{getTotalAmount().toLocaleString()}
                    </div>
                  </div>

                  <button
                    onClick={handleBookServices}
                    disabled={
                      (selectedServices.length === 0 && selectedVehicles.length === 0) || 
                      (selectedServices.length > 0 && !selectedDate) ||
                      (selectedVehicles.length > 0 && selectedVehicles.some(v => !v.startDate || !v.endDate))
                    }
                    className="bg-[#B23092] hover:bg-[#9a2578] text-white px-6 sm:px-8 py-3 rounded-xl font-urbanist font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#B23092]/30 text-sm sm:text-base"
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
        <div className="bg-black py-20">
          <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-[100px] 2xl:px-[120px] bg-black">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowVehicleModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-black/90 backdrop-blur-md border border-white/20 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-thumb]:bg-[#B23092]/50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-[#B23092]"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#B2309280 transparent'
            }}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-black/95 backdrop-blur-md border-b border-white/20 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="p-2 bg-[#B23092]/20 rounded-lg flex-shrink-0">
                  {React.createElement(selectedVehicleDetails.type === '2-wheeler' ? Bike : Car, { className: "w-5 h-5 sm:w-6 sm:h-6 text-[#B23092]" })}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-2xl font-annie-telescope text-white truncate">{selectedVehicleDetails.name}</h3>
                  <p className="text-white/60 text-sm truncate font-urbanist">{selectedVehicleDetails.brand} {selectedVehicleDetails.vehicleModel} ({selectedVehicleDetails.year})</p>
                </div>
              </div>
              <button
                onClick={() => setShowVehicleModal(false)}
                className="p-2 rounded-full hover:bg-white/10 text-white transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Image Gallery */}
              {selectedVehicleDetails.images && selectedVehicleDetails.images.length > 0 && (
                <div className="space-y-3">
                  {/* Main Image */}
                  <div className="relative h-64 sm:h-80 rounded-xl overflow-hidden bg-white/5 group">
                    <img
                      src={selectedVehicleDetails.images[selectedVehicleImageIndex]}
                      alt={selectedVehicleDetails.name}
                      className="w-full h-full object-cover transition-opacity duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Navigation Arrows (if multiple images) */}
                    {selectedVehicleDetails.images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedVehicleImageIndex((prev) => 
                              prev === 0 ? selectedVehicleDetails.images.length - 1 : prev - 1
                            )
                          }}
                          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ArrowRight className="w-5 h-5 rotate-180" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedVehicleImageIndex((prev) => 
                              prev === selectedVehicleDetails.images.length - 1 ? 0 : prev + 1
                            )
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ArrowRight className="w-5 h-5" />
                        </button>
                        
                        {/* Image Counter */}
                        <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur text-white text-xs font-urbanist">
                          {selectedVehicleImageIndex + 1} / {selectedVehicleDetails.images.length}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Thumbnail Gallery (if multiple images) */}
                  {selectedVehicleDetails.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-thumb]:bg-[#B23092]/50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-[#B23092]"
                      style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#B2309280 transparent'
                      }}
                    >
                      {selectedVehicleDetails.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedVehicleImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            selectedVehicleImageIndex === index
                              ? 'border-[#B23092] ring-2 ring-[#B23092]/50'
                              : 'border-transparent hover:border-white/30'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${selectedVehicleDetails.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              <div>
                <h4 className="text-lg font-urbanist font-semibold text-white mb-2">Description</h4>
                <p className="text-white/80 font-urbanist leading-relaxed">{selectedVehicleDetails.description}</p>
              </div>

              {/* Specifications */}
              <div>
                <h4 className="text-lg font-urbanist font-semibold text-white mb-3">Specifications</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-white/80">
                    <Users className="w-4 h-4 text-[#B23092]" />
                    <span className="font-urbanist text-sm">{selectedVehicleDetails.seatingCapacity} passengers</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <Fuel className="w-4 h-4 text-[#B23092]" />
                    <span className="font-urbanist text-sm">{selectedVehicleDetails.fuelType}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <Settings className="w-4 h-4 text-[#B23092]" />
                    <span className="font-urbanist text-sm">{selectedVehicleDetails.transmission}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <MapPin className="w-4 h-4 text-[#B23092]" />
                    <span className="font-urbanist text-sm truncate">{selectedVehicleDetails.location.pickupLocation}</span>
                  </div>
                  {selectedVehicleDetails.specifications.mileage && (
                    <div className="flex items-center gap-2 text-white/80">
                      <Fuel className="w-4 h-4 text-[#B23092]" />
                      <span className="font-urbanist text-sm">{selectedVehicleDetails.specifications.mileage}</span>
                    </div>
                  )}
                  {selectedVehicleDetails.specifications.engine && (
                    <div className="flex items-center gap-2 text-white/80">
                      <Settings className="w-4 h-4 text-[#B23092]" />
                      <span className="font-urbanist text-sm">{selectedVehicleDetails.specifications.engine}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Features */}
              {selectedVehicleDetails.features && selectedVehicleDetails.features.length > 0 && (
                <div>
                  <h4 className="text-lg font-urbanist font-semibold text-white mb-3">Features</h4>
                  <div className="space-y-2">
                    {selectedVehicleDetails.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-white/80">
                        <CheckCircle className="w-4 h-4 text-[#B23092] flex-shrink-0" />
                        <span className="font-urbanist text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing */}
              <div className="pt-4 border-t border-white/20">
                <h4 className="text-lg font-urbanist font-semibold text-white mb-3">Pricing & Options</h4>
                <div className="bg-[#B23092]/20 rounded-xl p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-5 h-5 text-[#B23092]" />
                    <span className="text-2xl font-annie-telescope font-bold text-[#B23092]">
                      ₹{selectedVehicleDetails.pricePerDay.toLocaleString()}
                    </span>
                    <span className="text-white/60 font-urbanist text-sm">per day</span>
                  </div>
                  
                  {/* Rental Period - Start and End Dates */}
                  <div className="space-y-3 pt-2 border-t border-white/10">
                    {/* Start Date */}
                    <div>
                      <label className="text-white/80 font-urbanist text-sm mb-1.5 block">Start Date:</label>
                      <input
                        type="date"
                        value={modalStartDate}
                        onChange={(e) => {
                          const newStartDate = e.target.value;
                          setModalStartDate(newStartDate);
                          // Auto-update end date if it's before new start date
                          if (modalEndDate && newStartDate && modalEndDate < newStartDate) {
                            const newEndDate = new Date(newStartDate);
                            newEndDate.setDate(newEndDate.getDate() + 1);
                            setModalEndDate(newEndDate.toISOString().split('T')[0]);
                          }
                        }}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm font-urbanist focus:outline-none focus:ring-2 focus:ring-[#B23092] focus:border-transparent"
                      />
                    </div>
                    
                    {/* End Date */}
                    <div>
                      <label className="text-white/80 font-urbanist text-sm mb-1.5 block">End Date:</label>
                      <input
                        type="date"
                        value={modalEndDate}
                        onChange={(e) => {
                          setModalEndDate(e.target.value);
                        }}
                        min={modalStartDate || new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm font-urbanist focus:outline-none focus:ring-2 focus:ring-[#B23092] focus:border-transparent"
                      />
                    </div>
                    
                    {/* Calculated Rental Days Display */}
                    {modalStartDate && modalEndDate && (
                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <span className="text-white/80 font-urbanist">Rental Period:</span>
                        <span className="text-white font-urbanist font-medium">{modalRentalDays} {modalRentalDays === 1 ? 'day' : 'days'}</span>
                      </div>
                    )}
                  </div>

                  {/* Driver Option */}
                  {selectedVehicleDetails.driverOption.withDriver && selectedVehicleDetails.driverOption.driverChargePerDay && (
                    <>
                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <span className="text-white/80 font-urbanist">With Driver:</span>
                        <button
                          onClick={() => setModalWithDriver(prev => !prev)}
                          className={`px-4 py-2 rounded-lg text-sm font-urbanist font-medium transition-colors ${
                            modalWithDriver
                              ? 'bg-[#B23092] text-white'
                              : 'bg-white/10 text-white/80 hover:bg-white/15'
                          }`}
                        >
                          {modalWithDriver ? 'Yes' : 'No'}
                        </button>
                      </div>
                      {modalWithDriver && (
                        <div className="text-white/80 font-urbanist text-sm pl-2">
                          +₹{selectedVehicleDetails.driverOption.driverChargePerDay.toLocaleString()}/day
                        </div>
                      )}
                    </>
                  )}
                  
                  <div className="text-white/80 font-urbanist text-sm pt-2 border-t border-white/10">
                    Security deposit: ₹{selectedVehicleDetails.depositAmount.toLocaleString()}
                  </div>
                  
                  {/* Total Price */}
                  <div className="pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-urbanist font-semibold">Total per unit:</span>
                      <span className="text-xl font-annie-telescope font-bold text-[#B23092]">
                        ₹{((selectedVehicleDetails.pricePerDay * modalRentalDays) + (modalWithDriver && selectedVehicleDetails.driverOption.driverChargePerDay ? selectedVehicleDetails.driverOption.driverChargePerDay * modalRentalDays : 0)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              {selectedVehicleDetails.termsAndConditions && selectedVehicleDetails.termsAndConditions.length > 0 && (
                <div>
                  <h4 className="text-lg font-urbanist font-semibold text-white mb-3">Terms & Conditions</h4>
                  <ul className="space-y-2">
                    {selectedVehicleDetails.termsAndConditions.map((term, index) => (
                      <li key={index} className="text-white/80 font-urbanist text-sm flex items-start gap-2">
                        <span className="text-[#B23092] mt-1">•</span>
                        <span>{term}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Contact Info */}
              <div>
                <h4 className="text-lg font-urbanist font-semibold text-white mb-3">Contact</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white/80">
                    <span className="text-[#B23092]">📞</span>
                    <span className="font-urbanist text-sm">{selectedVehicleDetails.contactInfo.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <span className="text-[#B23092]">✉️</span>
                    <span className="font-urbanist text-sm">{selectedVehicleDetails.contactInfo.email}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-white/20 flex gap-3">
                {selectedVehicles.find(v => v._id === selectedVehicleDetails._id) ? (
                  <div className="flex-1 flex items-center justify-center gap-3 bg-white/10 rounded-xl p-3">
                    <button
                      onClick={() => {
                        removeVehicle(selectedVehicleDetails._id);
                        if (selectedVehicles.find(v => v._id === selectedVehicleDetails._id)?.quantity === 1) {
                          setShowVehicleModal(false);
                        }
                      }}
                      className="w-8 h-8 rounded-full bg-[#B23092]/20 text-[#B23092] flex items-center justify-center hover:bg-[#B23092]/30 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-white font-urbanist text-lg min-w-[2rem] text-center">
                      {selectedVehicles.find(v => v._id === selectedVehicleDetails._id)?.quantity || 0}
                    </span>
                    <button
                      onClick={() => {
                        if (!modalStartDate || !modalEndDate) {
                          alert('Please select both start and end dates');
                          return;
                        }
                        if (modalEndDate < modalStartDate) {
                          alert('End date must be after start date');
                          return;
                        }
                        addVehicle(selectedVehicleDetails, modalRentalDays, modalStartDate, modalEndDate, modalWithDriver);
                      }}
                      disabled={!modalStartDate || !modalEndDate}
                      className="w-8 h-8 rounded-full bg-[#B23092]/20 text-[#B23092] flex items-center justify-center hover:bg-[#B23092]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (!modalStartDate || !modalEndDate) {
                        alert('Please select both start and end dates');
                        return;
                      }
                      if (modalEndDate < modalStartDate) {
                        alert('End date must be after start date');
                        return;
                      }
                      addVehicle(selectedVehicleDetails, modalRentalDays, modalStartDate, modalEndDate, modalWithDriver);
                      setShowVehicleModal(false);
                    }}
                    disabled={!modalStartDate || !modalEndDate}
                    className="flex-1 bg-[#B23092] hover:bg-[#9a2578] text-white px-6 py-3 rounded-xl font-urbanist font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add to Booking
                  </button>
                )}
                <button
                  onClick={() => setShowVehicleModal(false)}
                  className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl font-urbanist font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ServicesPage;