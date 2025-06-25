import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Building, Phone, MapPin, Save, Edit } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    company: user?.company || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(formData);
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      company: user?.company || '',
      phone: user?.phone || '',
      address: user?.address || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Customer Profile</h1>
                <p className="text-cyan-100">Manage your account information</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        ? 'border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent' 
                        : 'border-gray-200 bg-gray-50'
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
                        ? 'border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent' 
                        : 'border-gray-200 bg-gray-50'
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
                        ? 'border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent' 
                        : 'border-gray-200 bg-gray-50'
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
                        ? 'border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent' 
                        : 'border-gray-200 bg-gray-50'
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
                      ? 'border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                  placeholder="Enter your full address"
                />
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Customer ID:</span>
                  <span className="ml-2 text-gray-900">{user?.id}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Member Since:</span>
                  <span className="ml-2 text-gray-900">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Save Button */}
            {isEditing && (
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-colors flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;