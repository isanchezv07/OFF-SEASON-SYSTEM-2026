import { renderHook, act } from '@testing-library/react';
import { useAllianceManager } from '../useAllianceManager';
import { saveConfig, loadConfig, clearConfig } from '../../utils/storage';

// Mock del módulo storage
jest.mock('../../utils/storage', () => ({
  saveConfig: jest.fn(),
  loadConfig: jest.fn(),
  clearConfig: jest.fn(),
}));

describe('useAllianceManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (loadConfig as jest.Mock).mockReturnValue(null);
  });

  describe('inicialización', () => {
    it('debería inicializar con equipos del 1 al totalTeams', () => {
      const { result } = renderHook(() => useAllianceManager(10));
      
      expect(result.current.teams).toHaveLength(10);
      expect(result.current.teams[0].number).toBe(1);
      expect(result.current.teams[9].number).toBe(10);
      expect(result.current.teams.every(t => !t.isAssigned)).toBe(true);
    });

    it('debería inicializar con alianzas vacías si no hay configuración guardada', () => {
      const { result } = renderHook(() => useAllianceManager(10));
      
      expect(result.current.alliances).toEqual([]);
    });

    it('debería cargar configuración guardada si existe', () => {
      const savedConfig = {
        totalTeams: 10,
        alliances: [
          {
            id: '1',
            name: 'Alliance 1',
            maxTeams: 4,
            teams: [1, 2],
            color: 'red'
          }
        ],
        lastUpdated: Date.now()
      };
      
      (loadConfig as jest.Mock).mockReturnValue(savedConfig);
      
      const { result } = renderHook(() => useAllianceManager(10));
      
      expect(result.current.alliances).toHaveLength(1);
      expect(result.current.teams[0].isAssigned).toBe(true);
      expect(result.current.teams[1].isAssigned).toBe(true);
    });
  });

  describe('createAlliance', () => {
    it('debería crear una nueva alianza', () => {
      const { result } = renderHook(() => useAllianceManager(10));
      
      act(() => {
        result.current.createAlliance('Nueva Alianza', 4);
      });
      
      expect(result.current.alliances).toHaveLength(1);
      expect(result.current.alliances[0].name).toBe('Nueva Alianza');
      expect(result.current.alliances[0].maxTeams).toBe(4);
      expect(result.current.alliances[0].teams).toEqual([]);
      expect(saveConfig).toHaveBeenCalled();
    });

    it('debería asignar un color automáticamente', () => {
      const { result } = renderHook(() => useAllianceManager(10));
      
      act(() => {
        result.current.createAlliance('Alliance 1', 4);
      });
      
      expect(result.current.alliances[0].color).toBeDefined();
    });

    it('debería rotar colores para múltiples alianzas', () => {
      const { result } = renderHook(() => useAllianceManager(10));
      
      act(() => {
        result.current.createAlliance('Alliance 1', 4);
      });
      
      act(() => {
        result.current.createAlliance('Alliance 2', 4);
      });
      
      expect(result.current.alliances[0].color).not.toBe(result.current.alliances[1].color);
    });
  });

  describe('updateAlliance', () => {
    it('debería actualizar una alianza existente', () => {
      const { result } = renderHook(() => useAllianceManager(10));
      
      act(() => {
        result.current.createAlliance('Alliance 1', 4);
      });
      
      const allianceId = result.current.alliances[0].id;
      
      act(() => {
        result.current.updateAlliance({
          ...result.current.alliances[0],
          name: 'Updated Alliance'
        });
      });
      
      expect(result.current.alliances[0].name).toBe('Updated Alliance');
      expect(saveConfig).toHaveBeenCalled();
    });
  });

  describe('deleteAlliance', () => {
    it('debería eliminar una alianza', () => {
      const { result } = renderHook(() => useAllianceManager(10));
      
      act(() => {
        result.current.createAlliance('Alliance 1', 4);
      });
      
      const allianceId = result.current.alliances[0].id;
      
      act(() => {
        result.current.deleteAlliance(allianceId);
      });
      
      expect(result.current.alliances).toHaveLength(0);
      expect(saveConfig).toHaveBeenCalled();
    });

    it('debería liberar los equipos asignados a la alianza eliminada', () => {
      const { result } = renderHook(() => useAllianceManager(10));
      
      act(() => {
        result.current.createAlliance('Alliance 1', 4);
      });
      
      const allianceId = result.current.alliances[0]?.id;
      expect(allianceId).toBeDefined();
      
      act(() => {
        result.current.toggleTeamSelection(1);
        result.current.toggleTeamSelection(2);
      });
      
      expect(result.current.selectedTeams).toContain(1);
      expect(result.current.selectedTeams).toContain(2);
      
      act(() => {
        result.current.addSelectedTeamsToAlliance(allianceId!);
      });
      
      expect(result.current.teams[0].isAssigned).toBe(true);
      expect(result.current.teams[1].isAssigned).toBe(true);
      
      act(() => {
        result.current.deleteAlliance(allianceId!);
      });
      
      expect(result.current.teams[0].isAssigned).toBe(false);
      expect(result.current.teams[1].isAssigned).toBe(false);
    });
  });

  describe('toggleTeamSelection', () => {
    it('debería agregar un equipo a la selección', () => {
      const { result } = renderHook(() => useAllianceManager(10));
      
      act(() => {
        result.current.toggleTeamSelection(5);
      });
      
      expect(result.current.selectedTeams).toContain(5);
    });

    it('debería remover un equipo de la selección si ya está seleccionado', () => {
      const { result } = renderHook(() => useAllianceManager(10));
      
      act(() => {
        result.current.toggleTeamSelection(5);
        result.current.toggleTeamSelection(5);
      });
      
      expect(result.current.selectedTeams).not.toContain(5);
    });
  });

  describe('addSelectedTeamsToAlliance', () => {
    it('debería agregar equipos seleccionados a una alianza', () => {
      const { result } = renderHook(() => useAllianceManager(10));
      
      act(() => {
        result.current.createAlliance('Alliance 1', 4);
      });
      
      const allianceId = result.current.alliances[0]?.id;
      expect(allianceId).toBeDefined();
      
      act(() => {
        result.current.toggleTeamSelection(1);
        result.current.toggleTeamSelection(2);
      });
      
      expect(result.current.selectedTeams.length).toBe(2);
      
      act(() => {
        result.current.addSelectedTeamsToAlliance(allianceId!);
      });
      
      expect(result.current.alliances[0].teams).toContain(1);
      expect(result.current.alliances[0].teams).toContain(2);
      expect(result.current.teams[0].isAssigned).toBe(true);
      expect(result.current.teams[1].isAssigned).toBe(true);
      expect(result.current.selectedTeams).toHaveLength(0);
    });

    it('no debería agregar más equipos que el máximo permitido', () => {
      const { result } = renderHook(() => useAllianceManager(10));
      
      act(() => {
        result.current.createAlliance('Alliance 1', 2);
      });
      
      const allianceId = result.current.alliances[0]?.id;
      expect(allianceId).toBeDefined();
      
      act(() => {
        result.current.toggleTeamSelection(1);
        result.current.toggleTeamSelection(2);
        result.current.toggleTeamSelection(3);
        result.current.toggleTeamSelection(4);
        result.current.addSelectedTeamsToAlliance(allianceId!);
      });
      
      expect(result.current.alliances[0].teams.length).toBeLessThanOrEqual(2);
    });
  });

  describe('removeTeamFromAlliance', () => {
    it('debería remover un equipo de una alianza', () => {
      const { result } = renderHook(() => useAllianceManager(10));
      
      act(() => {
        result.current.createAlliance('Alliance 1', 4);
      });
      
      const allianceId = result.current.alliances[0]?.id;
      expect(allianceId).toBeDefined();
      
      act(() => {
        result.current.toggleTeamSelection(1);
        result.current.addSelectedTeamsToAlliance(allianceId!);
      });
      
      act(() => {
        result.current.removeTeamFromAlliance(allianceId!, 1);
      });
      
      expect(result.current.alliances[0].teams).not.toContain(1);
      expect(result.current.teams[0].isAssigned).toBe(false);
    });
  });

  describe('clearAllSelections', () => {
    it('debería limpiar todas las selecciones', () => {
      const { result } = renderHook(() => useAllianceManager(10));
      
      act(() => {
        result.current.toggleTeamSelection(1);
        result.current.toggleTeamSelection(2);
        result.current.toggleTeamSelection(3);
      });
      
      expect(result.current.selectedTeams.length).toBe(3);
      
      act(() => {
        result.current.clearAllSelections();
      });
      
      expect(result.current.selectedTeams.length).toBe(0);
    });
  });

  describe('actualización de equipos cuando cambia totalTeams', () => {
    it('debería actualizar la lista de equipos cuando cambia totalTeams', () => {
      const { result, rerender } = renderHook(
        ({ totalTeams }) => useAllianceManager(totalTeams),
        { initialProps: { totalTeams: 10 } }
      );
      
      expect(result.current.teams).toHaveLength(10);
      
      rerender({ totalTeams: 20 });
      
      expect(result.current.teams).toHaveLength(20);
    });

    it('debería mantener las asignaciones existentes si los equipos aún existen', () => {
      const { result, rerender } = renderHook(
        ({ totalTeams }) => useAllianceManager(totalTeams),
        { initialProps: { totalTeams: 10 } }
      );
      
      act(() => {
        result.current.createAlliance('Alliance 1', 4);
      });
      
      const allianceId = result.current.alliances[0]?.id;
      expect(allianceId).toBeDefined();
      
      act(() => {
        result.current.toggleTeamSelection(1);
      });
      
      act(() => {
        result.current.addSelectedTeamsToAlliance(allianceId!);
      });
      
      expect(result.current.teams[0].isAssigned).toBe(true);
      
      rerender({ totalTeams: 20 });
      
      expect(result.current.teams[0].isAssigned).toBe(true);
    });
  });
});
