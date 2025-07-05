import React, { createContext, useContext, ReactNode } from 'react';
import { SampleSubmission } from '../types';

interface SamplesContextType {
  samples: SampleSubmission[];
  loading: boolean;
  error: string | null;
}

const SamplesContext = createContext<SamplesContextType | undefined>(undefined);

export const useSamples = () => {
  const context = useContext(SamplesContext);
  if (!context) {
    throw new Error('useSamples must be used within a SamplesProvider');
  }
  return context;
};

interface SamplesProviderProps {
  children: ReactNode;
  samples: SampleSubmission[];
  loading: boolean;
  error: string | null;
}

export const SamplesProvider: React.FC<SamplesProviderProps> = ({
  children,
  samples,
  loading,
  error,
}) => {
  return (
    <SamplesContext.Provider value={{ samples, loading, error }}>
      {children}
    </SamplesContext.Provider>
  );
};
