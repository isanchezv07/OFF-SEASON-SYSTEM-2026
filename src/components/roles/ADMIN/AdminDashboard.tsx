import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users, Trophy, BarChart3, Settings, Menu, X,
  ChevronLeft, ChevronRight, Monitor, ShieldHalf, Edit, Eye
} from 'lucide-react';

import TeamsDisplay from '../../TeamsDisplay';

type Tab = 'usuarios' | 'matches' | 'reportes' | 'configuracion' | 'displays' | 'teams';

interface Usuario {
  id: number;
  username: string;
  password: string;
  role: string;
}

interface Match {
  id: number;
  date: string;
  redTeam: { name: string; score: number; detailedScore?: any };
  blueTeam: { name: string; score: number; detailedScore?: any };
  timeRemaining: number;
  status: 'ongoing' | 'finished' | 'scheduled';
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('usuarios');
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [editFormData, setEditFormData] = useState({
    redScore: 0,
    blueScore: 0
  });

  // Verifica si está autenticado
  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated');
    if (!isAuth) {
      window.location.href = '/login';
    }
  }, []);

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    localStorage.clear();
    window.location.href = '/login';
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'usuarios') {
          const res = await axios.get('/api/users');
          setUsuarios(res.data);
        } else if (activeTab === 'matches') {
          const res = await axios.get('/api/matches');
          setMatches(res.data);
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
      }
      setLoading(false);
    };

    fetchData();
  }, [activeTab]);

  const getWinner = (match: Match) => {
    if (match.redTeam.score > match.blueTeam.score) return 'Rojo';
    if (match.blueTeam.score > match.redTeam.score) return 'Azul';
    return 'Empate';
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });

  const handleEditMatch = (match: Match) => {
    setEditingMatch(match);
    setEditFormData({
      redScore: match.redTeam.score,
      blueScore: match.blueTeam.score
    });
  };

  const handleSaveEdit = async () => {
    if (!editingMatch) return;
    
    try {
      const updatedMatch = {
        ...editingMatch,
        redTeam: { ...editingMatch.redTeam, score: editFormData.redScore },
        blueTeam: { ...editingMatch.blueTeam, score: editFormData.blueScore }
      };
      
      await axios.put(`/api/matches/${editingMatch.id}`, updatedMatch);
      setEditingMatch(null);
      
      // Refresh matches list
      const res = await axios.get('/api/matches');
      setMatches(res.data);
    } catch (error) {
      console.error('Error updating match:', error);
      alert('Error al actualizar el match');
    }
  };

  const handleLoadMatch = async (match: Match) => {
    if (!window.confirm('¿Estás seguro de que quieres cargar este match como el match actual? Esto reemplazará el match en curso.')) {
      return;
    }
    
    try {
      await axios.post(`/api/matches/${match.id}/load`);
      alert('Match cargado exitosamente. Redirigiendo al Score Controller...');
      window.location.href = '/control';
    } catch (error) {
      console.error('Error loading match:', error);
      alert('Error al cargar el match');
    }
  };

  const roleTitles: Record<string, string> = {
    admin: 'ADMIN',
    scorekeeper: 'SCOREKEEPER',
    inspector: 'INSPECTOR',
    head_ref: 'HEAD REFEREE',
    blue_ref: 'BLUE REFEREE',
    red_ref: 'RED REFEREE',
  };
  const roles = Object.keys(roleTitles);

  const tabConfig = [
    { key: 'usuarios', label: 'Usuarios', icon: Users },
    { key: 'matches', label: 'Partidos', icon: Trophy },
    { key: 'teams', label: 'Match Maker', icon: ShieldHalf},
    { key: 'displays', label: 'Displays', icon: Monitor },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Botón móvil */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-white shadow-md text-gray-600 p-2 rounded-md"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-25 z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 bg-white border-r border-gray-200 z-50
          transform transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:flex md:flex-col
          ${sidebarCollapsed ? 'md:w-16' : 'md:w-64'}
          w-64 h-screen
        `}
      >
        {/* Header */}
        <div className={`p-4 border-b border-gray-200 ${sidebarCollapsed ? 'px-2' : ''}`}>
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
              <div className="w-8 h-8 bg-gray-900 rounded-md flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              {!sidebarCollapsed && (
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Admin</h1>
                </div>
              )}
            </div>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden md:flex items-center justify-center w-6 h-6 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
            >
              {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </div>
        </div>

        {/* Navegación + Logout */}
        <nav className={`flex-1 p-2 ${sidebarCollapsed ? 'px-1' : ''}`}>
          <div className="space-y-1">
            {tabConfig.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => {
                  setActiveTab(key as Tab);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium
                  ${activeTab === key
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                  ${sidebarCollapsed ? 'justify-center px-2' : 'space-x-3'}
                `}
                title={sidebarCollapsed ? label : ''}
              >
                <Icon size={18} />
                {!sidebarCollapsed && <span>{label}</span>}
              </button>
            ))}

            {/* Botón Cerrar Sesión */}
            <button
              onClick={handleLogout}
              className={`w-full flex items-center px-3 py-2 mt-4 rounded-md text-sm font-medium text-red-600 hover:bg-red-100 hover:text-red-700
                ${sidebarCollapsed ? 'justify-center px-2' : 'space-x-3'}`}
              title="Cerrar sesión"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
              </svg>
              {!sidebarCollapsed && <span>Cerrar sesión</span>}
            </button>
          </div>
        </nav>
      </aside>

      {/* Main */}
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
      <div className="p-8">
          {loading && (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}

          {/* Usuarios */}
          {!loading && activeTab === 'usuarios' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900">Usuarios</h2>
              {roles.map(role => {
                const usersByRole = usuarios.filter(u => u.role === role);
                if (usersByRole.length === 0) return null;
                return (
                  <div key={role} className="space-y-2">
                    <h3 className="text-xl font-semibold">{roleTitles[role]}</h3>
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contraseña</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {usersByRole.map(user => (
                            <tr key={user.id}>
                              <td className="px-6 py-4">{user.id}</td>
                              <td className="px-6 py-4">{user.username}</td>
                              <td className="px-6 py-4 font-mono text-gray-600">{user.password}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Matches */}
          {!loading && activeTab === 'matches' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900">Partidos</h2>
              <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-red-600">Equipo Rojo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-red-600">Puntaje Rojo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-600">Equipo Azul</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-600">Puntaje Azul</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tiempo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ganador</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {matches.map(match => (
                      <tr key={match.id}>
                        <td className="px-6 py-4">{match.id}</td>
                        <td className="px-6 py-4">{formatDate(match.date)}</td>
                        <td className="px-6 py-4">{match.redTeam.name}</td>
                        <td className="px-6 py-4 font-bold text-red-600">{match.redTeam.score}</td>
                        <td className="px-6 py-4">{match.blueTeam.name}</td>
                        <td className="px-6 py-4 font-bold text-blue-600">{match.blueTeam.score}</td>
                        <td className="px-6 py-4">{match.timeRemaining}s</td>
                        <td className="px-6 py-4">
                          {match.redTeam.score > match.blueTeam.score ? 
                            <span className="text-red-600 font-bold">Red Wins</span> : 
                            match.blueTeam.score > match.redTeam.score ? 
                            <span className="text-blue-600 font-bold">Blue Wins</span> : 
                            <span className="text-gray-600">Tie</span>
                          }
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditMatch(match)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                              title="Editar scores"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleLoadMatch(match)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded transition"
                              title="Cargar match"
                            >
                              <Eye size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Modal de edición */}
              {editingMatch && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <h3 className="text-xl font-bold mb-4">Editar Scores del Match</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Score Equipo Rojo ({editingMatch.redTeam.name})
                        </label>
                        <input
                          type="number"
                          value={editFormData.redScore}
                          onChange={(e) => setEditFormData({ ...editFormData, redScore: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Score Equipo Azul ({editingMatch.blueTeam.name})
                        </label>
                        <input
                          type="number"
                          value={editFormData.blueScore}
                          onChange={(e) => setEditFormData({ ...editFormData, blueScore: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditingMatch(null)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Match Maker / Equipos */}
          {!loading && activeTab === 'teams' && (
            <TeamsDisplay />
          )}
          
          {/* scoreControl */}
          {!loading && activeTab === 'displays' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900">ScoreControl</h2>
              <div className="bg-white border border-gray-200 rounded-lg p-8 text-gray-500 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <button
                    onClick={() => window.location.href = '/game'}
                    className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
                  >
                    Game Screen
                  </button>

                  <button
                    onClick={() => window.location.href = '/timer'}
                    className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition"
                  >
                    Timer Screen
                  </button>

                  <button
                    onClick={() => window.location.href = '/control'}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    ScoreController
                  </button>

                  <button
                    onClick={() => window.location.href = '/alliance'}
                    className="px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition"
                  >
                    Alliance Display
                  </button>

                  <button
                    onClick={() => window.location.href = '/inspection'}
                    className="px-6 py-2 bg-indigo-800 text-white rounded-md hover:bg-indigo-700 transition"
                  >
                    Robot Inspection
                  </button>

                  <button
                    onClick={() => window.location.href = '/inspection_display'}
                    className="px-6 py-2 bg-indigo-800 text-white rounded-md hover:bg-indigo-700 transition"
                  >
                    Inspection Display
                  </button>

                  <button
                    onClick={() => window.location.href = '/head_ref'}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                  >
                    Head Refeeree
                  </button>

                  <button
                    onClick={() => window.location.href = '/blue_ref'}
                    className="px-6 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
                  >
                    Blue Referee
                  </button>

                  <button
                    onClick={() => window.location.href = '/red_ref'}
                    className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                  >
                    Red Referee
                  </button>
                </div>
              </div>
            </div>
          )}

          <footer className="text-center text-sm py-4 text-gray-500 border-t">
            Developed by{' '}
            <a
              href="https://github.com/isanchezv07"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
            @isanchezv07
            </a>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;