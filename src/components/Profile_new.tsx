import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "./Toast";
import {
  User,
  Mail,
  Building,
  Phone,
  MapPin,
  Save,
  Edit,
  RefreshCw,
} from "lucide-react";

const Profile: React.FC = () => {
  const { user, updateUser, fetchUserProfile } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    company: string;
    phone: string;
    address: string;
  }>({
    name: "",
    email: "",
    company: "",
    phone: "",
    address: "",
  });

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

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        company: user.company || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
    setIsEditing(false);
    setError(''); // Clear any errors when canceling
  };

  // Sync formData with user data whenever user changes
  useEffect(() => {
    if (user) {
      const newFormData = {
        name: user.name || "",
        email: user.email || "",
        company: user.company || "",
        phone: user.phone || "",
        address: user.address || "",
      };
      setFormData(newFormData);
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
                <span>{isEditing ? 'Cancel' : 'Edit'}</span>
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
                {/* Name */}
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
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
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
                </div>
              )}
            </form>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Profile;
