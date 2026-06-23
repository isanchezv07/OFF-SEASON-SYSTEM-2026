import React, { useState } from 'react';
import { Plus, Shield } from 'lucide-react';

interface CreateAllianceFormProps {
  onCreateAlliance: (name: string, maxTeams: number) => void;
}

const ALLIANCE_COLORS = [
  'from-red-400 to-red-600',
  'from-blue-400 to-blue-600',
  'from-green-400 to-green-600',
  'from-purple-400 to-purple-600',
  'from-yellow-400 to-yellow-600',
  'from-pink-400 to-pink-600',
  'from-indigo-400 to-indigo-600',
  'from-teal-400 to-teal-600',
];

export default function CreateAllianceForm({ onCreateAlliance }: CreateAllianceFormProps) {
  const [name, setName] = useState('');
  const [maxTeams, setMaxTeams] = useState(3);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreateAlliance(name.trim(), maxTeams);
      setName('');
      setMaxTeams(3);
      setIsExpanded(false);
    }
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
      >
        <Plus className="h-8 w-8" />
        <span className="font-medium">Crear Nueva Alianza</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Nueva Alianza</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="allianceName" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de la Alianza
          </label>
          <input
            type="text"
            id="allianceName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Alianza Roja"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label htmlFor="maxTeams" className="block text-sm font-medium text-gray-700 mb-1">
            Número de Equipos
          </label>
          <select
            id="maxTeams"
            value={maxTeams}
            onChange={(e) => setMaxTeams(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Array.from({ length: 8 }, (_, i) => i + 2).map(num => (
              <option key={num} value={num}>{num} equipos</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Crear Alianza
          </button>
          <button
            type="button"
            onClick={() => {
              setIsExpanded(false);
              setName('');
              setMaxTeams(3);
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </form>
  );
}