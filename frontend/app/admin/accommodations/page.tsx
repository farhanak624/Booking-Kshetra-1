"use client";

import { useState, useEffect } from "react";
import { adminAPI } from "../../../lib/api";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Upload,
  X,
  AlertCircle,
  Hotel,
  Home,
  Building,
  Bed,
  Users,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import AccommodationImageUpload from "../../../components/AccommodationImageUpload";

interface Accommodation {
  _id: string;
  name: string;
  description: string;
  price: string;
  colorTheme:
    | "blue"
    | "green"
    | "purple"
    | "orange"
    | "red"
    | "teal"
    | "pink"
    | "indigo";
  iconType: "bed" | "users" | "hotel" | "home" | "building";
  images: string[];
  externalLink: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

const colorThemeOptions = [
  { value: "blue", label: "Blue", class: "bg-blue-500" },
  { value: "green", label: "Green", class: "bg-green-500" },
  { value: "purple", label: "Purple", class: "bg-purple-500" },
  { value: "orange", label: "Orange", class: "bg-orange-500" },
  { value: "red", label: "Red", class: "bg-red-500" },
  { value: "teal", label: "Teal", class: "bg-teal-500" },
  { value: "pink", label: "Pink", class: "bg-pink-500" },
  { value: "indigo", label: "Indigo", class: "bg-indigo-500" },
];

const iconTypeOptions = [
  { value: "bed", label: "Bed", icon: Bed },
  { value: "users", label: "Users", icon: Users },
  { value: "hotel", label: "Hotel", icon: Hotel },
  { value: "home", label: "Home", icon: Home },
  { value: "building", label: "Building", icon: Building },
];

const AdminAccommodationsPage = () => {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAccommodation, setEditingAccommodation] =
    useState<Accommodation | null>(null);
  const [viewingImages, setViewingImages] = useState<Accommodation | null>(
    null
  );
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchAccommodations();
  }, []);

  const fetchAccommodations = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllAccommodations();
      const data = response.data;

      if (data.success) {
        setAccommodations(data.data.accommodations);
      } else {
        setError(data.message || "Failed to fetch accommodations");
      }
    } catch (err) {
      setError("Failed to fetch accommodations");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccommodation = async (formData: FormData) => {
    try {
      const response = await adminAPI.createAccommodation(formData);
      const data = response.data;

      if (data.success) {
        await fetchAccommodations();
        setShowCreateModal(false);
      } else {
        setError(data.message || "Failed to create accommodation");
      }
    } catch (err) {
      setError("Failed to create accommodation");
    }
  };

  const handleUpdateAccommodation = async (
    accommodationId: string,
    formData: FormData
  ) => {
    try {
      const response = await adminAPI.updateAccommodation(
        accommodationId,
        formData
      );
      const data = response.data;

      if (data.success) {
        await fetchAccommodations();
        setEditingAccommodation(null);
      } else {
        setError(data.message || "Failed to update accommodation");
      }
    } catch (err) {
      setError("Failed to update accommodation");
    }
  };

  const handleDeleteAccommodation = async (accommodationId: string) => {
    if (!window.confirm("Are you sure you want to delete this accommodation?"))
      return;

    try {
      const response = await adminAPI.deleteAccommodation(accommodationId);
      const data = response.data;

      if (data.success) {
        await fetchAccommodations();
      } else {
        setError(data.message || "Failed to delete accommodation");
      }
    } catch (err) {
      setError("Failed to delete accommodation");
    }
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const response = await fetch(
        "http://localhost:5001/api/admin/accommodations/upload-images",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (result.success) {
        return result.data.imageUrls;
      } else {
        throw new Error(result.message || "Failed to upload images");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      throw error;
    }
  };

  const filteredAccommodations = accommodations.filter(
    (accommodation) =>
      accommodation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      accommodation.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getColorThemeClasses = (theme: string) => {
    const themeClasses: { [key: string]: string } = {
      blue: "from-blue-500/20 to-blue-600/20 border-blue-200",
      green: "from-green-500/20 to-green-600/20 border-green-200",
      purple: "from-purple-500/20 to-purple-600/20 border-purple-200",
      orange: "from-orange-500/20 to-orange-600/20 border-orange-200",
      red: "from-red-500/20 to-red-600/20 border-red-200",
      teal: "from-teal-500/20 to-teal-600/20 border-teal-200",
      pink: "from-pink-500/20 to-pink-600/20 border-pink-200",
      indigo: "from-indigo-500/20 to-indigo-600/20 border-indigo-200",
    };
    return themeClasses[theme] || themeClasses.blue;
  };

  const getIconComponent = (iconType: string) => {
    const IconMap: { [key: string]: any } = {
      bed: Bed,
      users: Users,
      hotel: Hotel,
      home: Home,
      building: Building,
    };
    return IconMap[iconType] || Hotel;
  };

  const AccommodationForm = ({
    accommodation,
    onSubmit,
    onCancel,
  }: {
    accommodation?: Accommodation;
    onSubmit: (formData: FormData) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      name: accommodation?.name || "",
      description: accommodation?.description || "",
      price: accommodation?.price || "",
      colorTheme: accommodation?.colorTheme || "blue",
      iconType: accommodation?.iconType || "bed",
      externalLink:
        accommodation?.externalLink ||
        "https://live.ipms247.com/booking/book-rooms-kshetraretreatvarkala",
      isActive: accommodation?.isActive ?? true,
      displayOrder: accommodation?.displayOrder || 0,
    });

    const [currentImages, setCurrentImages] = useState<string[]>(
      accommodation?.images || []
    );

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const form = new FormData();

      Object.keys(formData).forEach((key) => {
        form.append(key, (formData as any)[key].toString());
      });

      // Add current images as JSON array - this will be the final set of images
      if (currentImages.length > 0) {
        form.append("images", JSON.stringify(currentImages));
      }

      onSubmit(form);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Accommodation Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="e.g., Royal Suite, Garden Villa"
                required
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price Display *
              </label>
              <input
                type="text"
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, price: e.target.value }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Starting from ₹2,500/night"
                required
                maxLength={100}
              />
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
            Description & Details
          </h3>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Accommodation Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              rows={4}
              placeholder="Describe the luxury features, amenities, and unique aspects of this accommodation..."
              required
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/500 characters
            </p>
          </div>
        </div>

        {/* Design & Appearance Section */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
            Design & Appearance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Color Theme
              </label>
              <select
                value={formData.colorTheme}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    colorTheme: e.target.value as any,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                {colorThemeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Icon Type
              </label>
              <select
                value={formData.iconType}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    iconType: e.target.value as any,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                {iconTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Configuration Section */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-2 h-2 bg-orange-600 rounded-full mr-3"></div>
            Configuration & Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                External Link *
              </label>
              <input
                type="url"
                value={formData.externalLink}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    externalLink: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="https://booking.example.com/room-details"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                URL to redirect when accommodation is clicked
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Display Order
              </label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    displayOrder: Number(e.target.value),
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="0"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lower numbers appear first
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center p-4 bg-white rounded-lg border border-gray-200">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
              }
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label
              htmlFor="isActive"
              className="ml-3 text-sm font-medium text-gray-700"
            >
              Make this accommodation visible on the website
            </label>
          </div>
        </div>

        {/* Images Section */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-2 h-2 bg-pink-600 rounded-full mr-3"></div>
            Accommodation Images
          </h3>
          <AccommodationImageUpload
            images={currentImages}
            onImagesChange={setCurrentImages}
            onUpload={uploadImages}
            maxImages={4}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6 border-t border-gray-200">
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
          >
            {accommodation
              ? "✨ Update Accommodation"
              : "🎉 Create Accommodation"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Luxury Accommodation Management
          </h1>
          <p className="text-gray-600">
            Manage your accommodation types displayed on the homepage
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search accommodations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Accommodation
            </button>
          </div>
        </div>

        {/* Accommodations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAccommodations.map((accommodation) => {
            const IconComponent = getIconComponent(accommodation.iconType);

            return (
              <div
                key={accommodation._id}
                className={`bg-gradient-to-br ${getColorThemeClasses(
                  accommodation.colorTheme
                )} border rounded-lg shadow-sm overflow-hidden`}
              >
                {/* Accommodation Image */}
                <div className="h-48 bg-gray-200 relative">
                  {accommodation.images.length > 0 ? (
                    <img
                      src={accommodation.images[0]}
                      alt={accommodation.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Upload className="w-12 h-12" />
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${
                        accommodation.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {accommodation.isActive ? (
                        <Eye className="w-3 h-3" />
                      ) : (
                        <EyeOff className="w-3 h-3" />
                      )}
                      {accommodation.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Display Order Badge */}
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-white/80 text-gray-700">
                      Order: {accommodation.displayOrder}
                    </span>
                  </div>
                </div>

                {/* Accommodation Details */}
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className={`w-8 h-8 bg-${accommodation.colorTheme}-500 rounded-lg flex items-center justify-center`}
                    >
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {accommodation.name}
                      </h3>
                      <span
                        className={`inline-block px-2 py-1 text-xs font-semibold rounded-full bg-${accommodation.colorTheme}-100 text-${accommodation.colorTheme}-800`}
                      >
                        {accommodation.colorTheme}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {accommodation.description}
                  </p>

                  <div className="mb-4">
                    <span className="text-lg font-bold text-gray-900">
                      {accommodation.price}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">External Link:</p>
                    <a
                      href={accommodation.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm truncate block"
                      title={accommodation.externalLink}
                    >
                      {accommodation.externalLink}
                    </a>
                  </div>

                  {/* Image count */}
                  <div className="mb-3">
                    <span className="text-xs text-gray-500">
                      {accommodation.images.length} image(s) uploaded
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setViewingImages(accommodation);
                        setCurrentImageIndex(0);
                      }}
                      disabled={accommodation.images.length === 0}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <ImageIcon className="w-4 h-4" />
                      View Images
                    </button>
                    <button
                      onClick={() => setEditingAccommodation(accommodation)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteAccommodation(accommodation._id)
                      }
                      className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAccommodations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-xl mb-2">
              No accommodations found
            </div>
            <p className="text-gray-600">
              {searchTerm
                ? "Try adjusting your search criteria"
                : "Get started by adding your first accommodation"}
            </p>
          </div>
        )}

        {/* Create Accommodation Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        Create New Accommodation
                      </h2>
                      <p className="text-blue-100 text-sm">
                        Add a new luxury accommodation to your collection
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                    }}
                    className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-8 overflow-y-auto max-h-[calc(95vh-120px)]">
                <AccommodationForm
                  onSubmit={handleCreateAccommodation}
                  onCancel={() => {
                    setShowCreateModal(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Edit Accommodation Modal */}
        {editingAccommodation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Edit Accommodation
              </h2>
              <AccommodationForm
                accommodation={editingAccommodation}
                onSubmit={(formData) =>
                  handleUpdateAccommodation(editingAccommodation._id, formData)
                }
                onCancel={() => {
                  setEditingAccommodation(null);
                }}
              />
            </div>
          </div>
        )}

        {/* Image Gallery Modal */}
        {viewingImages && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
            <div className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-lg overflow-hidden">
              {/* Modal Header */}
              <div className="bg-white p-4 border-b flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {viewingImages.name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {currentImageIndex + 1} of {viewingImages.images.length}{" "}
                    images
                  </p>
                </div>
                <button
                  onClick={() => {
                    setViewingImages(null);
                    setCurrentImageIndex(0);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Image Display */}
              <div className="relative bg-gray-100" style={{ height: "60vh" }}>
                {viewingImages.images.length > 0 && (
                  <>
                    <img
                      src={viewingImages.images[currentImageIndex]}
                      alt={`${viewingImages.name} - Image ${
                        currentImageIndex + 1
                      }`}
                      className="w-full h-full object-contain"
                    />

                    {/* Navigation Arrows */}
                    {viewingImages.images.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setCurrentImageIndex((prev) =>
                              prev === 0
                                ? viewingImages.images.length - 1
                                : prev - 1
                            )
                          }
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          onClick={() =>
                            setCurrentImageIndex((prev) =>
                              prev === viewingImages.images.length - 1
                                ? 0
                                : prev + 1
                            )
                          }
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Thumbnail Navigation */}
              {viewingImages.images.length > 1 && (
                <div className="bg-white p-4 border-t">
                  <div className="flex gap-2 justify-center overflow-x-auto">
                    {viewingImages.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                          index === currentImageIndex
                            ? "border-blue-500"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Image Info */}
              <div className="bg-gray-50 p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    {viewingImages.description}
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {viewingImages.price}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAccommodationsPage;
