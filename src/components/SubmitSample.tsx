import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { getSamples, saveSamples, updateSampleStatus, createTestReport } from '../utils/localStorage';
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
        placeholder={disabled ? 'Auto-populated from sample provider' : 'Enter sample location'}
        autoComplete="off"
      />
    </div>
  );
};

// Sample Provider Search Component
interface SampleProviderSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSampleProviderSelect: (provider: any) => void;
}

const SampleProviderSearch: React.FC<SampleProviderSearchProps> = ({
  value,
  onChange,
  onSampleProviderSelect
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState(value);
  const [showDropdown, setShowDropdown] = useState(false);
  const [sampleProviders, setSampleProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch sample providers when component mounts
  useEffect(() => {
    const fetchSampleProviders = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const providers = await apiService.getSampleProviders(user.id);
        
        // Transform API response to match our expected format
        const transformedProviders = providers.map((provider: any) => ({
          id: provider.id,
          samplerName: provider.samplerName,
          phoneNumber: provider.phoneNumber,
          location: provider.location,
          coordinates: provider.coordinates,
          userType: provider.userType,
          altPhoneNumber: provider.altPhoneNumber
        }));
        
        setSampleProviders(transformedProviders);
      } catch (error) {
        console.error('Failed to fetch sample providers:', error);
        setSampleProviders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSampleProviders();
  }, [user?.id]);

  // Filter providers based on search term
  const filteredProviders = sampleProviders.filter(provider =>
    provider.samplerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.phoneNumber?.includes(searchTerm) ||
    provider.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange(newValue);
    // Don't automatically show dropdown on typing
  };

  // Handle provider selection
  const handleProviderSelect = (provider: any) => {
    setSearchTerm(provider.samplerName);
    onChange(provider.samplerName);
    setShowDropdown(false);
    onSampleProviderSelect(provider);
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update search term when value prop changes
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  return (
    <div className="relative">
      <div className="relative">
        <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => {
            // Always show dropdown when clicking/focusing on input
            setShowDropdown(true);
          }}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          placeholder="Search sample provider or enter new name..."
        />
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {loading ? (
            <div className="p-3 text-center text-gray-500">Loading sample providers...</div>
          ) : filteredProviders.length > 0 ? (
            filteredProviders.map((provider) => (
              <div
                key={provider.id}
                onClick={() => handleProviderSelect(provider)}
                className="p-3 hover:bg-cyan-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium text-gray-900">{provider.samplerName}</div>
                <div className="text-sm text-gray-600">
                  ID: {provider.id} • Phone: {provider.phoneNumber}
                  {provider.userType && ` • Type: ${provider.userType}`}
                </div>
                <div className="text-sm text-gray-500 truncate">📍 {provider.location}</div>
              </div>
            ))
          ) : sampleProviders.length > 0 && searchTerm.length > 0 ? (
            <div className="p-3 text-center text-gray-500">
              No providers found matching "{searchTerm}". You can enter this as a new provider.
            </div>
          ) : sampleProviders.length > 0 ? (
            <div className="p-3 text-center text-gray-500">
              Start typing to search providers or enter a new provider name
            </div>
          ) : (
            <div className="p-3 text-center text-gray-500">
              No sample providers found. Enter a new provider name.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SubmitSample: React.FC = () => {
  const { user } = useAuth();
  const { addNotification, notifications } = useNotifications();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [submittedSample, setSubmittedSample] = useState<Sample | null>(null);
  const [progressStage, setProgressStage] = useState<'submitted' | 'agent-assigned' | 'testing' | 'completed'>('submitted');
  const [assignedAgent, setAssignedAgent] = useState<string>('');
  const [selectedSampleProvider, setSelectedSampleProvider] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    samplerName: '',
    location: '',
    category: '',
    testTypes: [] as string[],
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

  const testTypesByCategory: { [key: string]: string[] } = {
    'Pacific White Shrimp': [
      'Pathogen Detection',
      'Antibiotic Residue Test',
      'Heavy Metal Analysis',
      'Nutritional Analysis',
      'Freshness Assessment',
      'Microbiological Testing'
    ],
    'Tiger Shrimp': [
      'Viral Disease Screening',
      'Bacterial Contamination Test',
      'Chemical Residue Analysis',
      'Quality Grade Assessment',
      'Shelf Life Evaluation',
      'Allergen Testing'
    ],
    'Black Tiger Shrimp': [
      'Disease Resistance Testing',
      'Genetic Purity Analysis',
      'Environmental Toxin Screening',
      'Protein Content Analysis',
      'Texture Quality Assessment',
      'Preservation Efficacy Test'
    ],
    'Banana Shrimp': [
      'Freshness Indicator Testing',
      'Parasitic Infection Screening',
      'Trace Element Analysis',
      'Sensory Quality Evaluation',
      'Spoilage Bacteria Detection',
      'Size Grading Assessment'
    ],
    'Brown Shrimp': [
      'Contamination Level Testing',
      'Oxidation Resistance Analysis',
      'Flavor Profile Assessment',
      'Moisture Content Analysis',
      'Bacterial Load Testing',
      'Chemical Preservative Detection'
    ],
    'Pink Shrimp': [
      'Color Stability Testing',
      'Antioxidant Level Analysis',
      'Texture Integrity Assessment',
      'Microbial Safety Testing',
      'Salt Content Analysis',
      'Processing Quality Evaluation'
    ]
  };

  // Listen for notifications and auto-update progress stages
  useEffect(() => {
    if (!submitted || !submittedSample) return;

    // Listen for new notifications related to this sample
    const latestNotification = notifications
      .filter(n => n.sampleId === submittedSample.id)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

    if (latestNotification && latestNotification.data?.stage) {
      const newStage = latestNotification.data.stage;
      
      // Update progress stage based on notification
      setProgressStage(newStage);
      
      // Update agent if notification contains agent info
      if (latestNotification.data.agent) {
        setAssignedAgent(latestNotification.data.agent);
      }
      
      // Update local storage
      if (newStage === 'agent-assigned' && latestNotification.data.agent) {
        updateSampleStatus(submittedSample.id, 'agent-assigned', latestNotification.data.agent);
      } else if (newStage === 'testing') {
        updateSampleStatus(submittedSample.id, 'testing');
      } else if (newStage === 'completed') {
        updateSampleStatus(submittedSample.id, 'completed');
        createTestReport(submittedSample);
      }
    }
  }, [notifications, submitted, submittedSample]);

  // Handle sample provider selection
  const handleSampleProviderSelect = (provider: any) => {
    setSelectedSampleProvider(provider);
    setFormData(prev => ({
      ...prev,
      samplerName: provider.samplerName,
      location: provider.coordinates ? JSON.stringify({
        address: provider.location,
        coordinates: provider.coordinates,
      }) : '',
      phoneNumber: provider.phoneNumber || '',
    }));
  };

  // Handle sample provider name change
  const handleSampleProviderNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      samplerName: name
    }));
    
    // Clear selected provider only if name doesn't match any existing provider
    if (selectedSampleProvider && selectedSampleProvider.samplerName.trim().toLowerCase() !== name.trim().toLowerCase()) {
      setSelectedSampleProvider(null);
    }
  };

  // Handle category change and reset test types
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      category: e.target.value,
      testTypes: [], // Reset test types when category changes
    }));
  };

  // Handle test type selection (multiple)
  const handleTestTypeChange = (testType: string) => {
    setFormData(prev => ({
      ...prev,
      testTypes: prev.testTypes.includes(testType)
        ? prev.testTypes.filter(t => t !== testType)
        : [...prev.testTypes, testType]
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
    
    // Validate required fields
    if (!formData.samplerName.trim()) {
      alert('Please enter the sample provider name.');
      return;
    }

    if (!formData.phoneNumber.trim()) {
      alert('Please enter the phone number.');
      return;
    }

    // Validate that at least one test type is selected
    if (!formData.testTypes || formData.testTypes.length === 0) {
      alert('Please select at least one test type for your sample.');
      return;
    }

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

    // Check if this sampler name matches an existing provider (even if selectedSampleProvider was cleared during typing)
    let finalSampleProvider = selectedSampleProvider;
    if (!finalSampleProvider && formData.samplerName.trim()) {
      // Try to find the provider by name from the SampleProviderSearch component's data
      // We need to get the sample providers again to check
      try {
        const providers = await apiService.getSampleProviders(user!.id);
        finalSampleProvider = providers.find((provider: any) => 
          provider.samplerName.trim().toLowerCase() === formData.samplerName.trim().toLowerCase()
        );
      } catch (error) {
        console.warn('Failed to fetch sample providers for validation:', error);
      }
    }

    // Ask user if they want to save this sample provider (only if it's a new one)
    const shouldSaveProvider = !finalSampleProvider && window.confirm(
      `Would you like to save "${formData.samplerName}" as a sample provider for future use?\n\nThis will save their details to your account for easy selection next time.`
    );

    try {
      // Prepare API submission data
      const submissionData = {
        consumerId: user!.id,
        samplerId: finalSampleProvider?.id || `temp_${Date.now()}`,
        samplerName: formData.samplerName,
        samplerLocation: locationData.address || formData.location,
        coordinate: {
          lat: coordinates.lat,
          lng: coordinates.lng,
        },
        shrimpCategory: formData.category,
        testTypes: formData.testTypes,
        phoneNumber: formData.phoneNumber,
        emailAddress: formData.email || undefined,
        status: "PENDING",
        assigned: "",
      };

      // If user wants to save provider, save as framer
      if (shouldSaveProvider) {
        try {
          const framerData = {
            samplerName: formData.samplerName,
            phoneNumber: formData.phoneNumber,
            location: locationData.address,
            coordinates: coordinates,
            userId: user!.id
          };
          
          // Save as framer via API (when implemented)
          console.log('Would save sample provider as framer:', framerData);
        } catch (error) {
          console.warn('Failed to save sample provider as framer:', error);
          // Don't block submission if saving fails
        }
      }

      // Submit the sample
      const response = await apiService.submitSample(submissionData);
      
      // Create local sample record for UI
      const newSample: Sample = {
        id: response.id || Date.now().toString(),
        userId: user!.id,
        customerId: formData.samplerName, // Use the actual sample provider name
        location: locationData.address || formData.location,
        category: formData.category,
        subCategory: formData.testTypes.join(', '), // Store test types as comma-separated string for compatibility
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

      // Send initial submission notification
      addNotification({
        type: 'sample_status_change',
        title: 'Sample Submitted',
        message: `Your sample has been successfully submitted for testing (ID: ${newSample.id})`,
        sampleId: newSample.id,
        data: { stage: 'submitted' }
      });

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
    setSelectedSampleProvider(null);
    setFormData({
      samplerName: '',
      location: '',
      category: '',
      testTypes: [],
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
              </div>                <div>
                  <span className="text-sm font-medium text-gray-500">Submission Date</span>
                  <p className="text-gray-900 text-sm lg:text-base">{new Date(submittedSample.submittedAt).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Sample Provider</span>
                  <p className="text-gray-900 text-sm lg:text-base">{submittedSample.customerId}</p>
                </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Location</span>
                <div className="flex flex-col space-y-1">
                  <p className="text-gray-900 text-sm lg:text-base">{submittedSample.location}</p>
                  {(() => {
                    // Try to parse location if it contains coordinates
                    try {
                      const locationData = JSON.parse(formData.location);
                      const coordinates = locationData.coordinates;
                      
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
                    } catch {
                      // Invalid JSON, don't show map link
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
                <div className="lg:col-span-2">
                  <span className="text-sm font-medium text-gray-500">Selected Test Types</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {submittedSample.subCategory.split(', ').map((testType, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800"
                      >
                        {testType}
                      </span>
                    ))}
                  </div>
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
          {/* Sample Provider Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="inline h-4 w-4 mr-1" />
              Sample Provider Name *
            </label>
            <SampleProviderSearch
              value={formData.samplerName}
              onChange={handleSampleProviderNameChange}
              onSampleProviderSelect={handleSampleProviderSelect}
            />
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
              disabled={!!(selectedSampleProvider && selectedSampleProvider.coordinates)}
            />
            {selectedSampleProvider && selectedSampleProvider.coordinates && (
              <p className="mt-1 text-xs text-gray-500">
                Location automatically populated from selected sample provider
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
              onChange={handleCategoryChange}
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

          {/* Test Types */}
          {formData.category && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FlaskConical className="inline h-4 w-4 mr-1" />
                Test Types * (Select one or more)
              </label>
              <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {testTypesByCategory[formData.category]?.map((testType) => (
                    <label
                      key={testType}
                      className="flex items-start space-x-3 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={formData.testTypes.includes(testType)}
                        onChange={() => handleTestTypeChange(testType)}
                        className="mt-1 h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900 leading-5">
                        {testType}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              {formData.testTypes.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.testTypes.map((testType) => (
                    <span
                      key={testType}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800"
                    >
                      {testType}
                      <button
                        type="button"
                        onClick={() => handleTestTypeChange(testType)}
                        className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-cyan-400 hover:text-cyan-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Select all applicable test types for your sample
              </p>
            </div>
          )}

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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Enter phone number"
              />
              {selectedSampleProvider && selectedSampleProvider.phoneNumber && (
                <p className="mt-1 text-xs text-gray-500">
                  Phone automatically populated from selected sample provider
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
