import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "./Toast";
import { Customer } from "../types";
import { apiService } from "../services/api";
import {
  User,
  Mail,
  Building,
  Phone,
  MapPin,
  Save,
  Edit,
  Users,
  Plus,
  Trash2,
  RefreshCw,
} from "lucide-react";

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google: any;
  }
  namespace google {
    namespace maps {
      namespace places {
        class Autocomplete {
          constructor(inputElement: HTMLInputElement, options?: any);
          addListener(eventName: string, callback: () => void): void;
          getPlace(): any;
        }
      }
      namespace event {
        function clearInstanceListeners(instance: any): void;
      }
    }
  }
}

// Define proper types for the component props
interface LocationAutocompleteProps {
  value: string;
  onChange: (e: { target: { name: string; value: string } }) => void;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({ value, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");

  // Show only the address in the input, not the JSON
  useEffect(() => {
    if (!value) {
      setInputValue("");
      return;
    }
    try {
      const parsed = JSON.parse(value);
      setInputValue(parsed.address || value);
    } catch {
      setInputValue(value);
    }
  }, [value]);

  // Google Places Autocomplete
  useEffect(() => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      return;
    }
    if (!inputRef.current) return;

    let autocompleteInstance: google.maps.places.Autocomplete | null = null;
    try {
      autocompleteInstance = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ["establishment", "geocode"],
          componentRestrictions: { country: "in" },
          fields: ["address_components", "formatted_address", "geometry", "name", "place_id"]
        }
      );

      if (autocompleteInstance) {
        autocompleteInstance.addListener("place_changed", () => {
          const place = autocompleteInstance?.getPlace();
          if (!place?.geometry) return;

          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const formattedAddress = place.formatted_address;

          const exactLocation = JSON.stringify({
            address: formattedAddress,
            coordinates: { lat, lng },
            placeId: place.place_id
          });

          setInputValue(formattedAddress || "");
          onChange({
            target: {
              name: "location",
              value: exactLocation
            },
          });
        });
      }

      return () => {
        if (autocompleteInstance) {
          google.maps.event.clearInstanceListeners(autocompleteInstance);
        }
      };
    } catch (error) {
      console.error("Error initializing Places Autocomplete:", error);
    }
  }, [onChange]);

  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
      <input
        ref={inputRef}
        type="text"
        name="location"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          // Do not call onChange here, only update local input
        }}
        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        placeholder="Enter customer location"
        autoComplete="off"
      />
    </div>
  );
};

const Profile: React.FC = () => {
  const { user, updateUser, fetchUserProfile } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [customerCoordinates, setCustomerCoordinates] = useState<Record<string, { lat: number; lng: number }>>({});
  const [error, setError] = useState<string>('');
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(
    null
  );
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    company: string;
    phone: string;
    address: string;
    customers: Customer[];
  }>({
    name: "",
    email: "",
    company: "",
    phone: "",
    address: "",
    customers: [],
  });

  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phoneNumber: "",
    location: "",
  });

  const editingCustomer = editingCustomerId
    ? formData.customers.find((c) => c.id === editingCustomerId)
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      
      const result = await updateUser(formData);
      
      if (result.success) {
        setIsEditing(false);
        showToast(result.message || 'Profile updated successfully!', 'success');
      } else {
        const errorMessage = result.error || 'Failed to update profile';
        setError(errorMessage);
        showToast(errorMessage, 'error');
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      let errorMessage = 'An unexpected error occurred';
      
      if (error.response?.status === 415) {
        errorMessage = 'Invalid request format. Please check your input.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.error || 'Invalid input data';
      } else if (error.response?.status === 404) {
        errorMessage = 'User profile not found';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCustomerLocationChange = (e: { target: { name: string; value: string } }) => {
    setNewCustomer({
      ...newCustomer,
      [e.target.name]: e.target.value,
    });
  };

  const handleCustomerInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewCustomer({
      ...newCustomer,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      showToast('User not authenticated', 'error');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Extract location data for API call
      let locationToSend = newCustomer.location;
      let fullLocationData = null;
      
      try {
        fullLocationData = JSON.parse(newCustomer.location);
        locationToSend = fullLocationData.address || newCustomer.location;
      } catch {
        // If it's not JSON, use as is
        locationToSend = newCustomer.location;
      }

      // Call the API to add sample provider
      await apiService.addSampleProvider(user.id, {
        samplerName: newCustomer.name,
        phoneNumber: newCustomer.phoneNumber,
        location: locationToSend,
        coordinates: fullLocationData?.coordinates,
      });

      // If we have coordinates, store them locally using customer identifiers
      if (fullLocationData?.coordinates) {
        const customerKey = `${newCustomer.name}-${newCustomer.phoneNumber}-${locationToSend}`;
        setCustomerCoordinates(prev => ({
          ...prev,
          [customerKey]: fullLocationData.coordinates
        }));
      }

      // Refresh the user profile to get updated customer list
      const result = await fetchUserProfile();
      if (!result.success) {
        showToast(result.error || 'Failed to refresh profile after adding customer', 'warning');
      }

      showToast('Customer added successfully!', 'success');

      // Reset new customer form
      setNewCustomer({
        name: "",
        phoneNumber: "",
        location: "",
      });

      // Hide the add customer form
      setShowAddCustomer(false);

    } catch (error: any) {
      console.error('Add customer error:', error);
      let errorMessage = 'Failed to add customer';
      
      if (error.response?.status === 400) {
        errorMessage = error.response.data?.error || 'Invalid input data';
      } else if (error.response?.status === 404) {
        errorMessage = 'Customer not found';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        company: user.company || "",
        phone: user.phone || "",
        address: user.address || "",
        customers: user.customers || [],
      });
    }
    setIsEditing(false);
    setError(''); // Clear any errors when canceling
  };

  const handleEditCustomer = (customerId: string) => {
    setEditingCustomerId(customerId);
    setShowAddCustomer(false);
  };

  const handleCancelEditCustomer = () => {
    setEditingCustomerId(null);
  };

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id || !editingCustomerId) {
      showToast('User not authenticated or no customer selected', 'error');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Find the customer being edited and its index
      const customerIndex = formData.customers.findIndex(customer => customer.id === editingCustomerId);
      if (customerIndex === -1) {
        throw new Error('Customer not found');
      }

      // Extract location data for API call
      let locationToSend = newCustomer.location;
      let fullLocationData = null;
      
      try {
        // Only try to parse if it looks like JSON (starts with '{')
        if (newCustomer.location && newCustomer.location.trim().startsWith('{')) {
          fullLocationData = JSON.parse(newCustomer.location);
          locationToSend = fullLocationData.address || newCustomer.location;
        }
      } catch {
        // If it's not JSON, use as is
        locationToSend = newCustomer.location;
      }

      // Call the API to update sample provider
      await apiService.updateSampleProvider(user.id, customerIndex, {
        samplerName: newCustomer.name,
        phoneNumber: newCustomer.phoneNumber,
        location: locationToSend,
        coordinates: fullLocationData?.coordinates,
      });

      // Store coordinates locally if available
      if (fullLocationData?.coordinates) {
        setCustomerCoordinates(prev => ({
          ...prev,
          [editingCustomerId]: fullLocationData.coordinates
        }));
      }

      // Refresh user profile to get updated data
      await fetchUserProfile();
      
      showToast('Customer updated successfully!', 'success');

      // Reset form and editing state
      setNewCustomer({
        name: "",
        phoneNumber: "",
        location: "",
      });
      setEditingCustomerId(null);
    } catch (error) {
      console.error('Error updating customer:', error);
      setError(error instanceof Error ? error.message : 'Failed to update customer');
      showToast('Failed to update customer', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!user?.id) {
      showToast('User not authenticated', 'error');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Find the index of the customer to delete
      const customerIndex = formData.customers.findIndex(
        (customer) => customer.id === customerId
      );

      if (customerIndex === -1) {
        showToast('Customer not found', 'error');
        return;
      }

      // Call the API to delete the sample provider
      await apiService.deleteSampleProvider(user.id, customerIndex);

      showToast('Customer deleted successfully!', 'success');

      // Refresh the user profile to get the updated data
      const result = await fetchUserProfile();
      if (!result.success) {
        throw new Error(result.error || 'Failed to refresh profile after deletion');
      }

      // If deleting the customer being edited, reset the editing state
      if (editingCustomerId === customerId) {
        setEditingCustomerId(null);
      }

    } catch (error: any) {
      console.error('Delete customer error:', error);
      let errorMessage = 'Failed to delete customer';
      
      if (error.response?.status === 404) {
        errorMessage = 'Customer not found or invalid provider index';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error occurred while deleting customer';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // When starting to edit a customer, populate the form with their data
  React.useEffect(() => {
    if (editingCustomer) {
      setNewCustomer({
        name: editingCustomer.name,
        phoneNumber: editingCustomer.phoneNumber,
        location: editingCustomer.location,
      });
    } else {
      setNewCustomer({
        name: "",
        phoneNumber: "",
        location: "",
      });
    }
  }, [editingCustomer]);

  // Sync formData with user data whenever user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        company: user.company || "",
        phone: user.phone || "",
        address: user.address || "",
        customers: user.customers || [],
      });
    }
  }, [user]);

  // Fetch user profile on component mount - only once
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id || profileLoading) return;
      
      setProfileLoading(true);
      try {
        const result = await fetchUserProfile();
        if (!result.success) {
          console.warn('Failed to fetch profile from API, using local data:', result.error);
        }
      } catch (error) {
        console.warn('Error fetching profile:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    // Only load profile if we have a user and haven't already loaded
    if (user?.id && !profileLoading) {
      loadProfile();
    }
  }, []); // Empty dependency array to run only once on mount

  const handleRefreshProfile = async () => {
    if (!user) return;
    
    setProfileLoading(true);
    setError('');
    try {
      const result = await fetchUserProfile();
      if (result.success) {
        showToast('Profile refreshed successfully!', 'success');
        // formData will be updated automatically via the useEffect that watches user changes
      } else {
        setError(result.error || 'Failed to refresh profile');
        showToast(result.error || 'Failed to refresh profile', 'error');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to refresh profile';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-white">
                  Customer Profile
                </h1>
                <p className="text-cyan-100 text-sm lg:text-base">Manage your account information</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
              <button
                onClick={handleRefreshProfile}
                disabled={profileLoading}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 self-start sm:self-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`h-4 w-4 ${profileLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 self-start sm:self-auto"
              >
                <Edit className="h-4 w-4" />
                <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 lg:p-8">
          {profileLoading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
              <span className="ml-3 text-gray-600">Loading profile...</span>
            </div>
          )}

          {error && !profileLoading && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          
          {!profileLoading && (
            <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg ${
                      isEditing
                        ? "border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        : "border-gray-200 bg-gray-50"
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg ${
                      isEditing
                        ? "border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        : "border-gray-200 bg-gray-50"
                    }`}
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg ${
                      isEditing
                        ? "border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        : "border-gray-200 bg-gray-50"
                    }`}
                    placeholder="Enter your company name"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg ${
                      isEditing
                        ? "border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        : "border-gray-200 bg-gray-50"
                    }`}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={3}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg ${
                    isEditing
                      ? "border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      : "border-gray-200 bg-gray-50"
                  }`}
                  placeholder="Enter your full address"
                />
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-gray-50 rounded-lg p-4 lg:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Account Information
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">
                    Customer ID:
                  </span>
                  <span className="ml-2 text-gray-900 break-all">{user?.id}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Member Since:
                  </span>
                  <span className="ml-2 text-gray-900">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                {user?.updatedAt && (
                  <div className="lg:col-span-2">
                    <span className="font-medium text-gray-700">
                      Last Updated:
                    </span>
                    <span className="ml-2 text-gray-900">
                      {new Date(user.updatedAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Save Button */}
            {isEditing && (
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4" />
                  <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>              )}
            </form>
          )}
        </div>
      </div>
      
      {/* Customer Management Section */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-white">My Customers</h1>
                <p className="text-indigo-100 text-sm lg:text-base">
                  Manage your customer information
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddCustomer(!showAddCustomer)}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              <span>{showAddCustomer ? "Cancel" : "Add Customer"}</span>
            </button>
          </div>
        </div>

        <div className="p-6 lg:p-8">
          {/* Add Customer Form */}
          {(showAddCustomer || editingCustomerId) && (
            <div className="mb-8 p-4 lg:p-6 border border-indigo-100 bg-indigo-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingCustomerId ? "Edit Customer" : "Add New Customer"}
              </h3>
              <form
                onSubmit={
                  editingCustomerId ? handleUpdateCustomer : handleAddCustomer
                }
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Customer Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        value={newCustomer.name}
                        onChange={handleCustomerInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Enter customer name"
                      />
                    </div>
                  </div>

                  {/* Customer Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={newCustomer.phoneNumber}
                        onChange={handleCustomerInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Enter customer phone number"
                      />
                    </div>
                  </div>
                </div>

                {/* Customer Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <LocationAutocomplete
                    value={newCustomer.location}
                    onChange={handleCustomerLocationChange}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                  <button
                    type="button"
                    onClick={
                      editingCustomerId
                        ? handleCancelEditCustomer
                        : () => setShowAddCustomer(false)
                    }
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    {editingCustomerId ? (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Update Customer</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        <span>Add Customer</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Customer List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Your Customers
            </h3>

            {formData.customers.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">
                  You haven't added any customers yet.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {formData.customers.map((customer) => {
                  // Parse the location data if it's in JSON format
                  let locationDisplay = customer.location;
                  let locationData = null;
                  
                  try {
                    // Only try to parse if it looks like JSON (starts with '{')
                    if (customer.location && customer.location.trim().startsWith('{')) {
                      locationData = JSON.parse(customer.location);
                      locationDisplay = locationData.address;
                    }
                  } catch (e) {
                    // If it's not valid JSON, just display as is
                    locationDisplay = customer.location;
                  }

                  // Check if we have stored coordinates for this customer
                  const customerKey = `${customer.name}-${customer.phoneNumber}-${customer.location}`;
                  const storedCoordinates = customerCoordinates[customerKey];
                  
                  // Use stored coordinates if available, otherwise try parsed coordinates
                  const coordinates = storedCoordinates || locationData?.coordinates;
                  
                  // Function to open Google Maps with the coordinates
                  const openInGoogleMaps = () => {
                    if (coordinates) {
                      const { lat, lng } = coordinates;
                      const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
                      window.open(mapsUrl, '_blank');
                    }
                  };
                  
                  return (
                    <div key={customer.id} className="py-4">
                      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-3 lg:space-y-0">
                        <div className="lg:max-w-[60%]">
                          <h4 className="text-md font-medium text-gray-900 mb-1">
                            {customer.name}
                          </h4>
                          {/* Move location to its own block with more space */}
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm text-gray-500 break-words">
                              {locationDisplay || "No location specified"}
                            </p>
                            {coordinates && (
                              <button 
                                onClick={openInGoogleMaps}
                                className="self-start text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
                                title="Open in Google Maps"
                              >
                                <MapPin className="h-3 w-3 mr-1" />
                                View on map
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-600">
                              {customer.phoneNumber}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditCustomer(customer.id)}
                              className="p-1 rounded-full text-indigo-500 hover:bg-indigo-50"
                              aria-label="Edit customer"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCustomer(customer.id)}
                              className="p-1 rounded-full text-red-500 hover:bg-red-50"
                              aria-label="Delete customer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Profile;