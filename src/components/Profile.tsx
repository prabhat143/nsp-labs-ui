import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
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
} from "lucide-react";

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

      autocompleteInstance.addListener("place_changed", () => {
        const place = autocompleteInstance!.getPlace();
        if (!place.geometry) return;

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
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    company: user?.company || "",
    phone: user?.phone || "",
    address: user?.address || "",
    customers: user?.customers || [],
  });

  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phoneNumber: "",
    location: "",
  });

  const editingCustomer = editingCustomerId
    ? formData.customers.find((c) => c.id === editingCustomerId)
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(formData);
    setIsEditing(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
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

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();

    // Add the new customer to the customers array
    const updatedFormData = {
      ...formData,
      customers: [
        ...formData.customers,
        {
          id: Date.now().toString(), // Simple ID generation
          ...newCustomer,
        },
      ],
    };

    // Update user data with new customer
    updateUser(updatedFormData);
    setFormData(updatedFormData);

    // Reset new customer form
    setNewCustomer({
      name: "",
      phoneNumber: "",
      location: "",
    });

    // Hide the add customer form
    setShowAddCustomer(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      company: user?.company || "",
      phone: user?.phone || "",
      address: user?.address || "",
      customers: user?.customers || [],
    });
    setIsEditing(false);
  };

  const handleEditCustomer = (customerId: string) => {
    setEditingCustomerId(customerId);
    setShowAddCustomer(false);
  };

  const handleCancelEditCustomer = () => {
    setEditingCustomerId(null);
  };

  const handleUpdateCustomer = (e: React.FormEvent) => {
    e.preventDefault();

    // Update the customer in the customers array
    const updatedCustomers = formData.customers.map((customer) =>
      customer.id === editingCustomerId
        ? { ...customer, ...newCustomer }
        : customer
    );

    const updatedFormData = {
      ...formData,
      customers: updatedCustomers,
    };

    // Update user data with updated customer
    updateUser(updatedFormData);
    setFormData(updatedFormData);

    // Reset form and editing state
    setNewCustomer({
      name: "",
      phoneNumber: "",
      location: "",
    });
    setEditingCustomerId(null);
  };

  const handleDeleteCustomer = (customerId: string) => {
    const updatedCustomers = formData.customers.filter(
      (customer) => customer.id !== customerId
    );

    const updatedFormData = {
      ...formData,
      customers: updatedCustomers,
    };

    // Update user data with filtered customers
    updateUser(updatedFormData);
    setFormData(updatedFormData);

    // If deleting the customer being edited, reset the editing state
    if (editingCustomerId === customerId) {
      setEditingCustomerId(null);
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

    

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Customer Profile
                </h1>
                <p className="text-cyan-100">Manage your account information</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
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
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Account Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">
                    Customer ID:
                  </span>
                  <span className="ml-2 text-gray-900">{user?.id}</span>
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
      {/* Customer Management Section */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">My Customers</h1>
                <p className="text-indigo-100">
                  Manage your customer information
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddCustomer(!showAddCustomer)}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>{showAddCustomer ? "Cancel" : "Add Customer"}</span>
            </button>
          </div>
        </div>

        <div className="p-8">
          {/* Add Customer Form */}
          {(showAddCustomer || editingCustomerId) && (
            <div className="mb-8 p-6 border border-indigo-100 bg-indigo-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingCustomerId ? "Edit Customer" : "Add New Customer"}
              </h3>
              <form
                onSubmit={
                  editingCustomerId ? handleUpdateCustomer : handleAddCustomer
                }
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    onChange={handleCustomerInputChange}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
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
                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-colors flex items-center space-x-2"
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
                            // Find this section in your Profile.tsx file around line 700
                            // Replace your existing customer mapping code in the customer list section
              
                            // Replace the section where you map over customers
              
              <div className="divide-y divide-gray-200">
                {formData.customers.map((customer) => {
                  // Parse the location data if it's in JSON format
                  let locationDisplay = customer.location;
                  let locationData = null;
                  
                  try {
                    locationData = JSON.parse(customer.location);
                    locationDisplay = locationData.address;
                  } catch (e) {
                    console.log("Error parsing location:", e);
                    // If it's not valid JSON, just display as is
                  }
                  
                  // Function to open Google Maps with the coordinates
                  const openInGoogleMaps = () => {
                    if (locationData?.coordinates) {
                      const { lat, lng } = locationData.coordinates;
                      const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
                      window.open(mapsUrl, '_blank');
                    }
                  };
                  
                  return (
                    <div key={customer.id} className="py-4">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                        <div className="mb-3 md:mb-0 md:max-w-[60%]"> {/* Added max-width */}
                          <h4 className="text-md font-medium text-gray-900 mb-1">
                            {customer.name}
                          </h4>
                          {/* Move location to its own block with more space */}
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm text-gray-500 break-words"> {/* Added break-words */}
                              {locationDisplay || "No location specified"}
                            </p>
                            {locationData?.coordinates && (
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
                        <div className="flex items-center space-x-4">
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
    </div>
  );
};

export default Profile;
