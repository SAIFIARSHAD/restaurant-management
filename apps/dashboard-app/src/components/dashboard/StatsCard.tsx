import { type LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;       
  change?: string;     
}

export default function StatsCard({ title, value, icon: Icon, color, change }: StatsCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center gap-4">
      <div className={`${color} p-3 rounded-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-zinc-400 text-sm">{title}</p>
        <p className="text-white text-2xl font-bold">{value}</p>
        {change && <p className="text-green-400 text-xs mt-1">{change}</p>}
      </div>
    </div>
  );
}
