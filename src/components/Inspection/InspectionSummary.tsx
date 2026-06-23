import React from 'react';
import { FileText, Download, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { InspectionData } from '../../types/inspection';

interface InspectionSummaryProps {
  data: InspectionData;
  onGenerateReport: () => void;
}

export const InspectionSummary: React.FC<InspectionSummaryProps> = ({
  data,
  onGenerateReport
}) => {
  const allItems = data.sections.flatMap(section => section.items);
  const totalItems = allItems.length;
  const completedItems = allItems.filter(item => item.status !== 'pending').length;
  const passedItems = allItems.filter(item => item.status === 'pass').length;
  const failedItems = allItems.filter(item => item.status === 'fail').length;
  const warningItems = allItems.filter(item => item.status === 'warning').length;
  const pendingItems = allItems.filter(item => item.status === 'pending').length;

  const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const stats = [
    { label: 'Passed', value: passedItems, icon: CheckCircle, color: 'text-green-600' },
    { label: 'Failed', value: failedItems, icon: XCircle, color: 'text-red-600' },
    { label: 'Warnings', value: warningItems, icon: AlertTriangle, color: 'text-amber-600' },
    { label: 'Pending', value: pendingItems, icon: Clock, color: 'text-gray-600' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="text-blue-600" size={24} />
          Inspection Summary
        </h2>
        <StatusBadge status={data.overallStatus} size="lg" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="text-center p-4 bg-gray-50 rounded-lg">
              <Icon className={`mx-auto mb-2 ${stat.color}`} size={24} />
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm text-gray-600">{completionPercentage}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${
              data.overallStatus === 'pass' ? 'bg-green-500' :
              data.overallStatus === 'fail' ? 'bg-red-500' :
              data.overallStatus === 'warning' ? 'bg-amber-500' :
              'bg-blue-500'
            }`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="font-medium text-gray-900 mb-3">Robot Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div><span className="font-medium">Team Name:</span> {data.robotInfo.name || 'Not specified'}</div>
          <div><span className="font-medium">Inspector:</span> {data.robotInfo.inspector || 'Not specified'}</div>
        </div>
      </div>

      <div className="border-t pt-6 mt-6">
        <button
          onClick={onGenerateReport}
          disabled={completionPercentage < 100}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
            completionPercentage === 100
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Download size={20} />
          Generate Inspection Report
        </button>
        {completionPercentage < 100 && (
          <p className="text-sm text-gray-600 text-center mt-2">
            Complete all inspections to generate report
          </p>
        )}
      </div>
    </div>
  );
};