import { getApiConfig, API_ENDPOINTS } from '../config/api';
import { tokenService } from './tokenService';
import { SampleSubmission } from '../types';

export interface SampleProviderRequest {
  samplerName: string;
  phoneNumber: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

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
  sampleProviders?: SampleProvider[];
}

export interface SampleProvider {
  id: string;
  samplerName: string;
  userType: string | null;
  phoneNumber: string;
  altPhoneNumber?: string | null;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  farmers?: Array<{
    name: string;
    phoneNumber: string;
    altPhoneNumber?: string;
    location: string;
    coordinates?: {
      lat: number;
      lng: number;
    } | null;
  }> | null;
}

export interface AddSampleProviderRequest {
  samplerName: string;
  phoneNumber: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  userType?: string;
  altPhoneNumber?: string;
  farmers?: Array<{ name: string; phoneNumber: string; altPhoneNumber?: string; location: string }>;
}

export interface AddSampleProviderResponse {
  id: string;
  fullName: string;
  email: string;
  password: null;
  createdAt: string;
  updatedAt: string;
  company?: string;
  phoneNumber?: string;
  address?: string;
  sampleProviders: SampleProvider[];
}

export interface UpdateSampleProviderRequest {
  samplerName: string;
  phoneNumber: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  userType?: string;
  altPhoneNumber?: string;
  farmers?: Array<{ 
    name: string; 
    phoneNumber: string; 
    altPhoneNumber?: string; 
    location: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  }>;
}

export interface SampleSubmissionRequest {
  consumerId: string;
  samplerId: string;
  samplerName: string;
  samplerLocation: string;
  coordinate: {
    lat: number;
    lng: number;
  };
  shrimpCategory: string;
  shrimpSubCategory: string;
  phoneNumber: string;
  emailAddress?: string;
  status: string;
}

export interface SampleSubmissionResponse {
  id: string;
  message: string;
}

export interface SendVerificationEmailRequest {
  email: string;
}

export interface SendVerificationEmailResponse {
  success: boolean;
  message: string;
  expiresAt: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
  verified: boolean;
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

  async addSampleProvider(userId: string, sampleProviderData: AddSampleProviderRequest): Promise<AddSampleProviderResponse> {
    const token = tokenService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    return this.makeRequest<AddSampleProviderResponse>(API_ENDPOINTS.CUSTOMERS.ADD_SAMPLE_PROVIDER(userId), {
      method: 'POST',
      body: JSON.stringify(sampleProviderData),
    });
  }

  async deleteSampleProvider(customerId: string, providerIndex: number): Promise<void> {
    const token = tokenService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    await this.makeRequest<void>(API_ENDPOINTS.CUSTOMERS.DELETE_SAMPLE_PROVIDER(customerId, providerIndex), {
      method: 'DELETE',
    });
  }

  async deleteSampleProviderById(customerId: string, providerId: string): Promise<CustomerProfileResponse> {
    const token = tokenService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    return this.makeRequest<CustomerProfileResponse>(API_ENDPOINTS.CUSTOMERS.DELETE_SAMPLE_PROVIDER_BY_ID(customerId, providerId), {
      method: 'DELETE',
    });
  }

  async updateSampleProvider(userId: string, providerIndex: number, sampleProviderData: UpdateSampleProviderRequest): Promise<AddSampleProviderResponse> {
    const config = getApiConfig();
    const endpoint = API_ENDPOINTS.CUSTOMERS.UPDATE_SAMPLE_PROVIDER(userId, providerIndex);
    const token = tokenService.getToken();

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${config.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(sampleProviderData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async updateSampleProviderById(userId: string, providerId: string, sampleProviderData: UpdateSampleProviderRequest): Promise<CustomerProfileResponse> {
    const token = tokenService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    return this.makeRequest<CustomerProfileResponse>(API_ENDPOINTS.CUSTOMERS.UPDATE_SAMPLE_PROVIDER_BY_ID(userId, providerId), {
      method: 'PUT',
      body: JSON.stringify(sampleProviderData),
    });
  }

  async getSampleProviders(userId: string): Promise<SampleProvider[]> {
    const token = tokenService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    return this.makeRequest<SampleProvider[]>(API_ENDPOINTS.CUSTOMERS.GET_SAMPLE_PROVIDERS(userId), {
      method: 'GET',
    });
  }

  async submitSample(sampleData: SampleSubmissionRequest): Promise<SampleSubmissionResponse> {
    const token = tokenService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    return this.makeRequest<SampleSubmissionResponse>(API_ENDPOINTS.SAMPLES.SUBMIT, {
      method: 'POST',
      body: JSON.stringify(sampleData),
    });
  }

  async getSampleSubmissions(customerId: string): Promise<SampleSubmission[]> {
    const token = tokenService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    return this.makeRequest<SampleSubmission[]>(API_ENDPOINTS.SAMPLES.GET_BY_CONSUMER(customerId), {
      method: 'GET',
    });
  }

  async sendVerificationEmail(email: string): Promise<SendVerificationEmailResponse> {
    return this.makeRequest<SendVerificationEmailResponse>('/auth/send-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyEmail(email: string, code: string): Promise<VerifyEmailResponse> {
    return this.makeRequest<VerifyEmailResponse>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  }

  async resendVerificationEmail(email: string): Promise<SendVerificationEmailResponse> {
    return this.makeRequest<SendVerificationEmailResponse>('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }
}

export const apiService = new ApiService();
