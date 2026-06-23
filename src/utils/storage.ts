export interface AllianceData {
  id: string;
  name: string;
  maxTeams: number;
  teams: number[];
  color: string;
}

export interface SystemConfig {
  totalTeams: number;
  alliances: AllianceData[];
  lastUpdated: number;
}

const STORAGE_KEY = 'alliance_system_config';

export const saveConfig = (config: SystemConfig): void => {
  const configWithTimestamp = {
    ...config,
    lastUpdated: Date.now()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configWithTimestamp));
  
  // También guardamos en sessionStorage para sincronización entre pestañas
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(configWithTimestamp));
};

export const loadConfig = (): SystemConfig | null => {
  try {
    // Primero intentamos sessionStorage (más reciente)
    let stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Si no hay en session, usamos localStorage
      stored = localStorage.getItem(STORAGE_KEY);
    }
    
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading config:', error);
  }
  return null;
};

export const clearConfig = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
};

// Función para escuchar cambios en tiempo real
export const onConfigChange = (callback: (config: SystemConfig | null) => void): (() => void) => {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      const newConfig = e.newValue ? JSON.parse(e.newValue) : null;
      callback(newConfig);
    }
  };

  const handleSessionStorageChange = () => {
    const config = loadConfig();
    callback(config);
  };

  window.addEventListener('storage', handleStorageChange);
  window.addEventListener('focus', handleSessionStorageChange);
  
  // Polling para cambios más frecuentes
  const interval = setInterval(handleSessionStorageChange, 1000);

  return () => {
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener('focus', handleSessionStorageChange);
    clearInterval(interval);
  };
};