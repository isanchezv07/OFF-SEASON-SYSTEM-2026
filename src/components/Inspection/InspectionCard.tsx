import React from 'react';
import { StatusBadge } from './StatusBadge';
import { InspectionItem } from '../../types/inspection';

interface InspectionCardProps {
  item: InspectionItem;
  onStatusChange: (id: string, status: InspectionItem['status']) => void;
  onNotesChange: (id: string, notes: string) => void;
}

export const InspectionCard: React.FC<InspectionCardProps> = ({
  item,
  onStatusChange,
  onNotesChange
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-1">{item.name}</h4>
          {item.required && (
            <span className="text-xs text-red-600 font-medium">Required</span>
          )}
        </div>
        <StatusBadge status={item.status} size="sm" />
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        {(['pass','fail'] as const).map((status) => (
          <button
            key={status}
            onClick={() => onStatusChange(item.id, status)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              item.status === status
                ? status === 'pass'
                  ? 'bg-green-600 text-white'
                  : 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};