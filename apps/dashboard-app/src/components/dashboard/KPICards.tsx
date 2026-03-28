import { TrendingUp, CreditCard, Grid3x3, BookOpen, Users, Store } from 'lucide-react';
import type { DashboardData } from '../../hooks/useDashboard';

interface Props {
  kpi:        DashboardData['kpi'];
  menuCount:  number;
  empCount:   number;
  vendorCount?: number;
}

export const KPICards = ({ kpi, menuCount, empCount, vendorCount = 0 }: Props) => {
  const cards = [
    {
      label:         'Today Revenue',
      value:         `₹${kpi.todayRevenue.toLocaleString('en-IN')}`,
      sub:           `Target: ₹${kpi.dailyTarget.toLocaleString('en-IN')}`,
      icon:          TrendingUp,
      gradient:      'from-emerald-500/20 to-emerald-500/5',
      border:        'border-emerald-500/30',
      iconColor:     'text-emerald-400',
      valueColor:    'text-emerald-300',
      progress:       kpi.revenueProgress,
      progressColor: 'bg-emerald-400',
    },
    {
      label:      'Avg Order',
      value:      `₹${kpi.avgOrderValue}`,
      sub:        'Per bill today',
      icon:       CreditCard,
      gradient:   'from-purple-500/20 to-purple-500/5',
      border:     'border-purple-500/30',
      iconColor:  'text-purple-400',
      valueColor: 'text-purple-300',
    },
    {
      label:      'Tables',
      value:      `${kpi.tableStats.occupied}/${kpi.tableStats.total}`,
      sub:        `${kpi.tableStats.available} available`,
      icon:       Grid3x3,
      gradient:   'from-orange-500/20 to-orange-500/5',
      border:     'border-orange-500/30',
      iconColor:  'text-orange-400',
      valueColor: 'text-orange-300',
    },
    {
      label:      'Menu Items',  
      value:      menuCount,
      sub:        'Active dishes',
      icon:       BookOpen,
      gradient:   'from-blue-500/20 to-blue-500/5',
      border:     'border-blue-500/30',
      iconColor:  'text-blue-400',
      valueColor: 'text-blue-300',
    },
    {
      label:      'Employees',   
      value:      empCount,
      sub:        'Total staff',
      icon:       Users,
      gradient:   'from-pink-500/20 to-pink-500/5',
      border:     'border-pink-500/30',
      iconColor:  'text-pink-400',
      valueColor: 'text-pink-300',
    },
    {
      label:      'Vendors',      
      value:      vendorCount,
      sub:        'Active vendors',
      icon:       Store,
      gradient:   'from-amber-500/20 to-amber-500/5',
      border:     'border-amber-500/30',
      iconColor:  'text-amber-400',
      valueColor: 'text-amber-300',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`relative rounded-2xl border bg-gradient-to-br ${card.gradient}
                      ${card.border} p-4 overflow-hidden
                      hover:scale-[1.02] transition-transform duration-200`}
        >
          <card.icon className={`w-5 h-5 mb-3 ${card.iconColor}`} />
          <p className={`text-2xl font-black ${card.valueColor}`}>{card.value}</p>
          <p className="text-xs text-gray-400 mt-0.5">{card.label}</p>
          <p className="text-[10px] text-gray-600 mt-0.5">{card.sub}</p>

          {card.progress !== undefined && (
            <div className="mt-3">
              <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${card.progressColor} transition-all duration-1000`}
                  style={{ width: `${card.progress}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-600 mt-1">{card.progress}% of target</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};