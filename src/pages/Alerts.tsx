import { useState, useEffect } from 'react';
import { Alert } from '../types';
import { dataService } from '../services/dataService';
import AlertCard from '../components/AlertCard';
import { AlertTriangle, Filter } from 'lucide-react';

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<'all' | 'warning' | 'error' | 'info'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAlerts = () => {
      const alertList = dataService.getAlerts();
      setAlerts(alertList);
      setLoading(false);
    };

    loadAlerts();
    const interval = setInterval(loadAlerts, 10000); // 每10秒更新一次

    return () => clearInterval(interval);
  }, []);

  const handleResolve = (id: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, resolved: true } : alert
      )
    );
  };

  const filteredAlerts = alerts.filter(
    (alert) => filter === 'all' || alert.type === filter
  );

  const unresolvedCount = alerts.filter((a) => !a.resolved).length;
  const warningCount = alerts.filter((a) => a.type === 'warning' && !a.resolved).length;
  const errorCount = alerts.filter((a) => a.type === 'error' && !a.resolved).length;

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
          <h1 className="text-3xl font-bold text-gray-900">告警中心</h1>
          <p className="text-gray-600 mt-1">系统告警信息与处理</p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">未处理告警</p>
              <p className="text-3xl font-bold text-red-600">{unresolvedCount}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">警告</p>
              <p className="text-3xl font-bold text-yellow-600">{warningCount}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">错误</p>
              <p className="text-3xl font-bold text-red-600">{errorCount}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* 筛选器 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700 mr-4">筛选:</span>
          {(['all', 'warning', 'error', 'info'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === type
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type === 'all' ? '全部' : type === 'warning' ? '警告' : type === 'error' ? '错误' : '信息'}
            </button>
          ))}
        </div>
      </div>

      {/* 告警列表 */}
      <div className="space-y-4">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onResolve={handleResolve}
            />
          ))
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-500">
            暂无告警信息
          </div>
        )}
      </div>
    </div>
  );
}


