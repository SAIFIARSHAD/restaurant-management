import { useState } from 'react';
import { BarChart2, Clock, PieChart, Table2, LayoutDashboard } from 'lucide-react';
import { subDays, format } from 'date-fns';
import {
  useDashboardStats, useHourlySales,
  useWeeklyRevenue, useCategorySales, useTableTurnover,
} from '../../hooks/useAnalytics';
import { StatsCards }         from '../../components/analytics/StatsCards';
import { WeeklyRevenueChart } from '../../components/analytics/WeeklyRevenueChart';
import { HourlySalesChart }   from '../../components/analytics/HourlySalesChart';
import { CategorySalesChart } from '../../components/analytics/CategorySalesChart';
import { TableTurnoverTable } from '../../components/analytics/TableTurnoverTable';
import { DateRangeFilter }    from '../../components/analytics/DateRangeFilter';
import type { DateParams }    from '../../components/analytics/DateRangeFilter';

const fmt     = (d: Date) => format(d, 'yyyy-MM-dd');
const display = (s: string) =>
  new Date(s + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });

export const AnalyticsPage = () => {
  const today = new Date();

  const [startDate,    setStartDate]    = useState(fmt(subDays(today, 6)));
  const [endDate,      setEndDate]      = useState(fmt(today));
  const [activePreset, setActivePreset] = useState('Last 7 Days');
  const [params,       setParams]       = useState<DateParams>({
    startDate: fmt(subDays(today, 6)),
    endDate:   fmt(today),
  });

  const handlePreset = (label: string, start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    setActivePreset(label);
    setParams({ startDate: start, endDate: end });
  };

  const handleApply = () => {
    setActivePreset('Custom');
    setParams({ startDate, endDate });
  };

  
  const revenueLabel = activePreset === 'Custom'
    ? `Revenue: ${display(startDate)} → ${display(endDate)}`
    : activePreset === 'Today'        ? 'Revenue — Today'
    : activePreset === 'Yesterday'    ? 'Revenue — Yesterday'
    : activePreset === 'Last 7 Days'  ? 'Last 7 Days Revenue'
    : activePreset === 'Last 30 Days' ? 'Last 30 Days Revenue'
    : activePreset === 'This Month'   ? 'Revenue — This Month'
    : activePreset === 'Last 3 Mo'    ? 'Revenue — Last 3 Months'
    : 'Revenue';

  const hourlyLabel = activePreset === 'Custom'
    ? `Hourly Orders: ${display(startDate)} → ${display(endDate)}`
    : activePreset === 'Today'        ? 'Hourly Orders — Today'
    : activePreset === 'Yesterday'    ? 'Hourly Orders — Yesterday'
    : activePreset === 'Last 7 Days'  ? 'Hourly Orders — Last 7 Days'
    : activePreset === 'Last 30 Days' ? 'Hourly Orders — Last 30 Days'
    : activePreset === 'This Month'   ? 'Hourly Orders — This Month'
    : activePreset === 'Last 3 Mo'    ? 'Hourly Orders — Last 3 Months'
    : 'Hourly Orders';

  const { data: stats,    isLoading: statsLoading }    = useDashboardStats(params);
  const { data: hourly,   isLoading: hourlyLoading }   = useHourlySales(params);
  const { data: weekly,   isLoading: weeklyLoading }   = useWeeklyRevenue(params);
  const { data: category, isLoading: categoryLoading } = useCategorySales(params);
  const { data: tables,   isLoading: tablesLoading }   = useTableTurnover(params);

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
          <LayoutDashboard className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Analytics</h1>
          <p className="text-xs text-gray-500">Restaurant performance overview</p>
        </div>
      </div>

      
      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        activePreset={activePreset}
        onPreset={handlePreset}
        onStartChange={setStartDate}
        onEndChange={setEndDate}
        onApply={handleApply}
      />

        {statsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="h-24 bg-gray-800/60 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : stats ? <StatsCards stats={stats} /> : null}

      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-gray-900/60 rounded-2xl border border-gray-700/60 p-5">
          <div className="flex items-center gap-2 mb-5">
            <BarChart2 className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-gray-200">{revenueLabel}</h3>
          </div>
          {weeklyLoading ? <ChartSkeleton /> : weekly && <WeeklyRevenueChart data={weekly} />}
        </div>

        <div className="bg-gray-900/60 rounded-2xl border border-gray-700/60 p-5">
          <div className="flex items-center gap-2 mb-5">
            <Clock className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-gray-200">{hourlyLabel}</h3>
          </div>
          {hourlyLoading ? <ChartSkeleton /> : hourly && <HourlySalesChart data={hourly} />}
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-gray-900/60 rounded-2xl border border-gray-700/60 p-5">
          <div className="flex items-center gap-2 mb-5">
            <PieChart className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-gray-200">Category-wise Sales</h3>
          </div>
          {categoryLoading ? <ChartSkeleton /> : category && <CategorySalesChart data={category} />}
        </div>

        <div className="bg-gray-900/60 rounded-2xl border border-gray-700/60 p-5">
          <div className="flex items-center gap-2 mb-5">
            <Table2 className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-gray-200">Table Turnover</h3>
          </div>
          {tablesLoading ? <ChartSkeleton /> : tables && <TableTurnoverTable data={tables} />}
        </div>
      </div>

    </div>
  );
};

const ChartSkeleton = () => (
  <div className="h-56 bg-gray-800/60 rounded-xl animate-pulse" />
);

export default AnalyticsPage;