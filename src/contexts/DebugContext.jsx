'use client';

import { createContext, useContext, useState } from 'react';

const DebugContext = createContext({});

export const useDebug = () => {
  const context = useContext(DebugContext);
  if (!context) {
    throw new Error('useDebug must be used within DebugProvider');
  }
  return context;
};

export function DebugProvider({ children }) {
  const [debugData, setDebugData] = useState({});
  const [isOpen, setIsOpen] = useState(true);

  const setDebug = (key, value) => {
    setDebugData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearDebug = () => setDebugData({});

  const value = {
    debugData,
    setDebug,
    clearDebug,
    isOpen,
    setIsOpen
  };

  return (
    <DebugContext.Provider value={value}>
      {children}
    </DebugContext.Provider>
  );
}
