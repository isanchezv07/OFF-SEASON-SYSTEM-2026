import React from 'react';
import { Match, Team } from './types';
import { Trophy, Download, BarChart3 } from 'lucide-react';

interface MatchDisplayProps {
  matches: Match[];
  teams: Team[];
}

const MatchDisplay: React.FC<MatchDisplayProps> = ({ matches, teams }) => {
  const getTeamName = (teamNumber: number) => {
    const team = teams.find(t => t.number === teamNumber);
    return team ? team.name : `Team ${teamNumber}`;
  };

  const downloadMatches = () => {
    const dataStr = JSON.stringify(matches, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'matches.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getMatchStats = () => {
    const teamMatchCounts = new Map<number, number>();
    
    // Count matches per team
    matches.forEach(match => {
      [...match.redAlliance, ...match.blueAlliance].forEach(teamNumber => {
        teamMatchCounts.set(teamNumber, (teamMatchCounts.get(teamNumber) || 0) + 1);
      });
    });

    const matchCounts = Array.from(teamMatchCounts.values());
    const minMatches = Math.min(...matchCounts);
    const maxMatches = Math.max(...matchCounts);
    const avgMatches = matchCounts.reduce((a, b) => a + b, 0) / matchCounts.length;

    return {
      teamMatchCounts,
      minMatches: matchCounts.length > 0 ? minMatches : 0,
      maxMatches: matchCounts.length > 0 ? maxMatches : 0,
      avgMatches: matchCounts.length > 0 ? avgMatches : 0,
      totalTeamsWithMatches: teamMatchCounts.size
    };
  };

  if (matches.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-yellow-600" />
          <h2 className="text-xl font-semibold text-gray-800">Generated Matches</h2>
        </div>
        <div className="text-center py-8 text-gray-500">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No matches generated yet. Use the match generator above!</p>
        </div>
      </div>
    );
  }

  const stats = getMatchStats();

  return (
    <div className="space-y-6">
      {/* Match Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-800">Match Statistics</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{matches.length}</div>
            <div className="text-sm text-blue-800">Total Matches</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.totalTeamsWithMatches}</div>
            <div className="text-sm text-green-800">Teams Playing</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.avgMatches.toFixed(1)}</div>
            <div className="text-sm text-purple-800">Avg Matches/Team</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.minMatches}-{stats.maxMatches}</div>
            <div className="text-sm text-orange-800">Match Range</div>
          </div>
        </div>

        {/* Team match distribution */}
        <div className="mt-4">
          <h3 className="font-medium text-gray-800 mb-2">Team Match Distribution</h3>
          <div className="max-h-32 overflow-y-auto bg-gray-50 rounded-lg p-3">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
              {Array.from(stats.teamMatchCounts.entries())
                .sort(([a], [b]) => a - b)
                .map(([teamNumber, matchCount]) => (
                  <div key={teamNumber} className="flex justify-between items-center bg-white rounded px-2 py-1">
                      <img 
                        src={`/img/avatar/${teamNumber}.svg`} 
                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                          const target = e.currentTarget;
                          if (target.src.endsWith('.svg')) {
                            target.src = `/img/avatar/${teamNumber}.png`;
                          } else {
                            target.onerror = null;
                            target.src = "/img/avatar/default.svg";
                          }
                        }}
                        className="w-[20px] object-cover rounded" 
                      />
                    <span className="font-mono text-blue-600">#{teamNumber}</span>
                    <span className={`font-medium ${
                      matchCount === stats.maxMatches ? 'text-green-600' : 
                      matchCount === stats.minMatches ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {matchCount}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Matches List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <h2 className="text-xl font-semibold text-gray-800">Generated Matches</h2>
            <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
              {matches.length}
            </span>
          </div>
          <button
            onClick={downloadMatches}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download JSON
          </button>
        </div>

        <div className="space-y-4">
          {matches.map((match) => (
            <div key={match.matchNumber} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">
                  Match {match.matchNumber}
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Red Alliance */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                    Red Alliance
                  </h4>
                  <div className="space-y-2">
                    {match.redAlliance.map((teamNumber, index) => (
                      <div key={teamNumber} className="flex items-center justify-between bg-white rounded p-2 text-sm">
                        <span className="font-mono text-red-600 font-medium">#{teamNumber}</span>
                        <span className="text-gray-800 truncate ml-2">{getTeamName(teamNumber)}</span>
                        <img
                          src={`/img/avatar/${teamNumber}.svg`}
                          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                            const target = e.currentTarget;
                            if (target.src.endsWith(".svg")) {
                              target.src = `/img/avatar/${teamNumber}.png`;
                            } else {
                              target.onerror = null;
                              target.src = "/img/avatar/default.svg";
                            }
                          }}
                          className="w-[20px] object-cover rounded"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Blue Alliance */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    Blue Alliance
                  </h4>
                  <div className="space-y-2">
                    {match.blueAlliance.map((teamNumber, index) => (
                      <div key={teamNumber} className="flex items-center justify-between bg-white rounded p-2 text-sm">
                        <span className="font-mono text-blue-600 font-medium">#{teamNumber}</span>
                        <span className="text-gray-800 truncate ml-2">{getTeamName(teamNumber)}</span>
                        <img
                          src={`/img/avatar/${teamNumber}.svg`}
                          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                            const target = e.currentTarget;
                            if (target.src.endsWith(".svg")) {
                              target.src = `/img/avatar/${teamNumber}.png`;
                            } else {
                              target.onerror = null;
                              target.src = "/img/avatar/default.svg";
                            }
                          }}
                          className="w-[20px] object-cover rounded"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MatchDisplay;