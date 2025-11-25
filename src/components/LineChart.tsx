import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import zhCN from 'date-fns/locale/zh-CN';

interface DataPoint {
  timestamp: Date | string;
  [key: string]: any;
}

interface LineChartProps {
  data: DataPoint[];
  dataKey: string;
  name: string;
  color?: string;
  unit?: string;
}

export default function LineChart({
  data,
  dataKey,
  name,
  color = '#0ea5e9',
  unit = '',
}: LineChartProps) {
  const formattedData = data.map((item) => ({
    ...item,
    time: format(new Date(item.timestamp), 'HH:mm', { locale: zhCN }),
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="time"
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
          label={{ value: unit, angle: -90, position: 'insideLeft' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          }}
          formatter={(value: number) => [`${value} ${unit}`, name]}
          labelFormatter={(label) => `时间: ${label}`}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey={dataKey}
          name={name}
          stroke={color}
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}

