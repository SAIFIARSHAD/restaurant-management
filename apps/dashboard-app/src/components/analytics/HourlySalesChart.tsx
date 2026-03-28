import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

interface Props {
  data: { hour: number; totalOrders: number; totalRevenue: number }[];
}

const CustomTooltip = ({ active, payload, label }: {
  active?:  boolean;
  payload?: { value?: number | string }[];
  label?:   string | number;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 shadow text-sm">
      <p className="text-gray-400 mb-1">{label}:00 — {Number(label) + 1}:00</p>
      <p className="font-semibold text-amber-400">
        {Number(payload[0]?.value ?? 0)} Orders
      </p>
    </div>
  );
};

export const HourlySalesChart = ({ data }: Props) => (
  <ResponsiveContainer width="100%" height={250}>
    <BarChart data={data} barSize={14}>
      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
      <XAxis
        dataKey="hour"
        tickFormatter={(h) => `${h}:00`}
        tick={{ fontSize: 10, fill: '#9ca3af' }}
        interval={2}
      />
      <YAxis
  tick={{ fontSize: 11, fill: '#9ca3af' }}
  allowDecimals={false}                           
  domain={[0, 'auto']}                            
  tickFormatter={(v) => (v === 0 ? '0' : v)}      
/>
      <Tooltip content={<CustomTooltip />} />
      <Bar dataKey="totalOrders" fill="#f59e0b" radius={[3, 3, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);