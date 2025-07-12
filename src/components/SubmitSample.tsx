import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getSamples, saveSamples, updateSampleStatus, getRandomAgent, createTestReport } from '../utils/localStorage';
import { Sample } from '../types';
import { apiService } from '../services/api';
import { Upload, MapPin, Tag, Users, CheckCircle, Clock, UserCheck, FlaskConical, Phone, Mail } from 'lucide-react';

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google: any;
  }
}

// Define proper types for the component props
interface LocationAutocompleteProps {
  value: string;
  onChange: (e: { target: { name: string; value: string } }) => void;
  disabled?: boolean;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({ value, onChange, disabled = false }) => {
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
    if (!window.google || !window.google.maps || !window.google.maps.places || disabled) {
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
  }, [onChange, disabled]);

  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
      <input
        ref={inputRef}
        type="text"
        name="location"
        value={inputValue}
        onChange={(e) => {
          if (!disabled) {
            setInputValue(e.target.value);
            // Do not call onChange here, only update local input
          }
        }}
        disabled={disabled}
        className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : ''
        }`}
        placeholder={disabled ? 'Auto-populated from customer' : 'Enter sample location'}
        autoComplete="off"
      />
    </div>
  );
};

const SubmitSample: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [submittedSample, setSubmittedSample] = useState<Sample | null>(null);
  const [progressStage, setProgressStage] = useState<'submitted' | 'agent-assigned' | 'testing' | 'completed'>('submitted');
  const [assignedAgent, setAssignedAgent] = useState<string>('');
  const [sampleProviders, setSampleProviders] = useState<any[]>([]);
  const [loadingSampleProviders, setLoadingSampleProviders] = useState(false);
  
  const [formData, setFormData] = useState({
    customerId: '',
    location: '',
    category: '',
    subCategory: '',
    phoneNumber: '',
    email: '',
  });

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

  // Auto-progression effect
  useEffect(() => {
    if (!submitted || !submittedSample) return;

    const timers: number[] = [];

    // Stage 1: Agent assignment after 30 seconds
    timers.push(setTimeout(() => {
      const agent = getRandomAgent();
      setAssignedAgent(agent);
      setProgressStage('agent-assigned');
      updateSampleStatus(submittedSample.id, 'agent-assigned', agent);
    }, 30000)); // 30 seconds

    // Stage 2: Testing starts after 1 minute
    timers.push(setTimeout(() => {
      setProgressStage('testing');
      updateSampleStatus(submittedSample.id, 'testing');
    }, 60000)); // 1 minute

    // Stage 3: Testing completes after 2 minutes
    timers.push(setTimeout(() => {
      setProgressStage('completed');
      updateSampleStatus(submittedSample.id, 'completed');
      createTestReport(submittedSample);
    }, 120000)); // 2 minutes

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [submitted, submittedSample]);

  // Fetch sample providers when component mounts
  useEffect(() => {
    const fetchSampleProviders = async () => {
      if (!user?.id) return;
      
      try {
        setLoadingSampleProviders(true);
        const providers = await apiService.getSampleProviders(user.id);
        setSampleProviders(providers);
      } catch (error) {
        console.error('Failed to fetch sample providers:', error);
        // Fallback to user customers if API fails
        setSampleProviders(user?.customers || []);
      } finally {
        setLoadingSampleProviders(false);
      }
    };

    fetchSampleProviders();
  }, [user?.id, user?.customers]);

  // Handle customer selection and auto-populate location and contact info
  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const customerId = e.target.value;
    const selectedProvider = sampleProviders.find(provider => provider.id === customerId);
    
    setFormData(prev => ({
      ...prev,
      customerId,
      location: selectedProvider ? JSON.stringify({
        address: selectedProvider.location,
        coordinates: selectedProvider.coordinates,
      }) : '',
      phoneNumber: selectedProvider ? selectedProvider.phoneNumber : '',
      email: '', // Email is optional and not provided by API
    }));
  };

  const handleLocationChange = (e: { target: { name: string; value: string } }) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that a customer is selected if customers exist
    if (sampleProviders && sampleProviders.length > 0 && !formData.customerId) {
      alert('Please select a customer before submitting the sample.');
      return;
    }

    try {
      // Extract location data and coordinates
      let locationData;
      let coordinates;
      
      try {
        locationData = JSON.parse(formData.location);
        coordinates = locationData.coordinates;
      } catch {
        // If location is not JSON, create default coordinates
        alert('Please select a valid location with coordinates.');
        return;
      }

      if (!coordinates || !coordinates.lat || !coordinates.lng) {
        alert('Please select a location with valid coordinates.');
        return;
      }

      // Get selected customer data
      const selectedProvider = sampleProviders.find(provider => provider.id === formData.customerId);
      if (!selectedProvider) {
        alert('Selected customer not found.');
        return;
      }

      // Prepare API submission data
      const submissionData = {
        consumerId: user!.id,
        samplerId: formData.customerId,
        samplerName: selectedProvider.samplerName,
        samplerLocation: locationData.address || formData.location,
        coordinate: {
          lat: coordinates.lat,
          lng: coordinates.lng,
        },
        shrimpCategory: formData.category,
        shrimpSubCategory: formData.subCategory,
        phoneNumber: formData.phoneNumber,
        emailAddress: formData.email || undefined,
        status: "PENDING",
        assigned: "",
      };

      // Submit to API
      const response = await apiService.submitSample(submissionData);
      
      // Create local sample record for UI
      const newSample: Sample = {
        id: response.id || Date.now().toString(),
        userId: user!.id,
        customerId: formData.customerId,
        location: locationData.address || formData.location,
        category: formData.category,
        subCategory: formData.subCategory,
        contactInfo: `Phone: ${formData.phoneNumber}${formData.email ? `, Email: ${formData.email}` : ''}`,
        submittedAt: new Date().toISOString(),
        status: 'pending',
      };

      // Save locally for UI state
      const samples = getSamples();
      samples.push(newSample);
      saveSamples(samples);
      
      setSubmittedSample(newSample);
      setSubmitted(true);
      setProgressStage('submitted');

    } catch (error: any) {
      console.error('Sample submission failed:', error);
      
      let errorMessage = 'Failed to submit sample';
      if (error.response?.status === 400) {
        errorMessage = 'Invalid input data. Please check all fields.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handler to reset form and state for submitting another sample
  const handleNewSample = () => {
    setSubmitted(false);
    setSubmittedSample(null);
    setProgressStage('submitted');
    setAssignedAgent('');
    setFormData({
      customerId: '',
      location: '',
      category: '',
      subCategory: '',
      phoneNumber: '',
      email: '',
    });
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'submitted':
        return <Clock className="h-6 w-6 text-yellow-600" />;
      case 'agent-assigned':
        return <UserCheck className="h-6 w-6 text-blue-600" />;
      case 'testing':
        return <FlaskConical className="h-6 w-6 text-purple-600" />;
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      default:
        return <Clock className="h-6 w-6 text-gray-600" />;
    }
  };

  const getStageMessage = (stage: string) => {
    switch (stage) {
      case 'submitted':
        return 'Sample submitted successfully! Waiting for agent assignment...';
      case 'agent-assigned':
        return `Agent ${assignedAgent} has been assigned to your sample. Testing will begin shortly.`;
      case 'testing':
        return 'Laboratory testing is now in progress. This may take some time.';
      case 'completed':
        return 'Testing completed! Your results are now available.';
      default:
        return 'Processing your sample...';
    }
  };

  if (submitted && submittedSample) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
          <div className="text-center mb-6 lg:mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {getStageIcon(progressStage)}
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Sample Processing</h1>
            <p className="text-gray-600 text-sm lg:text-base">{getStageMessage(progressStage)}</p>
          </div>

          {/* Progress Timeline */}
          <div className="mb-6 lg:mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">Progress</span>
              <span className="text-sm font-medium text-gray-500">
                {progressStage === 'submitted' && '25%'}
                {progressStage === 'agent-assigned' && '50%'}
                {progressStage === 'testing' && '75%'}
                {progressStage === 'completed' && '100%'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-1000 ${
                  progressStage === 'submitted' ? 'bg-yellow-500 w-1/4' :
                  progressStage === 'agent-assigned' ? 'bg-blue-500 w-1/2' :
                  progressStage === 'testing' ? 'bg-purple-500 w-3/4' :
                  'bg-green-500 w-full'
                }`}
              />
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 lg:p-6 mb-6 lg:mb-8 space-y-4">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">Submission Summary</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Sample ID</span>
                <p className="text-gray-900 font-mono text-sm lg:text-base break-all">{submittedSample.id}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Submission Date</span>
                <p className="text-gray-900 text-sm lg:text-base">{new Date(submittedSample.submittedAt).toLocaleString()}</p>
              </div>
              {submittedSample.customerId && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Customer</span>
                  <p className="text-gray-900 text-sm lg:text-base">
                    {(() => {
                      const customer = sampleProviders.find(provider => provider.id === submittedSample.customerId);
                      return customer ? `${customer.samplerName} (ID: ${customer.id})` : 'Unknown Customer';
                    })()}
                  </p>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-gray-500">Location</span>
                <div className="flex flex-col space-y-1">
                  <p className="text-gray-900 text-sm lg:text-base">{submittedSample.location}</p>
                  {(() => {
                    // Try to get coordinates from the submitted sample data
                    const selectedProvider = sampleProviders.find(provider => provider.id === submittedSample.customerId);
                    const coordinates = selectedProvider?.coordinates;
                    
                    if (coordinates) {
                      return (
                        <button
                          onClick={() => {
                            const { lat, lng } = coordinates;
                            const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
                            window.open(mapsUrl, '_blank');
                          }}
                          className="self-start text-xs text-cyan-600 hover:text-cyan-800 flex items-center"
                          title="Open in Google Maps"
                        >
                          <MapPin className="h-3 w-3 mr-1" />
                          View on map
                        </button>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Category</span>
                <p className="text-gray-900 text-sm lg:text-base">{submittedSample.category}</p>
              </div>
              {submittedSample.subCategory && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Sub-category</span>
                  <p className="text-gray-900 text-sm lg:text-base">{submittedSample.subCategory}</p>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-gray-500">Current Status</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  progressStage === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                  progressStage === 'agent-assigned' ? 'bg-blue-100 text-blue-800' :
                  progressStage === 'testing' ? 'bg-purple-100 text-purple-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {progressStage === 'submitted' && 'Waiting for assignment'}
                  {progressStage === 'agent-assigned' && 'Agent assigned'}
                  {progressStage === 'testing' && 'Testing in progress'}
                  {progressStage === 'completed' && 'Testing complete'}
                </span>
              </div>
            </div>

            {assignedAgent && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900 text-sm lg:text-base">Assigned Agent: {assignedAgent}</span>
                </div>
              </div>
            )}
          </div>

          <div className={`border rounded-lg p-4 mb-6 lg:mb-8 ${
            progressStage === 'completed' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
          }`}>
            <h3 className={`font-semibold mb-2 ${
              progressStage === 'completed' ? 'text-green-900' : 'text-blue-900'
            }`}>
              {progressStage === 'completed' ? 'Testing Complete!' : 'What happens next?'}
            </h3>
            <ul className={`text-sm space-y-1 ${
              progressStage === 'completed' ? 'text-green-700' : 'text-blue-700'
            }`}>
              {progressStage === 'completed' ? (
                <>
                  <li>• Your test results are now available in the Reports section</li>
                  <li>• You can view detailed analysis and certification information</li>
                  <li>• Download or print your official test report</li>
                </>
              ) : (
                <>
                  <li>• {progressStage === 'submitted' ? 'An NSP Labs agent will be assigned within 30 seconds' : '✓ Agent assigned'}</li>
                  <li>• {['submitted', 'agent-assigned'].includes(progressStage) ? 'Laboratory testing will begin shortly' : '✓ Testing in progress'}</li>
                  <li>• You'll receive updates as testing progresses</li>
                  <li>• Results will be available upon completion</li>
                </>
              )}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            {progressStage === 'completed' ? (
              <>
                <button
                  onClick={() => navigate('/reports')}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-6 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-colors font-medium"
                >
                  View Test Results
                </button>
                <button
                  onClick={() => navigate('/samples')}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  View All Samples
                </button>
                <button
                  onClick={handleNewSample}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-6 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-colors font-medium"
                >
                  Submit Another Sample
                </button>
              </>
            ) : (
              <>
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
                <button
                  onClick={handleNewSample}
                  className="flex-1 bg-gradient-to-r from-green-500 to-cyan-500 text-white py-3 px-6 rounded-lg hover:from-green-600 hover:to-cyan-600 transition-colors font-medium"
                >
                  Submit Another Sample
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-cyan-500 px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <Upload className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-white">Submit Sample for Testing</h1>
              <p className="text-green-100 text-sm lg:text-base">Provide details about your shrimp sample</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 lg:p-8 space-y-6">
          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="inline h-4 w-4 mr-1" />
              Select Customer *
            </label>
            <select
              name="customerId"
              value={formData.customerId}
              onChange={handleCustomerChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              disabled={loadingSampleProviders}
            >
              <option value="">
                {loadingSampleProviders ? 'Loading customers...' : 'Select a customer'}
              </option>
              {sampleProviders.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.samplerName} - ID: {provider.id}
                </option>
              ))}
            </select>
            {(!sampleProviders || sampleProviders.length === 0) && !loadingSampleProviders && (
              <div className="mt-1 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-700">
                  No customers found. Please{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/profile')}
                    className="font-medium text-amber-800 hover:text-amber-900 underline"
                  >
                    add customers in your profile
                  </button>
                  {' '}first.
                </p>
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline h-4 w-4 mr-1" />
              Sample Location *
            </label>
            <LocationAutocomplete
              value={formData.location}
              onChange={handleLocationChange}
              disabled={!!formData.customerId}
            />
            {formData.customerId && (
              <p className="mt-1 text-xs text-gray-500">
                Location automatically populated from selected customer
              </p>
            )}
            {formData.location && (() => {
              try {
                const locationData = JSON.parse(formData.location);
                const coordinates = locationData.coordinates;
                if (coordinates && coordinates.lat && coordinates.lng) {
                  return (
                    <button
                      type="button"
                      onClick={() => {
                        const { lat, lng } = coordinates;
                        const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
                        window.open(mapsUrl, '_blank');
                      }}
                      className="mt-1 text-xs text-cyan-600 hover:text-cyan-800 flex items-center"
                      title="Open location in Google Maps"
                    >
                      <MapPin className="h-3 w-3 mr-1" />
                      View location on map
                    </button>
                  );
                }
              } catch {
                // Invalid JSON, don't show map link
              }
              return null;
            })()}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="inline h-4 w-4 mr-1" />
                Phone Number *
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
                readOnly={!!formData.customerId}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                  formData.customerId ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder={formData.customerId ? 'Auto-populated from customer' : 'Enter phone number'}
              />
              {formData.customerId && (
                <p className="mt-1 text-xs text-gray-500">
                  Phone number automatically populated from selected customer
                </p>
              )}
            </div>

            {/* Email (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline h-4 w-4 mr-1" />
                Email Address (Optional)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Enter email address (optional)"
              />
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">Important Notes:</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Ensure samples are properly preserved and labeled before submission</li>
              <li>• Testing typically takes 3-5 business days to complete</li>
              <li>• You will receive real-time updates throughout the testing process</li>
              <li>• Contact information is used for urgent communications only</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-cyan-500 text-white rounded-lg hover:from-green-600 hover:to-cyan-600 transition-colors font-medium flex items-center justify-center space-x-2"
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
