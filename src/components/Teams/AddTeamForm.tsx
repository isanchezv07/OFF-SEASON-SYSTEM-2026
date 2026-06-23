import React, { useState } from 'react';
import { Team } from './types';
import { Plus, UserPlus } from 'lucide-react';

interface AddTeamFormProps {
  onAddTeam: (team: Team) => void;
  existingTeams: Team[];
}

const AddTeamForm: React.FC<AddTeamFormProps> = ({ onAddTeam, existingTeams }) => {
  const [teamNumber, setTeamNumber] = useState('');
  const [teamName, setTeamName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ number?: string; name?: string }>({});

  const validateForm = () => {
    const newErrors: { number?: string; name?: string } = {};
    
    if (!teamNumber.trim()) {
      newErrors.number = 'Team number is required';
    } else if (!/^\d+$/.test(teamNumber.trim())) {
      newErrors.number = 'Team number must be a valid number';
    } else if (existingTeams.some(team => team.number === parseInt(teamNumber.trim()))) {
      newErrors.number = 'Team number already exists';
    }
    
    if (!teamName.trim()) {
      newErrors.name = 'Team name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    const newTeam: Team = {
      number: parseInt(teamNumber.trim()),
      name: teamName.trim()
    };
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onAddTeam(newTeam);
    setTeamNumber('');
    setTeamName('');
    setErrors({});
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <UserPlus className="w-5 h-5 text-green-600" />
        <h2 className="text-xl font-semibold text-gray-800">Add New Team</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="teamNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Team Number
            </label>
            <input
              type="text"
              id="teamNumber"
              value={teamNumber}
              onChange={(e) => setTeamNumber(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.number ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., 12345"
              disabled={isSubmitting}
            />
            {errors.number && (
              <p className="mt-1 text-sm text-red-600">{errors.number}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">
              Team Name
            </label>
            <input
              type="text"
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., Robo Warriors"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Adding Team...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Add Team
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AddTeamForm;