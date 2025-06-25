export interface User {
  id: string;
  email: string;
  name: string;
  company?: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

export interface Sample {
  id: string;
  userId: string;
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

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}