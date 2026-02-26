import React from 'react';
import { cn } from '@/utils/css-utils';
import { CheckCircle, XCircle, Clock, AlertCircle, Ban } from 'lucide-react';

export type StatusVariant = 'success' | 'error' | 'warning' | 'info' | 'default' | 'cancelled';

interface StatusBadgeProps {
  variant: StatusVariant;
  children: React.ReactNode;
  icon?: boolean;
  className?: string;
}

const variantStyles: Record<StatusVariant, string> = {
  success: 'bg-green-100 text-green-800 border-green-200',
  error: 'bg-red-100 text-red-800 border-red-200',
  warning: 'bg-orange-100 text-orange-800 border-orange-200',
  info: 'bg-blue-100 text-blue-800 border-blue-200',
  default: 'bg-gray-100 text-gray-800 border-gray-200',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
};

const variantIcons: Record<StatusVariant, React.ReactNode> = {
  success: <CheckCircle className="h-4 w-4" />,
  error: <XCircle className="h-4 w-4" />,
  warning: <Clock className="h-4 w-4" />,
  info: <AlertCircle className="h-4 w-4" />,
  default: <AlertCircle className="h-4 w-4" />,
  cancelled: <Ban className="h-4 w-4" />,
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant,
  children,
  icon = true,
  className,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        variantStyles[variant],
        className
      )}
    >
      {icon && variantIcons[variant]}
      {children}
    </span>
  );
};

export default StatusBadge;
