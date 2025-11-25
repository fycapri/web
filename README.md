# 环境监测平台

一个功能齐全、界面美观的现代化环境监测平台，用于实时监测和管理环境数据。

## 功能特性

### 📊 核心功能
- **实时监测仪表盘** - 实时显示温度、湿度、空气质量、PM2.5、PM10、噪音、CO2等环境指标
- **数据可视化** - 多维度图表展示历史数据趋势
- **设备管理** - 监测设备状态管理，支持在线/离线/警告状态
- **告警中心** - 智能告警系统，支持多级别告警（警告/错误/信息）
- **系统设置** - 个性化配置，包括通知、数据刷新、主题等设置

### 🎨 界面特性
- 现代化、美观的UI设计
- 响应式布局，支持移动端和桌面端
- 直观的数据卡片和图表展示
- 流畅的交互动画和过渡效果

### 🛠 技术栈
- **React 18** - 现代化的前端框架
- **TypeScript** - 类型安全的开发体验
- **Vite** - 快速的构建工具
- **Tailwind CSS** - 实用优先的CSS框架
- **Recharts** - 强大的图表库
- **React Router** - 单页应用路由
- **Lucide React** - 精美的图标库

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

构建完成后会在 `dist/` 目录生成静态文件，可部署到 Web 服务器或静态托管平台（Netlify、Vercel 等）。

### 在线演示

- Netlify（推荐，国内访问较稳定）：https://snazzy-liger-435f52.netlify.app/
- Vercel（海外节点，部分网络可能访问受限）：https://web-hgbr.vercel.app/

## 项目结构

```
web/
├── src/
│   ├── components/          # 可复用组件
│   │   ├── Layout.tsx       # 布局组件
│   │   ├── MetricCard.tsx   # 指标卡片
│   │   ├── LineChart.tsx    # 折线图组件
│   │   ├── DeviceCard.tsx   # 设备卡片
│   │   └── AlertCard.tsx    # 告警卡片
│   ├── pages/               # 页面组件
│   │   ├── Dashboard.tsx    # 仪表盘
│   │   ├── Devices.tsx      # 设备管理
│   │   ├── Alerts.tsx       # 告警中心
│   │   └── Settings.tsx     # 系统设置
│   ├── services/            # 服务层
│   │   └── dataService.ts   # 数据服务（模拟数据）
│   ├── types/              # TypeScript类型定义
│   │   └── index.ts
│   ├── App.tsx             # 应用入口
│   ├── main.tsx            # 主入口文件
│   └── index.css           # 全局样式
├── public/                 # 静态资源
├── index.html              # HTML模板
├── package.json            # 项目配置
├── tsconfig.json           # TypeScript配置
├── vite.config.ts          # Vite配置
├── tailwind.config.js      # Tailwind配置
└── README.md               # 项目文档
```

## 功能说明

### 仪表盘
- 实时显示7个核心环境指标
- 支持1小时、6小时、24小时、7天、30天的历史数据查看
- 多维度趋势图表展示
- 智能状态指示（良好/警告/危险）

### 设备管理
- 设备列表展示
- 设备状态实时监控
- 设备搜索功能
- 设备统计信息

### 告警中心
- 多级别告警（警告/错误/信息）
- 告警筛选功能
- 告警处理（标记为已解决）
- 告警统计

### 系统设置
- 通知设置
- 数据刷新配置
- 主题设置
- 语言设置

## 数据说明

当前版本使用模拟数据服务。在实际部署时，需要：

1. 替换 `src/services/dataService.ts` 中的模拟数据
2. 连接真实的后端API
3. 配置WebSocket连接以支持实时数据推送

## 扩展开发

### 添加新的监测指标

1. 在 `src/types/index.ts` 中扩展 `EnvironmentData` 接口
2. 在 `src/services/dataService.ts` 中添加数据生成逻辑
3. 在 `src/pages/Dashboard.tsx` 中添加新的 `MetricCard` 和图表

### 连接真实API

修改 `src/services/dataService.ts`，将模拟数据替换为API调用：

```typescript
async getCurrentData(location?: string): Promise<EnvironmentData> {
  const response = await fetch('/api/environment/current');
  return response.json();
}
```

### 添加WebSocket支持

```typescript
const ws = new WebSocket('ws://your-api/ws');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // 更新状态
};
```

## 浏览器支持

- Chrome (最新)
- Firefox (最新)
- Safari (最新)
- Edge (最新)

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！


