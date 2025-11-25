import { Device } from '../types';
import { Activity, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';
import zhCN from 'date-fns/locale/zh-CN';

interface DeviceCardProps {
  device: Device;
  onClick?: () => void;
}

export default function DeviceCard({ device, onClick }: DeviceCardProps) {
  const statusConfig = {
    online: {
      color: 'bg-green-500',
      text: '在线',
      bg: 'bg-green-50 border-green-200',
    },
    offline: {
      color: 'bg-gray-500',
      text: '离线',
      bg: 'bg-gray-50 border-gray-200',
    },
    warning: {
      color: 'bg-yellow-500',
      text: '警告',
      bg: 'bg-yellow-50 border-yellow-200',
    },
  };

  const config = statusConfig[device.status];

  return (
    <div
      className={`rounded-lg border-2 p-4 cursor-pointer transition-all hover:shadow-lg ${config.bg}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg mb-1">{device.name}</h3>
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{device.location}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
          <span className="text-sm font-medium">{config.text}</span>
        </div>
      </div>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center text-gray-600">
          <Activity className="w-4 h-4 mr-1" />
          <span>{device.type}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Clock className="w-4 h-4 mr-1" />
          <span>
            {format(device.lastUpdate, 'HH:mm', { locale: zhCN })}
          </span>
        </div>
      </div>
    </div>
  );
}

