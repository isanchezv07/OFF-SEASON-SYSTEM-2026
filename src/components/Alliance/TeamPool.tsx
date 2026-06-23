import React from 'react';
import { Users, Hash } from 'lucide-react';
import { Team } from '../../types/alliance';

interface TeamPoolProps {
  teams: Team[];
  onTeamSelect: (teamNumber: number) => void;
  selectedTeams: number[];
  // Optional mapping from rank index (1-based) to actual teamId
  teamIdByIndex?: number[];
}

export default function TeamPool({ teams, onTeamSelect, selectedTeams, teamIdByIndex }: TeamPoolProps) {
  const availableTeams = teams.filter(team => !team.isAssigned);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          Equipos Disponibles ({availableTeams.length})
        </h2>
      </div>
      
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-60 overflow-y-auto">
        {availableTeams.map((team) => {
          const mappedTeamId = teamIdByIndex?.[team.number - 1];
          const displayId = (typeof mappedTeamId === 'number' ? mappedTeamId : team.number);
          return (
            <button
              key={team.number}
              onClick={() => onTeamSelect(team.number)}
              className={`
                relative flex items-center justify-center h-12 w-12 rounded-lg border-2 transition-all duration-200 hover:scale-105
                ${selectedTeams.includes(team.number)
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                  : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                }
              `}
            >
              <Hash className="h-3 w-3 absolute top-0.5 left-0.5 text-gray-400" />
              <div className="flex flex-col items-center gap-1">
                {typeof mappedTeamId === 'number' && (
                  <img
                    src={`/img/avatar/${mappedTeamId}.svg`}
                    className="w-5 h-5 object-cover rounded"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      if (target.src.endsWith('.svg')) target.src = `/img/avatar/${mappedTeamId}.png`;
                      else { (target as any).onerror = null; target.src = '/img/avatar/default.svg'; }
                    }}
                  />
                )}
                <span className="font-semibold text-xs">#{displayId}</span>
              </div>
            </button>
          );
        })}
      </div>
      
      {availableTeams.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>Todos los equipos han sido asignados</p>
        </div>
      )}
    </div>
  );
}