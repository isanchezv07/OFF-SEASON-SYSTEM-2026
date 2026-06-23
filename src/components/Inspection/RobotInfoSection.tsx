import React, { useEffect, useState } from 'react';
import { Notebook as Robot, User } from 'lucide-react';
import { RobotInfo } from '../../types/inspection';

interface RobotInfoSectionProps {
  robotInfo: RobotInfo;
  onInfoChange: (field: keyof RobotInfo, value: string | number) => void;
}

interface Team {
  number: number;
  name: string;
}

export const RobotInfoSection: React.FC<RobotInfoSectionProps> = ({
  robotInfo,
  onInfoChange
}) => {
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    // ⚡ Cargar equipos desde teams.json
    fetch('/teams.json')
      .then(res => res.json())
      .then(data => setTeams(data))
      .catch(err => console.error('Error cargando equipos:', err));
  }, []);

  const teamOptions = teams.map(team => ({
    value: team.number,
    label: `${team.number} - ${team.name}`
  }));

  const inspectorOptions = [
    { value: 'Nat', label: 'Natalia' },
    { value: 'Isaac', label: 'Isaac' },
    { value: 'Pao mich', label: 'Pao Mich' },
    { value: 'Otro', label: 'Otro' },
  ];

  const fields = [
    { 
      key: 'name' as keyof RobotInfo, 
      label: 'Team', 
      icon: Robot, 
      type: 'select', 
      required: true,
      options: teamOptions
    },
    { 
      key: 'inspector' as keyof RobotInfo, 
      label: 'Inspector', 
      icon: User, 
      type: 'select', 
      required: true,
      options: inspectorOptions
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Robot className="text-blue-600" size={24} />
        Robot Information
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map((field) => {
          const Icon = field.icon;
          return (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <Icon size={16} className="text-gray-500" />
                  {field.label}
                  {field.required && <span className="text-red-500">*</span>}
                </span>
              </label>

              {field.type === 'select' && field.options ? (
                <select
                  value={robotInfo[field.key] || ''}
                  onChange={(e) => {
                    const val = field.key === 'name' ? Number(e.target.value) : e.target.value;
                    onInfoChange(field.key, val);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  required={field.required}
                >
                  <option value="">Select {field.label.toLowerCase()}...</option>
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  value={robotInfo[field.key] || ''}
                  onChange={(e) => onInfoChange(field.key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  required={field.required}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};