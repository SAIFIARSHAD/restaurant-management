import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

interface Props {
  data: { category: string; totalQuantity: number; totalRevenue: number }[];
}

const CustomTooltip = ({ active, payload }: {
  active?:  boolean;
  payload?: { name?: string; value?: number | string }[];
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 shadow text-sm">
      <p className="text-gray-300 font-medium mb-1">{payload[0]?.name}</p>
      <p className="font-semibold text-indigo-400">
        ₹{Number(payload[0]?.value ?? 0).toLocaleString('en-IN')}
      </p>
    </div>
  );
};


export const CategorySalesChart = ({ data }: Props) => {
  const pieData = data.map((d) => ({ name: d.category, value: d.totalRevenue }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={105}
          dataKey="value"
          label={({ name, percent }) =>
            `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
          }
          labelLine={{ stroke: '#6b7280' }}
        >
          {pieData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
};