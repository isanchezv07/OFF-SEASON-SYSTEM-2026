import { useState, useCallback } from 'react';
import { useEffect } from 'react';
import { Alliance, Team } from '../types/alliance';
import { saveConfig, loadConfig } from '../utils/storage';

const ALLIANCE_COLORS = [
  'from-red-400 to-red-600',
  'from-blue-400 to-blue-600',
  'from-green-400 to-green-600',
  'from-purple-400 to-purple-600',
  'from-yellow-400 to-yellow-600',
  'from-pink-400 to-pink-600',
  'from-indigo-400 to-indigo-600',
  'from-teal-400 to-teal-600',
];

export function useAllianceManager(totalTeams: number = 50) {
  // Initialize teams (1 to totalTeams)
  const [teams, setTeams] = useState<Team[]>(() => {
    const savedConfig = loadConfig();
    const teamArray = Array.from({ length: totalTeams }, (_, i) => ({
      number: i + 1,
      isAssigned: false,
      allianceId: undefined,
    }));

    if (savedConfig && savedConfig.totalTeams === totalTeams) {
      // Marcar equipos asignados basado en la configuración guardada
      savedConfig.alliances.forEach(alliance => {
        alliance.teams.forEach(teamNumber => {
          const team = teamArray.find(t => t.number === teamNumber);
          if (team) {
            team.isAssigned = true;
            team.allianceId = alliance.id;
          }
        });
      });
    }

    return teamArray;
  });

  const [alliances, setAlliances] = useState<Alliance[]>(() => {
    const savedConfig = loadConfig();
    return savedConfig && savedConfig.totalTeams === totalTeams ? savedConfig.alliances : [];
  });
  const [selectedTeams, setSelectedTeams] = useState<number[]>([]);

  // Actualizar equipos cuando cambie totalTeams
  useEffect(() => {
    const newTeams = Array.from({ length: totalTeams }, (_, i) => ({
      number: i + 1,
      isAssigned: false,
      allianceId: undefined,
    }));

    // Mantener asignaciones existentes si el equipo aún existe
    alliances.forEach(alliance => {
      alliance.teams.forEach(teamNumber => {
        if (teamNumber <= totalTeams) {
          const team = newTeams.find(t => t.number === teamNumber);
          if (team) {
            team.isAssigned = true;
            team.allianceId = alliance.id;
          }
        }
      });
    });

    setTeams(newTeams);
  }, [totalTeams, alliances]);

  // Función para guardar el estado actual
  const saveCurrentState = useCallback((newAlliances: Alliance[]) => {
    const config = {
      totalTeams,
      alliances: newAlliances,
      lastUpdated: Date.now()
    };
    saveConfig(config);
  }, [totalTeams]);
  const createAlliance = useCallback((name: string, maxTeams: number) => {
    const newAlliance: Alliance = {
      id: Date.now().toString(),
      name,
      maxTeams,
      teams: [],
      color: ALLIANCE_COLORS[alliances.length % ALLIANCE_COLORS.length],
    };
    const newAlliances = [...alliances, newAlliance];
    setAlliances(newAlliances);
    saveCurrentState(newAlliances);
  }, [alliances.length]);

  const updateAlliance = useCallback((updatedAlliance: Alliance) => {
    const newAlliances = alliances.map(alliance =>
      alliance.id === updatedAlliance.id ? updatedAlliance : alliance
    );
    setAlliances(newAlliances);
    saveCurrentState(newAlliances);
  }, [alliances, saveCurrentState]);

  const deleteAlliance = useCallback((allianceId: string) => {
    const alliance = alliances.find(a => a.id === allianceId);
    if (alliance) {
      // Free up the teams
      setTeams(prev =>
        prev.map(team =>
          alliance.teams.includes(team.number)
            ? { ...team, isAssigned: false, allianceId: undefined }
            : team
        )
      );
      
      const newAlliances = alliances.filter(a => a.id !== allianceId);
      setAlliances(newAlliances);
      saveCurrentState(newAlliances);
    }
  }, [alliances, saveCurrentState]);

  const toggleTeamSelection = useCallback((teamNumber: number) => {
    setSelectedTeams(prev =>
      prev.includes(teamNumber)
        ? prev.filter(t => t !== teamNumber)
        : [...prev, teamNumber]
    );
  }, []);

  const addSelectedTeamsToAlliance = useCallback((allianceId: string) => {
    const alliance = alliances.find(a => a.id === allianceId);
    if (!alliance) return;

    const availableSlots = alliance.maxTeams - alliance.teams.length;
    const teamsToAdd = selectedTeams.slice(0, availableSlots);

    // Update alliance
    const newAlliances = alliances.map(a =>
      a.id === allianceId
        ? { ...a, teams: [...a.teams, ...teamsToAdd] }
        : a
    );
    setAlliances(newAlliances);
    saveCurrentState(newAlliances);

    // Mark teams as assigned
    setTeams(prev =>
      prev.map(team =>
        teamsToAdd.includes(team.number)
          ? { ...team, isAssigned: true, allianceId }
          : team
      )
    );

    // Clear selections
    setSelectedTeams([]);
  }, [alliances, selectedTeams, saveCurrentState]);

  const removeTeamFromAlliance = useCallback((allianceId: string, teamNumber: number) => {
    // Update alliance
    const newAlliances = alliances.map(alliance =>
      alliance.id === allianceId
        ? { ...alliance, teams: alliance.teams.filter(t => t !== teamNumber) }
        : alliance
    );
    setAlliances(newAlliances);
    saveCurrentState(newAlliances);

    // Free up the team
    setTeams(prev =>
      prev.map(team =>
        team.number === teamNumber
          ? { ...team, isAssigned: false, allianceId: undefined }
          : team
      )
    );
  }, [alliances, saveCurrentState]);

  const clearAllSelections = useCallback(() => {
    setSelectedTeams([]);
  }, []);

  return {
    teams,
    alliances,
    selectedTeams,
    createAlliance,
    updateAlliance,
    deleteAlliance,
    toggleTeamSelection,
    addSelectedTeamsToAlliance,
    removeTeamFromAlliance,
    clearAllSelections,
  };
}