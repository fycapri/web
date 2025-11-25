import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Device, EnvironmentData, TimeRange } from '../types';
import { dataService } from '../services/dataService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download } from 'lucide-react';
import { format } from 'date-fns';
import zhCN from 'date-fns/locale/zh-CN';

export default function Analysis() {
  const [searchParams] = useSearchParams();
  const [devices, setDevices] = useState<Device[]>([]);
  const [devicesData, setDevicesData] = useState<Map<string, EnvironmentData>>(new Map());
  const [historyDataMap, setHistoryDataMap] = useState<Map<string, EnvironmentData[]>>(new Map());
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [analysisType, setAnalysisType] = useState<'comparison' | 'statistics' | 'trend'>('comparison');
  const [selectedMetric, setSelectedMetric] = useState<'temperature' | 'humidity' | 'airQuality' | 'pm25'>('temperature');

  useEffect(() => {
    const deviceList = dataService.getDevices();
    setDevices(deviceList);
    
    // 检查URL参数中是否有设备ID（从地图跳转过来）
    const deviceIdFromUrl = searchParams.get('device');
    if (deviceIdFromUrl && deviceList.find(d => d.id === deviceIdFromUrl)) {
      setSelectedDevices([deviceIdFromUrl]);
    } else {
      setSelectedDevices(deviceList.map(d => d.id));
    }

    // 加载所有设备数据
    const loadData = () => {
      const dataMap = new Map<string, EnvironmentData>();
      const historyMap = new Map<string, EnvironmentData[]>();
      
      deviceList.forEach(device => {
        const data = dataService.getCurrentData(device.id);
        dataMap.set(device.id, data);
        // 加载历史数据
        const history = dataService.getHistoryData(timeRange, device.id);
        historyMap.set(device.id, history);
      });
      
      setDevicesData(dataMap);
      setHistoryDataMap(historyMap);
    };

    loadData();
    const interval = setInterval(loadData, 10000);

    return () => clearInterval(interval);
  }, [timeRange, searchParams]);

  // 对比分析数据
  const comparisonData = selectedDevices.map(deviceId => {
    const device = devices.find(d => d.id === deviceId);
    const data = devicesData.get(deviceId);
    if (!device || !data) return null;
    
    return {
      name: device.name,
      location: device.location,
      温度: data.temperature,
      湿度: data.humidity,
      AQI: data.airQuality,
      PM25: data.pm25,
      PM10: data.pm10,
      噪音: data.noise,
      CO2: data.co2,
    };
  }).filter(Boolean);

  // 统计数据
  const statisticsData = selectedDevices.map(deviceId => {
    const device = devices.find(d => d.id === deviceId);
    const data = devicesData.get(deviceId);
    if (!device || !data) return null;
    
    return {
      name: device.name,
      平均值: (data.temperature + data.humidity + data.airQuality) / 3,
      最大值: Math.max(data.temperature, data.humidity, data.airQuality),
      最小值: Math.min(data.temperature, data.humidity, data.airQuality),
    };
  }).filter(Boolean);

  // 趋势数据（使用真实历史数据）
  const getTrendData = (metric: 'temperature' | 'humidity' | 'airQuality' | 'pm25') => {
    // 获取所有设备的历史数据并合并
    const allHistoryData: { [key: string]: EnvironmentData[] } = {};
    
    selectedDevices.forEach(deviceId => {
      const device = devices.find(d => d.id === deviceId);
      if (device) {
        const history = historyDataMap.get(deviceId) || [];
        allHistoryData[device.name] = history;
      }
    });

    // 根据时间范围确定采样间隔
    let sampleInterval = 1;
    if (timeRange === '7d' || timeRange === '30d') {
      sampleInterval = Math.max(1, Math.floor(historyDataMap.get(selectedDevices[0])?.length || 100 / 50));
    }

    // 构建趋势数据
    const trendDataMap = new Map<string, any>();
    
    selectedDevices.forEach(deviceId => {
      const device = devices.find(d => d.id === deviceId);
      if (!device) return;
      
      const history = historyDataMap.get(deviceId) || [];
      history.forEach((data, index) => {
        if (index % sampleInterval !== 0 && index !== history.length - 1) return;
        
        const timeKey = format(data.timestamp, timeRange === '1h' || timeRange === '6h' ? 'HH:mm' : 'MM-dd HH:mm', { locale: zhCN });
        
        if (!trendDataMap.has(timeKey)) {
          trendDataMap.set(timeKey, { 时间: timeKey });
        }
        
        const trendPoint = trendDataMap.get(timeKey);
        trendPoint[device.name] = data[metric];
      });
    });

    return Array.from(trendDataMap.values()).sort((a, b) => {
      return a.时间.localeCompare(b.时间);
    });
  };

  // 设备状态分布
  const statusData = [
    { name: '在线', value: devices.filter(d => d.status === 'online').length, color: '#10b981' },
    { name: '警告', value: devices.filter(d => d.status === 'warning').length, color: '#f59e0b' },
    { name: '离线', value: devices.filter(d => d.status === 'offline').length, color: '#6b7280' },
  ];

  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: '1h', label: '1小时' },
    { value: '6h', label: '6小时' },
    { value: '24h', label: '24小时' },
    { value: '7d', label: '7天' },
    { value: '30d', label: '30天' },
  ];

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const handleExport = () => {
    const csv = [
      ['设备名称', '位置', '温度', '湿度', 'AQI', 'PM2.5', 'PM10', '噪音', 'CO2'].join(','),
      ...comparisonData.map(d => 
        [d!.name, d!.location, d!.温度, d!.湿度, d!.AQI, d!.PM25, d!.PM10, d!.噪音, d!.CO2].join(',')
      ),
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `环境监测数据_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">数据分析</h1>
          <p className="text-gray-600 mt-1">多维度数据对比分析与统计报表</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>导出数据</span>
          </button>
        </div>
      </div>

      {/* 分析类型切换和时间范围选择 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex gap-2">
            {[
              { value: 'comparison', label: '对比分析' },
              { value: 'statistics', label: '统计分析' },
              { value: 'trend', label: '趋势分析' },
            ].map((type) => (
              <button
                key={type.value}
                onClick={() => setAnalysisType(type.value as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  analysisType === type.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {timeRangeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === option.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 设备选择 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">选择设备</h3>
        <div className="flex flex-wrap gap-2">
          {devices.map((device) => (
            <label
              key={device.id}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={selectedDevices.includes(device.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedDevices([...selectedDevices, device.id]);
                  } else {
                    setSelectedDevices(selectedDevices.filter(id => id !== device.id));
                  }
                }}
                className="rounded"
              />
              <span className="text-sm">{device.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 对比分析 */}
      {analysisType === 'comparison' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">设备数据对比</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="温度" fill="#ef4444" />
                <Bar dataKey="湿度" fill="#3b82f6" />
                <Bar dataKey="AQI" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">PM2.5 对比</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="PM25" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">设备状态分布</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 统计分析 */}
      {analysisType === 'statistics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selectedDevices.map((deviceId) => {
              const device = devices.find(d => d.id === deviceId);
              const data = devicesData.get(deviceId);
              if (!device || !data) return null;

              const avg = (data.temperature + data.humidity + data.airQuality) / 3;
              const max = Math.max(data.temperature, data.humidity, data.airQuality, data.pm25);
              const min = Math.min(data.temperature, data.humidity, data.airQuality, data.pm25);

              return (
                <div key={deviceId} className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">{device.name}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">平均值</span>
                      <span className="font-semibold">{avg.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">最大值</span>
                      <span className="font-semibold text-red-600">{max.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">最小值</span>
                      <span className="font-semibold text-green-600">{min.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">统计对比</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={statisticsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="平均值" fill="#3b82f6" />
                <Bar dataKey="最大值" fill="#ef4444" />
                <Bar dataKey="最小值" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 趋势分析 */}
      {analysisType === 'trend' && (
        <div className="space-y-6">
          {/* 指标选择 */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">选择指标</h3>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'temperature', label: '温度' },
                { value: 'humidity', label: '湿度' },
                { value: 'airQuality', label: 'AQI' },
                { value: 'pm25', label: 'PM2.5' },
              ].map((metric) => (
                <button
                  key={metric.value}
                  onClick={() => setSelectedMetric(metric.value as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedMetric === metric.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {metric.label}
                </button>
              ))}
            </div>
          </div>

          {/* 温度趋势 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">
              {selectedMetric === 'temperature' ? '温度' :
               selectedMetric === 'humidity' ? '湿度' :
               selectedMetric === 'airQuality' ? 'AQI' : 'PM2.5'}趋势对比
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={getTrendData(selectedMetric)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="时间" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                {selectedDevices.map((deviceId, index) => {
                  const device = devices.find(d => d.id === deviceId);
                  if (!device) return null;
                  return (
                    <Line
                      key={deviceId}
                      type="monotone"
                      dataKey={device.name}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

