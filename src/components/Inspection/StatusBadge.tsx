import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: 'pending' | 'pass' | 'fail' | 'warning';
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  const iconSize = size === 'sm' ? 12 : size === 'md' ? 16 : 20;

  const configs = {
    pending: {
      icon: Clock,
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-700',
      label: 'Pending'
    },
    pass: {
      icon: CheckCircle,
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
      label: 'Pass'
    },
    fail: {
      icon: XCircle,
      bgColor: 'bg-red-100',
      textColor: 'text-red-700',
      label: 'Fail'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-700',
      label: 'Warning'
    }
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses[size]} ${config.bgColor} ${config.textColor}`}>
      <Icon size={iconSize} />
      {config.label}
    </span>
  );
};