export interface Customer {
  id: string;
  name: string;
  phoneNumber: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt?: string;
  company?: string;
  phone?: string;
  address?: string;
  customers?: Customer[]; // Add this line to your User interface
}

export interface Sample {
  id: string;
  userId: string;
  customerId?: string;
  location: string;
  category: string;
  subCategory?: string;
  contactInfo: string;
  submittedAt: string;
  status: 'pending' | 'agent-assigned' | 'testing' | 'completed';
  agentId?: string;
  currentStage?: 1 | 2 | 3;
  stageProgress?: {
    stage1: boolean;
    stage2: boolean;
    stage3: boolean;
  };
}

export interface TestReport {
  id: string;
  sampleId: string;
  userId: string;
  result: 'success' | 'failure';
  completedAt: string;
  details: {
    initialInspection: string;
    labResults: Record<string, any>;
    finalReview: string;
    certification?: string;
  };
}

export interface SampleSubmission {
  id: string;
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
  emailAddress: string | null;
  status: 'PENDING' | 'PROCESSING' | 'TESTING' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
  assigned?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<{ success: boolean; message?: string; error?: string }>;
  fetchUserProfile: () => Promise<{ success: boolean; message?: string; error?: string }>;
}