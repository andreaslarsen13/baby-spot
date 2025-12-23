import React, { createContext, useContext, useState, ReactNode } from 'react';

type VersionState = Record<string, string>;

type VersionContextType = {
  versions: VersionState;
  setVersion: (componentName: string, version: string) => void;
  getVersion: (componentName: string, defaultVersion: string) => string;
};

const VersionContext = createContext<VersionContextType | undefined>(undefined);

export const VersionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [versions, setVersions] = useState<VersionState>({});

  const setVersion = (componentName: string, version: string) => {
    setVersions(prev => ({ ...prev, [componentName]: version }));
    // Persist to localStorage
    try {
      localStorage.setItem(`component-version-${componentName}`, version);
    } catch (error) {
      console.warn('Could not save version to localStorage:', error);
    }
  };

  const getVersion = (componentName: string, defaultVersion: string): string => {
    // Check localStorage first, then state, then default
    const stored = localStorage.getItem(`component-version-${componentName}`);
    return stored || versions[componentName] || defaultVersion;
  };

  // Load from localStorage on mount
  React.useEffect(() => {
    try {
      const stored: VersionState = {};
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('component-version-')) {
          const componentName = key.replace('component-version-', '');
          const value = localStorage.getItem(key);
          if (value) {
            stored[componentName] = value;
          }
        }
      });
      if (Object.keys(stored).length > 0) {
        setVersions(stored);
      }
    } catch (error) {
      // localStorage might not be available (SSR, private browsing, etc.)
      console.warn('Could not load versions from localStorage:', error);
    }
  }, []);

  return (
    <VersionContext.Provider value={{ versions, setVersion, getVersion }}>
      {children}
    </VersionContext.Provider>
  );
};

export const useVersion = () => {
  const context = useContext(VersionContext);
  if (!context) {
    // Fallback if context is not available
    return {
      versions: {},
      setVersion: () => {},
      getVersion: (_componentName: string, defaultVersion: string) => {
        // Try localStorage as fallback
        const stored = localStorage.getItem(`component-version-${_componentName}`);
        return stored || defaultVersion;
      },
    };
  }
  return context;
};

