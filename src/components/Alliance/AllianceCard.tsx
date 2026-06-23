import React, { useState } from 'react';
import { Shield, Trash2, Edit3, Plus, X } from 'lucide-react';
import { Alliance } from '../../types/alliance';

interface AllianceCardProps {
  alliance: Alliance;
  onUpdateAlliance: (alliance: Alliance) => void;
  onDeleteAlliance: (id: string) => void;
  onRemoveTeam: (allianceId: string, teamNumber: number) => void;
  selectedTeams: number[];
  onAddSelectedTeams: (allianceId: string) => void;
  // Optional mapping from rank index (1-based) to actual teamId
  teamIdByIndex?: number[];
}

export default function AllianceCard({
  alliance,
  onUpdateAlliance,
  onDeleteAlliance,
  onRemoveTeam,
  selectedTeams,
  onAddSelectedTeams,
  teamIdByIndex
}: AllianceCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(alliance.name);

  const handleSaveName = () => {
    if (editName.trim()) {
      onUpdateAlliance({ ...alliance, name: editName.trim() });
      setIsEditing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      setEditName(alliance.name);
      setIsEditing(false);
    }
  };

  const canAddTeams = alliance.teams.length < alliance.maxTeams && selectedTeams.length > 0;
  const availableSlots = alliance.maxTeams - alliance.teams.length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className={`h-2 bg-gradient-to-r ${alliance.color}`}></div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 flex-1">
            <Shield className="h-5 w-5 text-gray-600" />
            {isEditing ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={handleKeyPress}
                className="flex-1 px-2 py-1 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            ) : (
              <h3 className="text-lg font-semibold text-gray-900 flex-1">{alliance.name}</h3>
            )}
          </div>
          
          <div className="flex gap-1">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDeleteAlliance(alliance.id)}
              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              Equipos: {alliance.teams.length}/{alliance.maxTeams}
            </span>
            {canAddTeams && (
              <button
                onClick={() => onAddSelectedTeams(alliance.id)}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
              >
                <Plus className="h-3 w-3" />
                Agregar ({Math.min(selectedTeams.length, availableSlots)})
              </button>
            )}
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full bg-gradient-to-r ${alliance.color} transition-all duration-300`}
              style={{ width: `${(alliance.teams.length / alliance.maxTeams) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: alliance.maxTeams }, (_, index) => {
            const teamIndex = alliance.teams[index];
            const mappedTeamId = teamIndex ? teamIdByIndex?.[teamIndex - 1] : undefined;
            const displayId = teamIndex ? (typeof mappedTeamId === 'number' ? mappedTeamId : teamIndex) : undefined;
            return (
              <div
                key={index}
                className={`
                  h-12 rounded-lg border-2 border-dashed flex items-center justify-center relative group
                  ${teamIndex
                    ? 'border-gray-300 bg-gray-100'
                    : 'border-gray-200 bg-gray-50'
                  }
                `}
              >
                {teamIndex ? (
                  <>
                    <div className="flex items-center gap-2">
                      {typeof mappedTeamId === 'number' && (
                        <img
                          src={`/img/avatar/${mappedTeamId}.svg`}
                          className="w-6 h-6 object-cover rounded"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            if (target.src.endsWith('.svg')) target.src = `/img/avatar/${mappedTeamId}.png`;
                            else { (target as any).onerror = null; target.src = '/img/avatar/default.svg'; }
                          }}
                        />
                      )}
                      <span className="font-semibold text-gray-900">#{displayId}</span>
                    </div>
                    <button
                      onClick={() => onRemoveTeam(alliance.id, teamIndex)}
                      className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                ) : (
                  <Plus className="h-4 w-4 text-gray-400" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}