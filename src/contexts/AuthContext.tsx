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
      const response = await apiService.login({ email, password });
      
      if (response.customer && response.accessToken) {
        const user: User = {
          id: response.customer.id,
          email: response.customer.email,
          name: response.customer.fullName,
          createdAt: response.customer.createdAt,
        };
        
        setUser(user);
        setCurrentUser(user);
        
        // Save token with expiration
        tokenService.saveToken(
          response.accessToken, 
          response.expiresIn, 
          response.tokenType
        );
        
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Login failed:', error);
      
      let errorMessage = 'Login failed';
      
      if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = error.message || 'Login failed';
      }
      
      setError(errorMessage);
      
      // Fallback to local storage for development/demo purposes
      const users = getUsers();
      const foundUser = users.find(u => u.email === email);
      
      if (foundUser) {
        setUser(foundUser);
        setCurrentUser(foundUser);
        return true;
      }
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

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    fetchUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};