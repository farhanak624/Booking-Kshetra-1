'use client'

import { useState, useEffect } from 'react';
import {
  Car,
  Plus,
  Edit,
  Trash2,
  Search,
  Users,
  Fuel,
  CheckCircle,
  XCircle,
  Calendar
} from 'lucide-react';
import { apiClient } from '../../../lib/api-client';
import AgencyNav from '../../../components/AgencyNav';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ErrorMessage from '../../../components/ErrorMessage';
import ImageUpload from '../../../components/ImageUpload';
import toast from 'react-hot-toast';

interface Vehicle {
  _id: string;
  vehicleNumber: string;
  vehicleType: string;
  brand: string;
  vehicleModel: string;
  capacity: number;
  fuelType: string;
  isAvailable: boolean;
  vehicleImages?: string[];
  insurance: {
    provider: string;
    policyNumber: string;
    expiryDate: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface VehicleFormData {
  vehicleNumber: string;
  vehicleType: string;
  brand: string;
  vehicleModel: string;
  capacity: number;
  fuelType: string;
  isAvailable: boolean;
  insurance: {
    provider: string;
    policyNumber: string;
    expiryDate: string;
  };
}

const initialFormData: VehicleFormData = {
  vehicleNumber: '',
  vehicleType: 'sedan',
  brand: '',
  vehicleModel: '',
  capacity: 4,
  fuelType: 'petrol',
  isAvailable: true,
  insurance: {
    provider: '',
    policyNumber: '',
    expiryDate: ''
  }
};

export default function AgencyVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState<VehicleFormData>(initialFormData);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Image upload state for vehicles
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const [pendingImagePreviews, setPendingImagePreviews] = useState<string[]>([]);

  // Upload vehicle images function
  const uploadVehicleImages = async (vehicleId: string, files: File[]) => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      const token = localStorage.getItem('agencyToken');
      const response = await fetch(`http://localhost:5001/api/agency/vehicles/${vehicleId}/upload-images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        return result.data.newImageUrls;
      } else {
        throw new Error(result.message || 'Failed to upload images');
      }
    } catch (error) {
      console.error('Vehicle image upload error:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await apiClient.agencyGet('/agency/vehicles');

      if (response.success && response.data) {
        setVehicles((response.data as any)?.vehicles || []);
      }
      setError('');
    } catch (err) {
      const errorMessage = 'Failed to load vehicles';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Vehicles error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVehicle = () => {
    setEditingVehicle(null);
    setFormData(initialFormData);
    setPendingImages([]);
    setPendingImagePreviews([]);
    setShowModal(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      vehicleNumber: vehicle.vehicleNumber,
      vehicleType: vehicle.vehicleType,
      brand: vehicle.brand || '',
      vehicleModel: vehicle.vehicleModel,
      capacity: vehicle.capacity,
      fuelType: vehicle.fuelType,
      isAvailable: vehicle.isAvailable,
      insurance: { ...vehicle.insurance }
    });
    setPendingImages([]);
    setPendingImagePreviews([]);
    setShowModal(true);
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    try {
      const response = await apiClient.agencyDelete(`/agency/vehicles/${vehicleId}`);

      if (response.success) {
        setVehicles(vehicles.filter(v => v._id !== vehicleId));
        toast.success('Vehicle deleted successfully!');
      } else {
        const errorMessage = 'Failed to delete vehicle';
        toast.error(errorMessage);
      }
    } catch (err) {
      const errorMessage = 'Failed to delete vehicle';
      toast.error(errorMessage);
      console.error('Delete error:', err);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      if (editingVehicle) {
        // Update existing vehicle
        const response = await apiClient.agencyPut(`/agency/vehicles/${editingVehicle._id}`, formData);

        if (response.success && response.data) {
          const updatedVehicle = (response.data as any)?.vehicle;

          // No need to handle pending images for existing vehicles as they upload directly
          setVehicles(vehicles.map(v =>
            v._id === editingVehicle._id ? updatedVehicle : v
          ));

          // Clean up pending images
          pendingImagePreviews.forEach(url => URL.revokeObjectURL(url));
          setPendingImages([]);
          setPendingImagePreviews([]);
          setShowModal(false);
          toast.success('Vehicle updated successfully!');
        } else {
          const errorMessage = response.error || 'Failed to update vehicle';
          toast.error(errorMessage);
        }
      } else {
        // Create new vehicle
        const response = await apiClient.agencyPost('/agency/vehicles', formData);

        if (response.success && response.data) {
          const newVehicle = (response.data as any)?.vehicle;

          // Upload images after creating the vehicle
          if (pendingImages.length > 0) {
            try {
              const newImageUrls = await uploadVehicleImages(newVehicle._id, pendingImages);
              // Update the new vehicle with image URLs
              newVehicle.vehicleImages = newImageUrls;
            } catch (error) {
              console.error('Failed to upload vehicle images:', error);
              toast.error('Vehicle created but failed to upload images. You can add them later.');
            }
          }

          setVehicles([...vehicles, newVehicle]);

          // Clean up pending images
          pendingImagePreviews.forEach(url => URL.revokeObjectURL(url));
          setPendingImages([]);
          setPendingImagePreviews([]);
          setShowModal(false);
          toast.success('Vehicle created successfully!');
        } else {
          const errorMessage = response.error || 'Failed to create vehicle';
          toast.error(errorMessage);
        }
      }
    } catch (err) {
      const errorMessage = 'Failed to save vehicle';
      toast.error(errorMessage);
      console.error('Submit error:', err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof VehicleFormData] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseInt(value) :
               type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    (vehicle.vehicleNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (vehicle.vehicleType?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (vehicle.vehicleModel?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const vehicleTypes = ['sedan', 'suv', 'hatchback', 'pickup', 'van', 'bus'];
  const fuelTypes = ['petrol', 'diesel', 'cng', 'electric', 'hybrid'];

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading vehicles..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AgencyNav />

      <div className="lg:ml-64">
        <main className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Vehicle Management</h1>
              <p className="text-gray-600 mt-1">Manage your transport fleet</p>
            </div>
            <button
              onClick={handleCreateVehicle}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vehicle</span>
            </button>
          </div>

          {error && (
            <div className="mb-6">
              <ErrorMessage message={error} />
            </div>
          )}

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search vehicles by number, type, or model..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Vehicles Grid */}
          {filteredVehicles.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {vehicles.length === 0 ? 'No vehicles added yet' : 'No vehicles match your search'}
              </h3>
              <p className="text-gray-600 mb-6">
                {vehicles.length === 0 ? 'Add your first vehicle to get started.' : 'Try adjusting your search terms.'}
              </p>
              {vehicles.length === 0 && (
                <button
                  onClick={handleCreateVehicle}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add First Vehicle
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVehicles.map((vehicle) => (
                <div key={vehicle._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {vehicle.vehicleNumber}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {vehicle.vehicleModel}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {vehicle.isAvailable ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        <span className={`text-sm font-medium ${
                          vehicle.isAvailable ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {vehicle.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Car className="w-4 h-4 mr-2" />
                        <span>{vehicle.vehicleType ? vehicle.vehicleType.charAt(0).toUpperCase() + vehicle.vehicleType.slice(1) : 'N/A'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        <span>{vehicle.capacity} passengers</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Fuel className="w-4 h-4 mr-2" />
                        <span>{vehicle.fuelType ? vehicle.fuelType.charAt(0).toUpperCase() + vehicle.fuelType.slice(1) : 'N/A'}</span>
                      </div>
                      {vehicle.insurance?.expiryDate && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>Insurance expires: {new Date(vehicle.insurance.expiryDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEditVehicle(vehicle)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit vehicle"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteVehicle(vehicle._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete vehicle"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Number *
                  </label>
                  <input
                    type="text"
                    name="vehicleNumber"
                    value={formData.vehicleNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., KL-01-AB-1234"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Type *
                  </label>
                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {vehicleTypes.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Brand *
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    placeholder="e.g., Toyota"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Model *
                  </label>
                  <input
                    type="text"
                    name="vehicleModel"
                    value={formData.vehicleModel}
                    onChange={handleInputChange}
                    placeholder="e.g., Toyota Innova"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacity (passengers) *
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    min="1"
                    max="50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuel Type *
                  </label>
                  <select
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {fuelTypes.map(fuel => (
                      <option key={fuel} value={fuel}>
                        {fuel.charAt(0).toUpperCase() + fuel.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={formData.isAvailable}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700">
                    Available for bookings
                  </label>
                </div>
              </div>

              {/* Vehicle Images Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Vehicle Images</h3>
                <div className="space-y-4">
                  {editingVehicle ? (
                    // Existing vehicle - upload directly
                    <ImageUpload
                      variant="multiple"
                      label="Vehicle Images"
                      placeholder="Upload images for this vehicle"
                      currentImageUrls={editingVehicle.vehicleImages || []}
                      onUpload={async (files: File[]) => {
                        try {
                          const newImageUrls = await uploadVehicleImages(editingVehicle._id, files);

                          // Update the local state
                          setEditingVehicle(prev => prev ? {
                            ...prev,
                            vehicleImages: [...(prev.vehicleImages || []), ...newImageUrls]
                          } : null);

                          // Update the vehicles list
                          setVehicles(prev => prev.map(v =>
                            v._id === editingVehicle._id
                              ? { ...v, vehicleImages: [...(v.vehicleImages || []), ...newImageUrls] }
                              : v
                          ));
                          toast.success('Vehicle images uploaded successfully!');
                        } catch (error) {
                          toast.error('Failed to upload images. Please try again.');
                        }
                      }}
                      maxFiles={10}
                      maxSizeMB={5}
                    />
                  ) : (
                    // New vehicle - store images temporarily and upload after creation
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">Note: Images will be uploaded when the vehicle is created.</p>
                      <ImageUpload
                        variant="multiple"
                        label="Vehicle Images"
                        placeholder="Select images for this vehicle"
                        currentImageUrls={pendingImagePreviews}
                        onUpload={async (files: File[]) => {
                          // Store files for upload after creation
                          setPendingImages(prev => [...prev, ...files]);

                          // Create preview URLs
                          const newPreviews = files.map(file => URL.createObjectURL(file));
                          setPendingImagePreviews(prev => [...prev, ...newPreviews]);
                        }}
                        maxFiles={10}
                        maxSizeMB={5}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Insurance Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Insurance Provider
                    </label>
                    <input
                      type="text"
                      name="insurance.provider"
                      value={formData.insurance.provider}
                      onChange={handleInputChange}
                      placeholder="e.g., ICICI Lombard"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Policy Number
                    </label>
                    <input
                      type="text"
                      name="insurance.policyNumber"
                      value={formData.insurance.policyNumber}
                      onChange={handleInputChange}
                      placeholder="e.g., POL123456789"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Insurance Expiry Date
                    </label>
                    <input
                      type="date"
                      name="insurance.expiryDate"
                      value={formData.insurance.expiryDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    // Clean up pending image previews
                    pendingImagePreviews.forEach(url => URL.revokeObjectURL(url));
                    setPendingImages([]);
                    setPendingImagePreviews([]);
                    setShowModal(false);
                  }}
                  className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={submitLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={submitLoading}
                >
                  {submitLoading ? 'Saving...' : (editingVehicle ? 'Update Vehicle' : 'Add Vehicle')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}