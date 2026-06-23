import React, { useState, useCallback, useEffect } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { RobotInfoSection } from './RobotInfoSection';
import { InspectionSection } from './InspectionSection';
import { InspectionSummary } from './InspectionSummary';
import { createInspectionTemplate } from './data/inspectionTemplate';
import { InspectionData, RobotInfo, InspectionItem } from '../../types/inspection';
import { socket } from '../../lib/socket';

export const RobotInspectionForm: React.FC = () => {
  const [inspectionData, setInspectionData] = useState<InspectionData>(createInspectionTemplate);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  const handleRobotInfoChange = useCallback((field: keyof RobotInfo, value: string | number) => {
    setInspectionData(prev => ({
      ...prev,
      robotInfo: {
        ...prev.robotInfo,
        [field]: String(value)
      }
    }));
  }, []);
  React.useEffect(() => {
    // Recorremos todas las secciones para calcular su estado
    const updatedSections = inspectionData.sections.map(section => {
      const items = section.items;
      const hasFail = items.some(i => i.status === 'fail');
      const hasPending = items.some(i => i.status === 'pending');
  
      let sectionStatus: 'pass' | 'fail'  | 'pending' = 'pass';
      if (hasFail) sectionStatus = 'fail';
      else if (hasPending) sectionStatus = 'pending';
  
      return {
        ...section,
        status: sectionStatus // agregamos el estado calculado
      };
    });
  
    // Calculamos el estado global
    const allItems = updatedSections.flatMap(section => section.items);
    const pendingItems = allItems.filter(item => item.status === 'pending').length;
    const failedItems = allItems.filter(item => item.status === 'fail').length;
  
    let newOverallStatus: InspectionData['overallStatus'] = 'pending';
    if (pendingItems === 0) {
      if (failedItems > 0) newOverallStatus = 'fail';
      else newOverallStatus = 'pass';
    }
  
    // Solo actualizamos si hay cambios
    setInspectionData(prev => {
      if (prev.overallStatus !== newOverallStatus || JSON.stringify(prev.sections) !== JSON.stringify(updatedSections)) {
        return {
          ...prev,
          overallStatus: newOverallStatus,
          sections: updatedSections
        };
      }
      return prev;
    });
  
  }, [inspectionData.sections, inspectionData.overallStatus]);

  const handleItemStatusChange = useCallback((sectionId: string, itemId: string, status: InspectionItem['status']) => {
    setInspectionData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map(item =>
                item.id === itemId ? { ...item, status } : item
              )
            }
          : section
      )
    }));
  }, []);

  const handleItemNotesChange = useCallback((sectionId: string, itemId: string, notes: string) => {
    setInspectionData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map(item =>
                item.id === itemId ? { ...item, notes } : item
              )
            }
          : section
      )
    }));
  }, []);

  const handleGenerateReport = useCallback(async () => {
    try {
      // Validar que se haya seleccionado un equipo
      if (!inspectionData.robotInfo.name || inspectionData.robotInfo.name === '' || inspectionData.robotInfo.name === 'No especificado') {
        alert('Por favor selecciona un equipo antes de generar el reporte.');
        return;
      }

      // Validar que se haya seleccionado un inspector
      if (!inspectionData.robotInfo.inspector || inspectionData.robotInfo.inspector === '' || inspectionData.robotInfo.inspector === 'No especificado') {
        alert('Por favor selecciona un inspector antes de generar el reporte.');
        return;
      }

      // Crear el reporte con los datos específicos solicitados
      const reportData = {
        // Nombre/número del equipo
        teamName: inspectionData.robotInfo.name,
        // Inspector
        inspector: inspectionData.robotInfo.inspector,
        // Todas las secciones y sus valores
        sections: inspectionData.sections.map(section => ({
          id: section.id,
          title: section.title,
          items: section.items.map(item => ({
            id: item.id,
            name: item.name,
            status: item.status,
            required: item.required
          }))
        })),
        // Estado general (si pasó)
        overallStatus: inspectionData.overallStatus,
      };

      const response = await fetch('/api/inspections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Inspection report processed successfully:', result);
        alert(result.message || 'Inspection report processed successfully!');
        window.location.reload();
      } else {
        alert('Error saving inspection report. Please try again.');
      }
    } catch (error) {
      alert('Error generating inspection report. Please try again.');
    }
  }, [inspectionData]);

  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    localStorage.clear();
    window.location.href = '/login';
  };

  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated');
    if (!isAuth) {
      window.location.href = '/login';
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">

      {!isConnected && (
        <div className="absolute top-0 left-0 w-full bg-gray-800 text-center py-6 z-50 font-bold text-6xl text-red-600">
            Desconectado! 
        </div>
      )}

      {/* Header */}
      <header className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Inspection</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white text-sm font-semibold"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Robot Information */}
          <RobotInfoSection
            robotInfo={inspectionData.robotInfo}
            onInfoChange={handleRobotInfoChange}
          />

          {/* Inspection Sections */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <ClipboardCheck className="text-blue-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-900">Inspection Checklist</h2>
            </div>
            
            {inspectionData.sections.map((section) => (
              <InspectionSection
                key={section.id}
                section={section}
                onItemStatusChange={handleItemStatusChange}
                onItemNotesChange={handleItemNotesChange}
              />
            ))}
          </div>

          {/* Summary */}
          <InspectionSummary
            data={inspectionData}
            onGenerateReport={handleGenerateReport}
          />
        </div>
      </main>
    </div>
  );
};

export default RobotInspectionForm;