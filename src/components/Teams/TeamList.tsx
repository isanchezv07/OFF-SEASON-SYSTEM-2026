import React from 'react';
import { Team } from './types';
import { Users, Hash } from 'lucide-react';

interface TeamListProps {
  teams: Team[];
}

const TeamList: React.FC<TeamListProps> = ({ teams }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-800">Registered Teams</h2>
        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
          {teams.length}
        </span>
      </div>
      
      {teams.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No teams registered yet. Add your first team above!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Team Number
                  </div>
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Team Name</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team, index) => (
                <tr 
                  key={team.number} 
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  }`}
                >
                  <td className="py-3 px-4 font-mono text-blue-600 font-medium">#{team.number}</td>
                  <td className="py-3 px-4 text-gray-800">
                    <div key={index} className="flex items-center gap-2">
                      <img 
                        src={`/img/avatar/${team.number}.svg`} 
                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                          const target = e.currentTarget;
                          if (target.src.endsWith('.svg')) {
                            target.src = `/img/avatar/${team.number}.png`;
                          } else {
                            target.onerror = null;
                            target.src = "/img/avatar/default.svg";
                          }
                        }}
                        className="w-[40px] object-cover rounded" 
                      />
                      <span>{team.name}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TeamList;