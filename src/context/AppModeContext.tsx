import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AppModeContextType {
  isDemoMode: boolean;
  toggleDemoMode: () => Promise<void>;
  virusTotalApiKey: string;
  setVirusTotalApiKey: (key: string) => Promise<void>;
}

const STORAGE_KEY_DEMO_MODE = '@scamshield_is_demo_mode';
const STORAGE_KEY_VT_API_KEY = '@scamshield_vt_api_key';

const AppModeContext = createContext<AppModeContextType>({
  isDemoMode: true,
  toggleDemoMode: async () => {},
  virusTotalApiKey: '',
  setVirusTotalApiKey: async () => {},
});

export function AppModeProvider({ children }: { children: React.ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [virusTotalApiKey, setVtApiKey] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const storedMode = await AsyncStorage.getItem(STORAGE_KEY_DEMO_MODE);
        if (storedMode !== null) {
          setIsDemoMode(JSON.parse(storedMode));
        }
        const storedKey = await AsyncStorage.getItem(STORAGE_KEY_VT_API_KEY);
        if (storedKey) {
          setVtApiKey(storedKey);
        }
      } catch {
        // Fallback to default demo mode
      }
    })();
  }, []);

  const toggleDemoMode = async () => {
    const nextMode = !isDemoMode;
    setIsDemoMode(nextMode);
    await AsyncStorage.setItem(STORAGE_KEY_DEMO_MODE, JSON.stringify(nextMode));
  };

  const handleSetApiKey = async (key: string) => {
    setVtApiKey(key);
    await AsyncStorage.setItem(STORAGE_KEY_VT_API_KEY, key);
  };

  return (
    <AppModeContext.Provider 
      value={{ 
        isDemoMode, 
        toggleDemoMode, 
        virusTotalApiKey, 
        setVirusTotalApiKey: handleSetApiKey 
      }}
    >
      {children}
    </AppModeContext.Provider>
  );
}

export function useAppMode() {
  return useContext(AppModeContext);
}
