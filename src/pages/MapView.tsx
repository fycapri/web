import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import { Device, EnvironmentData } from '../types';
import { dataService } from '../services/dataService';
import { MapPin, Activity, AlertTriangle, BarChart3, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 修复 Leaflet 默认图标问题
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// 自定义图标
const createCustomIcon = (status: 'online' | 'offline' | 'warning') => {
  const color = status === 'online' ? 'green' : status === 'warning' ? 'orange' : 'gray';
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// 地图自动适应所有标记
function MapBounds({ devices }: { devices: Device[] }) {
  const map = useMap();
  
  useEffect(() => {
    const coordinates = devices
      .filter(d => d.coordinates)
      .map(d => d.coordinates!);
    
    if (coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [devices, map]);
  
  return null;
}

export default function MapView() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [devicesData, setDevicesData] = useState<Map<string, EnvironmentData>>(new Map());
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDataCircles, setShowDataCircles] = useState(true);
  const [dataType, setDataType] = useState<'aqi' | 'pm25' | 'temperature'>('aqi');
  const navigate = useNavigate();
  const amapKey = import.meta.env.VITE_AMAP_KEY as string | undefined;
  const hasAmapKey = Boolean(amapKey);
  const satelliteTileUrl = hasAmapKey
    ? `https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}&size=1&scale=1&lang=zh_cn&key=${amapKey}`
    : undefined;
  const labelTileUrl = hasAmapKey
    ? `https://webrd0{s}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}&size=1&scale=1&lang=zh_cn&key=${amapKey}`
    : undefined;

  useEffect(() => {
    const deviceList = dataService.getDevices();
    setDevices(deviceList);
    setLoading(false);

    // 加载所有设备数据
    const loadData = () => {
      const dataMap = new Map<string, EnvironmentData>();
      deviceList.forEach(device => {
        const data = dataService.getCurrentData(device.id);
        dataMap.set(device.id, data);
      });
      setDevicesData(dataMap);
    };

    loadData();
    const interval = setInterval(loadData, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  const devicesWithCoordinates = devices.filter(d => d.coordinates);

  if (devicesWithCoordinates.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">暂无设备坐标信息</div>
      </div>
    );
  }

  // 计算地图中心点
  const centerLat = devicesWithCoordinates.reduce((sum, d) => sum + d.coordinates![0], 0) / devicesWithCoordinates.length;
  const centerLng = devicesWithCoordinates.reduce((sum, d) => sum + d.coordinates![1], 0) / devicesWithCoordinates.length;

  // 根据数据类型获取值和颜色
  const getDataValue = (data: EnvironmentData): number => {
    switch (dataType) {
      case 'aqi':
        return data.airQuality;
      case 'pm25':
        return data.pm25;
      case 'temperature':
        return data.temperature;
      default:
        return data.airQuality;
    }
  };

  const getDataColor = (value: number, type: 'aqi' | 'pm25' | 'temperature'): string => {
    switch (type) {
      case 'aqi':
        if (value > 200) return '#ef4444'; // red
        if (value > 150) return '#f97316'; // orange
        if (value > 100) return '#f59e0b'; // yellow
        if (value > 50) return '#eab308'; // yellow-500
        return '#10b981'; // green
      case 'pm25':
        if (value > 150) return '#ef4444'; // red
        if (value > 115) return '#f97316'; // orange
        if (value > 75) return '#f59e0b'; // yellow
        if (value > 35) return '#eab308'; // yellow-500
        return '#10b981'; // green
      case 'temperature':
        if (value > 32 || value < 5) return '#ef4444'; // red
        if (value > 28 || value < 10) return '#f59e0b'; // yellow
        return '#10b981'; // green
      default:
        return '#3b82f6';
    }
  };

  const getCircleRadius = (value: number, type: 'aqi' | 'pm25' | 'temperature'): number => {
    switch (type) {
      case 'aqi':
        return Math.max(50, Math.min(300, value * 1.5));
      case 'pm25':
        return Math.max(50, Math.min(300, value * 2));
      case 'temperature':
        return Math.max(50, Math.min(300, Math.abs(value - 20) * 10));
      default:
        return 100;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">地图视图</h1>
          <p className="text-gray-600 mt-1">实时查看所有监测设备的地理位置和环境数据</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2">
            <Layers className="w-4 h-4 text-gray-600" />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showDataCircles}
                onChange={(e) => setShowDataCircles(e.target.checked)}
                className="rounded"
              />
              <span>显示数据圆圈</span>
            </label>
          </div>
          {showDataCircles && (
            <div className="flex gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2">
              <select
                value={dataType}
                onChange={(e) => setDataType(e.target.value as 'aqi' | 'pm25' | 'temperature')}
                className="text-sm border-none outline-none bg-transparent"
              >
                <option value="aqi">AQI</option>
                <option value="pm25">PM2.5</option>
                <option value="temperature">温度</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {!hasAmapKey && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
          未配置 <code>VITE_AMAP_KEY</code>，当前使用 OpenStreetMap 作为临时底图。请参考使用说明配置高德地图 Key 以启用卫星底图。
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 设备列表 */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">设备列表</h2>
          <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
            {devices.map((device) => {
              const data = devicesData.get(device.id);
              const isSelected = selectedDevice?.id === device.id;
              
              return (
                <div
                  key={device.id}
                  onClick={() => setSelectedDevice(device)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 bg-white hover:border-primary-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{device.name}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <MapPin className="w-4 h-4" />
                        {device.location}
                      </p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${
                      device.status === 'online' ? 'bg-green-500' :
                      device.status === 'warning' ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`}></div>
                  </div>
                  
                  {data && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
                        <div>
                          <div className="text-gray-500">温度</div>
                          <div className="font-semibold">{data.temperature.toFixed(1)}°C</div>
                        </div>
                        <div>
                          <div className="text-gray-500">湿度</div>
                          <div className="font-semibold">{data.humidity.toFixed(0)}%</div>
                        </div>
                        <div>
                          <div className="text-gray-500">AQI</div>
                          <div className={`font-semibold ${
                            data.airQuality > 150 ? 'text-red-600' :
                            data.airQuality > 100 ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {data.airQuality}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/analysis?device=${device.id}`)}
                        className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-xs"
                      >
                        <BarChart3 className="w-3 h-3" />
                        <span>查看分析</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 地图 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
            <MapContainer
              center={[centerLat, centerLng]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              {hasAmapKey ? (
                <>
                  <TileLayer
                    attribution="© 高德地图"
                    url={satelliteTileUrl!}
                    subdomains={['1', '2', '3', '4']}
                    maxZoom={18}
                  />
                  <TileLayer
                    attribution=""
                    url={labelTileUrl!}
                    subdomains={['1', '2', '3', '4']}
                    maxZoom={18}
                  />
                </>
              ) : (
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              )}
              <MapBounds devices={devicesWithCoordinates} />
              
              {/* 数据可视化圆圈 */}
              {showDataCircles && devicesWithCoordinates.map((device) => {
                const data = devicesData.get(device.id);
                if (!data) return null;
                
                const dataValue = getDataValue(data);
                const circleColor = getDataColor(dataValue, dataType);
                const circleRadius = getCircleRadius(dataValue, dataType);
                
                return (
                  <Circle
                    key={`circle-${device.id}`}
                    center={device.coordinates!}
                    radius={circleRadius}
                    pathOptions={{
                      fillColor: circleColor,
                      fillOpacity: 0.3,
                      color: circleColor,
                      weight: 2,
                      opacity: 0.6,
                    }}
                  />
                );
              })}
              
              {/* 设备标记 */}
              {devicesWithCoordinates.map((device) => {
                const data = devicesData.get(device.id);
                if (!data) return null;
                
                return (
                  <Marker
                    key={`marker-${device.id}`}
                    position={device.coordinates!}
                    icon={createCustomIcon(device.status)}
                    eventHandlers={{
                      click: () => setSelectedDevice(device),
                    }}
                  >
                    <Popup>
                      <div className="p-2 min-w-[200px]">
                        <h3 className="font-bold text-lg mb-2">{device.name}</h3>
                        <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {device.location}
                        </p>
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs mb-3 ${
                          device.status === 'online' ? 'bg-green-100 text-green-700' :
                          device.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {device.status === 'online' && <Activity className="w-3 h-3" />}
                          {device.status === 'warning' && <AlertTriangle className="w-3 h-3" />}
                          {device.status === 'online' ? '在线' : device.status === 'warning' ? '警告' : '离线'}
                        </div>
                        
                        {data && (
                          <div className="space-y-2 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-gray-500">温度:</span>
                                <span className="ml-1 font-semibold">{data.temperature.toFixed(1)}°C</span>
                              </div>
                              <div>
                                <span className="text-gray-500">湿度:</span>
                                <span className="ml-1 font-semibold">{data.humidity.toFixed(0)}%</span>
                              </div>
                              <div>
                                <span className="text-gray-500">AQI:</span>
                                <span className={`ml-1 font-semibold ${
                                  data.airQuality > 150 ? 'text-red-600' :
                                  data.airQuality > 100 ? 'text-yellow-600' :
                                  'text-green-600'
                                }`}>
                                  {data.airQuality}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">PM2.5:</span>
                                <span className="ml-1 font-semibold">{data.pm25} μg/m³</span>
                              </div>
                            </div>
                            <button
                              onClick={() => navigate(`/analysis?device=${device.id}`)}
                              className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-xs"
                            >
                              <BarChart3 className="w-4 h-4" />
                              <span>查看详细分析</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

