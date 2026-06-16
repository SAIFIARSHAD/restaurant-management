import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface TooltipProps {
  active?:  boolean;
  payload?: { value?: number | string; dataKey?: string }[];
  label?:   string | number;
}

interface Props {
  data:     { hour: number; revenue: number; orders: number }[];
  peakHour: number;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400 mb-1">{label}:00 — {Number(label) + 1}:00</p>
      <p className="text-emerald-400 font-bold">₹{Number(payload[0]?.value ?? 0).toLocaleString('en-IN')}</p>
      <p className="text-blue-400">{payload[1]?.value ?? 0} orders</p>
    </div>
  );
};

export const TodayRevenueChart = ({ data, peakHour }: Props) => (
  <ResponsiveContainer width="100%" height={220}>
    <BarChart data={data} barSize={10} barGap={2}>
      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
      <XAxis dataKey="hour" tickFormatter={(h: number) => `${h}`}
        tick={{ fontSize: 10, fill: '#6b7280' }} interval={2} />
      <YAxis tick={{ fontSize: 10, fill: '#6b7280' }}
        tickFormatter={(v: number) => `₹${v}`}
        allowDecimals={false} domain={[0, 'auto']} />
      <Tooltip content={<CustomTooltip />} />
      <Bar dataKey="revenue" radius={[3, 3, 0, 0]}>
        {data.map((entry) => (
          <Cell
            key={entry.hour}
            fill={entry.hour === peakHour && entry.revenue > 0 ? '#f59e0b' : '#10b981'}
            opacity={entry.revenue === 0 ? 0.2 : 1}
          />
        ))}
      </Bar>
      <Bar dataKey="orders" fill="#6366f1" radius={[3, 3, 0, 0]} opacity={0.7} />
    </BarChart>
  </ResponsiveContainer>
);