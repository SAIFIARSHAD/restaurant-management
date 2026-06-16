import { useQueryClient } from '@tanstack/react-query';
import { useEffect }      from 'react';
import {
  LayoutDashboard, ShoppingBag, Grid3x3,
  Trophy, AlertTriangle, BarChart2, Users,
  Activity, Zap,
} from 'lucide-react';
import { useDashboard }          from '../../hooks/useDashboard';
import { useSocket }             from '../../hooks/useSocket';
import { KPICards }              from '../../components/dashboard/KPICards';
import { QuickActions }          from '../../components/dashboard/QuickActions';
import { LiveOrdersFeed }        from '../../components/dashboard/LiveOrdersFeed';
import { TableStatusGrid }       from '../../components/dashboard/TableStatusGrid';
import { TopItemsList }          from '../../components/dashboard/TopItemsList';
import { InventoryAlerts }       from '../../components/dashboard/InventoryAlerts';
import { TodayRevenueChart }     from '../../components/dashboard/TodayRevenueChart';
import { OrderStatusBreakdown }  from '../../components/dashboard/OrderStatusBreakdown';
import { StaffOnDuty }           from '../../components/dashboard/StaffOnDuty';
import { RecentActivity }        from '../../components/dashboard/RecentActivity';
import { type LucideIcon } from 'lucide-react';
import { LiveOrdersPanel } from '../../components/dashboard/LiveOrdersPanel';

const Card = ({ title, icon: Icon, iconColor, badge, children }: {
  title: string; icon: LucideIcon; iconColor: string;
  badge?: React.ReactNode; children: React.ReactNode;
}) => (
  <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-5
                  hover:border-gray-600/60 transition-colors duration-300">
    <div className="flex items-center gap-2 mb-4">
      <Icon className={`w-4 h-4 ${iconColor}`} />
      <h3 className="text-sm font-semibold text-gray-200">{title}</h3>
      {badge && <div className="ml-auto">{badge}</div>}
    </div>
    {children}
  </div>
);

const Skeleton = () => (
  <div className="p-6 space-y-6">
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {Array(5).fill(0).map((_, i) => (
        <div key={i} className="h-28 bg-gray-800/60 rounded-2xl animate-pulse" />
      ))}
    </div>
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
      {Array(6).fill(0).map((_, i) => (
        <div key={i} className="h-20 bg-gray-800/60 rounded-2xl animate-pulse" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {Array(6).fill(0).map((_, i) => (
        <div key={i} className="h-64 bg-gray-800/60 rounded-2xl animate-pulse" />
      ))}
    </div>
  </div>
);

export const DashboardPage = () => {
  const { data, isLoading } = useDashboard();
  const queryClient = useQueryClient();
  const { on, off } = useSocket();


  useEffect(() => {
    const refresh = () => queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    on('new_order',   refresh);
    on('order_billed', refresh);
    on('bill_created', refresh);
    return () => {
      off('new_order',   refresh);
      off('order_billed', refresh);
      off('bill_created', refresh);
    };
  }, [on, off, queryClient]);

  if (isLoading) return <Skeleton />;
  if (!data)     return null;

  const totalTodayOrders = Object.values(data.orderStatus).reduce((a, b) => a + b, 0);

  return (
    <div className="p-6 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-500/10 rounded-xl border border-orange-500/20">
            <LayoutDashboard className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Dashboard</h1>
            <p className="text-xs text-gray-500">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20
                        rounded-xl px-3 py-1.5">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs font-semibold text-emerald-400">Live</span>
        </div>
      </div>

      
      <KPICards
  kpi={data.kpi}
  menuCount={data.kpi.menuCount}
  empCount={data.kpi.empCount}
  vendorCount={data.kpi.vendorCount}
/>

      
      <Card title="Quick Actions" icon={Zap} iconColor="text-yellow-400">
        <QuickActions />
      </Card>
<LiveOrdersPanel />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card
          title="Live Orders"
          icon={ShoppingBag}
          iconColor="text-orange-400"
          badge={
            data.activeOrders.length > 0 ? (
              <span className="text-[10px] font-bold px-2 py-0.5
                               bg-orange-500/20 text-orange-400 rounded-full animate-pulse">
                {data.activeOrders.length} Active
              </span>
            ) : null
          }
        >
          <LiveOrdersFeed orders={data.activeOrders} />
          
        </Card>

        <Card
          title="Today Revenue"
          icon={BarChart2}
          iconColor="text-emerald-400"
          badge={
            data.peakHour.revenue > 0 ? (
              <span className="text-[10px] text-amber-400 font-semibold">
                ⚡ Peak: {data.peakHour.hour}:00–{data.peakHour.hour + 1}:00
              </span>
            ) : null
          }
        >
          <TodayRevenueChart data={data.hourlyRevenue} peakHour={data.peakHour.hour} />
        </Card>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card title="Order Breakdown" icon={Activity} iconColor="text-blue-400"
          badge={<span className="text-xs text-gray-500">{totalTodayOrders} today</span>}>
          <OrderStatusBreakdown orderStatus={data.orderStatus} total={totalTodayOrders} />
        </Card>

        <Card
          title="Table Status"
          icon={Grid3x3}
          iconColor="text-blue-400"
          badge={
            <div className="flex gap-2 text-[10px]">
              <span className="text-emerald-400 font-bold">{data.kpi.tableStats.available} Free</span>
              <span className="text-gray-600">|</span>
              <span className="text-red-400 font-bold">{data.kpi.tableStats.occupied} Busy</span>
            </div>
          }
        >
          <TableStatusGrid tables={data.tables} />
        </Card>
      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card title="Top Selling Today" icon={Trophy} iconColor="text-yellow-400">
          <TopItemsList items={data.topItems} />
        </Card>

        <Card
          title="Staff On Duty"
          icon={Users}
          iconColor="text-purple-400"
          badge={
            <span className="text-xs font-bold text-emerald-400">
              {data.staff.totalPresent} Present
            </span>
          }
        >
          <StaffOnDuty staff={data.staff} />
        </Card>
      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card title="Recent Activity" icon={Activity} iconColor="text-emerald-400">
          <RecentActivity activity={data.recentActivity} />
        </Card>

        <Card
          title="Inventory Alerts"
          icon={AlertTriangle}
          iconColor="text-amber-400"
          badge={
            data.lowStockItems.length > 0 ? (
              <span className="text-[10px] font-bold px-2 py-0.5
                               bg-red-500/20 text-red-400 rounded-full">
                {data.lowStockItems.length} Low Stock
              </span>
            ) : null
          }
        >
          <InventoryAlerts alerts={data.lowStockItems} />
        </Card>
      </div>

    </div>
  );
};

export default DashboardPage;