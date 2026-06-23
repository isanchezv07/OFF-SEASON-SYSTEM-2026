import React, { useState } from 'react';
import { Shield, Users, Settings, Download, Monitor } from 'lucide-react';
import { useAllianceManager } from '../hooks/useAllianceManager';
import TeamPool from '../components/Alliance/TeamPool';
import AllianceCard from '../components/Alliance/AllianceCard';
import CreateAllianceForm from '../components/Alliance/CreateAllianceForm';
import PublicView from '../components/Alliance/PublicView';

function AllianceDisplay() {
  const [totalTeams, setTotalTeams] = useState(50);
  const [viewMode, setViewMode] = useState<'admin' | 'public'>('admin');
  const {
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
  } = useAllianceManager(totalTeams);

  // Fetch ranking to map selection indices -> real team IDs
  const getApiBase = () => {
    if (typeof window === 'undefined') return 'http://localhost:3000';
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:3000`;
  };
  const [ranking, setRanking] = React.useState<any[]>([]);
  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch(`${getApiBase()}/api/`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        const list = Array.isArray(data?.ranking) ? data.ranking : [];
        const normalized = list.map((r: any) => ({ teamId: Number(r.teamId) }));
        if (mounted) setRanking(normalized);
      } catch {}
    };
    load();
    const id = setInterval(load, 5000);
    return () => { mounted = false; clearInterval(id); };
  }, []);
  const teamIdByIndex = React.useMemo(() => ranking.map((r: any) => r.teamId), [ranking]);

  // Si estamos en modo público, mostrar solo la vista pública
  if (viewMode === 'public') {
    return <PublicView />;
  }
  const assignedTeamsCount = teams.filter(team => team.isAssigned).length;
  const availableTeamsCount = teams.length - assignedTeamsCount;

  const exportConfiguration = () => {
    const config = {
      totalTeams,
      alliances: alliances.map(alliance => ({
        name: alliance.name,
        teams: alliance.teams,
        maxTeams: alliance.maxTeams,
      })),
      summary: {
        totalAlliances: alliances.length,
        assignedTeams: assignedTeamsCount,
        availableTeams: availableTeamsCount,
      },
    };

    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'configuracion-alianzas.json';
    link.click();
    URL.revokeObjectURL(url);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestor de Alianzas</h1>
                <p className="text-sm text-gray-600">Organiza equipos en alianzas competitivas</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Settings className="h-4 w-4" />
                <label htmlFor="totalTeams">Equipos totales:</label>
                <select
                  id="totalTeams"
                  value={totalTeams}
                  onChange={(e) => setTotalTeams(parseInt(e.target.value))}
                  className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[11, 12, 13].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setViewMode('public')}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                <Monitor className="h-4 w-4" />
                Vista Pública
              </button>

              <button
                onClick={exportConfiguration}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <Download className="h-4 w-4" />
                Exportar
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Alianzas</span>
              </div>
              <p className="text-2xl font-bold text-blue-600 mt-1">{alliances.length}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Asignados</span>
              </div>
              <p className="text-2xl font-bold text-green-600 mt-1">{assignedTeamsCount}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-900">Disponibles</span>
              </div>
              <p className="text-2xl font-bold text-gray-600 mt-1">{availableTeamsCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Team Pool */}
          <div className="lg:col-span-1">
            <TeamPool
              teams={teams}
              onTeamSelect={toggleTeamSelection}
              selectedTeams={selectedTeams}
              teamIdByIndex={teamIdByIndex}
            />
            
            {selectedTeams.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  {selectedTeams.length} equipo(s) seleccionado(s)
                </p>
                <button
                  onClick={clearAllSelections}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Limpiar selección
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Alliances */}
          <div className="lg:col-span-2">
            <div className="grid gap-6 md:grid-cols-2">
              <CreateAllianceForm onCreateAlliance={createAlliance} />
              
              {alliances.map((alliance) => (
                <AllianceCard
                  key={alliance.id}
                  alliance={alliance}
                  onUpdateAlliance={updateAlliance}
                  onDeleteAlliance={deleteAlliance}
                  onRemoveTeam={removeTeamFromAlliance}
                  selectedTeams={selectedTeams}
                  onAddSelectedTeams={addSelectedTeamsToAlliance}
                  teamIdByIndex={teamIdByIndex}
                />
              ))}
            </div>

            {alliances.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay alianzas creadas
                </h3>
                <p className="text-gray-600">
                  Comienza creando tu primera alianza para organizar los equipos
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllianceDisplay;