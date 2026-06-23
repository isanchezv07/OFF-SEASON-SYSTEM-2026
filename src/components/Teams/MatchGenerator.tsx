import React, { useState } from 'react';
import { Team, Match } from './types';
import { Shuffle, Zap, AlertCircle, Settings } from 'lucide-react';

interface MatchGeneratorProps {
  teams: Team[];
  onGenerateMatches: (matches: Match[]) => void;
}

const MatchGenerator: React.FC<MatchGeneratorProps> = ({ teams, onGenerateMatches }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [matchesPerTeam, setMatchesPerTeam] = useState(3);

  // Función para mezclar un array
  const shuffleArray = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const generateMatches = async () => {
    if (teams.length < 6) return;

    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const matches: Match[] = [];
    const totalRounds = matchesPerTeam;
    let matchNumber = 1;

    const teamMatchCounts = new Map<number, number>();
    teams.forEach(team => teamMatchCounts.set(team.number, 0));

    const usedAlliances = new Set<string>();

    for (let round = 0; round < totalRounds; round++) {
      let availableTeams = shuffleArray(teams);

      while (availableTeams.length >= 6) {
        const group = availableTeams.slice(0, 6);
        const red = group.slice(0, 3).map(t => t.number);
        const blue = group.slice(3, 6).map(t => t.number);

        const key = [...red, ...blue].sort((a, b) => a - b).join(',');

        if (usedAlliances.has(key)) {
          availableTeams = shuffleArray(availableTeams);
          continue;
        }

        usedAlliances.add(key);

        matches.push({
          matchNumber: matchNumber++,
          redAlliance: red,
          blueAlliance: blue
        });

        group.forEach(t => {
          teamMatchCounts.set(t.number, (teamMatchCounts.get(t.number) || 0) + 1);
        });

        availableTeams = availableTeams.slice(6);
      }
    }

    onGenerateMatches(matches);
    setIsGenerating(false);
  };

  const stats = {
    totalMatches: (teams.length / 6) * matchesPerTeam,
    teamsPerMatch: 6,
    totalTeamSlots: teams.length * matchesPerTeam,
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-yellow-600" />
        <h2 className="text-xl font-semibold text-gray-800">Match Generator</h2>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="w-4 h-4 text-blue-600" />
            <h3 className="font-medium text-blue-800">Match Configuration</h3>
          </div>
          <div className="flex items-center gap-4">
            <label htmlFor="matchesPerTeam" className="text-sm font-medium text-gray-700">
              Matches per team:
            </label>
            <select
              id="matchesPerTeam"
              value={matchesPerTeam}
              onChange={(e) => setMatchesPerTeam(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              disabled={isGenerating}
            >
              {[6, 7, 8, 9, 10, 11, 12].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
        </div>

        {teams.length >= 6 ? (
          <button
            onClick={generateMatches}
            disabled={isGenerating || teams.length < 6}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-md hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating Matches...
              </>
            ) : (
              <>
                <Shuffle className="w-5 h-5" />
                Generate Matches ({matchesPerTeam} per team)
              </>
            )}
          </button>
        ) : (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">
              You need at least 6 teams to generate matches. Currently have {teams.length} teams.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchGenerator;