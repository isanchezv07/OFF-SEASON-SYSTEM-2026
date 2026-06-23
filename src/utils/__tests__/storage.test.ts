import { saveConfig, loadConfig, clearConfig, onConfigChange, SystemConfig } from '../storage';

describe('storage', () => {
  const mockConfig: SystemConfig = {
    totalTeams: 50,
    alliances: [
      {
        id: '1',
        name: 'Alliance 1',
        maxTeams: 4,
        teams: [1, 2, 3, 4],
        color: 'red'
      }
    ],
    lastUpdated: Date.now()
  };

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  describe('saveConfig', () => {
    it('debería guardar la configuración en localStorage', () => {
      saveConfig(mockConfig);
      
      const stored = localStorage.getItem('alliance_system_config');
      expect(stored).toBeTruthy();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.totalTeams).toBe(mockConfig.totalTeams);
      expect(parsed.alliances).toEqual(mockConfig.alliances);
      expect(parsed.lastUpdated).toBeDefined();
    });

    it('debería guardar la configuración en sessionStorage', () => {
      saveConfig(mockConfig);
      
      const stored = sessionStorage.getItem('alliance_system_config');
      expect(stored).toBeTruthy();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.totalTeams).toBe(mockConfig.totalTeams);
    });

    it('debería agregar un timestamp al guardar', () => {
      const beforeSave = Date.now();
      saveConfig(mockConfig);
      const afterSave = Date.now();
      
      const stored = localStorage.getItem('alliance_system_config');
      const parsed = JSON.parse(stored!);
      
      expect(parsed.lastUpdated).toBeGreaterThanOrEqual(beforeSave);
      expect(parsed.lastUpdated).toBeLessThanOrEqual(afterSave);
    });
  });

  describe('loadConfig', () => {
    it('debería cargar la configuración desde sessionStorage primero', () => {
      const sessionConfig = { ...mockConfig, totalTeams: 100 };
      sessionStorage.setItem('alliance_system_config', JSON.stringify(sessionConfig));
      localStorage.setItem('alliance_system_config', JSON.stringify(mockConfig));
      
      const loaded = loadConfig();
      
      expect(loaded?.totalTeams).toBe(100);
    });

    it('debería cargar desde localStorage si no hay en sessionStorage', () => {
      localStorage.setItem('alliance_system_config', JSON.stringify(mockConfig));
      
      const loaded = loadConfig();
      
      expect(loaded).toEqual(expect.objectContaining({
        totalTeams: mockConfig.totalTeams,
        alliances: mockConfig.alliances
      }));
    });

    it('debería retornar null si no hay configuración guardada', () => {
      const loaded = loadConfig();
      
      expect(loaded).toBeNull();
    });

    it('debería manejar errores de parsing correctamente', () => {
      localStorage.setItem('alliance_system_config', 'invalid json');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const loaded = loadConfig();
      
      expect(loaded).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('clearConfig', () => {
    it('debería eliminar la configuración de localStorage', () => {
      localStorage.setItem('alliance_system_config', JSON.stringify(mockConfig));
      sessionStorage.setItem('alliance_system_config', JSON.stringify(mockConfig));
      
      clearConfig();
      
      expect(localStorage.getItem('alliance_system_config')).toBeNull();
      expect(sessionStorage.getItem('alliance_system_config')).toBeNull();
    });

    it('debería eliminar la configuración de sessionStorage', () => {
      sessionStorage.setItem('alliance_system_config', JSON.stringify(mockConfig));
      
      clearConfig();
      
      expect(sessionStorage.getItem('alliance_system_config')).toBeNull();
    });
  });

  describe('onConfigChange', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('debería llamar al callback cuando hay un cambio en storage', () => {
      const callback = jest.fn();
      const unsubscribe = onConfigChange(callback);
      
      const storageEvent = new StorageEvent('storage', {
        key: 'alliance_system_config',
        newValue: JSON.stringify(mockConfig)
      });
      
      window.dispatchEvent(storageEvent);
      
      expect(callback).toHaveBeenCalledWith(mockConfig);
      
      unsubscribe();
    });

    it('debería llamar al callback cuando la ventana recibe focus', () => {
      const callback = jest.fn();
      saveConfig(mockConfig);
      
      const unsubscribe = onConfigChange(callback);
      
      window.dispatchEvent(new Event('focus'));
      
      expect(callback).toHaveBeenCalled();
      
      unsubscribe();
    });

    it('debería hacer polling cada segundo', () => {
      const callback = jest.fn();
      const unsubscribe = onConfigChange(callback);
      
      jest.advanceTimersByTime(1000);
      
      expect(callback).toHaveBeenCalled();
      
      unsubscribe();
    });

    it('debería limpiar los event listeners al desuscribirse', () => {
      const callback = jest.fn();
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      const unsubscribe = onConfigChange(callback);
      
      unsubscribe();
      
      expect(removeEventListenerSpy).toHaveBeenCalled();
      
      removeEventListenerSpy.mockRestore();
    });

    it('debería limpiar el intervalo al desuscribirse', () => {
      const callback = jest.fn();
      const unsubscribe = onConfigChange(callback);
      
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      
      unsubscribe();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
      
      clearIntervalSpy.mockRestore();
    });

    it('no debería llamar al callback si el key no coincide', () => {
      const callback = jest.fn();
      const unsubscribe = onConfigChange(callback);
      
      const storageEvent = new StorageEvent('storage', {
        key: 'other_key',
        newValue: JSON.stringify(mockConfig)
      });
      
      window.dispatchEvent(storageEvent);
      
      expect(callback).not.toHaveBeenCalled();
      
      unsubscribe();
    });
  });
});
