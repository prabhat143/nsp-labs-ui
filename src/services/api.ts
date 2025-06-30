import { getApiConfig, API_ENDPOINTS } from '../config/api';
import { tokenService } from './tokenService';

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: string;
  fullName: string;
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  customer: {
    id: string;
    fullName: string;
    email: string;
    password: null;
    createdAt: string;
    updatedAt: string;
  };
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
  };
  token?: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  email?: string;
  company?: string;
  phoneNumber?: string;
  address?: string;
}

export interface UpdateProfileResponse {
  id: string;
  fullName: string;
  email: string;
  company?: string;
  phoneNumber?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerProfileResponse {
  id: string;
  fullName: string;
  email: string;
  password: null;
  createdAt: string;
  updatedAt: string;
  company?: string;
  phoneNumber?: string;
  address?: string;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = getApiConfig().baseURL;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get auth header if token exists
    const authHeader = tokenService.getAuthHeader();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // Try to parse error response
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `HTTP error! status: ${response.status}` };
        }
        
        const error = new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
        (error as any).response = { status: response.status, data: errorData };
        throw error;
      }

      return response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    return this.makeRequest<RegisterResponse>(API_ENDPOINTS.CUSTOMERS.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.makeRequest<LoginResponse>(API_ENDPOINTS.CUSTOMERS.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async updateProfile(userId: string, profileData: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    const token = tokenService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    return this.makeRequest<UpdateProfileResponse>(API_ENDPOINTS.CUSTOMERS.UPDATE_PROFILE(userId), {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getProfile(userId: string): Promise<CustomerProfileResponse> {
    const token = tokenService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    return this.makeRequest<CustomerProfileResponse>(API_ENDPOINTS.CUSTOMERS.GET_PROFILE(userId), {
      method: 'GET',
    });
  }
}

export const apiService = new ApiService();
