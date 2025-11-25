import { useState } from 'react';
import { Bell, Database, Palette, Globe } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({
    notifications: true,
    autoRefresh: true,
    refreshInterval: 5,
    theme: 'light',
    language: 'zh-CN',
    dataRetention: 30,
  });

  const handleChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">系统设置</h1>
        <p className="text-gray-600 mt-1">平台配置与个性化设置</p>
      </div>

      <div className="space-y-6">
        {/* 通知设置 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold">通知设置</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">启用通知</p>
                <p className="text-sm text-gray-600">接收系统告警和重要信息</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => handleChange('notifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* 数据设置 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold">数据设置</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">自动刷新</p>
                <p className="text-sm text-gray-600">自动更新实时数据</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoRefresh}
                  onChange={(e) => handleChange('autoRefresh', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
            {settings.autoRefresh && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  刷新间隔: {settings.refreshInterval} 秒
                </label>
                <input
                  type="range"
                  min="1"
                  max="60"
                  value={settings.refreshInterval}
                  onChange={(e) => handleChange('refreshInterval', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2">
                数据保留期限: {settings.dataRetention} 天
              </label>
              <input
                type="range"
                min="7"
                max="365"
                value={settings.dataRetention}
                onChange={(e) => handleChange('dataRetention', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* 外观设置 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Palette className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold">外观设置</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">主题</label>
              <select
                value={settings.theme}
                onChange={(e) => handleChange('theme', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="light">浅色</option>
                <option value="dark">深色</option>
                <option value="auto">自动</option>
              </select>
            </div>
          </div>
        </div>

        {/* 语言设置 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold">语言设置</h2>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">语言</label>
            <select
              value={settings.language}
              onChange={(e) => handleChange('language', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="zh-CN">简体中文</option>
              <option value="zh-TW">繁体中文</option>
              <option value="en-US">English</option>
            </select>
          </div>
        </div>

        {/* 保存按钮 */}
        <div className="flex justify-end gap-4">
          <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            取消
          </button>
          <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            保存设置
          </button>
        </div>
      </div>
    </div>
  );
}

