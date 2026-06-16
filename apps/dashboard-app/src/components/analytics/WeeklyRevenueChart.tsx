import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

interface Props {
  data: { date: string; totalRevenue: number; totalOrders: number }[];
}

const CustomTooltip = ({ active, payload, label }: {
  active?:  boolean;
  payload?: { value?: number | string }[];
  label?:   string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 shadow text-sm">
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="font-semibold text-indigo-400">
        ₹{Number(payload[0]?.value ?? 0).toLocaleString('en-IN')}
      </p>
    </div>
  );
};


export const WeeklyRevenueChart = ({ data }: Props) => {
  const formatted = data.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric',
    }),
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={formatted}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={(v) => `₹${v}`} />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="totalRevenue"
          stroke="#6366f1"
          strokeWidth={2}
          fill="url(#revenueGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};