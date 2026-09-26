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

// Read from Expo public environment variable if available
const ENV_API_KEY = process.env.EXPO_PUBLIC_VIRUSTOTAL_API_KEY || '';

const AppModeContext = createContext<AppModeContextType>({
  isDemoMode: true,
  toggleDemoMode: async () => {},
  virusTotalApiKey: ENV_API_KEY,
  setVirusTotalApiKey: async () => {},
});

export function AppModeProvider({ children }: { children: React.ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [virusTotalApiKey, setVtApiKey] = useState<string>(ENV_API_KEY);

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
        } else if (ENV_API_KEY) {
          setVtApiKey(ENV_API_KEY);
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
