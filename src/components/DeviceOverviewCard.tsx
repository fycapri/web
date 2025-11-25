import { Device, EnvironmentData } from '../types';
import { MapPin, Thermometer, Droplets, Wind, AlertTriangle } from 'lucide-react';

interface DeviceOverviewCardProps {
  device: Device;
  data: EnvironmentData;
  onClick?: () => void;
  isSelected?: boolean;
}

export default function DeviceOverviewCard({
  device,
  data,
  onClick,
  isSelected = false,
}: DeviceOverviewCardProps) {
  const getStatusColor = (type: string, value: number): string => {
    switch (type) {
      case 'temperature':
        return value > 28 || value < 10 ? 'text-yellow-600' : value > 32 || value < 5 ? 'text-red-600' : 'text-green-600';
      case 'humidity':
        return value > 80 || value < 30 ? 'text-yellow-600' : 'text-green-600';
      case 'airQuality':
        return value > 200 ? 'text-red-600' : value > 100 ? 'text-yellow-600' : 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const statusConfig = {
    online: { color: 'bg-green-500', text: '在线' },
    offline: { color: 'bg-gray-500', text: '离线' },
    warning: { color: 'bg-yellow-500', text: '警告' },
  };

  const config = statusConfig[device.status];

  return (
    <div
      className={`rounded-lg border-2 p-4 cursor-pointer transition-all hover:shadow-lg ${
        isSelected
          ? 'border-primary-500 bg-primary-50'
          : 'bg-white border-gray-200 hover:border-primary-300'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg">{device.name}</h3>
            <div className={`w-2 h-2 rounded-full ${config.color}`}></div>
          </div>
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{device.location}</span>
          </div>
        </div>
      </div>

      {/* 关键指标 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Thermometer className="w-4 h-4 text-gray-400 mr-1" />
            <span className="text-xs text-gray-500">温度</span>
          </div>
          <div className={`text-lg font-bold ${getStatusColor('temperature', data.temperature)}`}>
            {data.temperature.toFixed(1)}°C
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Droplets className="w-4 h-4 text-gray-400 mr-1" />
            <span className="text-xs text-gray-500">湿度</span>
          </div>
          <div className={`text-lg font-bold ${getStatusColor('humidity', data.humidity)}`}>
            {data.humidity.toFixed(0)}%
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Wind className="w-4 h-4 text-gray-400 mr-1" />
            <span className="text-xs text-gray-500">AQI</span>
          </div>
          <div className={`text-lg font-bold ${getStatusColor('airQuality', data.airQuality)}`}>
            {data.airQuality}
          </div>
        </div>
      </div>

      {/* 异常提示 */}
      {(data.temperature > 28 || data.airQuality > 150 || data.pm25 > 75) && (
        <div className="mt-3 flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
          <AlertTriangle className="w-3 h-3" />
          <span>存在异常指标</span>
        </div>
      )}
    </div>
  );
}


