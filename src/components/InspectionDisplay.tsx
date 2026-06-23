import React, { useEffect, useState, useRef } from 'react';
import teamsData from '../../public/teams.json'; // ⚡ importa el JSON aquí

export default function InspectionDisplay() {
  const [data, setData] = useState<{ inspections: any[] }>({ inspections: [] });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Función que obtiene los datos del API
    const fetchData = () => {
      fetch("/api/inspections")
        .then(res => res.json())
        .then(json => setData(json))
        .catch(console.error);
    };

    fetchData();

    const intervalId = setInterval(fetchData, 5000);

    return () => clearInterval(intervalId);
  }, []);

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

  // 🔎 función para buscar nombre de equipo
  const getTeamName = (teamNumber: string | number) => {
    const team = teamsData.find(t => t.number === Number(teamNumber));
    return team ? team.name : "Unknown";
  };

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
          <span className="text-white text-3xl font-bold text-center">Inspections</span>
        </div>
        <div className="max-w-[170px] flex-1 bg-white flex items-center justify-center">
          <img src="\img\logos\itd_season_primary_wide.svg" className="w-[124px]" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center p-6">
        <div className="w-full max-w-7xl bg-white shadow-2xl relative h-[730px] overflow-auto">
        <table className="min-w-full border-2 border-black border-collapse mx-auto ">
          <thead className="bg-white text-black sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 md:text-3xl border-2 border-black text-center">R</th>
              <th className="px-6 py-4 md:text-3xl border-2 border-black text-center">F</th>
              <th className="px-6 py-4 md:text-3xl border-2 border-black text-center">Team</th>
              <th className="px-6 py-4 md:text-3xl border-2 border-black text-center">Name</th>
              {/*<th className="px-6 py-4 md:text-3xl border-2 border-black text-center">Status</th>*/}
            </tr>
          </thead>
          <tbody className=''>
              {data.inspections.map((inspection) => {
                // Calculamos el estado de cada sección
                const sectionStatuses = inspection.sections.map((section: any) => {
                  const items = section.items;
                  if (items.some((i: any) => i.status === 'fail')) return 'fail';
                  if (items.some((i: any) => i.status === 'pending')) return 'pending';
                  return 'pass';
                });

                // Tomamos la primera y segunda sección para las celdas R y F
                const Rstatus = sectionStatuses[0] || 'pending';
                const Fstatus = sectionStatuses[1] || 'pending';

                const getColor = (status: string) => {
                  switch(status) {
                    case 'pass': return 'bg-green-500';
                    case 'fail': return 'bg-red-500';
                    case 'pending': return 'bg-gray-300';
                    default: return '';
                  }
                };

                return (
                  <tr key={inspection.id} className="text-black text-xl">
                    <td className={`px-6 py-4 border-2 border-black text-center ${getColor(Rstatus)}`}></td>
                    <td className={`px-6 py-4 border-2 border-black text-center ${getColor(Fstatus)}`}></td>
                    <td className="px-6 py-4 border-2 border-black text-center">{inspection.teamName}</td>
                    <td className="px-6 py-4 border-2 border-black text-center">{getTeamName(inspection.teamName)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}