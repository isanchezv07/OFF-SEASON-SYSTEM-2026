import React, { useState, useEffect, useRef } from 'react';
import { onConfigChange, SystemConfig } from '../../utils/storage';
import { Trophy, Users } from 'lucide-react';

interface RankingEntry {
  teamId: number;
  avgRP: number;
  avgAuto: number;
  avgParking: number;
  matches: number;
}

export default function PublicView() {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Cargar configuración inicial
    const loadInitialConfig = async () => {
      const { loadConfig } = await import('../../utils/storage');
      const initialConfig = loadConfig();
      setConfig(initialConfig);
    };
    
    loadInitialConfig();

    // Escuchar cambios en tiempo real
    const unsubscribe = onConfigChange((newConfig) => {
      setConfig(newConfig);
    });

    return unsubscribe;
  }, []);
  
  const getApiBase = () => {
    if (typeof window === 'undefined') return 'http://localhost:3000';
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:3000`;
  }

  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRanking = async () => {
    try {
      setError(null);
      const res = await fetch(`${getApiBase()}/api/`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list: RankingEntry[] = Array.isArray(data?.ranking) ? data.ranking : [];
      // Ensure numeric types
      const normalized = list.map((r) => ({
        teamId: Number(r.teamId),
        avgRP: Number(r.avgRP) || 0,
        avgAuto: Number(r.avgAuto) || 0,
        avgParking: Number(r.avgParking) || 0,
        matches: Number(r.matches) || 0,
      }));
      // Sort defensively in case backend wasn't sorted
      normalized.sort((a, b) => {
        if (b.avgRP !== a.avgRP) return b.avgRP - a.avgRP;
        if (b.avgAuto !== a.avgAuto) return b.avgAuto - a.avgAuto;
        if (b.avgParking !== a.avgParking) return b.avgParking - a.avgParking;
        return (a.teamId || 0) - (b.teamId || 0);
      });
      setRanking(normalized);
    } catch (e: any) {
      setError(e?.message || 'Failed to load ranking');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRanking();
    const id = setInterval(loadRanking, 5000);
    return () => clearInterval(id);
  }, []);

  const fmt = (n: number) => n.toFixed(2);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);
  
    // Fullscreen on Enter
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !document.fullscreenElement && containerRef.current) {
        containerRef.current.requestFullscreen().catch(console.error);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!config) {
    return (
      <div ref={containerRef} className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-sm border">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-blue-600" />
          </div>
          <div className="text-2xl font-semibold text-gray-800 mb-2">
            Esperando configuración...
          </div>
          <div className="text-gray-600">
            Configure las alianzas desde el panel de administración
          </div>
        </div>
      </div>
    );
  }

  // Crear lista de equipos asignados (por índice de selección en el panel)
  const assignedTeamIndexes = new Set<number>();
  config.alliances.forEach(alliance => {
    alliance.teams.forEach(index => assignedTeamIndexes.add(index));
  });

  // Mapa de índice (1-based) -> teamId real, basado en ranking actual
  const teamIdByIndex = ranking.map(r => r.teamId);

  // Crear lista de equipos disponibles (no asignados) usando teamId real
  const availableTeams = ranking
    .map(r => r.teamId)
    .filter(teamId => {
      // Si el teamId corresponde a algún índice asignado, filtrarlo
      const index = teamIdByIndex.indexOf(teamId) + 1; // 1-based
      return index > 0 && !assignedTeamIndexes.has(index);
    });
  
  // Dividir equipos en tres columnas para mostrar
  const teamsPerColumn = Math.ceil(availableTeams.length / 3);
  const column1 = availableTeams.slice(0, teamsPerColumn);
  const column2 = availableTeams.slice(teamsPerColumn, teamsPerColumn * 2);
  const column3 = availableTeams.slice(teamsPerColumn * 2);

  const allianceColors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-teal-500',
    'bg-pink-500',
    'bg-indigo-500'
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-t from-green-400 to-blue-500">

      {/* Main Content */}
      <div className="flex gap-8 p-8">
        {/* Left Side - Alliance Selection */}
        <div className="w-1/2 bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Alianzas</h2>
          </div>

          <div className="flex gap-6 text-sm text-gray-600 mb-6 px-16">
            <span className="font-medium">Capitán</span>
            <span>1er Pick</span>
            <span>2do Pick</span>
          </div>

          <div className="space-y-4">
            {config.alliances.map((alliance, i) => {
              const colorClass = allianceColors[i % allianceColors.length];
              return (
                <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className={`w-12 h-12 ${colorClass} text-white rounded-lg flex items-center justify-center text-lg font-semibold`}>
                    {i + 1}
                  </div>
                  <div className="w-24 text-lg font-medium text-gray-800">
                    {alliance.name}
                  </div>
                  <div className="flex gap-3">
                    {/* Captain */}
                    <div className="w-24 h-12 bg-white border-2 border-yellow-400 rounded-lg flex items-center justify-center text-lg font-semibold text-gray-800">
                      {(() => {
                        const idx = alliance.teams[0];
                        if (!idx) return '';
                        const mapped = teamIdByIndex[idx - 1];
                        return (
                          <div className="flex items-center gap-2">
                            {typeof mapped === 'number' && (
                              <img
                                src={`/img/avatar/${mapped}.svg`}
                                className="w-6 h-6 object-cover rounded"
                                onError={(e) => {
                                  const target = e.currentTarget as HTMLImageElement;
                                  if (target.src.endsWith('.svg')) target.src = `/img/avatar/${mapped}.png`;
                                  else { (target as any).onerror = null; target.src = '/img/avatar/default.svg'; }
                                }}
                              />
                            )}
                            #{mapped ?? idx}
                          </div>
                        );
                      })()}
                    </div>
                    {/* 1st Pick */}
                    <div className="w-24 h-12 bg-white border border-gray-300 rounded-lg flex items-center justify-center text-lg font-semibold text-gray-800">
                      {(() => {
                        const idx = alliance.teams[1];
                        if (!idx) return '';
                        const mapped = teamIdByIndex[idx - 1];
                        return (
                          <div className="flex items-center gap-2">
                            {typeof mapped === 'number' && (
                              <img
                                src={`/img/avatar/${mapped}.svg`}
                                className="w-6 h-6 object-cover rounded"
                                onError={(e) => {
                                  const target = e.currentTarget as HTMLImageElement;
                                  if (target.src.endsWith('.svg')) target.src = `/img/avatar/${mapped}.png`;
                                  else { (target as any).onerror = null; target.src = '/img/avatar/default.svg'; }
                                }}
                              />
                            )}
                            #{mapped ?? idx}
                          </div>
                        );
                      })()}
                    </div>
                    {/* 2nd Pick */}
                    <div className="w-24 h-12 bg-white border border-gray-300 rounded-lg flex items-center justify-center text-lg font-semibold text-gray-800">
                      {(() => {
                        const idx = alliance.teams[2];
                        if (!idx) return '';
                        const mapped = teamIdByIndex[idx - 1];
                        return (
                          <div className="flex items-center gap-2">
                            {typeof mapped === 'number' && (
                              <img
                                src={`/img/avatar/${mapped}.svg`}
                                className="w-6 h-6 object-cover rounded"
                                onError={(e) => {
                                  const target = e.currentTarget as HTMLImageElement;
                                  if (target.src.endsWith('.svg')) target.src = `/img/avatar/${mapped}.png`;
                                  else { (target as any).onerror = null; target.src = '/img/avatar/default.svg'; }
                                }}
                              />
                            )}
                            #{mapped ?? idx}
                          </div>
                        );
                      })()}
                    </div>
                    {/* Equipos adicionales */}
                    {alliance.teams.slice(3).map((index, idx) => (
                      <div key={idx + 3} className="w-24 h-12 bg-white border border-gray-300 rounded-lg flex items-center justify-center text-lg font-semibold text-gray-800">
                        {(() => {
                          const mapped = teamIdByIndex[index - 1];
                          return (
                            <div className="flex items-center gap-2">
                              {typeof mapped === 'number' && (
                                <img
                                  src={`/img/avatar/${mapped}.svg`}
                                  className="w-6 h-6 object-cover rounded"
                                  onError={(e) => {
                                    const target = e.currentTarget as HTMLImageElement;
                                    if (target.src.endsWith('.svg')) target.src = `/img/avatar/${mapped}.png`;
                                    else { (target as any).onerror = null; target.src = '/img/avatar/default.svg'; }
                                  }}
                                />
                              )}
                              #{mapped ?? index}
                            </div>
                          );
                        })()}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {config.alliances.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="text-xl font-medium mb-2">No hay alianzas creadas</div>
                <div className="text-gray-400">Crea alianzas desde el panel de administración</div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Team Rankings */}
        <div className="w-1/2 bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Rankings</h2>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Column 1 */}
            <div className="space-y-1">
              <div className="grid grid-cols-2 gap-1 mb-3">
                <div className="bg-gray-100 text-center py-2 font-semibold text-gray-700 rounded">Rank</div>
                <div className="bg-gray-100 text-center py-2 font-semibold text-gray-700 rounded">Team</div>
              </div>
              {column1.map((team, index) => {
                const rank = index + 1;
                const isTop3 = rank <= 4;
                return (
                  <div key={team} className="grid grid-cols-2 gap-1">
                    <div className={`text-center py-2 font-semibold rounded ${
                      isTop3 ? 'bg-yellow-100 text-yellow-800' : 'bg-white border border-gray-200 text-gray-700'
                    }`}>
                      {rank}
                    </div>
                    <div className={`text-center py-2 font-semibold rounded ${
                      isTop3 ? 'bg-yellow-100 text-yellow-800' : 'bg-white border border-gray-200 text-gray-700'
                    }`}>
                      {team}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Column 2 */}
            <div className="space-y-1">
              <div className="grid grid-cols-2 gap-1 mb-3">
                <div className="bg-gray-100 text-center py-2 font-semibold text-gray-700 rounded">Rank</div>
                <div className="bg-gray-100 text-center py-2 font-semibold text-gray-700 rounded">Team</div>
              </div>
              {column2.map((team, index) => {
                const rank = teamsPerColumn + index + 1;
                const isTop3 = rank <= 3;
                return (
                  <div key={team} className="grid grid-cols-2 gap-1">
                    <div className={`text-center py-2 font-semibold rounded ${
                      isTop3 ? 'bg-yellow-100 text-yellow-800' : 'bg-white border border-gray-200 text-gray-700'
                    }`}>
                      {rank}
                    </div>
                    <div className={`text-center py-2 font-semibold rounded ${
                      isTop3 ? 'bg-yellow-100 text-yellow-800' : 'bg-white border border-gray-200 text-gray-700'
                    }`}>
                      {team}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Column 3 */}
            <div className="space-y-1">
              <div className="grid grid-cols-2 gap-1 mb-3">
                <div className="bg-gray-100 text-center py-2 font-semibold text-gray-700 rounded">Rank</div>
                <div className="bg-gray-100 text-center py-2 font-semibold text-gray-700 rounded">Team</div>
              </div>
              {column3.map((team, index) => {
                const rank = teamsPerColumn * 2 + index + 1;
                const isTop3 = rank <= 3;
                return (
                  <div key={team} className="grid grid-cols-2 gap-1">
                    <div className={`text-center py-2 font-semibold rounded ${
                      isTop3 ? 'bg-yellow-100 text-yellow-800' : 'bg-white border border-gray-200 text-gray-700'
                    }`}>
                      {rank}
                    </div>
                    <div className={`text-center py-2 font-semibold rounded ${
                      isTop3 ? 'bg-yellow-100 text-yellow-800' : 'bg-white border border-gray-200 text-gray-700'
                    }`}>
                      {team}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}