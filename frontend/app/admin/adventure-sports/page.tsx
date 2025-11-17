'use client'

import { useState, useEffect } from 'react';
import {
  Activity,
  Plus,
  Edit,
  Trash2,
  Search,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  IndianRupee,
  MapPin,
  Shield,
  Eye
} from 'lucide-react';
import ImageUpload from '../../../components/ImageUpload';
import { adminAPI } from '../../../lib/api';

interface AdventureSport {
  _id: string;
  name: string;
  category: 'adventure' | 'surfing' | 'diving' | 'trekking';
  price: number;
  priceUnit: 'per_session' | 'per_person' | 'per_day' | 'per_trip';
  description: string;
  detailedDescription?: string;
  duration?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  location?: string;
  features: string[];
  includedItems?: string[];
  requirements?: string[];
  images?: string[];
  ageRestriction?: {
    minAge?: number;
    maxAge?: number;
  };
  instructor?: {
    name: string;
    experience: string;
    certifications: string[];
  };
  safety?: string[];
  whatToBring?: string[];
  cancellationPolicy?: string;
  maxQuantity?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AdventureSportFormData {
  name: string;
  category: 'adventure' | 'surfing' | 'diving' | 'trekking';
  price: number;
  priceUnit: 'per_session' | 'per_person' | 'per_day' | 'per_trip';
  description: string;
  detailedDescription: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  location: string;
  features: string[];
  includedItems: string[];
  requirements: string[];
  images: string[];
  ageRestriction: {
    minAge: number;
    maxAge: number;
  };
  instructor: {
    name: string;
    experience: string;
    certifications: string[];
  };
  safety: string[];
  whatToBring: string[];
  cancellationPolicy: string;
  maxQuantity: number;
}

const initialFormData: AdventureSportFormData = {
  name: '',
  category: 'adventure',
  price: 0,
  priceUnit: 'per_session',
  description: '',
  detailedDescription: '',
  duration: '',
  difficulty: 'beginner',
  location: '',
  features: [],
  includedItems: [],
  requirements: [],
  images: [],
  ageRestriction: {
    minAge: 10,
    maxAge: 65
  },
  instructor: {
    name: '',
    experience: '',
    certifications: []
  },
  safety: [],
  whatToBring: [],
  cancellationPolicy: '',
  maxQuantity: 10
};

// Upload adventure sport images
const uploadAdventureSportImages = async (sportId: string, files: File[]) => {
  try {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    const response = await adminAPI.uploadAdventureSportImages(sportId, formData);

    if (response.data.success) {
      return response.data.data.newImageUrls;
    } else {
      throw new Error(response.data.message || 'Failed to upload images');
    }
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
};

export default function AdminAdventureSports() {
  const [sports, setSports] = useState<AdventureSport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'adventure' | 'surfing' | 'diving' | 'trekking'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingSport, setEditingSport] = useState<AdventureSport | null>(null);
  const [formData, setFormData] = useState<AdventureSportFormData>(initialFormData);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'instructor' | 'media'>('basic');

  // Form helpers
  const [newFeature, setNewFeature] = useState('');
  const [newIncludedItem, setNewIncludedItem] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [newSafetyItem, setNewSafetyItem] = useState('');
  const [newWhatToBring, setNewWhatToBring] = useState('');
  const [newImage, setNewImage] = useState('');
  const [newCertification, setNewCertification] = useState('');

  // Image upload state for new activities
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const [pendingImagePreviews, setPendingImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    fetchSports();
  }, [categoryFilter]);

  const fetchSports = async () => {
    try {
      setLoading(true);

      const params = categoryFilter === 'all' ? {} : { category: categoryFilter };
      const response = await adminAPI.getAllAdventureSports(params);

      if (response.data.success) {
        setSports(response.data.data.sports || []);
      } else {
        setError(response.data.message || 'Failed to fetch adventure sports');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load adventure sports');
      console.error('Adventure sports error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSport = () => {
    setEditingSport(null);
    setFormData(initialFormData);
    setActiveTab('basic');
    setPendingImages([]);
    setPendingImagePreviews([]);
    setShowModal(true);
  };

  const handleEditSport = (sport: AdventureSport) => {
    setEditingSport(sport);
    setFormData({
      name: sport.name,
      category: sport.category,
      price: sport.price,
      priceUnit: sport.priceUnit,
      description: sport.description,
      detailedDescription: sport.detailedDescription || '',
      duration: sport.duration || '',
      difficulty: sport.difficulty || 'beginner',
      location: sport.location || '',
      features: sport.features || [],
      includedItems: sport.includedItems || [],
      requirements: sport.requirements || [],
      images: sport.images || [],
      ageRestriction: {
        minAge: sport.ageRestriction?.minAge || 10,
        maxAge: sport.ageRestriction?.maxAge || 65
      },
      instructor: sport.instructor || { name: '', experience: '', certifications: [] },
      safety: sport.safety || [],
      whatToBring: sport.whatToBring || [],
      cancellationPolicy: sport.cancellationPolicy || '',
      maxQuantity: sport.maxQuantity || 10
    });
    setActiveTab('basic');
    setShowModal(true);
  };

  const handleDeleteSport = async (sportId: string) => {
    if (!confirm('Are you sure you want to delete this adventure sport?')) return;

    try {
      const response = await adminAPI.deleteAdventureSport(sportId);

      if (response.data.success) {
        setSports(sports.filter(s => s._id !== sportId));
      } else {
        setError(response.data.message || 'Failed to delete adventure sport');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete adventure sport');
      console.error('Delete error:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      if (editingSport) {
        // Update existing sport - include images from editingSport state
        const updatePayload = {
          ...formData,
          images: editingSport.images || [] // Use images from editingSport state (includes any removals)
        };
        const response = await adminAPI.updateAdventureSport(editingSport._id, updatePayload);

        if (response.data.success) {
          setSports(sports.map(s =>
            s._id === editingSport._id ? response.data.data : s
          ));
          setShowModal(false);
        } else {
          setError(response.data.message || 'Failed to update adventure sport');
        }
      } else {
        // Create new sport
        const response = await adminAPI.createAdventureSport(formData);

        if (response.data.success) {
          const newSport = response.data.data;

          // Upload pending images if any
          if (pendingImages.length > 0) {
            try {
              const newImageUrls = await uploadAdventureSportImages(newSport._id, pendingImages);
              newSport.images = [...(newSport.images || []), ...newImageUrls];
            } catch (imageError) {
              console.error('Failed to upload images for new sport:', imageError);
              setError('Sport created but failed to upload images. You can upload them later.');
            }
          }

          setSports([...sports, newSport]);
          setShowModal(false);
          setPendingImages([]);
          setPendingImagePreviews([]);
        } else {
          setError(response.data.message || 'Failed to create adventure sport');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save adventure sport');
      console.error('Submit error:', err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof AdventureSportFormData] as any),
          [child]: type === 'number' ? Number(value) : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value
      }));
    }
  };

  // Array management functions
  const addToArray = (arrayName: keyof AdventureSportFormData, value: string, setValue: React.Dispatch<React.SetStateAction<string>>) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [arrayName]: [...(prev[arrayName] as string[]), value.trim()]
      }));
      setValue('');
    }
  };

  const removeFromArray = (arrayName: keyof AdventureSportFormData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: (prev[arrayName] as string[]).filter((_, i) => i !== index)
    }));
  };

  const filteredSports = sports.filter(sport =>
    (sport.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (sport.category?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (sport.location?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const categories = ['adventure', 'surfing', 'diving', 'trekking'];
  const priceUnits = ['per_session', 'per_person', 'per_day', 'per_trip'];
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 mt-4">Loading adventure sports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Adventure Sports Management</h1>
              <p className="text-gray-600 mt-1">Manage adventure sports and activities</p>
            </div>
            <button
              onClick={handleCreateSport}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Activity</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search activities by name, category, or location..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                categoryFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              All Categories
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                  categoryFilter === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Sports Grid */}
        {filteredSports.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {sports.length === 0 ? 'No adventure sports added yet' : 'No sports match your search'}
            </h3>
            <p className="text-gray-600 mb-6">
              {sports.length === 0 ? 'Add your first adventure sport to get started.' : 'Try adjusting your search terms.'}
            </p>
            {sports.length === 0 && (
              <button
                onClick={handleCreateSport}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add First Activity
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSports.map((sport) => (
              <div key={sport._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {sport.name}
                      </h3>
                      <p className="text-sm text-gray-600 capitalize">
                        {sport.category}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {sport.isActive ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className={`text-sm font-medium ${
                        sport.isActive ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {sport.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <IndianRupee className="w-4 h-4 mr-2" />
                      <span>₹{sport.price.toLocaleString()} {sport.priceUnit.replace('_', ' ')}</span>
                    </div>
                    {sport.duration && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{sport.duration}</span>
                      </div>
                    )}
                    {sport.location && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{sport.location}</span>
                      </div>
                    )}
                    {sport.maxQuantity && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        <span>Max {sport.maxQuantity} participants</span>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {sport.description}
                  </p>

                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleEditSport(sport)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit activity"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSport(sport._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete activity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingSport ? 'Edit Adventure Sport' : 'Add New Adventure Sport'}
              </h2>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'basic', label: 'Basic Info' },
                  { id: 'details', label: 'Details' },
                  { id: 'instructor', label: 'Instructor' },
                  { id: 'media', label: 'Media' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <form onSubmit={handleSubmit} className="max-h-[60vh] overflow-y-auto">
              <div className="p-6 space-y-6">
                {activeTab === 'basic' && (
                  <>
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Activity Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="e.g., Surfing Lessons"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category *
                        </label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          {categories.map(category => (
                            <option key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price (₹) *
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price Unit *
                        </label>
                        <select
                          name="priceUnit"
                          value={formData.priceUnit}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          {priceUnits.map(unit => (
                            <option key={unit} value={unit}>
                              {unit.replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Duration
                        </label>
                        <input
                          type="text"
                          name="duration"
                          value={formData.duration}
                          onChange={handleInputChange}
                          placeholder="e.g., 2 hours"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Difficulty Level
                        </label>
                        <select
                          name="difficulty"
                          value={formData.difficulty}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {difficulties.map(difficulty => (
                            <option key={difficulty} value={difficulty}>
                              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          placeholder="e.g., Varkala Beach"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Participants
                        </label>
                        <input
                          type="number"
                          name="maxQuantity"
                          value={formData.maxQuantity}
                          onChange={handleInputChange}
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Short Description *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Brief description of the activity..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    {/* Age Restrictions */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Age Restrictions</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Minimum Age
                          </label>
                          <input
                            type="number"
                            name="ageRestriction.minAge"
                            value={formData.ageRestriction.minAge}
                            onChange={handleInputChange}
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Maximum Age
                          </label>
                          <input
                            type="number"
                            name="ageRestriction.maxAge"
                            value={formData.ageRestriction.maxAge}
                            onChange={handleInputChange}
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'details' && (
                  <>
                    {/* Detailed Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Detailed Description
                      </label>
                      <textarea
                        name="detailedDescription"
                        value={formData.detailedDescription}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Detailed description of the experience..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Features */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Features</h3>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newFeature}
                            onChange={(e) => setNewFeature(e.target.value)}
                            placeholder="Add a feature..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => addToArray('features', newFeature, setNewFeature)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Add
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {formData.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-1">
                              <span className="text-sm text-blue-800">{feature}</span>
                              <button
                                type="button"
                                onClick={() => removeFromArray('features', index)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* What's Included */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">What's Included</h3>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newIncludedItem}
                            onChange={(e) => setNewIncludedItem(e.target.value)}
                            placeholder="Add included item..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => addToArray('includedItems', newIncludedItem, setNewIncludedItem)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Add
                          </button>
                        </div>
                        <div className="space-y-2">
                          {formData.includedItems.map((item, index) => (
                            <div key={index} className="flex items-start gap-2 bg-gray-50 rounded-lg p-3">
                              <span className="text-sm text-gray-800 flex-1">{item}</span>
                              <button
                                type="button"
                                onClick={() => removeFromArray('includedItems', index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Requirements */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Requirements</h3>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newRequirement}
                            onChange={(e) => setNewRequirement(e.target.value)}
                            placeholder="Add requirement..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => addToArray('requirements', newRequirement, setNewRequirement)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Add
                          </button>
                        </div>
                        <div className="space-y-2">
                          {formData.requirements.map((requirement, index) => (
                            <div key={index} className="flex items-start gap-2 bg-gray-50 rounded-lg p-3">
                              <span className="text-sm text-gray-800 flex-1">{requirement}</span>
                              <button
                                type="button"
                                onClick={() => removeFromArray('requirements', index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Safety */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Safety Measures</h3>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newSafetyItem}
                            onChange={(e) => setNewSafetyItem(e.target.value)}
                            placeholder="Add safety measure..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => addToArray('safety', newSafetyItem, setNewSafetyItem)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Add
                          </button>
                        </div>
                        <div className="space-y-2">
                          {formData.safety.map((safety, index) => (
                            <div key={index} className="flex items-start gap-2 bg-gray-50 rounded-lg p-3">
                              <span className="text-sm text-gray-800 flex-1">{safety}</span>
                              <button
                                type="button"
                                onClick={() => removeFromArray('safety', index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* What to Bring */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">What to Bring</h3>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newWhatToBring}
                            onChange={(e) => setNewWhatToBring(e.target.value)}
                            placeholder="Add item to bring..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => addToArray('whatToBring', newWhatToBring, setNewWhatToBring)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Add
                          </button>
                        </div>
                        <div className="space-y-2">
                          {formData.whatToBring.map((item, index) => (
                            <div key={index} className="flex items-start gap-2 bg-gray-50 rounded-lg p-3">
                              <span className="text-sm text-gray-800 flex-1">{item}</span>
                              <button
                                type="button"
                                onClick={() => removeFromArray('whatToBring', index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Cancellation Policy */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cancellation Policy
                      </label>
                      <textarea
                        name="cancellationPolicy"
                        value={formData.cancellationPolicy}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Describe the cancellation policy..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}

                {activeTab === 'instructor' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Instructor Information</h3>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Instructor Name
                          </label>
                          <input
                            type="text"
                            name="instructor.name"
                            value={formData.instructor.name}
                            onChange={handleInputChange}
                            placeholder="e.g., Raj Kumar"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Experience
                          </label>
                          <input
                            type="text"
                            name="instructor.experience"
                            value={formData.instructor.experience}
                            onChange={handleInputChange}
                            placeholder="e.g., 8+ years teaching surfing"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      {/* Certifications */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Certifications
                        </label>
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newCertification}
                              onChange={(e) => setNewCertification(e.target.value)}
                              placeholder="Add certification..."
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (newCertification.trim()) {
                                  setFormData(prev => ({
                                    ...prev,
                                    instructor: {
                                      ...prev.instructor,
                                      certifications: [...prev.instructor.certifications, newCertification.trim()]
                                    }
                                  }));
                                  setNewCertification('');
                                }
                              }}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Add
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {formData.instructor.certifications.map((cert, index) => (
                              <div key={index} className="flex items-center gap-2 bg-green-50 rounded-lg px-3 py-1">
                                <span className="text-sm text-green-800">{cert}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData(prev => ({
                                      ...prev,
                                      instructor: {
                                        ...prev.instructor,
                                        certifications: prev.instructor.certifications.filter((_, i) => i !== index)
                                      }
                                    }));
                                  }}
                                  className="text-green-600 hover:text-green-800"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'media' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Images</h3>
                    {editingSport ? (
                      // Existing sport - upload directly
                      <ImageUpload
                        variant="multiple"
                        label="Adventure Sport Images"
                        placeholder="Upload images for this adventure sport"
                        currentImageUrls={editingSport.images || []}
                        onUpload={async (files: File[]) => {
                          try {
                            const newImageUrls = await uploadAdventureSportImages(editingSport._id, files);

                            // Update the local state
                            setEditingSport(prev => prev ? {
                              ...prev,
                              images: [...(prev.images || []), ...newImageUrls]
                            } : null);

                            // Update the sports list
                            setSports(prev => prev.map(s =>
                              s._id === editingSport._id
                                ? { ...s, images: [...(s.images || []), ...newImageUrls] }
                                : s
                            ));
                          } catch (error) {
                            setError('Failed to upload images. Please try again.');
                          }
                        }}
                        onRemove={(index: number) => {
                          if (!editingSport) return;

                          // Get current images array
                          const currentImages = editingSport.images || [];
                          
                          // Create a completely new array without the removed item
                          const updatedImages = currentImages.filter((_: string, i: number) => i !== index);
                          
                          // Update only the local state - API call will happen on "Update Activity" button
                          setEditingSport(prev => prev ? {
                            ...prev,
                            images: updatedImages
                          } : null);
                        }}
                        maxFiles={10}
                        maxSizeMB={5}
                      />
                    ) : (
                      // New sport - store images temporarily and upload after creation
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">Note: Images will be uploaded when the adventure sport is created.</p>
                        <ImageUpload
                          variant="multiple"
                          label="Adventure Sport Images"
                          placeholder="Select images for this adventure sport"
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

                        {/* Also show URL input option */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-gray-700">Or add image URLs:</h4>
                          <div className="flex gap-2">
                            <input
                              type="url"
                              value={newImage}
                              onChange={(e) => setNewImage(e.target.value)}
                              placeholder="Add image URL for preview..."
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                              type="button"
                              onClick={() => addToArray('images', newImage, setNewImage)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Add
                            </button>
                          </div>
                          {formData.images.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {formData.images.map((image, index) => (
                                <div key={index} className="relative">
                                  <img
                                    src={image}
                                    alt={`Activity image ${index + 1}`}
                                    className="w-full h-24 object-cover rounded-lg"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeFromArray('images', index)}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  type="button"
                  onClick={() => {
                    // Clean up object URLs to prevent memory leaks
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
                  {submitLoading ? 'Saving...' : (editingSport ? 'Update Activity' : 'Add Activity')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}