import { useState, useEffect } from 'react';
import { Device } from '../types';
import { dataService } from '../services/dataService';
import DeviceCard from '../components/DeviceCard';
import { Plus, Search } from 'lucide-react';

export default function Devices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDevices = () => {
      const deviceList = dataService.getDevices();
      setDevices(deviceList);
      setLoading(false);
    };

    loadDevices();
    const interval = setInterval(loadDevices, 30000); // 每30秒更新一次

    return () => clearInterval(interval);
  }, []);

  const filteredDevices = devices.filter(
    (device) =>
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onlineCount = devices.filter((d) => d.status === 'online').length;
  const warningCount = devices.filter((d) => d.status === 'warning').length;
  const offlineCount = devices.filter((d) => d.status === 'offline').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">设备管理</h1>
          <p className="text-gray-600 mt-1">监测设备状态与信息管理</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          <Plus className="w-5 h-5" />
          <span>添加设备</span>
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">在线设备</p>
              <p className="text-3xl font-bold text-green-600">{onlineCount}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">警告设备</p>
              <p className="text-3xl font-bold text-yellow-600">{warningCount}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 bg-yellow-500 rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">离线设备</p>
              <p className="text-3xl font-bold text-gray-600">{offlineCount}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 bg-gray-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 搜索栏 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索设备名称或位置..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* 设备列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDevices.length > 0 ? (
          filteredDevices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              onClick={() => {
                // 可以导航到设备详情页
                console.log('查看设备:', device.id);
              }}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            未找到匹配的设备
          </div>
        )}
      </div>
    </div>
  );
}


