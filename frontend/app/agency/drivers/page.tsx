'use client'

import { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Award,
  Globe
} from 'lucide-react';
import { apiClient } from '../../../lib/api-client';
import AgencyNav from '../../../components/AgencyNav';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ErrorMessage from '../../../components/ErrorMessage';
import ImageUpload from '../../../components/ImageUpload';
import toast from 'react-hot-toast';

interface Driver {
  _id: string;
  name: string;
  phone: string;
  email: string;
  licenseNumber: string;
  licenseType: string;
  licenseExpiryDate: string;
  licenseImage?: string;
  profilePhoto?: string;
  experience: number;
  languages: string[];
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DriverFormData {
  name: string;
  phone: string;
  email: string;
  licenseNumber: string;
  licenseType: string;
  licenseExpiryDate: string;
  experience: number;
  languages: string[];
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  isAvailable: boolean;
}

const initialFormData: DriverFormData = {
  name: '',
  phone: '',
  email: '',
  licenseNumber: '',
  licenseType: 'light_vehicle',
  licenseExpiryDate: '',
  experience: 0,
  languages: [],
  address: '',
  emergencyContact: {
    name: '',
    phone: '',
    relationship: ''
  },
  isAvailable: true
};

export default function AgencyDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState<DriverFormData>(initialFormData);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [newLanguage, setNewLanguage] = useState('');

  // Image upload state for new drivers
  const [pendingLicenseImage, setPendingLicenseImage] = useState<File | null>(null);
  const [pendingProfilePhoto, setPendingProfilePhoto] = useState<File | null>(null);
  const [pendingLicensePreview, setPendingLicensePreview] = useState<string>('');
  const [pendingProfilePreview, setPendingProfilePreview] = useState<string>('');

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.agencyGet('/agency/drivers');

      if (response.success && response.data) {
        setDrivers((response.data as any)?.drivers || []);
      }
      setError('');
    } catch (err) {
      const errorMessage = 'Failed to load drivers';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Drivers error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDriver = () => {
    setEditingDriver(null);
    setFormData(initialFormData);
    setPendingLicenseImage(null);
    setPendingProfilePhoto(null);
    setPendingLicensePreview('');
    setPendingProfilePreview('');
    setShowModal(true);
  };

  const handleEditDriver = (driver: Driver) => {
    setEditingDriver(driver);
    // Convert date to YYYY-MM-DD format for HTML date input
    const date = new Date(driver.licenseExpiryDate).toISOString().split('T')[0];
    setFormData({
      name: driver.name,
      phone: driver.phone,
      email: driver.email,
      licenseNumber: driver.licenseNumber,
      licenseType: driver.licenseType,
      licenseExpiryDate: date,
      experience: driver.experience,
      languages: [...driver.languages],
      address: driver.address,
      emergencyContact: {
        name: driver.emergencyContact.name,
        phone: driver.emergencyContact.phone,
        relationship: driver.emergencyContact.relationship
      },
      isAvailable: driver.isAvailable
    });
    setShowModal(true);
  };

  const handleDeleteDriver = async (driverId: string) => {
    if (!confirm('Are you sure you want to delete this driver?')) return;

    try {
      const response = await apiClient.agencyDelete(`/agency/drivers/${driverId}`);

      if (response.success) {
        setDrivers(drivers.filter(d => d._id !== driverId));
        toast.success('Driver deleted successfully!');
      } else {
        const errorMessage = 'Failed to delete driver';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      const errorMessage = 'Failed to delete driver';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Delete error:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      if (editingDriver) {
        // Update existing driver
        const response = await apiClient.agencyPut(`/agency/drivers/${editingDriver._id}`, formData);

        if (response.success && response.data) {
          setDrivers(drivers.map(d =>
            d._id === editingDriver._id ? (response.data as any)?.driver : d
          ));
          setShowModal(false);
          toast.success('Driver updated successfully!');
        } else {
          const errorMessage = response.error || 'Failed to update driver';
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } else {
        // Create new driver
        const response = await apiClient.agencyPost('/agency/drivers', formData);

        if (response.success && response.data) {
          const newDriver = (response.data as any)?.driver;

          // Upload pending images if any
          try {
            if (pendingLicenseImage) {
              await uploadDriverLicense(newDriver._id, pendingLicenseImage);
            }
            if (pendingProfilePhoto) {
              await uploadDriverPhoto(newDriver._id, pendingProfilePhoto);
            }
          } catch (imageError) {
            console.error('Failed to upload images for new driver:', imageError);
            const imageErrorMessage = 'Driver created but failed to upload images. You can upload them later by editing the driver.';
            setError(imageErrorMessage);
            toast.error('Failed to upload driver images');
          }

          setDrivers([...drivers, newDriver]);
          setShowModal(false);
          setPendingLicenseImage(null);
          setPendingProfilePhoto(null);
          setPendingLicensePreview('');
          setPendingProfilePreview('');
          toast.success('Driver created successfully!');
        } else {
          const errorMessage = response.error || 'Failed to create driver';
          setError(errorMessage);
          toast.error(errorMessage);
        }
      }
    } catch (err) {
      const errorMessage = 'Failed to save driver';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Submit error:', err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (name.startsWith('emergencyContact.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseInt(value) || 0 :
                 type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }
  };

  const handleAddLanguage = () => {
    if (newLanguage.trim() && !formData.languages.includes(newLanguage.trim())) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()]
      }));
      setNewLanguage('');
    }
  };

  const handleRemoveLanguage = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(lang => lang !== language)
    }));
  };

  const uploadDriverLicense = async (driverId: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('agencyToken');
      const response = await fetch(`http://localhost:5001/api/agency/drivers/${driverId}/upload-license`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        // Update the driver in the local state
        setDrivers(prev => prev.map(d =>
          d._id === driverId
            ? { ...d, licenseImage: result.data.licenseImageUrl }
            : d
        ));

        // Update editing driver if it's the same one
        if (editingDriver && editingDriver._id === driverId) {
          setEditingDriver(prev => prev ? { ...prev, licenseImage: result.data.licenseImageUrl } : null);
        }
        toast.success('License image uploaded successfully!');
      } else {
        throw new Error(result.message || 'Failed to upload license image');
      }
    } catch (error) {
      console.error('License upload error:', error);
      throw error;
    }
  };

  const uploadDriverPhoto = async (driverId: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('agencyToken');
      const response = await fetch(`http://localhost:5001/api/agency/drivers/${driverId}/upload-photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        // Update the driver in the local state
        setDrivers(prev => prev.map(d =>
          d._id === driverId
            ? { ...d, profilePhoto: result.data.profilePhotoUrl }
            : d
        ));

        // Update editing driver if it's the same one
        if (editingDriver && editingDriver._id === driverId) {
          setEditingDriver(prev => prev ? { ...prev, profilePhoto: result.data.profilePhotoUrl } : null);
        }
        toast.success('Profile photo uploaded successfully!');
      } else {
        throw new Error(result.message || 'Failed to upload profile photo');
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      throw error;
    }
  };

  const filteredDrivers = drivers.filter(driver =>
    (driver.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (driver.phone || '').includes(searchTerm) ||
    (driver.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (driver.licenseNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const licenseTypes = ['light_vehicle', 'heavy_vehicle', 'commercial', 'chauffeur'];

  const isLicenseExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const monthsFromNow = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate());
    return expiry <= monthsFromNow;
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading drivers..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AgencyNav />

      <div className="lg:ml-64">
        <main className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Driver Management</h1>
              <p className="text-gray-600 mt-1">Manage your team of professional drivers</p>
            </div>
            <button
              onClick={handleCreateDriver}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Driver</span>
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
                placeholder="Search drivers by name, phone, email, or license number..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Drivers Grid */}
          {filteredDrivers.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {drivers.length === 0 ? 'No drivers added yet' : 'No drivers match your search'}
              </h3>
              <p className="text-gray-600 mb-6">
                {drivers.length === 0 ? 'Add your first driver to get started.' : 'Try adjusting your search terms.'}
              </p>
              {drivers.length === 0 && (
                <button
                  onClick={handleCreateDriver}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add First Driver
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDrivers.map((driver) => {
                console.log(new Date(driver.licenseExpiryDate).toLocaleDateString());
                return <div key={driver._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        {driver.profilePhoto ? (
                          <img
                            src={driver.profilePhoto}
                            alt={`${driver.name}'s profile`}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 font-medium text-lg">
                              {driver.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {driver.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {driver.licenseType.replace('_', ' ').toUpperCase()} License
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {driver.isAvailable ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        <span className={`text-sm font-medium ${
                          driver.isAvailable ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {driver.isAvailable ? 'Available' : 'Busy'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        <span>{driver.phone}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Award className="w-4 h-4 mr-2" />
                        <span>License: {driver.licenseNumber}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span className={isLicenseExpiringSoon(driver.licenseExpiryDate) ? 'text-red-600 font-medium' : ''}>
                          Expires: {new Date(driver.licenseExpiryDate).toLocaleDateString()}
                          {isLicenseExpiringSoon(driver.licenseExpiryDate) && ' (Soon)'}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        <span>{driver.experience} years experience</span>
                      </div>
                      {driver.languages.length > 0 && (
                        <div className="flex items-start text-sm text-gray-600">
                          <Globe className="w-4 h-4 mr-2 mt-0.5" />
                          <div className="flex flex-wrap gap-1">
                            {driver.languages.map((lang, index) => (
                              <span key={index} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">
                                {lang}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEditDriver(driver)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit driver"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDriver(driver._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete driver"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              })}
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
                {editingDriver ? 'Edit Driver' : 'Add New Driver'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., John Doe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g., +91 9876543210"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g., driver@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    License Number *
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., KL-123456789"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    License Type *
                  </label>
                  <select
                    name="licenseType"
                    value={formData.licenseType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {licenseTypes.map(type => (
                      <option key={type} value={type}>
                        {type.replace('_', ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    License Expiry Date *
                  </label>
                  <input
                    type="date"
                    name="licenseExpiryDate"
                    value={formData.licenseExpiryDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience (years) *
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    min="0"
                    max="50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
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
                    Available for assignments
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter full address..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact *</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      name="emergencyContact.name"
                      value={formData.emergencyContact.name}
                      onChange={handleInputChange}
                      placeholder="e.g., John Smith"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      name="emergencyContact.phone"
                      value={formData.emergencyContact.phone}
                      onChange={handleInputChange}
                      placeholder="e.g., +91 9876543210"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Relationship *
                    </label>
                    <select
                      name="emergencyContact.relationship"
                      value={formData.emergencyContact.relationship}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select relationship</option>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Brother">Brother</option>
                      <option value="Sister">Sister</option>
                      <option value="Friend">Friend</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Languages Spoken
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.languages.map((language, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {language}
                      <button
                        type="button"
                        onClick={() => handleRemoveLanguage(language)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    placeholder="Add a language (e.g., English, Hindi, Malayalam)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLanguage())}
                  />
                  <button
                    type="button"
                    onClick={handleAddLanguage}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Image Upload Section - Only show for existing drivers */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Driver Images</h3>
                {editingDriver ? (
                  // Existing driver - upload directly
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <ImageUpload
                        label="License Image"
                        placeholder="Upload driver's license document"
                        currentImageUrl={editingDriver.licenseImage}
                        onUpload={async (file) => {
                          await uploadDriverLicense(editingDriver._id, file);
                        }}
                        maxSizeMB={10}
                      />
                    </div>
                    <div>
                      <ImageUpload
                        label="Profile Photo"
                        placeholder="Upload driver's profile photo"
                        currentImageUrl={editingDriver.profilePhoto}
                        onUpload={async (file) => {
                          await uploadDriverPhoto(editingDriver._id, file);
                        }}
                        maxSizeMB={5}
                      />
                    </div>
                  </div>
                ) : (
                  // New driver - store images temporarily
                  <div>
                    <p className="text-sm text-gray-600 mb-4">Note: Images will be uploaded when the driver is created.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <ImageUpload
                          label="License Image"
                          placeholder="Select driver's license document"
                          currentImageUrl={pendingLicensePreview}
                          onUpload={async (file) => {
                            setPendingLicenseImage(file);
                            setPendingLicensePreview(URL.createObjectURL(file));
                          }}
                          maxSizeMB={10}
                        />
                      </div>
                      <div>
                        <ImageUpload
                          label="Profile Photo"
                          placeholder="Select driver's profile photo"
                          currentImageUrl={pendingProfilePreview}
                          onUpload={async (file) => {
                            setPendingProfilePhoto(file);
                            setPendingProfilePreview(URL.createObjectURL(file));
                          }}
                          maxSizeMB={5}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    // Clean up object URLs to prevent memory leaks
                    if (pendingLicensePreview) URL.revokeObjectURL(pendingLicensePreview);
                    if (pendingProfilePreview) URL.revokeObjectURL(pendingProfilePreview);
                    setPendingLicenseImage(null);
                    setPendingProfilePhoto(null);
                    setPendingLicensePreview('');
                    setPendingProfilePreview('');
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
                  {submitLoading ? 'Saving...' : (editingDriver ? 'Update Driver' : 'Add Driver')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}