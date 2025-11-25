import { useState, useEffect } from 'react';
import { EnvironmentData, TimeRange, Device } from '../types';
import { dataService } from '../services/dataService';
import MetricCard from '../components/MetricCard';
import LineChart from '../components/LineChart';
import DeviceOverviewCard from '../components/DeviceOverviewCard';
import {
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Volume2,
  Cloud,
} from 'lucide-react';

export default function Dashboard() {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [currentData, setCurrentData] = useState<EnvironmentData | null>(null);
  const [historyData, setHistoryData] = useState<EnvironmentData[]>([]);
  const [devicesData, setDevicesData] = useState<Map<string, EnvironmentData>>(new Map());
  const [devices, setDevices] = useState<Device[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [loading, setLoading] = useState(true);

  // 加载所有设备的数据
  useEffect(() => {
    const deviceList = dataService.getDevices();
    setDevices(deviceList);

    // 获取所有设备的实时数据
    const loadAllDevicesData = () => {
      const dataMap = new Map<string, EnvironmentData>();
      deviceList.forEach(device => {
        const data = dataService.getCurrentData(device.id);
        dataMap.set(device.id, data);
      });
      setDevicesData(dataMap);

      // 默认选择第一个设备
      if (!selectedDeviceId && deviceList.length > 0) {
        setSelectedDeviceId(deviceList[0].id);
        setCurrentData(dataMap.get(deviceList[0].id) || null);
        setHistoryData(dataService.getHistoryData(timeRange, deviceList[0].id));
      }
    };

    loadAllDevicesData();
    setLoading(false);

    // 实时更新所有设备数据
    const interval = setInterval(loadAllDevicesData, 5000);

    return () => clearInterval(interval);
  }, []);

  // 当选择设备变化时，更新详细数据
  useEffect(() => {
    if (selectedDeviceId) {
      const data = devicesData.get(selectedDeviceId);
      if (data) {
        setCurrentData(data);
        setHistoryData(dataService.getHistoryData(timeRange, selectedDeviceId));
      }
    }
  }, [selectedDeviceId, timeRange, devicesData]);

  // 实时更新选中设备的数据
  useEffect(() => {
    if (!selectedDeviceId) return;

    const handleUpdate = (newData: EnvironmentData) => {
      setCurrentData(newData);
      const newMap = new Map(devicesData);
      newMap.set(selectedDeviceId, newData);
      setDevicesData(newMap);
    };

    dataService.startRealTimeUpdates(handleUpdate, selectedDeviceId, 5000);

    return () => {
      dataService.stopRealTimeUpdates();
    };
  }, [selectedDeviceId]);

  const getStatus = (type: string, value: number): 'good' | 'warning' | 'danger' => {
    switch (type) {
      case 'temperature':
        return value > 28 || value < 10 ? 'warning' : value > 32 || value < 5 ? 'danger' : 'good';
      case 'humidity':
        return value > 80 || value < 30 ? 'warning' : 'good';
      case 'airQuality':
        return value > 200 ? 'danger' : value > 100 ? 'warning' : 'good';
      case 'pm25':
        return value > 150 ? 'danger' : value > 75 ? 'warning' : 'good';
      case 'noise':
        return value > 70 ? 'warning' : value > 85 ? 'danger' : 'good';
      case 'co2':
        return value > 1000 ? 'warning' : value > 1500 ? 'danger' : 'good';
      default:
        return 'good';
    }
  };

  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: '1h', label: '1小时' },
    { value: '6h', label: '6小时' },
    { value: '24h', label: '24小时' },
    { value: '7d', label: '7天' },
    { value: '30d', label: '30天' },
  ];

  const selectedDevice = selectedDeviceId ? devices.find(d => d.id === selectedDeviceId) : null;

  if (loading || devices.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 标题和时间范围选择 */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">环境监测仪表盘</h1>
          <p className="text-gray-600 mt-1">实时监测所有设备环境数据</p>
        </div>
        {selectedDevice && (
          <div className="flex gap-2 flex-wrap">
            {timeRangeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === option.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 所有设备概览 */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">设备概览</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {devices.map((device) => {
            const deviceData = devicesData.get(device.id);
            if (!deviceData) return null;
            return (
              <DeviceOverviewCard
                key={device.id}
                device={device}
                data={deviceData}
                isSelected={selectedDeviceId === device.id}
                onClick={() => setSelectedDeviceId(device.id)}
              />
            );
          })}
        </div>
      </div>

      {/* 选中设备的详细数据 */}
      {selectedDevice && currentData && (
        <>
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedDevice.name} - 详细数据
                </h2>
                <p className="text-sm text-gray-600 mt-1">{selectedDevice.location}</p>
              </div>
            </div>

            {/* 详细指标卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <MetricCard
                title="温度"
                value={currentData.temperature.toFixed(1)}
                unit="°C"
                icon={Thermometer}
                status={getStatus('temperature', currentData.temperature)}
              />
              <MetricCard
                title="湿度"
                value={currentData.humidity.toFixed(1)}
                unit="%"
                icon={Droplets}
                status={getStatus('humidity', currentData.humidity)}
              />
              <MetricCard
                title="空气质量"
                value={currentData.airQuality}
                unit="AQI"
                icon={Wind}
                status={getStatus('airQuality', currentData.airQuality)}
              />
              <MetricCard
                title="PM2.5"
                value={currentData.pm25}
                unit="μg/m³"
                icon={Gauge}
                status={getStatus('pm25', currentData.pm25)}
              />
              <MetricCard
                title="PM10"
                value={currentData.pm10}
                unit="μg/m³"
                icon={Gauge}
                status={getStatus('pm25', currentData.pm10)}
              />
              <MetricCard
                title="噪音"
                value={currentData.noise}
                unit="dB"
                icon={Volume2}
                status={getStatus('noise', currentData.noise)}
              />
              <MetricCard
                title="二氧化碳"
                value={currentData.co2}
                unit="ppm"
                icon={Cloud}
                status={getStatus('co2', currentData.co2)}
              />
            </div>

            {/* 图表区域 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">温度趋势</h3>
                <div className="h-64">
                  <LineChart
                    data={historyData}
                    dataKey="temperature"
                    name="温度"
                    color="#ef4444"
                    unit="°C"
                  />
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">湿度趋势</h3>
                <div className="h-64">
                  <LineChart
                    data={historyData}
                    dataKey="humidity"
                    name="湿度"
                    color="#3b82f6"
                    unit="%"
                  />
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">PM2.5 趋势</h3>
                <div className="h-64">
                  <LineChart
                    data={historyData}
                    dataKey="pm25"
                    name="PM2.5"
                    color="#f59e0b"
                    unit="μg/m³"
                  />
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">空气质量指数</h3>
                <div className="h-64">
                  <LineChart
                    data={historyData}
                    dataKey="airQuality"
                    name="AQI"
                    color="#10b981"
                    unit="AQI"
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
