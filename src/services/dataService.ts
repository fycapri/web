import { EnvironmentData, Device, Alert, TimeRange, DeviceRuntimeLog, PlatformAuditLog, LogLevel, PlatformAction } from '../types';

// 模拟数据生成函数
function generateRandomValue(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function generateEnvironmentData(location: string): EnvironmentData {
  return {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date(),
    temperature: generateRandomValue(15, 30),
    humidity: generateRandomValue(30, 80),
    airQuality: Math.floor(generateRandomValue(0, 300)),
    pm25: Math.floor(generateRandomValue(0, 150)),
    pm10: Math.floor(generateRandomValue(0, 200)),
    noise: Math.floor(generateRandomValue(30, 80)),
    co2: Math.floor(generateRandomValue(350, 1000)),
    location,
  };
}

// 模拟设备数据（全部位于杭州区域，包含坐标信息）
const devices: Device[] = [
  {
    id: '1',
    name: '钱塘智控中心',
    location: '上城·钱塘智慧城',
    status: 'online',
    lastUpdate: new Date(),
    type: '综合监测站',
    coordinates: [30.245, 120.2105],
  },
  {
    id: '2',
    name: '滨江研发园',
    location: '滨江·江南大道园区',
    status: 'online',
    lastUpdate: new Date(),
    type: '综合监测站',
    coordinates: [30.205, 120.2108],
  },
  {
    id: '3',
    name: '萧山生产基地',
    location: '萧山·临江工业区',
    status: 'warning',
    lastUpdate: new Date(Date.now() - 60000),
    type: '工业监测站',
    coordinates: [30.162, 120.311],
  },
  {
    id: '4',
    name: '余杭仓储中心',
    location: '余杭·仓储物流园',
    status: 'online',
    lastUpdate: new Date(),
    type: '仓储监测站',
    coordinates: [30.421, 120.013],
  },
  {
    id: '5',
    name: '良渚文化园',
    location: '余杭·良渚古城遗址',
    status: 'offline',
    lastUpdate: new Date(Date.now() - 5 * 60 * 1000),
    type: '环境监测站',
    coordinates: [30.402, 119.969],
  },
  {
    id: '6',
    name: '西湖生态站',
    location: '西湖·玉皇山路',
    status: 'online',
    lastUpdate: new Date(),
    type: '生态监测站',
    coordinates: [30.238, 120.1405],
  },
  {
    id: '7',
    name: '临平高新园',
    location: '临平·星桥街道',
    status: 'online',
    lastUpdate: new Date(),
    type: '综合监测站',
    coordinates: [30.421, 120.302],
  },
  {
    id: '8',
    name: '大江东智造基地',
    location: '钱塘·临港产业带',
    status: 'warning',
    lastUpdate: new Date(Date.now() - 2 * 60 * 1000),
    type: '工业监测站',
    coordinates: [30.109, 120.455],
  },
];

function generateRequestId(): string {
  return `req_${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 6)}`;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomLevel(): LogLevel {
  const r = Math.random();
  if (r < 0.78) return 'info';
  if (r < 0.93) return 'warn';
  return 'error';
}

const runtimeModules = ['BOOT', 'SD', 'GPS', 'NET', 'SENSOR', 'UPLOAD', 'RTC', 'USB'];
const runtimeMessages: Record<string, string[]> = {
  BOOT: ['系统启动完成，配置加载 OK', '检测到配置升级，自动更新配置文件', 'EEPROM 同步完成'],
  SD: ['SD 卡挂载成功', 'events.log 写入 OK', 'SD 卡写入失败，回退 EEPROM'],
  GPS: ['GPS 信号弱，lat/lon 不更新', 'GPS 恢复正常', '定位数据更新'],
  NET: ['网络断开，进入离线缓存模式', '网络恢复，开始补传', 'APN 配置无效，拨号失败'],
  SENSOR: ['传感器上线', '传感器数据超限', '传感器无数据'],
  UPLOAD: ['上传任务开始，队列=3', '上传成功', '上传失败，将重试'],
  RTC: ['RTC 时间校准完成', 'RTC 读取失败，使用默认时间'],
  USB: ['USB 切换到 CDC_ONLY', 'USB 切换到 CDC_MSC'],
};

const auditActors = ['admin', 'operator', 'system'];
const auditActions: PlatformAction[] = ['cfg_set', 'cfg_save', 'command', 'ota', 'login', 'other'];

function generateDeviceRuntimeLogs(deviceId: string, count: number, start: Date, end: Date): DeviceRuntimeLog[] {
  const span = end.getTime() - start.getTime();
  const logs: DeviceRuntimeLog[] = [];
  for (let i = 0; i < count; i++) {
    const module = pick(runtimeModules);
    const timestamp = new Date(start.getTime() + Math.random() * span);
    const level = randomLevel();
    const message = pick(runtimeMessages[module] || ['状态更新']);
    logs.push({
      id: `${deviceId}-rt-${Math.random().toString(36).slice(2, 10)}`,
      timestamp,
      level,
      module,
      deviceId,
      message,
      requestId: generateRequestId(),
    });
  }
  return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

function generatePlatformAuditLogs(count: number, start: Date, end: Date): PlatformAuditLog[] {
  const span = end.getTime() - start.getTime();
  const logs: PlatformAuditLog[] = [];
  for (let i = 0; i < count; i++) {
    const timestamp = new Date(start.getTime() + Math.random() * span);
    const level = randomLevel();
    const action = pick(auditActions);
    const actor = pick(auditActors);
    const device = Math.random() < 0.7 ? pick(devices) : undefined;
    const msg =
      action === 'cfg_set'
        ? '修改设备配置字段'
        : action === 'cfg_save'
          ? '保存设备配置'
          : action === 'command'
            ? '下发设备命令'
            : action === 'ota'
              ? '触发 OTA 升级'
              : action === 'login'
                ? '用户登录'
                : '平台操作';
    logs.push({
      id: `audit-${Math.random().toString(36).slice(2, 10)}`,
      timestamp,
      level,
      action,
      actor,
      deviceId: device?.id,
      message: device ? `${msg}（${device.name}）` : msg,
      requestId: generateRequestId(),
    });
  }
  return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

// 数据服务类
class DataService {
  private dataCache: Map<string, EnvironmentData[]> = new Map();
  private intervalId: number | null = null;
  private runtimeLogCache: Map<string, DeviceRuntimeLog[]> = new Map();
  private auditLogCache: PlatformAuditLog[] | null = null;

  // 获取实时数据
  getCurrentData(deviceId?: string): EnvironmentData {
    if (deviceId) {
      const device = devices.find(d => d.id === deviceId);
      if (device) {
        return generateEnvironmentData(device.location);
      }
    }
    // 默认返回第一个设备的数据
    return generateEnvironmentData(devices[0]?.location || '主监测点');
  }

  // 获取指定设备的数据
  getDeviceData(deviceId: string): EnvironmentData {
    const device = devices.find(d => d.id === deviceId);
    if (device) {
      return generateEnvironmentData(device.location);
    }
    return this.getCurrentData();
  }

  // 获取所有设备的汇总数据（平均值）
  getAllDevicesData(): EnvironmentData {
    const allData = devices.map(device => generateEnvironmentData(device.location));
    return {
      id: 'all',
      timestamp: new Date(),
      temperature: allData.reduce((sum, d) => sum + d.temperature, 0) / allData.length,
      humidity: allData.reduce((sum, d) => sum + d.humidity, 0) / allData.length,
      airQuality: Math.floor(allData.reduce((sum, d) => sum + d.airQuality, 0) / allData.length),
      pm25: Math.floor(allData.reduce((sum, d) => sum + d.pm25, 0) / allData.length),
      pm10: Math.floor(allData.reduce((sum, d) => sum + d.pm10, 0) / allData.length),
      noise: Math.floor(allData.reduce((sum, d) => sum + d.noise, 0) / allData.length),
      co2: Math.floor(allData.reduce((sum, d) => sum + d.co2, 0) / allData.length),
      location: '全部设备汇总',
    };
  }

  // 获取历史数据
  getHistoryData(timeRange: TimeRange, deviceId?: string): EnvironmentData[] {
    const cacheKey = `${timeRange}-${deviceId || 'all'}`;
    
    if (this.dataCache.has(cacheKey)) {
      return this.dataCache.get(cacheKey)!;
    }

    const now = new Date();
    const data: EnvironmentData[] = [];
    let count = 0;
    let interval = 0;

    switch (timeRange) {
      case '1h':
        count = 60;
        interval = 60000; // 1分钟
        break;
      case '6h':
        count = 72;
        interval = 300000; // 5分钟
        break;
      case '24h':
        count = 96;
        interval = 900000; // 15分钟
        break;
      case '7d':
        count = 168;
        interval = 3600000; // 1小时
        break;
      case '30d':
        count = 720;
        interval = 3600000; // 1小时
        break;
    }

    let location = '主监测点';
    if (deviceId && deviceId !== 'all') {
      const device = devices.find(d => d.id === deviceId);
      if (device) {
        location = device.location;
      }
    }

    for (let i = count; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * interval);
      let baseData: EnvironmentData;
      
      if (deviceId === 'all') {
        // 生成汇总数据
        const allData = devices.map(device => generateEnvironmentData(device.location));
        baseData = {
          id: 'all',
          timestamp,
          temperature: allData.reduce((sum, d) => sum + d.temperature, 0) / allData.length,
          humidity: allData.reduce((sum, d) => sum + d.humidity, 0) / allData.length,
          airQuality: Math.floor(allData.reduce((sum, d) => sum + d.airQuality, 0) / allData.length),
          pm25: Math.floor(allData.reduce((sum, d) => sum + d.pm25, 0) / allData.length),
          pm10: Math.floor(allData.reduce((sum, d) => sum + d.pm10, 0) / allData.length),
          noise: Math.floor(allData.reduce((sum, d) => sum + d.noise, 0) / allData.length),
          co2: Math.floor(allData.reduce((sum, d) => sum + d.co2, 0) / allData.length),
          location: '全部设备汇总',
        };
      } else {
        baseData = generateEnvironmentData(location);
      }
      
      data.push({
        ...baseData,
        timestamp,
      });
    }

    this.dataCache.set(cacheKey, data);
    return data;
  }

  // 获取所有设备
  getDevices(): Device[] {
    return devices.map(device => ({
      ...device,
      lastUpdate: new Date(device.lastUpdate),
    }));
  }

  getDeviceRuntimeLogs(params: {
    deviceId: string;
    start: Date;
    end: Date;
    level?: LogLevel | 'all';
    module?: string | 'all';
    keyword?: string;
    page?: number;
    pageSize?: number;
  }): { total: number; items: DeviceRuntimeLog[] } {
    const {
      deviceId,
      start,
      end,
      level = 'all',
      module = 'all',
      keyword = '',
      page = 1,
      pageSize = 20,
    } = params;

    const cacheKey = `${deviceId}-${start.toISOString()}-${end.toISOString()}`;
    let logs = this.runtimeLogCache.get(cacheKey);
    if (!logs) {
      logs = generateDeviceRuntimeLogs(deviceId, 220, start, end);
      this.runtimeLogCache.set(cacheKey, logs);
    }

    const kw = keyword.trim().toLowerCase();
    const filtered = logs.filter((l) => {
      if (level !== 'all' && l.level !== level) return false;
      if (module !== 'all' && l.module !== module) return false;
      if (!kw) return true;
      return (
        l.message.toLowerCase().includes(kw) ||
        l.module.toLowerCase().includes(kw) ||
        (l.requestId || '').toLowerCase().includes(kw)
      );
    });

    const total = filtered.length;
    const startIdx = (page - 1) * pageSize;
    const items = filtered.slice(startIdx, startIdx + pageSize);
    return { total, items };
  }

  getPlatformAuditLogs(params: {
    start: Date;
    end: Date;
    level?: LogLevel | 'all';
    action?: PlatformAction | 'all';
    actor?: string | 'all';
    deviceId?: string | 'all';
    keyword?: string;
    page?: number;
    pageSize?: number;
  }): { total: number; items: PlatformAuditLog[] } {
    const {
      start,
      end,
      level = 'all',
      action = 'all',
      actor = 'all',
      deviceId = 'all',
      keyword = '',
      page = 1,
      pageSize = 20,
    } = params;

    if (!this.auditLogCache) {
      this.auditLogCache = generatePlatformAuditLogs(260, start, end);
    }

    const kw = keyword.trim().toLowerCase();
    const filtered = this.auditLogCache.filter((l) => {
      if (l.timestamp < start || l.timestamp > end) return false;
      if (level !== 'all' && l.level !== level) return false;
      if (action !== 'all' && l.action !== action) return false;
      if (actor !== 'all' && l.actor !== actor) return false;
      if (deviceId !== 'all' && l.deviceId !== deviceId) return false;
      if (!kw) return true;
      return (
        l.message.toLowerCase().includes(kw) ||
        l.action.toLowerCase().includes(kw) ||
        l.actor.toLowerCase().includes(kw) ||
        (l.requestId || '').toLowerCase().includes(kw)
      );
    });

    const total = filtered.length;
    const startIdx = (page - 1) * pageSize;
    const items = filtered.slice(startIdx, startIdx + pageSize);
    return { total, items };
  }

  // 获取告警信息
  getAlerts(): Alert[] {
    const alerts: Alert[] = [];
    const currentData = this.getCurrentData();

    // 生成基于数据的告警
    if (currentData.temperature > 28) {
      alerts.push({
        id: Math.random().toString(36).substr(2, 9),
        type: 'warning',
        message: `温度过高: ${currentData.temperature.toFixed(1)}°C`,
        timestamp: new Date(),
        deviceId: '1',
        resolved: false,
      });
    }

    if (currentData.pm25 > 100) {
      alerts.push({
        id: Math.random().toString(36).substr(2, 9),
        type: 'error',
        message: `PM2.5超标: ${currentData.pm25} μg/m³`,
        timestamp: new Date(),
        deviceId: '1',
        resolved: false,
      });
    }

    if (currentData.airQuality > 150) {
      alerts.push({
        id: Math.random().toString(36).substr(2, 9),
        type: 'warning',
        message: `空气质量较差: AQI ${currentData.airQuality}`,
        timestamp: new Date(),
        deviceId: '1',
        resolved: false,
      });
    }

    return alerts;
  }

  // 开始实时数据更新
  startRealTimeUpdates(callback: (data: EnvironmentData) => void, deviceId?: string, interval: number = 5000) {
    if (this.intervalId !== null) {
      this.stopRealTimeUpdates();
    }

    this.intervalId = window.setInterval(() => {
      let data: EnvironmentData;
      if (deviceId === 'all') {
        data = this.getAllDevicesData();
      } else {
        data = this.getCurrentData(deviceId);
      }
      callback(data);
    }, interval);
  }

  // 停止实时数据更新
  stopRealTimeUpdates() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const dataService = new DataService();

