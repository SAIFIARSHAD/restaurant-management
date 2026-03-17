import { IndianRupee, ShoppingBag, TableIcon, UtensilsCrossed, Users } from 'lucide-react';
import StatsCard from '../../components/dashboard/StatsCard';
import RevenueChart from '../../components/dashboard/RevenueChart';
import OrdersChart from '../../components/dashboard/OrdersChart';
import { useDashboardStats } from '../../hooks/useDashboardStats';

export default function DashboardHome() {
  const { data: stats, isLoading, isError } = useDashboardStats();

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-zinc-400 animate-pulse">Loading dashboard...</p>
    </div>
  );

  if (isError) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-red-400">Failed to load stats. Check API connection.</p>
    </div>
  );

  const statsCards = [
    { title: 'Total Revenue', value: `₹${stats?.totalRevenue?.toLocaleString('en-IN') ?? 0}`, icon: IndianRupee, color: 'bg-orange-500' },
    { title: 'Total Orders', value: stats?.totalOrders ?? 0, icon: ShoppingBag, color: 'bg-blue-500' },
    { title: 'Active Tables', value: stats?.activeTables ?? 0, icon: TableIcon, color: 'bg-green-500' },
    { title: 'Menu Items', value: stats?.totalMenuItems ?? 0, icon: UtensilsCrossed, color: 'bg-purple-500' },
    { title: 'Employees', value: stats?.totalEmployees ?? 0, icon: Users, color: 'bg-pink-500' },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statsCards.map((card) => (
          <StatsCard key={card.title} {...card} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RevenueChart data={stats?.revenueChart ?? []} />
        <OrdersChart data={stats?.ordersChart ?? []} />
      </div>
    </div>
  );
}
