import React, { useEffect, useState, useRef } from 'react';

interface RankingEntry {
  teamId: number;
  avgRP: number;
  avgAuto: number;
  avgParking: number;
  matches: number;
}

const getApiBase = () => {
  if (typeof window === 'undefined') return 'http://localhost:3000';
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:3000`;
};

export default function RankDisplay() {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadRanking = async () => {
    try {
      setError(null);
      const res = await fetch(`${getApiBase()}/api/`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list: RankingEntry[] = Array.isArray(data?.ranking) ? data.ranking : [];
      const normalized = list.map((r) => ({
        teamId: Number(r.teamId),
        avgRP: Number(r.avgRP) || 0,
        avgAuto: Number(r.avgAuto) || 0,
        avgParking: Number(r.avgParking) || 0,
        matches: Number(r.matches) || 0,
      }));
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

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !document.fullscreenElement && containerRef.current) {
        containerRef.current.requestFullscreen().catch(console.error);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col h-screen bg-gradient-to-t from-green-400 to-blue-500 overflow-hidden" style={{ fontFamily: 'Roboto' }}>
      {/* Header */}
      <div className="flex flex-row h-[75px] bg-black w-full z-10">
        <div className="max-w-[170px] flex-1 bg-white flex items-center justify-center">
          <img src="\img\logos\hh_primary.svg" className="w-[124px]" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white text-4xl font-bold text-center">Hyper-Hurdle 2025</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <span className="text-white text-3xl font-bold text-center">Team Rankings</span>
        </div>
        <div className="max-w-[170px] flex-1 bg-white flex items-center justify-center">
          <img src="\img\logos\itd_season_primary_wide.svg" className="w-[124px]" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center p-6 overflow-hidden">
        <div className="w-full max-w-7xl bg-black rounded-xl shadow-2xl relative h-[730px] overflow-hidden">
          {/* Fila de encabezado fija */}
          <table className="min-w-full divide-y divide-gray-700 z-50 absolute">
            <thead className="bg-black text-white">
              <tr>
                <th className="px-6 py-4 text-left md:text-3xl">#</th>
                <th className="px-6 py-4 text-left md:text-3xl">Team</th>
                <th className="px-6 py-4 text-left md:text-3xl">RP</th>
                <th className="px-6 py-4 text-left md:text-3xl">AUTO</th>
                <th className="px-6 py-4 text-left md:text-3xl">ASCENT</th>
              </tr>
            </thead>
          </table>

          {/* Resultados animados pasando por delante */}
          <div className="relative z-30 animate-scroll-up">
            {[ranking, ranking].map((rankList, i) => (
              <table key={i} className="min-w-full divide-y divide-gray-700">
                <tbody className="divide-y divide-gray-700">
                  {rankList.map((r, idx) => (
                    <tr key={r.teamId}>
                      <td className="px-6 py-4 text-2xl md:text-3xl font-extrabold text-white">{idx + 1}</td>
                      <td className="px-6 py-4 text-2xl md:text-3xl font-bold bg-white text-black">
                        <div className="flex items-center gap-4">
                          <img
                            src={`/img/avatar/${r.teamId}.svg`}
                            className="w-[42px] object-cover rounded"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              if (target.src.endsWith('.svg')) target.src = `/img/avatar/${r.teamId}.png`;
                              else { target.onerror = null; target.src = '/img/avatar/default.svg'; }
                            }}
                          />
                          <span>{r.teamId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xl md:text-2xl text-gray-100 font-mono">{r.avgRP.toFixed(2)}</td>
                      <td className="px-6 py-4 text-xl md:text-2xl text-gray-100 font-mono">{r.avgAuto.toFixed(2)}</td>
                      <td className="px-6 py-4 text-xl md:text-2xl text-gray-100 font-mono">{r.avgParking.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ))}
          </div>

          {loading && <div className="text-gray-300 p-6">Loading ranking…</div>}
          {error && <div className="text-red-400 p-6">{error}</div>}
          {!loading && !error && ranking.length === 0 && (
            <div className="text-gray-300 p-6">No ranking data available yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}