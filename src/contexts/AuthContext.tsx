import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, AuthContextType } from '../types';
import { 
  getUsers, 
  saveUser, 
  getCurrentUser, 
  setCurrentUser,
  initializeMockData 
} from '../utils/localStorage';
import { apiService } from '../services/api';
import { tokenService } from '../services/tokenService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeMockData();
    
    // Set up token service logout callback
    tokenService.setLogoutCallback(() => {
      logout();
    });
    
    // Check for existing token and user
    const currentUser = getCurrentUser();
    const isTokenValid = tokenService.isTokenValid();
    
    if (currentUser && isTokenValid) {
      setUser(currentUser);
      // Check token expiration on load
      tokenService.checkTokenOnLoad();
    } else if (currentUser && !isTokenValid) {
      // User exists but token is invalid/expired, logout
      logout();
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await apiService.login({ email, password });
      
      // Debug: Log the actual response structure
      console.log('Login API Response:', response);
      console.log('Has customer?', !!response.customer);
      console.log('Has accessToken?', !!response.accessToken);
      
      // Handle different response structures
      let customer: any, accessToken: string | undefined, expiresIn: number = 3600, tokenType: string = 'Bearer';
      
      // Cast response to any to handle different API response structures
      const anyResponse = response as any;
      
      // Check if response has the expected structure
      if (response.customer && response.accessToken) {
        customer = response.customer;
        accessToken = response.accessToken;
        expiresIn = response.expiresIn || 3600;
        tokenType = response.tokenType || 'Bearer';
      }
      // Check if response is the customer object directly (alternative structure)
      else if (anyResponse.id && anyResponse.email && anyResponse.fullName) {
        customer = anyResponse;
        accessToken = anyResponse.token || anyResponse.accessToken;
        expiresIn = anyResponse.expiresIn || 3600; // default 1 hour
        tokenType = anyResponse.tokenType || 'Bearer';
      }
      // Check if response has a different structure (e.g., { success: true, data: {...}, token: "..." })
      else if (anyResponse.success && anyResponse.data) {
        customer = anyResponse.data;
        accessToken = anyResponse.token || anyResponse.accessToken;
        expiresIn = anyResponse.expiresIn || 3600;
        tokenType = anyResponse.tokenType || 'Bearer';
      }
      
      if (customer && accessToken) {
        const user: User = {
          id: customer.id,
          email: customer.email,
          name: customer.fullName,
          createdAt: customer.createdAt,
        };
        
        setUser(user);
        setCurrentUser(user);
        
        // Save token with expiration
        tokenService.saveToken(
          accessToken, 
          expiresIn, 
          tokenType
        );
        
        setLoading(false);
        return true;
      }
      
      // Debug: Log why login failed
      console.log('Login failed - missing required fields in response');
      setLoading(false);
      return false;
    } catch (error: any) {
      console.error('Login failed:', error);
      
      let errorMessage = 'Login failed';
      
      // Handle specific HTTP status codes
      if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response?.status === 502) {
        errorMessage = 'Service temporarily unavailable. Please try again later.';
      } else if (error.response?.status === 503) {
        errorMessage = 'Service unavailable. Please try again later.';
      } else if (error.response?.status === 504) {
        errorMessage = 'Request timeout. Please try again later.';
      } else if (!navigator.onLine) {
        errorMessage = 'No internet connection. Please check your connection and try again.';
      } else {
        errorMessage = error.message || 'Network error. Please try again later.';
      }
      
      setError(errorMessage);
      setLoading(false);
      
      // Do not fallback to local storage - return false for any API error
      return false;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      setError(null);
      setLoading(true);
      
      await apiService.register({ 
        fullName: name, 
        email, 
        password 
      });
      
      // Registration successful (201) - don't auto-login
      setLoading(false);
      return { 
        success: true, 
        message: 'Registration successful! Please login with your credentials.' 
      };
    } catch (error: any) {
      console.error('Registration failed:', error);
      setLoading(false);
      
      let errorMessage = 'Registration failed';
      
      if (error.response?.status === 400) {
        errorMessage = error.response.data?.error || 'Invalid input or email already exists';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = error.message || 'Registration failed';
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    setUser(null);
    setCurrentUser(null);
    tokenService.removeToken();
    
    // Clear any existing timeouts
    if ((window as any).tokenExpirationTimeout) {
      clearTimeout((window as any).tokenExpirationTimeout);
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<{ success: boolean; message?: string; error?: string }> => {
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare data for API call - map User fields to API fields
      const profileData: any = {};
      if (userData.name !== undefined) profileData.fullName = userData.name;
      if (userData.email !== undefined) profileData.email = userData.email;
      if (userData.company !== undefined) profileData.company = userData.company;
      if (userData.phone !== undefined) profileData.phoneNumber = userData.phone;
      if (userData.address !== undefined) profileData.address = userData.address;

      // Only call API if there's actual profile data to update (exclude customers array)
      if (Object.keys(profileData).length > 0) {
        const response = await apiService.updateProfile(user.id, profileData);
        
        // Update user with API response
        const updatedUser = {
          ...user,
          name: response.fullName || user.name,
          email: response.email || user.email,
          company: response.company || user.company,
          phone: response.phoneNumber || user.phone,
          address: response.address || user.address,
          updatedAt: response.updatedAt,
        };
        
        setUser(updatedUser);
        setCurrentUser(updatedUser);
        
        // Also update local storage for offline fallback
        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
          users[userIndex] = updatedUser;
          saveUser(users);
        }
        
        setLoading(false);
        return { success: true, message: 'Profile updated successfully!' };
      } else {
        // If no profile data to update, just update locally (for customers array, etc.)
        const updatedUser = { ...user, ...userData };
        console.log('AuthContext: Updating user with new data, customers:', updatedUser.customers?.length || 0);
        setUser(updatedUser);
        setCurrentUser(updatedUser);
        
        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
          users[userIndex] = updatedUser;
          saveUser(users);
        }
        
        setLoading(false);
        return { success: true, message: 'Data updated successfully!' };
      }
    } catch (error: any) {
      console.error('Profile update failed:', error);
      setLoading(false);
      
      let errorMessage = 'Profile update failed';
      
      if (error.response?.status === 400) {
        errorMessage = error.response.data?.error || 'Invalid input data';
      } else if (error.response?.status === 404) {
        errorMessage = 'Customer not found';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = error.message || 'Profile update failed';
      }
      
      setError(errorMessage);
      
      // Fallback to local storage update
      const updatedUser = { ...user, ...userData };
      const users = getUsers();
      const userIndex = users.findIndex(u => u.id === user.id);
      
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        saveUser(users);
        setUser(updatedUser);
        setCurrentUser(updatedUser);
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const fetchUserProfile = useCallback(async (): Promise<{ success: boolean; message?: string; error?: string }> => {
    const currentUser = getCurrentUser(); // Get fresh user data from storage
    if (!currentUser?.id) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getProfile(currentUser.id);
      
      // Update user with API response - map API fields to User fields
      const updatedUser: User = {
        ...currentUser,
        id: response.id,
        name: response.fullName,
        email: response.email,
        company: response.company || '',
        phone: response.phoneNumber || '',
        address: response.address || '',
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
        customers: response.sampleProviders?.map((provider) => ({
          id: provider.id,
          name: provider.samplerName,
          phoneNumber: provider.phoneNumber,
          location: provider.location,
          coordinates: provider.coordinates,
        })) || [],
      };
      
      setUser(updatedUser);
      setCurrentUser(updatedUser);
      
      // Also update local storage
      const users = getUsers();
      const userIndex = users.findIndex(u => u.id === currentUser.id);
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        saveUser(users);
      }
      
      setLoading(false);
      return { success: true, message: 'Profile loaded successfully!' };
    } catch (error: any) {
      console.error('Profile fetch failed:', error);
      setLoading(false);
      
      let errorMessage = 'Failed to load profile';
      
      if (error.response?.status === 404) {
        errorMessage = 'Customer not found';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = error.message || 'Failed to load profile';
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []); // Empty dependency array since we get fresh user data inside the function

  const sendVerificationEmail = async (email: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await apiService.sendVerificationEmail(email);
      
      setLoading(false);
      return { 
        success: response.success, 
        message: response.message 
      };
    } catch (error: any) {
      console.error('Send verification email failed:', error);
      setLoading(false);
      
      let errorMessage = 'Failed to send verification email';
      
      if (error.response?.status === 400) {
        errorMessage = error.response.data?.error || 'Invalid email address';
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many requests. Please wait before requesting another code.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = error.message || 'Failed to send verification email';
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const verifyEmail = async (email: string, code: string): Promise<{ success: boolean; verified?: boolean; message?: string; error?: string }> => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await apiService.verifyEmail(email, code);
      
      setLoading(false);
      return { 
        success: response.success,
        verified: response.verified,
        message: response.message 
      };
    } catch (error: any) {
      console.error('Email verification failed:', error);
      setLoading(false);
      
      let errorMessage = 'Email verification failed';
      
      if (error.response?.status === 400) {
        errorMessage = error.response.data?.error || 'Invalid verification code';
      } else if (error.response?.status === 404) {
        errorMessage = 'Verification code not found or expired';
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many verification attempts. Please request a new code.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = error.message || 'Email verification failed';
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    fetchUserProfile,
    sendVerificationEmail,
    verifyEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};