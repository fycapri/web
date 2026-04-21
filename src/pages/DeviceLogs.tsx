import { useEffect, useMemo, useState } from 'react';
import { format, subHours } from 'date-fns';
import { dataService } from '../services/dataService';
import { Device, DeviceRuntimeLog, LogLevel, PlatformAction, PlatformAuditLog } from '../types';
import { Download, Search, FileText, SlidersHorizontal } from 'lucide-react';

type ActiveTab = 'runtime' | 'audit';

function levelBadge(level: LogLevel) {
  if (level === 'error') return 'bg-red-100 text-red-700';
  if (level === 'warn') return 'bg-yellow-100 text-yellow-700';
  return 'bg-green-100 text-green-700';
}

function levelLabel(level: LogLevel) {
  return level === 'error' ? 'ERROR' : level === 'warn' ? 'WARN' : 'INFO';
}

function toCsv(rows: Record<string, string | number | undefined | null>[]) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = String(v ?? '');
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(',')),
  ];
  return lines.join('\n');
}

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function DeviceLogs() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('runtime');

  // common filters
  const [keyword, setKeyword] = useState('');
  const [level, setLevel] = useState<LogLevel | 'all'>('all');
  const [start, setStart] = useState<Date>(() => subHours(new Date(), 24));
  const [end, setEnd] = useState<Date>(() => new Date());

  // runtime filters
  const [module, setModule] = useState<string | 'all'>('all');

  // audit filters
  const [action, setAction] = useState<PlatformAction | 'all'>('all');
  const [actor, setActor] = useState<string | 'all'>('all');

  // pagination
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [runtime, setRuntime] = useState<{ total: number; items: DeviceRuntimeLog[] }>({ total: 0, items: [] });
  const [audit, setAudit] = useState<{ total: number; items: PlatformAuditLog[] }>({ total: 0, items: [] });
  const [selected, setSelected] = useState<DeviceRuntimeLog | PlatformAuditLog | null>(null);

  useEffect(() => {
    const list = dataService.getDevices();
    setDevices(list);
    setSelectedDeviceId(list[0]?.id ?? '');
  }, []);

  // reset page when switching filters/tabs
  useEffect(() => {
    setPage(1);
  }, [activeTab, selectedDeviceId, keyword, level, module, action, actor, start, end]);

  useEffect(() => {
    if (!selectedDeviceId && activeTab === 'runtime') return;
    if (activeTab === 'runtime') {
      const res = dataService.getDeviceRuntimeLogs({
        deviceId: selectedDeviceId,
        start,
        end,
        level,
        module,
        keyword,
        page,
        pageSize,
      });
      setRuntime(res);
      setSelected(null);
      return;
    }

    const res = dataService.getPlatformAuditLogs({
      start,
      end,
      level,
      action,
      actor,
      deviceId: selectedDeviceId ? selectedDeviceId : 'all',
      keyword,
      page,
      pageSize,
    });
    setAudit(res);
    setSelected(null);
  }, [activeTab, selectedDeviceId, keyword, level, module, action, actor, start, end, page]);

  const selectedDevice = useMemo(() => devices.find((d) => d.id === selectedDeviceId) ?? null, [devices, selectedDeviceId]);

  const total = activeTab === 'runtime' ? runtime.total : audit.total;
  const items = activeTab === 'runtime' ? runtime.items : audit.items;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const runtimeModules = useMemo(() => ['all', 'BOOT', 'SD', 'GPS', 'NET', 'SENSOR', 'UPLOAD', 'RTC', 'USB'], []);
  const actions = useMemo<('all' | PlatformAction)[]>(
    () => ['all', 'cfg_set', 'cfg_save', 'command', 'ota', 'login', 'other'],
    []
  );
  const actors = useMemo(() => ['all', 'admin', 'operator', 'system'], []);

  const exportCsv = () => {
    if (!items.length) return;
    const filename =
      activeTab === 'runtime'
        ? `device_runtime_logs_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`
        : `platform_audit_logs_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`;

    const rows =
      activeTab === 'runtime'
        ? (items as DeviceRuntimeLog[]).map((l) => ({
            time: format(l.timestamp, 'MM-dd HH:mm:ss'),
            level: levelLabel(l.level),
            module: l.module,
            deviceId: l.deviceId,
            message: l.message,
            requestId: l.requestId ?? '',
          }))
        : (items as PlatformAuditLog[]).map((l) => ({
            time: format(l.timestamp, 'MM-dd HH:mm:ss'),
            level: levelLabel(l.level),
            action: l.action,
            actor: l.actor,
            deviceId: l.deviceId ?? '',
            message: l.message,
            requestId: l.requestId ?? '',
          }));

    downloadText(filename, toCsv(rows));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">设备日志</h1>
          <p className="text-gray-600 mt-1">设备运行日志与平台操作日志统一查看</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* left: device filter */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">设备筛选</h2>
            <FileText className="w-5 h-5 text-gray-400" />
          </div>
          <div className="mt-3">
            <div className="text-sm text-gray-600 mb-2">当前设备</div>
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {devices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}（{d.location}）
                </option>
              ))}
            </select>
            {selectedDevice && (
              <div className="mt-3 text-sm text-gray-500">
                <div>类型：{selectedDevice.type}</div>
                <div>状态：{selectedDevice.status}</div>
              </div>
            )}
          </div>

          <div className="mt-6 border-t border-gray-100 pt-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <SlidersHorizontal className="w-4 h-4 text-gray-400" />
              筛选条件
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">级别</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">全部</option>
                  <option value="info">INFO</option>
                  <option value="warn">WARN</option>
                  <option value="error">ERROR</option>
                </select>
              </div>

              {activeTab === 'runtime' ? (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">模块</label>
                  <select
                    value={module}
                    onChange={(e) => setModule(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {runtimeModules.map((m) => (
                      <option key={m} value={m}>
                        {m === 'all' ? '全部' : m}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">动作</label>
                    <select
                      value={action}
                      onChange={(e) => setAction(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {actions.map((a) => (
                        <option key={a} value={a}>
                          {a === 'all' ? '全部' : a}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">操作者</label>
                    <select
                      value={actor}
                      onChange={(e) => setActor(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {actors.map((a) => (
                        <option key={a} value={a}>
                          {a === 'all' ? '全部' : a}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs text-gray-500 mb-1">关键字</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="内容 / requestId / code..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setStart(subHours(new Date(), 24));
                    setEnd(new Date());
                  }}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  最近24小时
                </button>
                <button
                  onClick={() => {
                    setStart(subHours(new Date(), 6));
                    setEnd(new Date());
                  }}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  最近6小时
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* right: table + details */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* tabs + actions */}
          <div className="p-4 border-b border-gray-200 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('runtime')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'runtime' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  设备运行日志
                </button>
                <button
                  onClick={() => setActiveTab('audit')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'audit' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  平台操作日志
                </button>
              </div>
              <button
                onClick={exportCsv}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                导出 CSV
              </button>
            </div>
            <div className="text-sm text-gray-500">
              时间范围：{format(start, 'MM-dd HH:mm')} ~ {format(end, 'MM-dd HH:mm')}，共 {total} 条
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px]">
            {/* table */}
            <div className="overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium w-40">时间</th>
                    <th className="text-left px-4 py-3 font-medium w-24">级别</th>
                    <th className="text-left px-4 py-3 font-medium w-28">
                      {activeTab === 'runtime' ? '模块' : '动作'}
                    </th>
                    <th className="text-left px-4 py-3 font-medium w-32">
                      {activeTab === 'runtime' ? '设备ID' : '操作者'}
                    </th>
                    <th className="text-left px-4 py-3 font-medium">内容</th>
                    <th className="text-left px-4 py-3 font-medium w-44">request_id</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row) => {
                    const isSelected = selected?.id === row.id;
                    const lv = row.level;
                    return (
                      <tr
                        key={row.id}
                        onClick={() => setSelected(row)}
                        className={`cursor-pointer border-t border-gray-100 ${
                          isSelected ? 'bg-primary-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="px-4 py-3 font-mono text-gray-800">{format(row.timestamp, 'MM-dd HH:mm:ss')}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${levelBadge(lv)}`}>
                            {levelLabel(lv)}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-gray-800">
                          {activeTab === 'runtime' ? (row as DeviceRuntimeLog).module : (row as PlatformAuditLog).action}
                        </td>
                        <td className="px-4 py-3 font-mono text-gray-800">
                          {activeTab === 'runtime' ? (row as DeviceRuntimeLog).deviceId : (row as PlatformAuditLog).actor}
                        </td>
                        <td className="px-4 py-3 text-gray-800">{row.message}</td>
                        <td className="px-4 py-3 font-mono text-gray-500">{row.requestId ?? '-'}</td>
                      </tr>
                    );
                  })}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                        暂无日志
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* pagination */}
              <div className="p-4 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  第 {page} / {totalPages} 页（每页 {pageSize} 条）
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className={`px-3 py-2 rounded-lg text-sm border ${
                      page <= 1 ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    上一页
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className={`px-3 py-2 rounded-lg text-sm border ${
                      page >= totalPages ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    下一页
                  </button>
                </div>
              </div>
            </div>

            {/* details */}
            <div className="border-t xl:border-t-0 xl:border-l border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">详情</h3>
              </div>

              {selected ? (
                <div className="mt-4 space-y-3 text-sm">
                  <div>
                    <div className="text-gray-500">时间</div>
                    <div className="font-mono text-gray-900">{format(selected.timestamp, 'yyyy-MM-dd HH:mm:ss')}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-gray-500">级别</div>
                      <div className="text-gray-900 font-semibold">{levelLabel(selected.level)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">request_id</div>
                      <div className="font-mono text-gray-900">{selected.requestId ?? '-'}</div>
                    </div>
                  </div>

                  {activeTab === 'runtime' ? (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-gray-500">模块</div>
                          <div className="font-mono text-gray-900">{(selected as DeviceRuntimeLog).module}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">设备ID</div>
                          <div className="font-mono text-gray-900">{(selected as DeviceRuntimeLog).deviceId}</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">内容</div>
                        <div className="text-gray-900">{selected.message}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-gray-500">动作</div>
                          <div className="font-mono text-gray-900">{(selected as PlatformAuditLog).action}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">操作者</div>
                          <div className="font-mono text-gray-900">{(selected as PlatformAuditLog).actor}</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">关联设备</div>
                        <div className="font-mono text-gray-900">{(selected as PlatformAuditLog).deviceId ?? '-'}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">内容</div>
                        <div className="text-gray-900">{selected.message}</div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="mt-8 text-sm text-gray-500">点击表格行查看详情。</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

