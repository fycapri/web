import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  status?: 'good' | 'warning' | 'danger';
  className?: string;
}

export default function MetricCard({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  trendValue,
  status = 'good',
  className = '',
}: MetricCardProps) {
  const statusColors = {
    good: 'bg-green-50 border-green-200 text-green-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    danger: 'bg-red-50 border-red-200 text-red-700',
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    stable: '→',
  };

  return (
    <div
      className={`rounded-lg border-2 p-6 transition-all hover:shadow-lg ${statusColors[status]} ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium opacity-80">{title}</h3>
        <Icon className="w-5 h-5 opacity-60" />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold">{value}</span>
        {unit && <span className="text-lg opacity-70">{unit}</span>}
      </div>
      {trend && trendValue && (
        <div className="mt-2 text-sm opacity-70">
          <span>{trendIcons[trend]}</span>
          <span className="ml-1">{trendValue}</span>
        </div>
      )}
    </div>
  );
}

