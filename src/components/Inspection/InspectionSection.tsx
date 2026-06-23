import React from 'react';
import { InspectionCard } from './InspectionCard';
import { StatusBadge } from './StatusBadge';
import { ProgressBar } from './ProgressBar';
import { InspectionSection as InspectionSectionType, InspectionItem } from '../../types/inspection';

interface InspectionSectionProps {
  section: InspectionSectionType;
  onItemStatusChange: (sectionId: string, itemId: string, status: InspectionItem['status']) => void;
  onItemNotesChange: (sectionId: string, itemId: string, notes: string) => void;
}

export const InspectionSection: React.FC<InspectionSectionProps> = ({
  section,
  onItemStatusChange,
  onItemNotesChange
}) => {
  const completedItems = section.items.filter(item => item.status !== 'pending').length;
  const failedItems = section.items.filter(item => item.status === 'fail').length;
  const warningItems = section.items.filter(item => item.status === 'warning').length;
  
  const getSectionStatus = (): InspectionItem['status'] => {
    if (completedItems === 0) return 'pending';
    if (failedItems > 0) return 'fail';
    if (warningItems > 0) return 'warning';
    return completedItems === section.items.length ? 'pass' : 'pending';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
        <StatusBadge status={getSectionStatus()} />
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress: {completedItems}/{section.items.length} completed</span>
          <span>{Math.round((completedItems / section.items.length) * 100)}%</span>
        </div>
        <ProgressBar current={completedItems} total={section.items.length} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {section.items.map((item) => (
          <InspectionCard
            key={item.id}
            item={item}
            onStatusChange={(itemId, status) => onItemStatusChange(section.id, itemId, status)}
            onNotesChange={(itemId, notes) => onItemNotesChange(section.id, itemId, notes)}
          />
        ))}
      </div>
    </div>
  );
};