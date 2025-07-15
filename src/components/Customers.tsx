import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';
import { apiService } from '../services/api';
import { Customer } from '../types';
import {
  User,
  Phone,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Save,
  Users,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

// Define proper types for the component props
interface LocationAutocompleteProps {
  value: string;
  onChange: (e: { target: { name: string; value: string } }) => void;
  placeholder?: string;
  name?: string;
}

interface FarmerLocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
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

    let autocompleteInstance: any = null;
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
          (window as any).google.maps.event.clearInstanceListeners(autocompleteInstance);
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
        placeholder="Enter sample provider location"
        autoComplete="off"
      />
    </div>
  );
};

const FarmerLocationAutocomplete: React.FC<FarmerLocationAutocompleteProps> = ({ value, onChange, placeholder = "Enter farmer location" }) => {
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

    let autocompleteInstance: any = null;
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
          onChange(exactLocation);
        });
      }

      return () => {
        if (autocompleteInstance) {
          (window as any).google.maps.event.clearInstanceListeners(autocompleteInstance);
        }
      };
    } catch (error) {
      console.error("Error initializing Places Autocomplete for farmer:", error);
    }
  }, [onChange]);

  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          // Do not call onChange here, only update local input
        }}
        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
        placeholder={placeholder}
        autoComplete="off"
      />
    </div>
  );
};

const Customers: React.FC = () => {
  const { user } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [expandedFarmers, setExpandedFarmers] = useState<Record<string, boolean>>({});

  const [newCustomer, setNewCustomer] = useState({
    name: "",
    userType: "Farmer",
    phoneNumber: "",
    altPhoneNumber: "",
    location: "",
    farmers: [{ name: "", phoneNumber: "", altPhoneNumber: "", location: "" }] as Array<{ name: string; phoneNumber: string; altPhoneNumber: string; location: string }>,
  });

  const editingCustomer = editingCustomerId
    ? customers.find((c) => c.id === editingCustomerId)
    : null;

  const handleCustomerLocationChange = (e: { target: { name: string; value: string } }) => {
    setNewCustomer({
      ...newCustomer,
      [e.target.name]: e.target.value,
    });
  };

  const handleCustomerInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
        userType: newCustomer.userType,
        phoneNumber: newCustomer.phoneNumber,
        altPhoneNumber: newCustomer.altPhoneNumber,
        location: locationToSend,
        coordinates: fullLocationData?.coordinates,
        farmers: newCustomer.userType === "Agent" ? newCustomer.farmers : undefined,
      });

      // Reload customers from API
      const sampleProviders = await apiService.getSampleProviders(user.id);
      
      // Transform API response to match Customer interface
      const transformedCustomers = sampleProviders.map((provider: any) => ({
        id: provider.id,
        name: provider.samplerName,
        phoneNumber: provider.phoneNumber,
        location: provider.location,
        coordinates: provider.coordinates,
        userType: provider.userType === null ? undefined : provider.userType,
        altPhoneNumber: provider.altPhoneNumber === null ? undefined : provider.altPhoneNumber,
        farmers: provider.farmers === null ? [] : (provider.farmers || []).map((farmer: any) => {
          // Parse farmer location if it's JSON
          let farmerLocation = farmer.location;
          let farmerCoordinates = farmer.coordinates;
          
          try {
            if (farmer.location && typeof farmer.location === 'string' && farmer.location.trim().startsWith('{')) {
              const locationData = JSON.parse(farmer.location);
              farmerLocation = farmer.location; // Keep the JSON string
              farmerCoordinates = locationData.coordinates || farmer.coordinates;
            }
          } catch (e) {
            // If parsing fails, keep original values
          }
          
          return {
            name: farmer.name,
            phoneNumber: farmer.phoneNumber,
            altPhoneNumber: farmer.altPhoneNumber || "",
            location: farmerLocation,
            coordinates: farmerCoordinates
          };
        }),
      }));

      setCustomers(transformedCustomers);

      showToast('Sample Provider added successfully!', 'success');

      // Reset new customer form
      setNewCustomer({
        name: "",
        userType: "Farmer",
        phoneNumber: "",
        altPhoneNumber: "",
        location: "",
        farmers: [{ name: "", phoneNumber: "", altPhoneNumber: "", location: "" }],
      });

      // Hide the add customer form
      setShowAddCustomer(false);

    } catch (error: any) {
      console.error('Add customer error:', error);
      let errorMessage = 'Failed to add sample provider';
      
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

  const handleEditCustomer = (customerId: string) => {
    console.log('Edit customer clicked:', customerId);
    const customerToEdit = customers.find(c => c.id === customerId);
    console.log('Customer to edit:', customerToEdit);
    
    setEditingCustomerId(customerId);
    setShowAddCustomer(false);
    
    // Scroll to top of form on mobile
    setTimeout(() => {
      const formElement = document.querySelector('[data-testid="customer-form"]');
      if (formElement && window.innerWidth < 1024) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleCancelEditCustomer = () => {
    console.log('Cancel edit clicked');
    setEditingCustomerId(null);
    // Reset form data
    setNewCustomer({
      name: "",
      userType: "Farmer",
      phoneNumber: "",
      altPhoneNumber: "",
      location: "",
      farmers: [{ name: "", phoneNumber: "", altPhoneNumber: "", location: "" }],
    });
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

      // Call the API to update sample provider by ID
      await apiService.updateSampleProviderById(user.id, editingCustomerId, {
        samplerName: newCustomer.name,
        userType: newCustomer.userType,
        phoneNumber: newCustomer.phoneNumber,
        altPhoneNumber: newCustomer.altPhoneNumber,
        location: locationToSend,
        coordinates: fullLocationData?.coordinates,
        farmers: newCustomer.userType === "Agent" ? newCustomer.farmers : undefined,
      });

      // Reload customers from API
      const sampleProviders = await apiService.getSampleProviders(user.id);
      
      // Transform API response to match Customer interface
      const transformedCustomers = sampleProviders.map((provider: any) => ({
        id: provider.id,
        name: provider.samplerName,
        phoneNumber: provider.phoneNumber,
        location: provider.location,
        coordinates: provider.coordinates,
        userType: provider.userType === null ? undefined : provider.userType,
        altPhoneNumber: provider.altPhoneNumber === null ? undefined : provider.altPhoneNumber,
        farmers: provider.farmers === null ? [] : (provider.farmers || []).map((farmer: any) => {
          // Parse farmer location if it's JSON
          let farmerLocation = farmer.location;
          let farmerCoordinates = farmer.coordinates;
          
          try {
            if (farmer.location && typeof farmer.location === 'string' && farmer.location.trim().startsWith('{')) {
              const locationData = JSON.parse(farmer.location);
              farmerLocation = farmer.location; // Keep the JSON string
              farmerCoordinates = locationData.coordinates || farmer.coordinates;
            }
          } catch (e) {
            // If parsing fails, keep original values
          }
          
          return {
            name: farmer.name,
            phoneNumber: farmer.phoneNumber,
            altPhoneNumber: farmer.altPhoneNumber || "",
            location: farmerLocation,
            coordinates: farmerCoordinates
          };
        }),
      }));

      setCustomers(transformedCustomers);
      
      showToast('Sample Provider updated successfully!', 'success');

      // Reset form and editing state
      setNewCustomer({
        name: "",
        userType: "Farmer",
        phoneNumber: "",
        altPhoneNumber: "",
        location: "",
        farmers: [{ name: "", phoneNumber: "", altPhoneNumber: "", location: "" }],
      });
      setEditingCustomerId(null);
    } catch (error) {
      console.error('Error updating customer:', error);
      setError(error instanceof Error ? error.message : 'Failed to update sample provider');
      showToast('Failed to update sample provider', 'error');
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

      // Call the API to delete the sample provider by ID
      await apiService.deleteSampleProviderById(user.id, customerId);

      // Reload customers from API
      const sampleProviders = await apiService.getSampleProviders(user.id);
      
      // Transform API response to match Customer interface
      const transformedCustomers = sampleProviders.map((provider: any) => ({
        id: provider.id,
        name: provider.samplerName,
        phoneNumber: provider.phoneNumber,
        location: provider.location,
        coordinates: provider.coordinates,
        userType: provider.userType === null ? undefined : provider.userType,
        altPhoneNumber: provider.altPhoneNumber === null ? undefined : provider.altPhoneNumber,
        farmers: provider.farmers === null ? [] : (provider.farmers || []).map((farmer: any) => {
          // Parse farmer location if it's JSON
          let farmerLocation = farmer.location;
          let farmerCoordinates = farmer.coordinates;
          
          try {
            if (farmer.location && typeof farmer.location === 'string' && farmer.location.trim().startsWith('{')) {
              const locationData = JSON.parse(farmer.location);
              farmerLocation = farmer.location; // Keep the JSON string
              farmerCoordinates = locationData.coordinates || farmer.coordinates;
            }
          } catch (e) {
            // If parsing fails, keep original values
          }
          
          return {
            name: farmer.name,
            phoneNumber: farmer.phoneNumber,
            altPhoneNumber: farmer.altPhoneNumber || "",
            location: farmerLocation,
            coordinates: farmerCoordinates
          };
        }),
      }));

      setCustomers(transformedCustomers);

      showToast('Sample Provider deleted successfully!', 'success');

      // If deleting the customer being edited, reset the editing state
      if (editingCustomerId === customerId) {
        setEditingCustomerId(null);
      }

    } catch (error: any) {
      console.error('Delete customer error:', error);
      let errorMessage = 'Failed to delete sample provider';
      
      if (error.response?.status === 404) {
        errorMessage = 'Sample Provider not found';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error occurred while deleting sample provider';
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
    console.log('useEffect triggered for editing customer:', editingCustomer);
    
    if (editingCustomer) {
      // Prepare location data - if it's JSON, keep it as JSON for the form
      let locationForForm = editingCustomer.location || "";
      
      // If location is not JSON and we have coordinates, create JSON format
      if (locationForForm && !locationForForm.trim().startsWith('{') && editingCustomer.coordinates) {
        locationForForm = JSON.stringify({
          address: editingCustomer.location,
          coordinates: editingCustomer.coordinates,
          placeId: "" // We don't have placeId from API
        });
      }

      const newCustomerData = {
        name: editingCustomer.name,
        userType: editingCustomer.userType || "Farmer",
        phoneNumber: editingCustomer.phoneNumber,
        altPhoneNumber: editingCustomer.altPhoneNumber || "",
        location: locationForForm,
        farmers: (editingCustomer.farmers || []).map(f => {
          // Prepare farmer location data
          let farmerLocationForForm = f.location || "";
          
          // If farmer location is not JSON and we have coordinates, create JSON format
          if (farmerLocationForForm && !farmerLocationForForm.trim().startsWith('{') && f.coordinates) {
            farmerLocationForForm = JSON.stringify({
              address: f.location,
              coordinates: f.coordinates,
              placeId: ""
            });
          }
          
          return {
            name: f.name,
            phoneNumber: f.phoneNumber,
            altPhoneNumber: f.altPhoneNumber || "",
            location: farmerLocationForForm
          };
        }),
      };
      
      console.log('Setting form data for edit:', newCustomerData);
      setNewCustomer(newCustomerData);
    } else {
      console.log('Resetting form data');
      setNewCustomer({
        name: "",
        userType: "Farmer",
        phoneNumber: "",
        altPhoneNumber: "",
        location: "",
        farmers: [{ name: "", phoneNumber: "", altPhoneNumber: "", location: "" }],
      });
    }
  }, [editingCustomer]);

  // Fetch customers on component mount
  useEffect(() => {
    const loadCustomers = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const sampleProviders = await apiService.getSampleProviders(user.id);
        
        // Transform API response to match Customer interface
        const transformedCustomers = sampleProviders.map((provider: any) => ({
          id: provider.id,
          name: provider.samplerName,
          phoneNumber: provider.phoneNumber,
          location: provider.location,
          coordinates: provider.coordinates,
          userType: provider.userType === null ? undefined : provider.userType,
          altPhoneNumber: provider.altPhoneNumber === null ? undefined : provider.altPhoneNumber,
          farmers: provider.farmers === null ? [] : (provider.farmers || []).map((farmer: any) => {
            // Parse farmer location if it's JSON
            let farmerLocation = farmer.location;
            let farmerCoordinates = farmer.coordinates;
            
            try {
              if (farmer.location && typeof farmer.location === 'string' && farmer.location.trim().startsWith('{')) {
                const locationData = JSON.parse(farmer.location);
                farmerLocation = farmer.location; // Keep the JSON string
                farmerCoordinates = locationData.coordinates || farmer.coordinates;
              }
            } catch (e) {
              // If parsing fails, keep original values
            }
            
            return {
              name: farmer.name,
              phoneNumber: farmer.phoneNumber,
              altPhoneNumber: farmer.altPhoneNumber || "",
              location: farmerLocation,
              coordinates: farmerCoordinates
            };
          }),
        }));
        
        setCustomers(transformedCustomers);
      } catch (error) {
        console.warn('Error fetching customers:', error);
        showToast('Failed to load sample providers', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, [user?.id]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8">
      {/* Customer Management Section */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-white">My Sample Providers</h1>
                <p className="text-indigo-100 text-sm lg:text-base">
                  Manage your sample provider information
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddCustomer(!showAddCustomer)}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              <span>{showAddCustomer ? "Cancel" : "Add Sample Provider"}</span>
            </button>
          </div>
        </div>

        <div className="p-6 lg:p-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Add Customer Form */}
          {(showAddCustomer || editingCustomerId) && (
            <div 
              data-testid="customer-form"
              className="mb-8 p-4 lg:p-6 border border-indigo-100 bg-indigo-50 rounded-lg"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
                <span>{editingCustomerId ? "Edit Sample Provider" : "Add New Sample Provider"}</span>
                {editingCustomerId && (
                  <button
                    type="button"
                    onClick={handleCancelEditCustomer}
                    className="lg:hidden text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                    aria-label="Cancel editing"
                  >
                    ✕
                  </button>
                )}
              </h3>
              <form
                onSubmit={
                  editingCustomerId ? handleUpdateCustomer : handleAddCustomer
                }
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Sample Provider Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sample Provider Name
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
                        placeholder="Enter sample provider name"
                      />
                    </div>
                  </div>

                  {/* User Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Provider Type
                    </label>
                    <select
                      name="userType"
                      value={newCustomer.userType}
                      onChange={handleCustomerInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="Farmer">Farmer</option>
                      <option value="Agent">Agent</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Phone Number */}
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
                        placeholder="Enter sample provider phone number"
                      />
                    </div>
                  </div>

                  {/* Alt Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alternative Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        name="altPhoneNumber"
                        value={newCustomer.altPhoneNumber}
                        onChange={handleCustomerInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Enter alternative phone number"
                      />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <LocationAutocomplete
                    value={newCustomer.location}
                    onChange={handleCustomerLocationChange}
                  />
                </div>

                {/* Farmers Section - Only show if userType is Agent */}
                {newCustomer.userType === "Agent" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Farmers
                    </label>
                    {newCustomer.farmers.map((farmer, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Farmer Name</label>
                            <input
                              type="text"
                              value={farmer.name}
                              onChange={(e) => {
                                const updatedFarmers = [...newCustomer.farmers];
                                updatedFarmers[index].name = e.target.value;
                                setNewCustomer({ ...newCustomer, farmers: updatedFarmers });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              placeholder="Enter farmer name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Phone Number</label>
                            <input
                              type="tel"
                              value={farmer.phoneNumber}
                              onChange={(e) => {
                                const updatedFarmers = [...newCustomer.farmers];
                                updatedFarmers[index].phoneNumber = e.target.value;
                                setNewCustomer({ ...newCustomer, farmers: updatedFarmers });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              placeholder="Enter phone number"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Alt Phone Number</label>
                            <input
                              type="tel"
                              value={farmer.altPhoneNumber}
                              onChange={(e) => {
                                const updatedFarmers = [...newCustomer.farmers];
                                updatedFarmers[index].altPhoneNumber = e.target.value;
                                setNewCustomer({ ...newCustomer, farmers: updatedFarmers });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              placeholder="Enter alternative phone"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Location</label>
                            <FarmerLocationAutocomplete
                              value={farmer.location}
                              onChange={(value) => {
                                const updatedFarmers = [...newCustomer.farmers];
                                updatedFarmers[index].location = value;
                                setNewCustomer({ ...newCustomer, farmers: updatedFarmers });
                              }}
                              placeholder="Enter farmer location"
                            />
                          </div>
                        </div>
                        {newCustomer.farmers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updatedFarmers = newCustomer.farmers.filter((_, i) => i !== index);
                              setNewCustomer({ ...newCustomer, farmers: updatedFarmers });
                            }}
                            className="mt-2 text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove Farmer
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setNewCustomer({
                          ...newCustomer,
                          farmers: [...newCustomer.farmers, { name: "", phoneNumber: "", altPhoneNumber: "", location: "" }]
                        });
                      }}
                      className="text-indigo-600 hover:text-indigo-800 text-sm"
                    >
                      + Add Another Farmer
                    </button>
                  </div>
                )}

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
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingCustomerId ? (
                      <>
                        <Save className="h-4 w-4" />
                        <span>{loading ? 'Updating...' : 'Update Sample Provider'}</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        <span>{loading ? 'Adding...' : 'Add Sample Provider'}</span>
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
              Your Sample Providers
            </h3>

            {customers.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">
                  You haven't added any sample providers yet.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {customers.map((customer) => {
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

                  // Use coordinates from customer object or parsed coordinates
                  const coordinates = customer.coordinates || locationData?.coordinates;
                  
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
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-md font-medium text-gray-900">
                              {customer.name}
                            </h4>
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded">
                              {customer.userType || "Farmer"}
                            </span>
                          </div>
                          {/* Display the sample provider ID for debugging */}
                          <p className="text-xs text-gray-400 mb-1">
                            ID: {customer.id}
                          </p>
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
                          
                          {/* Expandable Farmers Section for Agent */}
                          {customer.userType === "Agent" && customer.farmers && Array.isArray(customer.farmers) && customer.farmers.length > 0 && (
                            <div className="mt-3 bg-gray-50 rounded-lg p-3">
                              <button
                                onClick={() => setExpandedFarmers(prev => ({
                                  ...prev,
                                  [customer.id]: !prev[customer.id]
                                }))}
                                className="flex items-center space-x-2 w-full text-left hover:bg-gray-100 rounded p-1 transition-colors"
                              >
                                {expandedFarmers[customer.id] ? (
                                  <ChevronDown className="h-4 w-4 text-gray-600" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-gray-600" />
                                )}
                                <h5 className="text-sm font-semibold text-gray-700">
                                  Farmers ({customer.farmers.length})
                                </h5>
                              </button>
                              
                              {expandedFarmers[customer.id] && (
                                <div className="space-y-2 mt-2">
                                  {customer.farmers.map((farmer, idx) => {
                                    // Parse farmer location if it's JSON
                                    let farmerLocationDisplay = farmer.location;
                                    let farmerCoordinates = null;
                                    
                                    try {
                                      if (farmer.location && farmer.location.trim().startsWith('{')) {
                                        const locationData = JSON.parse(farmer.location);
                                        farmerLocationDisplay = locationData.address || farmer.location;
                                        farmerCoordinates = locationData.coordinates;
                                      }
                                    } catch (e) {
                                      farmerLocationDisplay = farmer.location;
                                    }
                                    
                                    const openFarmerInGoogleMaps = () => {
                                      if (farmerCoordinates) {
                                        const { lat, lng } = farmerCoordinates;
                                        const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
                                        window.open(mapsUrl, '_blank');
                                      }
                                    };
                                    
                                    return (
                                      <div key={idx} className="bg-white rounded p-2 border border-gray-200">
                                        <div className="flex flex-col space-y-1">
                                          <span className="font-medium text-gray-800 text-sm">{farmer.name}</span>
                                          <div className="flex items-center space-x-4 text-xs text-gray-600">
                                            <span className="flex items-center">
                                              <Phone className="h-3 w-3 mr-1" />
                                              {farmer.phoneNumber}
                                            </span>
                                            {farmer.altPhoneNumber && (
                                              <span className="flex items-center">
                                                <Phone className="h-3 w-3 mr-1" />
                                                {farmer.altPhoneNumber}
                                              </span>
                                            )}
                                          </div>
                                          {farmerLocationDisplay && (
                                            <div className="text-xs text-gray-600 flex items-start">
                                              <MapPin className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                                              <div className="flex flex-col">
                                                <span className="break-words">{farmerLocationDisplay}</span>
                                                {farmerCoordinates && (
                                                  <button 
                                                    onClick={openFarmerInGoogleMaps}
                                                    className="self-start text-xs text-indigo-600 hover:text-indigo-800 flex items-center mt-1"
                                                    title="Open farmer location in Google Maps"
                                                  >
                                                    <MapPin className="h-3 w-3 mr-1" />
                                                    View on map
                                                  </button>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="text-sm text-gray-600">
                                {customer.phoneNumber}
                              </span>
                            </div>
                            {customer.altPhoneNumber && (
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 text-gray-400 mr-1" />
                                <span className="text-sm text-gray-600">
                                  {customer.altPhoneNumber}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditCustomer(customer.id)}
                              className="p-2 rounded-full text-indigo-500 hover:bg-indigo-50 touch-manipulation min-w-[40px] min-h-[40px] flex items-center justify-center"
                              aria-label="Edit sample provider"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCustomer(customer.id)}
                              className="p-2 rounded-full text-red-500 hover:bg-red-50 touch-manipulation min-w-[40px] min-h-[40px] flex items-center justify-center"
                              aria-label="Delete sample provider"
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

export default Customers;
