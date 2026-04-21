export interface EnvironmentData {
  id: string;
  timestamp: Date;
  temperature: number; // 温度 (°C)
  humidity: number; // 湿度 (%)
  airQuality: number; // 空气质量指数 (AQI)
  pm25: number; // PM2.5 (μg/m³)
  pm10: number; // PM10 (μg/m³)
  noise: number; // 噪音 (dB)
  co2: number; // 二氧化碳 (ppm)
  location: string;
}

export interface Device {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'warning';
  lastUpdate: Date;
  type: string;
  coordinates?: [number, number]; // [纬度, 经度]
}

export interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: Date;
  deviceId: string;
  resolved: boolean;
}

export type LogLevel = 'info' | 'warn' | 'error';

export interface DeviceRuntimeLog {
  id: string;
  timestamp: Date;
  level: LogLevel;
  module: string;
  deviceId: string;
  message: string;
  requestId?: string;
}

export type PlatformAction = 'cfg_set' | 'cfg_save' | 'command' | 'ota' | 'login' | 'other';

export interface PlatformAuditLog {
  id: string;
  timestamp: Date;
  level: LogLevel;
  action: PlatformAction;
  actor: string; // 用户/系统
  deviceId?: string;
  message: string;
  requestId?: string;
}

export type TimeRange = '1h' | '6h' | '24h' | '7d' | '30d';

