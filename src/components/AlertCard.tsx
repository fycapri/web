import { Alert } from '../types';
import { AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { format } from 'date-fns';
import zhCN from 'date-fns/locale/zh-CN';

interface AlertCardProps {
  alert: Alert;
  onResolve?: (id: string) => void;
}

export default function AlertCard({ alert, onResolve }: AlertCardProps) {
  const typeConfig = {
    warning: {
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50 border-yellow-200',
    },
    error: {
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50 border-red-200',
    },
    info: {
      icon: Info,
      color: 'text-blue-600',
      bg: 'bg-blue-50 border-blue-200',
    },
  };

  const config = typeConfig[alert.type];
  const Icon = config.icon;

  return (
    <div className={`rounded-lg border-2 p-4 ${config.bg} ${alert.resolved ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <Icon className={`w-5 h-5 mt-0.5 ${config.color}`} />
          <div className="flex-1">
            <p className="font-medium mb-1">{alert.message}</p>
            <p className="text-sm text-gray-600">
              {format(alert.timestamp, 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })}
            </p>
          </div>
        </div>
        {!alert.resolved && onResolve && (
          <button
            onClick={() => onResolve(alert.id)}
            className="ml-2 p-1 hover:bg-white rounded transition-colors"
            aria-label="解决告警"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>
    </div>
  );
}

