'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, Users, Car, Coffee, Bike, MapPin, 
  Waves, Heart, Plane, Clock, User, MessageSquare
} from 'lucide-react'
import { BookingFormData, PricingBreakdown } from '../types'

interface BookingFormProps {
  formData: BookingFormData
  setFormData: React.Dispatch<React.SetStateAction<BookingFormData>>
  pricing: PricingBreakdown
}

export default function BookingForm({ formData, setFormData, pricing }: BookingFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 6

  const steps = [
    { number: 1, title: 'Dates & Guests', icon: Calendar },
    { number: 2, title: 'Room Selection', icon: Users },
    { number: 3, title: 'Airport Transfers', icon: Plane },
    { number: 4, title: 'Meals', icon: Coffee },
    { number: 5, title: 'Activities & Yoga', icon: Heart },
    { number: 6, title: 'Review & Book', icon: MessageSquare },
  ]

  const updateFormData = (section: keyof BookingFormData, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...(prev[section] as any), ...data }
    }))
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <DatesAndGuestsStep formData={formData} updateFormData={updateFormData} />
      case 2:
        return <RoomSelectionStep formData={formData} updateFormData={updateFormData} />
      case 3:
        return <AirportTransportStep formData={formData} updateFormData={updateFormData} />
      case 4:
        return <MealsStep formData={formData} updateFormData={updateFormData} />
      case 5:
        return <ActivitiesAndYogaStep formData={formData} updateFormData={updateFormData} />
      case 6:
        return <ReviewAndBookStep formData={formData} updateFormData={updateFormData} pricing={pricing} />
      default:
        return null
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Progress Bar */}
      <div className="bg-gray-50 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`flex flex-col items-center gap-2 ${
                step.number <= currentStep ? 'text-primary-600' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step.number <= currentStep
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {step.number}
              </div>
              <span className="text-xs font-medium hidden sm:block">{step.title}</span>
            </div>
          ))}
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="p-6">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Previous
          </button>
          
          {currentStep < totalSteps ? (
            <button
              onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
              className="btn-primary"
            >
              Next Step
            </button>
          ) : (
            <button
              onClick={() => {
                // Handle booking submission
                console.log('Booking submitted:', formData)
                alert('Booking functionality will be implemented with backend!')
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200"
            >
              Complete Booking
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Step 1: Dates and Guests
function DatesAndGuestsStep({ formData, updateFormData }: any) {
  const today = new Date().toISOString().split('T')[0]
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Select Your Dates & Guests</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Check-in Date
          </label>
          <input
            type="date"
            min={today}
            value={formData.dates.checkIn ? formData.dates.checkIn.toISOString().split('T')[0] : ''}
            onChange={(e) => {
              const date = new Date(e.target.value)
              updateFormData('dates', { checkIn: date })
            }}
            className="input-field"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Check-out Date
          </label>
          <input
            type="date"
            min={formData.dates.checkIn ? new Date(formData.dates.checkIn.getTime() + 24*60*60*1000).toISOString().split('T')[0] : today}
            value={formData.dates.checkOut ? formData.dates.checkOut.toISOString().split('T')[0] : ''}
            onChange={(e) => {
              const date = new Date(e.target.value)
              const nights = formData.dates.checkIn 
                ? Math.ceil((date.getTime() - formData.dates.checkIn.getTime()) / (1000 * 60 * 60 * 24))
                : 0
              updateFormData('dates', { checkOut: date, nights })
            }}
            className="input-field"
          />
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adults
          </label>
          <select
            value={formData.guests.adults}
            onChange={(e) => updateFormData('guests', { adults: parseInt(e.target.value) })}
            className="input-field"
          >
            {[1, 2, 3, 4, 5, 6].map(num => (
              <option key={num} value={num}>{num} Adult{num > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Children (Under 18)
          </label>
          <select
            value={formData.guests.children}
            onChange={(e) => updateFormData('guests', { children: parseInt(e.target.value) })}
            className="input-field"
          >
            {[0, 1, 2, 3, 4].map(num => (
              <option key={num} value={num}>{num} Child{num > 1 ? 'ren' : ''}</option>
            ))}
          </select>
        </div>
      </div>
      
      {formData.dates.checkIn && formData.dates.checkOut && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <h3 className="font-semibold text-primary-900 mb-2">Booking Summary</h3>
          <p className="text-primary-700">
            {formData.dates.nights} night{formData.dates.nights > 1 ? 's' : ''} • {formData.guests.adults} adult{formData.guests.adults > 1 ? 's' : ''}
            {formData.guests.children > 0 && ` • ${formData.guests.children} child${formData.guests.children > 1 ? 'ren' : ''}`}
          </p>
        </div>
      )}
    </div>
  )
}

// Step 2: Room Selection
function RoomSelectionStep({ formData, updateFormData }: any) {
  const rooms = [
    { id: 'ac', type: 'AC', price: 3000, description: 'Air-conditioned room with modern amenities' },
    { id: 'non-ac', type: 'Non-AC', price: 2000, description: 'Comfortable room with natural ventilation' }
  ]
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Choose Your Room</h2>
      
      <div className="grid gap-4">
        {rooms.map((room) => (
          <div
            key={room.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
              formData.room.roomType === room.type
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300'
            }`}
            onClick={() => updateFormData('room', { 
              roomId: room.id, 
              roomType: room.type, 
              pricePerNight: room.price 
            })}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900">{room.type} Room</h3>
                <p className="text-gray-600 text-sm mt-1">{room.description}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary-600">₹{room.price}</div>
                <div className="text-sm text-gray-500">per night</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-gray-50 border rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">What's Included</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Free WiFi</li>
          <li>• Daily housekeeping</li>
          <li>• Complimentary breakfast</li>
          <li>• Access to common areas</li>
          <li>• 24/7 front desk support</li>
        </ul>
      </div>
    </div>
  )
}

// Step 3: Airport Transfers
function AirportTransportStep({ formData, updateFormData }: any) {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Airport Transfer Services</h2>

      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Plane className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Airport Transfer</h3>
        </div>

        {/* Airport Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Airport
          </label>
          <select
            value={formData.transport.airportLocation}
            onChange={(e) => updateFormData('transport', { airportLocation: e.target.value })}
            className="input-field"
          >
            <option value="kochi">Kochi (COK)</option>
            <option value="trivandrum">Trivandrum (TRV)</option>
          </select>
        </div>

        {/* Pickup Service */}
        <div className="border rounded-lg p-4">
          <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
            <input
              type="checkbox"
              checked={formData.transport.pickup}
              onChange={(e) => {
                updateFormData('transport', {
                  pickup: e.target.checked,
                  pickupDetails: e.target.checked ? (formData.transport.pickupDetails || {}) : undefined
                })
              }}
              className="w-5 h-5 text-primary-600"
            />
            <div>
              <div className="font-medium">Airport Pickup Service</div>
              <div className="text-sm text-gray-600">₹1,500 from Airport to Resort</div>
            </div>
          </label>

          {formData.transport.pickup && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Flight Number
                  </label>
                  <input
                    type="text"
                    value={formData.transport.pickupDetails?.flightNumber || ''}
                    onChange={(e) => updateFormData('transport', {
                      pickupDetails: {
                        ...formData.transport.pickupDetails,
                        flightNumber: e.target.value
                      }
                    })}
                    placeholder="AI123"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Arrival Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.transport.pickupDetails?.arrivalTime || ''}
                    onChange={(e) => updateFormData('transport', {
                      pickupDetails: {
                        ...formData.transport.pickupDetails,
                        arrivalTime: e.target.value
                      }
                    })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Terminal
                  </label>
                  <select
                    value={formData.transport.pickupDetails?.terminal || ''}
                    onChange={(e) => updateFormData('transport', {
                      pickupDetails: {
                        ...formData.transport.pickupDetails,
                        terminal: e.target.value
                      }
                    })}
                    className="input-field"
                  >
                    <option value="">Select Terminal</option>
                    <option value="T1">Terminal 1</option>
                    <option value="T2">Terminal 2</option>
                    <option value="T3">Terminal 3</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drop Service */}
        <div className="border rounded-lg p-4">
          <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
            <input
              type="checkbox"
              checked={formData.transport.drop}
              onChange={(e) => {
                updateFormData('transport', {
                  drop: e.target.checked,
                  dropDetails: e.target.checked ? (formData.transport.dropDetails || {}) : undefined
                })
              }}
              className="w-5 h-5 text-primary-600"
            />
            <div>
              <div className="font-medium">Airport Drop Service</div>
              <div className="text-sm text-gray-600">₹1,500 from Resort to Airport</div>
            </div>
          </label>

          {formData.transport.drop && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Flight Number
                  </label>
                  <input
                    type="text"
                    value={formData.transport.dropDetails?.flightNumber || ''}
                    onChange={(e) => updateFormData('transport', {
                      dropDetails: {
                        ...formData.transport.dropDetails,
                        flightNumber: e.target.value
                      }
                    })}
                    placeholder="AI123"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departure Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.transport.dropDetails?.departureTime || ''}
                    onChange={(e) => updateFormData('transport', {
                      dropDetails: {
                        ...formData.transport.dropDetails,
                        departureTime: e.target.value
                      }
                    })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Terminal
                  </label>
                  <select
                    value={formData.transport.dropDetails?.terminal || ''}
                    onChange={(e) => updateFormData('transport', {
                      dropDetails: {
                        ...formData.transport.dropDetails,
                        terminal: e.target.value
                      }
                    })}
                    className="input-field"
                  >
                    <option value="">Select Terminal</option>
                    <option value="T1">Terminal 1</option>
                    <option value="T2">Terminal 2</option>
                    <option value="T3">Terminal 3</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {(formData.transport.pickup || formData.transport.drop) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Service Information</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Professional drivers with airport pickup experience</li>
              <li>• Vehicle tracking and real-time updates</li>
              <li>• 24/7 customer support</li>
              <li>• Flight delay monitoring (when flight number provided)</li>
              <li>• Meet and greet service at arrivals</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

// Step 4: Meals
function MealsStep({ formData, updateFormData }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Meal Services</h2>

      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Coffee className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Additional Breakfast</h3>
        </div>

        <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="checkbox"
            checked={formData.breakfast.enabled}
            onChange={(e) => {
              updateFormData('breakfast', {
                enabled: e.target.checked,
                days: e.target.checked ? formData.dates.nights : 0,
                persons: e.target.checked ? formData.guests.adults : 0
              })
            }}
            className="w-5 h-5 text-primary-600"
          />
          <div>
            <div className="font-medium">Extra Breakfast Service</div>
            <div className="text-sm text-gray-600">₹200 per person per day</div>
          </div>
        </label>

        {formData.breakfast.enabled && (
          <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Days
              </label>
              <input
                type="number"
                min="1"
                max={formData.dates.nights}
                value={formData.breakfast.days}
                onChange={(e) => updateFormData('breakfast', { days: parseInt(e.target.value) })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of People
              </label>
              <input
                type="number"
                min="1"
                max={formData.guests.adults + formData.guests.children}
                value={formData.breakfast.persons}
                onChange={(e) => updateFormData('breakfast', { persons: parseInt(e.target.value) })}
                className="input-field"
              />
            </div>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">What's Included</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Traditional Kerala breakfast items</li>
            <li>• Fresh fruit and juice</li>
            <li>• Coffee and tea</li>
            <li>• Vegetarian and non-vegetarian options</li>
            <li>• Special dietary requirements accommodated</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// Step 5: Activities and Yoga
function ActivitiesAndYogaStep({ formData, updateFormData }: any) {
  const services = [
    {
      key: 'bikeRental',
      icon: Bike,
      name: 'Bike Rental',
      description: 'Explore Kerala on two wheels',
      price: 500,
      unit: 'per day',
      hasQuantity: true,
      hasDays: true
    },
    {
      key: 'sightseeing',
      icon: MapPin,
      name: 'Local Sightseeing',
      description: 'Guided tours to nearby attractions',
      price: 1500,
      unit: 'per person',
      hasQuantity: false,
      hasDays: false
    },
    {
      key: 'surfing',
      icon: Waves,
      name: 'Surfing Lessons',
      description: 'Professional surfing instruction (min age 15)',
      price: 2000,
      unit: 'per person',
      hasQuantity: false,
      hasDays: false,
      minAge: 15
    }
  ]

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Activities & Yoga</h2>
      
      {/* Activities Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Adventure Activities</h3>
        
        {services.map((service) => (
          <div key={service.key} className="border rounded-lg p-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.services[service.key].enabled}
                onChange={(e) => {
                  updateFormData('services', {
                    [service.key]: {
                      ...formData.services[service.key],
                      enabled: e.target.checked,
                      persons: e.target.checked ? (service.key === 'bikeRental' ? 1 : 1) : 0
                    }
                  })
                }}
                className="w-5 h-5 text-primary-600"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <service.icon className="w-5 h-5 text-primary-600" />
                  <span className="font-medium">{service.name}</span>
                  <span className="text-sm text-gray-500">₹{service.price} {service.unit}</span>
                </div>
                <p className="text-sm text-gray-600">{service.description}</p>
              </div>
            </label>
            
            {formData.services[service.key].enabled && (
              <div className="mt-4 p-3 bg-gray-50 rounded grid md:grid-cols-2 gap-4">
                {service.hasQuantity && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={formData.services[service.key].quantity}
                      onChange={(e) => updateFormData('services', {
                        [service.key]: {
                          ...formData.services[service.key],
                          quantity: parseInt(e.target.value)
                        }
                      })}
                      className="input-field"
                    />
                  </div>
                )}
                
                {service.hasDays && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Days
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={formData.dates.nights}
                      value={formData.services[service.key].days}
                      onChange={(e) => updateFormData('services', {
                        [service.key]: {
                          ...formData.services[service.key],
                          days: parseInt(e.target.value)
                        }
                      })}
                      className="input-field"
                    />
                  </div>
                )}
                
                {!service.hasQuantity && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of People
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={formData.guests.adults}
                      value={formData.services[service.key].persons}
                      onChange={(e) => updateFormData('services', {
                        [service.key]: {
                          ...formData.services[service.key],
                          persons: parseInt(e.target.value)
                        }
                      })}
                      className="input-field"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Yoga Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Yoga Teacher Training</h3>
        </div>
        
        <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="checkbox"
            checked={formData.yogaSession.enabled}
            onChange={(e) => updateFormData('yogaSession', { enabled: e.target.checked })}
            className="w-5 h-5 text-primary-600"
          />
          <div>
            <div className="font-medium">Join Yoga TTC Program</div>
            <div className="text-sm text-gray-600">Must have room booking to enroll</div>
          </div>
        </label>
        
        {formData.yogaSession.enabled && (
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Program Type
              </label>
              <select
                value={formData.yogaSession.type}
                onChange={(e) => updateFormData('yogaSession', { type: e.target.value })}
                className="input-field"
              >
                <option value="200hr">200 Hour TTC - ₹15,000</option>
                <option value="300hr">300 Hour TTC - ₹20,000</option>
              </select>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded p-3">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> Yoga TTC programs have limited seats (15 per batch). 
                Room booking is mandatory for enrollment.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Step 6: Review and Book
function ReviewAndBookStep({ formData, updateFormData, pricing }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Review Your Booking</h2>
      
      {/* Booking Summary */}
      <div className="space-y-4">
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <h3 className="font-semibold text-primary-900 mb-2">Booking Details</h3>
          <div className="text-sm text-primary-700 space-y-1">
            <p>Check-in: {formData.dates.checkIn?.toLocaleDateString()}</p>
            <p>Check-out: {formData.dates.checkOut?.toLocaleDateString()}</p>
            <p>Duration: {formData.dates.nights} nights</p>
            <p>Guests: {formData.guests.adults} adults, {formData.guests.children} children</p>
            <p>Room: {formData.room.roomType} Room</p>
          </div>
        </div>
        
        {/* Special Requests */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Special Requests (Optional)
          </label>
          <textarea
            value={formData.specialRequests || ''}
            onChange={(e) => updateFormData('specialRequests', e.target.value)}
            placeholder="Any special requirements or requests..."
            rows={4}
            className="input-field"
          />
        </div>
        
        {/* Terms and Conditions */}
        <div className="bg-gray-50 border rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Important Information</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Cancellation policy: Free cancellation up to 24 hours before check-in</li>
            <li>• Food charges: ₹150 per adult per day (children under 5 are free)</li>
            <li>• Yoga TTC requires room booking and has limited availability</li>
            <li>• Surfing activities have minimum age requirement of 15 years</li>
            <li>• Transport services subject to availability</li>
          </ul>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            🎉 <strong>Total Amount: ₹{pricing.totalAmount.toLocaleString()}</strong>
          </p>
          <p className="text-xs text-green-600 mt-1">
            You'll receive email and WhatsApp confirmations after booking
          </p>
        </div>
      </div>
    </div>
  )
}