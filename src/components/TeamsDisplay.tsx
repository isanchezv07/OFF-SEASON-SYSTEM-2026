import React, { useState, useEffect } from 'react';
import { Team, Match } from '../components/Teams/types/index';
import TeamList from '../components/Teams/TeamList';
import AddTeamForm from '../components/Teams/AddTeamForm';
import MatchGenerator from '../components/Teams/MatchGenerator';
import MatchDisplay from '../components/Teams/MatchDisplay';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Cog, Trophy, Users } from 'lucide-react';

export default function TeamsDisplay() {
  const [teams, setTeams] = useLocalStorage<Team[]>('ftc-teams', []);
  const [matches, setMatches] = useLocalStorage<Match[]>('ftc-matches', []);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial teams data from public/teams.json
  useEffect(() => {
    const loadInitialTeams = async () => {
      try {
        // Only load initial data if no teams are stored
        if (teams.length === 0) {
          const response = await fetch('/teams.json');
          if (response.ok) {
            const initialTeams = await response.json();
            setTeams(initialTeams);
          }
        }
      } catch (error) {
        console.error('Error loading initial teams:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialTeams();
  }, []);

  const handleAddTeam = (newTeam: Team) => {
    setTeams(prevTeams => [...prevTeams, newTeam]);
  };

  const handleGenerateMatches = (newMatches: Match[]) => {
    setMatches(newMatches);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading FTC Match Maker...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Cog className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">FTC Match Maker</h1>
                <p className="text-sm text-gray-600">Tournament match generation system</p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{teams.length} Teams</span>
              </div>
              <div className="flex items-center gap-1">
                <Trophy className="w-4 h-4" />
                <span>{matches.length} Matches</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Team Management Section */}
          <section>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <AddTeamForm onAddTeam={handleAddTeam} existingTeams={teams} />
              <MatchGenerator teams={teams} onGenerateMatches={handleGenerateMatches} />
            </div>
          </section>

          {/* Teams Display */}
          <section>
            <TeamList teams={teams} />
          </section>

          {/* Matches Display */}
          <section>
            <MatchDisplay matches={matches} teams={teams} />
          </section>
        </div>
      </main>
    </div>
  );
}