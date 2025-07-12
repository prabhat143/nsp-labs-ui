import React, { createContext, useContext, useState } from 'react';

// Context type
type RealtimeContextType = {
  isRealtime: boolean;
  setIsRealtime: (val: boolean) => void;
};

const RealtimeContext = createContext<RealtimeContextType>({
  isRealtime: false,
  setIsRealtime: () => {},
});

export const useRealtime = () => useContext(RealtimeContext);

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isRealtime, setIsRealtime] = useState(false);
  return (
    <RealtimeContext.Provider value={{ isRealtime, setIsRealtime }}>
      {children}
    </RealtimeContext.Provider>
  );
};
