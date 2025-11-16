'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Car,
  Bike,
  Camera,
  Waves,
  Heart,
  Star,
  Users,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight,
  ShoppingCart,
  Clock,
  Calendar,
  User,
  Trash2
} from 'lucide-react'
import Header from '../../../../components/Header'
import { useYogaBooking, Service } from '../../../../contexts/YogaBookingContext'

// Services data
const availableServices: Service[] = [
  // Transport Services
  {
    _id: "1",
    name: "Kochi Airport Transfer",
    category: "transport",
    price: 1500,
    priceUnit: "flat_rate",
    description: "Comfortable pickup and drop service from Kochi International Airport (140km, 3 hours)",
    isActive: true
  },
  {
    _id: "2",
    name: "Trivandrum Airport Transfer",
    category: "transport",
    price: 1200,
    priceUnit: "flat_rate",
    description: "Convenient transfer service from Trivandrum Airport (55km, 1.5 hours)",
    isActive: true
  },
  {
    _id: "3",
    name: "Bike Rental",
    category: "transport",
    price: 500,
    priceUnit: "per_day",
    description: "Explore Kerala's scenic beauty on well-maintained motorcycles and scooters",
    isActive: true
  },
  {
    _id: "4",
    name: "Local Transportation",
    category: "transport",
    price: 300,
    priceUnit: "flat_rate",
    description: "Local taxi service for trips within 10km radius",
    isActive: true
  },
  // Adventure Activities
  {
    _id: "5",
    name: "Surfing Lessons",
    category: "addon",
    price: 2000,
    priceUnit: "per_session",
    description: "Professional surfing instruction at world-famous Varkala Beach with equipment included",
    isActive: true
  },
  {
    _id: "6",
    name: "Paragliding",
    category: "addon",
    price: 3500,
    priceUnit: "per_person",
    description: "Thrilling 15-minute tandem paragliding flight over the coastal cliffs",
    isActive: true
  },
  {
    _id: "7",
    name: "Beach Volleyball",
    category: "addon",
    price: 500,
    priceUnit: "per_session",
    description: "Beach volleyball court with equipment provided for group activities",
    isActive: true
  },
  // Wellness Services
  {
    _id: "8",
    name: "Ayurvedic Massage",
    category: "yoga",
    price: 2500,
    priceUnit: "per_session",
    description: "Traditional 60-minute Ayurvedic massage using authentic oils and techniques",
    isActive: true
  },
  {
    _id: "9",
    name: "Meditation Sessions",
    category: "yoga",
    price: 800,
    priceUnit: "per_session",
    description: "Guided 45-minute meditation sessions for inner peace and mindfulness",
    isActive: true
  },
  {
    _id: "10",
    name: "Private Yoga Classes",
    category: "yoga",
    price: 3000,
    priceUnit: "per_session",
    description: "Personalized 90-minute one-on-one yoga instruction tailored to your level",
    isActive: true
  },
  // Cultural Tours
  {
    _id: "11",
    name: "Varkala Temple Tour",
    category: "addon",
    price: 1200,
    priceUnit: "per_person",
    description: "3-hour guided tour of ancient temples and historical sites in Varkala",
    isActive: true
  },
  {
    _id: "12",
    name: "Backwater Cruise",
    category: "addon",
    price: 2800,
    priceUnit: "per_person",
    description: "4-hour traditional houseboat cruise through Kerala's scenic backwaters",
    isActive: true
  },
  {
    _id: "13",
    name: "Local Market Visit",
    category: "addon",
    price: 800,
    priceUnit: "per_person",
    description: "2-hour guided tour of local spice markets and handicraft shops",
    isActive: true
  },
  // Food Services
  {
    _id: "14",
    name: "Cooking Class",
    category: "food",
    price: 1500,
    priceUnit: "per_person",
    description: "Learn to prepare traditional Kerala cuisine with our expert chefs",
    isActive: true
  },
  {
    _id: "15",
    name: "Special Dinner",
    category: "food",
    price: 1800,
    priceUnit: "per_person",
    description: "Romantic candlelight dinner with traditional Kerala delicacies",
    isActive: true
  }
]

export default function YogaBookingServicesPage() {
  const router = useRouter()
  const { state, addService, removeService, updateServiceQuantity, setStep } = useYogaBooking()
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    if (!state.selectedSession) {
      router.push('/yoga')
      return
    }
    setStep('services')
  }, [state.selectedSession, setStep, router])

  const categories = [
    { id: 'all', name: 'All Services', icon: Star },
    { id: 'transport', name: 'Transport', icon: Car },
    { id: 'addon', name: 'Activities', icon: Camera },
    { id: 'food', name: 'Food & Dining', icon: Heart },
    { id: 'yoga', name: 'Yoga & Wellness', icon: Users }
  ]

  const filteredServices = availableServices.filter(service => {
    return selectedCategory === 'all' || service.category === selectedCategory
  }).filter(service => service.isActive)

  const getServiceIcon = (category: string) => {
    switch (category) {
      case 'transport':
        return Car
      case 'addon':
        return Camera
      case 'food':
        return Heart
      case 'yoga':
        return Users
      default:
        return Star
    }
  }

  const formatPrice = (price: number, unit: string) => {
    const basePrice = `₹${price.toLocaleString()}`
    switch (unit) {
      case 'per_person':
        return `${basePrice} per person`
      case 'per_day':
        return `${basePrice} per day`
      case 'per_session':
        return `${basePrice} per session`
      case 'flat_rate':
        return basePrice
      default:
        return basePrice
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getServiceQuantity = (serviceId: string): number => {
    const service = state.selectedServices.find(s => s._id === serviceId)
    return service?.quantity || 0
  }

  const handleContinue = () => {
    try {
      console.log('=== Continue to Payment clicked ===')
      console.log('Current state:', state)
      console.log('Total amount:', state.totalAmount)
      console.log('Selected session:', state.selectedSession)
      console.log('User details:', state.userDetails)
      console.log('Selected services count:', state.selectedServices.length)

      if (!state.selectedSession) {
        console.error('No selected session, redirecting to yoga page')
        router.push('/yoga')
        return
      }

      // Allow proceeding even with no additional services
      // User still needs to pay for the yoga session itself
      console.log('Proceeding to payment...')
      console.log('- Yoga session price:', state.selectedSession.price)
      console.log('- Additional services:', state.selectedServices.length)
      console.log('- Total amount:', state.totalAmount)

      console.log('About to navigate to /yoga/booking/payment')

      // Try different navigation approaches
      const paymentUrl = '/yoga/booking/payment'
      console.log('Navigation URL:', paymentUrl)

      // Use window.location as fallback if router.push fails
      try {
        router.push(paymentUrl)
        console.log('router.push completed')
      } catch (routerError) {
        console.error('router.push failed, using window.location:', routerError)
        window.location.href = paymentUrl
      }

    } catch (error) {
      console.error('Error in handleContinue:', error)
      alert('Navigation failed. Please try refreshing the page.')
    }
  }

  const ServiceCard = ({ service }: { service: Service }) => {
    const ServiceIcon = getServiceIcon(service.category)
    const quantity = getServiceQuantity(service._id)

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all duration-200"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
            <ServiceIcon className="w-6 h-6 text-blue-600" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {service.name}
            </h3>

            <p className="text-gray-600 text-sm mb-3 leading-relaxed">
              {service.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="text-xl font-bold text-blue-600">
                {formatPrice(service.price, service.priceUnit)}
              </div>

              <div className="flex items-center gap-2">
                {quantity > 0 ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateServiceQuantity(service._id, quantity - 1)}
                      className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg font-medium min-w-[2rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateServiceQuantity(service._id, quantity + 1)}
                      className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeService(service._id)}
                      className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => addService(service)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  if (!state.selectedSession) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 md:px-[100px] py-8">
          <div className="text-center">
            <p className="text-gray-600">Session not found</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 md:px-[100px] py-8 max-w-6xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                ✓
              </div>
              <span className="text-sm font-medium text-green-600">Details</span>
            </div>
            <div className="w-16 h-px bg-green-300"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="text-sm font-medium text-orange-600">Services</span>
            </div>
            <div className="w-16 h-px bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="text-sm font-medium text-gray-500">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900">Your Cart</h3>
              </div>

              <div className="space-y-4">
                {/* Yoga Session */}
                <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-orange-600" />
                    <span className="font-medium text-orange-900 text-sm">
                      {state.selectedSession.type === '200hr' ? state.selectedSession.type + ' Training' : state.selectedSession.batchName}
                    </span>
                  </div>

                  <p className="text-xs text-orange-800 mb-2">
                    {state.selectedSession.batchName}
                  </p>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-orange-700">Program Fee</span>
                    <span className="font-semibold text-orange-900 text-sm">
                      {formatCurrency(state.selectedSession.price)}
                    </span>
                  </div>
                </div>

                {/* Selected Services */}
                {state.selectedServices.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-900">Additional Services</h4>
                    {state.selectedServices.map((service) => (
                      <div key={service._id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm font-medium text-gray-900 leading-tight">
                            {service.name}
                          </span>
                          <button
                            onClick={() => removeService(service._id)}
                            className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateServiceQuantity(service._id, (service.quantity || 1) - 1)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                              {service.quantity}
                            </span>
                            <button
                              onClick={() => updateServiceQuantity(service._id, (service.quantity || 1) + 1)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(service.price * (service.quantity || 1))}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold text-gray-900">Total Amount</span>
                    <span className="text-xl font-bold text-orange-600">
                      {formatCurrency(state.totalAmount)}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      console.log('Cart sidebar Continue to Payment clicked')
                      handleContinue()
                    }}
                    className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                  >
                    Continue to Payment
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={() => router.push('/yoga/booking/details')}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Additional Services</h1>
                    <p className="text-gray-600">Enhance your yoga experience with our additional services</p>
                  </div>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                        selectedCategory === category.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <category.icon className="w-4 h-4" />
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {filteredServices.length > 0 ? (
                  <div className="space-y-4">
                    {filteredServices.map(service => (
                      <ServiceCard key={service._id} service={service} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-xl mb-2">No services found</div>
                    <p className="text-gray-600">
                      Try selecting a different category
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Action Bar */}
              <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    {state.selectedServices.length > 0
                      ? `${state.selectedServices.reduce((sum, s) => sum + (s.quantity || 1), 0)} additional services selected`
                      : 'No additional services selected • You can proceed to pay for your yoga session'
                    }
                  </div>

                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      console.log('Bottom bar Continue to Payment clicked')
                      handleContinue()
                    }}
                    className="px-8 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                  >
                    Continue to Payment
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}