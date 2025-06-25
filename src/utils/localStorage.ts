import { User, Sample, TestReport } from '../types';

const KEYS = {
  USERS: 'nsp_labs_users',
  SAMPLES: 'nsp_labs_samples',
  REPORTS: 'nsp_labs_reports',
  CURRENT_USER: 'nsp_labs_current_user',
};

// User management
export const saveUser = (users: User[]): void => {
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
};

export const getUsers = (): User[] => {
  const users = localStorage.getItem(KEYS.USERS);
  return users ? JSON.parse(users) : [];
};

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(KEYS.CURRENT_USER);
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(KEYS.CURRENT_USER);
  }
};

// Sample management
export const saveSamples = (samples: Sample[]): void => {
  localStorage.setItem(KEYS.SAMPLES, JSON.stringify(samples));
};

export const getSamples = (): Sample[] => {
  const samples = localStorage.getItem(KEYS.SAMPLES);
  return samples ? JSON.parse(samples) : [];
};

export const getUserSamples = (userId: string): Sample[] => {
  return getSamples().filter(sample => sample.userId === userId);
};

// Report management
export const saveReports = (reports: TestReport[]): void => {
  localStorage.setItem(KEYS.REPORTS, JSON.stringify(reports));
};

export const getReports = (): TestReport[] => {
  const reports = localStorage.getItem(KEYS.REPORTS);
  return reports ? JSON.parse(reports) : [];
};

export const getUserReports = (userId: string): TestReport[] => {
  return getReports().filter(report => report.userId === userId);
};

// Auto-progression system
export const updateSampleStatus = (sampleId: string, newStatus: Sample['status'], agentId?: string): void => {
  const samples = getSamples();
  const sampleIndex = samples.findIndex(s => s.id === sampleId);
  
  if (sampleIndex !== -1) {
    samples[sampleIndex].status = newStatus;
    if (agentId) {
      samples[sampleIndex].agentId = agentId;
    }
    
    // Update stage progress based on status
    switch (newStatus) {
      case 'agent-assigned':
        samples[sampleIndex].currentStage = 1;
        samples[sampleIndex].stageProgress = { stage1: true, stage2: false, stage3: false };
        break;
      case 'testing':
        samples[sampleIndex].currentStage = 2;
        samples[sampleIndex].stageProgress = { stage1: true, stage2: true, stage3: false };
        break;
      case 'completed':
        samples[sampleIndex].currentStage = 3;
        samples[sampleIndex].stageProgress = { stage1: true, stage2: true, stage3: true };
        break;
    }
    
    saveSamples(samples);
  }
};

export const createTestReport = (sample: Sample): void => {
  const reports = getReports();
  const isSuccess = Math.random() > 0.3; // 70% success rate for demo
  
  const newReport: TestReport = {
    id: Date.now().toString(),
    sampleId: sample.id,
    userId: sample.userId,
    result: isSuccess ? 'success' : 'failure',
    completedAt: new Date().toISOString(),
    details: {
      initialInspection: isSuccess 
        ? 'Sample shows excellent physical condition with no visible abnormalities. Color, texture, and size are within expected parameters.'
        : 'Sample shows signs of stress with some discoloration. Physical condition requires attention.',
      labResults: {
        viralScreening: isSuccess ? 'Negative for WSSV, IHHNV, TSV' : 'Positive for WSSV - requires treatment',
        bacterialAnalysis: isSuccess ? 'Within acceptable limits' : 'Elevated bacterial count detected',
        parasiteCheck: isSuccess ? 'Clear' : 'Parasites detected - treatment recommended',
        geneticMarkers: `Confirmed ${sample.category}`,
        waterQuality: isSuccess ? 'Optimal' : 'Suboptimal - pH adjustment needed'
      },
      finalReview: isSuccess 
        ? `Sample meets all quality standards for ${sample.subCategory || 'general'} certification. Recommended for breeding/harvesting programs.`
        : `Sample does not meet quality standards. Immediate intervention required to address identified issues.`,
      certification: isSuccess ? `NSP-CERT-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}` : undefined
    }
  };
  
  reports.push(newReport);
  saveReports(reports);
};

// Get agent names for assignment
export const getRandomAgent = (): string => {
  const agents = [
    'Dr. Sarah Martinez',
    'Dr. Michael Chen',
    'Dr. Emily Rodriguez',
    'Dr. James Wilson',
    'Dr. Lisa Thompson',
    'Dr. David Kim'
  ];
  return agents[Math.floor(Math.random() * agents.length)];
};

// Initialize with mock data
export const initializeMockData = (): void => {
  if (!localStorage.getItem(KEYS.USERS)) {
    const mockUsers: User[] = [
      {
        id: '1',
        email: 'john@example.com',
        name: 'John Smith',
        company: 'Coastal Aquaculture Ltd.',
        phone: '+1-555-0123',
        address: '123 Harbor Drive, Miami, FL 33101',
        createdAt: '2024-01-15T10:30:00Z',
      }
    ];
    saveUser(mockUsers);
  }

  if (!localStorage.getItem(KEYS.SAMPLES)) {
    const mockSamples: Sample[] = [
      {
        id: '1',
        userId: '1',
        location: 'Miami Bay Farm #3',
        category: 'Pacific White Shrimp',
        subCategory: 'Adult Breeding Stock',
        contactInfo: 'john@example.com',
        submittedAt: '2024-12-15T09:15:00Z',
        status: 'completed',
        agentId: 'Dr. Sarah Martinez',
        currentStage: 3,
        stageProgress: { stage1: true, stage2: true, stage3: true }
      },
      {
        id: '2',
        userId: '1',
        location: 'Gulf Coast Farm #1',
        category: 'Tiger Shrimp',
        subCategory: 'Juvenile Stock',
        contactInfo: 'john@example.com',
        submittedAt: '2024-12-18T14:20:00Z',
        status: 'testing',
        agentId: 'Dr. Michael Chen',
        currentStage: 2,
        stageProgress: { stage1: true, stage2: false, stage3: false }
      }
    ];
    saveSamples(mockSamples);
  }

  if (!localStorage.getItem(KEYS.REPORTS)) {
    const mockReports: TestReport[] = [
      {
        id: '1',
        sampleId: '1',
        userId: '1',
        result: 'success',
        completedAt: '2024-12-20T16:45:00Z',
        details: {
          initialInspection: 'Sample shows excellent physical condition with no visible abnormalities.',
          labResults: {
            viralScreening: 'Negative for WSSV, IHHNV, TSV',
            bacterialAnalysis: 'Within acceptable limits',
            parasiteCheck: 'Clear',
            geneticMarkers: 'Confirmed Pacific White Shrimp (L. vannamei)',
            waterQuality: 'Optimal'
          },
          finalReview: 'Sample meets all quality standards for breeding stock certification.',
          certification: 'NSP-CERT-2024-001'
        }
      }
    ];
    saveReports(mockReports);
  }
};