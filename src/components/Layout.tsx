import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Activity, AlertTriangle, Settings, Menu, X, Map, BarChart3 } from 'lucide-react';
import { useState } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { path: '/', label: '仪表盘', icon: LayoutDashboard },
    { path: '/map', label: '地图视图', icon: Map },
    { path: '/analysis', label: '数据分析', icon: BarChart3 },
    { path: '/devices', label: '设备管理', icon: Activity },
    { path: '/alerts', label: '告警中心', icon: AlertTriangle },
    { path: '/settings', label: '系统设置', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 移动端顶部栏 */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary-600">环境监测平台</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex">
        {/* 侧边栏 */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out`}
        >
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-gray-200 hidden lg:block">
              <h1 className="text-2xl font-bold text-primary-600">环境监测平台</h1>
              <p className="text-sm text-gray-500 mt-1">Environmental Monitoring</p>
            </div>
            <nav className="flex-1 p-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* 遮罩层（移动端） */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* 主内容区 */}
        <main className="flex-1 lg:ml-0">
          <div className="p-4 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

