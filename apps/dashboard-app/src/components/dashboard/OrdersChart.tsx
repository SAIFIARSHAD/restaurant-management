import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';

interface Props {
  data: { month: string; orders: number }[];
}

export default function OrdersChart({ data }: Props) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <h3 className="text-white font-semibold mb-4">Monthly Orders Trend</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="month" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
          <YAxis tick={{ fill: '#a1a1aa', fontSize: 12 }} />
          <Tooltip
            contentStyle={{ 
              backgroundColor: '#18181b', 
              border: '1px solid #3f3f46', 
              color: '#fff' 
            }}
            formatter={(value) => [Number(value) || 0, 'Orders'] as const}  
          />
          <Line
            type="monotone"
            dataKey="orders"
            stroke="#f97316"
            strokeWidth={2}
            dot={{ fill: '#f97316', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
