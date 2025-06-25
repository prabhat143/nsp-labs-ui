import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getSamples, saveSamples } from '../utils/localStorage';
import { Sample } from '../types';
import { Upload, MapPin, Tag, Users, CheckCircle } from 'lucide-react';

const SubmitSample: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [submittedSample, setSubmittedSample] = useState<Sample | null>(null);
  
  const [formData, setFormData] = useState({
    location: '',
    category: '',
    subCategory: '',
    contactInfo: user?.email || '',
  });

  const locations = [
    'Miami Bay Farm #1',
    'Miami Bay Farm #2', 
    'Miami Bay Farm #3',
    'Gulf Coast Farm #1',
    'Gulf Coast Farm #2',
    'Atlantic Coast Farm #1',
    'Pacific Northwest Farm #1',
    'Caribbean Farm #1',
  ];

  const categories = [
    'Pacific White Shrimp',
    'Tiger Shrimp',
    'Black Tiger Shrimp',
    'Banana Shrimp',
    'Brown Shrimp',
    'Pink Shrimp',
  ];

  const subCategories = [
    'Juvenile Stock',
    'Adult Breeding Stock', 
    'Harvested Product',
    'Broodstock',
    'Post-Larvae',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newSample: Sample = {
      id: Date.now().toString(),
      userId: user!.id,
      location: formData.location,
      category: formData.category,
      subCategory: formData.subCategory,
      contactInfo: formData.contactInfo,
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };

    const samples = getSamples();
    samples.push(newSample);
    saveSamples(samples);
    
    setSubmittedSample(newSample);
    setSubmitted(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (submitted && submittedSample) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sample Submitted Successfully!</h1>
            <p className="text-gray-600">Your shrimp sample has been received and is awaiting agent assignment.</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-8 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Submission Summary</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Sample ID</span>
                <p className="text-gray-900 font-mono">{submittedSample.id}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Submission Date</span>
                <p className="text-gray-900">{new Date(submittedSample.submittedAt).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Location</span>
                <p className="text-gray-900">{submittedSample.location}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Category</span>
                <p className="text-gray-900">{submittedSample.category}</p>
              </div>
              {submittedSample.subCategory && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Sub-category</span>
                  <p className="text-gray-900">{submittedSample.subCategory}</p>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-gray-500">Status</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Waiting for agent assignment
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• An NSP Labs agent will be assigned to your sample within 24 hours</li>
              <li>• You'll receive email notifications at each stage of testing</li>
              <li>• The complete testing process typically takes 3-5 business days</li>
              <li>• Results will be available in your Reports section upon completion</li>
            </ul>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/samples')}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-6 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-colors font-medium"
            >
              View All Samples
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-cyan-500 px-8 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <Upload className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Submit Sample for Testing</h1>
              <p className="text-green-100">Provide details about your shrimp sample</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline h-4 w-4 mr-1" />
              Sample Location *
            </label>
            <select
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="">Select a location</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="inline h-4 w-4 mr-1" />
              Shrimp Category *
            </label>
            <select
              name="category" 
              value={formData.category}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Sub-category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sub-category (Optional)
            </label>
            <select
              name="subCategory"
              value={formData.subCategory}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="">Select a sub-category</option>
              {subCategories.map((subCategory) => (
                <option key={subCategory} value={subCategory}>
                  {subCategory}
                </option>
              ))}
            </select>
          </div>

          {/* Contact Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="inline h-4 w-4 mr-1" />
              Contact Information *
            </label>
            <textarea
              name="contactInfo"
              value={formData.contactInfo}
              onChange={handleInputChange}
              required
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Email address or additional contact details for this submission"
            />
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">Important Notes:</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Ensure samples are properly preserved and labeled before submission</li>
              <li>• Testing typically takes 3-5 business days to complete</li>
              <li>• You will receive email notifications throughout the testing process</li>
              <li>• Contact information is used for urgent communications only</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-cyan-500 text-white rounded-lg hover:from-green-600 hover:to-cyan-600 transition-colors font-medium flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Submit Sample</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitSample;