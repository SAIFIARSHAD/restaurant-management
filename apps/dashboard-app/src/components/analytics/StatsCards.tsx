import { TrendingUp, ShoppingBag, XCircle, Receipt, CreditCard } from 'lucide-react';

interface Stats {
  totalRevenue:    number;
  totalOrders:     number;
  cancelledOrders: number;
  avgOrderValue:   number;
  totalBills:      number;
}

export const StatsCards = ({ stats }: { stats: Stats }) => {
  const cards = [
    {
      label: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`,
      icon:  <TrendingUp className="w-6 h-6" />,
      color: 'bg-green-50 text-green-600 border-green-200',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon:  <ShoppingBag className="w-6 h-6" />,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      label: 'Cancelled Orders',
      value: stats.cancelledOrders,
      icon:  <XCircle className="w-6 h-6" />,
      color: 'bg-red-50 text-red-600 border-red-200',
    },
    {
      label: 'Avg Order Value',
      value: `₹${stats.avgOrderValue}`,
      icon:  <CreditCard className="w-6 h-6" />,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
    },
    {
      label: 'Total Bills',
      value: stats.totalBills,
      icon:  <Receipt className="w-6 h-6" />,
      color: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div key={card.label} className={`rounded-xl border p-4 ${card.color}`}>
          <div className="flex items-center justify-between mb-2">
            {card.icon}
          </div>
          <p className="text-2xl font-bold">{card.value}</p>
          <p className="text-sm mt-1 opacity-75">{card.label}</p>
        </div>
      ))}
    </div>
  );
};