// API configuration for different environments
export const API_CONFIG = {
  development: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  },
  production: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://nsp-labs.com/api',
  },
};

// Get the current environment's API configuration
export const getApiConfig = () => {
  const environment = (import.meta.env.VITE_APP_ENV || import.meta.env.MODE) as 'development' | 'production';
  return API_CONFIG[environment] || API_CONFIG.development;
};

export const API_ENDPOINTS = {
  CUSTOMERS: {
    REGISTER: '/customers/register',
    LOGIN: '/customers/login',
    UPDATE_PROFILE: (id: string) => `/customers/${id}/profile`,
    GET_PROFILE: (id: string) => `/customers/${id}`,
    ADD_SAMPLE_PROVIDER: (id: string) => `/customers/${id}/sample-providers`,
    DELETE_SAMPLE_PROVIDER: (id: string, providerIndex: number) => `/customers/${id}/sample-providers/${providerIndex}`,
    DELETE_SAMPLE_PROVIDER_BY_ID: (id: string, providerId: string) => `/customers/${id}/sample-providers/${providerId}`,
    UPDATE_SAMPLE_PROVIDER: (id: string, providerIndex: number) => `/customers/${id}/sample-providers-simple/${providerIndex}`,
    UPDATE_SAMPLE_PROVIDER_BY_ID: (id: string, providerId: string) => `/customers/${id}/sample-providers/${providerId}`,
    GET_SAMPLE_PROVIDERS: (id: string) => `/customers/${id}/sample-providers`,
  },
  SAMPLES: {
    SUBMIT: '/sample-submissions',
  },
};
